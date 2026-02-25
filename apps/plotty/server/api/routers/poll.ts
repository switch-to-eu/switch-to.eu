import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomBytes, timingSafeEqual, createHash } from "crypto";
import type { RedisClientType } from "redis";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getRedisSubscriber } from "@/server/db/redis";
import type {
  RedisPollHash,
  RedisVoteHash,
  PollResponse,
  VoteResponse,
  PollWithVotesResponse,
} from "@/server/db/types";

// --- Utility functions ---

function generatePollId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(10);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

function generateAdminToken(): string {
  return randomBytes(48).toString("base64url");
}

/** Hash an admin token for storage (never store plain text) */
function hashAdminToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time comparison of admin tokens */
function verifyAdminToken(inputToken: string, storedHash: string): boolean {
  const inputHash = hashAdminToken(inputToken);
  if (inputHash.length !== storedHash.length) return false;
  return timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
}

/** Calculate TTL in seconds from expiresAt + 7-day grace period */
function calculateTTLSeconds(expiresAt: string): number {
  const gracePeriodMs = 7 * 24 * 60 * 60 * 1000;
  const expiryMs = new Date(expiresAt).getTime() + gracePeriodMs;
  return Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
}

/** Fetch and validate a poll is not deleted/expired */
async function getValidPoll(
  redis: RedisClientType,
  id: string
): Promise<RedisPollHash> {
  const poll = (await redis.hGetAll(`poll:${id}`)) as unknown as RedisPollHash;

  if (!poll || !poll.encryptedData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Poll not found" });
  }

  if (poll.isDeleted === "true") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Poll not found" });
  }

  if (new Date(poll.expiresAt) < new Date()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Poll has expired" });
  }

  return poll;
}

/** Fetch all vote entries for a poll */
async function getPollVotes(
  redis: RedisClientType,
  pollId: string
): Promise<VoteResponse[]> {
  const participantIds = await redis.sMembers(`poll:${pollId}:votes`);
  if (!participantIds.length) return [];

  const votes: VoteResponse[] = [];
  for (const pid of participantIds) {
    const vote = (await redis.hGetAll(
      `poll:${pollId}:vote:${pid}`
    )) as unknown as RedisVoteHash;
    if (vote && vote.encryptedVote) {
      votes.push({
        participantId: pid,
        encryptedVote: vote.encryptedVote,
        version: parseInt(vote.version, 10) || 1,
        updatedAt: vote.updatedAt,
      });
    }
  }
  return votes;
}

/** Publish an update notification to the poll's Pub/Sub channel */
async function publishPollUpdate(
  redis: RedisClientType,
  pollId: string
): Promise<void> {
  await redis.publish(`poll:channel:${pollId}`, "updated");
}

// --- Constants ---

const MAX_ENCRYPTED_DATA_SIZE = 65_536; // 64 KB
const MAX_ENCRYPTED_VOTE_SIZE = 16_384; // 16 KB
const MAX_PARTICIPANTS_PER_POLL = 500;

// --- Input validation schemas ---

const pollIdSchema = z
  .string()
  .length(10, "Poll ID must be 10 characters")
  .regex(/^[A-Za-z0-9]+$/, "Invalid poll ID format");

const createPollInput = z.object({
  encryptedData: z.string().min(1, "Encrypted data is required").max(MAX_ENCRYPTED_DATA_SIZE),
  expiresAt: z.date().optional(),
});

const getPollInput = z.object({
  id: pollIdSchema,
});

const updatePollInput = z.object({
  id: pollIdSchema,
  adminToken: z.string().min(1, "Admin token is required"),
  encryptedData: z.string().min(1, "Encrypted data is required").max(MAX_ENCRYPTED_DATA_SIZE),
  expectedVersion: z.number().int().optional(),
});

const deletePollInput = z.object({
  id: pollIdSchema,
  adminToken: z.string().min(1, "Admin token is required"),
});

const extendPollInput = z.object({
  id: pollIdSchema,
  adminToken: z.string().min(1, "Admin token is required"),
  days: z.number().min(1).max(365, "Cannot extend more than 365 days"),
});

const voteInput = z.object({
  id: pollIdSchema,
  participantId: z
    .string()
    .min(1, "Participant ID is required")
    .max(128)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid participant ID format"),
  encryptedVote: z.string().min(1, "Encrypted vote is required").max(MAX_ENCRYPTED_VOTE_SIZE),
  expectedVersion: z.number().int().optional(),
});

// --- Router ---

export const pollRouter = createTRPCRouter({
  create: publicProcedure
    .input(createPollInput)
    .mutation(async ({ ctx, input }) => {
      const pollId = generatePollId();
      const adminToken = generateAdminToken();
      const now = new Date().toISOString();
      const expiresAt = (
        input.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).toISOString();

      try {
        await ctx.redis.hSet(`poll:${pollId}`, {
          encryptedData: input.encryptedData,
          adminToken: hashAdminToken(adminToken),
          createdAt: now,
          expiresAt,
          version: "1",
          isDeleted: "false",
        } satisfies RedisPollHash);
        await ctx.redis.expireAt(
          `poll:${pollId}`,
          Math.floor(
            (new Date(expiresAt).getTime() + 7 * 24 * 60 * 60 * 1000) / 1000
          )
        );

        return {
          poll: {
            id: pollId,
            encryptedData: input.encryptedData,
            createdAt: now,
            expiresAt,
            version: 1,
          } satisfies PollResponse,
          adminToken,
        };
      } catch (error) {
        console.error("Failed to create poll:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create poll",
        });
      }
    }),

  get: publicProcedure.input(getPollInput).query(async ({ ctx, input }) => {
    const poll = await getValidPoll(ctx.redis, input.id);
    const votes = await getPollVotes(ctx.redis, input.id);

    return {
      poll: {
        id: input.id,
        encryptedData: poll.encryptedData,
        createdAt: poll.createdAt,
        expiresAt: poll.expiresAt,
        version: parseInt(poll.version, 10) || 1,
      } satisfies PollResponse,
      votes,
    } satisfies PollWithVotesResponse;
  }),

  update: publicProcedure
    .input(updatePollInput)
    .mutation(async ({ ctx, input }) => {
      const poll = await getValidPoll(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, poll.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Poll not found or invalid admin token",
        });
      }

      // Optimistic concurrency check
      const currentVersion = parseInt(poll.version, 10) || 1;
      if (
        input.expectedVersion !== undefined &&
        input.expectedVersion !== currentVersion
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Poll has been modified by someone else. Please refresh and try again.",
        });
      }

      const newVersion = currentVersion + 1;

      await ctx.redis.hSet(`poll:${input.id}`, {
        encryptedData: input.encryptedData,
        version: String(newVersion),
      });

      await publishPollUpdate(ctx.redis, input.id);

      return {
        id: input.id,
        encryptedData: input.encryptedData,
        createdAt: poll.createdAt,
        expiresAt: poll.expiresAt,
        version: newVersion,
      } satisfies PollResponse;
    }),

  vote: publicProcedure.input(voteInput).mutation(async ({ ctx, input }) => {
    const poll = await getValidPoll(ctx.redis, input.id);

    const voteKey = `poll:${input.id}:vote:${input.participantId}`;
    const existingVote = (await ctx.redis.hGetAll(
      voteKey
    )) as unknown as RedisVoteHash;

    // Check participant cap for new voters
    if (!existingVote?.encryptedVote) {
      const participantCount = await ctx.redis.sCard(`poll:${input.id}:votes`);
      if (participantCount >= MAX_PARTICIPANTS_PER_POLL) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This poll has reached the maximum number of participants.",
        });
      }
    }

    // Version check for existing votes
    if (existingVote && existingVote.encryptedVote) {
      const currentVoteVersion = parseInt(existingVote.version, 10) || 1;
      if (
        input.expectedVersion !== undefined &&
        input.expectedVersion !== currentVoteVersion
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Vote has been modified. Please refresh and try again.",
        });
      }
    }

    const newVoteVersion = existingVote?.encryptedVote
      ? (parseInt(existingVote.version, 10) || 0) + 1
      : 1;
    const now = new Date().toISOString();

    const ttl = calculateTTLSeconds(poll.expiresAt);
    const votesSetKey = `poll:${input.id}:votes`;

    // Atomic write: bundle all vote mutations in a single MULTI/EXEC transaction
    const multi = ctx.redis.multi();
    multi.hSet(voteKey, {
      encryptedVote: input.encryptedVote,
      version: String(newVoteVersion),
      updatedAt: now,
    } satisfies RedisVoteHash);
    multi.expire(voteKey, ttl);
    multi.sAdd(votesSetKey, input.participantId);
    multi.expire(votesSetKey, ttl);
    await multi.exec();

    await publishPollUpdate(ctx.redis, input.id);

    return {
      participantId: input.participantId,
      encryptedVote: input.encryptedVote,
      version: newVoteVersion,
      updatedAt: now,
    } satisfies VoteResponse;
  }),

  delete: publicProcedure
    .input(deletePollInput)
    .mutation(async ({ ctx, input }) => {
      const poll = await getValidPoll(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, poll.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Poll not found or invalid admin token",
        });
      }

      // Hard delete: remove poll + all vote keys
      const participantIds = await ctx.redis.sMembers(
        `poll:${input.id}:votes`
      );
      const keysToDelete = [
        `poll:${input.id}`,
        `poll:${input.id}:votes`,
        ...participantIds.map(
          (pid) => `poll:${input.id}:vote:${pid}`
        ),
      ];

      await ctx.redis.del(keysToDelete);

      return { message: "Poll deleted successfully" };
    }),

  extend: publicProcedure
    .input(extendPollInput)
    .mutation(async ({ ctx, input }) => {
      const poll = await getValidPoll(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, poll.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Poll not found or invalid admin token",
        });
      }

      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + input.days);
      const expiresAtStr = newExpiresAt.toISOString();
      const ttl = calculateTTLSeconds(expiresAtStr);

      // Update poll expiry
      await ctx.redis.hSet(`poll:${input.id}`, { expiresAt: expiresAtStr });
      await ctx.redis.expire(`poll:${input.id}`, ttl);

      // Update TTL on all vote keys
      const participantIds = await ctx.redis.sMembers(
        `poll:${input.id}:votes`
      );
      await ctx.redis.expire(`poll:${input.id}:votes`, ttl);
      for (const pid of participantIds) {
        await ctx.redis.expire(`poll:${input.id}:vote:${pid}`, ttl);
      }

      return {
        id: input.id,
        expiresAt: expiresAtStr,
        message: `Poll extended by ${input.days} days`,
      };
    }),

  health: publicProcedure.query(async ({ ctx }) => {
    try {
      await ctx.redis.ping();
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Health check failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Service unavailable",
      });
    }
  }),

  subscribe: publicProcedure
    .input(getPollInput)
    .subscription(async function* (opts) {
      const { ctx, input } = opts;

      const fetchFullState = async (): Promise<PollWithVotesResponse> => {
        const poll = await getValidPoll(ctx.redis, input.id);
        const votes = await getPollVotes(ctx.redis, input.id);
        return {
          poll: {
            id: input.id,
            encryptedData: poll.encryptedData,
            createdAt: poll.createdAt,
            expiresAt: poll.expiresAt,
            version: parseInt(poll.version, 10) || 1,
          },
          votes,
        };
      };

      // Yield initial state
      yield await fetchFullState();

      // Listen for updates via Redis Pub/Sub
      const subscriber = await getRedisSubscriber();
      const channel = `poll:channel:${input.id}`;

      // Create a promise-based message queue
      // eslint-disable-next-line no-unused-vars
      let resolveNext: ((value: string) => void) | null = null;
      const messageQueue: string[] = [];

      const listener = (message: string) => {
        if (resolveNext) {
          const resolve = resolveNext;
          resolveNext = null;
          resolve(message);
        } else {
          messageQueue.push(message);
        }
      };

      await subscriber.subscribe(channel, listener);

      const signal = opts.signal;

      // Handle abort signal
      const abortHandler = () => {
        void subscriber.unsubscribe(channel, listener);
      };
      signal?.addEventListener("abort", abortHandler);

      try {
        while (!signal?.aborted) {
          // Wait for next message
          await new Promise<string>((resolve) => {
            const queued = messageQueue.shift();
            if (queued) {
              resolve(queued);
            } else {
              resolveNext = resolve;
            }
          });

          if (signal?.aborted) break;

          // Re-fetch full state on notification
          try {
            yield await fetchFullState();
          } catch {
            // Poll may have been deleted/expired, stop subscription
            break;
          }
        }
      } finally {
        signal?.removeEventListener("abort", abortHandler);
        await subscriber.unsubscribe(channel, listener);
      }
    }),
});

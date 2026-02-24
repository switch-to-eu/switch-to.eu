import { z } from "zod";
import { eq, and, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import EventEmitter, { on } from "events";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { polls } from "@/server/db/schema";

// Utility function to generate poll ID (10 characters, user-friendly)
function generatePollId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utility function to generate admin token (64 characters)
function generateAdminToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Input validation schemas
const createPollInput = z.object({
  encryptedData: z.string().min(1, "Encrypted data is required"),
  expiresAt: z.date().optional(),
});

const getPollInput = z.object({
  id: z.string().length(10, "Poll ID must be 10 characters"),
});

const updatePollInput = z.object({
  id: z.string().length(10, "Poll ID must be 10 characters"),
  adminToken: z.string().length(64, "Admin token is required"),
  encryptedData: z.string().min(1, "Encrypted data is required"),
});

const deletePollInput = z.object({
  id: z.string().length(10, "Poll ID must be 10 characters"),
  adminToken: z.string().length(64, "Admin token is required"),
});

const extendPollInput = z.object({
  id: z.string().length(10, "Poll ID must be 10 characters"),
  adminToken: z.string().length(64, "Admin token is required"),
  days: z.number().min(1).max(365, "Cannot extend more than 365 days"),
});

const updateVoteInput = z.object({
  id: z.string().length(10, "Poll ID must be 10 characters"),
  encryptedData: z.string().min(1, "Encrypted data is required"),
});

// Create event emitter for poll updates
interface PollUpdateData {
  id: string;
  encryptedData: string;
  createdAt: Date;
  expiresAt: Date;
  isEncrypted: boolean;
}

const pollEvents = new EventEmitter();

export const pollRouter = createTRPCRouter({
  // Create a new encrypted poll
  create: publicProcedure
    .input(createPollInput)
    .mutation(async ({ ctx, input }) => {
      const pollId = generatePollId();
      const adminToken = generateAdminToken();

      const expiresAt =
        input.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

      try {
        const [poll] = await ctx.db
          .insert(polls)
          .values({
            id: pollId,
            adminToken,
            encryptedData: input.encryptedData,
            expiresAt,
          })
          .returning();

        return {
          poll: {
            id: poll!.id,
            encryptedData: poll!.encryptedData,
            createdAt: poll!.createdAt,
            expiresAt: poll!.expiresAt,
          },
          adminToken,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create poll: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  get: publicProcedure.input(getPollInput).query(async ({ ctx, input }) => {
    try {
      const poll = await ctx.db.query.polls.findFirst({
        where: and(eq(polls.id, input.id), eq(polls.isDeleted, false)),
      });

      if (!poll) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Poll not found",
        });
      }

      // Check if poll is expired
      if (poll.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Poll has expired",
        });
      }

      const response = {
        id: poll.id,
        encryptedData: poll.encryptedData,
        createdAt: poll.createdAt,
        expiresAt: poll.expiresAt,
        isEncrypted: true,
      };

      return response;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get poll",
      });
    }
  }),

  // Update encrypted poll data (admin only)
  update: publicProcedure
    .input(updatePollInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const [updatedPoll] = await ctx.db
          .update(polls)
          .set({
            encryptedData: input.encryptedData,
          })
          .where(
            and(
              eq(polls.id, input.id),
              eq(polls.adminToken, input.adminToken),
              eq(polls.isDeleted, false)
            )
          )
          .returning();

        if (!updatedPoll) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Poll not found or invalid admin token",
          });
        }

        const result = {
          id: updatedPoll.id,
          encryptedData: updatedPoll.encryptedData,
          createdAt: updatedPoll.createdAt,
          expiresAt: updatedPoll.expiresAt,
        };

        // Emit update event for SSE subscribers
        if (updatedPoll.encryptedData) {
          pollEvents.emit(`poll:${input.id}`, {
            id: updatedPoll.id,
            encryptedData: updatedPoll.encryptedData,
            createdAt: updatedPoll.createdAt,
            expiresAt: updatedPoll.expiresAt,
            isEncrypted: true,
          });
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update poll",
        });
      }
    }),

  // Update poll data for voting (no admin token required)
  vote: publicProcedure
    .input(updateVoteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const [updatedPoll] = await ctx.db
          .update(polls)
          .set({
            encryptedData: input.encryptedData,
          })
          .where(and(eq(polls.id, input.id), eq(polls.isDeleted, false)))
          .returning();

        if (!updatedPoll) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Poll not found",
          });
        }

        // Check if poll is expired
        if (updatedPoll.expiresAt < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot vote on expired poll",
          });
        }

        const result = {
          id: updatedPoll.id,
          encryptedData: updatedPoll.encryptedData,
          createdAt: updatedPoll.createdAt,
          expiresAt: updatedPoll.expiresAt,
        };

        // Emit update event for SSE subscribers
        if (updatedPoll.encryptedData) {
          pollEvents.emit(`poll:${input.id}`, {
            id: updatedPoll.id,
            encryptedData: updatedPoll.encryptedData,
            createdAt: updatedPoll.createdAt,
            expiresAt: updatedPoll.expiresAt,
            isEncrypted: true,
          });
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update vote",
        });
      }
    }),

  // Delete poll (soft delete, admin only)
  delete: publicProcedure
    .input(deletePollInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const [deletedPoll] = await ctx.db
          .update(polls)
          .set({
            isDeleted: true,
            deletedAt: new Date(),
          })
          .where(
            and(
              eq(polls.id, input.id),
              eq(polls.adminToken, input.adminToken),
              eq(polls.isDeleted, false)
            )
          )
          .returning();

        if (!deletedPoll) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Poll not found or invalid admin token",
          });
        }

        return { message: "Poll deleted successfully" };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete poll",
        });
      }
    }),

  // Extend poll expiration (admin only)
  extend: publicProcedure
    .input(extendPollInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Calculate new expiration date
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + input.days);

        const [extendedPoll] = await ctx.db
          .update(polls)
          .set({
            expiresAt: newExpiresAt,
          })
          .where(
            and(
              eq(polls.id, input.id),
              eq(polls.adminToken, input.adminToken),
              eq(polls.isDeleted, false)
            )
          )
          .returning();

        if (!extendedPoll) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Poll not found or invalid admin token",
          });
        }

        return {
          id: extendedPoll.id,
          expiresAt: extendedPoll.expiresAt,
          message: `Poll extended by ${input.days} days`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to extend poll",
        });
      }
    }),

  // Clean up expired polls (utility function)
  cleanupExpired: publicProcedure.mutation(async ({ ctx }) => {
    try {
      // Soft delete expired polls
      await ctx.db
        .update(polls)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
        })
        .where(
          and(lt(polls.expiresAt, new Date()), eq(polls.isDeleted, false))
        );

      // Hard delete polls that have been soft deleted for more than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      await ctx.db
        .delete(polls)
        .where(
          and(eq(polls.isDeleted, true), lt(polls.deletedAt, sevenDaysAgo))
        );

      return { message: "Cleanup completed successfully" };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to cleanup expired polls: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  // Health check for development
  health: publicProcedure.query(async ({ ctx }) => {
    try {
      // Simple query to test database connection
      const pollCount = await ctx.db.query.polls.findMany({
        where: eq(polls.isDeleted, false),
      });

      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        activePolls: pollCount.length,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  // SSE Subscription for real-time poll updates
  subscribe: publicProcedure
    .input(getPollInput)
    .subscription(async function* (opts) {
      const { ctx, input } = opts;

      // Function to fetch current poll data
      const fetchPollData = async () => {
        const poll = await ctx.db.query.polls.findFirst({
          where: and(eq(polls.id, input.id), eq(polls.isDeleted, false)),
        });

        if (!poll) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Poll not found",
          });
        }

        // Check if poll is expired
        if (poll.expiresAt < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Poll has expired",
          });
        }

        // Ensure encryptedData is not null
        if (!poll.encryptedData) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Poll data is corrupted",
          });
        }

        return {
          id: poll.id,
          encryptedData: poll.encryptedData,
          createdAt: poll.createdAt,
          expiresAt: poll.expiresAt,
          isEncrypted: true,
        };
      };

      let refreshInterval: NodeJS.Timeout | undefined;

      try {
        // Yield initial data
        yield await fetchPollData();

        // Listen for poll update events
        for await (const [data] of on(pollEvents, `poll:${input.id}`, {
          signal: opts.signal,
        })) {
          const pollData = data as PollUpdateData;
          yield {
            id: pollData.id,
            encryptedData: pollData.encryptedData,
            createdAt: pollData.createdAt,
            expiresAt: pollData.expiresAt,
            isEncrypted: pollData.isEncrypted,
          };
        }
      } finally {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      }
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomBytes, randomInt, timingSafeEqual, createHash } from "crypto";
import type { RedisClientType } from "redis";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getRedisSubscriber } from "@/server/db/redis";
import type {
  RedisGroupHash,
  RedisExpenseHash,
  GroupResponse,
  ExpenseResponse,
  GroupWithExpensesResponse,
} from "@/server/db/types";

// --- Utility functions ---

function generateGroupId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[randomInt(chars.length)]!).join("");
}

function generateExpenseId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[randomInt(chars.length)]!).join("");
}

function generateAdminToken(): string {
  return randomBytes(48).toString("base64url");
}

function hashAdminToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function verifyAdminToken(inputToken: string, storedHash: string): boolean {
  const inputHash = hashAdminToken(inputToken);
  if (inputHash.length !== storedHash.length) return false;
  return timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
}

function calculateTTLSeconds(expiresAt: string): number {
  const gracePeriodMs = 7 * 24 * 60 * 60 * 1000;
  const expiryMs = new Date(expiresAt).getTime() + gracePeriodMs;
  return Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
}

async function getValidGroup(
  redis: RedisClientType,
  id: string
): Promise<RedisGroupHash> {
  const group = (await redis.hGetAll(`group:${id}`)) as unknown as RedisGroupHash;

  if (!group || !group.encryptedData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
  }

  if (group.isDeleted === "true") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
  }

  if (new Date(group.expiresAt) < new Date()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Group has expired" });
  }

  return group;
}

async function getGroupExpenses(
  redis: RedisClientType,
  groupId: string
): Promise<ExpenseResponse[]> {
  const expenseIds = await redis.sMembers(`group:${groupId}:expenses`);
  if (!expenseIds.length) return [];

  const expenses: ExpenseResponse[] = [];
  for (const eid of expenseIds) {
    const expense = (await redis.hGetAll(
      `group:${groupId}:expense:${eid}`
    )) as unknown as RedisExpenseHash;
    if (expense && expense.encryptedExpense) {
      expenses.push({
        expenseId: eid,
        encryptedExpense: expense.encryptedExpense,
        version: parseInt(expense.version, 10) || 1,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      });
    }
  }
  return expenses;
}

async function publishGroupUpdate(
  redis: RedisClientType,
  groupId: string
): Promise<void> {
  await redis.publish(`group:channel:${groupId}`, "updated");
}

// --- Constants ---

const MAX_ENCRYPTED_DATA_SIZE = 65_536; // 64 KB
const MAX_ENCRYPTED_EXPENSE_SIZE = 16_384; // 16 KB
const MAX_EXPENSES_PER_GROUP = 1000;

// --- Input validation schemas ---

const groupIdSchema = z
  .string()
  .length(10, "Group ID must be 10 characters")
  .regex(/^[A-Za-z0-9]+$/, "Invalid group ID format");

const expenseIdSchema = z
  .string()
  .min(1)
  .max(20)
  .regex(/^[A-Za-z0-9]+$/, "Invalid expense ID format");

const createGroupInput = z.object({
  encryptedData: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
  expiresAt: z.date().optional(),
});

const getGroupInput = z.object({
  id: groupIdSchema,
});

const updateGroupInput = z.object({
  id: groupIdSchema,
  adminToken: z.string().min(1),
  encryptedData: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
  expectedVersion: z.number().int().optional(),
});

const deleteGroupInput = z.object({
  id: groupIdSchema,
  adminToken: z.string().min(1),
});

const addExpenseInput = z.object({
  id: groupIdSchema,
  encryptedExpense: z.string().min(1).max(MAX_ENCRYPTED_EXPENSE_SIZE),
});

const deleteExpenseInput = z.object({
  id: groupIdSchema,
  adminToken: z.string().min(1),
  expenseId: expenseIdSchema,
});

// --- Router ---

export const groupRouter = createTRPCRouter({
  create: publicProcedure
    .input(createGroupInput)
    .mutation(async ({ ctx, input }) => {
      const groupId = generateGroupId();
      const adminToken = generateAdminToken();
      const now = new Date().toISOString();
      const expiresAt = (
        input.expiresAt ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      ).toISOString();

      try {
        await ctx.redis.hSet(`group:${groupId}`, {
          encryptedData: input.encryptedData,
          adminToken: hashAdminToken(adminToken),
          createdAt: now,
          expiresAt,
          version: "1",
          isDeleted: "false",
        } satisfies RedisGroupHash);
        await ctx.redis.expireAt(
          `group:${groupId}`,
          Math.floor(
            (new Date(expiresAt).getTime() + 7 * 24 * 60 * 60 * 1000) / 1000
          )
        );

        return {
          group: {
            id: groupId,
            encryptedData: input.encryptedData,
            createdAt: now,
            expiresAt,
            version: 1,
          } satisfies GroupResponse,
          adminToken,
        };
      } catch (error) {
        console.error("Failed to create group:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create group",
        });
      }
    }),

  get: publicProcedure.input(getGroupInput).query(async ({ ctx, input }) => {
    const group = await getValidGroup(ctx.redis, input.id);
    const expenses = await getGroupExpenses(ctx.redis, input.id);

    return {
      group: {
        id: input.id,
        encryptedData: group.encryptedData,
        createdAt: group.createdAt,
        expiresAt: group.expiresAt,
        version: parseInt(group.version, 10) || 1,
      } satisfies GroupResponse,
      expenses,
    } satisfies GroupWithExpensesResponse;
  }),

  update: publicProcedure
    .input(updateGroupInput)
    .mutation(async ({ ctx, input }) => {
      const group = await getValidGroup(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, group.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found or invalid admin token",
        });
      }

      const currentVersion = parseInt(group.version, 10) || 1;
      if (
        input.expectedVersion !== undefined &&
        input.expectedVersion !== currentVersion
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Group has been modified. Please refresh and try again.",
        });
      }

      const newVersion = currentVersion + 1;

      await ctx.redis.hSet(`group:${input.id}`, {
        encryptedData: input.encryptedData,
        version: String(newVersion),
      });

      await publishGroupUpdate(ctx.redis, input.id);

      return {
        id: input.id,
        encryptedData: input.encryptedData,
        createdAt: group.createdAt,
        expiresAt: group.expiresAt,
        version: newVersion,
      } satisfies GroupResponse;
    }),

  addExpense: publicProcedure
    .input(addExpenseInput)
    .mutation(async ({ ctx, input }) => {
      const group = await getValidGroup(ctx.redis, input.id);

      const expenseCount = await ctx.redis.sCard(`group:${input.id}:expenses`);
      if (expenseCount >= MAX_EXPENSES_PER_GROUP) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This group has reached the maximum number of expenses.",
        });
      }

      const expenseId = generateExpenseId();
      const now = new Date().toISOString();
      const ttl = calculateTTLSeconds(group.expiresAt);
      const expensesSetKey = `group:${input.id}:expenses`;
      const expenseKey = `group:${input.id}:expense:${expenseId}`;

      const multi = ctx.redis.multi();
      multi.hSet(expenseKey, {
        encryptedExpense: input.encryptedExpense,
        version: "1",
        createdAt: now,
        updatedAt: now,
      } satisfies RedisExpenseHash);
      multi.expire(expenseKey, ttl);
      multi.sAdd(expensesSetKey, expenseId);
      multi.expire(expensesSetKey, ttl);
      await multi.exec();

      await publishGroupUpdate(ctx.redis, input.id);

      return {
        expenseId,
        encryptedExpense: input.encryptedExpense,
        version: 1,
        createdAt: now,
        updatedAt: now,
      } satisfies ExpenseResponse;
    }),

  deleteExpense: publicProcedure
    .input(deleteExpenseInput)
    .mutation(async ({ ctx, input }) => {
      const group = await getValidGroup(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, group.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found or invalid admin token",
        });
      }

      const expenseKey = `group:${input.id}:expense:${input.expenseId}`;
      const exists = await ctx.redis.exists(expenseKey);
      if (!exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
      }

      await ctx.redis.del(expenseKey);
      await ctx.redis.sRem(`group:${input.id}:expenses`, input.expenseId);

      await publishGroupUpdate(ctx.redis, input.id);

      return { message: "Expense deleted successfully" };
    }),

  delete: publicProcedure
    .input(deleteGroupInput)
    .mutation(async ({ ctx, input }) => {
      const group = await getValidGroup(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, group.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found or invalid admin token",
        });
      }

      const expenseIds = await ctx.redis.sMembers(`group:${input.id}:expenses`);
      const keysToDelete = [
        `group:${input.id}`,
        `group:${input.id}:expenses`,
        ...expenseIds.map((eid) => `group:${input.id}:expense:${eid}`),
      ];

      await ctx.redis.del(keysToDelete);

      return { message: "Group deleted successfully" };
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
    .input(getGroupInput)
    .subscription(async function* (opts) {
      const { ctx, input } = opts;

      const fetchFullState = async (): Promise<GroupWithExpensesResponse> => {
        const group = await getValidGroup(ctx.redis, input.id);
        const expenses = await getGroupExpenses(ctx.redis, input.id);
        return {
          group: {
            id: input.id,
            encryptedData: group.encryptedData,
            createdAt: group.createdAt,
            expiresAt: group.expiresAt,
            version: parseInt(group.version, 10) || 1,
          },
          expenses,
        };
      };

      yield await fetchFullState();

      const subscriber = await getRedisSubscriber();
      const channel = `group:channel:${input.id}`;

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

      const abortHandler = () => {
        void subscriber.unsubscribe(channel, listener);
      };
      signal?.addEventListener("abort", abortHandler);

      try {
        while (!signal?.aborted) {
          await new Promise<string>((resolve) => {
            const queued = messageQueue.shift();
            if (queued) {
              resolve(queued);
            } else {
              resolveNext = resolve;
            }
          });

          if (signal?.aborted) break;

          try {
            yield await fetchFullState();
          } catch {
            break;
          }
        }
      } finally {
        signal?.removeEventListener("abort", abortHandler);
        await subscriber.unsubscribe(channel, listener);
      }
    }),
});

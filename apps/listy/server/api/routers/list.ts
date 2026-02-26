import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomInt } from "crypto";
import type { RedisClientType } from "@switch-to-eu/db/redis";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getRedisSubscriber } from "@switch-to-eu/db/redis";
import { generateAdminToken, hashAdminToken, verifyAdminToken } from "@switch-to-eu/db/admin";
import { calculateTTLSeconds, calculateExpirationDate } from "@switch-to-eu/db/expiration";
import type { RedisListHash, RedisItemHash, ListResponse, ItemResponse, ListWithItemsResponse } from "@/lib/types";

// --- List presets ---

export const LIST_PRESETS = ["plain", "shopping", "potluck"] as const;
export type ListPreset = (typeof LIST_PRESETS)[number];

// --- Constants ---

const MAX_ENCRYPTED_DATA_SIZE = 65_536; // 64 KB
const MAX_ENCRYPTED_ITEM_SIZE = 16_384; // 16 KB
const MAX_ITEMS_PER_LIST = 500;

// --- Utility functions ---

function generateListId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[randomInt(chars.length)]!).join("");
}

function generateItemId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[randomInt(chars.length)]!).join("");
}

/** Fetch and validate a list exists and is not expired */
async function getValidList(redis: RedisClientType, id: string): Promise<RedisListHash> {
  const list = (await redis.hGetAll(`list:${id}`)) as unknown as RedisListHash;

  if (!list || !list.encryptedData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "List not found" });
  }

  if (new Date(list.expiresAt) < new Date()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "List has expired" });
  }

  return list;
}

/** Fetch all items for a list, sorted by createdAt */
async function getListItems(redis: RedisClientType, listId: string): Promise<ItemResponse[]> {
  const itemIds = await redis.sMembers(`list:${listId}:items`);
  if (!itemIds.length) return [];

  const items: ItemResponse[] = [];
  for (const itemId of itemIds) {
    const item = (await redis.hGetAll(`list:${listId}:item:${itemId}`)) as unknown as RedisItemHash;
    if (item && item.encryptedItem) {
      items.push({
        id: itemId,
        encryptedItem: item.encryptedItem,
        completed: item.completed === "true",
        version: parseInt(item.version, 10) || 1,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }
  }

  // Sort by creation time (oldest first)
  items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return items;
}

/** Publish an update notification to the list's Pub/Sub channel */
async function publishListUpdate(redis: RedisClientType, listId: string): Promise<void> {
  await redis.publish(`list:channel:${listId}`, "updated");
}

/** Fetch the full list state (for subscriptions) */
async function fetchFullListState(redis: RedisClientType, id: string): Promise<ListWithItemsResponse> {
  const list = await getValidList(redis, id);
  const items = await getListItems(redis, id);
  return {
    list: {
      id,
      encryptedData: list.encryptedData,
      preset: list.preset,
      createdAt: list.createdAt,
      expiresAt: list.expiresAt,
      version: parseInt(list.version, 10) || 1,
    },
    items,
  };
}

// --- Input schemas ---

const listIdSchema = z
  .string()
  .length(10, "List ID must be 10 characters")
  .regex(/^[A-Za-z0-9]+$/, "Invalid list ID format");

const itemIdSchema = z
  .string()
  .length(8, "Item ID must be 8 characters")
  .regex(/^[A-Za-z0-9]+$/, "Invalid item ID format");

const createListInput = z.object({
  encryptedData: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
  preset: z.enum(LIST_PRESETS),
  expirationDays: z.number().min(1).max(365).optional(),
});

const getListInput = z.object({
  id: listIdSchema,
});

const addItemInput = z.object({
  listId: listIdSchema,
  encryptedItem: z.string().min(1).max(MAX_ENCRYPTED_ITEM_SIZE),
});

const updateItemInput = z.object({
  listId: listIdSchema,
  itemId: itemIdSchema,
  encryptedItem: z.string().min(1).max(MAX_ENCRYPTED_ITEM_SIZE),
  expectedVersion: z.number().int().optional(),
});

const toggleItemInput = z.object({
  listId: listIdSchema,
  itemId: itemIdSchema,
  completed: z.boolean(),
});

const removeItemInput = z.object({
  listId: listIdSchema,
  itemId: itemIdSchema,
});

const updateListInput = z.object({
  id: listIdSchema,
  adminToken: z.string().min(1),
  encryptedData: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
});

const deleteListInput = z.object({
  id: listIdSchema,
  adminToken: z.string().min(1),
});

// --- Router ---

export const listRouter = createTRPCRouter({
  create: publicProcedure
    .input(createListInput)
    .mutation(async ({ ctx, input }) => {
      const listId = generateListId();
      const adminToken = generateAdminToken();
      const now = new Date().toISOString();
      const expiresAt = calculateExpirationDate(
        new Date(),
        input.expirationDays ?? 30,
      ).toISOString();
      const ttl = calculateTTLSeconds(expiresAt);

      await ctx.redis.hSet(`list:${listId}`, {
        encryptedData: input.encryptedData,
        adminToken: hashAdminToken(adminToken),
        preset: input.preset,
        createdAt: now,
        expiresAt,
        version: "1",
      } satisfies RedisListHash);
      await ctx.redis.expire(`list:${listId}`, ttl);

      return {
        list: {
          id: listId,
          encryptedData: input.encryptedData,
          preset: input.preset,
          createdAt: now,
          expiresAt,
          version: 1,
        } satisfies ListResponse,
        adminToken,
      };
    }),

  get: publicProcedure
    .input(getListInput)
    .query(async ({ ctx, input }) => {
      const list = await getValidList(ctx.redis, input.id);
      const items = await getListItems(ctx.redis, input.id);

      return {
        list: {
          id: input.id,
          encryptedData: list.encryptedData,
          preset: list.preset,
          createdAt: list.createdAt,
          expiresAt: list.expiresAt,
          version: parseInt(list.version, 10) || 1,
        } satisfies ListResponse,
        items,
      };
    }),

  addItem: publicProcedure
    .input(addItemInput)
    .mutation(async ({ ctx, input }) => {
      const list = await getValidList(ctx.redis, input.listId);

      // Enforce item cap
      const itemCount = await ctx.redis.sCard(`list:${input.listId}:items`);
      if (itemCount >= MAX_ITEMS_PER_LIST) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This list has reached the maximum number of items.",
        });
      }

      const itemId = generateItemId();
      const now = new Date().toISOString();
      const ttl = calculateTTLSeconds(list.expiresAt);

      const itemKey = `list:${input.listId}:item:${itemId}`;
      const itemsSetKey = `list:${input.listId}:items`;

      const multi = ctx.redis.multi();
      multi.hSet(itemKey, {
        encryptedItem: input.encryptedItem,
        completed: "false",
        version: "1",
        createdAt: now,
        updatedAt: now,
      } satisfies RedisItemHash);
      multi.expire(itemKey, ttl);
      multi.sAdd(itemsSetKey, itemId);
      multi.expire(itemsSetKey, ttl);
      await multi.exec();

      await publishListUpdate(ctx.redis, input.listId);

      return {
        id: itemId,
        encryptedItem: input.encryptedItem,
        completed: false,
        version: 1,
        createdAt: now,
        updatedAt: now,
      } satisfies ItemResponse;
    }),

  updateItem: publicProcedure
    .input(updateItemInput)
    .mutation(async ({ ctx, input }) => {
      await getValidList(ctx.redis, input.listId);

      const itemKey = `list:${input.listId}:item:${input.itemId}`;
      const item = (await ctx.redis.hGetAll(itemKey)) as unknown as RedisItemHash;

      if (!item || !item.encryptedItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const currentVersion = parseInt(item.version, 10) || 1;
      if (input.expectedVersion !== undefined && input.expectedVersion !== currentVersion) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Item has been modified. Please refresh and try again.",
        });
      }

      const newVersion = currentVersion + 1;
      const now = new Date().toISOString();

      await ctx.redis.hSet(itemKey, {
        encryptedItem: input.encryptedItem,
        version: String(newVersion),
        updatedAt: now,
      });

      await publishListUpdate(ctx.redis, input.listId);

      return {
        id: input.itemId,
        encryptedItem: input.encryptedItem,
        completed: item.completed === "true",
        version: newVersion,
        createdAt: item.createdAt,
        updatedAt: now,
      } satisfies ItemResponse;
    }),

  toggleItem: publicProcedure
    .input(toggleItemInput)
    .mutation(async ({ ctx, input }) => {
      await getValidList(ctx.redis, input.listId);

      const itemKey = `list:${input.listId}:item:${input.itemId}`;
      const item = (await ctx.redis.hGetAll(itemKey)) as unknown as RedisItemHash;

      if (!item || !item.encryptedItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const now = new Date().toISOString();
      await ctx.redis.hSet(itemKey, {
        completed: input.completed ? "true" : "false",
        updatedAt: now,
      });

      await publishListUpdate(ctx.redis, input.listId);

      return {
        id: input.itemId,
        encryptedItem: item.encryptedItem,
        completed: input.completed,
        version: parseInt(item.version, 10) || 1,
        createdAt: item.createdAt,
        updatedAt: now,
      } satisfies ItemResponse;
    }),

  removeItem: publicProcedure
    .input(removeItemInput)
    .mutation(async ({ ctx, input }) => {
      await getValidList(ctx.redis, input.listId);

      const itemKey = `list:${input.listId}:item:${input.itemId}`;
      const item = (await ctx.redis.hGetAll(itemKey)) as unknown as RedisItemHash;

      if (!item || !item.encryptedItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      await ctx.redis.del(itemKey);
      await ctx.redis.sRem(`list:${input.listId}:items`, input.itemId);

      await publishListUpdate(ctx.redis, input.listId);

      return { message: "Item removed" };
    }),

  updateList: publicProcedure
    .input(updateListInput)
    .mutation(async ({ ctx, input }) => {
      const list = await getValidList(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, list.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found or invalid admin token",
        });
      }

      const currentVersion = parseInt(list.version, 10) || 1;
      const newVersion = currentVersion + 1;

      await ctx.redis.hSet(`list:${input.id}`, {
        encryptedData: input.encryptedData,
        version: String(newVersion),
      });

      await publishListUpdate(ctx.redis, input.id);

      return {
        id: input.id,
        encryptedData: input.encryptedData,
        preset: list.preset,
        createdAt: list.createdAt,
        expiresAt: list.expiresAt,
        version: newVersion,
      } satisfies ListResponse;
    }),

  delete: publicProcedure
    .input(deleteListInput)
    .mutation(async ({ ctx, input }) => {
      const list = await getValidList(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, list.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found or invalid admin token",
        });
      }

      // Hard delete: remove list + all item keys
      const itemIds = await ctx.redis.sMembers(`list:${input.id}:items`);
      const keysToDelete = [
        `list:${input.id}`,
        `list:${input.id}:items`,
        ...itemIds.map((itemId) => `list:${input.id}:item:${itemId}`),
      ];

      await ctx.redis.del(keysToDelete);

      return { message: "List deleted successfully" };
    }),

  subscribe: publicProcedure
    .input(getListInput)
    .subscription(async function* (opts) {
      const { ctx, input } = opts;

      // Yield initial state
      yield await fetchFullListState(ctx.redis, input.id);

      // Listen for updates via Redis Pub/Sub
      const subscriber = await getRedisSubscriber();
      const channel = `list:channel:${input.id}`;

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
            yield await fetchFullListState(ctx.redis, input.id);
          } catch {
            // List may have been deleted/expired
            break;
          }
        }
      } finally {
        signal?.removeEventListener("abort", abortHandler);
        await subscriber.unsubscribe(channel, listener);
      }
    }),
});

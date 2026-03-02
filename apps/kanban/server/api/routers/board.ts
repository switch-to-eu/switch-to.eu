import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomInt } from "crypto";
import type { RedisClientType } from "@switch-to-eu/db/redis";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getRedisSubscriber } from "@switch-to-eu/db/redis";
import { generateAdminToken, hashAdminToken, verifyAdminToken } from "@switch-to-eu/db/admin";
import { calculateTTLSeconds, calculateExpirationDate } from "@switch-to-eu/db/expiration";
import type {
  RedisBoardHash,
  RedisColumnHash,
  BoardResponse,
  ColumnResponse,
  BoardWithColumnsResponse,
} from "@/lib/types";

// --- Constants ---

const MAX_ENCRYPTED_DATA_SIZE = 65_536; // 64 KB
const MAX_ENCRYPTED_CARDS_SIZE = 262_144; // 256 KB (full column of cards)
const MAX_COLUMNS_PER_BOARD = 20;

// --- Utility functions ---

function generateBoardId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[randomInt(chars.length)]!).join("");
}

function generateColumnId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[randomInt(chars.length)]!).join("");
}

/** Fetch and validate a board exists and is not expired */
async function getValidBoard(redis: RedisClientType, id: string): Promise<RedisBoardHash> {
  const board = (await redis.hGetAll(`board:${id}`)) as unknown as RedisBoardHash;

  if (!board || !board.encryptedData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
  }

  if (new Date(board.expiresAt) < new Date()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Board has expired" });
  }

  return board;
}

/** Fetch all columns for a board, ordered by columnOrder */
async function getBoardColumns(redis: RedisClientType, boardId: string, columnOrder: string[]): Promise<ColumnResponse[]> {
  const columns: ColumnResponse[] = [];
  for (const colId of columnOrder) {
    const col = (await redis.hGetAll(`board:${boardId}:column:${colId}`)) as unknown as RedisColumnHash;
    if (col && col.encryptedMeta) {
      columns.push({
        id: colId,
        encryptedMeta: col.encryptedMeta,
        encryptedCards: col.encryptedCards || "",
        version: parseInt(col.version, 10) || 1,
        createdAt: col.createdAt,
        updatedAt: col.updatedAt,
      });
    }
  }
  return columns;
}

/** Publish an update notification to the board's Pub/Sub channel */
async function publishBoardUpdate(redis: RedisClientType, boardId: string): Promise<void> {
  await redis.publish(`board:channel:${boardId}`, "updated");
}

/** Fetch the full board state (for subscriptions) */
async function fetchFullBoardState(redis: RedisClientType, id: string): Promise<BoardWithColumnsResponse> {
  const board = await getValidBoard(redis, id);
  const columnOrder = JSON.parse(board.columnOrder || "[]") as string[];
  const columns = await getBoardColumns(redis, id, columnOrder);

  return {
    board: {
      id,
      encryptedData: board.encryptedData,
      columnOrder,
      createdAt: board.createdAt,
      expiresAt: board.expiresAt,
      version: parseInt(board.version, 10) || 1,
    },
    columns,
  };
}

// --- Input schemas ---

const boardIdSchema = z
  .string()
  .length(10, "Board ID must be 10 characters")
  .regex(/^[A-Za-z0-9]+$/, "Invalid board ID format");

const columnIdSchema = z
  .string()
  .length(8, "Column ID must be 8 characters")
  .regex(/^[A-Za-z0-9]+$/, "Invalid column ID format");

// --- Router ---

export const boardRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        encryptedData: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
        columns: z.array(
          z.object({
            encryptedMeta: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
            encryptedCards: z.string().min(1).max(MAX_ENCRYPTED_CARDS_SIZE),
          }),
        ).min(1).max(MAX_COLUMNS_PER_BOARD),
        expirationDays: z.number().min(1).max(365).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const boardId = generateBoardId();
      const adminToken = generateAdminToken();
      const now = new Date().toISOString();
      const expiresAt = calculateExpirationDate(
        new Date(),
        input.expirationDays ?? 30,
      ).toISOString();
      const ttl = calculateTTLSeconds(expiresAt);

      const columnIds: string[] = [];
      const multi = ctx.redis.multi();

      // Create columns
      for (const col of input.columns) {
        const colId = generateColumnId();
        columnIds.push(colId);

        const colKey = `board:${boardId}:column:${colId}`;
        multi.hSet(colKey, {
          encryptedMeta: col.encryptedMeta,
          encryptedCards: col.encryptedCards,
          version: "1",
          createdAt: now,
          updatedAt: now,
        } satisfies RedisColumnHash);
        multi.expire(colKey, ttl);
        multi.sAdd(`board:${boardId}:columns`, colId);
      }

      // Create board
      multi.hSet(`board:${boardId}`, {
        encryptedData: input.encryptedData,
        adminToken: hashAdminToken(adminToken),
        columnOrder: JSON.stringify(columnIds),
        createdAt: now,
        expiresAt,
        version: "1",
      } satisfies RedisBoardHash);
      multi.expire(`board:${boardId}`, ttl);
      multi.expire(`board:${boardId}:columns`, ttl);

      await multi.exec();

      const columns: ColumnResponse[] = columnIds.map((colId, i) => ({
        id: colId,
        encryptedMeta: input.columns[i]!.encryptedMeta,
        encryptedCards: input.columns[i]!.encryptedCards,
        version: 1,
        createdAt: now,
        updatedAt: now,
      }));

      return {
        board: {
          id: boardId,
          encryptedData: input.encryptedData,
          columnOrder: columnIds,
          createdAt: now,
          expiresAt,
          version: 1,
        } satisfies BoardResponse,
        columns,
        adminToken,
      };
    }),

  get: publicProcedure
    .input(z.object({ id: boardIdSchema }))
    .query(async ({ ctx, input }) => {
      return fetchFullBoardState(ctx.redis, input.id);
    }),

  addColumn: publicProcedure
    .input(
      z.object({
        boardId: boardIdSchema,
        adminToken: z.string().min(1),
        encryptedMeta: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
        encryptedCards: z.string().min(1).max(MAX_ENCRYPTED_CARDS_SIZE),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const board = await getValidBoard(ctx.redis, input.boardId);

      if (!verifyAdminToken(input.adminToken, board.adminToken)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found or invalid admin token" });
      }

      const columnOrder = JSON.parse(board.columnOrder || "[]") as string[];
      if (columnOrder.length >= MAX_COLUMNS_PER_BOARD) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum number of columns reached." });
      }

      const colId = generateColumnId();
      const now = new Date().toISOString();
      const ttl = calculateTTLSeconds(board.expiresAt);

      const colKey = `board:${input.boardId}:column:${colId}`;
      const newColumnOrder = [...columnOrder, colId];

      const multi = ctx.redis.multi();
      multi.hSet(colKey, {
        encryptedMeta: input.encryptedMeta,
        encryptedCards: input.encryptedCards,
        version: "1",
        createdAt: now,
        updatedAt: now,
      } satisfies RedisColumnHash);
      multi.expire(colKey, ttl);
      multi.sAdd(`board:${input.boardId}:columns`, colId);
      multi.expire(`board:${input.boardId}:columns`, ttl);
      multi.hSet(`board:${input.boardId}`, { columnOrder: JSON.stringify(newColumnOrder) });
      await multi.exec();

      await publishBoardUpdate(ctx.redis, input.boardId);

      return {
        id: colId,
        encryptedMeta: input.encryptedMeta,
        encryptedCards: input.encryptedCards,
        version: 1,
        createdAt: now,
        updatedAt: now,
      } satisfies ColumnResponse;
    }),

  updateColumn: publicProcedure
    .input(
      z.object({
        boardId: boardIdSchema,
        columnId: columnIdSchema,
        adminToken: z.string().min(1),
        encryptedMeta: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const board = await getValidBoard(ctx.redis, input.boardId);

      if (!verifyAdminToken(input.adminToken, board.adminToken)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found or invalid admin token" });
      }

      const colKey = `board:${input.boardId}:column:${input.columnId}`;
      const col = (await ctx.redis.hGetAll(colKey)) as unknown as RedisColumnHash;

      if (!col || !col.encryptedMeta) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Column not found" });
      }

      const newVersion = (parseInt(col.version, 10) || 1) + 1;
      const now = new Date().toISOString();

      await ctx.redis.hSet(colKey, {
        encryptedMeta: input.encryptedMeta,
        version: String(newVersion),
        updatedAt: now,
      });

      await publishBoardUpdate(ctx.redis, input.boardId);

      return {
        id: input.columnId,
        encryptedMeta: input.encryptedMeta,
        encryptedCards: col.encryptedCards,
        version: newVersion,
        createdAt: col.createdAt,
        updatedAt: now,
      } satisfies ColumnResponse;
    }),

  removeColumn: publicProcedure
    .input(
      z.object({
        boardId: boardIdSchema,
        columnId: columnIdSchema,
        adminToken: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const board = await getValidBoard(ctx.redis, input.boardId);

      if (!verifyAdminToken(input.adminToken, board.adminToken)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found or invalid admin token" });
      }

      const colKey = `board:${input.boardId}:column:${input.columnId}`;
      const col = (await ctx.redis.hGetAll(colKey)) as unknown as RedisColumnHash;

      if (!col || !col.encryptedMeta) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Column not found" });
      }

      const columnOrder = JSON.parse(board.columnOrder || "[]") as string[];
      const newColumnOrder = columnOrder.filter((id) => id !== input.columnId);

      const multi = ctx.redis.multi();
      multi.del(colKey);
      multi.sRem(`board:${input.boardId}:columns`, input.columnId);
      multi.hSet(`board:${input.boardId}`, { columnOrder: JSON.stringify(newColumnOrder) });
      await multi.exec();

      await publishBoardUpdate(ctx.redis, input.boardId);

      return { message: "Column removed" };
    }),

  reorderColumns: publicProcedure
    .input(
      z.object({
        boardId: boardIdSchema,
        adminToken: z.string().min(1),
        columnOrder: z.array(columnIdSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const board = await getValidBoard(ctx.redis, input.boardId);

      if (!verifyAdminToken(input.adminToken, board.adminToken)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found or invalid admin token" });
      }

      const currentOrder = JSON.parse(board.columnOrder || "[]") as string[];
      const currentSet = new Set(currentOrder);
      const newSet = new Set(input.columnOrder);

      if (currentSet.size !== newSet.size || ![...currentSet].every((id) => newSet.has(id))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Column order must contain the same columns" });
      }

      await ctx.redis.hSet(`board:${input.boardId}`, {
        columnOrder: JSON.stringify(input.columnOrder),
      });

      await publishBoardUpdate(ctx.redis, input.boardId);

      return { columnOrder: input.columnOrder };
    }),

  // Anyone with the link can update cards in 1 or 2 columns atomically
  updateCards: publicProcedure
    .input(
      z.object({
        boardId: boardIdSchema,
        columns: z.array(
          z.object({
            columnId: columnIdSchema,
            encryptedCards: z.string().min(1).max(MAX_ENCRYPTED_CARDS_SIZE),
            expectedVersion: z.number().int(),
          }),
        ).min(1).max(2),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getValidBoard(ctx.redis, input.boardId);

      // Validate all columns exist and versions match
      const colData: Array<{ key: string; col: RedisColumnHash; newVersion: number }> = [];

      for (const update of input.columns) {
        const colKey = `board:${input.boardId}:column:${update.columnId}`;
        const col = (await ctx.redis.hGetAll(colKey)) as unknown as RedisColumnHash;

        if (!col || !col.encryptedMeta) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Column not found" });
        }

        const currentVersion = parseInt(col.version, 10) || 1;
        if (update.expectedVersion !== currentVersion) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Column has been modified. Please refresh and try again.",
          });
        }

        colData.push({ key: colKey, col, newVersion: currentVersion + 1 });
      }

      // Atomically update all columns
      const now = new Date().toISOString();
      const multi = ctx.redis.multi();

      for (let i = 0; i < input.columns.length; i++) {
        multi.hSet(colData[i]!.key, {
          encryptedCards: input.columns[i]!.encryptedCards,
          version: String(colData[i]!.newVersion),
          updatedAt: now,
        });
      }

      await multi.exec();

      await publishBoardUpdate(ctx.redis, input.boardId);

      return { message: "Cards updated" };
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: boardIdSchema,
        adminToken: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const board = await getValidBoard(ctx.redis, input.id);

      if (!verifyAdminToken(input.adminToken, board.adminToken)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found or invalid admin token",
        });
      }

      const columnIds = await ctx.redis.sMembers(`board:${input.id}:columns`);

      const keysToDelete = [
        `board:${input.id}`,
        `board:${input.id}:columns`,
        ...columnIds.map((colId) => `board:${input.id}:column:${colId}`),
      ];

      await ctx.redis.del(keysToDelete);

      return { message: "Board deleted successfully" };
    }),

  subscribe: publicProcedure
    .input(z.object({ id: boardIdSchema }))
    .subscription(async function* (opts) {
      const { ctx, input } = opts;

      // Yield initial state
      yield await fetchFullBoardState(ctx.redis, input.id);

      // Listen for updates via Redis Pub/Sub
      const subscriber = await getRedisSubscriber();
      const channel = `board:channel:${input.id}`;

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

          // Debounce: wait briefly and drain any additional queued messages
          await new Promise((r) => setTimeout(r, 150));
          messageQueue.length = 0;

          if (signal?.aborted) break;

          try {
            yield await fetchFullBoardState(ctx.redis, input.id);
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

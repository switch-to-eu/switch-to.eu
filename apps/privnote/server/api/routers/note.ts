import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const EXPIRY_OPTIONS: Record<string, number> = {
  "5m": 5 * 60,
  "30m": 30 * 60,
  "1h": 60 * 60,
  "24h": 24 * 60 * 60,
  "7d": 7 * 24 * 60 * 60,
};

const NOTE_PREFIX = "privnote:note:";

function generateNoteId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export const noteRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(50_000),
        expiry: z.enum(["5m", "30m", "1h", "24h", "7d"]),
        burnAfterReading: z.boolean().default(true),
        passwordHash: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const noteId = generateNoteId();
      const key = `${NOTE_PREFIX}${noteId}`;
      const ttlSeconds = EXPIRY_OPTIONS[input.expiry]!;
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      await ctx.redis.hSet(key, {
        content: input.content,
        burnAfterReading: input.burnAfterReading ? "1" : "0",
        passwordHash: input.passwordHash ?? "",
        expiresAt,
        createdAt: new Date().toISOString(),
      });

      await ctx.redis.expire(key, ttlSeconds);

      return {
        noteId,
        expiresAt,
        burnAfterReading: input.burnAfterReading,
      };
    }),

  exists: publicProcedure
    .input(
      z.object({
        id: z.string().min(1).max(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const key = `${NOTE_PREFIX}${input.id}`;
      const exists = await ctx.redis.exists(key);

      if (!exists) {
        return { exists: false, hasPassword: false, burnAfterReading: false };
      }

      const [passwordHash, burnAfterReading] = await Promise.all([
        ctx.redis.hGet(key, "passwordHash"),
        ctx.redis.hGet(key, "burnAfterReading"),
      ]);

      return {
        exists: true,
        hasPassword: !!passwordHash && passwordHash.length > 0,
        burnAfterReading: burnAfterReading === "1",
      };
    }),

  read: publicProcedure
    .input(
      z.object({
        id: z.string().min(1).max(20),
        passwordHash: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const key = `${NOTE_PREFIX}${input.id}`;
      const note = await ctx.redis.hGetAll(key);

      if (!note || !note.content) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found. It may have already been read or expired.",
        });
      }

      // Check password if set
      if (note.passwordHash && note.passwordHash.length > 0) {
        if (!input.passwordHash || input.passwordHash !== note.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Incorrect password.",
          });
        }
      }

      const content = note.content;
      const burnAfterReading = note.burnAfterReading === "1";

      // If burn after reading, delete the note immediately
      if (burnAfterReading) {
        await ctx.redis.del(key);
      }

      return {
        content,
        burnAfterReading,
        destroyed: burnAfterReading,
      };
    }),

  health: publicProcedure.query(async ({ ctx }) => {
    const pong = await ctx.redis.ping();
    return { status: "ok", redis: pong };
  }),
});

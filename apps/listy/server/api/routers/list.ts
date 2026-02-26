import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// List presets
export const LIST_PRESETS = ["shopping", "potluck", "todo", "plain"] as const;
export type ListPreset = (typeof LIST_PRESETS)[number];

export const listRouter = createTRPCRouter({
  // Create a new shared list
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(500).optional(),
        preset: z.enum(LIST_PRESETS),
        // Encrypted payload — server never sees plaintext
        encryptedData: z.string(),
      })
    )
    .mutation(async ({ ctx: _ctx, input: _input }) => {
      // TODO: Generate list ID + admin token, store encrypted data in Redis
      return {
        id: "placeholder",
        adminToken: "placeholder",
      };
    }),

  // Get a shared list by ID
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx: _ctx, input: _input }) => {
      // TODO: Fetch encrypted list data from Redis
      return null;
    }),

  // Add an item to the list
  addItem: publicProcedure
    .input(
      z.object({
        listId: z.string(),
        encryptedItem: z.string(),
      })
    )
    .mutation(async ({ ctx: _ctx, input: _input }) => {
      // TODO: Append encrypted item to Redis list
      return { success: true };
    }),

  // Toggle item completion (e.g. check off shopping item)
  toggleItem: publicProcedure
    .input(
      z.object({
        listId: z.string(),
        itemId: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx: _ctx, input: _input }) => {
      // TODO: Update item status in Redis
      return { success: true };
    }),

  // Remove an item
  removeItem: publicProcedure
    .input(
      z.object({
        listId: z.string(),
        itemId: z.string(),
      })
    )
    .mutation(async ({ ctx: _ctx, input: _input }) => {
      // TODO: Remove item from Redis
      return { success: true };
    }),

  // Admin: delete entire list
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
        adminToken: z.string(),
      })
    )
    .mutation(async ({ ctx: _ctx, input: _input }) => {
      // TODO: Verify admin token (HMAC), delete from Redis
      return { success: true };
    }),
});

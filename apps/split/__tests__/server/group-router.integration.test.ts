/**
 * Integration tests using a real Redis container via Testcontainers.
 * These tests verify actual Redis behavior: TTL, key deletion, hGetAll,
 * sMembers, multi/exec transactions, etc.
 *
 * Requires Docker to be running.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { createClient, type RedisClientType } from "redis";
import {
  setupRedisContainer,
  teardownRedisContainer,
  getTestRedisUrl,
} from "@switch-to-eu/db/test-redis";
import { hashAdminToken } from "@switch-to-eu/db/admin";

let redis: RedisClientType;

// Dynamically import the router caller after REDIS_URL is set
let createCaller: Awaited<typeof import("@/server/api/root")>["createCaller"];

beforeAll(async () => {
  await setupRedisContainer();

  // Now that REDIS_URL is set, import the router
  const mod = await import("@/server/api/root");
  createCaller = mod.createCaller;

  // Create a separate client for direct assertions
  redis = createClient({ url: getTestRedisUrl() }) as RedisClientType;
  await redis.connect();
}, 60_000); // container startup can take a while

afterAll(async () => {
  if (redis?.isReady) await redis.quit();
  await teardownRedisContainer();
});

afterEach(async () => {
  // Flush all keys between tests
  await redis.flushAll();
});

function getCaller() {
  return createCaller({ redis, headers: new Headers() });
}

describe("group router (integration — real Redis)", () => {
  describe("create + get round-trip", () => {
    it("stores and retrieves encrypted group data", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "encrypted-group-data",
      });

      expect(created.group.id).toHaveLength(10);
      expect(created.adminToken).toBeDefined();

      // Verify directly in Redis
      const stored = await redis.hGetAll(`group:${created.group.id}`);
      expect(stored.encryptedData).toBe("encrypted-group-data");
      expect(stored.version).toBe("1");
      // Admin token is hashed
      expect(stored.adminToken).toBe(hashAdminToken(created.adminToken));

      // Read through the router
      const read = await caller.group.get({ id: created.group.id });
      expect(read.group.encryptedData).toBe("encrypted-group-data");
      expect(read.expenses).toEqual([]);
    });
  });

  describe("TTL behavior", () => {
    it("sets Redis TTL on group creation", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "ttl-test",
      });

      const ttl = await redis.ttl(`group:${created.group.id}`);
      // Default 90 days + 7 day grace = ~97 days
      const expectedTtl = (90 + 7) * 24 * 60 * 60;
      expect(ttl).toBeGreaterThan(expectedTtl - 60);
      expect(ttl).toBeLessThanOrEqual(expectedTtl);
    });
  });

  describe("expense CRUD", () => {
    it("adds expense and retrieves it with the group", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "group-data",
      });

      const expense = await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "encrypted-expense-data",
      });

      expect(expense.expenseId).toHaveLength(12);
      expect(expense.version).toBe(1);

      // Verify in Redis
      const storedExpense = await redis.hGetAll(
        `group:${created.group.id}:expense:${expense.expenseId}`,
      );
      expect(storedExpense.encryptedExpense).toBe("encrypted-expense-data");

      // Verify expense is in the expenses set
      const expenseIds = await redis.sMembers(
        `group:${created.group.id}:expenses`,
      );
      expect(expenseIds).toContain(expense.expenseId);

      // Retrieve through get
      const read = await caller.group.get({ id: created.group.id });
      expect(read.expenses).toHaveLength(1);
      expect(read.expenses[0]!.encryptedExpense).toBe("encrypted-expense-data");
    });

    it("sets TTL on expense keys matching group expiry", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "group-data",
      });

      const expense = await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "expense-with-ttl",
      });

      const expenseTtl = await redis.ttl(
        `group:${created.group.id}:expense:${expense.expenseId}`,
      );
      const setTtl = await redis.ttl(
        `group:${created.group.id}:expenses`,
      );

      // Both should have TTL close to 97 days (90 expiry + 7 grace)
      const expectedTtl = (90 + 7) * 24 * 60 * 60;
      expect(expenseTtl).toBeGreaterThan(expectedTtl - 60);
      expect(setTtl).toBeGreaterThan(expectedTtl - 60);
    });

    it("deletes expense from Redis completely", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "group-data",
      });

      const expense = await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "to-be-deleted",
      });

      // Confirm expense exists
      const existsBefore = await redis.exists(
        `group:${created.group.id}:expense:${expense.expenseId}`,
      );
      expect(existsBefore).toBe(1);

      await caller.group.deleteExpense({
        id: created.group.id,
        adminToken: created.adminToken,
        expenseId: expense.expenseId,
      });

      // Expense key should be gone
      const existsAfter = await redis.exists(
        `group:${created.group.id}:expense:${expense.expenseId}`,
      );
      expect(existsAfter).toBe(0);

      // Expense should be removed from set
      const expenseIds = await redis.sMembers(
        `group:${created.group.id}:expenses`,
      );
      expect(expenseIds).not.toContain(expense.expenseId);
    });

    it("handles multiple expenses", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "group-data",
      });

      // Add 3 expenses
      await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "expense-1",
      });
      await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "expense-2",
      });
      await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "expense-3",
      });

      const read = await caller.group.get({ id: created.group.id });
      expect(read.expenses).toHaveLength(3);
    });
  });

  describe("admin operations", () => {
    it("updates group data with valid admin token", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "original-data",
      });

      const updated = await caller.group.update({
        id: created.group.id,
        adminToken: created.adminToken,
        encryptedData: "updated-data",
      });

      expect(updated.version).toBe(2);

      // Verify in Redis
      const stored = await redis.hGetAll(`group:${created.group.id}`);
      expect(stored.encryptedData).toBe("updated-data");
      expect(stored.version).toBe("2");
    });

    it("rejects update with wrong admin token", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "group-data",
      });

      await expect(
        caller.group.update({
          id: created.group.id,
          adminToken: "wrong-token",
          encryptedData: "hacked",
        }),
      ).rejects.toThrow();
    });

    it("detects version conflict on update", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "group-data",
      });

      // Update once to bump version to 2
      await caller.group.update({
        id: created.group.id,
        adminToken: created.adminToken,
        encryptedData: "v2",
      });

      // Try to update with stale expectedVersion=1
      await expect(
        caller.group.update({
          id: created.group.id,
          adminToken: created.adminToken,
          encryptedData: "v3-stale",
          expectedVersion: 1,
        }),
      ).rejects.toThrow("modified");
    });

    it("deletes group and all associated keys", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "group-data",
      });

      // Add some expenses
      const exp1 = await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "expense-1",
      });
      const exp2 = await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "expense-2",
      });

      // Delete the group
      await caller.group.delete({
        id: created.group.id,
        adminToken: created.adminToken,
      });

      // All keys should be gone
      const groupExists = await redis.exists(`group:${created.group.id}`);
      const setExists = await redis.exists(`group:${created.group.id}:expenses`);
      const exp1Exists = await redis.exists(
        `group:${created.group.id}:expense:${exp1.expenseId}`,
      );
      const exp2Exists = await redis.exists(
        `group:${created.group.id}:expense:${exp2.expenseId}`,
      );

      expect(groupExists).toBe(0);
      expect(setExists).toBe(0);
      expect(exp1Exists).toBe(0);
      expect(exp2Exists).toBe(0);
    });

    it("rejects delete with wrong admin token", async () => {
      const caller = getCaller();

      const created = await caller.group.create({
        encryptedData: "group-data",
      });

      await expect(
        caller.group.delete({
          id: created.group.id,
          adminToken: "wrong-token",
        }),
      ).rejects.toThrow();

      // Group should still exist
      const exists = await redis.exists(`group:${created.group.id}`);
      expect(exists).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("get throws NOT_FOUND for non-existent group", async () => {
      const caller = getCaller();
      await expect(
        caller.group.get({ id: "ABCDEFGH12" }),
      ).rejects.toThrow("Group not found");
    });

    it("addExpense throws NOT_FOUND for non-existent group", async () => {
      const caller = getCaller();
      await expect(
        caller.group.addExpense({
          id: "ABCDEFGH12",
          encryptedExpense: "expense",
        }),
      ).rejects.toThrow("Group not found");
    });

    it("full lifecycle: create group → add expenses → delete expense → delete group", async () => {
      const caller = getCaller();

      // Create group
      const created = await caller.group.create({
        encryptedData: "lifecycle-test",
      });

      // Add expenses
      const exp1 = await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "dinner",
      });
      const exp2 = await caller.group.addExpense({
        id: created.group.id,
        encryptedExpense: "taxi",
      });

      // Verify both exist
      let read = await caller.group.get({ id: created.group.id });
      expect(read.expenses).toHaveLength(2);

      // Delete one expense
      await caller.group.deleteExpense({
        id: created.group.id,
        adminToken: created.adminToken,
        expenseId: exp1.expenseId,
      });

      // Verify only one remains
      read = await caller.group.get({ id: created.group.id });
      expect(read.expenses).toHaveLength(1);
      expect(read.expenses[0]!.expenseId).toBe(exp2.expenseId);

      // Delete the group
      await caller.group.delete({
        id: created.group.id,
        adminToken: created.adminToken,
      });

      // Verify everything is gone
      await expect(
        caller.group.get({ id: created.group.id }),
      ).rejects.toThrow("Group not found");
    });
  });
});

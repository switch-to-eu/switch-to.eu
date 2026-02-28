import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockRedis } from "@switch-to-eu/db/mock-redis";
import { hashAdminToken } from "@switch-to-eu/db/admin";

// Shared mock instance — reset between tests
const mockRedis = new MockRedis();

// Mock the redis module so getRedis()/getRedisSubscriber() return our mock
vi.mock("@switch-to-eu/db/redis", () => ({
  getRedis: async () => mockRedis,
  getRedisSubscriber: async () => mockRedis,
}));

// Import after mocks are set up
const { createCaller } = await import("@/server/api/root");

function getCaller() {
  return createCaller({ redis: mockRedis as never, headers: new Headers() });
}

/** Seed a group directly in the mock Redis and return the admin token */
async function seedGroup(
  id: string,
  opts: { adminToken?: string; expired?: boolean } = {},
) {
  const adminToken = opts.adminToken ?? "test-admin-token";
  const expiresAt = opts.expired
    ? new Date(Date.now() - 86_400_000).toISOString() // yesterday
    : new Date(Date.now() + 90 * 86_400_000).toISOString(); // +90 days

  await mockRedis.hSet(`group:${id}`, {
    encryptedData: "encrypted-group-data",
    adminToken: hashAdminToken(adminToken),
    createdAt: new Date().toISOString(),
    expiresAt,
    version: "1",
    isDeleted: "false",
  });

  return adminToken;
}

/** Seed an expense for a group */
async function seedExpense(groupId: string, expenseId: string) {
  await mockRedis.hSet(`group:${groupId}:expense:${expenseId}`, {
    encryptedExpense: `encrypted-expense-${expenseId}`,
    version: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await mockRedis.sAdd(`group:${groupId}:expenses`, expenseId);
}

describe("group router", () => {
  beforeEach(() => {
    mockRedis._clear();
  });

  // --- create ---

  describe("create", () => {
    it("creates a group and returns id + encrypted data + admin token", async () => {
      const caller = getCaller();
      const result = await caller.group.create({
        encryptedData: "test-encrypted-data",
      });

      expect(result.group.id).toHaveLength(10);
      expect(result.group.encryptedData).toBe("test-encrypted-data");
      expect(result.group.version).toBe(1);
      expect(result.adminToken).toBeDefined();
      expect(result.adminToken.length).toBeGreaterThan(0);
    });

    it("stores hashed admin token in Redis, not plaintext", async () => {
      const caller = getCaller();
      const result = await caller.group.create({
        encryptedData: "test-data",
      });

      const stored = mockRedis._getHash(`group:${result.group.id}`);
      expect(stored).toBeDefined();
      // Stored token should be a SHA-256 hex hash, not the raw token
      expect(stored!.adminToken).not.toBe(result.adminToken);
      expect(stored!.adminToken).toBe(hashAdminToken(result.adminToken));
    });

    it("uses default 90-day expiry when none provided", async () => {
      const caller = getCaller();
      const before = Date.now();
      const result = await caller.group.create({
        encryptedData: "test-data",
      });

      const expiresAt = new Date(result.group.expiresAt).getTime();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      // Should be roughly 90 days from now (within 5 seconds tolerance)
      expect(expiresAt).toBeGreaterThanOrEqual(before + ninetyDays - 5000);
      expect(expiresAt).toBeLessThanOrEqual(Date.now() + ninetyDays + 5000);
    });
  });

  // --- get ---

  describe("get", () => {
    it("returns group with expenses", async () => {
      await seedGroup("ABCDEFGH12");
      await seedExpense("ABCDEFGH12", "expense001");

      const caller = getCaller();
      const result = await caller.group.get({ id: "ABCDEFGH12" });

      expect(result.group.id).toBe("ABCDEFGH12");
      expect(result.group.encryptedData).toBe("encrypted-group-data");
      expect(result.expenses).toHaveLength(1);
      expect(result.expenses[0]!.expenseId).toBe("expense001");
      expect(result.expenses[0]!.encryptedExpense).toBe("encrypted-expense-expense001");
    });

    it("returns empty expenses for new group", async () => {
      await seedGroup("ABCDEFGH12");

      const caller = getCaller();
      const result = await caller.group.get({ id: "ABCDEFGH12" });

      expect(result.expenses).toEqual([]);
    });

    it("throws NOT_FOUND for non-existent group", async () => {
      const caller = getCaller();
      await expect(
        caller.group.get({ id: "ZZZZZZZZZZ" }),
      ).rejects.toThrow("Group not found");
    });

    it("throws BAD_REQUEST for expired group", async () => {
      await seedGroup("EXPIREDGRP", { expired: true });

      const caller = getCaller();
      await expect(
        caller.group.get({ id: "EXPIREDGRP" }),
      ).rejects.toThrow("Group has expired");
    });
  });

  // --- addExpense ---

  describe("addExpense", () => {
    it("adds an expense to a group", async () => {
      await seedGroup("EXPGROUP01");

      const caller = getCaller();
      const result = await caller.group.addExpense({
        id: "EXPGROUP01",
        encryptedExpense: "encrypted-expense-data",
      });

      expect(result.expenseId).toHaveLength(12);
      expect(result.encryptedExpense).toBe("encrypted-expense-data");
      expect(result.version).toBe(1);

      // Verify stored in Redis
      const expenseHash = mockRedis._getHash(`group:EXPGROUP01:expense:${result.expenseId}`);
      expect(expenseHash).toBeDefined();
      expect(expenseHash!.encryptedExpense).toBe("encrypted-expense-data");

      const expenses = mockRedis._getSet("group:EXPGROUP01:expenses");
      expect(expenses?.has(result.expenseId)).toBe(true);
    });

    it("enforces 1000 expense cap", async () => {
      await seedGroup("CAPGROUP01");
      // Fill up the expenses set to 1000
      const expenseIds = Array.from({ length: 1000 }, (_, i) => `exp${String(i).padStart(4, "0")}`);
      for (const eid of expenseIds) {
        await mockRedis.sAdd("group:CAPGROUP01:expenses", eid);
      }

      const caller = getCaller();
      await expect(
        caller.group.addExpense({
          id: "CAPGROUP01",
          encryptedExpense: "too-many",
        }),
      ).rejects.toThrow("maximum number of expenses");
    });

    it("throws NOT_FOUND for non-existent group", async () => {
      const caller = getCaller();
      await expect(
        caller.group.addExpense({
          id: "ZZZZZZZZZZ",
          encryptedExpense: "data",
        }),
      ).rejects.toThrow("Group not found");
    });
  });

  // --- update ---

  describe("update", () => {
    it("updates group data and increments version", async () => {
      const adminToken = await seedGroup("UPDTGRP001");

      const caller = getCaller();
      const result = await caller.group.update({
        id: "UPDTGRP001",
        adminToken,
        encryptedData: "new-encrypted-data",
      });

      expect(result.encryptedData).toBe("new-encrypted-data");
      expect(result.version).toBe(2);
    });

    it("rejects invalid admin token", async () => {
      await seedGroup("UPDTGRP002");

      const caller = getCaller();
      await expect(
        caller.group.update({
          id: "UPDTGRP002",
          adminToken: "wrong-token",
          encryptedData: "data",
        }),
      ).rejects.toThrow();
    });

    it("rejects version conflict", async () => {
      const adminToken = await seedGroup("UPDTGRP003");

      const caller = getCaller();
      await expect(
        caller.group.update({
          id: "UPDTGRP003",
          adminToken,
          encryptedData: "data",
          expectedVersion: 99, // stale
        }),
      ).rejects.toThrow("modified");
    });
  });

  // --- deleteExpense ---

  describe("deleteExpense", () => {
    it("deletes an expense", async () => {
      const adminToken = await seedGroup("DELEXP0001");
      await seedExpense("DELEXP0001", "expense001");

      const caller = getCaller();
      const result = await caller.group.deleteExpense({
        id: "DELEXP0001",
        adminToken,
        expenseId: "expense001",
      });

      expect(result.message).toContain("deleted");

      // Expense key should be gone
      expect(mockRedis._getHash("group:DELEXP0001:expense:expense001")).toBeUndefined();
    });

    it("rejects invalid admin token", async () => {
      await seedGroup("DELEXP0002");
      await seedExpense("DELEXP0002", "expense001");

      const caller = getCaller();
      await expect(
        caller.group.deleteExpense({
          id: "DELEXP0002",
          adminToken: "wrong-token",
          expenseId: "expense001",
        }),
      ).rejects.toThrow();
    });

    it("throws NOT_FOUND for non-existent expense", async () => {
      const adminToken = await seedGroup("DELEXP0003");

      const caller = getCaller();
      await expect(
        caller.group.deleteExpense({
          id: "DELEXP0003",
          adminToken,
          expenseId: "nonexistent1",
        }),
      ).rejects.toThrow("Expense not found");
    });
  });

  // --- delete ---

  describe("delete", () => {
    it("deletes group and all expense keys", async () => {
      const adminToken = await seedGroup("DELGRP0001");
      await seedExpense("DELGRP0001", "expense001");
      await seedExpense("DELGRP0001", "expense002");

      const caller = getCaller();
      const result = await caller.group.delete({
        id: "DELGRP0001",
        adminToken,
      });

      expect(result.message).toContain("deleted");

      // All keys should be gone
      expect(mockRedis._getHash("group:DELGRP0001")).toBeUndefined();
      expect(mockRedis._getSet("group:DELGRP0001:expenses")).toBeUndefined();
      expect(mockRedis._getHash("group:DELGRP0001:expense:expense001")).toBeUndefined();
      expect(mockRedis._getHash("group:DELGRP0001:expense:expense002")).toBeUndefined();
    });

    it("rejects invalid admin token", async () => {
      await seedGroup("DELGRP0002");

      const caller = getCaller();
      await expect(
        caller.group.delete({
          id: "DELGRP0002",
          adminToken: "wrong-token",
        }),
      ).rejects.toThrow();
    });
  });

  // --- health ---

  describe("health", () => {
    it("returns healthy status", async () => {
      const caller = getCaller();
      const result = await caller.group.health();

      expect(result.status).toBe("healthy");
      expect(result.timestamp).toBeDefined();
    });
  });
});

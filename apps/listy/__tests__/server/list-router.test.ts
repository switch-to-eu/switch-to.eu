import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockRedis } from "@switch-to-eu/db/mock-redis";
import { hashAdminToken } from "@switch-to-eu/db/admin";

// Shared mock instance — reset between tests
const mockRedis = new MockRedis();

// Mock the redis module so getRedis() returns our mock
vi.mock("@switch-to-eu/db/redis", () => ({
  getRedis: async () => mockRedis,
  getRedisSubscriber: async () => mockRedis,
}));

// Import after mocks are set up
const { createCaller } = await import("@/server/api/root");

function getCaller() {
  return createCaller({ redis: mockRedis as never, headers: new Headers() });
}

/** Seed a list directly in the mock Redis and return the admin token */
async function seedList(
  id: string,
  opts: { adminToken?: string; expired?: boolean; preset?: string } = {},
) {
  const adminToken = opts.adminToken ?? "test-admin-token";
  const expiresAt = opts.expired
    ? new Date(Date.now() - 86_400_000).toISOString()
    : new Date(Date.now() + 30 * 86_400_000).toISOString();

  await mockRedis.hSet(`list:${id}`, {
    encryptedData: "encrypted-list-data",
    adminToken: hashAdminToken(adminToken),
    preset: opts.preset ?? "plain",
    createdAt: new Date().toISOString(),
    expiresAt,
    version: "1",
  });

  return adminToken;
}

/** Seed an item for a list */
async function seedItem(listId: string, itemId: string, opts: { completed?: boolean } = {}) {
  const now = new Date().toISOString();
  await mockRedis.hSet(`list:${listId}:item:${itemId}`, {
    encryptedItem: "encrypted-item-data",
    completed: opts.completed ? "true" : "false",
    version: "1",
    createdAt: now,
    updatedAt: now,
  });
  await mockRedis.sAdd(`list:${listId}:items`, itemId);
}

describe("list router", () => {
  beforeEach(() => {
    mockRedis._clear();
  });

  // --- create ---

  describe("create", () => {
    it("creates a list and returns id + admin token", async () => {
      const caller = getCaller();
      const result = await caller.list.create({
        encryptedData: "test-encrypted-data",
        preset: "plain",
      });

      expect(result.list.id).toHaveLength(10);
      expect(result.list.encryptedData).toBe("test-encrypted-data");
      expect(result.list.preset).toBe("plain");
      expect(result.list.version).toBe(1);
      expect(result.adminToken).toBeDefined();
      expect(result.adminToken.length).toBeGreaterThan(0);
    });

    it("stores hashed admin token in Redis, not plaintext", async () => {
      const caller = getCaller();
      const result = await caller.list.create({
        encryptedData: "test-data",
        preset: "shopping",
      });

      const stored = mockRedis._getHash(`list:${result.list.id}`);
      expect(stored).toBeDefined();
      expect(stored!.adminToken).not.toBe(result.adminToken);
      expect(stored!.adminToken).toBe(hashAdminToken(result.adminToken));
    });

    it("stores preset in Redis", async () => {
      const caller = getCaller();
      const result = await caller.list.create({
        encryptedData: "test-data",
        preset: "potluck",
      });

      const stored = mockRedis._getHash(`list:${result.list.id}`);
      expect(stored!.preset).toBe("potluck");
    });

    it("uses default 30-day expiry when none provided", async () => {
      const caller = getCaller();
      const before = Date.now();
      const result = await caller.list.create({
        encryptedData: "test-data",
        preset: "plain",
      });

      const expiresAt = new Date(result.list.expiresAt).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      expect(expiresAt).toBeGreaterThanOrEqual(before + thirtyDays - 5000);
      expect(expiresAt).toBeLessThanOrEqual(Date.now() + thirtyDays + 5000);
    });
  });

  // --- get ---

  describe("get", () => {
    it("returns list with items", async () => {
      await seedList("ABCDEFGH12");
      await seedItem("ABCDEFGH12", "ITEM0001");

      const caller = getCaller();
      const result = await caller.list.get({ id: "ABCDEFGH12" });

      expect(result.list.id).toBe("ABCDEFGH12");
      expect(result.list.encryptedData).toBe("encrypted-list-data");
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.id).toBe("ITEM0001");
      expect(result.items[0]!.encryptedItem).toBe("encrypted-item-data");
    });

    it("throws NOT_FOUND for non-existent list", async () => {
      const caller = getCaller();
      await expect(
        caller.list.get({ id: "ZZZZZZZZZZ" }),
      ).rejects.toThrow("List not found");
    });

    it("throws BAD_REQUEST for expired list", async () => {
      await seedList("EXPIRED123", { expired: true });

      const caller = getCaller();
      await expect(
        caller.list.get({ id: "EXPIRED123" }),
      ).rejects.toThrow("List has expired");
    });
  });

  // --- addItem ---

  describe("addItem", () => {
    it("adds an item to the list", async () => {
      await seedList("ADDITEM001");

      const caller = getCaller();
      const result = await caller.list.addItem({
        listId: "ADDITEM001",
        encryptedItem: "my-encrypted-item",
      });

      expect(result.id).toHaveLength(8);
      expect(result.encryptedItem).toBe("my-encrypted-item");
      expect(result.completed).toBe(false);
      expect(result.version).toBe(1);
    });

    it("enforces 500 item cap", async () => {
      await seedList("CAPLIST001");
      // Fill up items set to 500
      const items = Array.from({ length: 500 }, (_, i) => `item${i}`);
      for (const item of items) {
        await mockRedis.sAdd("list:CAPLIST001:items", item);
      }

      const caller = getCaller();
      await expect(
        caller.list.addItem({
          listId: "CAPLIST001",
          encryptedItem: "one-too-many",
        }),
      ).rejects.toThrow("maximum number of items");
    });
  });

  // --- updateItem ---

  describe("updateItem", () => {
    it("updates item encrypted data", async () => {
      await seedList("UPDITEM001");
      await seedItem("UPDITEM001", "ITEMUPD1");

      const caller = getCaller();
      const result = await caller.list.updateItem({
        listId: "UPDITEM001",
        itemId: "ITEMUPD1",
        encryptedItem: "updated-encrypted-data",
      });

      expect(result.encryptedItem).toBe("updated-encrypted-data");
      expect(result.version).toBe(2);
    });

    it("rejects version conflict", async () => {
      await seedList("UPDITEM002");
      await seedItem("UPDITEM002", "ITEMUPD2");
      // Bump version to 3
      await mockRedis.hSet("list:UPDITEM002:item:ITEMUPD2", { version: "3" });

      const caller = getCaller();
      await expect(
        caller.list.updateItem({
          listId: "UPDITEM002",
          itemId: "ITEMUPD2",
          encryptedItem: "data",
          expectedVersion: 1,
        }),
      ).rejects.toThrow("modified");
    });

    it("throws NOT_FOUND for missing item", async () => {
      await seedList("UPDITEM003");

      const caller = getCaller();
      await expect(
        caller.list.updateItem({
          listId: "UPDITEM003",
          itemId: "NOEXIST1",
          encryptedItem: "data",
        }),
      ).rejects.toThrow("Item not found");
    });
  });

  // --- toggleItem ---

  describe("toggleItem", () => {
    it("toggles item completion", async () => {
      await seedList("TOGLIST001");
      await seedItem("TOGLIST001", "TOGITEM1");

      const caller = getCaller();
      const result = await caller.list.toggleItem({
        listId: "TOGLIST001",
        itemId: "TOGITEM1",
        completed: true,
      });

      expect(result.completed).toBe(true);

      // Verify in Redis
      const stored = mockRedis._getHash("list:TOGLIST001:item:TOGITEM1");
      expect(stored!.completed).toBe("true");
    });

    it("throws NOT_FOUND for missing item", async () => {
      await seedList("TOGLIST002");

      const caller = getCaller();
      await expect(
        caller.list.toggleItem({
          listId: "TOGLIST002",
          itemId: "NOEXIST1",
          completed: true,
        }),
      ).rejects.toThrow("Item not found");
    });
  });

  // --- removeItem ---

  describe("removeItem", () => {
    it("removes an item from the list", async () => {
      await seedList("REMLIST001");
      await seedItem("REMLIST001", "REMITEM1");

      const caller = getCaller();
      const result = await caller.list.removeItem({
        listId: "REMLIST001",
        itemId: "REMITEM1",
      });

      expect(result.message).toContain("removed");

      // Verify deleted from Redis
      expect(mockRedis._getHash("list:REMLIST001:item:REMITEM1")).toBeUndefined();
      const itemSet = mockRedis._getSet("list:REMLIST001:items");
      expect(itemSet?.has("REMITEM1")).toBeFalsy();
    });
  });

  // --- delete ---

  describe("delete", () => {
    it("deletes list and all item keys", async () => {
      const adminToken = await seedList("DELLIST001");
      await seedItem("DELLIST001", "DELITEM1");
      await seedItem("DELLIST001", "DELITEM2");

      const caller = getCaller();
      const result = await caller.list.delete({
        id: "DELLIST001",
        adminToken,
      });

      expect(result.message).toContain("deleted");

      // All keys should be gone
      expect(mockRedis._getHash("list:DELLIST001")).toBeUndefined();
      expect(mockRedis._getSet("list:DELLIST001:items")).toBeUndefined();
      expect(mockRedis._getHash("list:DELLIST001:item:DELITEM1")).toBeUndefined();
      expect(mockRedis._getHash("list:DELLIST001:item:DELITEM2")).toBeUndefined();
    });

    it("rejects invalid admin token", async () => {
      await seedList("DELLIST002");

      const caller = getCaller();
      await expect(
        caller.list.delete({
          id: "DELLIST002",
          adminToken: "wrong-token",
        }),
      ).rejects.toThrow("invalid admin token");
    });
  });
});

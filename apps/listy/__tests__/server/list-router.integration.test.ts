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
import {
  generateEncryptionKey,
  encryptData,
  decryptData,
} from "@switch-to-eu/db/crypto";
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

describe("list router (integration — real Redis)", () => {
  describe("create + get round-trip", () => {
    it("stores and retrieves encrypted list data", async () => {
      const caller = getCaller();
      const key = await generateEncryptionKey();
      const originalData = JSON.stringify({ title: "My Shopping List", description: "Weekly groceries" });
      const encrypted = await encryptData(originalData, key);

      const created = await caller.list.create({
        encryptedData: encrypted,
        preset: "shopping",
      });

      expect(created.list.id).toHaveLength(10);
      expect(created.adminToken).toBeDefined();

      // Verify directly in Redis
      const stored = await redis.hGetAll(`list:${created.list.id}`);
      expect(stored.encryptedData).toBe(encrypted);
      expect(stored.preset).toBe("shopping");
      expect(stored.version).toBe("1");
      // Admin token is hashed
      expect(stored.adminToken).toBe(hashAdminToken(created.adminToken));

      // Read through the router and decrypt
      const read = await caller.list.get({ id: created.list.id });
      const decrypted = JSON.parse(
        await decryptData<string>(read.list.encryptedData, key),
      );
      expect(decrypted.title).toBe("My Shopping List");
      expect(decrypted.description).toBe("Weekly groceries");
    });

    it("returns empty items array for new list", async () => {
      const caller = getCaller();
      const created = await caller.list.create({
        encryptedData: "encrypted-data",
        preset: "plain",
      });

      const read = await caller.list.get({ id: created.list.id });
      expect(read.items).toEqual([]);
    });
  });

  describe("TTL behavior", () => {
    it("sets Redis TTL on list creation", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "ttl-test",
        preset: "plain",
        expirationDays: 7,
      });

      const ttl = await redis.ttl(`list:${created.list.id}`);
      // calculateTTLSeconds adds a 7-day grace period, so Redis TTL = expiry + 7 days
      const expectedTtl = (7 + 7) * 24 * 60 * 60;
      expect(ttl).toBeGreaterThan(expectedTtl - 10);
      expect(ttl).toBeLessThanOrEqual(expectedTtl);
    });

    it("uses default 30-day expiry", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "default-ttl",
        preset: "plain",
      });

      const ttl = await redis.ttl(`list:${created.list.id}`);
      // calculateTTLSeconds adds a 7-day grace period, so Redis TTL ≈ 37 days
      // Use wide margin (2h) to account for DST transitions where setDate() adds calendar days
      const expectedTtl = (30 + 7) * 24 * 60 * 60;
      expect(ttl).toBeGreaterThan(expectedTtl - 7200);
      expect(ttl).toBeLessThanOrEqual(expectedTtl);
    });
  });

  describe("items CRUD", () => {
    it("adds item and retrieves it with the list", async () => {
      const caller = getCaller();
      const key = await generateEncryptionKey();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "shopping",
      });

      const itemText = JSON.stringify({ text: "Milk", category: "dairy" });
      const encryptedItem = await encryptData(itemText, key);

      const item = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem,
      });

      expect(item.id).toHaveLength(8);
      expect(item.completed).toBe(false);
      expect(item.version).toBe(1);

      // Verify in Redis
      const storedItem = await redis.hGetAll(`list:${created.list.id}:item:${item.id}`);
      expect(storedItem.encryptedItem).toBe(encryptedItem);
      expect(storedItem.completed).toBe("false");

      // Verify item is in the items set
      const itemIds = await redis.sMembers(`list:${created.list.id}:items`);
      expect(itemIds).toContain(item.id);

      // Retrieve through get and decrypt
      const read = await caller.list.get({ id: created.list.id });
      expect(read.items).toHaveLength(1);
      const decryptedItem = JSON.parse(
        await decryptData<string>(read.items[0]!.encryptedItem, key),
      );
      expect(decryptedItem.text).toBe("Milk");
    });

    it("toggles item completion in real Redis", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "plain",
      });

      const item = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "encrypted-item",
      });

      // Toggle to completed
      const toggled = await caller.list.toggleItem({
        listId: created.list.id,
        itemId: item.id,
        completed: true,
      });
      expect(toggled.completed).toBe(true);

      // Verify in Redis
      const stored = await redis.hGetAll(`list:${created.list.id}:item:${item.id}`);
      expect(stored.completed).toBe("true");

      // Toggle back
      const untoggled = await caller.list.toggleItem({
        listId: created.list.id,
        itemId: item.id,
        completed: false,
      });
      expect(untoggled.completed).toBe(false);
    });

    it("updates item and bumps version", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "plain",
      });

      const item = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "original-encrypted",
      });

      const updated = await caller.list.updateItem({
        listId: created.list.id,
        itemId: item.id,
        encryptedItem: "updated-encrypted",
      });

      expect(updated.encryptedItem).toBe("updated-encrypted");
      expect(updated.version).toBe(2);

      // Verify persisted
      const stored = await redis.hGetAll(`list:${created.list.id}:item:${item.id}`);
      expect(stored.encryptedItem).toBe("updated-encrypted");
      expect(stored.version).toBe("2");
    });

    it("rejects version conflict on update", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "plain",
      });

      const item = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "original",
      });

      // Update once to bump version to 2
      await caller.list.updateItem({
        listId: created.list.id,
        itemId: item.id,
        encryptedItem: "v2",
      });

      // Try to update with stale expectedVersion=1
      await expect(
        caller.list.updateItem({
          listId: created.list.id,
          itemId: item.id,
          encryptedItem: "v3-stale",
          expectedVersion: 1,
        }),
      ).rejects.toThrow("modified");
    });

    it("removes item from Redis completely", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "plain",
      });

      const item = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "to-be-removed",
      });

      // Confirm item exists
      const existsBefore = await redis.exists(`list:${created.list.id}:item:${item.id}`);
      expect(existsBefore).toBe(1);

      await caller.list.removeItem({
        listId: created.list.id,
        itemId: item.id,
      });

      // Item key should be gone
      const existsAfter = await redis.exists(`list:${created.list.id}:item:${item.id}`);
      expect(existsAfter).toBe(0);

      // Item should be removed from set
      const itemIds = await redis.sMembers(`list:${created.list.id}:items`);
      expect(itemIds).not.toContain(item.id);
    });

    it("sets TTL on item keys matching list expiry", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "plain",
        expirationDays: 7,
      });

      const item = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "item-with-ttl",
      });

      const itemTtl = await redis.ttl(`list:${created.list.id}:item:${item.id}`);
      const setTtl = await redis.ttl(`list:${created.list.id}:items`);
      // calculateTTLSeconds adds a 7-day grace period
      const expectedTtl = (7 + 7) * 24 * 60 * 60;

      // Both item key and items set should have TTL close to 14 days (7 expiry + 7 grace)
      expect(itemTtl).toBeGreaterThan(expectedTtl - 60);
      expect(setTtl).toBeGreaterThan(expectedTtl - 60);
    });
  });

  describe("admin operations", () => {
    it("updates list data with valid admin token", async () => {
      const caller = getCaller();
      const key = await generateEncryptionKey();

      const originalData = await encryptData("original title", key);
      const created = await caller.list.create({
        encryptedData: originalData,
        preset: "potluck",
      });

      const newData = await encryptData("updated title", key);
      const updated = await caller.list.updateList({
        id: created.list.id,
        adminToken: created.adminToken,
        encryptedData: newData,
      });

      expect(updated.version).toBe(2);
      expect(updated.preset).toBe("potluck"); // preserved

      // Verify in Redis
      const stored = await redis.hGetAll(`list:${created.list.id}`);
      expect(stored.encryptedData).toBe(newData);
      expect(stored.version).toBe("2");
    });

    it("rejects update with wrong admin token", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "plain",
      });

      await expect(
        caller.list.updateList({
          id: created.list.id,
          adminToken: "wrong-token",
          encryptedData: "hacked",
        }),
      ).rejects.toThrow();
    });

    it("deletes list and all associated keys", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "shopping",
      });

      // Add some items
      const item1 = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "item-1",
      });
      const item2 = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "item-2",
      });

      // Delete the list
      await caller.list.delete({
        id: created.list.id,
        adminToken: created.adminToken,
      });

      // All keys should be gone
      const listExists = await redis.exists(`list:${created.list.id}`);
      const setExists = await redis.exists(`list:${created.list.id}:items`);
      const item1Exists = await redis.exists(`list:${created.list.id}:item:${item1.id}`);
      const item2Exists = await redis.exists(`list:${created.list.id}:item:${item2.id}`);

      expect(listExists).toBe(0);
      expect(setExists).toBe(0);
      expect(item1Exists).toBe(0);
      expect(item2Exists).toBe(0);
    });

    it("rejects delete with wrong admin token", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "plain",
      });

      await expect(
        caller.list.delete({
          id: created.list.id,
          adminToken: "wrong-token",
        }),
      ).rejects.toThrow();

      // List should still exist
      const exists = await redis.exists(`list:${created.list.id}`);
      expect(exists).toBe(1);
    });
  });

  describe("encryption round-trip", () => {
    it("full lifecycle: create list → add items → toggle → get → decrypt", async () => {
      const caller = getCaller();
      const key = await generateEncryptionKey();

      // Create encrypted list
      const listData = JSON.stringify({ title: "Boodschappen", description: "Week 5" });
      const encryptedList = await encryptData(listData, key);

      const created = await caller.list.create({
        encryptedData: encryptedList,
        preset: "shopping",
      });

      // Add encrypted items
      const items = ["Melk", "Brood", "Kaas"];
      const itemIds: string[] = [];
      for (const text of items) {
        const encItem = await encryptData(JSON.stringify({ text }), key);
        const added = await caller.list.addItem({
          listId: created.list.id,
          encryptedItem: encItem,
        });
        itemIds.push(added.id);
      }

      // Toggle second item as completed
      await caller.list.toggleItem({
        listId: created.list.id,
        itemId: itemIds[1]!,
        completed: true,
      });

      // Fetch full list state
      const read = await caller.list.get({ id: created.list.id });

      // Decrypt list data
      const decryptedList = JSON.parse(
        await decryptData<string>(read.list.encryptedData, key),
      );
      expect(decryptedList.title).toBe("Boodschappen");

      // Decrypt and verify items
      expect(read.items).toHaveLength(3);
      const decryptedItems = await Promise.all(
        read.items.map(async (item) => ({
          ...item,
          data: JSON.parse(await decryptData<string>(item.encryptedItem, key)),
        })),
      );

      const broodItem = decryptedItems.find((i) => i.data.text === "Brood");
      expect(broodItem?.completed).toBe(true);

      const melkItem = decryptedItems.find((i) => i.data.text === "Melk");
      expect(melkItem?.completed).toBe(false);
    });

    it("wrong key fails to decrypt", async () => {
      const caller = getCaller();
      const correctKey = await generateEncryptionKey();
      const wrongKey = await generateEncryptionKey();

      const encrypted = await encryptData("secret list", correctKey);
      const created = await caller.list.create({
        encryptedData: encrypted,
        preset: "plain",
      });

      const read = await caller.list.get({ id: created.list.id });

      await expect(
        decryptData<string>(read.list.encryptedData, wrongKey),
      ).rejects.toThrow("Failed to decrypt data");
    });
  });

  describe("edge cases", () => {
    it("get throws NOT_FOUND for non-existent list", async () => {
      const caller = getCaller();
      await expect(
        caller.list.get({ id: "ABCDEFGH12" }),
      ).rejects.toThrow("List not found");
    });

    it("addItem throws NOT_FOUND for non-existent list", async () => {
      const caller = getCaller();
      await expect(
        caller.list.addItem({
          listId: "ABCDEFGH12",
          encryptedItem: "item",
        }),
      ).rejects.toThrow("List not found");
    });

    it("multiple items maintain sort order by createdAt", async () => {
      const caller = getCaller();

      const created = await caller.list.create({
        encryptedData: "list-data",
        preset: "plain",
      });

      // Add items sequentially with slight delay to ensure different timestamps
      const item1 = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "first-item",
      });
      const item2 = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "second-item",
      });
      const item3 = await caller.list.addItem({
        listId: created.list.id,
        encryptedItem: "third-item",
      });

      const read = await caller.list.get({ id: created.list.id });
      expect(read.items).toHaveLength(3);
      // Items should be sorted oldest first
      expect(read.items[0]!.id).toBe(item1.id);
      expect(read.items[1]!.id).toBe(item2.id);
      expect(read.items[2]!.id).toBe(item3.id);
    });
  });
});

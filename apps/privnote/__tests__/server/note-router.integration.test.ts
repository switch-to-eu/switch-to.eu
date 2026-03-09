/**
 * Integration tests using a real Redis container via Testcontainers.
 * These tests verify actual Redis behavior: TTL, key deletion, hGetAll, etc.
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

describe("note router (integration — real Redis)", () => {
  describe("create + read round-trip", () => {
    it("stores and retrieves encrypted content", async () => {
      const caller = getCaller();
      const key = await generateEncryptionKey();
      const originalContent = "Integration test secret!";
      const encrypted = await encryptData(originalContent, key);

      const created = await caller.note.create({
        encryptedContent: encrypted,
        expiry: "1h",
        burnAfterReading: false,
      });

      expect(created.noteId).toBeDefined();

      // Verify directly in Redis
      const stored = await redis.hGetAll(`privnote:note:${created.noteId}`);
      expect(stored.encryptedContent).toBe(encrypted);
      expect(stored.burnAfterReading).toBe("0");

      // Read through the router and decrypt
      const read = await caller.note.read({ id: created.noteId });
      const decrypted = await decryptData<string>(read.encryptedContent, key);
      expect(decrypted).toBe(originalContent);
    });

    it("burn-after-reading deletes the key from Redis", async () => {
      const caller = getCaller();
      const key = await generateEncryptionKey();
      const encrypted = await encryptData("burn me", key);

      const created = await caller.note.create({
        encryptedContent: encrypted,
        expiry: "24h",
        burnAfterReading: true,
      });

      // Key exists before read
      const existsBefore = await redis.exists(
        `privnote:note:${created.noteId}`,
      );
      expect(existsBefore).toBe(1);

      // Read the note
      const read = await caller.note.read({ id: created.noteId });
      expect(read.destroyed).toBe(true);

      // Key is gone after read
      const existsAfter = await redis.exists(
        `privnote:note:${created.noteId}`,
      );
      expect(existsAfter).toBe(0);

      // Verify content was correct
      const decrypted = await decryptData<string>(read.encryptedContent, key);
      expect(decrypted).toBe("burn me");
    });
  });

  describe("TTL behavior", () => {
    it("sets Redis TTL on note creation", async () => {
      const caller = getCaller();

      const created = await caller.note.create({
        encryptedContent: "ttl-test",
        expiry: "5m",
        burnAfterReading: false,
      });

      const ttl = await redis.ttl(`privnote:note:${created.noteId}`);
      // 5 minutes = 300 seconds, allow some margin
      expect(ttl).toBeGreaterThan(290);
      expect(ttl).toBeLessThanOrEqual(300);
    });
  });

  describe("password protection", () => {
    it("rejects read without password", async () => {
      const caller = getCaller();

      const created = await caller.note.create({
        encryptedContent: "locked-content",
        expiry: "1h",
        passwordHash: "sha256hash",
      });

      await expect(
        caller.note.read({ id: created.noteId }),
      ).rejects.toThrow();
    });

    it("rejects read with wrong password", async () => {
      const caller = getCaller();

      const created = await caller.note.create({
        encryptedContent: "locked-content",
        expiry: "1h",
        passwordHash: "correcthash",
      });

      await expect(
        caller.note.read({ id: created.noteId, passwordHash: "wronghash" }),
      ).rejects.toThrow();
    });

    it("allows read with correct password", async () => {
      const caller = getCaller();

      const created = await caller.note.create({
        encryptedContent: "locked-content",
        expiry: "1h",
        passwordHash: "correcthash",
      });

      const read = await caller.note.read({
        id: created.noteId,
        passwordHash: "correcthash",
      });
      expect(read.encryptedContent).toBe("locked-content");
    });
  });

  describe("exists", () => {
    it("returns false for non-existent note", async () => {
      const caller = getCaller();
      const result = await caller.note.exists({ id: "doesnotexist" });
      expect(result.exists).toBe(false);
    });

    it("returns true with correct flags for existing note", async () => {
      const caller = getCaller();

      const created = await caller.note.create({
        encryptedContent: "exists-test",
        expiry: "1h",
        burnAfterReading: true,
        passwordHash: "hashval",
      });

      const result = await caller.note.exists({ id: created.noteId });
      expect(result.exists).toBe(true);
      expect(result.hasPassword).toBe(true);
      expect(result.burnAfterReading).toBe(true);
    });
  });

  describe("health", () => {
    it("pings real Redis successfully", async () => {
      const caller = getCaller();
      const result = await caller.note.health();
      expect(result.status).toBe("ok");
      expect(result.redis).toBe("PONG");
    });
  });
});

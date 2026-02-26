import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockRedis } from "../helpers/mock-redis";
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

/** Seed a poll directly in the mock Redis and return the admin token */
async function seedPoll(
  id: string,
  opts: { adminToken?: string; expired?: boolean; deleted?: boolean } = {},
) {
  const adminToken = opts.adminToken ?? "test-admin-token";
  const expiresAt = opts.expired
    ? new Date(Date.now() - 86_400_000).toISOString() // yesterday
    : new Date(Date.now() + 30 * 86_400_000).toISOString(); // +30 days

  await mockRedis.hSet(`poll:${id}`, {
    encryptedData: "encrypted-poll-data",
    adminToken: hashAdminToken(adminToken),
    createdAt: new Date().toISOString(),
    expiresAt,
    version: "1",
    isDeleted: opts.deleted ? "true" : "false",
  });

  return adminToken;
}

describe("poll router", () => {
  beforeEach(() => {
    mockRedis._clear();
  });

  // --- create ---

  describe("create", () => {
    it("creates a poll and returns id + encrypted data + admin token", async () => {
      const caller = getCaller();
      const result = await caller.poll.create({
        encryptedData: "test-encrypted-data",
      });

      expect(result.poll.id).toHaveLength(10);
      expect(result.poll.encryptedData).toBe("test-encrypted-data");
      expect(result.poll.version).toBe(1);
      expect(result.adminToken).toBeDefined();
      expect(result.adminToken.length).toBeGreaterThan(0);
    });

    it("stores hashed admin token in Redis, not plaintext", async () => {
      const caller = getCaller();
      const result = await caller.poll.create({
        encryptedData: "test-data",
      });

      const stored = mockRedis._getHash(`poll:${result.poll.id}`);
      expect(stored).toBeDefined();
      // Stored token should be a SHA-256 hex hash, not the raw token
      expect(stored!.adminToken).not.toBe(result.adminToken);
      expect(stored!.adminToken).toBe(hashAdminToken(result.adminToken));
    });

    it("uses default 30-day expiry when none provided", async () => {
      const caller = getCaller();
      const before = Date.now();
      const result = await caller.poll.create({
        encryptedData: "test-data",
      });

      const expiresAt = new Date(result.poll.expiresAt).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      // Should be roughly 30 days from now (within 5 seconds tolerance)
      expect(expiresAt).toBeGreaterThanOrEqual(before + thirtyDays - 5000);
      expect(expiresAt).toBeLessThanOrEqual(Date.now() + thirtyDays + 5000);
    });
  });

  // --- get ---

  describe("get", () => {
    it("returns poll with votes", async () => {
      await seedPoll("ABCDEFGH12");
      // Seed a vote
      await mockRedis.hSet("poll:ABCDEFGH12:vote:user1", {
        encryptedVote: "vote-data",
        version: "1",
        updatedAt: new Date().toISOString(),
      });
      await mockRedis.sAdd("poll:ABCDEFGH12:votes", "user1");

      const caller = getCaller();
      const result = await caller.poll.get({ id: "ABCDEFGH12" });

      expect(result.poll.id).toBe("ABCDEFGH12");
      expect(result.poll.encryptedData).toBe("encrypted-poll-data");
      expect(result.votes).toHaveLength(1);
      expect(result.votes[0]!.participantId).toBe("user1");
      expect(result.votes[0]!.encryptedVote).toBe("vote-data");
    });

    it("throws NOT_FOUND for non-existent poll", async () => {
      const caller = getCaller();
      await expect(
        caller.poll.get({ id: "ZZZZZZZZZZ" }),
      ).rejects.toThrow("Poll not found");
    });

    it("throws BAD_REQUEST for expired poll", async () => {
      await seedPoll("EXPIRED123", { expired: true });

      const caller = getCaller();
      await expect(
        caller.poll.get({ id: "EXPIRED123" }),
      ).rejects.toThrow("Poll has expired");
    });
  });

  // --- vote ---

  describe("vote", () => {
    it("creates a new vote", async () => {
      await seedPoll("VOTEPOLL01");

      const caller = getCaller();
      const result = await caller.poll.vote({
        id: "VOTEPOLL01",
        participantId: "user1",
        encryptedVote: "my-vote-data",
      });

      expect(result.participantId).toBe("user1");
      expect(result.encryptedVote).toBe("my-vote-data");
      expect(result.version).toBe(1);

      // Verify stored in Redis
      const voteHash = mockRedis._getHash("poll:VOTEPOLL01:vote:user1");
      expect(voteHash).toBeDefined();
      expect(voteHash!.encryptedVote).toBe("my-vote-data");

      const participants = mockRedis._getSet("poll:VOTEPOLL01:votes");
      expect(participants?.has("user1")).toBe(true);
    });

    it("updates existing vote and increments version", async () => {
      await seedPoll("VOTEPOLL02");
      // Seed initial vote
      await mockRedis.hSet("poll:VOTEPOLL02:vote:user1", {
        encryptedVote: "old-vote",
        version: "1",
        updatedAt: new Date().toISOString(),
      });
      await mockRedis.sAdd("poll:VOTEPOLL02:votes", "user1");

      const caller = getCaller();
      const result = await caller.poll.vote({
        id: "VOTEPOLL02",
        participantId: "user1",
        encryptedVote: "updated-vote",
      });

      expect(result.version).toBe(2);
      expect(result.encryptedVote).toBe("updated-vote");
    });

    it("enforces 500 participant cap", async () => {
      await seedPoll("CAPPOLL001");
      // Fill up the participants set to 500
      const members = Array.from({ length: 500 }, (_, i) => `user${i}`);
      for (const m of members) {
        await mockRedis.sAdd("poll:CAPPOLL001:votes", m);
      }

      const caller = getCaller();
      await expect(
        caller.poll.vote({
          id: "CAPPOLL001",
          participantId: "user501",
          encryptedVote: "vote-data",
        }),
      ).rejects.toThrow("maximum number of participants");
    });

    it("rejects version conflict", async () => {
      await seedPoll("VOTEPOLL03");
      await mockRedis.hSet("poll:VOTEPOLL03:vote:user1", {
        encryptedVote: "old-vote",
        version: "2",
        updatedAt: new Date().toISOString(),
      });
      await mockRedis.sAdd("poll:VOTEPOLL03:votes", "user1");

      const caller = getCaller();
      await expect(
        caller.poll.vote({
          id: "VOTEPOLL03",
          participantId: "user1",
          encryptedVote: "new-vote",
          expectedVersion: 1, // stale — actual is 2
        }),
      ).rejects.toThrow("modified");
    });
  });

  // --- update ---

  describe("update", () => {
    it("updates poll data and increments version", async () => {
      const adminToken = await seedPoll("UPDTPOLL01");

      const caller = getCaller();
      const result = await caller.poll.update({
        id: "UPDTPOLL01",
        adminToken,
        encryptedData: "new-encrypted-data",
      });

      expect(result.encryptedData).toBe("new-encrypted-data");
      expect(result.version).toBe(2);
    });

    it("rejects invalid admin token", async () => {
      await seedPoll("UPDTPOLL02");

      const caller = getCaller();
      await expect(
        caller.poll.update({
          id: "UPDTPOLL02",
          adminToken: "wrong-token",
          encryptedData: "data",
        }),
      ).rejects.toThrow("invalid admin token");
    });

    it("rejects version conflict", async () => {
      const adminToken = await seedPoll("UPDTPOLL03");

      const caller = getCaller();
      await expect(
        caller.poll.update({
          id: "UPDTPOLL03",
          adminToken,
          encryptedData: "data",
          expectedVersion: 99, // stale
        }),
      ).rejects.toThrow("modified");
    });
  });

  // --- delete ---

  describe("delete", () => {
    it("deletes poll and all vote keys", async () => {
      const adminToken = await seedPoll("DELPOLL001");
      // Add some votes
      await mockRedis.sAdd("poll:DELPOLL001:votes", "user1");
      await mockRedis.sAdd("poll:DELPOLL001:votes", "user2");
      await mockRedis.hSet("poll:DELPOLL001:vote:user1", {
        encryptedVote: "v1",
        version: "1",
        updatedAt: new Date().toISOString(),
      });
      await mockRedis.hSet("poll:DELPOLL001:vote:user2", {
        encryptedVote: "v2",
        version: "1",
        updatedAt: new Date().toISOString(),
      });

      const caller = getCaller();
      const result = await caller.poll.delete({
        id: "DELPOLL001",
        adminToken,
      });

      expect(result.message).toContain("deleted");

      // All keys should be gone
      expect(mockRedis._getHash("poll:DELPOLL001")).toBeUndefined();
      expect(mockRedis._getSet("poll:DELPOLL001:votes")).toBeUndefined();
      expect(mockRedis._getHash("poll:DELPOLL001:vote:user1")).toBeUndefined();
      expect(mockRedis._getHash("poll:DELPOLL001:vote:user2")).toBeUndefined();
    });

    it("rejects invalid admin token", async () => {
      await seedPoll("DELPOLL002");

      const caller = getCaller();
      await expect(
        caller.poll.delete({
          id: "DELPOLL002",
          adminToken: "wrong-token",
        }),
      ).rejects.toThrow("invalid admin token");
    });
  });

  // --- extend ---

  describe("extend", () => {
    it("extends poll expiry", async () => {
      const adminToken = await seedPoll("EXTPOLL001");
      await mockRedis.sAdd("poll:EXTPOLL001:votes", "user1");
      await mockRedis.hSet("poll:EXTPOLL001:vote:user1", {
        encryptedVote: "v1",
        version: "1",
        updatedAt: new Date().toISOString(),
      });

      const caller = getCaller();
      const result = await caller.poll.extend({
        id: "EXTPOLL001",
        adminToken,
        days: 30,
      });

      expect(result.id).toBe("EXTPOLL001");
      expect(result.message).toContain("30 days");

      // Verify the new expiry is ~30 days from now
      const newExpiry = new Date(result.expiresAt).getTime();
      const expected = Date.now() + 30 * 86_400_000;
      expect(newExpiry).toBeGreaterThan(expected - 5000);
      expect(newExpiry).toBeLessThan(expected + 5000);
    });
  });
});

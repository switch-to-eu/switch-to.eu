import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockRedis } from "@switch-to-eu/db/mock-redis";
import {
  generateEncryptionKey,
  encryptData,
  decryptData,
} from "@switch-to-eu/db/crypto";

// Shared mock instance — reset between tests
const mockRedis = new MockRedis();

// Mock the redis module so getRedis() returns our mock
vi.mock("@switch-to-eu/db/redis", () => ({
  getRedis: async () => mockRedis,
}));

// Import after mocks are set up
const { createCaller } = await import("@/server/api/root");

function getCaller() {
  return createCaller({ redis: mockRedis as never, headers: new Headers() });
}

/** Seed a note directly in the mock Redis */
async function seedNote(
  id: string,
  opts: {
    encryptedContent?: string;
    burnAfterReading?: boolean;
    passwordHash?: string;
  } = {},
) {
  await mockRedis.hSet(`privnote:note:${id}`, {
    encryptedContent: opts.encryptedContent ?? "encrypted-test-data",
    burnAfterReading: (opts.burnAfterReading ?? true) ? "1" : "0",
    passwordHash: opts.passwordHash ?? "",
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    createdAt: new Date().toISOString(),
  });
}

describe("note router", () => {
  beforeEach(() => {
    mockRedis._clear();
  });

  // --- create ---

  describe("create", () => {
    it("creates a note and returns id + metadata", async () => {
      const caller = getCaller();
      const result = await caller.note.create({
        encryptedContent: "test-encrypted-data",
        expiry: "24h",
        burnAfterReading: true,
      });

      expect(result.noteId).toBeDefined();
      expect(result.noteId.length).toBeGreaterThan(0);
      expect(result.expiresAt).toBeDefined();
      expect(result.burnAfterReading).toBe(true);
    });

    it("stores encrypted content in Redis", async () => {
      const caller = getCaller();
      const result = await caller.note.create({
        encryptedContent: "my-encrypted-blob",
        expiry: "1h",
      });

      const stored = mockRedis._getHash(`privnote:note:${result.noteId}`);
      expect(stored).toBeDefined();
      expect(stored!.encryptedContent).toBe("my-encrypted-blob");
    });

    it("stores password hash when provided", async () => {
      const caller = getCaller();
      const result = await caller.note.create({
        encryptedContent: "test-data",
        expiry: "24h",
        passwordHash: "abc123hash",
      });

      const stored = mockRedis._getHash(`privnote:note:${result.noteId}`);
      expect(stored!.passwordHash).toBe("abc123hash");
    });

    it("defaults burnAfterReading to true", async () => {
      const caller = getCaller();
      const result = await caller.note.create({
        encryptedContent: "test-data",
        expiry: "24h",
      });

      expect(result.burnAfterReading).toBe(true);
      const stored = mockRedis._getHash(`privnote:note:${result.noteId}`);
      expect(stored!.burnAfterReading).toBe("1");
    });
  });

  // --- exists ---

  describe("exists", () => {
    it("returns exists: false for non-existent note", async () => {
      const caller = getCaller();
      const result = await caller.note.exists({ id: "nonexistent" });

      expect(result.exists).toBe(false);
      expect(result.hasPassword).toBe(false);
      expect(result.burnAfterReading).toBe(false);
    });

    it("returns exists: true with correct flags", async () => {
      await seedNote("test123", {
        burnAfterReading: true,
        passwordHash: "somehash",
      });

      const caller = getCaller();
      const result = await caller.note.exists({ id: "test123" });

      expect(result.exists).toBe(true);
      expect(result.hasPassword).toBe(true);
      expect(result.burnAfterReading).toBe(true);
    });

    it("returns hasPassword false when no password set", async () => {
      await seedNote("nopass", { passwordHash: "" });

      const caller = getCaller();
      const result = await caller.note.exists({ id: "nopass" });

      expect(result.exists).toBe(true);
      expect(result.hasPassword).toBe(false);
    });
  });

  // --- read ---

  describe("read", () => {
    it("returns encrypted content and deletes if burn-after-reading", async () => {
      await seedNote("burnme", {
        encryptedContent: "secret-encrypted",
        burnAfterReading: true,
      });

      const caller = getCaller();
      const result = await caller.note.read({ id: "burnme" });

      expect(result.encryptedContent).toBe("secret-encrypted");
      expect(result.destroyed).toBe(true);

      // Note should be deleted
      const stored = mockRedis._getHash("privnote:note:burnme");
      expect(stored).toBeUndefined();
    });

    it("returns content but does not delete when burn-after-reading is false", async () => {
      await seedNote("keepme", {
        encryptedContent: "persistent-data",
        burnAfterReading: false,
      });

      const caller = getCaller();
      const result = await caller.note.read({ id: "keepme" });

      expect(result.encryptedContent).toBe("persistent-data");
      expect(result.destroyed).toBe(false);

      // Note should still exist
      const stored = mockRedis._getHash("privnote:note:keepme");
      expect(stored).toBeDefined();
    });

    it("throws NOT_FOUND for non-existent note", async () => {
      const caller = getCaller();

      await expect(
        caller.note.read({ id: "ghost" }),
      ).rejects.toThrow();
    });

    it("throws UNAUTHORIZED for wrong password", async () => {
      await seedNote("locked", {
        passwordHash: "correcthash",
      });

      const caller = getCaller();

      await expect(
        caller.note.read({ id: "locked", passwordHash: "wronghash" }),
      ).rejects.toThrow();
    });

    it("returns content with correct password", async () => {
      await seedNote("locked2", {
        encryptedContent: "secret-stuff",
        passwordHash: "correcthash",
      });

      const caller = getCaller();
      const result = await caller.note.read({
        id: "locked2",
        passwordHash: "correcthash",
      });

      expect(result.encryptedContent).toBe("secret-stuff");
    });

    it("throws UNAUTHORIZED when password required but not provided", async () => {
      await seedNote("needspass", {
        passwordHash: "somehash",
      });

      const caller = getCaller();

      await expect(
        caller.note.read({ id: "needspass" }),
      ).rejects.toThrow();
    });
  });

  // --- health ---

  describe("health", () => {
    it("returns ok status", async () => {
      const caller = getCaller();
      const result = await caller.note.health();

      expect(result.status).toBe("ok");
    });
  });

  // --- E2E encryption round-trip ---

  describe("encryption round-trip", () => {
    it("encrypt → create → read → decrypt returns original content", async () => {
      const caller = getCaller();
      const originalContent = "Hello, this is a secret note!";

      // Client-side: generate key and encrypt
      const key = await generateEncryptionKey();
      const encrypted = await encryptData(originalContent, key);

      // Encrypted content should differ from original
      expect(encrypted).not.toBe(originalContent);

      // Send encrypted content to server
      const created = await caller.note.create({
        encryptedContent: encrypted,
        expiry: "24h",
        burnAfterReading: false,
      });

      // Server returns the encrypted blob
      const read = await caller.note.read({ id: created.noteId });
      expect(read.encryptedContent).toBe(encrypted);

      // Client-side: decrypt
      const decrypted = await decryptData<string>(read.encryptedContent, key);
      expect(decrypted).toBe(originalContent);
    });

    it("decrypt fails with wrong key", async () => {
      const caller = getCaller();
      const content = "Top secret";

      const correctKey = await generateEncryptionKey();
      const wrongKey = await generateEncryptionKey();
      const encrypted = await encryptData(content, correctKey);

      const created = await caller.note.create({
        encryptedContent: encrypted,
        expiry: "1h",
      });

      const read = await caller.note.read({ id: created.noteId });

      await expect(
        decryptData<string>(read.encryptedContent, wrongKey),
      ).rejects.toThrow("Failed to decrypt data");
    });

    it("works with unicode and multiline content", async () => {
      const caller = getCaller();
      const originalContent = "Hallo wereld! 🔒\nLine 2: résumé café\n日本語テスト";

      const key = await generateEncryptionKey();
      const encrypted = await encryptData(originalContent, key);

      const created = await caller.note.create({
        encryptedContent: encrypted,
        expiry: "7d",
        burnAfterReading: true,
      });

      const read = await caller.note.read({ id: created.noteId });
      const decrypted = await decryptData<string>(read.encryptedContent, key);

      expect(decrypted).toBe(originalContent);
    });

    it("encryption with password: server gate + client decrypt", async () => {
      const caller = getCaller();
      const originalContent = "Password-protected secret";
      const passwordHash = "fakeSha256Hash";

      const key = await generateEncryptionKey();
      const encrypted = await encryptData(originalContent, key);

      const created = await caller.note.create({
        encryptedContent: encrypted,
        expiry: "24h",
        passwordHash,
      });

      // Fails without password
      await expect(
        caller.note.read({ id: created.noteId }),
      ).rejects.toThrow();

      // Succeeds with correct password, then decrypt
      const read = await caller.note.read({
        id: created.noteId,
        passwordHash,
      });
      const decrypted = await decryptData<string>(read.encryptedContent, key);
      expect(decrypted).toBe(originalContent);
    });

    it("burn-after-reading: second read fails after first read", async () => {
      const caller = getCaller();
      const key = await generateEncryptionKey();
      const encrypted = await encryptData("one-time secret", key);

      const created = await caller.note.create({
        encryptedContent: encrypted,
        expiry: "24h",
        burnAfterReading: true,
      });

      // First read succeeds
      const read = await caller.note.read({ id: created.noteId });
      expect(read.destroyed).toBe(true);
      const decrypted = await decryptData<string>(read.encryptedContent, key);
      expect(decrypted).toBe("one-time secret");

      // Second read fails — note is gone
      await expect(
        caller.note.read({ id: created.noteId }),
      ).rejects.toThrow();
    });
  });
});

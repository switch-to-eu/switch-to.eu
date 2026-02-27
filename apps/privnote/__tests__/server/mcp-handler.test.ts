import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockRedis } from "@switch-to-eu/db/mock-redis";
import {
  generateEncryptionKey,
  encryptData,
  decryptData,
} from "@switch-to-eu/db/crypto";
import { hashPassword } from "@/lib/crypto";

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

describe("MCP create_privnote flow", () => {
  beforeEach(() => {
    mockRedis._clear();
  });

  it("server-side encrypt → create → read → decrypt round-trip", async () => {
    const content = "Hello from MCP!";

    // Simulate what the MCP handler does: generate key + encrypt server-side
    const encryptionKey = await generateEncryptionKey();
    const encryptedContent = await encryptData(content, encryptionKey);

    const caller = getCaller();
    const result = await caller.note.create({
      encryptedContent,
      expiry: "24h",
      burnAfterReading: true,
    });

    expect(result.noteId).toBeDefined();
    expect(result.expiresAt).toBeDefined();
    expect(result.burnAfterReading).toBe(true);

    // Recipient reads and decrypts using key from URL fragment
    const read = await caller.note.read({ id: result.noteId });
    const decrypted = await decryptData<string>(
      read.encryptedContent,
      encryptionKey,
    );
    expect(decrypted).toBe(content);
  });

  it("server-side encrypt with password hash", async () => {
    const content = "Password-protected MCP note";
    const password = "secret123";

    // MCP handler hashes the password server-side
    const passwordHash = await hashPassword(password);
    const encryptionKey = await generateEncryptionKey();
    const encryptedContent = await encryptData(content, encryptionKey);

    const caller = getCaller();
    const result = await caller.note.create({
      encryptedContent,
      expiry: "1h",
      burnAfterReading: false,
      passwordHash,
    });

    // Read without password should fail
    await expect(caller.note.read({ id: result.noteId })).rejects.toThrow();

    // Read with correct password hash should succeed
    const read = await caller.note.read({
      id: result.noteId,
      passwordHash,
    });
    const decrypted = await decryptData<string>(
      read.encryptedContent,
      encryptionKey,
    );
    expect(decrypted).toBe(content);
  });

  it("all expiry options are accepted", async () => {
    const caller = getCaller();
    const key = await generateEncryptionKey();

    for (const expiry of ["5m", "30m", "1h", "24h", "7d"] as const) {
      const encrypted = await encryptData(`note-${expiry}`, key);
      const result = await caller.note.create({
        encryptedContent: encrypted,
        expiry,
        burnAfterReading: false,
      });
      expect(result.noteId).toBeDefined();
    }
  });

  it("share URL can be reconstructed from result", async () => {
    const content = "URL test note";
    const encryptionKey = await generateEncryptionKey();
    const encryptedContent = await encryptData(content, encryptionKey);

    const caller = getCaller();
    const result = await caller.note.create({
      encryptedContent,
      expiry: "24h",
      burnAfterReading: true,
    });

    // Simulate URL construction as done in MCP handler
    const baseUrl = "http://localhost:5016";
    const shareUrl = `${baseUrl}/en/note/${result.noteId}#key=${encodeURIComponent(encryptionKey)}`;

    expect(shareUrl).toContain(result.noteId);
    expect(shareUrl).toContain("#key=");

    // Extract key from URL and verify decryption works
    const fragment = shareUrl.split("#")[1]!;
    const params = new URLSearchParams(fragment);
    const extractedKey = decodeURIComponent(params.get("key")!);

    const read = await caller.note.read({ id: result.noteId });
    const decrypted = await decryptData<string>(
      read.encryptedContent,
      extractedKey,
    );
    expect(decrypted).toBe(content);
  });
});

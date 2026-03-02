import { describe, it, expect } from "vitest";
import { generateEncryptionKey, encryptData, decryptData } from "../src/crypto";

describe("crypto", () => {
  describe("generateEncryptionKey", () => {
    it("returns a base64 string", async () => {
      const key = await generateEncryptionKey();
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    });

    it("generates 256-bit keys (32 bytes → 44 base64 chars)", async () => {
      const key = await generateEncryptionKey();
      const bytes = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
      expect(bytes.length).toBe(32);
    });

    it("generates unique keys", async () => {
      const keys = await Promise.all(Array.from({ length: 10 }, () => generateEncryptionKey()));
      expect(new Set(keys).size).toBe(10);
    });
  });

  describe("encryptData / decryptData", () => {
    it("round-trips a string", async () => {
      const key = await generateEncryptionKey();
      const encrypted = await encryptData("hello world", key);
      const decrypted = await decryptData<string>(encrypted, key);
      expect(decrypted).toBe("hello world");
    });

    it("round-trips an object", async () => {
      const key = await generateEncryptionKey();
      const data = { name: "Alice", score: 42, tags: ["a", "b"] };
      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData<typeof data>(encrypted, key);
      expect(decrypted).toEqual(data);
    });

    it("round-trips null and boolean", async () => {
      const key = await generateEncryptionKey();
      expect(await decryptData(await encryptData(null, key), key)).toBeNull();
      expect(await decryptData(await encryptData(true, key), key)).toBe(true);
    });

    it("produces different ciphertext for same plaintext (random IV)", async () => {
      const key = await generateEncryptionKey();
      const a = await encryptData("same", key);
      const b = await encryptData("same", key);
      expect(a).not.toBe(b);
    });

    it("fails to decrypt with wrong key", async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();
      const encrypted = await encryptData("secret", key1);
      await expect(decryptData(encrypted, key2)).rejects.toThrow("Failed to decrypt");
    });

    it("fails to decrypt corrupted ciphertext", async () => {
      const key = await generateEncryptionKey();
      const encrypted = await encryptData("data", key);
      const corrupted = encrypted.slice(0, -4) + "AAAA";
      await expect(decryptData(corrupted, key)).rejects.toThrow("Failed to decrypt");
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  generateAdminToken,
  hashAdminToken,
  verifyAdminToken,
  generateAdminUrl,
  parseAdminFragment,
} from "../src/admin";

describe("admin", () => {
  describe("generateAdminToken", () => {
    it("returns a non-empty string", () => {
      const token = generateAdminToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
    });

    it("returns a base64url-encoded 48-byte token (64 chars)", () => {
      const token = generateAdminToken();
      expect(token.length).toBe(64);
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("generates unique tokens", () => {
      const tokens = new Set(Array.from({ length: 20 }, () => generateAdminToken()));
      expect(tokens.size).toBe(20);
    });
  });

  describe("hashAdminToken", () => {
    it("returns a 64-char hex SHA-256 hash", () => {
      const hash = hashAdminToken("test-token");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it("is deterministic", () => {
      const a = hashAdminToken("same-input");
      const b = hashAdminToken("same-input");
      expect(a).toBe(b);
    });

    it("produces different hashes for different tokens", () => {
      const a = hashAdminToken("token-a");
      const b = hashAdminToken("token-b");
      expect(a).not.toBe(b);
    });
  });

  describe("verifyAdminToken", () => {
    it("returns true for matching token", () => {
      const token = generateAdminToken();
      const hash = hashAdminToken(token);
      expect(verifyAdminToken(token, hash)).toBe(true);
    });

    it("returns false for wrong token", () => {
      const hash = hashAdminToken("correct-token");
      expect(verifyAdminToken("wrong-token", hash)).toBe(false);
    });

    it("returns false for mismatched hash length", () => {
      expect(verifyAdminToken("token", "short")).toBe(false);
    });
  });

  describe("generateAdminUrl", () => {
    it("builds a URL with token and key in the fragment", () => {
      const url = generateAdminUrl("/poll", "abc123", "my-token", "my-key");
      expect(url).toBe("/poll/abc123/admin#token=my-token&key=my-key");
    });

    it("encodes special characters", () => {
      const url = generateAdminUrl("/poll", "id", "a+b=c", "x/y=z");
      expect(url).toContain("token=a%2Bb%3Dc");
      expect(url).toContain("key=x%2Fy%3Dz");
    });
  });

  describe("parseAdminFragment", () => {
    it("parses token and key from a hash fragment", () => {
      const result = parseAdminFragment("#token=my-token&key=my-key");
      expect(result).toEqual({ token: "my-token", key: "my-key" });
    });

    it("handles fragment without leading #", () => {
      const result = parseAdminFragment("token=abc&key=xyz");
      expect(result).toEqual({ token: "abc", key: "xyz" });
    });

    it("returns empty strings for missing params", () => {
      const result = parseAdminFragment("");
      expect(result).toEqual({ token: "", key: "" });
    });

    it("round-trips with generateAdminUrl", () => {
      const token = generateAdminToken();
      const key = "base64key+/=";
      const url = generateAdminUrl("/app", "id1", token, key);
      const fragment = url.split("#")[1];
      const parsed = parseAdminFragment(fragment);
      expect(parsed.token).toBe(token);
      expect(parsed.key).toBe(key);
    });
  });
});

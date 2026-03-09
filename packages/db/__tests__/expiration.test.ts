import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getExpirationOptions,
  calculateExpirationDate,
  calculateTTLSeconds,
} from "../src/expiration";

describe("expiration", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getExpirationOptions", () => {
    it("returns 7 options", () => {
      expect(getExpirationOptions()).toHaveLength(7);
    });

    it("options are sorted ascending by value", () => {
      const values = getExpirationOptions().map((o) => o.value);
      expect(values).toEqual([1, 3, 7, 14, 30, 60, 90]);
    });

    it("each option has a label", () => {
      for (const opt of getExpirationOptions()) {
        expect(opt.label).toBeTruthy();
      }
    });
  });

  describe("calculateExpirationDate", () => {
    it("adds the correct number of days", () => {
      const from = new Date("2025-01-01T00:00:00Z");
      const result = calculateExpirationDate(from, 7);
      expect(result.toISOString()).toBe("2025-01-08T00:00:00.000Z");
    });

    it("does not mutate the input date", () => {
      const from = new Date("2025-06-15T12:00:00Z");
      const original = from.toISOString();
      calculateExpirationDate(from, 30);
      expect(from.toISOString()).toBe(original);
    });

    it("handles month overflow", () => {
      const from = new Date("2025-01-30T00:00:00Z");
      const result = calculateExpirationDate(from, 3);
      expect(result.getDate()).toBe(2);
      expect(result.getMonth()).toBe(1); // February
    });
  });

  describe("calculateTTLSeconds", () => {
    it("returns positive TTL for future expiry", () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const ttl = calculateTTLSeconds(future, 0);
      // Should be roughly 86400 seconds (1 day)
      expect(ttl).toBeGreaterThan(86000);
      expect(ttl).toBeLessThanOrEqual(86400);
    });

    it("adds grace period", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T00:00:00Z"));

      // Expires right now, but 7-day grace → ~7 days of TTL
      const ttl = calculateTTLSeconds("2025-06-01T00:00:00Z", 7);
      expect(ttl).toBe(7 * 24 * 60 * 60);
    });

    it("returns 0 for past expiry beyond grace period", () => {
      const pastDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const ttl = calculateTTLSeconds(pastDate, 7);
      expect(ttl).toBe(0);
    });

    it("defaults to 7-day grace period", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T00:00:00Z"));

      const ttlDefault = calculateTTLSeconds("2025-06-01T00:00:00Z");
      const ttlExplicit = calculateTTLSeconds("2025-06-01T00:00:00Z", 7);
      expect(ttlDefault).toBe(ttlExplicit);
    });
  });
});

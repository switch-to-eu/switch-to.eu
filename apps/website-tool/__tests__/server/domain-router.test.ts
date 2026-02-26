import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockRedis } from "@switch-to-eu/db/mock-redis";
import type { AnalysisStep } from "@/lib/types";

// Shared mock instance — reset between tests
const mockRedis = new MockRedis();

// Mock the redis module so getRedis() returns our mock
vi.mock("@switch-to-eu/db/redis", () => ({
  getRedis: async () => mockRedis,
  getRedisSubscriber: async () => mockRedis,
}));

// Mock detector functions to avoid real DNS/WHOIS/HTTP lookups
vi.mock("@/server/lib/detectors", () => ({
  checkDomainExists: vi.fn(async () => true),
  createAnalysisTemplate: vi.fn(
    (): AnalysisStep[] => [
      {
        type: "mx_records",
        status: "pending",
        details: null,
        isEU: null,
        euFriendly: null,
      },
      {
        type: "domain_registrar",
        status: "pending",
        details: null,
        isEU: null,
        euFriendly: null,
      },
      {
        type: "hosting",
        status: "pending",
        details: null,
        isEU: null,
        euFriendly: null,
      },
      {
        type: "services",
        status: "pending",
        details: null,
        isEU: null,
        euFriendly: null,
      },
      {
        type: "cdn",
        status: "pending",
        details: null,
        isEU: null,
        euFriendly: null,
      },
    ],
  ),
  detectEmailProvider: vi.fn(async () => ({
    provider: "Google Workspace",
    isEU: false,
    euFriendly: false,
  })),
  detectDomainRegistrar: vi.fn(async () => ({
    provider: { name: "Gandi", url: "https://gandi.net" },
    isEU: true,
    euFriendly: false,
  })),
  detectHostingProvider: vi.fn(async () => ({
    provider: "Hetzner",
    isEU: true,
    euFriendly: false,
  })),
  detectThirdPartyServices: vi.fn(async () => ({
    services: [
      { name: "Google Analytics", isEU: false, euFriendly: false },
      { name: "Plausible", isEU: true, euFriendly: false },
    ],
    isEU: false,
    euFriendly: false,
  })),
  detectCdn: vi.fn(async () => ({
    provider: "Cloudflare",
    isEU: false,
    euFriendly: false,
  })),
}));

// Import after mocks are set up
const { createCaller } = await import("@/server/api/root");
const detectors = await import("@/server/lib/detectors");

function getCaller() {
  return createCaller({ redis: mockRedis as never, headers: new Headers() });
}

describe("domain router", () => {
  beforeEach(() => {
    mockRedis._clear();
    vi.mocked(detectors.checkDomainExists).mockResolvedValue(true);
  });

  // --- getCached ---

  describe("getCached", () => {
    it("returns null when no cached results exist", async () => {
      const caller = getCaller();
      const result = await caller.domain.getCached({ domain: "example.com" });
      expect(result).toBeNull();
    });

    it("returns cached analysis results", async () => {
      const cachedSteps: AnalysisStep[] = [
        {
          type: "mx_records",
          status: "complete",
          details: "Google Workspace",
          isEU: false,
          euFriendly: false,
        },
      ];
      await mockRedis.set(
        "domain:example.com",
        JSON.stringify(cachedSteps),
      );

      const caller = getCaller();
      const result = await caller.domain.getCached({ domain: "example.com" });
      expect(result).toEqual(cachedSteps);
    });

    it("requires non-empty domain string", async () => {
      const caller = getCaller();
      await expect(
        caller.domain.getCached({ domain: "" }),
      ).rejects.toThrow();
    });
  });

  // --- analyze (subscription) ---

  describe("analyze", () => {
    it("streams analysis steps and caches final results", async () => {
      const caller = getCaller();
      const subscription = await caller.domain.analyze({ domain: "test.com" });

      // Deep-clone each yield because the router mutates step objects in place
      const yields: Array<{
        results: AnalysisStep[];
        complete: boolean;
      }> = [];
      for await (const value of subscription) {
        yields.push(JSON.parse(JSON.stringify(value)));
      }

      // Should have multiple yields:
      // 1 initial (all pending) + 2 per step (processing + complete) × 5 steps + 1 final
      expect(yields.length).toBe(12);

      // First yield: all pending
      const first = yields[0]!;
      expect(first.complete).toBe(false);
      expect(first.results.every((s) => s.status === "pending")).toBe(true);

      // Last yield: all complete
      const last = yields[yields.length - 1]!;
      expect(last.complete).toBe(true);
      expect(last.results.every((s) => s.status === "complete")).toBe(true);

      // Check MX result
      expect(last.results[0]!.details).toBe("Google Workspace");
      expect(last.results[0]!.isEU).toBe(false);

      // Check registrar result
      expect(last.results[1]!.details).toBe("Gandi");
      expect(last.results[1]!.isEU).toBe(true);

      // Check hosting result
      expect(last.results[2]!.details).toBe("Hetzner");
      expect(last.results[2]!.isEU).toBe(true);

      // Check services result
      expect(last.results[3]!.details).toEqual([
        { name: "Google Analytics", isEU: false, euFriendly: false },
        { name: "Plausible", isEU: true, euFriendly: false },
      ]);
      expect(last.results[3]!.isEU).toBe(false);

      // Check CDN result
      expect(last.results[4]!.details).toBe("Cloudflare");
      expect(last.results[4]!.isEU).toBe(false);

      // Verify results were cached in Redis
      const cached = await mockRedis.get("domain:test.com");
      expect(cached).toBeDefined();
      const parsed = JSON.parse(cached!) as AnalysisStep[];
      expect(parsed).toHaveLength(5);
      expect(parsed[0]!.details).toBe("Google Workspace");
    });

    it("throws NOT_FOUND when domain does not exist", async () => {
      vi.mocked(detectors.checkDomainExists).mockResolvedValueOnce(false);

      const caller = getCaller();
      await expect(async () => {
        const subscription = await caller.domain.analyze({
          domain: "nonexistent.invalid",
        });
        // Must iterate to trigger the generator body
        for await (const _value of subscription) {
          // should not reach here
        }
      }).rejects.toThrow("Domain not found");
    });

    it("calls all detector functions in sequence", async () => {
      const caller = getCaller();
      const subscription = await caller.domain.analyze({
        domain: "detector-test.com",
      });

      // Consume the full subscription
      for await (const _value of subscription) {
        // drain
      }

      expect(detectors.detectEmailProvider).toHaveBeenCalledWith(
        "detector-test.com",
      );
      expect(detectors.detectDomainRegistrar).toHaveBeenCalledWith(
        "detector-test.com",
      );
      expect(detectors.detectHostingProvider).toHaveBeenCalledWith(
        "detector-test.com",
      );
      expect(detectors.detectThirdPartyServices).toHaveBeenCalledWith(
        "detector-test.com",
      );
      expect(detectors.detectCdn).toHaveBeenCalledWith("detector-test.com");
    });

    it("sets Redis cache with TTL", async () => {
      const caller = getCaller();
      const subscription = await caller.domain.analyze({
        domain: "ttl-test.com",
      });
      for await (const _value of subscription) {
        // drain
      }

      // Verify the key exists
      const cached = await mockRedis.get("domain:ttl-test.com");
      expect(cached).toBeDefined();

      // Verify TTL was set (7 days = 604800 seconds)
      const ttl = mockRedis._getTtl("domain:ttl-test.com");
      expect(ttl).toBe(604800);
    });
  });
});

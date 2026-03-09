/**
 * Integration tests — run actual detector functions against real domains.
 * These hit real DNS, WHOIS, and HTTP endpoints so they are slower and
 * depend on network availability. They are included in the normal test
 * suite but have generous timeouts.
 */
import { describe, it, expect } from "vitest";
import {
  checkDomainExists,
  detectEmailProvider,
  detectDomainRegistrar,
  detectHostingProvider,
  detectThirdPartyServices,
  detectCdn,
  createAnalysisTemplate,
} from "@/server/lib/detectors";

describe("detectors (integration)", () => {
  // --- checkDomainExists ---

  describe("checkDomainExists", () => {
    it("returns true for google.com", async () => {
      expect(await checkDomainExists("google.com")).toBe(true);
    }, 15_000);

    it("returns false for surely-nonexistent-domain-xyz.invalid", async () => {
      expect(
        await checkDomainExists("surely-nonexistent-domain-xyz.invalid"),
      ).toBe(false);
    }, 15_000);
  });

  // --- createAnalysisTemplate ---

  describe("createAnalysisTemplate", () => {
    it("returns 5 pending steps with correct types", () => {
      const template = createAnalysisTemplate();
      expect(template).toHaveLength(5);

      const types = template.map((s) => s.type);
      expect(types).toEqual([
        "mx_records",
        "domain_registrar",
        "hosting",
        "services",
        "cdn",
      ]);

      for (const step of template) {
        expect(step.status).toBe("pending");
        expect(step.details).toBeNull();
        expect(step.isEU).toBeNull();
        expect(step.euFriendly).toBeNull();
      }
    });
  });

  // --- Real domain: google.com (US company) ---

  describe("google.com", () => {
    it("detects email provider", async () => {
      const result = await detectEmailProvider("google.com");
      expect(result.provider).toBeTruthy();
      // Google's own MX should be detected
      expect(typeof result.isEU).toBe("boolean");
    }, 15_000);

    it("detects hosting provider", async () => {
      const result = await detectHostingProvider("google.com");
      expect(typeof result.provider).toBe("string");
      expect(typeof result.isEU).toBe("boolean");
    }, 15_000);

    it("detects third-party services", async () => {
      const result = await detectThirdPartyServices("google.com");
      expect(Array.isArray(result.services)).toBe(true);
      // isEU can be null when no services are detected
      expect([true, false, null]).toContain(result.isEU);
    }, 15_000);
  });

  // --- Real domain: hetzner.com (EU company) ---

  describe("hetzner.com", () => {
    it("detects email provider", async () => {
      const result = await detectEmailProvider("hetzner.com");
      expect(typeof result.provider).toBe("string");
    }, 15_000);

    it("detects domain registrar", async () => {
      const result = await detectDomainRegistrar("hetzner.com");
      expect(result.provider).toBeTruthy();
    }, 15_000);

    it("detects CDN", async () => {
      const result = await detectCdn("hetzner.com");
      // isEU can be null when no CDN is detected
      expect([true, false, null]).toContain(result.isEU);
    }, 15_000);
  });

  // --- Real domain: switch-to.eu (our own site) ---

  describe("switch-to.eu", () => {
    it("detects email provider", async () => {
      const result = await detectEmailProvider("switch-to.eu");
      expect(typeof result.provider).toBe("string");
    }, 15_000);

    it("detects hosting provider", async () => {
      const result = await detectHostingProvider("switch-to.eu");
      expect(typeof result.provider).toBe("string");
    }, 15_000);

    it("detects third-party services", async () => {
      const result = await detectThirdPartyServices("switch-to.eu");
      expect(Array.isArray(result.services)).toBe(true);
    }, 15_000);

    it("detects CDN", async () => {
      const result = await detectCdn("switch-to.eu");
      // isEU can be null when no CDN is detected
      expect([true, false, null]).toContain(result.isEU);
    }, 15_000);
  });
});

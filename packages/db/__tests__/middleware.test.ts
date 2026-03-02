import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { MockRedis } from "../src/mock-redis";

/**
 * Rate-limiting middleware tests.
 *
 * Imports the real createRateLimitProcedure from @switch-to-eu/trpc/middleware
 * and wires it into a minimal tRPC router with MockRedis, exactly like apps do.
 */

const mockRedis = new MockRedis();

// The middleware skips rate limiting when NODE_ENV === "development",
// so we force it to "test" for these tests.
const originalNodeEnv = process.env.NODE_ENV;

beforeAll(() => {
  process.env.NODE_ENV = "test";
});

afterAll(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

// Import the real middleware
const { createRateLimitProcedure } = await import("@switch-to-eu/trpc/middleware");

// Build a minimal tRPC router that mirrors how apps use the middleware
const t = initTRPC
  .context<{ headers: Headers; redis: typeof mockRedis }>()
  .create({ transformer: superjson });

function buildRouter(opts: { prefix: string; windowMs: number; maxRequests: number }) {
  const rateLimited = t.procedure.concat(createRateLimitProcedure(opts));

  return t.router({
    ping: rateLimited.query(() => ({ ok: true })),
  });
}

function createCaller(
  router: ReturnType<typeof buildRouter>,
  ip?: string,
) {
  const headers = new Headers();
  if (ip) headers.set("x-forwarded-for", ip);
  return t.createCallerFactory(router)({ headers, redis: mockRedis });
}

describe("createRateLimitProcedure", () => {
  const opts = { prefix: "test", windowMs: 60_000, maxRequests: 5 };
  const router = buildRouter(opts);

  beforeEach(() => {
    mockRedis._clear();
  });

  it("allows requests under the limit", async () => {
    for (let i = 0; i < 5; i++) {
      const result = await createCaller(router, "1.2.3.4").ping();
      expect(result).toEqual({ ok: true });
    }
  });

  it("blocks requests after exceeding the limit", async () => {
    const ip = "192.168.1.100";
    for (let i = 0; i < 5; i++) {
      await createCaller(router, ip).ping();
    }

    await expect(createCaller(router, ip).ping()).rejects.toThrow(
      "Too many requests",
    );
  });

  it("tracks rate limits per IP independently", async () => {
    // Exhaust IP A
    for (let i = 0; i < 5; i++) {
      await createCaller(router, "10.0.0.1").ping();
    }

    // IP A is blocked
    await expect(createCaller(router, "10.0.0.1").ping()).rejects.toThrow(
      "Too many requests",
    );

    // IP B is fine
    const result = await createCaller(router, "10.0.0.2").ping();
    expect(result).toEqual({ ok: true });
  });

  it("uses 'unknown' bucket when no IP headers are set", async () => {
    for (let i = 0; i < 5; i++) {
      await createCaller(router).ping(); // no IP
    }

    // Next no-IP call is blocked
    await expect(createCaller(router).ping()).rejects.toThrow(
      "Too many requests",
    );

    // Real IP is still fine
    const result = await createCaller(router, "203.0.113.1").ping();
    expect(result).toEqual({ ok: true });
  });

  it("extracts first IP from x-forwarded-for chain", async () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "1.1.1.1, 10.0.0.1, 192.168.1.1");
    const caller = t.createCallerFactory(router)({ headers, redis: mockRedis });

    for (let i = 0; i < 5; i++) {
      await caller.ping();
    }

    // 1.1.1.1 is now blocked
    await expect(caller.ping()).rejects.toThrow("Too many requests");

    // Different first-hop IP is fine
    const result = await createCaller(router, "2.2.2.2").ping();
    expect(result).toEqual({ ok: true });
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    const headers = new Headers();
    headers.set("x-real-ip", "5.6.7.8");
    const caller = t.createCallerFactory(router)({ headers, redis: mockRedis });

    for (let i = 0; i < 5; i++) {
      await caller.ping();
    }

    await expect(caller.ping()).rejects.toThrow("Too many requests");

    // Different IP is fine
    const result = await createCaller(router, "9.8.7.6").ping();
    expect(result).toEqual({ ok: true });
  });

  it("isolates different prefixes", async () => {
    const routerA = buildRouter({ prefix: "app-a", windowMs: 60_000, maxRequests: 5 });
    const routerB = buildRouter({ prefix: "app-b", windowMs: 60_000, maxRequests: 5 });
    const ip = "1.1.1.1";

    // Exhaust app-a
    for (let i = 0; i < 5; i++) {
      await createCaller(routerA, ip).ping();
    }
    await expect(createCaller(routerA, ip).ping()).rejects.toThrow(
      "Too many requests",
    );

    // app-b is independent
    const result = await createCaller(routerB, ip).ping();
    expect(result).toEqual({ ok: true });
  });

  it("isolates different window sizes", async () => {
    const shortWindow = buildRouter({ prefix: "test", windowMs: 10_000, maxRequests: 5 });
    const longWindow = buildRouter({ prefix: "test", windowMs: 60_000, maxRequests: 5 });
    const ip = "1.1.1.1";

    // Exhaust short window
    for (let i = 0; i < 5; i++) {
      await createCaller(shortWindow, ip).ping();
    }
    await expect(createCaller(shortWindow, ip).ping()).rejects.toThrow(
      "Too many requests",
    );

    // Long window has a different key, so it's fine
    const result = await createCaller(longWindow, ip).ping();
    expect(result).toEqual({ ok: true });
  });
});

describe("rate limiting skips in development", () => {
  beforeEach(() => {
    mockRedis._clear();
  });

  it("does not rate limit when NODE_ENV is development", async () => {
    const saved = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    try {
      const router = buildRouter({ prefix: "dev", windowMs: 60_000, maxRequests: 1 });

      // Should allow unlimited requests
      for (let i = 0; i < 10; i++) {
        const result = await createCaller(router, "1.2.3.4").ping();
        expect(result).toEqual({ ok: true });
      }
    } finally {
      process.env.NODE_ENV = saved;
    }
  });
});

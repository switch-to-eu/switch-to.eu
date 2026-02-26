import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

/**
 * Shared tRPC instance for defining reusable middleware plugins.
 * Apps compose these onto their own procedures via `.concat()`.
 *
 * Context declares the minimal shape required by shared middleware.
 * Apps must provide a context that structurally matches this.
 */
const t = initTRPC
  .context<{
    headers: Headers;
    redis: {
      incr: (key: string) => Promise<number>;
      pExpire: (key: string, ms: number) => Promise<unknown>;
    };
  }>()
  .create({
    transformer: superjson,
  });

/**
 * Timing procedure — adds artificial delay in development.
 * Compose onto your procedure with `.concat(timingProcedure)`.
 */
export const timingProcedure = t.procedure.use(async ({ next }) => {
  if (process.env.NODE_ENV === "development") {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  return next();
});

/**
 * Creates a rate-limiting procedure using Redis sliding window.
 * Compose onto your procedure with `.concat(createRateLimitProcedure({...}))`.
 */
export function createRateLimitProcedure(opts: {
  prefix: string;
  windowMs: number;
  maxRequests: number;
}) {
  return t.procedure.use(async ({ ctx, next }) => {
    const ip =
      ctx.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      ctx.headers.get("x-real-ip") ??
      "unknown";
    const key = `ratelimit:${opts.prefix}:${ip}:${opts.windowMs}`;

    const current = await ctx.redis.incr(key);
    if (current === 1) {
      await ctx.redis.pExpire(key, opts.windowMs);
    }

    if (current > opts.maxRequests) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests. Please try again later.",
      });
    }

    return next();
  });
}

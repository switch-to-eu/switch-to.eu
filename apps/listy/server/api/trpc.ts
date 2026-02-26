import { TRPCError } from "@trpc/server";
import { createTRPCInit } from "@switch-to-eu/trpc/init";
import { createTimingMiddleware } from "@switch-to-eu/trpc/middleware";
import { getRedis } from "@switch-to-eu/db/redis";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const redis = await getRedis();
  return {
    redis,
    ...opts,
  };
};

const t = createTRPCInit(createTRPCContext);

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = createTimingMiddleware(t);

function createRateLimitMiddleware(
  opts: { windowMs: number; maxRequests: number },
) {
  return t.middleware(async ({ ctx, next }) => {
    const ip =
      ctx.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      ctx.headers.get("x-real-ip") ??
      "unknown";
    const key = `ratelimit:listy:${ip}:${opts.windowMs}`;

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

const rateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 60_000,
  maxRequests: 30,
});

export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(rateLimitMiddleware);

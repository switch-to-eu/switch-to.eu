import { createTRPCInit } from "@switch-to-eu/trpc/init";
import { timingProcedure, createRateLimitProcedure } from "@switch-to-eu/trpc/middleware";
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

export const publicProcedure = t.procedure
  .concat(timingProcedure)
  .concat(
    createRateLimitProcedure({
      prefix: "split",
      windowMs: 60_000,
      maxRequests: 30,
    }),
  );

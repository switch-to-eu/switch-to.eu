/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
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
      prefix: "plotty",
      windowMs: 60_000,
      maxRequests: 30,
    }),
  );

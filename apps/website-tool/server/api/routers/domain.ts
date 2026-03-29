import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { AnalysisStep } from "@/lib/types";
import {
  detectEmailProvider,
  detectDomainRegistrar,
  detectHostingProvider,
  detectThirdPartyServices,
  detectCdn,
  createAnalysisTemplate,
  checkDomainExists,
} from "@/server/lib/detectors";

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const DETECTOR_TIMEOUT_MS = 15_000; // 15 seconds per detector

const domainInput = z.object({
  domain: z.string().min(1),
});

/** Wrap a promise with a timeout — rejects after `ms` milliseconds. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => { reject(new Error("Detector timed out")); },
      ms,
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e: unknown) => { clearTimeout(timer); reject(e instanceof Error ? e : new Error(String(e))); },
    );
  });
}

type DetectorConfig = {
  index: number;
  // eslint-disable-next-line no-unused-vars
  run: (domain: string) => Promise<void>;
};

export const domainRouter = createTRPCRouter({
  getCached: publicProcedure
    .input(domainInput)
    .query(async ({ ctx, input }) => {
      const cached = await ctx.redis.get(`domain:${input.domain}`);
      if (!cached) return null;

      return JSON.parse(cached) as AnalysisStep[];
    }),

  analyze: publicProcedure
    .input(domainInput)
    .subscription(async function* ({ ctx, input }) {
      const { domain } = input;

      // Check if domain exists
      const exists = await checkDomainExists(domain);
      if (!exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Domain not found",
        });
      }

      const analysis = createAnalysisTemplate();

      // Yield initial state (all pending)
      yield { results: [...analysis], complete: false };

      // Track how many detectors have finished
      let completedCount = 0;

      // Queue to push completed step indices for the generator to consume
      const resolved: number[] = [];
      let notifyResolve: (() => void) | null = null;

      function onStepDone(index: number) {
        completedCount++;
        resolved.push(index);
        if (notifyResolve) {
          notifyResolve();
          notifyResolve = null;
        }
      }

      /** Wait until at least one new step has completed */
      function waitForNext(): Promise<void> {
        if (resolved.length > 0) return Promise.resolve();
        return new Promise((resolve) => {
          notifyResolve = resolve;
        });
      }

      // Define all detectors — each mutates its step in `analysis` then signals done
      const detectors: DetectorConfig[] = [
        {
          index: 0,
          run: async (domain) => {
            analysis[0]!.status = "processing";
            const result = await withTimeout(detectEmailProvider(domain), DETECTOR_TIMEOUT_MS);
            analysis[0]!.status = "complete";
            analysis[0]!.details = result.provider;
            analysis[0]!.isEU = result.isEU;
            analysis[0]!.euFriendly = result.euFriendly;
          },
        },
        {
          index: 1,
          run: async (domain) => {
            analysis[1]!.status = "processing";
            const result = await withTimeout(detectDomainRegistrar(domain), DETECTOR_TIMEOUT_MS);
            analysis[1]!.status = "complete";
            analysis[1]!.details = result.provider?.name;
            analysis[1]!.isEU = result.isEU;
            analysis[1]!.euFriendly = result.euFriendly;
          },
        },
        {
          index: 2,
          run: async (domain) => {
            analysis[2]!.status = "processing";
            const result = await withTimeout(detectHostingProvider(domain), DETECTOR_TIMEOUT_MS);
            analysis[2]!.status = "complete";
            analysis[2]!.details = result.provider;
            analysis[2]!.isEU = result.isEU;
            analysis[2]!.euFriendly = result.euFriendly;
          },
        },
        {
          index: 3,
          run: async (domain) => {
            analysis[3]!.status = "processing";
            const result = await withTimeout(detectThirdPartyServices(domain), DETECTOR_TIMEOUT_MS);
            analysis[3]!.status = "complete";
            analysis[3]!.details = result.services;
            analysis[3]!.isEU = result.isEU;
            analysis[3]!.euFriendly = result.euFriendly;
          },
        },
        {
          index: 4,
          run: async (domain) => {
            analysis[4]!.status = "processing";
            const result = await withTimeout(detectCdn(domain), DETECTOR_TIMEOUT_MS);
            analysis[4]!.status = "complete";
            analysis[4]!.details = result.provider;
            analysis[4]!.isEU = result.isEU;
            analysis[4]!.euFriendly = result.euFriendly;
          },
        },
      ];

      // Launch all detectors in parallel
      for (const detector of detectors) {
        void detector
          .run(domain)
          .catch((err) => {
            // On timeout or error, mark as complete with unknown result
            console.error(`Detector ${analysis[detector.index]!.type} failed:`, err);
            analysis[detector.index]!.status = "complete";
            analysis[detector.index]!.details = null;
            analysis[detector.index]!.isEU = null;
            analysis[detector.index]!.euFriendly = null;
          })
          .then(() => onStepDone(detector.index));
      }

      // Yield an initial "all processing" state
      yield { results: [...analysis], complete: false };

      // Yield each time a detector finishes
      while (completedCount < detectors.length) {
        await waitForNext();

        // Drain all resolved steps before yielding
        resolved.length = 0;

        yield { results: [...analysis], complete: false };
      }

      // Cache final results
      await ctx.redis.set(
        `domain:${domain}`,
        JSON.stringify(analysis),
      );
      await ctx.redis.expire(`domain:${domain}`, CACHE_TTL_SECONDS);

      // Yield final complete state
      yield { results: [...analysis], complete: true };
    }),
});

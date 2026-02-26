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

const domainInput = z.object({
  domain: z.string().min(1),
});

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

      // Step 1: MX records / email provider
      const mxStep = analysis[0]!;
      mxStep.status = "processing";
      yield { results: [...analysis], complete: false };
      const mxResults = await detectEmailProvider(domain);
      mxStep.status = "complete";
      mxStep.details = mxResults.provider;
      mxStep.isEU = mxResults.isEU;
      mxStep.euFriendly = mxResults.euFriendly;
      yield { results: [...analysis], complete: false };

      // Step 2: Domain registrar
      const registrarStep = analysis[1]!;
      registrarStep.status = "processing";
      yield { results: [...analysis], complete: false };
      const registrarResults = await detectDomainRegistrar(domain);
      registrarStep.status = "complete";
      registrarStep.details = registrarResults.provider?.name;
      registrarStep.isEU = registrarResults.isEU;
      registrarStep.euFriendly = registrarResults.euFriendly;
      yield { results: [...analysis], complete: false };

      // Step 3: Hosting provider
      const hostingStep = analysis[2]!;
      hostingStep.status = "processing";
      yield { results: [...analysis], complete: false };
      const hostingResults = await detectHostingProvider(domain);
      hostingStep.status = "complete";
      hostingStep.details = hostingResults.provider;
      hostingStep.isEU = hostingResults.isEU;
      hostingStep.euFriendly = hostingResults.euFriendly;
      yield { results: [...analysis], complete: false };

      // Step 4: Third-party services
      const servicesStep = analysis[3]!;
      servicesStep.status = "processing";
      yield { results: [...analysis], complete: false };
      const servicesResults = await detectThirdPartyServices(domain);
      servicesStep.status = "complete";
      servicesStep.details = servicesResults.services;
      servicesStep.isEU = servicesResults.isEU;
      servicesStep.euFriendly = servicesResults.euFriendly;
      yield { results: [...analysis], complete: false };

      // Step 5: CDN
      const cdnStep = analysis[4]!;
      cdnStep.status = "processing";
      yield { results: [...analysis], complete: false };
      const cdnResults = await detectCdn(domain);
      cdnStep.status = "complete";
      cdnStep.details = cdnResults.provider;
      cdnStep.isEU = cdnResults.isEU;
      cdnStep.euFriendly = cdnResults.euFriendly;
      yield { results: [...analysis], complete: false };

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

import { Container } from "@/components/layout/container";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { getFromRedis } from "@/lib/redis";
import { AnalysisClient } from "@/components/domain-analyzer/AnalysisClient";
import { AnalysisStep } from "@/lib/types";

// Helper to format domain name
function formatDomain(domain: string) {
  return domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
}

export default async function DomainAnalyzerPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const domainFromUrl = decodeURIComponent(domain);
  const formattedDomain = formatDomain(domainFromUrl);

  // Try to get cached results from Redis
  const cachedResults = await getFromRedis(`domain:${domainFromUrl}`);

  // Parse the cached results if they exist
  const initialResults = cachedResults
    ? (JSON.parse(cachedResults as string) as AnalysisStep[])
    : null;

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <div className="mb-6">
          <Link
            href="/tools/website"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to analyzer
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a3c5a]">
              Domain Analysis for {formattedDomain}
            </h1>
            <p className="text-[#334155] text-base sm:text-lg max-w-2xl">
              We&apos;ve analyzed this domain to check which services it uses
              and whether they&apos;re EU-based
            </p>
          </div>

          <AnalysisClient
            domain={domainFromUrl}
            formattedDomain={formattedDomain}
            initialResults={initialResults}
          />
        </div>
      </Container>
    </div>
  );
}

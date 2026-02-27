import { ArrowLeftIcon } from "lucide-react";
import { getFromRedis } from "@/lib/redis";
import { AnalysisClient } from "@/components/domain-analyzer/AnalysisClient";
import { AnalysisStep } from "@/lib/types";
import { Metadata } from "next";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Locale } from "next-intl";
import { NewsletterCta } from "@/components/NewsletterCta";
import Image from "next/image";

// Helper to format domain name
function formatDomain(domain: string) {
  return domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  // Await the params
  const { domain, locale } = await params;

  const domainFromUrl = decodeURIComponent(domain);
  const formattedDomain = formatDomain(domainFromUrl);

  return {
    title: `${formattedDomain} | switch-to.eu`,
    description: `Check if ${formattedDomain} uses EU-based services and is EU GDPR compliant.`,
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_URL}/${locale}/tools/domain/${domain}`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_URL}/en/tools/domain/${domain}`,
        nl: `${process.env.NEXT_PUBLIC_URL}/nl/tools/domain/${domain}`,
      },
    },
    openGraph: {
      title: `${formattedDomain} - switch-to.eu`,
      description: `Check if ${formattedDomain} uses EU-based services and is EU GDPR compliant.`,
      siteName: "switch-to.eu",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${formattedDomain} - EU Compliance Analysis`,
      description: `Check if ${formattedDomain} uses EU-based services and is EU GDPR compliant.`,
    },
  };
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
    ? (JSON.parse(cachedResults) as AnalysisStep[])
    : null;

  return (
    <main className="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
      {/* Hero / Domain Header */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-10 sm:py-14 overflow-hidden">
              {/* Decorative shape */}
              <div className="absolute -top-6 -right-6 w-36 h-36 sm:w-44 sm:h-44 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/sunburst.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ animationDuration: "8s", filter: "brightness(0) invert(1)" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <div className="relative z-10">
                <Link
                  href="/tools/website"
                  className="inline-flex items-center text-brand-sky/70 hover:text-brand-sky text-sm mb-4 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  Back to analyzer
                </Link>
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase text-brand-yellow">
                  {formattedDomain}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Results */}
      <section>
        <div className="container max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <AnalysisClient
            domain={domainFromUrl}
            formattedDomain={formattedDomain}
            initialResults={initialResults}
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterCta />
    </main>
  );
}

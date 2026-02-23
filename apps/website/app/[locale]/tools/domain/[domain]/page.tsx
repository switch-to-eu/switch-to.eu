import { Container } from "@/components/layout/container";
import { ArrowLeftIcon } from "lucide-react";
import { getFromRedis } from "@/lib/redis";
import { AnalysisClient } from "@/components/domain-analyzer/AnalysisClient";
import { AnalysisStep } from "@/lib/types";
import { Metadata } from "next";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Locale } from "next-intl";
import { NewsletterCta } from "@/components/NewsletterCta";

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
    <div className="py-8 sm:py-12">
      <Container className="relative max-w-3xl">
        <div className="absolute top-4 left-4">
          <Link
            href="/tools/website"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-6 h-6 mr-1" />
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#1a3c5a]">
              {formattedDomain}
            </h1>
          </div>

          <AnalysisClient
            domain={domainFromUrl}
            formattedDomain={formattedDomain}
            initialResults={initialResults}
          />
        </div>
      </Container>

      {/* Newsletter Section */}
      <section className="py-8">
        <Container>
          <NewsletterCta />
        </Container>
      </section>
    </div>
  );
}

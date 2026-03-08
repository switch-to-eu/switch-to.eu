import { ArrowLeftIcon } from "lucide-react";
import { AnalysisClient } from "@/components/domain-analyzer/AnalysisClient";
import { Metadata } from "next";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Locale } from "next-intl";
import { api } from "@/server/api/trpc-server";

function formatDomain(domain: string) {
  return domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { domain, locale } = await params;

  const domainFromUrl = decodeURIComponent(domain);
  const formattedDomain = formatDomain(domainFromUrl);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5015";

  return {
    title: `${formattedDomain} | switch-to.eu`,
    description: `Check if ${formattedDomain} uses EU-based services and is EU GDPR compliant.`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}/domain/${domain}`,
      languages: {
        en: `${baseUrl}/en/domain/${domain}`,
        nl: `${baseUrl}/nl/domain/${domain}`,
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

  const initialResults = await api.domain.getCached({ domain: domainFromUrl });

  return (
    <main>
      <Container>

      <Link
        href="/"
        className="inline-flex items-center text-foreground/50 hover:text-foreground text-sm transition-colors self-start"
        >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        Back
      </Link>
        </Container>

      <AnalysisClient
        domain={domainFromUrl}
        formattedDomain={formattedDomain}
        initialResults={initialResults}
      />
    </main>
  );
}

import { WebsiteAnalyzerClient } from "@/components/domain-analyzer/websiteClient";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

// Generate metadata with language alternates
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // Await the params
  const { locale } = await params;
  const t = await getTranslations("tools");

  return {
    title: `${t("websiteAnalyzer.pageTitle")} | switch-to.eu`,
    description: t("websiteTool.description"),
    keywords: [
      "EU website analyzer",
      "GDPR compliance checker",
      "EU services detector",
      "EU data sovereignty",
      "website EU compliance",
    ],
    alternates: {
      canonical: `https://switch-to.eu/${locale}/tools/website`,
      languages: {
        en: "https://switch-to.eu/en/tools/website",
        nl: "https://switch-to.eu/nl/tools/website",
      },
    },
  };
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function WebsiteAnalyzerPage({ params }: Props) {
  const { locale } = await params;

  return <WebsiteAnalyzerClient locale={locale} />;
}

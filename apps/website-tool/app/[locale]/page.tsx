import { WebsiteAnalyzerClient } from "@/components/domain-analyzer/websiteClient";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    alternates: generateLanguageAlternates("", locale),
  };
}

export default function WebsiteAnalyzerPage() {
  return <WebsiteAnalyzerClient />;
}

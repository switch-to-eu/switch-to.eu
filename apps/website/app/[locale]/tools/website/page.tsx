import { WebsiteAnalyzerClient } from "@/components/domain-analyzer/websiteClient";
import { getTranslations, getLocale } from "next-intl/server";
import { Metadata } from "next";
import { generateLanguageAlternates } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tools");
  const locale = await getLocale();

  return {
    title: t("websiteAnalyzer.pageTitle"),
    description: t("websiteTool.description"),
    alternates: generateLanguageAlternates("tools/website", locale),
  };
}

export default function WebsiteAnalyzerPage() {
  return <WebsiteAnalyzerClient />;
}

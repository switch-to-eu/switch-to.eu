import { WebsiteAnalyzerClient } from "@/components/domain-analyzer/websiteClient";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { generateLanguageAlternates } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tools");

  return {
    title: t("websiteAnalyzer.pageTitle"),
    description: t("websiteTool.description"),
    alternates: generateLanguageAlternates("tools/website"),
  };
}

export default async function WebsiteAnalyzerPage() {
  return <WebsiteAnalyzerClient />;
}

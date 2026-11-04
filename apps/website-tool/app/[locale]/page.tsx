import { WebsiteAnalyzerClient } from "@/components/domain-analyzer/websiteClient";
import type { Metadata, ResolvingMetadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@switch-to-eu/i18n/routing";
import { createPageMetadata } from "@switch-to-eu/i18n/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return createPageMetadata(parent, "", locale);
}

export default function WebsiteAnalyzerPage() {
  return <WebsiteAnalyzerClient />;
}

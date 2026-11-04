import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
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
  return createPageMetadata(parent, "privacy", locale);
}

export default function PrivacyPage() {
  const t = useTranslations('PrivacyPage');

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto prose">
        <h1>{t('title')}</h1>
        <p className="text-muted-foreground">{t('placeholder')}</p>
        {/* TODO: Full privacy policy page */}
      </div>
    </div>
  );
}

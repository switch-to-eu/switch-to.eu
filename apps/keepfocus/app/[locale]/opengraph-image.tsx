import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  generateToolOgImage,
  ogContentType,
  ogSize,
} from "@switch-to-eu/blocks/og/og-image";
import { routing } from "@switch-to-eu/i18n/routing";

export const alt = "KeepFocus by switch-to.eu";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "layout.metadata" });

  return generateToolOgImage({
    toolId: "keepfocus",
    title: t("title"),
    description: t("description"),
  });
}

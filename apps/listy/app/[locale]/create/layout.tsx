import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@switch-to-eu/i18n/routing";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return {
    alternates: generateLanguageAlternates("create", locale as Locale),
  };
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

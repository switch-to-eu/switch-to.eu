import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { routing } from "@/i18n/routing";
import { Locale } from "next-intl";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate language alternates for metadata
 * @param path - The path after the locale, should start without a slash (e.g., "contribute" not "/contribute")
 * @param baseUrl - The base URL of the site (default: process.env.NEXT_PUBLIC_URL)
 * @returns Object with canonical URL and languages object for alternates metadata
 */
export function generateLanguageAlternates(path: string, locale: Locale) {
  const siteUrl = process.env.NEXT_PUBLIC_URL || "";

  return {
    canonical: `${siteUrl}/${locale}/${path}`,
    languages: routing.locales.reduce(
      (acc, locale) => ({
        ...acc,
        [locale]: `${siteUrl}/${locale}/${path}`,
      }),
      {}
    ),
  };
}

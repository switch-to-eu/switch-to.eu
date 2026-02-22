import { routing, type Locale } from "./routing";

/**
 * Generate language alternates for metadata
 * @param path - The path after the locale, should start without a slash (e.g., "contribute" not "/contribute")
 * @param locale - The current locale
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
      {},
    ),
  };
}

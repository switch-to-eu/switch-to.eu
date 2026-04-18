import { routing, defaultLocale, type Locale } from "./routing";

/**
 * Generate language alternates for metadata
 * @param path - The path after the locale, should start without a slash (e.g., "contribute" not "/contribute")
 * @param locale - The current locale
 * @returns Object with canonical URL and languages object for alternates metadata
 */
export function generateLanguageAlternates(path: string, locale: Locale) {
  const siteUrl = process.env.NEXT_PUBLIC_URL || "";
  const suffix = path ? `/${path}` : "";

  return {
    canonical: `${siteUrl}/${locale}${suffix}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, `${siteUrl}/${l}${suffix}`]),
      ),
      "x-default": `${siteUrl}/${defaultLocale}${suffix}`,
    },
  };
}

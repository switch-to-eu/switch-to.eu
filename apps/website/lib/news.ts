import type { ArticleLocale } from "@/lib/content/types";

const DATE_LOCALES: Record<string, string> = { en: "en-GB", nl: "nl-NL", fr: "fr-FR" };

export const ARTICLE_LOCALE_NAMES: Record<ArticleLocale, string> = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
};

/** "2 November 2026" / "2 november 2026". Dates are YYYY-MM-DD strings. */
export function formatArticleDate(date: string, locale: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

/** Hostname without `www.`, for labelling outbound source links. */
export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

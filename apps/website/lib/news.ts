import type { ArticleLocale } from "@/lib/content/types";

/**
 * The news index, its menu item and its links. Off while the site publishes
 * its first articles. Article pages and the feed stay on.
 */
export const NEWS_INDEX_ENABLED = false;

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

/** Minutes to read a markdown body at ~220 words per minute (at least 1). */
export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

/** "Monday 2 November 2026" for the masthead dateline. */
export function formatDateline(date: Date, locale: string): string {
  const text = new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Brussels",
  }).format(date);
  // Capitalise the weekday only ("maandag" → "Maandag"), months stay as the locale writes them.
  return text.charAt(0).toUpperCase() + text.slice(1);
}

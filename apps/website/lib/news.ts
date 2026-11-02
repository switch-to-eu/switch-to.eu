import type { ArticleLocale } from "@/lib/content/types";

/**
 * Brand colour pairs that pass WCAG AA (4.5:1) for body text, in rotation
 * order. Orange and pink are left out: neither white nor brand green reaches
 * 4.5:1 on them, so they stay for shapes and large display type only.
 */
export const READABLE_CARD_COLORS = [
  { bg: "bg-brand-sky", text: "text-brand-green", pill: "bg-white text-brand-green", button: "bg-brand-green text-white" },
  { bg: "bg-brand-green", text: "text-white", pill: "bg-brand-yellow text-brand-green", button: "bg-white text-brand-green" },
  { bg: "bg-brand-yellow", text: "text-brand-green", pill: "bg-white text-brand-green", button: "bg-brand-green text-white" },
  { bg: "bg-brand-navy", text: "text-white", pill: "bg-brand-yellow text-brand-navy", button: "bg-white text-brand-navy" },
  { bg: "bg-brand-sage", text: "text-brand-green", pill: "bg-white text-brand-green", button: "bg-brand-green text-white" },
  { bg: "bg-brand-red", text: "text-white", pill: "bg-white text-brand-red", button: "bg-white text-brand-red" },
] as const;

export function getReadableCardColor(index: number) {
  return READABLE_CARD_COLORS[index % READABLE_CARD_COLORS.length]!;
}

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

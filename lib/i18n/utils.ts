import { locales, defaultLocale } from '@/middleware';
import { Locale } from './dictionaries';

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get the display name of a locale
 */
export function getLocaleDisplayName(locale: Locale): string {
  const displayNames: Record<Locale, string> = {
    en: 'English',
    nl: 'Nederlands',
  };
  return displayNames[locale] || locale;
}

/**
 * Get the other locales except the current one
 */
export function getAlternateLocales(currentLocale: Locale): Locale[] {
  return locales.filter(locale => locale !== currentLocale);
}

/**
 * Generate path for the same page in a different locale
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // If already has a locale prefix, replace it
  const pathWithoutLocale = path.replace(/^\/[^/]+(?=\/|$)/, '');
  return `/${locale}${pathWithoutLocale}`;
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get fallback locale
 */
export function getFallbackLocale(): Locale {
  return defaultLocale;
}
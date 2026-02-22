import { defineRouting } from "next-intl/routing";

export const locales = ["en", "nl"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale = "en" satisfies Locale;

export const localeNames: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale,
});

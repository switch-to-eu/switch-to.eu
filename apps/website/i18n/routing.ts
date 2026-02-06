import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "nl"],
  // Used when no locale matches
  defaultLocale: "nl",
});

export const localeNames: Record<(typeof routing.locales)[number], string> = {
  en: "English",
  nl: "Nederlands",
};

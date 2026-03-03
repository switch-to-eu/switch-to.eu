"use client";

import { Link, usePathname } from "@switch-to-eu/i18n/navigation";
import { type Locale, localeNames, routing } from "@switch-to-eu/i18n/routing";

interface MobileLanguageSelectorProps {
  locale: Locale;
}

export function MobileLanguageSelector({ locale }: MobileLanguageSelectorProps) {
  const pathname = usePathname();
  const otherLocales = routing.locales.filter((l) => l !== locale);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold uppercase text-tool-primary/40">
        {localeNames[locale]}
      </span>
      {otherLocales.map((otherLocale) => (
        <Link
          key={otherLocale}
          href={pathname}
          locale={otherLocale}
          className="rounded-md bg-tool-primary/10 px-3 py-1.5 text-sm font-semibold text-tool-primary hover:bg-tool-primary/20 transition-colors"
        >
          {localeNames[otherLocale]}
        </Link>
      ))}
    </div>
  );
}

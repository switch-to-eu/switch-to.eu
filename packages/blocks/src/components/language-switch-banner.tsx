"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@switch-to-eu/i18n/navigation";
import { locales, type Locale } from "@switch-to-eu/i18n/routing";
import { cn } from "@switch-to-eu/ui/lib/utils";

const DISMISS_KEY = "switch-to-eu:language-banner-dismissed";

function detectBrowserLocale(
  current: Locale,
  supported: readonly Locale[],
): Locale | null {
  if (typeof navigator === "undefined") return null;
  const candidates =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const candidate of candidates) {
    const prefix = candidate.slice(0, 2).toLowerCase();
    if ((supported as readonly string[]).includes(prefix)) {
      const match = prefix as Locale;
      return match === current ? null : match;
    }
  }
  return null;
}

export interface LanguageSwitchBannerProps {
  className?: string;
}

export function LanguageSwitchBanner({ className }: LanguageSwitchBannerProps) {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("languageBanner");
  const tLang = useTranslations("language");
  const [suggested, setSuggested] = useState<Locale | null>(null);

  useEffect(() => {
    const detected = detectBrowserLocale(currentLocale, locales);
    if (!detected) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === detected) return;
    } catch {
      // localStorage unavailable (private mode, SSR) — just show the banner
    }
    setSuggested(detected);
  }, [currentLocale]);

  if (!suggested) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, suggested);
    } catch {
      // ignore storage failures
    }
    setSuggested(null);
  };

  const languageName = tLang(suggested);

  return (
    <div
      role="region"
      aria-label={t("switch", { language: languageName })}
      className={cn("bg-brand-navy text-white", className)}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="text-sm">
          {t("message", { language: languageName })}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={pathname}
            locale={suggested}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-navy hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {t("switch", { language: languageName })}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("dismiss")}
            className="rounded-full p-1.5 text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

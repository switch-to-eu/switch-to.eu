"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useState } from "react";

// Define native language names
const nativeLanguageNames: Record<string, string> = {
  en: "English",
  nl: "Nederlands",
};

export function LanguageSelector() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const router = useRouter();
  const locales = routing.locales;

  // Track the current displayed locale in component state to ensure UI updates immediately
  const [displayedLocale, setDisplayedLocale] = useState(currentLocale);

  // Update displayed locale when actual locale changes
  useEffect(() => {
    setDisplayedLocale(currentLocale);
  }, [currentLocale]);

  // Handle locale change with proper path normalization
  const changeLocale = useCallback((newLocale: string) => {
    // Strip any existing locale prefix to prevent stacking
    let pathnameWithoutLocale = pathname;

    // Remove any locale prefixes like /en/ or /nl/
    locales.forEach(locale => {
      if (pathnameWithoutLocale.startsWith(`/${locale}`)) {
        pathnameWithoutLocale = pathnameWithoutLocale.replace(`/${locale}`, '') || '/';
      }
    });

    // Update UI immediately (before navigation completes)
    setDisplayedLocale(newLocale);

    // Navigate to the new locale
    router.replace(pathnameWithoutLocale === '' ? '/' : pathnameWithoutLocale, { locale: newLocale });
  }, [pathname, router, locales]);

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-sm font-medium text-muted-foreground"
          >
            {nativeLanguageNames[displayedLocale]} <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales
            .filter((otherLocale) => otherLocale !== displayedLocale)
            .map((otherLocale) => (
              <DropdownMenuItem
                key={otherLocale}
                onClick={() => changeLocale(otherLocale)}
              >
                {nativeLanguageNames[otherLocale]}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

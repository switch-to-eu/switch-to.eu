"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSelector() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("language");

  const locales = routing.locales;

  const changeLocale = (locale: string) => {
    router.replace(pathname, { locale: locale });
  };

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-sm font-medium text-muted-foreground"
          >
            {t(locale)} <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales
            .filter((otherLocale) => otherLocale !== locale)
            .map((otherLocale) => (
              <DropdownMenuItem
                key={otherLocale}
                onClick={() => changeLocale(otherLocale)}
              >
                <Link
                  locale={otherLocale}
                  href={pathname}
                  className="w-full cursor-pointer"
                >
                  {t(otherLocale)}
                </Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

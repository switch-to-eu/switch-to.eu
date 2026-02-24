"use client";

import { Button } from "@switch-to-eu/ui/components/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@switch-to-eu/ui/components/dropdown-menu";

import { ChevronDown } from "lucide-react";
import { Locale } from "next-intl";

import { localeNames, routing } from "@switch-to-eu/i18n/routing";
import { Link, usePathname } from "@switch-to-eu/i18n/navigation";
export function LanguageSelector({
    locale: currentLocale,
}: {
    locale: Locale;
}) {
    const locales = routing.locales;
    const pathname = usePathname();

    const otherLocales = locales.filter((locale) => locale !== currentLocale);

    return (
        <div className="flex items-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center text-sm font-medium text-muted-foreground"
                    >
                        {localeNames[currentLocale]}
                        <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    {otherLocales.map((otherLocale) => (
                        <DropdownMenuItem key={otherLocale} asChild>
                            <Link href={pathname} locale={otherLocale}>
                                {localeNames[otherLocale]}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

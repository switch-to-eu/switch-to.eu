'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { locales } from '@/middleware';
import { Locale } from '@/lib/i18n/dictionaries';
import { getLocaleDisplayName, getLocalizedPath } from '@/lib/i18n/utils';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  lang: Locale;
}

export function LanguageSelector({ lang }: LanguageSelectorProps) {
  const pathname = usePathname();

  // Filter out the current language
  const alternateLocales = locales.filter(locale => locale !== lang);

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-sm font-medium text-muted-foreground"
          >
            {getLocaleDisplayName(lang)} <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {alternateLocales.map((locale) => (
            <DropdownMenuItem key={locale} asChild>
              <Link
                href={getLocalizedPath(pathname, locale)}
                className="w-full cursor-pointer"
              >
                {getLocaleDisplayName(locale)}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
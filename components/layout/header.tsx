import Link from "next/link";
import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Container } from "@/components/layout/container";
import { Locale } from "@/lib/i18n/dictionaries";
import { LanguageSelector } from "@/components/navigation/language-selector";

interface HeaderProps {
  lang: Locale;
}

export function Header({ lang }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        <Link href={`/${lang}`} className="flex items-center space-x-2">
          <h1 className="font-bold font-bricolage-grotesque text-xl md:text-2xl">
            Switch-to.eu
          </h1>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <MainNav lang={lang} />
          <LanguageSelector lang={lang} />
        </div>
        <div className="md:hidden">
          <MobileNav lang={lang} />
        </div>
      </Container>
    </header>
  );
}

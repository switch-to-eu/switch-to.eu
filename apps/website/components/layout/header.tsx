import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Container } from "@/components/layout/container";
import { LanguageSelector } from "@/components/navigation/language-selector";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function Header() {
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        <Link href={`/`} className="flex items-center space-x-2">
          <h1 className="font-bold font-bricolage-grotesque text-xl md:text-2xl">
            switch-to.eu
          </h1>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <MainNav />

          <LanguageSelector locale={locale} />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}

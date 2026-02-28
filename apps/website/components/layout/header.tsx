import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SearchInput } from "@/components/SearchInput";
import { Header as BlocksHeader } from "@switch-to-eu/blocks/components/header";
import { NavLanguageSelector } from "@/components/navigation/NavLanguageSelector";
import { Link } from "@switch-to-eu/i18n/navigation";
import { useLocale } from "next-intl";
import type { Locale } from "@switch-to-eu/i18n/routing";

export function Header() {
  const locale = useLocale() as Locale;

  return (
    <BlocksHeader
      className="!bg-gray-300 !border-b-0"
      logo={
        <Link href={`/`} className="flex items-center">
          <h1
            style={{ fontFamily: "var(--font-bonbance)", fontWeight: 400 }}
            className="text-2xl md:text-3xl tracking-wide text-brand-navy"
          >
            Switch.to-eu
          </h1>
        </Link>
      }
      navigation={
        <>
          <MainNav />
          <NavLanguageSelector locale={locale} />
          <SearchInput buttonVariant="ghost" className="text-brand-navy hover:bg-transparent hover:underline" />
        </>
      }
      mobileNavigation={<MobileNav />}
    />
  );
}

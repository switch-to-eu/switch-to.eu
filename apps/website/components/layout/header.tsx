import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SearchInput } from "@/components/SearchInput";
import { Header as BlocksHeader } from "@switch-to-eu/blocks/components/header";
import { LanguageSelector } from "@switch-to-eu/blocks/components/language-selector";
import { Link } from "@switch-to-eu/i18n/navigation";
import { useLocale } from "next-intl";

export function Header() {
  const locale = useLocale();

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
          <LanguageSelector locale={locale} className="text-brand-navy uppercase tracking-wide hover:bg-transparent hover:underline" />
          <SearchInput buttonVariant="ghost" className="text-brand-navy hover:bg-transparent hover:underline" />
        </>
      }
      mobileNavigation={<MobileNav />}
    />
  );
}

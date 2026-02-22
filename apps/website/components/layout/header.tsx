import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Header as BlocksHeader } from "@switch-to-eu/blocks/components/header";
import { LanguageSelector } from "@switch-to-eu/blocks/components/language-selector";
import { Link } from "@switch-to-eu/i18n/navigation";
import { useLocale } from "next-intl";

export function Header() {
  const locale = useLocale();

  return (
    <BlocksHeader
      logo={
        <Link href={`/`} className="flex items-center space-x-2">
          <h1 className="font-bold font-bricolage-grotesque text-xl md:text-2xl">
            switch-to.eu
          </h1>
        </Link>
      }
      navigation={
        <>
          <MainNav />
          <LanguageSelector locale={locale} />
        </>
      }
      mobileNavigation={<MobileNav />}
    />
  );
}

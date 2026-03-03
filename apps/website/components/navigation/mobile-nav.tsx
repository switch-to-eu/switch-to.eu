import { getNavItems } from "./nav-items";
import { MobileNav as BlocksMobileNav } from "@switch-to-eu/blocks/components/mobile-nav";
import { SearchInput } from "@/components/SearchInput";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { MobileCategoryIcon } from "./MobileCategoryIcon";
import type { Locale } from "@switch-to-eu/i18n/routing";

export async function MobileNav() {
  const locale = await getLocale() as Locale;
  const navItems = await getNavItems();
  const t = await getTranslations("navigation");

  return (
    <BlocksMobileNav
      navItems={navItems}
      locale={locale}
      menuLabel={t("mobileMenu")}
      renderDropdownChild={(child) => (
        <Link
          href={child.href}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] font-medium text-brand-navy transition-colors hover:bg-brand-navy/5"
        >
          {child.icon && <MobileCategoryIcon iconName={child.icon} />}
          {child.title}
        </Link>
      )}
    >
      <SearchInput
        buttonVariant="ghost"
        className="w-full justify-start text-brand-navy hover:text-brand-pink hover:bg-brand-yellow/10"
      />
    </BlocksMobileNav>
  );
}

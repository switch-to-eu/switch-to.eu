import { ExternalLink } from "lucide-react";
import { getNavItems } from "./nav-items";
import { MobileNav as BlocksMobileNav } from "@switch-to-eu/blocks/components/mobile-nav";
import { SearchInput } from "@/components/SearchInput";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { MobileCategoryIcon } from "./MobileCategoryIcon";
import { MobileToolIcon } from "./MobileToolIcon";

export async function MobileNav() {
  const locale = await getLocale();
  const navItems = await getNavItems();
  const t = await getTranslations("navigation");

  return (
    <BlocksMobileNav
      navItems={navItems}
      locale={locale}
      menuLabel={t("mobileMenu")}
      colorClassName="text-brand-navy"
      renderDropdownChild={(child) => {
        if (child.disabled) {
          return (
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] font-medium text-brand-navy/40 cursor-default">
              {child.icon && <MobileToolIcon iconName={child.icon} />}
              {child.title}
            </div>
          );
        }

        return (
          <Link
            href={child.href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] font-medium text-brand-navy transition-colors hover:bg-brand-navy/5"
            {...(child.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {child.icon && (
              child.isExternal
                ? <MobileToolIcon iconName={child.icon} />
                : <MobileCategoryIcon iconName={child.icon} />
            )}
            {child.title}
            {child.isExternal && <ExternalLink className="h-3 w-3 opacity-40" />}
          </Link>
        );
      }}
    >
      <SearchInput
        buttonVariant="ghost"
        className="w-full justify-start text-brand-navy hover:text-brand-pink hover:bg-brand-yellow/10"
      />
    </BlocksMobileNav>
  );
}

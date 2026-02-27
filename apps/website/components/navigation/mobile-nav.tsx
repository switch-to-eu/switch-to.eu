import { Menu } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@switch-to-eu/ui/components/sheet";
import { getNavItems } from "./nav-items";
import { LanguageSelector } from "@switch-to-eu/blocks/components/language-selector";
import { SearchInput } from "@/components/SearchInput";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";

export async function MobileNav() {
  const locale = await getLocale();
  const navItems = await getNavItems();

  const t = await getTranslations("navigation");
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-brand-navy hover:bg-brand-navy/10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("mobileMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col gap-6 pt-10 px-5 overflow-y-auto max-h-screen bg-brand-pink border-r-brand-navy/10"
      >
        {navItems.map((item) => {
          if (item.dropdown && item.children) {
            return (
              <div key={item.href} className="flex flex-col gap-2">
                <p className="text-lg font-medium text-brand-navy/50 pl-1">
                  {item.title}
                </p>

                <div className="flex flex-col gap-2 pl-6">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="text-base font-medium text-brand-navy transition-colors hover:text-brand-pink"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            item.href && (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-brand-navy transition-colors hover:text-brand-pink pl-1"
                {...(item.isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.title}
              </Link>
            )
          );
        })}

        <div className="mt-4">
          <LanguageSelector locale={locale} />
        </div>

        <div className="mb-2">
          <SearchInput
            buttonVariant="ghost"
            className="w-full justify-start text-brand-navy hover:text-brand-pink hover:bg-brand-yellow/10"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

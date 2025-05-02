import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getNavItems } from "./nav-items";
import { LanguageSelector } from "@/components/navigation/language-selector";
import { SearchInput } from "@/components/SearchInput";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function MobileNav() {
  const navItems = await getNavItems();
  const t = await getTranslations("navigation");
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("mobileMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col gap-6 pt-10 px-5 overflow-y-auto max-h-screen"
      >
        {navItems.map((item) => {
          // Handle dropdown items (Services)
          if (item.dropdown && item.children) {
            return (
              <div key={item.href} className="flex flex-col gap-2">
                <p className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary pl-1">
                  {item.title}
                </p>

                <div className="flex flex-col gap-2 pl-6">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          // Regular nav items
          return (
            item.href && (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary pl-1"
                {...(item.isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.title}
              </Link>
            )
          );
        })}

        {/* Language Selector */}
        <div className="mt-4">
          <LanguageSelector />
        </div>

        {/* Search Input */}
        <div className="mb-2">
          <SearchInput
            buttonVariant="outline"
            className="w-full justify-start"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

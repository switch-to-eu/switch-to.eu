import { type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@switch-to-eu/ui/components/sheet";
import { Link } from "@switch-to-eu/i18n/navigation";
import { type Locale } from "@switch-to-eu/i18n/routing";
import { NavLanguageSelector } from "./nav-language-selector";
import type { MainNavItem, SubNavItem } from "./nav-types";

interface MobileNavProps {
  navItems: MainNavItem[];
  locale: Locale;
  /** Label for the menu button (sr-only). Defaults to "Menu". */
  menuLabel?: string;
  /** Custom renderer for dropdown children in mobile view */
  renderDropdownChild?: (child: SubNavItem) => ReactNode;
  /** Extra content at the bottom of the mobile nav (e.g. SearchInput, HeaderFeedback, Create button) */
  children?: ReactNode;
}

function DefaultDropdownChild({ child }: { child: SubNavItem }) {
  return (
    <Link
      href={child.href}
      className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-base font-medium text-tool-primary transition-colors hover:bg-tool-primary/5"
      {...(child.isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {child.title}
    </Link>
  );
}

export function MobileNav({ navItems, locale, menuLabel = "Menu", renderDropdownChild, children }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-tool-primary-foreground hover:bg-tool-primary-foreground/10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{menuLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col gap-6 pt-10 px-5 overflow-y-auto max-h-screen bg-tool-surface border-r-tool-primary/10"
      >
        {navItems.map((item) => {
          if (item.dropdown && item.children) {
            return (
              <div key={item.title} className="flex flex-col gap-2">
                <p className="text-lg font-medium text-tool-primary/50 pl-1">
                  {item.title}
                </p>

                <div className="flex flex-col gap-1 pl-2">
                  {item.children.map((child) =>
                    renderDropdownChild
                      ? <div key={child.href}>{renderDropdownChild(child)}</div>
                      : <DefaultDropdownChild key={child.href} child={child} />
                  )}
                </div>
              </div>
            );
          }

          return (
            item.href && (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-tool-primary transition-colors hover:text-tool-accent pl-1"
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
          <NavLanguageSelector locale={locale} />
        </div>

        {children && (
          <div className="flex flex-col gap-2">
            {children}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

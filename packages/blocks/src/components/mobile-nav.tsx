import { type ReactNode } from "react";
import { ExternalLink, Menu } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@switch-to-eu/ui/components/sheet";
import { Link } from "@switch-to-eu/i18n/navigation";
import { type Locale } from "@switch-to-eu/i18n/routing";
import { MobileLanguageSelector } from "./mobile-language-selector";
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
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] font-medium text-tool-primary transition-colors hover:bg-tool-primary/5"
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
        className="flex flex-col gap-0 p-0 overflow-y-auto max-h-screen bg-white border-r border-tool-primary/10 w-[85%] sm:max-w-sm"
      >
        <nav className="flex flex-col gap-0 pt-12">
          {navItems.map((item, index) => {
            const isFirst = index === 0;

            if (item.dropdown && item.children) {
              return (
                <div key={item.title} className={isFirst ? "" : "border-t border-tool-primary/10"}>
                  <p className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-tool-primary/40">
                    {item.title}
                  </p>
                  <div className="flex flex-col gap-0 px-2 pb-3">
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
                  className="flex items-center gap-2 border-t border-tool-primary/10 px-5 py-3.5 text-[15px] font-semibold text-tool-primary transition-colors hover:bg-tool-primary/5"
                  {...(item.isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {item.title}
                  {item.isExternal && <ExternalLink className="h-3.5 w-3.5 opacity-40" />}
                </Link>
              )
            );
          })}
        </nav>

        <div className="mt-auto border-t border-tool-primary/10 px-5 py-4 flex flex-col gap-3">
          {children}
          <MobileLanguageSelector locale={locale} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { SearchInput } from "@/components/SearchInput";
import { cn } from "@/lib/utils";
import { getNavItems } from "./nav-items";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { toClientLocale } from "@/lib/i18n/locale-adapter";

// Import server-side Locale but rename to avoid conflict
import type { Locale as ServerLocale } from "@/lib/i18n/dictionaries";

interface MainNavProps {
  className?: string;
  lang: ServerLocale;
}

export async function MainNav({ className, lang }: MainNavProps) {
  const navItems = await getNavItems(lang);
  const dict = await getDictionary(lang);

  // Convert server locale to client locale using our utility
  const clientLang = toClientLocale(lang);

  return (
    <div className="flex items-center justify-between w-full">
      <nav
        className={cn(
          "flex items-center space-x-4 lg:space-x-6 mr-4",
          className
        )}
      >
        {navItems
          .filter((item) => !item.mobileOnly)
          .map((item) => {
            // Handle dropdown items (Services)
            if (item.dropdown && item.children) {
              return (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none">
                    {item.title} <ChevronDown className="ml-1 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link
                          href={child.href}
                          className="w-full cursor-pointer"
                        >
                          {child.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            // Special styling for home link
            const isHome = item.href === "/";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium ${isHome ? "" : "text-muted-foreground"
                  } transition-colors hover:text-primary`}
                {...(item.isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.title}
              </Link>
            );
          })}
      </nav>

      {/* Add search input to navigation */}
      <SearchInput lang={clientLang} dict={dict} />
    </div>
  );
}

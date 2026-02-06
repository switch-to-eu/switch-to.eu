import { SearchInput } from "@/components/SearchInput";
import { cn } from "@switch-to-eu/ui";
import { getNavItems } from "./nav-items";
import { Link } from "@/i18n/navigation";
import { NavDropdown } from "./NavDropdown";

interface MainNavProps {
  className?: string;
}

export async function MainNav({ className }: MainNavProps) {
  const navItems = await getNavItems();

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
          .map((item, index) => {
            // Handle dropdown items (Services)
            if (item.dropdown && item.children) {
              return (
                <NavDropdown
                  key={index}
                  title={item.title}
                  items={item.children}
                />
              );
            }

            // Special styling for home link
            const isHome = item.href === "/";

            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium ${
                  isHome ? "" : "text-muted-foreground"
                } transition-colors hover:text-primary`}
                {...(item.isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.title}
              </Link>
            ) : (
              ""
            );
          })}
      </nav>

      {/* Add search input to navigation */}
      <SearchInput />
    </div>
  );
}

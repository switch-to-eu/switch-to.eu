import { cn } from "@switch-to-eu/ui/lib/utils";
import { getNavItems } from "./nav-items";
import { Link } from "@switch-to-eu/i18n/navigation";
import { NavDropdown } from "./NavDropdown";

interface MainNavProps {
  className?: string;
}

export async function MainNav({ className }: MainNavProps) {
  const navItems = await getNavItems();

  return (
    <nav
      className={cn(
        "flex items-center space-x-4 lg:space-x-6",
        className
      )}
    >
      {navItems
        .filter((item) => !item.mobileOnly)
        .map((item, index) => {
          if (item.dropdown && item.children) {
            return (
              <NavDropdown
                key={index}
                title={item.title}
                items={item.children}
              />
            );
          }

          return item.href ? (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-brand-navy uppercase tracking-wide transition-colors hover:underline"
              style={{ fontFamily: "var(--font-hanken-grotesk-bold)", fontWeight: 700 }}
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
  );
}

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getNavItems } from "./nav-items";

export function MobileNav() {
  const navItems = getNavItems();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col gap-6 pt-10 px-5">
        {navItems.map((item) => {
          // Handle dropdown items (Services)
          if (item.dropdown && item.children) {
            return (
              <div key={item.href} className="flex flex-col gap-2">
                <Link
                  href={item.href}
                  className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary pl-1"
                >
                  {item.title}
                </Link>
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
            <Link
              key={item.href}
              href={item.href}
              className={`text-lg font-medium ${
                item.href === "/" ? "" : "text-muted-foreground"
              } transition-colors hover:text-primary pl-1`}
              {...(item.isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.title}
            </Link>
          );
        })}
      </SheetContent>
    </Sheet>
  );
}

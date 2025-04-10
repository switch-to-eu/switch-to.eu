import Link from "next/link";
import { Menu } from "lucide-react";
import { getAllCategoriesMetadata } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
  // Get all categories for the dropdown menu
  const categories = getAllCategoriesMetadata();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col gap-6 pt-10 px-5">
        <Link
          href="/"
          className="text-lg font-medium transition-colors hover:text-primary pl-1"
        >
          Home
        </Link>
        <Link
          href="/guides"
          className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary pl-1"
        >
          Guides
        </Link>

        {/* Services with subcategories */}
        <div className="flex flex-col gap-2">
          <Link
            href="/services"
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary pl-1"
          >
            Services
          </Link>
          <div className="flex flex-col gap-2 pl-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {category.metadata.title}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/about"
          className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary pl-1"
        >
          About
        </Link>
        <Link
          href="/contribute"
          className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary pl-1"
        >
          Contribute
        </Link>
        <Link
          href="https://github.com/VincentPeters/switch-to.eu"
          className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary pl-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
      </SheetContent>
    </Sheet>
  );
}
import Link from "next/link";
import { getAllCategoriesMetadata } from "@/lib/content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { SearchInput } from "@/components/SearchInput";
import { cn } from "@/lib/utils";

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  // Get all categories for the dropdown menu
  const categories = getAllCategoriesMetadata();

  return (
    <div className="flex items-center justify-between w-full">
      <nav className={cn("flex items-center space-x-4 lg:space-x-6 mr-4", className)}>
        <Link
          href="/"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Home
        </Link>



        {/* Services Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none">
            Services <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link
                href="/services"
                className="w-full cursor-pointer"
              >
                All Categories
              </Link>
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem key={category.slug} asChild>
                <Link
                  href={`/services/${category.slug}`}
                  className="w-full cursor-pointer"
                >
                  {category.metadata.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/about"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          About
        </Link>

        <Link
          href="/contribute"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Contribute
        </Link>

      </nav>

      {/* Add search input to navigation */}
      <SearchInput />
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@switch-to-eu/ui/components/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Link } from "@switch-to-eu/i18n/navigation";
import { cn } from "@switch-to-eu/ui/lib/utils";

export type DropdownItem = {
  title: string;
  href: string;
  isExternal?: boolean;
};

interface NavDropdownProps {
  title: string;
  items: DropdownItem[];
  className?: string;
}

export function NavDropdown({ title, items, className }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex cursor-pointer items-center text-sm text-brand-navy uppercase tracking-wide transition-colors hover:underline focus-visible:outline-none [font-family:var(--font-hanken-grotesk-bold)] [font-weight:700]",
          className
        )}
      >
        {title} <ChevronDown className="ml-1 h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-brand-pink border-brand-navy/10">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.href}
            onClick={handleItemClick}
            className="text-brand-navy hover:text-brand-navy/70 focus:text-brand-navy/70 focus:bg-brand-navy/5"
          >
            <Link
              href={item.href}
              className="w-full cursor-pointer"
              {...(item.isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { NavMenu } from "@switch-to-eu/blocks/components/nav-menu";
import { MegaCategoryItem } from "./MegaCategoryItem";
import type { MainNavItem } from "@switch-to-eu/blocks/components/nav-types";

interface MainNavClientProps {
  navItems: MainNavItem[];
  className?: string;
}

export function MainNavClient({ navItems, className }: MainNavClientProps) {
  return (
    <NavMenu
      navItems={navItems}
      className={className}
      renderMegaItem={(child, onClose) => (
        <MegaCategoryItem key={child.href} child={child} onClose={onClose} />
      )}
    />
  );
}

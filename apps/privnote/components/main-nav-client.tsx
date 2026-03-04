"use client";

import { NavMenu } from "@switch-to-eu/blocks/components/nav-menu";
import { MegaToolItem } from "./mega-tool-item";
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
        <MegaToolItem key={child.href} child={child} onClose={onClose} />
      )}
    />
  );
}

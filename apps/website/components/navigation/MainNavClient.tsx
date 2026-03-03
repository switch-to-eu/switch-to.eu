"use client";

import { NavMenu } from "@switch-to-eu/blocks/components/nav-menu";
import { MegaCategoryItem } from "./MegaCategoryItem";
import { MegaToolItem } from "./MegaToolItem";
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
      renderMegaItem={(child, onClose, parent) => {
        if (parent.href === "/tools") {
          return <MegaToolItem key={child.href} child={child} onClose={onClose} />;
        }
        return <MegaCategoryItem key={child.href} child={child} onClose={onClose} />;
      }}
    />
  );
}

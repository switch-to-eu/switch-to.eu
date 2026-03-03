"use client";

import { Link } from "@switch-to-eu/i18n/navigation";
import { getCategoryIcon, getCategoryShape } from "./category-icons";
import type { SubNavItem } from "@switch-to-eu/blocks/components/nav-types";

interface MegaCategoryItemProps {
  child: SubNavItem;
  onClose: () => void;
}

export function MegaCategoryItem({ child, onClose }: MegaCategoryItemProps) {
  const Icon = getCategoryIcon(child.icon);
  const shape = getCategoryShape(child.icon);

  return (
    <Link
      href={child.href}
      onClick={onClose}
      className="group/item flex items-start gap-3 rounded-xl px-4 py-3.5 text-brand-navy hover:bg-white focus:bg-white outline-none"
    >
      <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center">
        <div
          className="absolute inset-0 bg-brand-navy/10 transition-colors group-hover/item:bg-brand-yellow"
          style={{
            maskImage: `url(${shape})`,
            WebkitMaskImage: `url(${shape})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
        <Icon className="relative h-[18px] w-[18px] text-brand-navy transition-colors group-hover/item:text-brand-green" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold leading-tight text-brand-navy">
          {child.title}
        </span>
        {child.description && (
          <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
            {child.description}
          </span>
        )}
      </div>
    </Link>
  );
}

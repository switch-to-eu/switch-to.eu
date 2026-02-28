"use client";

import { getCategoryIcon } from "./category-icons";

interface MobileCategoryIconProps {
  iconName: string;
}

export function MobileCategoryIcon({ iconName }: MobileCategoryIconProps) {
  const Icon = getCategoryIcon(iconName);
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-navy/8 text-brand-navy">
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

"use client";

import { getToolIcon } from "./tool-icons";

interface MobileToolIconProps {
  iconName: string;
}

export function MobileToolIcon({ iconName }: MobileToolIconProps) {
  const Icon = getToolIcon(iconName);
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-navy/8 text-brand-navy">
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

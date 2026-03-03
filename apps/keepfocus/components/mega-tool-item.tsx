"use client";

import {
  Globe,
  Calendar,
  ListChecks,
  Target,
  FileLock,
  Brain,
  KanbanSquare,
  type LucideIcon,
  Layers,
} from "lucide-react";
import type { SubNavItem } from "@switch-to-eu/blocks/components/nav-types";

const iconMap: Record<string, LucideIcon> = {
  globe: Globe,
  calendar: Calendar,
  "list-checks": ListChecks,
  target: Target,
  "file-lock": FileLock,
  brain: Brain,
  "kanban-square": KanbanSquare,
};

function getToolIcon(iconName?: string): LucideIcon {
  if (!iconName) return Layers;
  return iconMap[iconName] ?? Layers;
}

interface MegaToolItemProps {
  child: SubNavItem;
  onClose: () => void;
}

export function MegaToolItem({ child, onClose }: MegaToolItemProps) {
  const isComingSoon = child.title.endsWith("::soon");
  const displayTitle = isComingSoon ? child.title.replace("::soon", "") : child.title;
  const Icon = getToolIcon(child.icon);

  return (
    <a
      href={isComingSoon ? undefined : child.href}
      target={isComingSoon ? undefined : "_blank"}
      rel={isComingSoon ? undefined : "noopener noreferrer"}
      onClick={onClose}
      className={`group/item flex items-start gap-3 rounded-xl px-4 py-3.5 outline-none ${isComingSoon ? 'opacity-50 cursor-default' : 'text-brand-navy hover:bg-white focus:bg-white'}`}
    >
      <div className={`relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isComingSoon ? 'bg-brand-navy/5' : 'bg-brand-navy/8 group-hover/item:bg-brand-yellow'}`}>
        <Icon className={`h-[18px] w-[18px] transition-colors ${isComingSoon ? 'text-brand-navy/40' : 'text-brand-navy group-hover/item:text-brand-green'}`} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold leading-tight text-brand-navy flex items-center gap-2">
          {displayTitle}
          {isComingSoon && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-brand-navy/40 bg-brand-navy/5 rounded-full px-2 py-0.5">
              Soon
            </span>
          )}
        </span>
        {child.description && (
          <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
            {child.description}
          </span>
        )}
      </div>
    </a>
  );
}

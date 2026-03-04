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
  const Icon = getToolIcon(child.icon);

  return (
    <a
      href={child.disabled ? undefined : child.href}
      target={child.disabled ? undefined : "_blank"}
      rel={child.disabled ? undefined : "noopener noreferrer"}
      onClick={onClose}
      className={`group/item flex items-start gap-3 rounded-xl px-4 py-3.5 outline-none ${child.disabled ? 'opacity-50 cursor-default' : 'text-brand-navy hover:bg-white focus:bg-white'}`}
    >
      <div className={`relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${child.disabled ? 'bg-brand-navy/5' : 'bg-brand-navy/8 group-hover/item:bg-brand-yellow'}`}>
        <Icon className={`h-[18px] w-[18px] transition-colors ${child.disabled ? 'text-brand-navy/40' : 'text-brand-navy group-hover/item:text-brand-green'}`} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold leading-tight text-brand-navy flex items-center gap-2">
          {child.title}
          {child.disabled && (
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

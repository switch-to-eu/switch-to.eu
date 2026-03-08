"use client";

import { ExternalLink } from "lucide-react";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getToolIcon, getToolShape } from "../data/tool-icons";
import type { SubNavItem } from "./nav-types";

interface MegaToolItemProps {
  child: SubNavItem;
  onClose: () => void;
}

function ShapeMask({ shape, className }: { shape: string; className?: string }) {
  return (
    <div
      className={className}
      style={{
        maskImage: `url("${shape}")`,
        WebkitMaskImage: `url("${shape}")`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function MegaToolItem({ child, onClose }: MegaToolItemProps) {
  const Icon = getToolIcon(child.icon);
  const shape = getToolShape(child.icon);

  if (child.disabled) {
    return (
      <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 opacity-40 cursor-default">
        <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center">
          <ShapeMask shape={shape} className="absolute inset-0 bg-tool-primary/10" />
          <Icon className="relative h-[18px] w-[18px] text-tool-primary" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold leading-tight text-tool-primary">
            {child.title}
          </span>
          {child.description && (
            <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
              {child.description}
            </span>
          )}
        </div>
      </div>
    );
  }

  const isExternal = child.isExternal;

  return (
    <Link
      href={child.href}
      onClick={onClose}
      className="group/item flex items-start gap-3 rounded-xl px-4 py-3.5 text-tool-primary hover:bg-white focus:bg-white outline-none"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center">
        <ShapeMask
          shape={shape}
          className="absolute inset-0 bg-tool-primary/10 transition-colors group-hover/item:bg-brand-yellow"
        />
        <Icon className="relative h-[18px] w-[18px] text-tool-primary transition-colors group-hover/item:text-brand-green" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold leading-tight text-tool-primary">
          {child.title}
          {isExternal && <ExternalLink className="h-3 w-3 opacity-40 group-hover/item:opacity-70 transition-opacity" />}
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

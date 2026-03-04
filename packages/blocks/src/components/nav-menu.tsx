"use client";

import { type ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { Link } from "@switch-to-eu/i18n/navigation";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { useNavDropdown } from "../hooks/use-nav-dropdown";
import type { MainNavItem, SubNavItem } from "./nav-types";

interface NavMenuProps {
  navItems: MainNavItem[];
  className?: string;
  /** Custom renderer for mega dropdown children. If not provided, renders title + description. */
  renderMegaItem?: (child: SubNavItem, onClose: () => void, parent: MainNavItem) => ReactNode;
}

function DefaultMegaItem({ child, onClose }: { child: SubNavItem; onClose: () => void }) {
  return (
    <Link
      key={child.href}
      href={child.href}
      onClick={onClose}
      className="group/item flex flex-col gap-0.5 rounded-xl px-4 py-3.5 text-tool-primary hover:bg-white focus:bg-white outline-none"
    >
      <span className="text-sm font-semibold leading-tight text-tool-primary">
        {child.title}
      </span>
      {child.description && (
        <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
          {child.description}
        </span>
      )}
    </Link>
  );
}

export function NavMenu({ navItems, className, renderMegaItem }: NavMenuProps) {
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [openId, setOpenId] = useState<string | null>(null);
  const { headerPos, mounted, open: baseOpen, scheduleClose: baseScheduleClose, cancelClose } = useNavDropdown();

  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const open = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    baseOpen();
    setOpenId(id);
  }, [baseOpen]);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenId(null), 150);
    baseScheduleClose();
  }, [baseScheduleClose]);

  const cancelMegaClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    cancelClose();
  }, [cancelClose]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [openId]);

  const getSimpleDropdownLeft = (id: string) => {
    const trigger = triggerRefs.current.get(id);
    if (!trigger) return 0;
    return trigger.getBoundingClientRect().left;
  };

  const onClose = useCallback(() => setOpenId(null), []);

  return (
    <>
      <nav className={cn("flex items-center gap-1 lg:gap-2", className)}>
        {navItems.map((item, index) => {
          const id = item.title;

          if (item.dropdown && item.children && item.href) {
            // Hybrid: clickable link that also opens a dropdown on hover
            return (
              <Link
                key={index}
                ref={(el: HTMLAnchorElement | null) => {
                  if (el) triggerRefs.current.set(id, el as unknown as HTMLButtonElement);
                }}
                href={item.href}
                onMouseEnter={() => open(id)}
                onMouseLeave={scheduleClose}
                className="group flex items-center gap-1 px-4 py-2 text-sm text-tool-primary uppercase tracking-wide hover:underline [font-family:var(--font-hanken-grotesk-bold)] [font-weight:700]"
              >
                {item.title}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    openId === id && "rotate-180"
                  )}
                />
              </Link>
            );
          }

          if (item.dropdown && item.children) {
            return (
              <button
                key={index}
                ref={(el) => {
                  if (el) triggerRefs.current.set(id, el);
                }}
                onMouseEnter={() => open(id)}
                onMouseLeave={scheduleClose}
                onClick={() => openId === id ? setOpenId(null) : open(id)}
                className="group flex cursor-pointer items-center gap-1 bg-transparent px-4 py-2 text-sm text-tool-primary uppercase tracking-wide hover:underline focus:outline-none [font-family:var(--font-hanken-grotesk-bold)] [font-weight:700]"
              >
                {item.title}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    openId === id && "rotate-180"
                  )}
                />
              </button>
            );
          }

          if (item.href) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 items-center px-4 py-2 text-sm text-tool-primary uppercase tracking-wide hover:underline [font-family:var(--font-hanken-grotesk-bold)] [font-weight:700]"
                {...(item.isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.title}
              </Link>
            );
          }

          return null;
        })}
      </nav>

      {mounted && openId && headerPos && navItems.map((item) => {
        if (item.title !== openId || !item.children) return null;

        if (item.dropdown === "mega") {
          return createPortal(
            <div
              key={item.title}
              onMouseEnter={cancelMegaClose}
              onMouseLeave={scheduleClose}
              className="fixed z-40 rounded-b-2xl border border-t-0 border-border bg-muted shadow-lg shadow-black/8"
              style={{
                top: headerPos.top,
                left: headerPos.containerLeft,
                width: headerPos.containerWidth,
              }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 p-2">
                {item.children.map((child) =>
                  renderMegaItem
                    ? renderMegaItem(child, onClose, item)
                    : <DefaultMegaItem key={child.href} child={child} onClose={onClose} />
                )}
              </div>
            </div>,
            document.body
          );
        }

        if (item.dropdown === "simple") {
          return createPortal(
            <div
              key={item.title}
              onMouseEnter={cancelMegaClose}
              onMouseLeave={scheduleClose}
              className="fixed z-40 rounded-b-xl border border-t-0 border-border bg-muted shadow-lg shadow-black/8"
              style={{
                top: headerPos.top,
                left: getSimpleDropdownLeft(item.title),
              }}
            >
              <div className="flex w-[200px] flex-col gap-0.5 p-2">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-tool-primary hover:bg-white focus:bg-white outline-none"
                    {...(child.isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>,
            document.body
          );
        }

        return null;
      })}
    </>
  );
}

"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@switch-to-eu/i18n/navigation";
import { type Locale, localeNames, routing } from "@switch-to-eu/i18n/routing";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { useNavDropdown } from "./use-nav-dropdown";

interface NavLanguageSelectorProps {
  locale: Locale;
  className?: string;
}

export function NavLanguageSelector({ locale, className }: NavLanguageSelectorProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { isOpen, headerPos, mounted, open, toggle, scheduleClose, cancelClose } = useNavDropdown();

  const otherLocales = routing.locales.filter((l) => l !== locale);

  const getTriggerLeft = () => {
    if (!triggerRef.current) return 0;
    return triggerRef.current.getBoundingClientRect().left;
  };

  return (
    <>
      <button
        ref={triggerRef}
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onClick={toggle}
        className={cn(
          "group flex cursor-pointer items-center gap-1 bg-transparent px-4 py-2 text-sm text-brand-navy uppercase tracking-wide hover:underline focus:outline-none [font-family:var(--font-hanken-grotesk-bold)] [font-weight:700]",
          className,
        )}
      >
        {localeNames[locale]}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {mounted && isOpen && headerPos &&
        createPortal(
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="fixed z-40 rounded-b-xl border border-t-0 border-gray-200 bg-gray-100 shadow-lg shadow-black/8"
            style={{
              top: headerPos.top,
              left: getTriggerLeft(),
            }}
          >
            <div className="flex w-[160px] flex-col gap-0.5 p-2">
              {otherLocales.map((otherLocale) => (
                <Link
                  key={otherLocale}
                  href={pathname}
                  locale={otherLocale}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-navy hover:bg-white focus:bg-white outline-none"
                >
                  {localeNames[otherLocale]}
                </Link>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

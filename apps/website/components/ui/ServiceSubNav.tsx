"use client";

import { Link, usePathname } from "@switch-to-eu/i18n/navigation";

interface Tab {
  key: string;
  href: string;
  label: string;
}

export function ServiceSubNav({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-30 bg-[#e5e7eb] border-b border-brand-green/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex gap-0.5 overflow-x-auto scrollbar-none -mb-px"
          aria-label="Service sections"
        >
          {tabs.map((tab) => {
            const isActive =
              tab.key === "overview"
                ? pathname === tab.href || pathname === tab.href + "/"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.key}
                href={tab.href}
                scroll={false}
                className={`whitespace-nowrap px-4 py-3 text-[13px] sm:text-sm border-b-[3px] transition-colors no-underline flex-shrink-0 ${
                  isActive
                    ? "border-brand-green text-brand-green font-bold"
                    : "border-transparent text-brand-green/40 font-semibold hover:text-brand-green/70 hover:border-brand-green/20"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

"use client";

import { useRouter, usePathname } from "@switch-to-eu/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@switch-to-eu/ui/components/tabs";

interface Tab {
  key: string;
  label: string;
}

const OVERVIEW_KEY = "overview";

export function ServiceSubNav({
  tabs,
  children,
}: {
  tabs: Tab[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const value = tabs.some((t) => t.key === tabParam)
    ? tabParam!
    : OVERVIEW_KEY;

  function handleValueChange(newValue: string) {
    const url =
      newValue === OVERVIEW_KEY
        ? pathname
        : `${pathname}?tab=${newValue}`;
    router.replace(url, { scroll: false });
  }

  const showNav = tabs.length > 1;

  return (
    <Tabs
      value={value}
      onValueChange={handleValueChange}
      className="gap-0"
    >
      {showNav && (
        <div className="sticky top-0 z-30 bg-[#e5e7eb]/90 backdrop-blur supports-[backdrop-filter]:bg-[#e5e7eb]/75 py-3 sm:py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto scrollbar-none">
              <TabsList
                aria-label="Service sections"
                className="inline-flex h-auto w-max items-stretch gap-0.5 rounded-xl border border-brand-navy/10 bg-white p-1 shadow-sm"
              >
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="flex-none whitespace-nowrap rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-brand-navy/55 shadow-none transition-colors hover:text-brand-navy data-[state=active]:bg-brand-navy data-[state=active]:text-brand-yellow data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>
      )}
      {children}
    </Tabs>
  );
}

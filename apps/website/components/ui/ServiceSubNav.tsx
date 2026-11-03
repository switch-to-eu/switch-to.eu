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
  label,
  children,
}: {
  tabs: Tab[];
  /** Accessible name of the tab list. */
  label: string;
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
        // Same ground and hairline as the site header: the bar reads as part
        // of the page, not as a separate grey band.
        <div className="sticky top-0 z-30 border-b border-black/10 bg-background py-3">
          <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
            <div className="overflow-x-auto scrollbar-none p-0.5">
              <TabsList
                aria-label={label}
                className="h-auto w-max gap-1 rounded-none bg-transparent p-0"
              >
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="h-auto flex-none whitespace-nowrap rounded-full border-0 px-4 py-2 text-sm font-semibold text-[#1a1a1a] shadow-none transition-colors hover:bg-black/5 data-[state=active]:bg-brand-green data-[state=active]:text-white data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-green"
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

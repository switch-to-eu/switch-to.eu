"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@switch-to-eu/ui/components/command";
import { Button } from "@switch-to-eu/ui/components/button";
import { Skeleton } from "@switch-to-eu/ui/components/skeleton";
import { SearchResult } from "@switch-to-eu/content/search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@switch-to-eu/ui/components/dialog";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { useRouter } from "@switch-to-eu/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

interface SearchInputProps {
  className?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  showDebug?: boolean;
  filterRegion?: "eu" | "non-eu";
  size?: "default" | "lg";
  autoOpen?: boolean;
  showOnlyServices?: boolean;
}

export function SearchInput({
  className,
  buttonVariant = "ghost",
  showDebug = false,
  filterRegion,
  size = "default",
  autoOpen = false,
  showOnlyServices = false,
}: SearchInputProps) {
  const router = useRouter();
  const [open, setOpen] = useState(autoOpen);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = useTranslations("common");
  const locale = useLocale();

  // Function to fetch search results from API
  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Add region filter to the API call if provided
      let url = `/api/search?q=${encodeURIComponent(searchQuery)}`;
      if (filterRegion) {
        url += `&region=${filterRegion}`;
      }
      if (showOnlyServices) {
        url += `&types=service`;
      }
      if (locale) {
        url += `&locale=${locale}`;
      }

      const response = await fetch(url);
      const data = await response.json() as { results?: SearchResult[] };
      setResults(data.results ?? []);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with proper debouncing
  const handleSearchChange = (value: string) => {
    setQuery(value);

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      void fetchResults(value);
    }, 500);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle keyboard shortcut to open search dialog
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
      e.preventDefault();
      setOpen((open) => !open);
    }
  };

  // Setup event listeners for keyboard shortcuts
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle selecting a search result
  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    // Update URLs to include language
    const url =
      result.url.startsWith("/") && !result.url.startsWith(`/${locale}`)
        ? `/${locale}${result.url}`
        : result.url;
    router.push(url);
  };

  // Navigate to search page for full results
  const handleViewAllResults = () => {
    setOpen(false);
    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
  };

  // Filtered results by type
  const serviceResults = results.filter((result) => result.type === "service");
  const guideResults = !filterRegion
    ? results.filter((result) => result.type === "guide")
    : [];
  const categoryResults = !filterRegion
    ? results.filter((result) => result.type === "category")
    : [];

  // Debug information (only in development and when explicitly enabled)
  const debugStateInfo = `Dialog: ${open ? "open" : "closed"
    }, Query: "${query}", Loading: ${isLoading}, Results: ${results.length}`;

  return (
    <>
      <Button
        variant={buttonVariant}
        size={size === "lg" ? "lg" : "sm"}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Search className={`${size === "lg" ? "h-5 w-5" : "h-4 w-4"} mr-2`} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>{t("searchDialogTitle")}</DialogTitle>
          </DialogHeader>
          <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]]:h-12 [&_[cmdk-input]]:h-12">
            <CommandInput
              placeholder={
                filterRegion === "non-eu"
                  ? t("searchNonEuPlaceholder")
                  : t("searchGeneralPlaceholder")
              }
              value={query}
              onValueChange={handleSearchChange}
              autoFocus
            />
            <CommandList className="max-h-[350px] overflow-y-auto">
              {/* Debug information - only in development and when explicitly enabled */}
              {process.env.NODE_ENV === "development" && showDebug && (
                <div className="px-4 py-1 text-xs text-gray-500 border-b">
                  {debugStateInfo}
                </div>
              )}

              {isLoading && (
                <div className="p-4 text-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                </div>
              )}

              {!isLoading && query.length > 0 && results.length === 0 && (
                <CommandEmpty>{t("noResultsFound")}</CommandEmpty>
              )}

              {!isLoading && results.length > 0 && (
                <div className="py-2">
                  {/* Services */}
                  {serviceResults.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground">
                        {filterRegion === "non-eu"
                          ? t("nonEuServicesLabel")
                          : t("servicesLabel")}
                      </div>
                      {serviceResults
                        .slice(0, filterRegion ? 6 : 3)
                        .map((result) => (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            onSelect={handleSelect}
                          />
                        ))}
                    </div>
                  )}

                  {/* Guides - only show if not filtering by region */}
                  {guideResults.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground">
                        {t("guidesLabel")}
                      </div>
                      {guideResults.slice(0, 3).map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  )}

                  {/* Categories - only show if not filtering by region */}
                  {categoryResults.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground">
                        {t("categoriesLabel")}
                      </div>
                      {categoryResults.slice(0, 2).map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  )}

                  {/* View all results - only show for non-filtered search */}
                  {!filterRegion && results.length > 8 && (
                    <div
                      className="relative flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={handleViewAllResults}
                    >
                      <span className="text-blue-500 font-medium">
                        {t("viewAllResults")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Extract the search result item into a component for better readability
function SearchResultItem({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (item: SearchResult) => void; // eslint-disable-line no-unused-vars
}) {
  return (
    <div
      className="relative flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-sm outline-hidden select-none"
      onClick={() => onSelect(result)}
    >
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center">
          <span className="font-medium">{result.title}</span>
          {result.type === "service" && "region" in result && (
            <RegionBadge
              region={result.region}
              showTooltip={true}
              className="text-xs py-0 h-5 "
            />
          )}
        </div>
        <span className="text-sm mt-1.5 text-muted-foreground">
          {result.description.substring(0, 60)}
          {result.description.length > 60 ? "..." : ""}
        </span>
      </div>
    </div>
  );
}

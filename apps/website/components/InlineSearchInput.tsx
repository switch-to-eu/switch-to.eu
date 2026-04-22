"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { SearchResult } from "@/lib/types";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@switch-to-eu/ui/components/popover";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@switch-to-eu/i18n/navigation";

interface InlineSearchInputProps {
  className?: string;
  filterRegion?: "eu" | "non-eu";
  showOnlyServices?: boolean;
  placeholder?: string;
  animatePlaceholder?: boolean;
}

export function InlineSearchInput({
  className = "",
  filterRegion,
  showOnlyServices = false,
  placeholder,
  animatePlaceholder = true,
}: InlineSearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [anchorWidth, setAnchorWidth] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations("common");
  const locale = useLocale();

  const defaultPlaceholder = t("searchDefaultText");
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    placeholder || defaultPlaceholder
  );

  // Animation for placeholder text
  useEffect(() => {
    if (!animatePlaceholder || query) return;

    const examples = [
      "whatsapp",
      "gmail",
      "instagram",
      "gdrive",
      "dropbox",
    ].map((example) => t(`searchAnimationExamples.${example as "whatsapp"}`));

    const defaultText = t("searchDefaultText");
    let currentIndex = 0;
    let showingDefault = true;
    const pauseDuration = 1500;
    let currentText = "";
    let isTyping = false;
    let isDeleting = false;
    let isTypingDefault = false;
    const typingSpeed = 100;
    let cancelled = false;

    const schedule = (fn: () => void, delay: number) => {
      if (!cancelled) setTimeout(() => { if (!cancelled) fn(); }, delay);
    };

    const animatePlaceholderText = () => {
      const currentExample = examples[currentIndex];

      if (!currentExample) return;

      // Initial state - start typing a service
      if (showingDefault && !isTyping && !isDeleting && !isTypingDefault) {
        showingDefault = false;
        isTyping = true;
        currentText = "";
        schedule(animatePlaceholderText, typingSpeed);
        return;
      }

      // Typing effect for service name
      if (isTyping) {
        currentText = currentExample.substring(0, currentText.length + 1);
        setCurrentPlaceholder(currentText);

        if (currentText === currentExample) {
          isTyping = false;
          schedule(animatePlaceholderText, pauseDuration);
        } else {
          schedule(animatePlaceholderText, typingSpeed);
        }
        return;
      }

      // Start deleting the service name
      if (!isTyping && !isDeleting && !isTypingDefault && !showingDefault) {
        isDeleting = true;
        schedule(animatePlaceholderText, typingSpeed);
        return;
      }

      // Deleting effect for service name
      if (isDeleting) {
        currentText = currentText.substring(0, currentText.length - 1);
        setCurrentPlaceholder(currentText || " ");

        if (currentText === "") {
          isDeleting = false;
          isTypingDefault = true;
          currentText = "";
          schedule(animatePlaceholderText, typingSpeed);
        } else {
          schedule(animatePlaceholderText, typingSpeed / 2);
        }
        return;
      }

      // Typing effect for default text
      if (isTypingDefault) {
        currentText = defaultText.substring(0, currentText.length + 1);
        setCurrentPlaceholder(currentText);

        if (currentText === defaultText) {
          isTypingDefault = false;
          showingDefault = true;

          schedule(() => {
            currentIndex = (currentIndex + 1) % examples.length;
            schedule(animatePlaceholderText, 500);
          }, 1500);
        } else {
          schedule(animatePlaceholderText, typingSpeed);
        }
        return;
      }
    };

    // Start with default text initially
    setCurrentPlaceholder(defaultText);
    schedule(animatePlaceholderText, 2000);

    return () => {
      cancelled = true;
    };
  }, [animatePlaceholder, query, placeholder, t]);

  const MIN_QUERY_LENGTH = 3;

  // Function to fetch search results from API
  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

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
      const data = (await response.json()) as { results?: SearchResult[] };
      setResults(data.results ?? []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Below minimum length — clear results, no loading
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Mark loading immediately so the dropdown never flashes "no results"
    setIsLoading(true);

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      void fetchResults(value);
    }, 300);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Match popover width to the input row
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setAnchorWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
    // Enter
    else if (e.key === "Enter") {
      e.preventDefault();
      const selectedResult = results[focusedIndex];
      if (focusedIndex >= 0 && focusedIndex < results.length && selectedResult) {
        handleSelect(selectedResult);
      }
    }
    // Escape
    else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
    }
  };

  // Handle selecting a search result
  const handleSelect = (result: SearchResult) => {
    setShowDropdown(false);
    router.push(result.url);
  };

  const isSearchQuery = query.trim().length >= MIN_QUERY_LENGTH;
  const popoverOpen = showDropdown && isSearchQuery;

  return (
    <Popover open={popoverOpen} onOpenChange={setShowDropdown}>
      <PopoverAnchor asChild>
        <div ref={containerRef} className="relative w-full">
          <div className="group flex items-center gap-2 rounded-full border border-brand-green/20 bg-white pl-5 sm:pl-6 pr-1.5 py-1.5 focus-within:border-brand-green/50 transition-colors">
            <Search
              className="h-5 w-5 text-brand-green/50 shrink-0 transition-all duration-300 group-focus-within:text-brand-green group-focus-within:scale-110"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={currentPlaceholder}
              className={`flex-grow py-2 sm:py-2.5 text-base sm:text-lg text-brand-green placeholder:text-brand-green/40 bg-transparent focus:outline-none ${className}`}
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setShowDropdown(true);
                setFocusedIndex(-1);
              }}
              aria-label={currentPlaceholder}
            />
            <button
              type="button"
              className="shrink-0 inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-brand-green text-white transition-transform duration-200 ease-out hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
              onClick={() => {
                if (query.trim()) {
                  void fetchResults(query);
                } else {
                  setShowDropdown(true);
                  searchInputRef.current?.focus();
                }
              }}
              aria-label={t("searchDialogTitle")}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        style={{ width: anchorWidth }}
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        onCloseAutoFocus={(e: Event) => e.preventDefault()}
        onFocusOutside={(e: Event) => e.preventDefault()}
        onInteractOutside={(e: Event) => {
          // Clicks on the input/button shouldn't close the popover —
          // those are logically inside the combobox.
          const target = e.target as Node | null;
          if (target && containerRef.current?.contains(target)) {
            e.preventDefault();
          }
        }}
        className="bg-white rounded-2xl shadow-lg border border-brand-green/10 max-h-[350px] overflow-y-auto p-0"
      >
          <div className="py-0">
            <div className="px-4 py-2 border-b border-brand-green/10">
              <h3 className="text-xs font-heading uppercase tracking-wider text-brand-green/60">
                {t("dropdownSearchResults")}
              </h3>
            </div>

            {isLoading ? (
              <div className="px-4 py-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-brand-green/10 rounded w-1/3" />
                      <div className="h-3 bg-brand-green/10 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-4 py-2.5 cursor-pointer transition-colors ${focusedIndex === index ? "bg-brand-sky/30" : "hover:bg-brand-sky/20"
                    }`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-brand-green truncate">{result.title}</div>
                      <div className="text-sm text-brand-green/60 truncate">
                        {result.description}
                      </div>
                    </div>
                    {result.type === "service" && "region" in result && result.region && (
                      <RegionBadge
                        region={result.region}
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-brand-green/70 font-medium">
                  {t("noResultsMessage", { query })}
                </p>
                <p className="text-sm text-brand-green/50 mt-1">
                  {t("tryDifferentSearch")}
                </p>
              </div>
            )}
          </div>
      </PopoverContent>
    </Popover>
  );
}

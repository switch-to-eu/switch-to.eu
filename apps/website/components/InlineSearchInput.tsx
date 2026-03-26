"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { SearchResult } from "@/lib/types";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [featuredServices, setFeaturedServices] = useState<SearchResult[]>([]);
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

  // Fetch featured non-EU services for prefilled dropdown
  const fetchFeaturedServices = useCallback(async () => {
    try {
      // Adjust the API endpoint as needed
      let url = `/api/search/featured?region=non-eu`;
      if (showOnlyServices) {
        url += `&types=service`;
      }
      if (locale) {
        url += `&locale=${locale}`;
      }

      const response = await fetch(url);
      const data = await response.json() as { results?: SearchResult[] };
      setFeaturedServices(data.results ?? []);
    } catch (error) {
      console.error("Error fetching featured services:", error);
      setFeaturedServices([]);
    }
  }, [showOnlyServices, locale]);

  // Load featured services on component mount
  useEffect(() => {
    void fetchFeaturedServices();
  }, [showOnlyServices, fetchFeaturedServices]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < (results.length || featuredServices.length) - 1 ? prev + 1 : prev
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
      const currentResults = isSearchQuery ? results : featuredServices;
      const selectedResult = currentResults[focusedIndex];
      if (focusedIndex >= 0 && focusedIndex < currentResults.length && selectedResult) {
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

  // Determine which results to show in the dropdown
  const isSearchQuery = query.trim().length >= MIN_QUERY_LENGTH;
  const displayResults = isSearchQuery ? results : featuredServices;
  const dropdownTitle = isSearchQuery
    ? t("dropdownSearchResults")
    : t("dropdownPopularServices");

  const noResultsMessage = isSearchQuery
    ? t("noResultsMessage", { query })
    : t("noFeaturedServices");

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center rounded-full border border-brand-pink/30 bg-white/10 backdrop-blur-sm pr-1.5 sm:pr-2">
        <input
          ref={searchInputRef}
          type="text"
          placeholder={currentPlaceholder}
          className={`flex-grow py-3 sm:py-4 px-5 sm:px-6 text-base sm:text-lg bg-transparent text-white placeholder:text-brand-cream/50 focus:outline-none focus:ring-0 ${className}`}
          value={query}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setShowDropdown(true);
            setFocusedIndex(-1);
          }}
        />
        <button
          className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-brand-yellow hover:bg-brand-orange/80 text-brand-green transition-colors"
          onClick={() => {
            if (query.trim()) {
              void fetchResults(query);
            } else {
              setShowDropdown(true);
            }
          }}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute w-full mt-2 bg-brand-green/95 backdrop-blur-md rounded-2xl shadow-lg border border-brand-pink/20 z-10 max-h-[350px] overflow-y-auto">
          <div className="py-0">
            {/* Dropdown Header */}
            <div className="px-4 py-2 border-b border-brand-pink/10">
              <h3 className="text-sm font-medium text-brand-sky/70">
                {dropdownTitle}
              </h3>
            </div>

            {isLoading && isSearchQuery ? (
              <div className="px-4 py-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-1/3" />
                      <div className="h-3 bg-white/10 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayResults.length > 0 ? (
              displayResults.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-4 py-2 cursor-pointer transition-colors ${focusedIndex === index ? "bg-brand-pink/10" : "hover:bg-white/5"
                    }`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">{result.title}</div>
                      <div className="text-sm text-brand-sky/60 mr-2">
                        {result.description}
                      </div>
                    </div>
                    {result.type === "service" && "region" in result && result.region && (
                      <RegionBadge
                        region={result.region as "eu" | "non-eu" | "eu-friendly"}
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-brand-sky/70">{noResultsMessage}</p>
                <p className="text-sm text-brand-sky/40 mt-1">
                  {t("tryDifferentSearch")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

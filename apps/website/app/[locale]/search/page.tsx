"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { SearchResult } from "@switch-to-eu/content/search";
import { Skeleton } from "@switch-to-eu/ui/components/skeleton";
import { Link } from "@switch-to-eu/i18n/navigation";
import Image from "next/image";

// Brand color config for result type sections
const RESULT_SECTIONS = {
  service: {
    label: "Services",
    bg: "bg-brand-sky",
    text: "text-brand-green",
    hoverBorder: "hover:border-brand-green/30",
    shape: "/images/shapes/cloud.svg",
  },
  guide: {
    label: "Guides",
    bg: "bg-brand-sage",
    text: "text-brand-green",
    hoverBorder: "hover:border-brand-green/30",
    shape: "/images/shapes/pebble.svg",
  },
  category: {
    label: "Categories",
    bg: "bg-brand-yellow/20",
    text: "text-brand-green",
    hoverBorder: "hover:border-brand-yellow/50",
    shape: "/images/shapes/star.svg",
  },
} as const;

// Extract the inner component to use search params
function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = (await response.json()) as { results?: SearchResult[] };
      setResults(data.results ?? []);
    } catch (err) {
      console.error("Error searching:", err);
      setError("Failed to fetch search results. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSearch(query);

    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.pushState({}, "", url);
  };

  // Load results on initial page load
  useEffect(() => {
    if (initialQuery) {
      void handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Group results by type
  const serviceResults = results.filter((result) => result.type === "service");
  const guideResults = results.filter((result) => result.type === "guide");
  const categoryResults = results.filter(
    (result) => result.type === "category"
  );

  const renderResultSection = (
    type: keyof typeof RESULT_SECTIONS,
    items: SearchResult[]
  ) => {
    if (items.length === 0) return null;
    const config = RESULT_SECTIONS[type];

    return (
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl uppercase text-brand-green mb-6">
          {config.label}
        </h2>
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((result) => (
            <Link
              href={result.url}
              key={result.id}
              className={`group relative block overflow-hidden rounded-3xl ${config.bg} border border-transparent ${config.hoverBorder} transition-all duration-200`}
            >
              {/* Decorative shape */}
              <div className="absolute -top-4 -right-4 w-20 h-20 opacity-10 pointer-events-none">
                <Image
                  src={config.shape}
                  alt=""
                  fill
                  className="object-contain select-none"
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <div className="relative z-10 p-6">
                <h3 className={`font-semibold text-lg ${config.text} mb-2 group-hover:underline`}>
                  {result.title}
                </h3>
                <p className={`${config.text}/70 text-sm leading-relaxed`}>
                  {result.description.substring(0, 120)}
                  {result.description.length > 120 ? "..." : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
      {/* Hero / Search Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute -top-8 -right-8 w-40 h-40 sm:w-52 sm:h-52 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/sunburst.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ animationDuration: "8s" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/blob.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ animationDuration: "10s", animationDelay: "1s" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-6">
                  Search
                </h1>
                <p className="text-brand-sky text-base sm:text-lg mb-8">
                  Find EU alternatives, migration guides, and service categories.
                </p>

                {/* Search form */}
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-3 max-w-xl mx-auto">
                    <input
                      type="search"
                      placeholder="Search for guides, services, categories..."
                      className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 text-sm sm:text-base"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Search query"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-brand-yellow text-brand-navy rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity flex items-center gap-2 flex-shrink-0"
                    >
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Loading state */}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 rounded-full" />
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[140px] rounded-3xl" />
                <Skeleton className="h-[140px] rounded-3xl" />
                <Skeleton className="h-[140px] rounded-3xl" />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && !loading && (
            <div className="bg-brand-red/10 border border-brand-red/20 p-6 rounded-3xl text-brand-red">
              {error}
            </div>
          )}

          {/* No results state */}
          {!loading && !error && results.length === 0 && initialQuery && (
            <div className="text-center py-12">
              <div className="relative w-24 h-24 mx-auto mb-6 opacity-30">
                <Image
                  src="/images/shapes/cloud.svg"
                  alt=""
                  fill
                  className="object-contain"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(22%) sepia(95%) saturate(1000%) hue-rotate(130deg) brightness(90%) contrast(95%)",
                  }}
                  unoptimized
                />
              </div>
              <p className="text-xl font-semibold text-brand-green mb-2">
                No results found for &quot;{initialQuery}&quot;
              </p>
              <p className="text-brand-green/60">
                Try different keywords or check the spelling of your search.
              </p>
            </div>
          )}

          {/* Search results */}
          {!loading && !error && results.length > 0 && (
            <div className="space-y-12">
              {/* Summary */}
              <p className="text-brand-green/60 text-sm">
                Found {results.length} results for &quot;{initialQuery}&quot;
              </p>

              {renderResultSection("service", serviceResults)}
              {renderResultSection("guide", guideResults)}
              {renderResultSection("category", categoryResults)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// Loading fallback for Suspense
function SearchPageSkeleton() {
  return (
    <main className="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <Skeleton className="h-14 w-64 mx-auto rounded-full" />
                <Skeleton className="h-6 w-96 mx-auto rounded-full" />
                <Skeleton className="h-12 w-full max-w-xl mx-auto rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[140px] rounded-3xl" />
            <Skeleton className="h-[140px] rounded-3xl" />
            <Skeleton className="h-[140px] rounded-3xl" />
          </div>
        </div>
      </section>
    </main>
  );
}

// Main page component with Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

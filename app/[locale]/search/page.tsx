"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { SearchResult } from "@/lib/search";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

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
    console.log("Search page: searching for:", searchQuery);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Search page: received results:", data);
      setResults(data.results || []);
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
    handleSearch(query);

    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.pushState({}, "", url);
  };

  // Load results on initial page load
  useEffect(() => {
    if (initialQuery) {
      console.log("Search page: initial query detected:", initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Debug results after they change
  useEffect(() => {
    console.log("Search page: results updated, count:", results.length);
  }, [results]);

  // Group results by type
  const serviceResults = results.filter((result) => result.type === "service");
  const guideResults = results.filter((result) => result.type === "guide");
  const categoryResults = results.filter(
    (result) => result.type === "category"
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2 max-w-xl">
          <Input
            type="search"
            placeholder="Search for guides, services, categories..."
            className="flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search query"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-slate-100 p-4 my-4 rounded text-xs font-mono">
          <p>Query: {initialQuery}</p>
          <p>Results: {results.length}</p>
          <p>Loading: {loading ? "true" : "false"}</p>
          <p>Error: {error || "none"}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full max-w-sm" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="bg-red-50 p-4 rounded-md text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* No results state */}
      {!loading && !error && results.length === 0 && initialQuery && (
        <div className="text-center py-8">
          <p className="text-xl mb-2">
            No results found for &quot;{initialQuery}&quot;
          </p>
          <p className="text-muted-foreground">
            Try different keywords or check the spelling of your search.
          </p>
        </div>
      )}

      {/* Search results */}
      {!loading && !error && results.length > 0 && (
        <div className="space-y-8">
          {/* Summary */}
          <p className="text-muted-foreground">
            Found {results.length} results for &quot;{initialQuery}&quot;
          </p>

          {/* Services section */}
          {serviceResults.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Services</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {serviceResults.map((result) => (
                  <Link
                    href={result.url}
                    key={result.id}
                    className="block p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <h3 className="font-medium text-lg">{result.title}</h3>
                    <p className="text-muted-foreground text-sm mt-2">
                      {result.description.substring(0, 100)}
                      {result.description.length > 100 ? "..." : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Guides section */}
          {guideResults.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Guides</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {guideResults.map((result) => (
                  <Link
                    href={result.url}
                    key={result.id}
                    className="block p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <h3 className="font-medium text-lg">{result.title}</h3>
                    <p className="text-muted-foreground text-sm mt-2">
                      {result.description.substring(0, 100)}
                      {result.description.length > 100 ? "..." : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories section */}
          {categoryResults.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Categories</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryResults.map((result) => (
                  <Link
                    href={result.url}
                    key={result.id}
                    className="block p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <h3 className="font-medium text-lg">{result.title}</h3>
                    <p className="text-muted-foreground text-sm mt-2">
                      {result.description.substring(0, 100)}
                      {result.description.length > 100 ? "..." : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Loading fallback for Suspense
function SearchPageSkeleton() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    </div>
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

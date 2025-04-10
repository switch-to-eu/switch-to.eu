'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { SearchResult, ServiceSearchResult } from '@/lib/search';
import { RegionBadge } from "@/components/ui/region-badge";

interface InlineSearchInputProps {
  className?: string;
  filterRegion?: 'eu' | 'non-eu';
  showOnlyServices?: boolean;
  placeholder?: string;
}

export function InlineSearchInput({
  className = '',
  filterRegion,
  showOnlyServices = false,
  placeholder = 'Find a non-EU service to replace'
}: InlineSearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Function to fetch search results from API
  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Add region filter to the API call if provided
      let url = `/api/search?q=${encodeURIComponent(searchQuery)}`;
      if (filterRegion) {
        url += `&region=${filterRegion}`;
      }
      if (showOnlyServices) {
        url += `&types=service`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setResults(data.results || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching search results:', error);
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

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchResults(value);
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    }
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    }
    // Enter
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        handleSelect(results[focusedIndex]);
      }
    }
    // Escape
    else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
    }
  };

  // Handle selecting a search result
  const handleSelect = (result: SearchResult) => {
    setShowDropdown(false);
    router.push(result.url);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden gap-2 sm:gap-0">
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          className={`flex-grow py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg bg-white focus:outline-none shadow-sm border border-[#e5e7eb] focus:ring-0 rounded-xl sm:rounded-none ${className}`}
          value={query}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && (results.length > 0 || hasSearched)) {
              setShowDropdown(true);
            }
          }}
        />
        <button
          className="hidden sm:block px-6 sm:px-8  py-3 sm:py-4 bg-[#ff9d8a] hover:bg-[#ff8a74] text-black font-medium rounded-xl sm:rounded-none"
          onClick={() => {
            if (query.trim()) {
              fetchResults(query);
            }
          }}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Dropdown Results */}
      {showDropdown && query.trim() && !isLoading && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-[350px] overflow-y-auto">
          <div className="py-0">
            {results.length > 0 ? (
              results.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedIndex === index ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-gray-500 mr-2">{result.description}</div>
                    </div>
                    {result.type === 'service' && (
                      <RegionBadge region={(result as ServiceSearchResult).region} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-gray-500">No results found for &quot;{query}&quot;</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different search term or browse our categories
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
}
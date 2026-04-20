/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-misused-promises */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { InlineSearchInput } from "@/components/InlineSearchInput";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      searchDefaultText: "Search services, guides, categories...",
      dropdownSearchResults: "Search Results",
      dropdownPopularServices: "Popular Non-EU Services",
      noResultsMessage: `No results found for "${params?.query ?? ""}"`,
      noFeaturedServices: "No featured services available",
      tryDifferentSearch:
        "Try a different search term or browse our categories",
    };
    return translations[key] ?? key;
  },
  useLocale: () => "en",
}));

// Mock i18n navigation
vi.mock("@switch-to-eu/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock RegionBadge
vi.mock("@switch-to-eu/ui/components/region-badge", () => ({
  RegionBadge: ({ region }: { region: string }) => (
    <span data-testid="region-badge">{region}</span>
  ),
}));

// Control fetch behavior per test
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  // Default: featured services returns empty
  fetchMock.mockResolvedValue({
    json: async () => ({ results: [] }),
  });
});

describe("InlineSearchInput", () => {
  it("should NOT show 'no results' message while search is loading", async () => {
    // Make the search fetch hang (never resolve) to simulate loading
    // eslint-disable-next-line no-unused-vars
    let resolveSearch!: (_value: unknown) => void;
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/search?")) {
        return new Promise((resolve) => {
          resolveSearch = resolve;
        });
      }
      return Promise.resolve({
        json: async () => ({ results: [] }),
      });
    });

    render(<InlineSearchInput animatePlaceholder={false} />);

    const input = screen.getByPlaceholderText(
      "Search services, guides, categories..."
    );

    // Focus the input first (opens the dropdown)
    fireEvent.focus(input);

    // Type a query (>= 3 chars to trigger search)
    fireEvent.change(input, { target: { value: "whatsapp" } });

    // Wait for debounce (300ms) to fire the fetch
    await waitFor(
      () => {
        const searchCalls = fetchMock.mock.calls.filter((call: string[]) =>
          call[0]?.includes("/api/search?")
        );
        expect(searchCalls.length).toBeGreaterThan(0);
      },
      { timeout: 1000 }
    );

    // While loading, the "no results" message should NOT be visible
    expect(
      screen.queryByText(/No results found for/i)
    ).not.toBeInTheDocument();

    // Clean up: resolve the pending fetch
    resolveSearch({
      json: async () => ({ results: [] }),
    });
  });

  it("should NOT flash 'no results' during debounce period", async () => {
    // Featured services returns some items (so we can verify fallback)
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/search/featured")) {
        return Promise.resolve({
          json: async () => ({
            results: [
              {
                id: "whatsapp",
                type: "service",
                title: "WhatsApp",
                description: "Messaging app",
                url: "/services/non-eu/whatsapp",
                region: "non-eu",
                location: "US",
                category: "messaging",
                freeOption: true,
              },
            ],
          }),
        });
      }
      if (url.includes("/api/search?")) {
        // Delay search response
        return new Promise(() => {});
      }
      return Promise.resolve({ json: async () => ({ results: [] }) });
    });

    render(<InlineSearchInput animatePlaceholder={false} />);

    const input = screen.getByPlaceholderText(
      "Search services, guides, categories..."
    );

    // Wait for featured services to load
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/search/featured")
      );
    });

    fireEvent.focus(input);

    // Type a query — isLoading should be set immediately, no "no results" flash
    fireEvent.change(input, { target: { value: "chat" } });

    // "No results" should never appear — either loading skeleton or featured services
    expect(
      screen.queryByText(/No results found for/i)
    ).not.toBeInTheDocument();
  });

  it("should show featured services for queries shorter than 3 characters", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/search/featured")) {
        return Promise.resolve({
          json: async () => ({
            results: [
              {
                id: "whatsapp",
                type: "service",
                title: "WhatsApp",
                description: "Messaging app",
                url: "/services/non-eu/whatsapp",
                region: "non-eu",
                location: "US",
                category: "messaging",
                freeOption: true,
              },
            ],
          }),
        });
      }
      return Promise.resolve({ json: async () => ({ results: [] }) });
    });

    render(<InlineSearchInput animatePlaceholder={false} />);

    // Wait for featured services to load
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/search/featured")
      );
    });

    const input = screen.getByPlaceholderText(
      "Search services, guides, categories..."
    );

    fireEvent.focus(input);

    // Type only 2 chars — should NOT trigger a search API call
    fireEvent.change(input, { target: { value: "cg" } });

    // Wait a bit past the debounce
    await new Promise((r) => setTimeout(r, 400));

    // Should not have called the search API
    const searchCalls = fetchMock.mock.calls.filter((call: string[]) =>
      call[0]?.includes("/api/search?")
    );
    expect(searchCalls).toHaveLength(0);

    // Should still show featured services, not "no results"
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(
      screen.queryByText(/No results found for/i)
    ).not.toBeInTheDocument();
  });

  it("should show 'no results' message only after loading completes with empty results", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/search?")) {
        return Promise.resolve({
          json: async () => ({ results: [] }),
        });
      }
      return Promise.resolve({
        json: async () => ({ results: [] }),
      });
    });

    render(<InlineSearchInput animatePlaceholder={false} />);

    const input = screen.getByPlaceholderText(
      "Search services, guides, categories..."
    );

    // Focus + type (>= 3 chars)
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "xyznonexistent" } });

    // Wait for debounce + fetch to complete
    await waitFor(
      () => {
        expect(screen.getByText(/No results found for/i)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should show results when search returns matches", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/search?")) {
        return Promise.resolve({
          json: async () => ({
            results: [
              {
                id: "signal",
                type: "service",
                title: "Signal",
                description: "Encrypted messaging",
                url: "/services/eu/signal",
                region: "eu",
                location: "EU",
                category: "messaging",
                freeOption: true,
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        json: async () => ({ results: [] }),
      });
    });

    render(<InlineSearchInput animatePlaceholder={false} />);

    const input = screen.getByPlaceholderText(
      "Search services, guides, categories..."
    );

    // Focus + type
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "signal" } });

    await waitFor(
      () => {
        expect(screen.getByText("Signal")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(
      screen.queryByText(/No results found for/i)
    ).not.toBeInTheDocument();
  });
});

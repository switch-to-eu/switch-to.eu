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
  globalThis.fetch = fetchMock;

  // Default: featured services returns empty
  fetchMock.mockResolvedValue({
    json: async () => ({ results: [] }),
  });
});

describe("InlineSearchInput", () => {
  it("should NOT show 'no results' message while search is loading", async () => {
    // Make the search fetch hang (never resolve) to simulate loading
    let resolveSearch!: (value: unknown) => void;
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/search?")) {
        // Search request — keep it pending
        return new Promise((resolve) => {
          resolveSearch = resolve;
        });
      }
      // Featured services — resolve immediately with empty
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

    // Type a query
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

    // BUG: While loading, the dropdown shows "no results" instead of a loading state.
    // This assertion should pass — "no results" must NOT appear during loading.
    expect(
      screen.queryByText(/No results found for/i)
    ).not.toBeInTheDocument();

    // Clean up: resolve the pending fetch
    resolveSearch({
      json: async () => ({ results: [] }),
    });
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

    // Focus + type
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

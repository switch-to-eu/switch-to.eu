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
      noResultsMessage: `No results found for "${params?.query ?? ""}"`,
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

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "whatsapp" } });

    await waitFor(
      () => {
        const searchCalls = fetchMock.mock.calls.filter((call: string[]) =>
          call[0]?.includes("/api/search?")
        );
        expect(searchCalls.length).toBeGreaterThan(0);
      },
      { timeout: 1000 }
    );

    expect(
      screen.queryByText(/No results found for/i)
    ).not.toBeInTheDocument();

    resolveSearch({
      json: async () => ({ results: [] }),
    });
  });

  it("should not render dropdown or call the API for queries shorter than 3 characters", async () => {
    render(<InlineSearchInput animatePlaceholder={false} />);

    const input = screen.getByPlaceholderText(
      "Search services, guides, categories..."
    );

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "cg" } });

    await new Promise((r) => setTimeout(r, 400));

    const searchCalls = fetchMock.mock.calls.filter((call: string[]) =>
      call[0]?.includes("/api/search")
    );
    expect(searchCalls).toHaveLength(0);

    expect(screen.queryByText("Search Results")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No results found for/i)
    ).not.toBeInTheDocument();
  });

  it("should not fetch anything on mount", async () => {
    render(<InlineSearchInput animatePlaceholder={false} />);

    await new Promise((r) => setTimeout(r, 100));

    expect(fetchMock).not.toHaveBeenCalled();
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

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "xyznonexistent" } });

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

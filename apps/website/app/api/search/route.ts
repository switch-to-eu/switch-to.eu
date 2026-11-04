import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, getAllGuides, getAllServices } from "@/lib/content/loader";
import type { SearchResult } from "@/lib/types";
import {
  getCategorySlug,
  getGuideSourceService,
  getGuideTargetService,
} from "@/lib/services";
import { routing } from "@switch-to-eu/i18n/routing";

type Locale = (typeof routing.locales)[number];
type SearchType = "service" | "guide" | "category";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function fetchSearchResults(
  query: string,
  lang: Locale,
  limit: number,
  region: "eu" | "non-eu" | undefined,
  types: SearchType[]
): SearchResult[] {
  const needle = query.toLowerCase();
  const matches = (...fields: (string | null | undefined)[]) =>
    fields.some((f) => f?.toLowerCase().includes(needle));
  const results: SearchResult[] = [];

  if (types.includes("service")) {
    results.push(
      ...getAllServices(lang)
        .filter((s) => matches(s.name, s.description))
        .filter((s) => !region || s.region === region)
        .slice(0, limit)
        .map((service): SearchResult => ({
          id: service.id,
          type: "service",
          title: service.name,
          description: service.description,
          url: `/services/${service.region === "non-eu" ? "non-eu" : "eu"}/${service.slug}`,
          region: service.region,
          category: getCategorySlug(service.category),
          location: service.location,
          freeOption: service.freeOption ?? undefined,
        }))
    );
  }

  if (types.includes("guide")) {
    results.push(
      ...getAllGuides(lang)
        .filter((g) => matches(g.title, g.description))
        .slice(0, limit)
        .map((guide): SearchResult => {
          const categorySlug = getCategorySlug(guide.category);
          return {
            id: guide.id,
            type: "guide",
            title: guide.title,
            description: guide.description,
            url: `/guides/${categorySlug || "uncategorized"}/${guide.slug}`,
            category: categorySlug,
            sourceService: getGuideSourceService(guide)?.name,
            targetService: getGuideTargetService(guide)?.name,
          };
        })
    );
  }

  if (types.includes("category")) {
    results.push(
      ...getAllCategories(lang)
        .filter((c) => matches(c.title, c.description))
        .slice(0, limit)
        .map((cat): SearchResult => ({
          id: cat.id,
          type: "category",
          title: cat.title,
          description: cat.description,
          url: `/services/${cat.slug}`,
        }))
    );
  }

  return results.slice(0, limit);
}

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json(
        { results: [], message: "Search query is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const typesParam = searchParams.get("types");
    const types: SearchType[] = typesParam
      ? (typesParam.split(",") as SearchType[])
      : ["service", "guide", "category"];

    const regionParam = searchParams.get("region");
    const region = regionParam
      ? (regionParam as "eu" | "non-eu")
      : undefined;

    const langParam = searchParams.get("lang");
    const lang: Locale = (langParam as Locale) || "en";

    const results = fetchSearchResults(
      query,
      lang,
      limit,
      region,
      types
    );

    return NextResponse.json({ results }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { message: "An error occurred while searching", error: String(error) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

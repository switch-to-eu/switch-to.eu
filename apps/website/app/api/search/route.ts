import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getPayload } from "@/lib/payload";
import type { Service, Guide, Category } from "@/payload-types";
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

async function fetchSearchResults(
  query: string,
  lang: Locale,
  limit: number,
  region: "eu" | "non-eu" | undefined,
  types: SearchType[]
): Promise<SearchResult[]> {
  const payload = await getPayload();
  const queries: Promise<SearchResult[]>[] = [];

  if (types.includes("service")) {
    queries.push(
      payload
        .find({
          collection: "services",
          locale: lang,
          limit,
          where: {
            and: [
              { _status: { equals: "published" } },
              {
                or: [
                  { name: { contains: query } },
                  { description: { contains: query } },
                ],
              },
              ...(region ? [{ region: { equals: region } }] : []),
            ],
          },
          depth: 1,
        })
        .then(({ docs }) =>
          docs.map((service: Service): SearchResult => ({
            id: String(service.id),
            type: "service",
            title: service.name,
            description: service.description,
            url: `/services/${service.region === "non-eu" ? "non-eu" : "eu"}/${service.slug}`,
            region: service.region,
            category: getCategorySlug(service.category),
            location: service.location,
            freeOption: service.freeOption ?? undefined,
          }))
        )
    );
  }

  if (types.includes("guide")) {
    queries.push(
      payload
        .find({
          collection: "guides",
          locale: lang,
          limit,
          where: {
            and: [
              { _status: { equals: "published" } },
              {
                or: [
                  { title: { contains: query } },
                  { description: { contains: query } },
                ],
              },
            ],
          },
          depth: 1,
        })
        .then(({ docs }) =>
          docs.map((guide: Guide): SearchResult => {
            const categorySlug = getCategorySlug(guide.category);
            return {
              id: String(guide.id),
              type: "guide",
              title: guide.title,
              description: guide.description,
              url: `/guides/${categorySlug || "uncategorized"}/${guide.slug}`,
              category: categorySlug,
              sourceService: getGuideSourceService(guide)?.name,
              targetService: getGuideTargetService(guide)?.name,
            };
          })
        )
    );
  }

  if (types.includes("category")) {
    queries.push(
      payload
        .find({
          collection: "categories",
          locale: lang,
          limit,
          where: {
            or: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
        })
        .then(({ docs }) =>
          docs.map((cat: Category): SearchResult => ({
            id: String(cat.id),
            type: "category",
            title: cat.title,
            description: cat.description,
            url: `/services/${cat.slug}`,
          }))
        )
    );
  }

  const resultArrays = await Promise.all(queries);
  return resultArrays.flat().slice(0, limit);
}

// Cache search results — content changes trigger revalidateTag in
// afterChange hooks on each collection. 1h revalidate is a safety net.
const getCachedSearchResults = unstable_cache(
  fetchSearchResults,
  ["search-results"],
  { tags: ["services", "guides", "categories"], revalidate: 3600 }
);

export async function GET(request: NextRequest) {
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

    const results = await getCachedSearchResults(
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

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "@/lib/payload";
import type { Service, Guide, Category } from "@/payload-types";
import type { SearchResult } from "@/lib/types";
import { routing } from "@switch-to-eu/i18n/routing";

type Locale = (typeof routing.locales)[number];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    console.log("Search API received query:", query);

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const typesParam = searchParams.get("types");
    const types = typesParam
      ? (typesParam.split(",") as ("service" | "guide" | "category")[])
      : undefined;

    const regionParam = searchParams.get("region");
    const region = regionParam
      ? (regionParam as "eu" | "non-eu")
      : undefined;

    const langParam = searchParams.get("lang");
    const lang = (langParam as Locale) || "en";

    if (!query.trim()) {
      console.log("Search API: Empty query received");
      return NextResponse.json(
        { results: [], message: "Search query is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    console.log(
      `Search API: Performing search for: "${query}" with lang: ${lang}${region ? ` and region filter: ${region}` : ""}`
    );

    const payload = await getPayload();

    // Build parallel queries for each requested type (or all types)
    const searchTypes = types ?? ["service", "guide", "category"];

    const queries: Promise<SearchResult[]>[] = [];

    if (searchTypes.includes("service")) {
      const serviceQuery = payload
        .find({
          collection: "services",
          locale: lang,
          limit,
          where: {
            and: [
              {
                or: [
                  { name: { contains: query } },
                  { description: { contains: query } },
                ],
              },
              ...(region ? [{ region: { equals: region } }] : []),
            ],
          },
          depth: 1, // populate category relationship
        })
        .then(({ docs }) =>
          docs.map((service: Service): SearchResult => {
            const categorySlug =
              typeof service.category === "object"
                ? (service.category as Category).slug
                : undefined;

            return {
              id: String(service.id),
              type: "service",
              title: service.name,
              description: service.description,
              url:
                service.region === "eu"
                  ? `/services/${service.slug}`
                  : `/services/${service.region}/${service.slug}`,
              region: service.region,
              category: categorySlug,
              location: service.location,
              freeOption: service.freeOption ?? undefined,
            };
          })
        );
      queries.push(serviceQuery);
    }

    if (searchTypes.includes("guide")) {
      const guideQuery = payload
        .find({
          collection: "guides",
          locale: lang,
          limit,
          where: {
            or: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          depth: 1, // populate category + source/target service
        })
        .then(({ docs }) =>
          docs.map((guide: Guide): SearchResult => {
            const categorySlug =
              typeof guide.category === "object"
                ? (guide.category as Category).slug
                : undefined;
            const sourceName =
              typeof guide.sourceService === "object"
                ? (guide.sourceService as Service).name
                : undefined;
            const targetName =
              typeof guide.targetService === "object"
                ? (guide.targetService as Service).name
                : undefined;

            return {
              id: String(guide.id),
              type: "guide",
              title: guide.title,
              description: guide.description,
              url: `/guides/${categorySlug ?? "uncategorized"}/${guide.slug}`,
              category: categorySlug,
              sourceService: sourceName,
              targetService: targetName,
            };
          })
        );
      queries.push(guideQuery);
    }

    if (searchTypes.includes("category")) {
      const categoryQuery = payload
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
          docs.map(
            (cat: Category): SearchResult => ({
              id: String(cat.id),
              type: "category",
              title: cat.title,
              description: cat.description,
              url: `/services/${cat.slug}`,
            })
          )
        );
      queries.push(categoryQuery);
    }

    const resultArrays = await Promise.all(queries);
    const results = resultArrays.flat().slice(0, limit);

    console.log(`Search API: Found ${results.length} results`);

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

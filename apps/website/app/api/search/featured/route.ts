import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "@/lib/payload";
import type { Service, Category } from "@/payload-types";
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

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    const regionParam = searchParams.get("region");
    const region = regionParam
      ? (regionParam as "eu" | "non-eu")
      : undefined;

    const langParam = searchParams.get("lang");
    const lang = (langParam as Locale) || "en";

    const payload = await getPayload();

    const { docs } = await payload.find({
      collection: "services",
      locale: lang,
      limit,
      where: {
        and: [
          { _status: { equals: "published" } },
          { featured: { equals: true } },
          ...(region ? [{ region: { equals: region } }] : []),
        ],
      },
      depth: 1, // populate category relationship
    });

    const results: SearchResult[] = docs.map((service: Service) => {
      const categorySlug =
        typeof service.category === "object"
          ? (service.category as Category).slug
          : undefined;

      return {
        id: String(service.id),
        type: "service" as const,
        title: service.name,
        description: service.description,
        url: `/services/${service.region === "non-eu" ? "non-eu" : "eu"}/${service.slug}`,
        region: service.region,
        category: categorySlug,
        location: service.location,
        freeOption: service.freeOption ?? undefined,
      };
    });

    console.log(
      `Featured API: Returning ${results.length} featured services`
    );

    return NextResponse.json({ results }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Featured API error:", error);

    return NextResponse.json(
      { message: "An error occurred", error: String(error) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

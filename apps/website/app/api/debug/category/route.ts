import { NextRequest } from "next/server";
import { getPayload } from "@/lib/payload";

/**
 * Debug endpoint to diagnose 404s on category pages.
 *
 * Usage: /api/debug/category?slug=social-media&secret=...
 *
 * Returns what Payload sees from this exact runtime — DB connectivity,
 * category lookup, and service counts (with and without the published
 * filter, both locales).
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  const slug = request.nextUrl.searchParams.get("slug") || "social-media";

  const payload = await getPayload();

  const env = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    has_DATABASE_URL: Boolean(process.env.DATABASE_URL),
    has_POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
    db_host: process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).host
      : null,
  };

  const allCategories = await payload.find({
    collection: "categories",
    locale: "all",
    limit: 1000,
    pagination: false,
  });

  const categorySlugs = allCategories.docs.map((c) => ({
    id: c.id,
    slug: c.slug,
  }));

  const categoryEn = await payload.find({
    collection: "categories",
    where: { slug: { equals: slug } },
    locale: "en",
    limit: 1,
  });
  const categoryDoc = categoryEn.docs[0];

  const result: Record<string, unknown> = {
    env,
    categoryCount: allCategories.totalDocs,
    categorySlugs,
    categoryLookup: {
      slug,
      found: Boolean(categoryDoc),
      id: categoryDoc?.id ?? null,
    },
  };

  if (categoryDoc) {
    const noFilter = await payload.find({
      collection: "services",
      where: {
        category: { equals: categoryDoc.id },
        region: { in: ["eu", "eu-friendly"] },
      },
      locale: "en",
      limit: 100,
      depth: 0,
    });

    const publishedFilter = await payload.find({
      collection: "services",
      where: {
        and: [
          { _status: { equals: "published" } },
          { category: { equals: categoryDoc.id } },
          { region: { in: ["eu", "eu-friendly"] } },
        ],
      },
      locale: "en",
      limit: 100,
      depth: 0,
    });

    const draftTrue = await payload.find({
      collection: "services",
      where: {
        category: { equals: categoryDoc.id },
        region: { in: ["eu", "eu-friendly"] },
      },
      locale: "en",
      limit: 100,
      depth: 0,
      draft: true,
    });

    result.services = {
      noFilterCount: noFilter.totalDocs,
      publishedFilterCount: publishedFilter.totalDocs,
      draftTrueCount: draftTrue.totalDocs,
      sampleNoFilter: noFilter.docs.slice(0, 5).map((s) => ({
        id: s.id,
        slug: s.slug,
        region: s.region,
        _status: (s as { _status?: string })._status,
      })),
    };
  }

  return Response.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}

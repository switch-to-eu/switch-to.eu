import { getPayload } from "@/lib/payload";
import type { Service, Guide, Category } from "@/payload-types";
import { getCategorySlug } from "@/lib/services";
import { routing, defaultLocale } from "@switch-to-eu/i18n/routing";
import { unstable_cache } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";
const { locales } = routing;

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
  alternates: Record<string, string>;
}

function localeAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales.map((l) => [l, `${baseUrl}/${l}${path}`])
    ),
    "x-default": `${baseUrl}/${defaultLocale}${path}`,
  };
}

function toXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const alternateLinks = Object.entries(entry.alternates)
        .map(
          ([lang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`
        )
        .join("\n");

      return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
${alternateLinks}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

async function buildEntries(): Promise<SitemapEntry[]> {
  const now = new Date();

  const homeEntries: SitemapEntry[] = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: localeAlternates(""),
  }));

  const staticRoutes = [
    "/about",
    "/contribute",
    "/tools",
    "/privacy",
    "/terms",
    "/feedback",
  ];

  const staticEntries: SitemapEntry[] = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: localeAlternates(route),
    }))
  );

  let categoriesEntries: SitemapEntry[] = [];
  let servicesEntries: SitemapEntry[] = [];
  let guidesEntries: SitemapEntry[] = [];

  try {
    const payload = await getPayload();

    const [categoriesResult, servicesResult, guidesResult] = await Promise.all([
      payload.find({
        collection: "categories",
        locale: "all",
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: "services",
        where: { _status: { equals: "published" } },
        // Pricing/security/comparison subviews are now tabs (?tab=) on the
        // service URL, so we no longer emit per-tab entries; using the
        // default locale is still safer here than `locale: "all"` envelopes.
        locale: defaultLocale,
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: "guides",
        where: { _status: { equals: "published" } },
        locale: "all",
        limit: 0,
        pagination: false,
        depth: 1,
      }),
    ]);

    categoriesEntries = categoriesResult.docs.flatMap((category: Category) => {
      const path = `/services/${category.slug}`;
      return locales.map((locale) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: localeAlternates(path),
      }));
    });

    servicesEntries = servicesResult.docs.flatMap((service: Service) => {
      const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
      const serviceUrl = `/services/${regionPath}/${service.slug}`;
      const lastMod = new Date(service.updatedAt);

      return locales.map((locale) => ({
        url: `${baseUrl}/${locale}${serviceUrl}`,
        lastModified: lastMod,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: localeAlternates(serviceUrl),
      }));
    });

    guidesEntries = guidesResult.docs.flatMap((guide: Guide) => {
      const categorySlug = getCategorySlug(guide.category) || "uncategorized";
      const path = `/guides/${categorySlug}/${guide.slug}`;

      return locales.map((locale) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(guide.updatedAt),
        changeFrequency: "monthly",
        priority: 0.9,
        alternates: localeAlternates(path),
      }));
    });
  } catch (error) {
    // Rethrow so unstable_cache sees the failure and does NOT cache a
    // partial sitemap missing every category / service / guide URL.
    console.error("[sitemap] Failed to fetch content from Payload:", error);
    throw error;
  }

  return [
    ...homeEntries,
    ...staticEntries,
    ...categoriesEntries,
    ...servicesEntries,
    ...guidesEntries,
  ];
}

const getCachedXml = unstable_cache(
  async () => toXml(await buildEntries()),
  ["sitemap-xml"],
  { tags: ["services", "guides", "categories"], revalidate: 3600 }
);

export async function GET() {
  const xml = await getCachedXml();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

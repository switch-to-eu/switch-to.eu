import { getPayload } from "@/lib/payload";
import type { Service, Guide, Category } from "@/payload-types";
import {
  getCategorySlug,
  getGuideSourceService,
  getGuideTargetService,
} from "@/lib/services";
import { routing, defaultLocale } from "@switch-to-eu/i18n/routing";
import { unstable_noStore as noStore } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";
const { locales } = routing;

export const dynamic = "force-dynamic";

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
  let comparisonEntries: SitemapEntry[] = [];
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
        locale: "all",
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: "guides",
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

      const entries: SitemapEntry[] = locales.map((locale) => ({
        url: `${baseUrl}/${locale}${serviceUrl}`,
        lastModified: lastMod,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: localeAlternates(serviceUrl),
      }));

      if (
        regionPath === "eu" &&
        ((service.pricingTiers && service.pricingTiers.length > 0) ||
          service.pricingDetails ||
          service.startingPrice)
      ) {
        const pricingUrl = `${serviceUrl}/pricing`;
        entries.push(
          ...locales.map((locale) => ({
            url: `${baseUrl}/${locale}${pricingUrl}`,
            lastModified: lastMod,
            changeFrequency: "monthly",
            priority: 0.5,
            alternates: localeAlternates(pricingUrl),
          }))
        );
      }

      if (
        regionPath === "eu" &&
        (service.gdprCompliance ||
          (service.certifications && service.certifications.length > 0) ||
          (service.dataStorageLocations &&
            service.dataStorageLocations.length > 0))
      ) {
        const securityUrl = `${serviceUrl}/security`;
        entries.push(
          ...locales.map((locale) => ({
            url: `${baseUrl}/${locale}${securityUrl}`,
            lastModified: lastMod,
            changeFrequency: "monthly",
            priority: 0.5,
            alternates: localeAlternates(securityUrl),
          }))
        );
      }

      return entries;
    });

    comparisonEntries = guidesResult.docs.flatMap((g: Guide) => {
      const target = getGuideTargetService(g);
      const source = getGuideSourceService(g);
      if (!target || !source || target.region === "non-eu") return [];

      const path = `/services/eu/${target.slug}/vs-${source.slug}`;
      return locales.map((locale) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(g.updatedAt),
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: localeAlternates(path),
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
    console.error("[sitemap] Failed to fetch content from Payload:", error);
  }

  return [
    ...homeEntries,
    ...staticEntries,
    ...categoriesEntries,
    ...servicesEntries,
    ...comparisonEntries,
    ...guidesEntries,
  ];
}

export async function GET() {
  noStore();

  const entries = await buildEntries();
  const xml = toXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

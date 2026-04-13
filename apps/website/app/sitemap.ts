import type { MetadataRoute } from "next";
import { getPayload } from "@/lib/payload";
import type { Service, Guide, Category } from "@/payload-types";
import { routing } from "@switch-to-eu/i18n/routing";
import { unstable_noStore as noStore } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_URL!;
const { locales } = routing;

export const dynamic = "force-dynamic";

// Static routes (excluding "/" which is the home page handled separately)
const staticRoutes = [
  "/about",
  "/contribute",
  "/tools",
  "/privacy",
  "/terms",
  "/feedback",
];

/**
 * Build hreflang alternates for a given path.
 * Each locale gets its own entry pointing to all locale variants.
 */
function localeAlternates(path: string) {
  return {
    languages: Object.fromEntries(
      locales.map((l) => [l, `${baseUrl}/${l}${path}`])
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  noStore();
  const payload = await getPayload();

  // Home page — one entry per locale, no trailing slash
  const homeEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: localeAlternates(""),
  }));

  // Static routes — one entry per locale per route
  const staticRouteEntries: MetadataRoute.Sitemap = staticRoutes.flatMap(
    (route) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
        alternates: localeAlternates(route),
      }))
  );

  // Fetch all content in parallel
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
      locale: "all",
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

  // Categories — one entry per locale
  const categoriesEntries: MetadataRoute.Sitemap = categoriesResult.docs.flatMap(
    (category: Category) => {
      const path = `/services/${category.slug}`;
      return locales.map((locale) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: localeAlternates(path),
      }));
    }
  );

  // Services — one entry per locale, plus pricing/security subpages
  const servicesEntries: MetadataRoute.Sitemap = servicesResult.docs.flatMap(
    (service: Service) => {
      const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
      const serviceUrl = `/services/${regionPath}/${service.slug}`;
      const lastMod = new Date(service.updatedAt);

      const entries: MetadataRoute.Sitemap = locales.map((locale) => ({
        url: `${baseUrl}/${locale}${serviceUrl}`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: localeAlternates(serviceUrl),
      }));

      // Pricing subpage
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
            changeFrequency: "monthly" as const,
            priority: 0.5,
            alternates: localeAlternates(pricingUrl),
          }))
        );
      }

      // Security subpage
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
            changeFrequency: "monthly" as const,
            priority: 0.5,
            alternates: localeAlternates(securityUrl),
          }))
        );
      }

      return entries;
    }
  );

  // Comparison pages (eu-service vs non-eu-service) from guides
  const comparisonEntries: MetadataRoute.Sitemap = guidesResult.docs
    .filter(
      (g: Guide) =>
        typeof g.targetService === "object" &&
        typeof g.sourceService === "object" &&
        (g.targetService as Service).region !== "non-eu"
    )
    .flatMap((g: Guide) => {
      const path = `/services/eu/${(g.targetService as Service).slug}/vs-${(g.sourceService as Service).slug}`;
      return locales.map((locale) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(g.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.5,
        alternates: localeAlternates(path),
      }));
    });

  // Guides — one entry per locale
  const guidesEntries: MetadataRoute.Sitemap = guidesResult.docs.flatMap(
    (guide: Guide) => {
      const categorySlug =
        typeof guide.category === "object"
          ? (guide.category as Category).slug
          : "uncategorized";
      const path = `/guides/${categorySlug}/${guide.slug}`;

      return locales.map((locale) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(guide.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: localeAlternates(path),
      }));
    }
  );

  return [
    ...homeEntries,
    ...staticRouteEntries,
    ...categoriesEntries,
    ...servicesEntries,
    ...comparisonEntries,
    ...guidesEntries,
  ];
}

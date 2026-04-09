import type { MetadataRoute } from "next";
import { getPayload } from "@/lib/payload";
import type { Service, Guide, Category } from "@/payload-types";
import { routing } from "@switch-to-eu/i18n/routing";
import { unstable_noStore as noStore } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_URL!;

export const dynamic = "force-dynamic";

// Define your static routes
const staticRoutes = [
  "/",
  "/about",
  "/contribute",
  "/tools",
  "/privacy",
  "/terms",
  "/feedback",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  noStore();
  const defaultLocale = routing.defaultLocale;
  const payload = await getPayload();

  const localeEntries = [
    {
      url: `${baseUrl}/${defaultLocale}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  // Create entries for each static route in each locale
  const staticRouteEntries = staticRoutes.flatMap((route) => {
    return {
      url: `${baseUrl}/${defaultLocale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  // Fetch all content in parallel
  const [categoriesResult, servicesResult, guidesResult] = await Promise.all([
    payload.find({
      collection: "categories",
      locale: defaultLocale,
      limit: 0, // 0 = no limit in Payload
      pagination: false,
    }),
    payload.find({
      collection: "services",
      locale: defaultLocale,
      limit: 0,
      pagination: false,
    }),
    payload.find({
      collection: "guides",
      locale: defaultLocale,
      limit: 0,
      pagination: false,
      depth: 1, // populate category relationship
    }),
  ]);

  const categoriesEntries = categoriesResult.docs.map((category: Category) => ({
    url: `${baseUrl}/${defaultLocale}/services/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const servicesEntries = servicesResult.docs.flatMap((service: Service) => {
    const regionPath =
      service.region === "non-eu" ? "non-eu" : "eu";
    const serviceUrl = `/services/${regionPath}/${service.slug}`;

    const entries = [
      {
        url: `${baseUrl}/${defaultLocale}${serviceUrl}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
    ];

    // Add pricing subpage if service has pricing data
    if (regionPath === "eu" && (
      (service.pricingTiers && service.pricingTiers.length > 0) ||
      service.pricingDetails ||
      service.startingPrice
    )) {
      entries.push({
        url: `${baseUrl}/${defaultLocale}${serviceUrl}/pricing`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      });
    }

    // Add security subpage if service has security data
    if (regionPath === "eu" && (
      service.gdprCompliance ||
      (service.certifications && service.certifications.length > 0) ||
      (service.dataStorageLocations && service.dataStorageLocations.length > 0)
    )) {
      entries.push({
        url: `${baseUrl}/${defaultLocale}${serviceUrl}/security`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      });
    }

    return entries;
  });

  // Comparison pages (eu-service/vs-non-eu-service) from guides
  const comparisonEntries = guidesResult.docs
    .filter(
      (g: Guide) =>
        typeof g.targetService === "object" &&
        typeof g.sourceService === "object" &&
        (g.targetService as Service).region !== "non-eu",
    )
    .map((g: Guide) => ({
      url: `${baseUrl}/${defaultLocale}/services/eu/${(g.targetService as Service).slug}/vs-${(g.sourceService as Service).slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const guidesEntries = guidesResult.docs.map((guide: Guide) => {
    const categorySlug =
      typeof guide.category === "object"
        ? (guide.category as Category).slug
        : "uncategorized";

    return {
      url: `${baseUrl}/${defaultLocale}/guides/${categorySlug}/${guide.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [
    ...staticRouteEntries,
    ...localeEntries,
    ...categoriesEntries,
    ...servicesEntries,
    ...comparisonEntries,
    ...guidesEntries,
  ];
}

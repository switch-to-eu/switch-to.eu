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

  const servicesEntries = servicesResult.docs.map((service: Service) => {
    const regionPath =
      service.region === "non-eu" ? "non-eu" : "eu";
    const serviceUrl = `/services/${regionPath}/${service.slug}`;

    return {
      url: `${baseUrl}/${defaultLocale}${serviceUrl}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

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
    ...guidesEntries,
  ];
}

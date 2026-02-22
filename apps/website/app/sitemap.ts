import type { MetadataRoute } from "next";
import { getAllCategoriesMetadata } from "@/lib/content/services/categories";
import { getAllGuides } from "@/lib/content/services/guides";
import { getAllServices } from "@/lib/content/services/services";
import { routing } from "@switch-to-eu/i18n/routing";
import { unstable_noStore as noStore } from "next/cache";
const baseUrl = process.env.NEXT_PUBLIC_URL!;

export const dynamic = "force-dynamic";

// Define your static routes
const staticRoutes = ["/", "/about", "/services", "/contact", "/tools/website"];

export default function sitemap(): MetadataRoute.Sitemap {
  noStore();
  const defaultLocale = routing.defaultLocale;

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

  const categories = getAllCategoriesMetadata(defaultLocale);

  const categoriesEntries = categories.map((category) => {
    const url = `/services/${category.slug}`;

    return {
      url: `${baseUrl}/${defaultLocale}${url}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  const services = getAllServices(defaultLocale);

  const servicesEntries = services.map((service) => {
    const url = (name: string, region?: string) => {
      const serviceSlug = name.toLowerCase().replace(/\s+/g, "-");

      if (region === "eu") {
        return `/services/${serviceSlug}`;
      }

      return `/services/${region}/${serviceSlug}`;
    };

    return {
      url: `${baseUrl}/${defaultLocale}${url(service.name, service.region)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  const guides = getAllGuides({ lang: defaultLocale });

  const guidesEntries = guides.map((guide) => {
    const url = `/guides/${guide.category}/${guide.slug}`;

    return {
      url: `${baseUrl}/${defaultLocale}${url}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  // Flatten all entries
  return [
    ...staticRouteEntries,
    ...localeEntries,
    ...categoriesEntries,
    ...servicesEntries,
    ...guidesEntries,
  ];
}

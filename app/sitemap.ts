import type { MetadataRoute } from "next";
import { getAllCategoriesMetadata } from "@/lib/content/services/categories";
import { getAllGuides } from "@/lib/content/services/guides";
import { getAllServices } from "@/lib/content/services/services";
import { routing } from "@/i18n/routing";
import { ServiceFrontmatter } from "@/lib/content";

const baseUrl = process.env.NEXT_PUBLIC_URL!;

// Define your static routes
const staticRoutes = ["/", "/about", "/services", "/contact", "/tools/website"];

export default function sitemap(): MetadataRoute.Sitemap {
  const defaultLocale = routing.defaultLocale;
  const locales = routing.locales;

  const otherLocales = locales.filter((l) => l !== defaultLocale);

  const countryPrefix = {
    en: "en-US",
    nl: "nl-BE",
  };

  const localeEntries = [
    {
      url: `${baseUrl}/${defaultLocale}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          ...otherLocales.reduce((acc, l) => {
            acc[countryPrefix[l]] = `${baseUrl}/${countryPrefix[l]}`;
            return acc;
          }, {} as Record<string, string>),
        },
      },
    },
  ];

  // Create entries for each static route in each locale
  const staticRouteEntries = staticRoutes.flatMap((route) => {
    return {
      url: `${baseUrl}/${defaultLocale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      // Add locale alternates
      alternates: {
        languages: otherLocales.reduce((acc, l) => {
          acc[countryPrefix[l]] = `${baseUrl}/${l}${route}`;
          return acc;
        }, {} as Record<string, string>),
      },
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
      alternates: {
        languages: otherLocales.reduce((acc, l) => {
          acc[countryPrefix[l]] = `${baseUrl}/${l}${url}`;
          return acc;
        }, {} as Record<string, string>),
      },
    };
  });

  const services = getAllServices(defaultLocale);

  const otherServices = otherLocales.reduce((acc, l) => {
    acc[l] = getAllServices(l);
    return acc;
  }, {} as Record<string, ServiceFrontmatter[]>);

  const servicesEntries = services.map((service, index) => {
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
      alternates: {
        languages: otherLocales.reduce((acc, l) => {
          acc[countryPrefix[l]] = `${baseUrl}/${l}${url(
            otherServices[l][index].name,
            otherServices[l][index].region
          )}`;
          return acc;
        }, {} as Record<string, string>),
      },
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
      alternates: {
        languages: otherLocales.reduce((acc, l) => {
          acc[countryPrefix[l]] = `${baseUrl}/${l}${url}`;
          return acc;
        }, {} as Record<string, string>),
      },
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

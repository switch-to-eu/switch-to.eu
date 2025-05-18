import type { MetadataRoute } from "next";
import { getAllCategoriesMetadata } from "@/lib/content/services/categories";
import { getAllGuides } from "@/lib/content/services/guides";
import { getAllServices } from "@/lib/content/services/services";
import { Locale } from "next-intl";

const baseUrl = "https://switch-to.eu";

// Define your supported locales
const locales: Locale[] = ["en", "nl"];

// Define your static routes
const staticRoutes = ["/", "/about", "/services", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Create entries for each static route in each locale
  const staticRouteEntries = staticRoutes.flatMap((route) => {
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      // Add locale alternates
      alternates: {
        languages: locales.reduce((acc, l) => {
          acc[l] = `${baseUrl}/${l}${route}`;
          return acc;
        }, {} as Record<string, string>),
      },
    }));
  });

  // Create entries for each locale root
  const localeEntries = locales
    .filter((locale) => locale !== "en")
    .map((locale) => {
      return {
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
        alternates: {
          languages: {
            en: baseUrl,
            ...locales
              .filter((l) => l !== locale && l !== "en")
              .reduce((acc, l) => {
                acc[l] = `${baseUrl}/${l}`;
                return acc;
              }, {} as Record<string, string>),
          },
        },
      };
    });

  // Create entries for service category pages
  const categoriesEntries = await Promise.all(
    locales.map(async (locale) => {
      const categories = getAllCategoriesMetadata(locale);

      return categories.map((category) => ({
        url: `${baseUrl}/${locale}/services/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: locales.reduce((acc, l) => {
            acc[l] = `${baseUrl}/${l}/services/${category.slug}`;
            return acc;
          }, {} as Record<string, string>),
        },
      }));
    })
  );

  // Create entries for service pages
  const servicesEntries = await Promise.all(
    locales.map(async (locale) => {
      const services = await getAllServices(locale);

      return services.map((service) => {
        const serviceSlug = service.name.toLowerCase().replace(/\s+/g, "-");
        const region = service.region || "eu"; // Default to EU for backward compatibility

        return {
          url: `${baseUrl}/${locale}/services/${region}/${serviceSlug}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
          alternates: {
            languages: locales.reduce((acc, l) => {
              acc[l] = `${baseUrl}/${l}/services/${region}/${serviceSlug}`;
              return acc;
            }, {} as Record<string, string>),
          },
        };
      });
    })
  );

  // Create entries for guide pages
  const guidesEntries = await Promise.all(
    locales.map(async (locale) => {
      const guides = await getAllGuides({ lang: locale });

      return guides.map((guide) => ({
        url: `${baseUrl}/${locale}/guides/${guide.category}/${guide.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: {
          languages: locales.reduce((acc, l) => {
            acc[l] = `${baseUrl}/${l}/guides/${guide.category}/${guide.slug}`;
            return acc;
          }, {} as Record<string, string>),
        },
      }));
    })
  );

  // Flatten all entries
  return [
    ...staticRouteEntries,
    ...localeEntries,
    ...categoriesEntries.flat(),
    ...servicesEntries.flat(),
    ...guidesEntries.flat(),
  ];
}

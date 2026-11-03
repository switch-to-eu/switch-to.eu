import type { MetadataRoute } from "next";
import { defaultLocale, routing } from "./routing";

/**
 * robots.txt for a tool app. Preview and development deployments stay out of
 * search. `disallow` lists the paths that hold private links.
 */
export function createRobots(
  baseUrl: string,
  disallow: string[] = [],
): MetadataRoute.Robots {
  const env = process.env.VERCEL_ENV;
  if (env === "preview" || env === "development") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", ...disallow] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

/** sitemap.xml for a tool app: each public path in each locale, with hreflang. */
export function createSitemap(
  baseUrl: string,
  paths: string[],
): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      alternates: {
        languages: {
          ...Object.fromEntries(
            routing.locales.map((l) => [l, `${baseUrl}/${l}${path}`]),
          ),
          "x-default": `${baseUrl}/${defaultLocale}${path}`,
        },
      },
    })),
  );
}

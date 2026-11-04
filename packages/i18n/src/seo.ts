import type { Metadata, MetadataRoute, ResolvingMetadata } from "next";
import { defaultLocale, routing, type Locale } from "./routing";
import { generateLanguageAlternates } from "./utils";

/**
 * Canonical, hreflang and `og:url` for one page of a tool app. `og:url` stays
 * out of the layout because child pages inherit it. Next.js replaces the whole
 * `openGraph` object when a page sets one, so this copies the layout's values.
 *
 * `path` has no leading slash and is empty for the home page.
 */
export async function createPageMetadata(
  parent: ResolvingMetadata,
  path: string,
  locale: Locale,
): Promise<Metadata> {
  const alternates = generateLanguageAlternates(path, locale);
  const og = (await parent).openGraph;

  return {
    alternates,
    openGraph: {
      type: "website",
      url: alternates.canonical,
      siteName: og?.siteName ?? undefined,
      title: og?.title,
      description: og?.description ?? undefined,
      locale: og?.locale,
      images: og?.images,
    },
  };
}

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

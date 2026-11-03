import {
  getAllArticles,
  getAllCategories,
  getAllGuides,
  getAllServices,
} from "@/lib/content/loader";
import { getCategorySlug } from "@/lib/services";
import { routing, defaultLocale } from "@switch-to-eu/i18n/routing";

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

function buildEntries(): SitemapEntry[] {
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
    "/contribute/guide",
    "/tools",
    "/privacy",
    "/terms",
    "/feedback",
    "/news",
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

  const lastMod = (date: string) => {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? now : parsed;
  };

  const categoriesEntries: SitemapEntry[] = getAllCategories(defaultLocale).flatMap((category) => {
    const path = `/services/${category.slug}`;
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: lastMod(category.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: localeAlternates(path),
    }));
  });

  const servicesEntries: SitemapEntry[] = getAllServices(defaultLocale).flatMap((service) => {
    const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
    const serviceUrl = `/services/${regionPath}/${service.slug}`;
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${serviceUrl}`,
      lastModified: lastMod(service.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: localeAlternates(serviceUrl),
    }));
  });

  const guidesEntries: SitemapEntry[] = getAllGuides(defaultLocale).flatMap((guide) => {
    const categorySlug = getCategorySlug(guide.category) || "uncategorized";
    const path = `/guides/${categorySlug}/${guide.slug}`;
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: lastMod(guide.updatedAt),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: localeAlternates(path),
    }));
  });

  // Articles exist per locale, so only list (and cross-link) the locales
  // each article is actually published in.
  const articlesByLocale = new Map(locales.map((l) => [l, getAllArticles(l).filter((a) => !a.sample)]));
  const articleEntries: SitemapEntry[] = locales.flatMap((locale) =>
    (articlesByLocale.get(locale) ?? []).map((article) => {
      const path = `/news/${article.slug}`;
      const available = locales.filter((l) =>
        (articlesByLocale.get(l) ?? []).some((a) => a.slug === article.slug)
      );
      return {
        url: `${baseUrl}/${locale}${path}`,
        lastModified: lastMod(article.updatedAt || article.date),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          ...Object.fromEntries(available.map((l) => [l, `${baseUrl}/${l}${path}`])),
          "x-default": `${baseUrl}/${available.includes(defaultLocale) ? defaultLocale : available[0]}${path}`,
        },
      };
    })
  );

  return [
    ...homeEntries,
    ...staticEntries,
    ...categoriesEntries,
    ...servicesEntries,
    ...guidesEntries,
    ...articleEntries,
  ];
}

export function GET() {
  const xml = toXml(buildEntries());

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

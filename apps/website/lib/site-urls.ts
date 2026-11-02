import {
  getAllCategories,
  getAllGuides,
  getAllLandingPages,
  getAllServices,
} from "@/lib/content/loader";
import { routing } from "@switch-to-eu/i18n/routing";
import { getCategorySlug } from "@/lib/services";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";
const { locales } = routing;

const STATIC_ROUTES = [
  "",
  "/about",
  "/contribute",
  "/tools",
  "/privacy",
  "/terms",
  "/feedback",
];

/**
 * Collect every public URL on the site across all locales.
 * Used by the IndexNow bulk-submit admin action.
 */
export function collectAllSiteUrls(): string[] {
  const paths = new Set<string>();

  for (const route of STATIC_ROUTES) paths.add(route);

  const [categories, services, guides, landingPages] = [
    getAllCategories("en"),
    getAllServices("en"),
    getAllGuides("en"),
    getAllLandingPages("en"),
  ];

  for (const category of categories) {
    if (category.slug) paths.add(`/services/${category.slug}`);
  }

  for (const service of services) {
    if (!service.slug) continue;
    const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
    paths.add(`/services/${regionPath}/${service.slug}`);
  }

  for (const guide of guides) {
    if (!guide.slug) continue;
    const categorySlug = getCategorySlug(guide.category) || "uncategorized";
    paths.add(`/guides/${categorySlug}/${guide.slug}`);
  }

  for (const page of landingPages) {
    if (page.slug) paths.add(`/pages/${page.slug}`);
  }

  return [...paths].flatMap((path) =>
    locales.map((locale) => `${baseUrl}/${locale}${path}`)
  );
}

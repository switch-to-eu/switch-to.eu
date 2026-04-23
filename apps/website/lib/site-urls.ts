import { getPayload } from "@/lib/payload";
import { routing } from "@switch-to-eu/i18n/routing";
import type { Service, Guide, Category } from "@/payload-types";
import {
  getCategorySlug,
  getGuideSourceService,
  getGuideTargetService,
  hasPricingData,
  hasSecurityData,
} from "@/lib/services";

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
 * Collect every public, published URL on the site across all locales.
 * Used by the IndexNow bulk-submit admin action.
 */
export async function collectAllSiteUrls(): Promise<string[]> {
  const paths = new Set<string>();

  for (const route of STATIC_ROUTES) paths.add(route);

  const payload = await getPayload();

  const [categoriesResult, servicesResult, guidesResult, landingPagesResult] =
    await Promise.all([
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
      payload.find({
        collection: "landing-pages",
        where: { _status: { equals: "published" } },
        locale: "all",
        limit: 0,
        pagination: false,
      }),
    ]);

  for (const category of categoriesResult.docs as Category[]) {
    if (category.slug) paths.add(`/services/${category.slug}`);
  }

  for (const service of servicesResult.docs as Service[]) {
    if (!service.slug) continue;
    const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
    const servicePath = `/services/${regionPath}/${service.slug}`;
    paths.add(servicePath);

    if (regionPath === "eu" && hasPricingData(service)) {
      paths.add(`${servicePath}/pricing`);
    }

    if (regionPath === "eu" && hasSecurityData(service)) {
      paths.add(`${servicePath}/security`);
    }
  }

  for (const guide of guidesResult.docs as Guide[]) {
    if (!guide.slug) continue;
    const categorySlug = getCategorySlug(guide.category) || "uncategorized";
    paths.add(`/guides/${categorySlug}/${guide.slug}`);

    const target = getGuideTargetService(guide);
    const source = getGuideSourceService(guide);
    if (target && source && target.region !== "non-eu") {
      paths.add(`/services/eu/${target.slug}/vs-${source.slug}`);
    }
  }

  for (const page of landingPagesResult.docs as { slug?: string | null }[]) {
    if (page.slug) paths.add(`/pages/${page.slug}`);
  }

  return [...paths].flatMap((path) =>
    locales.map((locale) => `${baseUrl}/${locale}${path}`)
  );
}

import type { Service, Guide, Category } from "@/lib/content/types";
import {
  findCategory,
  findGuide,
  findService,
  getAllGuides,
  getAllServices,
  LOCALES,
} from "@/lib/content/loader";

export { LOCALES };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EU_REGIONS = ["eu", "eu-friendly"] as const;

const isEuRegion = (s: Service) =>
  (EU_REGIONS as readonly string[]).includes(s.region);

const featuredFirst = (a: Service, b: Service) =>
  Number(!!b.featured) - Number(!!a.featured);

// ---------------------------------------------------------------------------
// Queries
//
// Content is read from the markdown files in /content (see
// lib/content/loader.ts). The functions return promises so callers don't care
// where the data comes from.
// ---------------------------------------------------------------------------

/** Fetch a single EU service by slug. */
export const getServiceBySlug = (
  slug: string,
  locale: string,
): Promise<Service | null> => {
  const service = findService(slug, locale);
  return Promise.resolve(service && isEuRegion(service) ? service : null);
};

/** Fetch a single migration guide by slug. */
export const getGuideBySlug = (
  slug: string,
  locale: string,
): Promise<Guide | null> =>
  Promise.resolve(findGuide(slug, locale));

/**
 * Fetch guides that target a given service (i.e. migration guides *to* that
 * service).
 */
export const getRelatedGuides = (
  serviceSlug: string,
  locale: string,
): Promise<Guide[]> =>
  Promise.resolve(
    getAllGuides(locale).filter((g) => g.targetService?.slug === serviceSlug),
  );

/**
 * Fetch EU services in the same category, excluding the current service.
 * Returns up to 4 results with featured services sorted first.
 */
export const getSimilarServices = (
  categorySlug: string,
  excludeSlug: string,
  locale: string,
): Promise<Service[]> =>
  Promise.resolve(
    getAllServices(locale)
      .filter(
        (s) =>
          s.category.slug === categorySlug &&
          s.slug !== excludeSlug &&
          isEuRegion(s),
      )
      .sort(featuredFirst)
      .slice(0, 4),
  );

/**
 * Fetch a service by slug regardless of region. Used by the non-EU detail
 * page (which then enforces a redirect when region has flipped).
 */
export const getServiceBySlugAnyRegion = (
  slug: string,
  locale: string,
): Promise<Service | null> =>
  Promise.resolve(findService(slug, locale));

/** Fetch a single category by slug. */
export const getCategoryBySlug = (
  slug: string,
  locale: string,
): Promise<Category | null> =>
  Promise.resolve(findCategory(slug, locale));

/** Fetch migration guides for a specific (source, target) service pair. */
export const getMigrationGuidesForPair = (
  sourceSlug: string,
  targetSlug: string,
  locale: string,
): Promise<Guide[]> =>
  Promise.resolve(
    getAllGuides(locale).filter(
      (g) =>
        g.sourceService?.slug === sourceSlug &&
        g.targetService?.slug === targetSlug,
    ),
  );

/** Fetch all EU (region in eu | eu-friendly) services in a category. */
export const getEuServicesByCategory = (
  categorySlug: string,
  locale: string,
  limit = 100,
): Promise<Service[]> =>
  Promise.resolve(
    getAllServices(locale)
      .filter((s) => s.category.slug === categorySlug && isEuRegion(s))
      .slice(0, limit),
  );

/** Non-EU services in a category. People who leave one read its page first. */
export const getNonEuServicesByCategory = (
  categorySlug: string,
  locale: string,
): Service[] =>
  getAllServices(locale)
    .filter((s) => s.category.slug === categorySlug && s.region === "non-eu")
    .sort((a, b) => a.name.localeCompare(b.name));

/** Non-EU services that recommend this service as their alternative. */
export const getServicesReplacedBy = (
  serviceSlug: string,
  locale: string,
): Service[] =>
  getAllServices(locale)
    .filter(
      (s) =>
        s.region === "non-eu" && s.recommendedAlternative?.slug === serviceSlug,
    )
    .sort((a, b) => a.name.localeCompare(b.name));

// ---------------------------------------------------------------------------
// Static params helper
// ---------------------------------------------------------------------------

/**
 * Returns all locale + slug combinations for EU services, used in
 * `generateStaticParams` across service detail pages.
 */
export function getAllEuServiceSlugs() {
  const slugs = getAllServices("en")
    .filter(isEuRegion)
    .map((s) => s.slug);
  return LOCALES.flatMap((locale) =>
    slugs.map((slug) => ({ locale, service_name: slug })),
  );
}

// ---------------------------------------------------------------------------
// Pure helper functions
// ---------------------------------------------------------------------------

/**
 * Identity helper kept from the Payload era, when relations could be bare
 * ids. Relations from the markdown loader are always resolved objects.
 */
export function getResolvedRelation<T>(
  relation: T | null | undefined,
): T | null {
  return relation ?? null;
}

type CategoryRelation = Category | null | undefined;

/** Slug of a category relation, or `""` when there is none. */
export function getCategorySlug(category: CategoryRelation): string {
  return category?.slug ?? "";
}

/** Identifier of a Service/Guide category (its slug). */
export function getCategoryId(category: Category): string {
  return category.slug;
}

/** Localized title of a category relation. */
export function getCategoryTitle(
  category: CategoryRelation,
  fallback = "Other",
): string {
  return category?.title ?? fallback;
}

/** The source service of a guide, or `null`. */
export function getGuideSourceService(guide: Guide): Service | null {
  return guide.sourceService ?? null;
}

/** The target service of a guide, or `null`. */
export function getGuideTargetService(guide: Guide): Service | null {
  return guide.targetService ?? null;
}

/** Screenshot URL of a service. */
export function getScreenshotUrl(
  screenshot: Service["screenshot"],
): string | undefined {
  return screenshot ?? undefined;
}

/**
 * Map a service's GDPR compliance value to a human-readable label.
 * Returns `null` when the compliance value is `null`, `undefined`, or
 * `"unknown"`.
 */
export function getGdprLabel(
  compliance: Service["gdprCompliance"],
): string | null {
  switch (compliance) {
    case "compliant":
      return "GDPR Compliant";
    case "partial":
      return "Partially Compliant";
    case "non-compliant":
      return "Non-Compliant";
    default:
      return null;
  }
}

/**
 * Returns `true` if the service has any pricing data to display.
 */
export function hasPricingData(service: Service): boolean {
  return !!(
    (service.pricingTiers && service.pricingTiers.length > 0) ||
    service.startingPrice
  );
}

/**
 * Returns `true` if the service has any security / compliance data to display.
 */
export function hasSecurityData(service: Service): boolean {
  return !!(
    service.gdprCompliance ||
    (service.certifications && service.certifications.length > 0) ||
    (service.dataStorageLocations && service.dataStorageLocations.length > 0)
  );
}

/**
 * Returns the affiliate URL if set, otherwise the direct service URL.
 */
export function getOutboundUrl(
  service: Pick<Service, "url" | "affiliateUrl">,
): string {
  return service.affiliateUrl || service.url;
}

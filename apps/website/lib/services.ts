import { unstable_cache } from "next/cache";
import type { Service, Guide } from "@/payload-types";
import { getPayload } from "@/lib/payload";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EU_REGIONS = ["eu", "eu-friendly"] as const;
export const LOCALES = ["en", "nl"] as const;

// ---------------------------------------------------------------------------
// Cached queries
//
// All queries use `unstable_cache` with collection-level tags so results are
// persisted across requests. The cache is invalidated when content is
// published in Payload admin via `revalidateTag()` in afterChange hooks.
// This means zero DB hits at runtime unless revalidation is triggered.
// ---------------------------------------------------------------------------

/**
 * Fetch a single EU service by slug.
 */
export const getServiceBySlug = (
  slug: string,
  locale: string
): Promise<Service | null> =>
  unstable_cache(
    async () => {
      const payload = await getPayload();
      const { docs } = await payload.find({
        collection: "services",
        where: {
          slug: { equals: slug },
          region: { in: EU_REGIONS },
        },
        locale: locale as "en" | "nl",
        depth: 1,
        limit: 1,
      });
      return (docs[0] as Service | undefined) ?? null;
    },
    [`service-${slug}-${locale}`],
    { tags: ["services"] }
  )();

/**
 * Fetch guides that target a given service (i.e. migration guides *to* that
 * service).
 */
export const getRelatedGuides = (
  serviceId: number,
  locale: string
): Promise<Guide[]> =>
  unstable_cache(
    async () => {
      const payload = await getPayload();
      const { docs } = (await payload.find({
        collection: "guides",
        where: { targetService: { equals: serviceId } },
        locale: locale as "en" | "nl",
        depth: 1,
        limit: 10,
      })) as { docs: Guide[] };
      return docs;
    },
    [`guides-for-${serviceId}-${locale}`],
    { tags: ["guides", "services"] }
  )();

/**
 * Fetch services in the same category, excluding the current service.
 * Returns up to 4 results with featured services sorted first.
 */
export const getSimilarServices = (
  categoryId: number,
  excludeId: number,
  locale: string
): Promise<Service[]> =>
  unstable_cache(
    async () => {
      const payload = await getPayload();
      const { docs } = (await payload.find({
        collection: "services",
        where: {
          category: { equals: categoryId },
          id: { not_equals: excludeId },
          region: { in: EU_REGIONS },
        },
        locale: locale as "en" | "nl",
        limit: 5,
      })) as { docs: Service[] };

      return docs
        .sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        })
        .slice(0, 4);
    },
    [`similar-${categoryId}-${excludeId}-${locale}`],
    { tags: ["services"] }
  )();

// ---------------------------------------------------------------------------
// Static params helper
// ---------------------------------------------------------------------------

/**
 * Returns all locale + slug combinations for EU services, used in
 * `generateStaticParams` across service detail pages.
 */
export async function getAllEuServiceSlugs() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: { region: { in: EU_REGIONS } },
    limit: 100,
  });
  return LOCALES.flatMap((locale) =>
    docs.map((s) => ({ locale, service_name: s.slug }))
  );
}

// ---------------------------------------------------------------------------
// Pure helper functions
// ---------------------------------------------------------------------------

/** Resolve the slug string from a Service's category field. */
export function getCategorySlug(category: Service["category"]): string {
  return typeof category === "object" ? category.slug : String(category);
}

/** Resolve the numeric id from a Service's category field. */
export function getCategoryId(category: Service["category"]): number {
  return typeof category === "object" ? category.id : category;
}

/** Resolve the screenshot URL from a Service's screenshot field. */
export function getScreenshotUrl(
  screenshot: Service["screenshot"]
): string | undefined {
  if (typeof screenshot === "object" && screenshot !== null) {
    return screenshot.url ?? undefined;
  }
  return undefined;
}

/**
 * Map a service's GDPR compliance value to a human-readable label.
 * Returns `null` when the compliance value is `null`, `undefined`, or
 * `"unknown"`.
 */
export function getGdprLabel(
  compliance: Service["gdprCompliance"]
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
    service.pricingDetails ||
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
  service: Pick<Service, "url" | "affiliateUrl">
): string {
  return service.affiliateUrl || service.url;
}

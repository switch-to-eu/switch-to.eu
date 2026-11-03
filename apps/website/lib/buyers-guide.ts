import type { Category, CategoryPick, Guide, Service } from "@/lib/content/types";

/**
 * Helpers for category pages in buyer's-guide form (see
 * docs/design/2026-11-03-category-buyers-guide.md). The editorial parts
 * (picks, "how to choose") live in the category file. Every fact comes from
 * the listings, so a price fix in a listing updates the category page too.
 */

export type ResolvedPick = CategoryPick & {
  serviceDoc: Service;
  /** A switching guide that ends at this service, if one exists. */
  guide: Guide | null;
};

export function isBuyersGuide(category: Category): boolean {
  return (category.picks?.length ?? 0) > 0 || (category.compare?.length ?? 0) > 0;
}

/** Picks whose service exists in the category. Unknown slugs are dropped. */
export function resolvePicks(
  category: Category,
  services: Service[],
  guides: Guide[],
): ResolvedPick[] {
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  return (category.picks ?? []).flatMap((pick) => {
    const serviceDoc = bySlug.get(pick.service);
    if (!serviceDoc) return [];
    const guide = guides.find((g) => g.targetService?.slug === pick.service) ?? null;
    return [{ ...pick, serviceDoc, guide }];
  });
}

/** EU-member services first, then the rest, each group by name. */
export function sortForComparison(services: Service[]): Service[] {
  const rank = (s: Service) => (s.region === "eu" ? 0 : 1);
  return [...services].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

/** The newest `checkedAt` across the services' sources, as YYYY-MM-DD. */
export function latestCheckedAt(services: Service[]): string | null {
  const dates = services
    .flatMap((s) => s.sourceUrls ?? [])
    .map((u) => u.checkedAt)
    .filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d))
    .map((d) => d.slice(0, 10))
    .sort();
  return dates.at(-1) ?? null;
}

export function formatCheckedDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

/** Where a service's own page lives. */
export function serviceHref(service: Pick<Service, "region" | "slug">): string {
  return `/services/${service.region === "non-eu" ? "non-eu" : "eu"}/${service.slug}`;
}

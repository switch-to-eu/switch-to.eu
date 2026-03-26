/**
 * Seed importer for services.
 *
 * Reads all service Markdown files (EU + non-EU) from the content package,
 * converts body content to Lexical JSON, and creates corresponding Payload
 * CMS documents.  A second pass resolves `recommendedAlternative` relationships
 * after all services have been created.
 *
 * Returns a Map<slug, payloadId> so downstream importers (guides, landing
 * pages) can resolve service relationships.
 */

import type { Payload } from "payload";
import { getServiceSlugs, getServiceBySlug } from "@switch-to-eu/content";
import type { Locale } from "@switch-to-eu/content";
import { markdownToLexical } from "./markdownToLexical.js";

/**
 * Import all services into Payload CMS.
 *
 * @param payload     - Payload instance
 * @param categoryMap - Map of category slug to Payload category ID
 * @returns Map of service slug to Payload document ID
 */
export async function importServices(
  payload: Payload,
  categoryMap: Map<string, number>,
): Promise<Map<string, number>> {
  const serviceMap = new Map<string, number>();

  // getServiceSlugs is synchronous (reads filesystem via getAllServices)
  // NOTE: getEUServices()/getNonEUServices() return flat ServiceFrontmatter[]
  // without slugs or content. We use getServiceSlugs() + getServiceBySlug()
  // to get the full data including the content body.
  const euSlugs = getServiceSlugs("eu", "en" as Locale);
  const nonEuSlugs = getServiceSlugs("non-eu", "en" as Locale);
  const allSlugs = [...euSlugs, ...nonEuSlugs];

  // --- First pass: create all services ---

  for (const slug of allSlugs) {
    // getServiceBySlug is synchronous
    // Returns { frontmatter: ServiceFrontmatter; content: string; segments: ContentSegments } | null
    const enService = getServiceBySlug(slug, "en" as Locale);
    if (!enService) {
      console.warn(`  Skipping service "${slug}" — not found for locale en`);
      continue;
    }

    const enData = enService.frontmatter;
    console.log(`  Importing service: ${slug} (${enData.region ?? "unknown"})`);

    // Convert markdown body to Lexical JSON
    const enLexical = enService.content
      ? await markdownToLexical(enService.content)
      : undefined;

    // Try to get Dutch version (may not exist)
    let nlService: ReturnType<typeof getServiceBySlug> = null;
    try {
      nlService = getServiceBySlug(slug, "nl" as Locale);
    } catch {
      // Dutch version may not exist — that's fine
    }

    const nlLexical = nlService?.content
      ? await markdownToLexical(nlService.content)
      : undefined;

    // Resolve category slug to Payload category ID
    const categorySlug = enData.category.toLowerCase();
    const categoryId = categoryMap.get(categorySlug);
    if (!categoryId) {
      console.warn(
        `  Warning: category "${enData.category}" not found in categoryMap for service "${slug}"`,
      );
    }

    // Map array fields to Payload's array format: [{ fieldName: "value" }]
    const features =
      enData.features?.map((f: string) => ({ feature: f })) ?? [];
    const tags = enData.tags?.map((t: string) => ({ tag: t })) ?? [];
    const issues =
      enData.region === "non-eu" && enData.issues
        ? enData.issues.map((i: string) => ({ issue: i }))
        : [];

    const created = await payload.create({
      collection: "services",
      locale: "en",
      data: {
        name: enData.name,
        slug,
        category: categoryId,
        region: enData.region,
        location: enData.location,
        freeOption: enData.freeOption ?? false,
        startingPrice:
          typeof enData.startingPrice === "string"
            ? enData.startingPrice
            : enData.startingPrice
              ? String(enData.startingPrice)
              : "",
        description: enData.description,
        url: enData.url,
        featured: enData.featured ?? false,
        features,
        tags,
        content: enLexical,
        issues,
        // recommendedAlternative is resolved in the second pass below
      },
    });

    // Update with Dutch locale if available
    if (nlService) {
      const nlData = nlService.frontmatter;
      const nlFeatures =
        nlData.features?.map((f: string) => ({ feature: f })) ?? [];
      const nlIssues =
        nlData.region === "non-eu" && nlData.issues
          ? nlData.issues.map((i: string) => ({ issue: i }))
          : [];

      await payload.update({
        collection: "services",
        id: created.id,
        locale: "nl",
        data: {
          name: nlData.name,
          description: nlData.description,
          startingPrice:
            typeof nlData.startingPrice === "string"
              ? nlData.startingPrice
              : nlData.startingPrice
                ? String(nlData.startingPrice)
                : "",
          features: nlFeatures,
          content: nlLexical,
          issues: nlIssues,
        },
      });
    }

    serviceMap.set(slug, created.id);
  }

  // --- Second pass: resolve recommendedAlternative relationships ---

  console.log("  Resolving recommendedAlternative relationships...");
  let resolvedCount = 0;

  for (const slug of allSlugs) {
    const enService = getServiceBySlug(slug, "en" as Locale);
    if (!enService) continue;

    const fm = enService.frontmatter;
    if (fm.region !== "non-eu" || !fm.recommendedAlternative) continue;

    // The recommendedAlternative in frontmatter is a slug referencing an EU service
    const altSlug = fm.recommendedAlternative;
    const altId = serviceMap.get(altSlug);
    const serviceId = serviceMap.get(slug);

    if (altId && serviceId) {
      await payload.update({
        collection: "services",
        id: serviceId,
        data: { recommendedAlternative: altId },
      });
      resolvedCount++;
    } else if (serviceId && !altId) {
      console.warn(
        `  Warning: recommendedAlternative "${altSlug}" not found for service "${slug}"`,
      );
    }
  }

  console.log(
    `  Imported ${serviceMap.size} services (${resolvedCount} with recommendedAlternative)`,
  );
  return serviceMap;
}

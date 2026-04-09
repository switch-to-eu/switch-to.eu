/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
/**
 * Seed importer for services.
 */

import type { Payload } from "payload";
import {
  getServiceSlugs,
  getServiceBySlug,
} from "./content.js";
import { markdownToLexical } from "./markdownToLexical.js";
import { uploadMedia } from "./importMedia.js";

export async function importServices(
  payload: Payload | null,
  categoryMap: Map<string, number>,
  dryRun = false,
): Promise<Map<string, number>> {
  const serviceMap = new Map<string, number>();

  const euSlugs = getServiceSlugs("eu", "en");
  const nonEuSlugs = getServiceSlugs("non-eu", "en");
  const allSlugs = [...euSlugs, ...nonEuSlugs];

  for (const slug of allSlugs) {
    const enService = getServiceBySlug(slug, "en");
    if (!enService) {
      console.warn(`  Skipping service "${slug}" — not found for locale en`);
      continue;
    }

    const enData = enService.frontmatter;
    const enLexical = enService.content
      ? await markdownToLexical(enService.content)
      : undefined;

    let nlService: ReturnType<typeof getServiceBySlug> = null;
    try {
      nlService = getServiceBySlug(slug, "nl");
    } catch {
      // Dutch version may not exist
    }

    const nlLexical = nlService?.content
      ? await markdownToLexical(nlService.content)
      : undefined;

    const categorySlug = enData.category.toLowerCase();
    const categoryId = categoryMap.get(categorySlug)
      ?? categoryMap.get(categorySlug + "s")  // "browser" -> "browsers"
      ?? categoryMap.get(categorySlug.replace(/s$/, ""));  // "browsers" -> "browser"

    const features =
      enData.features?.map((f: string) => ({ feature: f })) ?? [];
    const tags = enData.tags?.map((t: string) => ({ tag: t })) ?? [];
    const issues =
      enData.region === "non-eu" && enData.issues
        ? enData.issues.map((i: string) => ({ issue: i }))
        : [];

    if (dryRun) {
      const fakeId = serviceMap.size + 1;
      serviceMap.set(slug, fakeId);
      console.log(`  [dry-run] Service: ${slug} — "${enData.name}" (${enData.region}, category: ${categorySlug}${categoryId ? "" : " NOT FOUND"}, features: ${features.length}, logo: ${enData.logo ? "yes" : "no"}, screenshot: ${enData.screenshot ? "yes" : "no"}, nl: ${nlService ? "yes" : "no"})`);
      continue;
    }

    // Upload logo and screenshot if present in frontmatter
    let logoId: number | undefined;
    let screenshotId: number | undefined;

    if (enData.logo) {
      logoId = await uploadMedia(payload!, enData.logo, `${enData.name} logo`);
    }
    if (enData.screenshot) {
      screenshotId = await uploadMedia(
        payload!,
        enData.screenshot,
        `${enData.name} screenshot`,
      );
    }

    const created = await payload!.create({
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
        ...(logoId ? { logo: logoId } : {}),
        ...(screenshotId ? { screenshot: screenshotId } : {}),
      },
    });

    if (nlService) {
      const nlData = nlService.frontmatter;
      await payload!.update({
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
          features:
            nlData.features?.map((f: string) => ({ feature: f })) ?? [],
          content: nlLexical,
          issues:
            nlData.region === "non-eu" && nlData.issues
              ? nlData.issues.map((i: string) => ({ issue: i }))
              : [],
        },
      });
    }

    serviceMap.set(slug, created.id as number);
  }

  // Second pass: resolve recommendedAlternative
  if (!dryRun) {
    console.log("  Resolving recommendedAlternative relationships...");
    let resolvedCount = 0;
    for (const slug of allSlugs) {
      const enService = getServiceBySlug(slug, "en");
      if (!enService) continue;
      const fm = enService.frontmatter;
      if (fm.region !== "non-eu" || !fm.recommendedAlternative) continue;
      const altId = serviceMap.get(fm.recommendedAlternative);
      const serviceId = serviceMap.get(slug);
      if (altId && serviceId) {
        await payload!.update({
          collection: "services",
          id: serviceId,
          data: { recommendedAlternative: altId },
        });
        resolvedCount++;
      }
    }
    console.log(`  Resolved ${resolvedCount} recommendedAlternative links`);
  }

  console.log(`  Imported ${serviceMap.size} services`);
  return serviceMap;
}

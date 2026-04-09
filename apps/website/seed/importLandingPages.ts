/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
/**
 * Seed importer for landing pages.
 */

import type { Payload } from "payload";
import {
  getAllLandingPages,
  getLandingPage,
} from "./content.js";
import { markdownToLexical } from "./markdownToLexical.js";

export async function importLandingPages(
  payload: Payload | null,
  categoryMap: Map<string, number>,
  serviceMap: Map<string, number>,
  dryRun = false,
): Promise<void> {
  const pages = getAllLandingPages("en");

  for (const { slug } of pages) {
    const enPage = getLandingPage(slug, "en");
    const nlPage = getLandingPage(slug, "nl");

    if (!enPage) continue;

    const enFm = enPage.frontmatter;
    const enLexical = enPage.content
      ? await markdownToLexical(enPage.content)
      : undefined;

    const categoryId = enFm.category
      ? categoryMap.get(enFm.category)
      : undefined;
    const recommendedServiceIds = enFm.recommendedServices
      ?.map((s: string) => serviceMap.get(s))
      .filter(Boolean);
    const relatedServiceId = enFm.relatedService
      ? serviceMap.get(enFm.relatedService)
      : undefined;

    if (dryRun) {
      console.log(`  [dry-run] Landing page: ${slug} — "${enFm.title}" (recommended: ${recommendedServiceIds?.length ?? 0}, related: ${enFm.relatedService ?? "none"}, nl: ${nlPage ? "yes" : "no"})`);
      continue;
    }

    const created = await payload!.create({
      collection: "landing-pages",
      locale: "en",
      data: {
        title: enFm.title,
        slug,
        description: enFm.description,
        keywords:
          enFm.keywords?.map((k: string) => ({ keyword: k })) ?? [],
        ogTitle: enFm.ogTitle ?? "",
        ogDescription: enFm.ogDescription ?? "",
        category: categoryId,
        recommendedServices: recommendedServiceIds,
        relatedService: relatedServiceId,
        content: enLexical,
      },
    });

    if (nlPage) {
      const nlFm = nlPage.frontmatter;
      await payload!.update({
        collection: "landing-pages",
        id: created.id,
        locale: "nl",
        data: {
          title: nlFm.title,
          description: nlFm.description,
          ogTitle: nlFm.ogTitle ?? "",
          ogDescription: nlFm.ogDescription ?? "",
          content: nlPage.content
            ? await markdownToLexical(nlPage.content)
            : undefined,
        },
      });
    }
  }

  console.log(`  Imported ${pages.length} landing pages`);
}

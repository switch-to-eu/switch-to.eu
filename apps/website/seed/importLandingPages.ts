/**
 * Seed script — import landing pages from the file-based content system into Payload CMS.
 *
 * Reads all landing pages via @switch-to-eu/content, converts markdown content
 * to Lexical editor JSON, resolves category/service relationships, and creates
 * Payload documents in both English and Dutch locales.
 */

import type { Payload } from "payload";
import { getAllLandingPages, getLandingPage } from "@switch-to-eu/content";
import { markdownToLexical } from "./markdownToLexical";

// NOTE: getAllLandingPages() returns Array<{ frontmatter, slug }>, NOT string[].

export async function importLandingPages(
  payload: Payload,
  categoryMap: Map<string, number>,
  serviceMap: Map<string, number>,
): Promise<void> {
  const pages = getAllLandingPages("en");

  for (const { slug } of pages) {
    console.log(`Importing landing page: ${slug}`);

    // getLandingPage is synchronous
    const enPage = getLandingPage(slug, "en");
    const nlPage = getLandingPage(slug, "nl");

    if (!enPage) continue;

    const enFm = enPage.frontmatter;
    const enLexical = enPage.content
      ? await markdownToLexical(enPage.content)
      : undefined;

    // Resolve relationships
    const categoryId = enFm.category
      ? categoryMap.get(enFm.category)
      : undefined;
    const recommendedServiceIds = enFm.recommendedServices
      ?.map((s: string) => serviceMap.get(s))
      .filter(Boolean);
    const relatedServiceId = enFm.relatedService
      ? serviceMap.get(enFm.relatedService)
      : undefined;

    const created = await payload.create({
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
      await payload.update({
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

  console.log(`Imported ${pages.length} landing pages`);
}

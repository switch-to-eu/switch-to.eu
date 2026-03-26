/**
 * Seed importer for static pages (privacy, terms).
 */

import type { Payload } from "payload";
import { getPageContent } from "./content.js";
import { markdownToLexical } from "./markdownToLexical.js";

const STATIC_PAGES = ["privacy", "terms"];

export async function importPages(
  payload: Payload | null,
  dryRun = false,
): Promise<void> {
  for (const pageSlug of STATIC_PAGES) {
    const enContent = getPageContent(pageSlug, "en");
    const nlContent = getPageContent(pageSlug, "nl");

    const enLexical = enContent?.content
      ? await markdownToLexical(enContent.content)
      : undefined;
    const nlLexical = nlContent?.content
      ? await markdownToLexical(nlContent.content)
      : undefined;

    if (dryRun) {
      console.log(`  [dry-run] Page: ${pageSlug} (en: ${enLexical ? "yes" : "no"}, nl: ${nlLexical ? "yes" : "no"})`);
      continue;
    }

    const created = await payload!.create({
      collection: "pages",
      locale: "en",
      data: {
        title: pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1),
        slug: pageSlug,
        content: enLexical,
      },
    });

    if (nlLexical) {
      await payload!.update({
        collection: "pages",
        id: created.id,
        locale: "nl",
        data: {
          title: pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1),
          content: nlLexical,
        },
      });
    }
  }

  console.log(`  Imported ${STATIC_PAGES.length} static pages`);
}

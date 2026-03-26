/**
 * Seed script — import static pages (privacy, terms) from the file-based
 * content system into Payload CMS.
 *
 * Reads page content via @switch-to-eu/content's getPageContent(), converts
 * markdown to Lexical editor JSON, and creates Payload documents in both
 * English and Dutch locales.
 */

import type { Payload } from "payload";
import { getPageContent } from "@switch-to-eu/content";
import type { Locale } from "@switch-to-eu/content";
import { markdownToLexical } from "./markdownToLexical";

const STATIC_PAGES = ["privacy", "terms"];

export async function importPages(payload: Payload): Promise<void> {
  for (const pageSlug of STATIC_PAGES) {
    console.log(`Importing page: ${pageSlug}`);

    // getPageContent is synchronous
    const enContent = getPageContent(pageSlug, "en" as Locale);
    const nlContent = getPageContent(pageSlug, "nl" as Locale);

    const enLexical = enContent?.content
      ? await markdownToLexical(enContent.content)
      : undefined;
    const nlLexical = nlContent?.content
      ? await markdownToLexical(nlContent.content)
      : undefined;

    const created = await payload.create({
      collection: "pages",
      locale: "en",
      data: {
        title: pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1),
        slug: pageSlug,
        content: enLexical,
      },
    });

    if (nlLexical) {
      await payload.update({
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

  console.log(`Imported ${STATIC_PAGES.length} static pages`);
}

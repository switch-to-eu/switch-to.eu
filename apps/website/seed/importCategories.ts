/**
 * Seed importer for categories.
 *
 * Reads all category Markdown files from the content package (both EN and NL
 * locales), converts body content to Lexical JSON, and creates corresponding
 * Payload CMS documents.
 *
 * Returns a Map<slug, payloadId> so downstream importers can resolve
 * category relationships.
 */

import type { Payload } from "payload";
import {
  getAllCategoriesMetadata,
  getCategoryContent,
} from "@switch-to-eu/content";
import type { Locale } from "@switch-to-eu/content";
import { markdownToLexical } from "./markdownToLexical.js";

/**
 * Import all categories into Payload CMS.
 *
 * @param payload - Payload instance
 * @returns Map of category slug to Payload document ID
 */
export async function importCategories(
  payload: Payload,
): Promise<Map<string, number>> {
  const categoryMap = new Map<string, number>();

  // getAllCategoriesMetadata is synchronous (reads filesystem)
  // Returns Array<{ slug: string; metadata: { title, description, icon? } }>
  const categories = getAllCategoriesMetadata("en" as Locale);

  for (const cat of categories) {
    console.log(`  Importing category: ${cat.slug}`);

    // getCategoryContent is synchronous
    // Returns { metadata: CategoryMetadata | null; content: string | null; segments: ContentSegments | null }
    const enContent = getCategoryContent(cat.slug, "en" as Locale);
    const nlContent = getCategoryContent(cat.slug, "nl" as Locale);

    // Convert markdown body to Lexical JSON for Payload's richText field
    const enLexical =
      enContent.content ? await markdownToLexical(enContent.content) : undefined;
    const nlLexical =
      nlContent.content ? await markdownToLexical(nlContent.content) : undefined;

    // Create the document with English locale first
    const created = await payload.create({
      collection: "categories",
      locale: "en",
      data: {
        title: enContent.metadata?.title ?? cat.metadata.title,
        description: enContent.metadata?.description ?? cat.metadata.description,
        icon: cat.metadata.icon ?? "",
        slug: cat.slug,
        content: enLexical,
      },
    });

    // Update with Dutch locale if available
    if (nlContent.metadata) {
      await payload.update({
        collection: "categories",
        id: created.id,
        locale: "nl",
        data: {
          title: nlContent.metadata.title ?? "",
          description: nlContent.metadata.description ?? "",
          content: nlLexical,
        },
      });
    }

    categoryMap.set(cat.slug, created.id);
  }

  console.log(`  Imported ${categoryMap.size} categories`);
  return categoryMap;
}

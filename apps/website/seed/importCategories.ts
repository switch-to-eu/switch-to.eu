/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
/**
 * Seed importer for categories.
 */

import type { Payload } from "payload";
import {
  getAllCategoriesMetadata,
  getCategoryContent,
} from "./content.js";
import { markdownToLexical } from "./markdownToLexical.js";

export async function importCategories(
  payload: Payload | null,
  dryRun = false,
): Promise<Map<string, number>> {
  const categoryMap = new Map<string, number>();

  const categories = getAllCategoriesMetadata("en");

  for (const cat of categories) {
    const enContent = getCategoryContent(cat.slug, "en");
    const nlContent = getCategoryContent(cat.slug, "nl");

    const enLexical =
      enContent.content ? await markdownToLexical(enContent.content) : undefined;
    const nlLexical =
      nlContent.content ? await markdownToLexical(nlContent.content) : undefined;

    if (dryRun) {
      const fakeId = categoryMap.size + 1;
      categoryMap.set(cat.slug, fakeId);
      console.log(`  [dry-run] Category: ${cat.slug} — "${cat.metadata.title}" (en lexical: ${enLexical ? "yes" : "no"}, nl lexical: ${nlLexical ? "yes" : "no"})`);
      continue;
    }

    const created = await payload!.create({
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

    if (nlContent.metadata) {
      await payload!.update({
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

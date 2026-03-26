/**
 * Seed script entry point for Payload CMS.
 *
 * Imports all content from the Markdown-based content package into Payload CMS
 * collections. Importers run in dependency order:
 *
 *   1. Categories  (no dependencies)
 *   2. Services    (depends on categories)
 *   3. Guides      (depends on categories + services)
 *   4. Landing pages (depends on categories + services)
 *   5. Pages       (no dependencies)
 *
 * Usage:
 *   pnpm --filter website seed           # Import all content
 *   pnpm --filter website seed --reset   # Clear all collections first, then import
 *
 * Run from the monorepo root:
 *   npx tsx apps/website/seed/index.ts [--reset]
 */

import { getPayload } from "payload";
import config from "@payload-config";
import { importCategories } from "./importCategories.js";
import { importServices } from "./importServices.js";
import { importGuides } from "./importGuides.js";
import { importLandingPages } from "./importLandingPages.js";
import { importPages } from "./importPages.js";

async function seed() {
  const payload = await getPayload({ config });
  const reset = process.argv.includes("--reset");

  if (reset) {
    console.log("Resetting database...");
    // Delete in reverse dependency order to avoid foreign-key issues
    // Use { id: { exists: true } } as a where clause to match all documents
    const deleteAll = { id: { exists: true } } as never;

    // Guides and landing pages depend on services and categories
    await payload.delete({ collection: "guides", where: deleteAll });
    await payload.delete({ collection: "landing-pages", where: deleteAll });
    await payload.delete({ collection: "pages", where: deleteAll });
    await payload.delete({ collection: "services", where: deleteAll });
    await payload.delete({ collection: "categories", where: deleteAll });
    await payload.delete({ collection: "media", where: deleteAll });

    console.log("Database cleared.");
  }

  // --- Import in dependency order ---

  console.log("\n--- Importing categories ---");
  const categoryMap = await importCategories(payload);

  console.log("\n--- Importing services ---");
  const serviceMap = await importServices(payload, categoryMap);

  console.log("\n--- Importing guides ---");
  await importGuides(payload, categoryMap, serviceMap);

  console.log("\n--- Importing landing pages ---");
  await importLandingPages(payload, categoryMap, serviceMap);

  console.log("\n--- Importing pages ---");
  await importPages(payload);

  console.log("\nSeed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

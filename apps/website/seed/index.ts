/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
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
 *   pnpm --filter website seed              # Import all content
 *   pnpm --filter website seed --reset      # Clear all collections first, then import
 *   pnpm --filter website seed --dry-run    # Test content reading without DB writes
 */

import { importCategories } from "./importCategories.js";
import { importServices } from "./importServices.js";
import { importGuides } from "./importGuides.js";
import { importLandingPages } from "./importLandingPages.js";
import { importPages } from "./importPages.js";
import { clearMediaCache } from "./importMedia.js";

const dryRun = process.argv.includes("--dry-run");

async function seed() {
  let payload: any = null;

  if (!dryRun) {
    const { getPayload } = await import("payload");
    const { default: config } = await import("@payload-config");
    payload = await getPayload({ config });

    const reset = process.argv.includes("--reset");
    if (reset) {
      console.log("Resetting database...");
      const deleteAll = { id: { exists: true } } as never;
      await payload.delete({ collection: "guides", where: deleteAll });
      await payload.delete({ collection: "landing-pages", where: deleteAll });
      await payload.delete({ collection: "pages", where: deleteAll });
      await payload.delete({ collection: "services", where: deleteAll });
      await payload.delete({ collection: "categories", where: deleteAll });
      await payload.delete({ collection: "media", where: deleteAll });
      clearMediaCache();
      console.log("Database cleared.");
    }
  } else {
    console.log("🏃 DRY RUN — reading content only, no database writes\n");
  }

  console.log("\n--- Importing categories ---");
  const categoryMap = await importCategories(payload, dryRun);

  console.log("\n--- Importing services ---");
  const serviceMap = await importServices(payload, categoryMap, dryRun);

  console.log("\n--- Importing guides ---");
  await importGuides(payload, categoryMap, serviceMap, dryRun);

  console.log("\n--- Importing landing pages ---");
  await importLandingPages(payload, categoryMap, serviceMap, dryRun);

  console.log("\n--- Importing pages ---");
  await importPages(payload, dryRun);

  console.log("\nSeed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

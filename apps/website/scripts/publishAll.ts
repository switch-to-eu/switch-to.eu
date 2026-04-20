/**
 * Publish every draft doc across all versioned collections.
 *
 * Usage:
 *   pnpm --filter website publish-all
 */

import { getPayload } from "payload";
import config from "@payload-config";

const COLLECTIONS = ["services", "guides", "pages", "landing-pages"] as const;
const LOCALES = ["en", "nl"] as const;

async function main() {
  const payload = await getPayload({ config });
  const locales = LOCALES;

  for (const collection of COLLECTIONS) {
    let published = 0;
    let skipped = 0;
    let failed = 0;

    // Phase 1: collect all unpublished ids without mutating. Paginating
    // while also updating _status would shift the filtered set forward
    // and skip 100 docs per published page.
    const ids: (string | number)[] = [];
    let page = 1;
    while (true) {
      const { docs, hasNextPage } = await payload.find({
        collection,
        depth: 0,
        limit: 100,
        page,
        locale: "en",
        draft: true,
        where: { _status: { not_equals: "published" } },
      });

      if (docs.length === 0) break;
      for (const doc of docs) {
        ids.push((doc as { id: string | number }).id);
      }
      if (!hasNextPage) break;
      page++;
    }

    // Phase 2: publish each collected id across all locales.
    for (const id of ids) {
      try {
        for (const locale of locales) {
          await payload.update({
            collection,
            id,
            locale,
            draft: false,
            data: { _status: "published" } as never,
          });
        }
        published++;
      } catch (err) {
        failed++;
        console.error(`  ✗ ${collection}#${id}:`, (err as Error).message);
      }
    }

    // Count docs that were already published (for reporting)
    const already = await payload.count({
      collection,
      where: { _status: { equals: "published" } },
    });
    skipped = already.totalDocs - published;

    console.log(
      `${collection}: published ${published}, already-published ${Math.max(0, skipped)}, failed ${failed}`,
    );
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

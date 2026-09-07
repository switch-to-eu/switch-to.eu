/**
 * Import (or update) one service listing from a JSON submission file.
 *
 * A submission holds non-localized fields at the top level, localized fields
 * under `locales.<code>`, and names its category by slug rather than by id so
 * the file stays portable between databases. Everything lands as a draft:
 * nothing reaches the site until an editor publishes it in /admin.
 *
 * Usage:
 *   pnpm --filter website import-service scripts/data/proxima-chat.json
 */

import { readFileSync } from "node:fs";

import { getPayload } from "payload";
import config from "@payload-config";

const LOCALES = ["en", "nl"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";

interface Submission {
  slug?: string;
  category?: string;
  locales?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    fail("Usage: pnpm --filter website import-service <submission.json>");
  }

  const submission = JSON.parse(readFileSync(file, "utf8")) as Submission;
  const {
    slug,
    category: categorySlug,
    locales = {},
    _comment,
    ...shared
  } = submission;
  void _comment;

  if (!slug) fail(`${file}: missing "slug".`);
  if (!categorySlug) fail(`${file}: missing "category" (a category slug).`);

  for (const locale of Object.keys(locales)) {
    if (!isLocale(locale)) {
      fail(`${file}: unknown locale "${locale}". Known: ${LOCALES.join(", ")}.`);
    }
  }

  const payload = await getPayload({ config });

  const { docs: categories } = await payload.find({
    collection: "categories",
    where: { slug: { equals: categorySlug } },
    limit: 1,
    depth: 0,
  });
  const category = categories[0];
  if (!category) {
    fail(
      `Category "${categorySlug}" does not exist. Create it first, or point ` +
        `the submission at an existing category slug.`,
    );
  }

  const { docs: existing } = await payload.find({
    collection: "services",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
  });

  // The submission is untyped JSON, so the generated collection types cannot
  // narrow it — same cast publishAll.ts uses for its status writes.
  const defaultData = {
    ...shared,
    slug,
    category: category.id,
    ...(locales[DEFAULT_LOCALE] ?? {}),
    _status: "draft",
  } as never;

  let id = existing[0]?.id;
  if (id === undefined) {
    const created = await payload.create({
      collection: "services",
      locale: DEFAULT_LOCALE,
      draft: true,
      data: defaultData,
    });
    id = created.id;
    console.log(`Created services#${id} (${slug}) as a draft.`);
  } else {
    await payload.update({
      collection: "services",
      id,
      locale: DEFAULT_LOCALE,
      draft: true,
      data: defaultData,
    });
    console.log(`Updated services#${id} (${slug}), still a draft.`);
  }

  for (const [locale, fields] of Object.entries(locales)) {
    if (locale === DEFAULT_LOCALE || !isLocale(locale)) continue;
    await payload.update({
      collection: "services",
      id,
      locale,
      draft: true,
      data: fields as never,
    });
    console.log(`  wrote ${locale} fields`);
  }

  console.log(`Review it in /admin, then publish. Category: ${categorySlug}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

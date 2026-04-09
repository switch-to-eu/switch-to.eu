/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
/**
 * Test script for the markdownToLexical converter.
 *
 * Run with:
 *   npx tsx apps/website/seed/testMarkdownToLexical.ts
 *
 * from the monorepo root.
 */

import { markdownToLexical } from "./markdownToLexical.js";

// ---------------------------------------------------------------------------
// Test 1: Full feature coverage
// ---------------------------------------------------------------------------

const sampleMarkdown = `# Main Heading

This is a paragraph with **bold text**, *italic text*, and ~~strikethrough~~.

## Features

- End-to-end encryption
- **Zero-access** encryption
- Web, Android, and iOS apps

### Pricing

1. Free tier: 1 GB storage
2. Plus plan: €3.99/month
3. Unlimited: $9.99/month

> Proton Mail is a Swiss encrypted email service and the largest of its kind.

Here is a [link to Proton](https://proton.me) in a paragraph.

---

## Another Section

This paragraph has \`inline code\` and more **bold** text. Visit [Switch-to.eu](/en/categories/email) for alternatives.
`;

// ---------------------------------------------------------------------------
// Test 2: Real content with section markers (should be treated as paragraphs)
// ---------------------------------------------------------------------------

const realContentMarkdown = `Proton Mail is a Swiss encrypted email service and the largest of its kind. Where Gmail scans your inbox to serve ads, Proton Mail has no advertising model.

## Is Proton Mail free?

The free tier includes 1 GB of storage, one email address, and up to 150 messages per day.

## What Proton Mail includes

- End-to-end encryption for email between Proton users.
- Zero-access encryption means Proton cannot read your stored emails.
- Available on web, Android (Google Play and F-Droid), and iOS.

## Worth knowing

- **Search is limited.** Search covers subject lines and metadata only, not email body text.
- **End-to-end encryption only works between Proton users.** Most of your email likely goes to and from non-Proton addresses.

If you want encrypted storage alongside your encrypted email, [Proton Drive](/en/services/eu/proton-drive) is included in Proton Unlimited.
`;

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

type NodeRecord = Record<string, unknown>;

function getChildTypes(result: { root: { children: NodeRecord[] } }): string[] {
  return result.root.children.map((c) => c.type as string);
}

function findNodesByType(
  result: { root: { children: NodeRecord[] } },
  type: string,
): NodeRecord[] {
  return result.root.children.filter((c) => c.type === type);
}

function findLinks(result: { root: { children: NodeRecord[] } }): NodeRecord[] {
  const links: NodeRecord[] = [];
  for (const child of result.root.children) {
    if (child.type === "paragraph" && Array.isArray(child.children)) {
      for (const inner of child.children as NodeRecord[]) {
        if (inner.type === "link") {
          links.push(inner);
        }
      }
    }
  }
  return links;
}

async function main() {
  const errors: string[] = [];

  // --- Test 1: Full feature coverage ---
  console.log("Test 1: Full feature coverage");
  const result1 = await markdownToLexical(sampleMarkdown);

  if (result1.root.type !== "root") {
    errors.push(`[T1] Expected root type "root", got "${result1.root.type}"`);
  }

  const types1 = new Set(getChildTypes(result1));
  for (const expected of ["heading", "paragraph", "list", "quote", "horizontalrule"]) {
    if (!types1.has(expected)) {
      errors.push(`[T1] Missing node type: ${expected}`);
    }
  }

  // Check headings have correct tags
  const headings = findNodesByType(result1, "heading");
  const headingTags = headings.map((h) => h.tag);
  if (!headingTags.includes("h1")) errors.push("[T1] Missing h1 heading");
  if (!headingTags.includes("h2")) errors.push("[T1] Missing h2 heading");
  if (!headingTags.includes("h3")) errors.push("[T1] Missing h3 heading");

  // Check lists
  const lists = findNodesByType(result1, "list");
  const listTypes = lists.map((l) => l.listType);
  if (!listTypes.includes("bullet")) errors.push("[T1] Missing bullet list");
  if (!listTypes.includes("number")) errors.push("[T1] Missing number list");

  // Check links
  const links1 = findLinks(result1);
  if (links1.length < 2) {
    errors.push(`[T1] Expected at least 2 links, found ${links1.length}`);
  } else {
    const linkFields = links1[0].fields as { url?: string; linkType?: string };
    if (linkFields.linkType !== "custom") {
      errors.push(`[T1] Link linkType should be "custom", got "${linkFields.linkType}"`);
    }
    if (linkFields.url !== "https://proton.me") {
      errors.push(`[T1] First link URL should be "https://proton.me", got "${linkFields.url}"`);
    }
  }

  // Check text formatting (bold = 1, italic = 2, strikethrough = 4, code = 16)
  const paragraphs = findNodesByType(result1, "paragraph");
  const formattedParagraph = paragraphs[0];
  if (formattedParagraph && Array.isArray(formattedParagraph.children)) {
    const formats = (formattedParagraph.children as NodeRecord[]).map(
      (c) => c.format as number,
    );
    if (!formats.includes(1)) errors.push("[T1] Missing bold formatting (format=1)");
    if (!formats.includes(2)) errors.push("[T1] Missing italic formatting (format=2)");
    if (!formats.includes(4)) errors.push("[T1] Missing strikethrough formatting (format=4)");
  }

  console.log(
    `  ${result1.root.children.length} nodes, types: ${[...types1].join(", ")}`,
  );
  console.log(`  ${links1.length} links found`);
  console.log(`  ${headings.length} headings (${headingTags.join(", ")})`);

  // --- Test 2: Real content ---
  console.log("\nTest 2: Real service content");
  const result2 = await markdownToLexical(realContentMarkdown);

  const types2 = new Set(getChildTypes(result2));
  if (!types2.has("heading")) errors.push("[T2] Missing heading");
  if (!types2.has("paragraph")) errors.push("[T2] Missing paragraph");
  if (!types2.has("list")) errors.push("[T2] Missing list");

  const links2 = findLinks(result2);
  if (links2.length === 0) {
    errors.push("[T2] No links found in real content");
  }

  console.log(
    `  ${result2.root.children.length} nodes, types: ${[...types2].join(", ")}`,
  );
  console.log(`  ${links2.length} links found`);

  // --- Test 3: Empty string ---
  console.log("\nTest 3: Empty string");
  const result3 = await markdownToLexical("");
  if (result3.root.type !== "root") {
    errors.push("[T3] Empty string should produce valid root");
  }
  console.log(`  ${result3.root.children.length} nodes`);

  // --- Results ---
  if (errors.length > 0) {
    console.error("\nFAILED:");
    for (const err of errors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("\nAll tests PASSED.");
}

main().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});

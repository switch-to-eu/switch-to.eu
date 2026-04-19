import { z } from "zod";
import type { PayloadRequest } from "payload";

/**
 * Custom MCP tool: wipe-content
 *
 * Clears all text/richText/array content fields from services or guides,
 * while preserving media uploads (logo, screenshot, videos), slugs,
 * relationships (category, sourceService, targetService), and structural
 * fields (region, difficulty, etc.).
 *
 * Resets contentPipelineStatus to "not-started" so the content pipeline
 * can be re-run from scratch.
 */

const SERVICES_TEXT_FIELDS = {
  // Localized fields — need to be cleared per locale
  // description is required, use placeholder
  description: "-",
  content: null,
  features: [],
  issues: [],
  startingPrice: "",
  // Non-localized fields
  pricingTiers: [],
  tags: [],
  // Research tab
  researchStatus: "not-started",
  lastResearchedAt: null,
  gdprCompliance: "unknown",
  gdprNotes: "",
  privacyPolicyUrl: "",
  pricingDetails: "",
  pricingUrl: "",
  headquarters: "",
  parentCompany: "",
  foundedYear: null,
  employeeCount: "",
  dataStorageLocations: [],
  certifications: [],
  openSource: false,
  sourceCodeUrl: "",
  researchNotes: null,
  sourceUrls: [],
  // SEO tab
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  ogTitle: "",
  ogDescription: "",
  seoScore: null,
  seoNotes: "",
  lastSeoReviewAt: null,
  // Pipeline status
  contentPipelineStatus: "not-started",
} as const;

const GUIDES_TEXT_FIELDS = {
  // Localized fields
  // description is required, use placeholder
  description: "-",
  intro: null,
  beforeYouStart: null,
  steps: [],
  troubleshooting: null,
  outro: null,
  missingFeatures: [],
  // SEO tab
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  ogTitle: "",
  ogDescription: "",
  seoScore: null,
  seoNotes: "",
  lastSeoReviewAt: null,
  // Pipeline status
  contentPipelineStatus: "not-started",
} as const;

const LOCALES = ["en", "nl"] as const;

export const wipeContentTool = {
  name: "wipe_content",
  description:
    "Wipe all text content from services or guides while preserving media (logo, screenshot, videos), slugs, relationships, and structural fields. Use before re-running research/write pipeline to test from a clean slate. Resets contentPipelineStatus to not-started.",
  parameters: {
    collection: z
      .enum(["services", "guides"])
      .describe("Which collection to wipe content from"),
    slug: z
      .string()
      .optional()
      .describe(
        "Optional: wipe a specific item by slug. If omitted, wipes ALL items in the collection.",
      ),
  },
  handler: async (
    args: Record<string, unknown>,
    req: PayloadRequest,
  ) => {
    const collection = args.collection as "services" | "guides";
    const slug = args.slug as string | undefined;
    const payload = req.payload;

    const items = await payload.find({
      collection,
      ...(slug ? { where: { slug: { equals: slug } } } : {}),
      limit: 500,
      depth: 0,
    });

    if (items.docs.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: slug
              ? `No ${collection} found with slug "${slug}".`
              : `No ${collection} found.`,
          },
        ],
      };
    }

    const fields =
      collection === "services" ? SERVICES_TEXT_FIELDS : GUIDES_TEXT_FIELDS;
    const wiped: string[] = [];

    for (const doc of items.docs) {
      // Wipe each locale
      for (const locale of LOCALES) {
        await payload.update({
          collection,
          id: doc.id,
          locale,
          data: { ...fields, _status: "published" } as never,
        });
      }
      wiped.push(`${(doc as unknown as { slug?: string; id: number }).slug ?? doc.id}`);
    }

    const summary = `Wiped content from ${wiped.length} ${collection}: ${wiped.join(", ")}`;
    return {
      content: [{ type: "text" as const, text: summary }],
    };
  },
};

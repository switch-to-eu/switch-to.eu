import type { Field } from "payload";

/**
 * Reusable SEO metadata fields for content collections.
 * All user-facing text fields are localized. Audit metadata is not.
 * Use inside a Payload tab or spread into a collection's fields array.
 */
export const seoFields: Field[] = [
  {
    name: "metaTitle",
    type: "text",
    localized: true,
    admin: {
      description: "Custom page title for search engines (50-60 chars)",
    },
  },
  {
    name: "metaDescription",
    type: "textarea",
    localized: true,
    admin: {
      description: "Custom meta description for search engines (150-160 chars)",
    },
  },
  {
    name: "keywords",
    type: "array",
    localized: true,
    fields: [
      {
        name: "keyword",
        type: "text",
        required: true,
      },
    ],
    admin: {
      description: "Target SEO keywords (localized — different keywords per market)",
    },
  },
  {
    name: "ogTitle",
    type: "text",
    localized: true,
    admin: {
      description: "Open Graph title for social sharing",
    },
  },
  {
    name: "ogDescription",
    type: "textarea",
    localized: true,
    admin: {
      description: "Open Graph description for social sharing",
    },
  },
  {
    name: "ogImage",
    type: "upload",
    relationTo: "media",
    admin: {
      description: "Open Graph image for social sharing",
    },
  },
  {
    name: "seoScore",
    type: "number",
    min: 0,
    max: 100,
    admin: {
      description: "AI-assessed SEO quality score (0-100)",
    },
  },
  {
    name: "seoNotes",
    type: "textarea",
    admin: {
      description: "Notes from last SEO review",
    },
  },
  {
    name: "lastSeoReviewAt",
    type: "date",
    admin: {
      description: "When SEO was last reviewed",
    },
  },
];

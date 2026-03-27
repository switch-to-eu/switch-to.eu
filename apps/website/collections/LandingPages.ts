import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";

export const LandingPages: CollectionConfig = {
  slug: "landing-pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "category"],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag("landing-pages", "default");
        } catch {
          /* no-op outside Next.js */
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              localized: true,
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              localized: true,
            },
            {
              name: "category",
              type: "relationship",
              relationTo: "categories",
            },
            {
              name: "recommendedServices",
              type: "relationship",
              relationTo: "services",
              hasMany: true,
              admin: {
                description: "EU services to recommend on this page",
              },
            },
            {
              name: "relatedService",
              type: "relationship",
              relationTo: "services",
              admin: {
                description:
                  "The non-EU service this landing page targets",
              },
            },
            {
              name: "content",
              type: "richText",
              localized: true,
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "metaTitle",
              type: "text",
              localized: true,
              admin: {
                description:
                  "Custom page title for search engines (50-60 chars)",
              },
            },
            {
              name: "metaDescription",
              type: "textarea",
              localized: true,
              admin: {
                description:
                  "Custom meta description for search engines (150-160 chars)",
              },
            },
            {
              name: "keywords",
              type: "array",
              fields: [
                { name: "keyword", type: "text", required: true },
              ],
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
              type: "text",
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
          ],
        },
      ],
    },
  ],
};

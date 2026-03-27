import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { researchFields } from "../fields/research";
import { seoFields } from "../fields/seo";

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "region", "category", "featured"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag("services");
        } catch {
          /* no-op outside Next.js */
        }
        return doc;
      },
    ],
  },
  fields: [
    // Sidebar fields — visible on all tabs
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "region",
      type: "select",
      required: true,
      options: [
        { label: "EU", value: "eu" },
        { label: "Non-EU", value: "non-eu" },
        { label: "EU-Friendly", value: "eu-friendly" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    // Main content area — tabs
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            {
              name: "name",
              type: "text",
              required: true,
              localized: true,
            },
            {
              name: "category",
              type: "relationship",
              relationTo: "categories",
              required: true,
            },
            {
              name: "location",
              type: "text",
              required: true,
              admin: {
                description: "Country where the service is based",
              },
            },
            {
              name: "freeOption",
              type: "checkbox",
              defaultValue: false,
            },
            {
              name: "startingPrice",
              type: "text",
              localized: true,
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              localized: true,
              admin: {
                description:
                  "Short description shown in cards and search results",
              },
            },
            {
              name: "url",
              type: "text",
              required: true,
              admin: { description: "Service website URL" },
            },
            {
              name: "screenshot",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "features",
              type: "array",
              localized: true,
              fields: [
                { name: "feature", type: "text", required: true },
              ],
            },
            {
              name: "tags",
              type: "array",
              fields: [{ name: "tag", type: "text", required: true }],
            },
          ],
        },
        {
          label: "Content",
          fields: [
            {
              name: "content",
              type: "richText",
              localized: true,
              admin: {
                description: "Main service body content",
              },
            },
            // Non-EU only fields
            {
              name: "issues",
              type: "array",
              localized: true,
              admin: {
                description:
                  "Privacy/data concerns (non-EU services only)",
                condition: (data) => data?.region === "non-eu",
              },
              fields: [
                { name: "issue", type: "text", required: true },
              ],
            },
            {
              name: "recommendedAlternative",
              type: "relationship",
              relationTo: "services",
              admin: {
                description:
                  "Recommended EU alternative (non-EU services only)",
                condition: (data) => data?.region === "non-eu",
              },
            },
          ],
        },
        {
          label: "Research",
          description:
            "Structured intelligence about this service. Populated by AI research skills via MCP.",
          fields: researchFields,
        },
        {
          label: "SEO",
          description:
            "Search engine optimization metadata. Reviewed by AI SEO skills via MCP.",
          fields: seoFields,
        },
      ],
    },
  ],
};

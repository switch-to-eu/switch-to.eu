import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";

export const Guides: CollectionConfig = {
  slug: "guides",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "difficulty", "category"],
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
          revalidateTag("guides", "default");
        } catch {
          /* no-op outside Next.js */
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return doc;
      },
    ],
  },
  fields: [
    // Sidebar fields
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "difficulty",
      type: "select",
      required: true,
      options: [
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "timeRequired",
      type: "text",
      required: true,
      admin: {
        description: 'e.g. "45 minutes"',
        position: "sidebar",
      },
    },
    {
      name: "date",
      type: "date",
      admin: { position: "sidebar" },
    },
    // Tabs
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
              name: "category",
              type: "relationship",
              relationTo: "categories",
              required: true,
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              localized: true,
            },
            {
              name: "sourceService",
              type: "relationship",
              relationTo: "services",
              required: true,
              admin: {
                description: "The non-EU service being migrated from",
              },
            },
            {
              name: "targetService",
              type: "relationship",
              relationTo: "services",
              required: true,
              admin: {
                description: "The EU service being migrated to",
              },
            },
            {
              name: "author",
              type: "text",
            },
            {
              name: "missingFeatures",
              type: "array",
              localized: true,
              admin: {
                description:
                  "Features missing in the target service compared to the source",
              },
              fields: [
                { name: "feature", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "Guide Content",
          fields: [
            {
              name: "intro",
              type: "richText",
              localized: true,
              admin: {
                description: "Introduction section — why switch?",
              },
            },
            {
              name: "beforeYouStart",
              type: "richText",
              localized: true,
              admin: {
                description:
                  "Prerequisites and what you need before starting",
              },
            },
            {
              name: "steps",
              type: "array",
              localized: true,
              admin: { description: "Ordered migration steps" },
              fields: [
                {
                  name: "title",
                  type: "text",
                  required: true,
                  localized: true,
                },
                {
                  name: "content",
                  type: "richText",
                  required: true,
                  localized: true,
                },
                {
                  name: "video",
                  type: "text",
                  admin: {
                    description: "Optional video URL for this step",
                  },
                },
                {
                  name: "videoOrientation",
                  type: "select",
                  options: [
                    { label: "Landscape", value: "landscape" },
                    { label: "Portrait", value: "portrait" },
                  ],
                  defaultValue: "landscape",
                },
                {
                  name: "complete",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    description:
                      "Whether this step is fully written (progress tracking)",
                  },
                },
              ],
            },
            {
              name: "troubleshooting",
              type: "richText",
              localized: true,
              admin: {
                description: "Common issues and their solutions",
              },
            },
            {
              name: "outro",
              type: "richText",
              localized: true,
              admin: {
                description: "Conclusion and next steps",
              },
            },
          ],
        },
        {
          label: "SEO",
          fields: seoFields,
        },
      ],
    },
  ],
};

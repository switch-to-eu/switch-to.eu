import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "icon"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag("categories", "default");
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
              name: "icon",
              type: "text",
              required: true,
              admin: {
                description:
                  "Lucide icon name (e.g. mail, folder, search)",
              },
            },
            {
              name: "content",
              type: "richText",
              localized: true,
              admin: {
                description:
                  "Category body text shown on the category page",
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

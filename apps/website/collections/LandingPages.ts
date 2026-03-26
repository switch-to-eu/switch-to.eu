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
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateTag("landing-pages", "default");
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      localized: true,
    },
    {
      name: "keywords",
      type: "array",
      fields: [
        {
          name: "keyword",
          type: "text",
          required: true,
        },
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
        description: "The non-EU service this landing page targets",
      },
    },
    {
      name: "content",
      type: "richText",
      localized: true,
    },
  ],
};

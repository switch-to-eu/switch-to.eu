import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "icon"],
  },
  access: {
    read: () => true,
  },
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
        description: "Lucide icon name (e.g. mail, folder, search)",
      },
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
      name: "content",
      type: "richText",
      localized: true,
      admin: {
        description: "Category body text shown on the category page",
      },
    },
  ],
};

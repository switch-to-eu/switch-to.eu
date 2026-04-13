import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    imageSizes: [
      {
        name: "card",
        width: 480,
        height: 320,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 80 } },
      },
      {
        name: "hero",
        width: 960,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 80 } },
      },
    ],
    formatOptions: { format: "webp", options: { quality: 80 } },
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
    },
  ],
};

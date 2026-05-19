import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Media files are served directly from Vercel Blob (disablePayloadAccessControl).
    // Locking REST `read` only blocks crawlers from listing the /api/media JSON;
    // it doesn't affect the actual image URLs the frontend renders.
    read: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
    },
  ],
};

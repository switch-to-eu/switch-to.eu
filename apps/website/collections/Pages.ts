import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";
import {
  buildPreviewUrl,
  pingIndexNowIfPublished,
} from "../lib/collection-hooks";
import { submitToIndexNow, localizedUrls } from "../lib/indexnow";

function pagePaths(doc: { slug?: string | null }): string[] {
  return doc.slug ? [`/${doc.slug}`] : [];
}

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug"],
    preview: (doc) => {
      const typed = doc as { slug?: string };
      const paths = pagePaths(typed);
      return buildPreviewUrl(paths[0] ? `/en${paths[0]}` : "/");
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        try {
          revalidateTag("pages", "default");
        } catch {
          /* no-op outside Next.js */
        }
        const typed = doc as {
          _status?: string | null;
          slug?: string | null;
        };
        await pingIndexNowIfPublished(typed._status, pagePaths(typed));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const typed = doc as { slug?: string | null };
        const urls = pagePaths(typed).flatMap((p) => localizedUrls(p));
        await submitToIndexNow(urls);
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
          label: "Content",
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

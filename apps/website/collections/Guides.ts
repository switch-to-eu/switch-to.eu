import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";
import {
  buildPreviewUrl,
  pingIndexNowIfPublished,
} from "../lib/collection-hooks";
import { submitToIndexNow, localizedUrls } from "../lib/indexnow";

function guidePaths(doc: {
  slug?: string | null;
  category?: unknown;
}): string[] {
  if (!doc.slug) return [];
  const categorySlug =
    typeof doc.category === "object" && doc.category !== null
      ? (doc.category as { slug?: string }).slug
      : undefined;
  return [`/guides/${categorySlug ?? "uncategorized"}/${doc.slug}`];
}

export const Guides: CollectionConfig = {
  slug: "guides",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "difficulty", "category"],
    preview: (doc) => {
      const typed = doc as { slug?: string; category?: unknown };
      const paths = guidePaths(typed);
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
          revalidateTag("guides", "default");
        } catch {
          /* no-op outside Next.js */
        }
        const typed = doc as {
          _status?: string | null;
          slug?: string | null;
          category?: unknown;
        };
        await pingIndexNowIfPublished(typed._status, guidePaths(typed));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const typed = doc as { slug?: string | null; category?: unknown };
        const urls = guidePaths(typed).flatMap((p) => localizedUrls(p));
        await submitToIndexNow(urls);
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
    {
      name: "featuredOnHomepage",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Feature this guide as the homepage hero poster. Only one guide should be flagged at a time; the most recent published guide is used as a fallback.",
      },
    },
    {
      name: "contentPipelineStatus",
      type: "select",
      options: [
        { label: "Not Started", value: "not-started" },
        { label: "In Progress", value: "in-progress" },
        { label: "Written", value: "written" },
        { label: "Humanized", value: "humanized" },
        { label: "SEO Checked", value: "seo-checked" },
        { label: "Translated", value: "translated" },
        { label: "Complete", value: "complete" },
      ],
      defaultValue: "not-started",
      admin: {
        position: "sidebar",
        description: "Tracks progress through the content pipeline",
      },
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
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description: "Optional video for this step",
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

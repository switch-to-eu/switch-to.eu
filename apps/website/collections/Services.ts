import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { researchFields } from "../fields/research";
import { seoFields } from "../fields/seo";
import {
  buildPreviewUrl,
  pingIndexNowIfPublished,
} from "../lib/collection-hooks";
import { submitToIndexNow, localizedUrls } from "../lib/indexnow";

function servicePaths(doc: {
  slug?: string | null;
  region?: string | null;
  category?: unknown;
}): string[] {
  const paths: string[] = [];
  if (!doc.slug) return paths;
  if (doc.region === "non-eu") {
    paths.push(`/services/non-eu/${doc.slug}`);
  }
  const categorySlug =
    typeof doc.category === "object" && doc.category !== null
      ? (doc.category as { slug?: string }).slug
      : undefined;
  if (categorySlug) paths.push(`/services/${categorySlug}`);
  return paths;
}

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "region", "category", "featured"],
    preview: (doc) => {
      const typed = doc as {
        slug?: string;
        region?: string;
        category?: unknown;
      };
      const paths = servicePaths(typed);
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
          revalidateTag("services", "default");
        } catch {
          /* no-op outside Next.js */
        }
        const typed = doc as {
          _status?: string | null;
          slug?: string | null;
          region?: string | null;
          category?: unknown;
        };
        await pingIndexNowIfPublished(typed._status, servicePaths(typed));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const typed = doc as {
          slug?: string | null;
          region?: string | null;
          category?: unknown;
        };
        const urls = servicePaths(typed).flatMap((p) => localizedUrls(p));
        await submitToIndexNow(urls);
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
        description: "Tracks progress through the content pipeline (write → humanize → SEO → translate)",
      },
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
              name: "affiliateUrl",
              type: "text",
              admin: {
                description:
                  "Affiliate/referral link. When set, outbound buttons use this instead of the direct URL.",
              },
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
              name: "pricingTiers",
              type: "array",
              admin: {
                description: "Structured pricing plans for the pricing subpage",
              },
              fields: [
                { name: "name", type: "text", required: true },
                { name: "price", type: "text", required: true },
                { name: "billingNote", type: "text" },
                {
                  name: "features",
                  type: "array",
                  fields: [
                    { name: "feature", type: "text", required: true },
                  ],
                },
              ],
            },
            {
              name: "tags",
              type: "array",
              fields: [{ name: "tag", type: "text", required: true }],
            },
            {
              name: "angle",
              type: "text",
              localized: true,
              admin: {
                description:
                  "One short positioning line shown when this service appears as a non-recommended alternative on someone else's page (e.g. 'Most private', 'Closest to Chrome'). Optional.",
              },
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
            {
              name: "oneLineProblem",
              type: "textarea",
              localized: true,
              admin: {
                description:
                  "Punchy one-sentence lede shown under the page H1 (~100–140 chars). Non-EU services only.",
                condition: (data) => data?.region === "non-eu",
              },
            },
            {
              name: "whatYoudGain",
              type: "array",
              localized: true,
              admin: {
                description:
                  "2–3 wins gained by switching to the recommended alternative. Non-EU services only; renders when recommendedAlternative is set.",
                condition: (data) => data?.region === "non-eu",
              },
              fields: [
                { name: "point", type: "text", required: true },
              ],
            },
            {
              name: "whatYoudLose",
              type: "array",
              localized: true,
              admin: {
                description:
                  "2–3 honest trade-offs vs the recommended alternative. Non-EU services only.",
                condition: (data) => data?.region === "non-eu",
              },
              fields: [
                { name: "point", type: "text", required: true },
              ],
            },
            {
              name: "faqs",
              type: "array",
              localized: true,
              admin: {
                description:
                  "Page-level FAQs about considering the switch (distinct from migration-guide FAQs about executing it). Emitted as JSON-LD FAQPage.",
              },
              fields: [
                { name: "question", type: "text", required: true },
                { name: "answer", type: "richText", required: true },
              ],
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

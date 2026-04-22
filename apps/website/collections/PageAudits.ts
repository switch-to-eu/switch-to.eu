import type { CollectionConfig } from "payload";

export const PageAudits: CollectionConfig = {
  slug: "page-audits",
  admin: {
    useAsTitle: "summaryTitle",
    defaultColumns: ["pageType", "priority", "status", "auditedAt"],
    description:
      "Post-publish SEO audits. One row per audit run; multiple rows per page over time form history. Operational data — no drafts.",
  },
  access: {
    // Internal SEO operational data (GSC metrics, competitor analysis,
    // proposed rewrites). Not rendered on the public frontend — gate
    // reads to authenticated Payload users only.
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    // Sidebar — the page being audited. Discriminator + two single-target
    // relations rather than a polymorphic relation, because
    // @payloadcms/plugin-mcp can't convert polymorphic relations to MCP
    // tool schemas (the resulting JSON schema is undefined and the plugin
    // crashes with "undefined is not valid JSON").
    {
      name: "pageType",
      type: "select",
      required: true,
      options: [
        { label: "Service", value: "service" },
        { label: "Guide", value: "guide" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "service",
      type: "relationship",
      relationTo: "services",
      admin: {
        position: "sidebar",
        condition: (data) => data?.pageType === "service",
      },
    },
    {
      name: "guide",
      type: "relationship",
      relationTo: "guides",
      admin: {
        position: "sidebar",
        condition: (data) => data?.pageType === "guide",
      },
    },
    {
      name: "priority",
      type: "select",
      required: true,
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      defaultValue: "medium",
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        { label: "New", value: "new" },
        { label: "Reviewed", value: "reviewed" },
        { label: "Applied", value: "applied" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "new",
      admin: { position: "sidebar" },
    },
    {
      name: "auditedAt",
      type: "date",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "summaryTitle",
      type: "text",
      admin: {
        position: "sidebar",
        description: "Auto-filled from page slug + auditedAt — used as admin list title.",
      },
    },

    // Current metrics (GSC, last 90 days)
    {
      name: "currentMetrics",
      type: "group",
      fields: [
        { name: "impressions", type: "number" },
        { name: "clicks", type: "number" },
        { name: "ctr", type: "number", admin: { description: "Decimal 0–1" } },
        { name: "avgPosition", type: "number" },
        {
          name: "dateRange",
          type: "group",
          fields: [
            { name: "from", type: "date" },
            { name: "to", type: "date" },
          ],
        },
      ],
    },

    // GSC queries
    {
      name: "topQueries",
      type: "array",
      fields: [
        { name: "query", type: "text", required: true },
        { name: "impressions", type: "number" },
        { name: "clicks", type: "number" },
        { name: "position", type: "number" },
      ],
    },
    {
      name: "almostRankingQueries",
      type: "array",
      admin: { description: "Queries at positions 11–20 with meaningful impressions." },
      fields: [
        { name: "query", type: "text", required: true },
        { name: "impressions", type: "number" },
        { name: "position", type: "number" },
      ],
    },

    // Competitor SERP
    {
      name: "competitors",
      type: "array",
      fields: [
        { name: "rank", type: "number", required: true },
        { name: "url", type: "text", required: true },
        { name: "title", type: "text" },
        { name: "metaDescription", type: "textarea" },
      ],
    },
    {
      name: "competitorAnalysis",
      type: "richText",
    },

    // Proposed rewrites
    {
      name: "proposedChanges",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "metaDescription", type: "textarea" },
        { name: "h1", type: "text" },
        {
          name: "contentGaps",
          type: "array",
          fields: [
            { name: "gap", type: "text", required: true },
            { name: "rationale", type: "textarea" },
          ],
        },
      ],
    },

    // Optional Lighthouse
    {
      name: "lighthouse",
      type: "group",
      admin: {
        description: "Populated only when the skill runs with --lighthouse.",
      },
      fields: [
        { name: "performance", type: "number" },
        { name: "accessibility", type: "number" },
        { name: "bestPractices", type: "number" },
        { name: "seo", type: "number" },
        { name: "runAt", type: "date" },
      ],
    },

    // Narrative
    {
      name: "summary",
      type: "richText",
    },
  ],
};

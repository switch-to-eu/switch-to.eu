import type { CollectionConfig } from "payload";

export const ContentOpportunities: CollectionConfig = {
  slug: "content-opportunities",
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "type",
      "priority",
      "status",
      "title",
      "estimatedMonthlyImpressions",
      "discoveredAt",
    ],
    description:
      "Content backlog discovered by opportunity-finder. Type discriminator distinguishes demand-driven (GSC) vs supply-driven (Reddit/SERP) finds. Operational data — no drafts.",
  },
  access: {
    // Internal editorial backlog (GSC signals, Reddit snippets). Not rendered
    // on the public frontend — gate reads to authenticated Payload users only.
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    // Sidebar
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Missing Guide", value: "missing-guide" },
        { label: "Missing Service", value: "missing-service" },
        { label: "Almost Ranking", value: "almost-ranking" },
        { label: "New Category", value: "new-category" },
      ],
      admin: { position: "sidebar" },
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
        { label: "Queued", value: "queued" },
        { label: "Written", value: "written" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "new",
      admin: { position: "sidebar" },
    },
    {
      name: "discoveredAt",
      type: "date",
      required: true,
      admin: { position: "sidebar" },
    },

    // What & why
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "targetKeyword",
      type: "text",
      required: true,
      admin: { description: "Lowercase canonical query this opportunity targets." },
    },
    {
      name: "locale",
      type: "select",
      options: [
        { label: "English", value: "en" },
        { label: "Dutch", value: "nl" },
        { label: "Both", value: "both" },
      ],
      defaultValue: "en",
    },
    {
      name: "estimatedMonthlyImpressions",
      type: "number",
    },

    // Evidence
    {
      name: "reasoning",
      type: "richText",
      required: true,
    },
    {
      name: "competitorUrls",
      type: "array",
      fields: [
        { name: "url", type: "text", required: true },
        { name: "title", type: "text" },
        { name: "rank", type: "number" },
      ],
    },
    {
      name: "sourceQueries",
      type: "array",
      admin: { description: "GSC rows that triggered this opportunity (Mode A)." },
      fields: [
        { name: "query", type: "text", required: true },
        { name: "impressions", type: "number" },
        { name: "position", type: "number" },
      ],
    },
    {
      name: "redditSignals",
      type: "array",
      admin: {
        description: "Reddit posts that triggered this opportunity (Mode B).",
      },
      fields: [
        { name: "subreddit", type: "text", required: true },
        { name: "postUrl", type: "text", required: true },
        { name: "snippet", type: "textarea" },
        { name: "date", type: "date" },
      ],
    },

    // Output linkage — discriminator + single-target relations rather than
    // polymorphic. Same pattern as PageAudits.page: @payloadcms/plugin-mcp
    // can't convert polymorphic relations to MCP tool schemas (undefined
    // schema → JSON.parse crash).
    {
      name: "resultingType",
      type: "select",
      options: [
        { label: "Service", value: "service" },
        { label: "Guide", value: "guide" },
      ],
      admin: { description: "Set once an opportunity has been acted on." },
    },
    {
      name: "resultingService",
      type: "relationship",
      relationTo: "services",
      admin: {
        description: "The service created from this opportunity (when resultingType = service).",
        condition: (data) => data?.resultingType === "service",
      },
    },
    {
      name: "resultingGuide",
      type: "relationship",
      relationTo: "guides",
      admin: {
        description: "The guide created from this opportunity (when resultingType = guide).",
        condition: (data) => data?.resultingType === "guide",
      },
    },
  ],
};

import type { Field } from "payload";

/**
 * Research metadata fields for the Services collection.
 * These fields store structured intelligence about services
 * that AI skills can read, assess, and update via MCP.
 * None are localized — they're factual/internal data.
 */
export const researchFields: Field[] = [
  {
    name: "researchStatus",
    type: "select",
    options: [
      { label: "Not Started", value: "not-started" },
      { label: "In Progress", value: "in-progress" },
      { label: "Needs Update", value: "needs-update" },
      { label: "Complete", value: "complete" },
    ],
    defaultValue: "not-started",
    admin: {
      description: "Current status of research for this service",
    },
  },
  {
    name: "lastResearchedAt",
    type: "date",
    admin: {
      description: "When this service was last researched",
    },
  },
  // GDPR & Privacy
  {
    name: "gdprCompliance",
    type: "select",
    options: [
      { label: "Compliant", value: "compliant" },
      { label: "Partial", value: "partial" },
      { label: "Non-Compliant", value: "non-compliant" },
      { label: "Unknown", value: "unknown" },
    ],
    defaultValue: "unknown",
    admin: {
      description: "GDPR compliance status",
    },
  },
  {
    name: "gdprNotes",
    type: "textarea",
    localized: true,
    admin: {
      description:
        "Consumer-friendly summary of GDPR stance and data practices (localized, rewritten by /write skill)",
    },
  },
  {
    name: "privacyPolicyUrl",
    type: "text",
    admin: {
      description: "Link to the service's privacy policy",
    },
  },
  // Pricing
  {
    name: "pricingDetails",
    type: "textarea",
    admin: {
      description:
        "Detailed pricing breakdown (tiers, limits, enterprise pricing)",
    },
  },
  {
    name: "pricingUrl",
    type: "text",
    admin: {
      description: "Link to the service's pricing page",
    },
  },
  // Company info
  {
    name: "headquarters",
    type: "text",
    admin: {
      description:
        'More specific than the "location" field — include city (e.g. "Berlin, Germany")',
    },
  },
  {
    name: "parentCompany",
    type: "text",
    admin: {
      description: "Parent company or organization, if applicable",
    },
  },
  {
    name: "foundedYear",
    type: "number",
    admin: {
      description: "Year the service was founded",
    },
  },
  {
    name: "employeeCount",
    type: "text",
    admin: {
      description: 'Approximate employee count or range (e.g. "50-200")',
    },
  },
  // Infrastructure
  {
    name: "dataStorageLocations",
    type: "array",
    fields: [
      {
        name: "location",
        type: "text",
        required: true,
      },
    ],
    admin: {
      description: "Countries/regions where user data is stored",
    },
  },
  {
    name: "certifications",
    type: "array",
    fields: [
      {
        name: "certification",
        type: "text",
        required: true,
      },
    ],
    admin: {
      description: "Security certifications (ISO 27001, SOC 2, HIPAA, etc.)",
    },
  },
  {
    name: "openSource",
    type: "checkbox",
    defaultValue: false,
  },
  {
    name: "sourceCodeUrl",
    type: "text",
    admin: {
      description: "Link to source code repository (if open source)",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      condition: (data) => data?.openSource,
    },
  },
  // Research notes
  {
    name: "researchNotes",
    type: "richText",
    admin: {
      description:
        "General research notes, competitive analysis, AI-generated summaries",
    },
  },
  {
    name: "sourceUrls",
    type: "array",
    fields: [
      {
        name: "url",
        type: "text",
        required: true,
      },
      {
        name: "label",
        type: "text",
        admin: {
          description: 'Source description (e.g. "Official blog post")',
        },
      },
    ],
    admin: {
      description: "URLs used as sources for research",
    },
  },
];

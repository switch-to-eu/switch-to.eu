# Payload CMS MCP Integration & Data Model Extension

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the official Payload CMS MCP plugin so editors' Claude apps can perform full CRUD on content, and extend the data model with structured Research and SEO metadata fields that AI skills can read, assess, and update.

**Architecture:** Install `@payloadcms/plugin-mcp` to expose an MCP endpoint at `/api/mcp`. Extend the Services collection with a Research tab (GDPR, pricing, HQ, certifications, etc.) and add a reusable SEO field group across all content collections. Use Payload's unnamed tabs to organize the admin UI without changing the flat data structure.

**Tech Stack:** Payload CMS 3.80+, `@payloadcms/plugin-mcp`, PostgreSQL (existing), Next.js 16

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `apps/website/fields/seo.ts` | Reusable SEO field array (metaTitle, metaDescription, keywords, ogTitle, ogDescription, ogImage, seoScore, seoNotes, lastSeoReviewAt) |
| `apps/website/fields/research.ts` | Service research field array (GDPR, pricing, headquarters, certifications, data storage, research notes, sources) |

### Modified Files

| File | Change |
|------|--------|
| `apps/website/package.json` | Add `@payloadcms/plugin-mcp` dependency |
| `apps/website/payload.config.ts` | Add `mcpPlugin()` to plugins array |
| `apps/website/collections/Services.ts` | Restructure with tabs: General, Content, Research, SEO |
| `apps/website/collections/Categories.ts` | Add SEO tab |
| `apps/website/collections/Guides.ts` | Add SEO tab |
| `apps/website/collections/Pages.ts` | Add SEO tab |
| `apps/website/collections/LandingPages.ts` | Add missing SEO fields (metaTitle, metaDescription, ogImage, seoScore, seoNotes, lastSeoReviewAt) |

### Auto-Generated

| File | Trigger |
|------|---------|
| `apps/website/payload-types.ts` | `pnpm --filter website payload generate:types` |

---

## Task 1: Install @payloadcms/plugin-mcp

**Files:**
- Modify: `apps/website/package.json`

- [ ] **Step 1: Install the MCP plugin package**

```bash
cd apps/website && pnpm add @payloadcms/plugin-mcp
```

- [ ] **Step 2: Verify installation and check config API**

```bash
ls node_modules/@payloadcms/plugin-mcp/package.json
```

Expected: File exists, version compatible with Payload 3.80+.

- [ ] **Step 3: Verify the plugin's config API before Task 9**

The MCP plugin config syntax in Task 9 is based on documentation but unverified against the installed package. Check the actual types:

```bash
cat node_modules/@payloadcms/plugin-mcp/dist/types.d.ts 2>/dev/null || cat node_modules/@payloadcms/plugin-mcp/dist/index.d.ts 2>/dev/null | head -60
```

If the actual API differs from the config in Task 9, adapt Task 9 accordingly. This is the highest-risk item in the plan.

- [ ] **Step 4: Commit**

```bash
git add apps/website/package.json pnpm-lock.yaml
git commit -m "chore: install @payloadcms/plugin-mcp"
```

---

## Task 2: Create shared SEO field group

**Files:**
- Create: `apps/website/fields/seo.ts`

- [ ] **Step 1: Create the fields directory**

```bash
mkdir -p apps/website/fields
```

- [ ] **Step 2: Create `apps/website/fields/seo.ts`**

```typescript
import type { Field } from "payload";

/**
 * Reusable SEO metadata fields for content collections.
 * All user-facing text fields are localized. Audit metadata is not.
 * Use inside a Payload tab or spread into a collection's fields array.
 */
export const seoFields: Field[] = [
  {
    name: "metaTitle",
    type: "text",
    localized: true,
    admin: {
      description: "Custom page title for search engines (50-60 chars)",
    },
  },
  {
    name: "metaDescription",
    type: "textarea",
    localized: true,
    admin: {
      description: "Custom meta description for search engines (150-160 chars)",
    },
  },
  {
    name: "keywords",
    type: "array",
    localized: true,
    fields: [
      {
        name: "keyword",
        type: "text",
        required: true,
      },
    ],
    admin: {
      description: "Target SEO keywords (localized — different keywords per market)",
    },
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
    type: "textarea",
    localized: true,
    admin: {
      description: "Open Graph description for social sharing",
    },
  },
  {
    name: "ogImage",
    type: "upload",
    relationTo: "media",
    admin: {
      description: "Open Graph image for social sharing",
    },
  },
  {
    name: "seoScore",
    type: "number",
    min: 0,
    max: 100,
    admin: {
      description: "AI-assessed SEO quality score (0-100)",
    },
  },
  {
    name: "seoNotes",
    type: "textarea",
    admin: {
      description: "Notes from last SEO review",
    },
  },
  {
    name: "lastSeoReviewAt",
    type: "date",
    admin: {
      description: "When SEO was last reviewed",
    },
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/fields/seo.ts
git commit -m "feat: add reusable SEO field group for Payload collections"
```

---

## Task 3: Create research fields for Services

**Files:**
- Create: `apps/website/fields/research.ts`

Research fields are factual/internal data - NOT localized. They're used by AI skills to store and retrieve service intelligence.

- [ ] **Step 1: Create `apps/website/fields/research.ts`**

```typescript
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
    admin: {
      description:
        "Details about GDPR stance, DPA availability, data processing practices",
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/fields/research.ts
git commit -m "feat: add research metadata fields for Services collection"
```

---

## Task 4: Restructure Services collection with tabs

**Files:**
- Modify: `apps/website/collections/Services.ts`

Reorganize the Services admin UI into four tabs (General, Content, Research, SEO) using Payload's unnamed tabs. Sidebar fields (`slug`, `region`, `featured`) stay at the top level, outside tabs.

**Important:** Unnamed tabs keep fields at the root of the document (no nesting), so the API and existing queries are unaffected.

- [ ] **Step 1: Rewrite `apps/website/collections/Services.ts`**

```typescript
import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { researchFields } from "../fields/research";
import { seoFields } from "../fields/seo";

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "region", "category", "featured"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag("services");
        } catch {
          /* no-op outside Next.js */
        }
        return doc;
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
              name: "tags",
              type: "array",
              fields: [{ name: "tag", type: "text", required: true }],
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
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd apps/website && npx tsc --noEmit collections/Services.ts 2>&1 | head -20
```

If there are import resolution issues, that's OK — full build verification comes later. The important thing is no syntax errors.

- [ ] **Step 3: Commit**

```bash
git add apps/website/collections/Services.ts
git commit -m "feat: restructure Services with tabs — add Research and SEO sections"
```

---

## Task 5: Add SEO tab to Categories

**Files:**
- Modify: `apps/website/collections/Categories.ts`

- [ ] **Step 1: Add SEO tab to Categories**

Replace the flat field list with a tabs layout. Keep `slug` in sidebar.

```typescript
import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "icon"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag("categories");
        } catch {
          /* no-op outside Next.js */
        }
        return doc;
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
          label: "General",
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
                description:
                  "Lucide icon name (e.g. mail, folder, search)",
              },
            },
            {
              name: "content",
              type: "richText",
              localized: true,
              admin: {
                description:
                  "Category body text shown on the category page",
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/collections/Categories.ts
git commit -m "feat: add SEO tab to Categories collection"
```

---

## Task 6: Add SEO tab to Guides

**Files:**
- Modify: `apps/website/collections/Guides.ts`

- [ ] **Step 1: Add SEO tab to Guides**

Keep `slug`, `difficulty`, `timeRequired`, `date` in sidebar. Organize guide content into General and Steps tabs, plus SEO.

```typescript
import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";

export const Guides: CollectionConfig = {
  slug: "guides",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "difficulty", "category"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag("guides");
        } catch {
          /* no-op outside Next.js */
        }
        return doc;
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
                  type: "text",
                  admin: {
                    description: "Optional video URL for this step",
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/collections/Guides.ts
git commit -m "feat: add SEO tab to Guides collection"
```

---

## Task 7: Add SEO tab to Pages

**Files:**
- Modify: `apps/website/collections/Pages.ts`

- [ ] **Step 1: Add SEO tab to Pages**

```typescript
import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag("pages");
        } catch {
          /* no-op outside Next.js */
        }
        return doc;
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/collections/Pages.ts
git commit -m "feat: add SEO tab to Pages collection"
```

---

## Task 8: Add missing SEO fields to LandingPages

**Files:**
- Modify: `apps/website/collections/LandingPages.ts`

LandingPages already has `keywords`, `ogTitle`, `ogDescription`. We add the missing SEO fields (`metaTitle`, `metaDescription`, `ogImage`, `seoScore`, `seoNotes`, `lastSeoReviewAt`) without duplicating existing ones. We also restructure into tabs for consistency.

- [ ] **Step 1: Rewrite LandingPages with tabs**

```typescript
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
        try {
          revalidateTag("landing-pages");
        } catch {
          /* no-op outside Next.js */
        }
        return doc;
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
          label: "General",
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
                description:
                  "The non-EU service this landing page targets",
              },
            },
            {
              name: "content",
              type: "richText",
              localized: true,
            },
          ],
        },
        {
          label: "SEO",
          description:
            "LandingPages have inline SEO fields (not the shared seoFields group) to preserve existing keywords/ogTitle/ogDescription field names.",
          fields: [
            {
              name: "metaTitle",
              type: "text",
              localized: true,
              admin: {
                description:
                  "Custom page title for search engines (50-60 chars)",
              },
            },
            {
              name: "metaDescription",
              type: "textarea",
              localized: true,
              admin: {
                description:
                  "Custom meta description for search engines (150-160 chars)",
              },
            },
            {
              name: "keywords",
              type: "array",
              fields: [
                { name: "keyword", type: "text", required: true },
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
              name: "ogImage",
              type: "upload",
              relationTo: "media",
              admin: {
                description: "Open Graph image for social sharing",
              },
            },
            {
              name: "seoScore",
              type: "number",
              min: 0,
              max: 100,
              admin: {
                description: "AI-assessed SEO quality score (0-100)",
              },
            },
            {
              name: "seoNotes",
              type: "textarea",
              admin: {
                description: "Notes from last SEO review",
              },
            },
            {
              name: "lastSeoReviewAt",
              type: "date",
              admin: {
                description: "When SEO was last reviewed",
              },
            },
          ],
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/collections/LandingPages.ts
git commit -m "feat: add missing SEO fields to LandingPages + tabs layout"
```

---

## Task 9: Configure MCP plugin in payload.config.ts

**Files:**
- Modify: `apps/website/payload.config.ts`

- [ ] **Step 1: Add mcpPlugin to the config**

Add the import and plugin configuration. We expose all content collections explicitly (excluding Payload system collections like `users`). Fine-grained permissions are managed through API keys in the admin panel.

Edit `apps/website/payload.config.ts`:

Add import at top:
```typescript
import { mcpPlugin } from "@payloadcms/plugin-mcp";
```

Add to the `plugins` array (before the vercelBlobStorage conditional).

**NOTE:** The actual API (verified from installed types) uses `find`/`create`/`update`/`delete` operations (NOT `list`/`get`), and the `enabled` value is `boolean | { find?, create?, update?, delete? }` with no `operations` wrapper.

```typescript
plugins: [
  mcpPlugin({
    collections: {
      services: { enabled: true },
      categories: { enabled: true },
      guides: { enabled: true },
      "landing-pages": { enabled: true },
      pages: { enabled: true },
      media: {
        enabled: {
          find: true,
          create: false,
          update: false,
          delete: false,
        },
      },
    },
  }),
  ...(process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          collections: { media: true },
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      ]
    : []),
],
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/payload.config.ts
git commit -m "feat: configure Payload MCP plugin with content collection access"
```

---

## Task 10: Generate types and run database migration

**Files:**
- Auto-generated: `apps/website/payload-types.ts`

- [ ] **Step 1: Generate Payload types**

```bash
cd apps/website && pnpm payload generate:types
```

Expected: `payload-types.ts` is updated with new fields (research fields on Service, SEO fields on all collections).

- [ ] **Step 2: Verify types include new fields**

Check that the generated `Service` interface includes research and SEO fields:

```bash
grep -E "gdprCompliance|researchStatus|metaTitle|seoScore" apps/website/payload-types.ts | head -10
```

Expected: Multiple matches showing the new fields in the generated types.

- [ ] **Step 3: Create database migration**

Payload 3.x uses Drizzle ORM and requires explicit migration files. The project already has migrations at `apps/website/migrations/`.

```bash
cd apps/website && pnpm payload migrate:create
```

Expected: A new migration file is created in `apps/website/migrations/` with `ALTER TABLE` statements adding nullable columns for all new research and SEO fields.

- [ ] **Step 4: Run the migration and build**

```bash
cd apps/website && pnpm build
```

The build applies pending migrations. All new fields are optional (no `required: true`), so the migration adds nullable columns.

Expected: Build completes successfully.

- [ ] **Step 5: Commit generated types and migration**

```bash
git add apps/website/payload-types.ts apps/website/migrations/
git commit -m "chore: regenerate Payload types and create migration for research/SEO fields"
```

---

## Task 11: Update seed scripts for new optional fields

**Files:**
- Modify: `apps/website/seed/importServices.ts` (if it exists)

The new fields are all optional with sensible defaults, so existing seed scripts should work without changes. However, we should verify and optionally set `researchStatus: 'not-started'` for seeded services.

- [ ] **Step 1: Check if seed scripts still run**

```bash
cd apps/website && pnpm payload seed --dry-run 2>&1 | tail -20
```

If there's no `--dry-run` flag or seed command, just verify the build passed (Task 10 Step 3 confirms this).

- [ ] **Step 2: Commit if any changes were needed**

Only commit if seed scripts required modifications. If they work as-is, skip this step.

---

## Task 12: Verify build and MCP endpoint

- [ ] **Step 1: Run production build**

```bash
pnpm --filter website build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Start dev server and verify MCP endpoint exists**

```bash
cd apps/website && pnpm dev &
sleep 5
curl -s http://localhost:3000/api/mcp | head -20
```

Expected: The MCP endpoint responds (likely with a 401 unauthorized since no API key is provided, which confirms the endpoint is active).

- [ ] **Step 3: Run E2E smoke tests**

```bash
pnpm --filter website test:e2e
```

Expected: All existing smoke tests pass. The new fields don't affect page rendering since they're optional and unused in templates.

- [ ] **Step 4: Stop dev server and commit any fixes**

---

## Post-Implementation: Editor Setup Guide

After implementation, editors need to configure their Claude Desktop/Claude Code to connect to the MCP endpoint. Document this in the project README or a dedicated setup guide:

### Claude Code MCP Configuration

Add to the editor's `.claude/settings.json` or project `.claude/settings.json`:

```json
{
  "mcpServers": {
    "payload": {
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer <MCP-API-KEY>"
      }
    }
  }
}
```

### Creating API Keys

1. Go to Payload Admin (`/admin`)
2. Navigate to **MCP > API Keys**
3. Create a new API key with appropriate collection permissions
4. Copy the key and add it to the Claude Code config above

### Recommended Skills to Install

Based on the artifact research, these skills complement the MCP integration:

- **Humanizer** (`blader/humanizer`) - Strip AI writing patterns from content
- **claude-seo** (`AgriciDaniel/claude-seo`) - SEO auditing and optimization
- **claude-blog** (`AgriciDaniel/claude-blog`) - Content workflow with review gates
- **Content Optimizer MCP** (`npx -y content-optimizer-mcp`) - SERP-based content scoring

### Future Considerations

- **Frontend SEO field usage:** Update page templates to render `metaTitle`/`metaDescription` in `<head>` when available, falling back to existing `title`/`description` fields
- **OG image sizes:** Add `imageSizes` config to the Media collection for OG-optimized crops (1200x630)
- **Draft/Publish workflow:** Enable Payload's `versions` config on collections for draft support, so AI-created content enters as drafts requiring human approval
- **Custom MCP tools:** The plugin supports `mcp.tools` for adding custom tools beyond CRUD — useful for batch operations or content analysis
- **Translation MCP:** Add Lara Translate or DeepL MCP for AI-powered translation via the editor's Claude instance

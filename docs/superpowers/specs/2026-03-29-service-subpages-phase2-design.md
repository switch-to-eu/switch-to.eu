# Service Subpages Phase 2: Data Model + Write Skill

## Context

Phase 1 built the UI for service subpages (overview, pricing, security, comparison) with tab navigation. The pages work but rely on text parsing for pricing and tech-focused content written for engineers rather than everyday users. Phase 2 fixes the data layer and the content generation skill.

## Changes

### 1. Data Model: `pricingTiers` array on Services collection

Add a new array field `pricingTiers` to the Services collection General tab (after `features`).

```
pricingTiers: [
  {
    name: string (required)           // "Free", "Mail Plus", "Business"
    price: string (required)          // "Free", "€3.99/month", "€7.99/user"
    billingNote: string (optional)    // "billed annually"
    features: [{ feature: string }]   // bullet point items
    highlighted: boolean (default: false)  // shows "Popular" badge
  }
]
```

- Keep `pricingDetails` (text) as a reference/notes field. The pricing page renders from `pricingTiers`, falls back to `pricingDetails` text if tiers are empty.
- Keep `pricingUrl` as-is.
- Run `payload generate:types` after schema change.
- No migration needed (additive field).

### 2. Pricing Page: Render from `pricingTiers`

Update `pricing/page.tsx` to read from `service.pricingTiers` directly instead of parsing `pricingDetails` text. Remove the `parsePricingTiers()` function. Fall back to raw `pricingDetails` display if `pricingTiers` is empty.

### 3. Overview Page: Auto-generated pricing + security snippets

After the RichText content on the overview page, render two compact inline cards that link to the subpage tabs:

**Pricing snippet**: Free tier price + highlighted tier price. Link text: "See all plans" pointing to `/pricing` tab.

**Security snippet**: GDPR compliance badge + certification count + storage location count. Link text: "See details" pointing to `/security` tab.

These pull from existing fields (`pricingTiers`, `gdprCompliance`, `certifications`, `dataStorageLocations`). No new fields needed. Only render each snippet if the corresponding tab exists (same conditions as tab visibility).

### 4. Populate Proton Mail `pricingTiers` via MCP

Use Payload MCP `updateServices` to set structured tiers for Proton Mail (id: 18) from the existing research data:

- Free: Free, [1 GB storage, 1 email address, 150 messages per day]
- Mail Plus: €3.99/month, billed annually, [15 GB storage, 10 email addresses, Unlimited messages, Custom domain], highlighted: true
- Proton Unlimited: €9.99/month, billed annually, [500 GB storage, 15 email addresses, VPN + Drive + Calendar + Pass]
- Proton Family: €19.99/month, billed annually, [3 TB shared storage, Up to 6 users, All Proton apps]
- Business: €7.99/user/month, [Custom domain, Admin panel, Priority support]

### 5. Update `/write` Skill

Key changes to `.claude/skills/write/SKILL.md`:

**Page-structure awareness**: Document what content appears where:
- Overview tab: `features` (short tags) + `content` (consumer-friendly overview with "Worth knowing") + auto-generated pricing/security snippets
- Pricing tab: `pricingTiers` (structured) + `pricingUrl`
- Security tab: research fields (gdprCompliance, certifications, dataStorageLocations, openSource, etc.)
- Comparison tab: auto-generated from both services + guide data

**Content field rewrite rules**:
- Write for someone who uses email, not someone who builds email servers
- 2-3 short paragraphs introducing the service
- One "Worth knowing" section with honest trade-offs, written in plain language
- No "What stands out" section (features tags handle that)
- No "Pricing" section in content (pricing tab handles that)
- Replace technical language: "zero-access encryption" becomes "even the company can't read your emails"

**Features as short tags**: 2-4 words max. Not sentences.

**New: populate `pricingTiers`**: Extract pricing from research data into structured tiers with name, price, billingNote, features array, and highlighted flag.

### 6. Update Proton Mail content via MCP

Rewrite the `content` field to be consumer-focused:
- Keep the intro paragraph about who Proton is
- Rewrite the encryption explanation in plain language
- Keep "Worth knowing" with consumer-friendly trade-offs
- Remove pricing and technical compliance details (those live on their own tabs now)

## What doesn't change

- Security page reads from existing research fields
- Comparison page reads from both services + guide
- `/research` skill stays the same
- SEO fields stay the same
- Layout, tab navigation, ServiceCta, ServiceSubNav components
- i18n keys

## Implementation order

1. Add `pricingTiers` field to Services collection
2. Generate types
3. Update pricing page to render from tiers
4. Add pricing/security snippets to overview page
5. Populate Proton Mail tiers via MCP
6. Rewrite Proton Mail content to be consumer-focused via MCP
7. Update `/write` skill documentation

---
name: write-service
description: Write or rewrite content for a service listing on switch-to.eu using research data from Payload CMS. Use when asked to "write a service", "write service ProtonMail", "draft service content".
argument-hint: "'<service name>'"
---

# Write Service Content

Write a service listing for switch-to.eu using research data from Payload CMS.

**Before writing, read:** `.claude/skills/_shared/voice.md` for tone and writing rules, `.claude/skills/_shared/lexical-json.md` for richText format.

## Page Structure Awareness

The service detail page has multiple tabs. Each tab has its own content source:

| Tab | Content source | What this skill populates |
|-----|---------------|--------------------------|
| **Overview** | `features` (tags) + `content` (richText) + auto-generated pricing/security snippets | `features`, `content` |
| **Pricing** | `pricingTiers` (structured array) | `pricingTiers` |
| **Security** | Research fields + `gdprNotes` | `gdprNotes` |
| **Comparison** | Auto-generated from both services + guide data | Nothing |

## Process

### Step 1: Pull research data

Use `mcp__Payload__findServices` to get the service with all its research fields:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 1, "depth": 1}
```

If `researchStatus` is "not-started", tell the user to run `/research SERVICE_NAME` first.

### Step 2: Write the content

**`description`** (required, localized): 1-2 sentences. Under 200 characters. Lead with the reader benefit, not company facts.

The description answers: "Why would I use this instead of what I have now?" Start with what makes this service meaningfully different from mainstream alternatives. That's usually a privacy/ownership angle, but could be simplicity, openness, or something else entirely. Mention the country only if it reinforces the point.

- Bad: "Swiss encrypted email from Proton AG. Founded by CERN scientists, owned by a non-profit."
- Bad: "Secure email service based in Switzerland with end-to-end encryption."
- Good: "Email where only you can read your inbox. Based in Switzerland, outside US and EU data requests."
- Good: "A search engine that plants trees with its ad revenue. Based in Berlin, no tracking."

**`features`** array: 4-6 short tags. 2-4 words each. These show as pills on the overview page.
- Bad: "End-to-end encryption between Proton users. Zero-access encryption for all stored mail."
- Good: "End-to-end encrypted", "Free tier available", "Open source", "GDPR compliant"

**`content`** (richText, Lexical JSON): 150-250 words. Consumer-friendly overview:

1. Opening paragraph: What it does, who made it, why you'd trust it. Reference the country.
2. Second paragraph: What makes it different, in plain language. Focus on outcomes not mechanisms.
3. Optional third paragraph: What else comes with it (calendar, storage, etc.) if applicable.
4. "Worth knowing" (h2): 1-2 paragraphs of honest trade-offs written for everyday users.

Do NOT include:
- "What stands out" section (features tags handle that)
- "Pricing" section (pricing tab handles that)
- Technical compliance details (security tab handles that)
- License names (GPLv3, AGPL, MIT) — say "open source" or "the code is public"
- Certificate names (ISO 27001, SOC 2) — say "passed independent security audits"

**`pricingTiers`** array: Structured pricing data from research. Each tier:
```json
{
  "name": "Mail Plus",
  "price": "€3.99/month",
  "billingNote": "billed annually",
  "features": [{"feature": "15 GB storage"}, {"feature": "10 email addresses"}]
}
```
- Free tier name: "Free" with price "Free"
- Keep feature descriptions under 6 words

**`gdprNotes`** (localized text): Rewrite research `gdprNotes` into 2-4 consumer-friendly sentences.
- Bad: "Fully GDPR compliant. Provides a Data Processing Agreement (DPA) for business customers."
- Good: "Tuta follows EU privacy rules and stores all your data on its own servers in Germany. The company doesn't log your IP address by default, so it holds very little data about you."

**For non-EU services also write:**
- `issues` array: Privacy/data concerns, stated factually. "Scans email content for ad targeting" not "spies on your data."

### Step 3: Save

Use `mcp__Payload__updateServices` (existing) or `mcp__Payload__createServices` (new). Set `_status: "draft"`.

## Self-check before saving

1. Would your non-technical friend understand every sentence?
2. Any vague claims without numbers? Add specifics from research data.
3. Did you include "Worth knowing" with at least one honest trade-off?
4. Are features 2-4 word tags, not sentences?
5. Did you populate `pricingTiers` with structured data?
6. Does the content include pricing or security details that belong on their own tabs? Remove them.

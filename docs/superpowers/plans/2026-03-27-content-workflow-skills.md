# Content Workflow Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 5 custom project-scoped Claude Code skills that chain into a full content pipeline — research, write, humanize, SEO check, translate — all wired to Payload CMS via MCP, then uninstall third-party skill bloat.

**Architecture:** Each skill is a standalone `.claude/skills/<name>/SKILL.md` file. Skills read/write content through Payload MCP tools (`mcp__payload__find*`, `mcp__payload__update*`, `mcp__payload__create*`). The existing `informational-copy` skill becomes the tone-of-voice foundation. Draft/publish support via Payload's `versions` config gates all content through human review.

**Tech Stack:** Claude Code skills (markdown), Payload CMS MCP plugin (HTTP), Payload versions/drafts

---

## File Structure

### New Files

| File                                | Responsibility                                                             |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `.claude/skills/research/SKILL.md`  | `/research` — Research a service via web, store structured data in Payload |
| `.claude/skills/write/SKILL.md`     | `/write` — Write service listings or migration guides from research data   |
| `.claude/skills/humanize/SKILL.md`  | `/humanize` — Strip AI patterns from content stored in Payload             |
| `.claude/skills/seo-check/SKILL.md` | `/seo-check` — SEO audit with scoring, stored in Payload                   |
| `.claude/skills/translate/SKILL.md` | `/translate` — Translate content to another locale in Payload              |

### Modified Files

| File                                         | Change                           |
| -------------------------------------------- | -------------------------------- |
| `apps/website/collections/Services.ts`       | Add `versions: { drafts: true }` |
| `apps/website/collections/Guides.ts`         | Add `versions: { drafts: true }` |
| `apps/website/collections/LandingPages.ts`   | Add `versions: { drafts: true }` |
| `apps/website/collections/Pages.ts`          | Add `versions: { drafts: true }` |
| `.claude/skills/informational-copy/SKILL.md` | Add MCP-aware context paragraph  |
| `CLAUDE.md`                                  | Add content workflow section     |

### Auto-Generated

| File                            | Trigger                                        |
| ------------------------------- | ---------------------------------------------- |
| `apps/website/payload-types.ts` | `pnpm --filter website payload generate:types` |
| `apps/website/migrations/*.ts`  | `pnpm --filter website payload migrate:create` |

---

### DELETE (absorbed into custom skills or not needed)

All of these third-party skills. Their useful patterns have been extracted into our custom skills:

**Blog/Content skills** (absorbed into `/write` and `/seo-check`):
`blog`, `blog-write`, `blog-outline`, `blog-brief`, `blog-rewrite`, `blog-seo-check`, `blog-analyze`, `blog-audit`, `blog-strategy`, `blog-calendar`, `blog-factcheck`, `blog-geo`, `blog-schema`, `blog-taxonomy`, `blog-repurpose`, `blog-cannibalization`, `blog-chart`, `blog-image`, `blog-audio`, `blog-notebooklm`, `blog-persona`

**SEO skills** (absorbed into `/seo-check` and `/research`):
`seo-audit`, `seo-content-writer`, `content-quality-auditor`, `on-page-seo-auditor`, `technical-seo-checker`, `meta-tags-optimizer`, `schema-markup-generator`, `schema-markup`, `keyword-research`, `serp-analysis`, `rank-tracker`, `internal-linking-optimizer`, `backlink-analyzer`, `domain-authority-auditor`, `content-gap-analysis`, `ai-seo`, `geo-content-optimizer`, `performance-reporter`, `alert-manager`

**Marketing/CRO skills** (not needed for content site):
`copywriting`, `copy-editing`, `marketing-ideas`, `marketing-psychology`, `content-strategy`, `competitor-analysis`, `competitor-alternatives`, `product-marketing-context`, `social-content`, `cold-email`, `email-sequence`, `lead-magnets`, `sales-enablement`, `paid-ads`, `ad-creative`, `launch-strategy`, `pricing-strategy`, `free-tool-strategy`, `analytics-tracking`, `programmatic-seo`, `entity-optimizer`, `referral-program`, `revops`

**CRO skills** (not needed):
`page-cro`, `form-cro`, `signup-flow-cro`, `onboarding-cro`, `popup-cro`, `paywall-upgrade-cro`, `ab-test-setup`, `churn-prevention`

**Utility skills** (not needed):
`content-refresher`, `content-strategy`, `memory-management`, `prompt-architect`

---

## Workflow Overview

```
/research "ProtonMail"
  → Web search + fetch → fills Research tab on service via MCP
  → Sets researchStatus: "complete"

/write service "ProtonMail"
  → Reads research from MCP → applies tone-of-voice → writes content
  → Saves as draft via MCP (requires versions/drafts on collections)

/humanize service "ProtonMail"
  → Reads content from MCP → strips AI patterns → saves back

/seo-check service "ProtonMail"
  → Reads content from MCP → 10-point audit → stores seoScore + seoNotes

Editor reviews in Payload admin → publishes

/translate service "ProtonMail" nl
  → Reads English → translates → saves nl locale via MCP
  → Editor reviews nl version → publishes
```

---

## Task 1: Enable draft/publish on content collections

**Files:**

- Modify: `apps/website/collections/Services.ts`
- Modify: `apps/website/collections/Guides.ts`
- Modify: `apps/website/collections/LandingPages.ts`
- Modify: `apps/website/collections/Pages.ts`

Payload's `versions: { drafts: true }` adds a `_status` field (`'draft' | 'published'`). New documents default to draft. Editors click "Publish" in admin panel. Published documents appear on the frontend; drafts don't.

- [ ] **Step 1: Add versions config to Services**

In `apps/website/collections/Services.ts`, add after the `access` block:

```typescript
versions: {
  drafts: true,
},
```

The full collection config becomes:

```typescript
export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "region", "category", "featured"],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    // ... existing hooks
```

- [ ] **Step 2: Add versions config to Guides, LandingPages, Pages**

Same change to each file — add `versions: { drafts: true }` after the `access` block.

- [ ] **Step 3: Generate types and migration**

```bash
cd apps/website && pnpm payload generate:types && pnpm payload migrate:create
```

- [ ] **Step 4: Build to verify**

```bash
pnpm --filter website build
```

- [ ] **Step 5: Commit**

```bash
git add apps/website/collections/ apps/website/payload-types.ts apps/website/migrations/
git commit -m "feat: enable draft/publish workflow on content collections"
```

---

## Task 2: Create /research skill

**Files:**

- Create: `.claude/skills/research/SKILL.md`

This skill researches a digital service using web search and stores structured findings in Payload via MCP. It maps findings directly to the Research tab fields on the Services collection.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ".claude/skills/research"
```

- [ ] **Step 2: Create `.claude/skills/research/SKILL.md`**

````markdown
---
name: research
description: Research a digital service and store structured findings in Payload CMS. Use when asked to research a service, investigate a company, gather pricing/privacy/compliance data, or populate the Research tab on a service. Trigger phrases include "research this service", "investigate", "gather data on", "fill in research for".
argument-hint: "service name to research (e.g. 'ProtonMail', 'Mullvad VPN')"
---

# Service Research Skill

Research a digital service and store structured findings in Payload CMS via MCP.

## Process

### Step 1: Find the service in Payload

Use `mcp__payload__findServices` with a where clause to find the service by name:

```json
{ "where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 5 }
```
````

If not found, ask the user whether to create a new service entry or check the name.

### Step 2: Research the service

Use `WebSearch` and `WebFetch` to gather data on these topics:

**Company basics:**

- Official website URL
- Headquarters location (city, country)
- Parent company (if any)
- Founded year
- Approximate employee count
- Open source status + repo URL if applicable

**Pricing:**

- Free tier availability and limits
- Paid plans with prices (monthly/yearly)
- Enterprise pricing if available
- Fetch the pricing page URL

**Privacy & GDPR:**

- Where user data is stored (countries/regions)
- GDPR compliance status (compliant, partial, non-compliant, unknown)
- Data Processing Agreement availability
- Privacy policy URL
- Notable privacy practices or concerns
- End-to-end encryption status

**Security & compliance:**

- Security certifications (ISO 27001, SOC 2, etc.)
- Known data breaches (search: "[service name] data breach")
- Security audit history

**Public sentiment:**

- Search Reddit: "[service name] site:reddit.com review"
- Note common praise and complaints
- Any notable controversies

### Step 3: Store findings in Payload

Use `mcp__payload__updateServices` with the service ID. Map findings to these fields:

| Research finding      | Payload field                                                         |
| --------------------- | --------------------------------------------------------------------- |
| GDPR status           | `gdprCompliance` (one of: compliant, partial, non-compliant, unknown) |
| GDPR details          | `gdprNotes`                                                           |
| Privacy policy link   | `privacyPolicyUrl`                                                    |
| Pricing breakdown     | `pricingDetails`                                                      |
| Pricing page link     | `pricingUrl`                                                          |
| City, Country         | `headquarters`                                                        |
| Parent org            | `parentCompany`                                                       |
| Year                  | `foundedYear`                                                         |
| Employee range        | `employeeCount`                                                       |
| Data center countries | `dataStorageLocations` (array of `{location: "country"}`)             |
| Certifications        | `certifications` (array of `{certification: "name"}`)                 |
| Is open source?       | `openSource`                                                          |
| Repo URL              | `sourceCodeUrl`                                                       |
| Research summary      | `researchNotes` (use plain text, not richText JSON)                   |
| Source URLs used      | `sourceUrls` (array of `{url: "...", label: "..."}`)                  |
| Status                | `researchStatus`: "complete"                                          |
| Date                  | `lastResearchedAt`: today's date (ISO format)                         |

Also update the General tab fields if they're empty or outdated:

- `location` (country)
- `url` (official website)
- `freeOption` (boolean)
- `startingPrice` (e.g. "€4.99/month")

### Step 4: Report summary

After saving, report to the user:

- Service name and ID
- Key findings (1-2 sentences each for: pricing, privacy, sentiment)
- Fields that were updated
- Any gaps that need manual follow-up

## Important notes

- Always cite your sources. Every claim in researchNotes should reference a sourceUrl.
- If you can't verify something, say "unverified" rather than guessing.
- For GDPR compliance, look for: DPA availability, data processing location, privacy shield/adequacy decisions. Default to "unknown" if unclear.
- The `researchNotes` field accepts plain text. Do not try to construct Lexical richText JSON. Just write clear, factual paragraphs.
- Set `researchStatus` to "in-progress" at the start, "complete" when done.

````

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/research/
git commit -m "feat: add /research skill for service investigation via MCP"
````

---

## Task 3: Create /write skill

**Files:**

- Create: `.claude/skills/write/SKILL.md`

This skill writes content using research data from Payload. It supports two modes: writing service listings and writing migration guides. It references the `informational-copy` skill for tone.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ".claude/skills/write"
```

- [ ] **Step 2: Create `.claude/skills/write/SKILL.md`**

````markdown
---
name: write
description: Write or rewrite content for switch-to.eu using research data from Payload CMS. Handles service listings (descriptions, features, content) and migration guides (intro, steps, troubleshooting). Use when asked to "write a service page", "write a guide", "draft content for", "rewrite the description". Always uses the informational-copy tone of voice.
argument-hint: "'service <name>' or 'guide <source> to <target>'"
---

# Content Writing Skill

Write switch-to.eu content using research data from Payload, following the informational-copy tone of voice.

## Before writing: read the tone-of-voice skill

The `informational-copy` skill at `.claude/skills/informational-copy/SKILL.md` defines our voice. Read it before writing. Key rules:

- Write like a knowledgeable friend, not a marketing team
- Back every claim with specifics
- Acknowledge trade-offs honestly
- No em dashes, no semicolons, no banned words
- Active voice, short sentences, varied paragraph length

## Mode 1: Write a service listing

Usage: `/write service ProtonMail`

### Step 1: Pull research data

Use `mcp__payload__findServices` to get the service with all its research fields:

```json
{
  "where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}",
  "limit": 1,
  "depth": 1
}
```
````

If `researchStatus` is "not-started", tell the user to run `/research SERVICE_NAME` first.

### Step 2: Write the content

Using the research data, write these fields:

**`description`** (required, localized): 1-2 sentences. What it is, where it's based, what makes it different. No marketing language. Under 200 characters.

Template: "[Name] is a [country]-based [type]. [One differentiating fact with a number or specific detail.]"

**`features`** array: 4-6 concrete features. Each one specific, not vague.

- Bad: "Strong privacy features"
- Good: "End-to-end encryption for all emails. Even Proton can't read them."

**`content`** (richText, localized): 300-500 words following this structure:

1. Opening paragraph: What it does and who it's for. Reference the country and a specific capability.
2. "What stands out" section: 3-4 specific features with numbers/details from the research.
3. "Worth knowing" section: 2-3 honest limitations or trade-offs. This is mandatory.
4. Pricing paragraph: Specific tiers and prices from the research data.
5. Closing: One sentence on who this is best for.

**For non-EU services also write:**

- `issues` array: Privacy/data concerns, stated factually. "Scans email content for ad targeting" not "spies on your data."

**Do NOT write `content` as Lexical richText JSON.** Write it as plain markdown text. The Payload admin can convert it. If the MCP rejects plain text in the richText field, note this to the user and provide the content for manual paste.

### Step 3: Save as draft

Use `mcp__payload__updateServices` to save. Set `_status: "draft"` if drafts are enabled.

### Step 4: Report

Tell the user what was written, word count, and that it's saved as draft for review.

---

## Mode 2: Write a migration guide

Usage: `/write guide Gmail to ProtonMail`

### Step 1: Pull research for both services

Use `mcp__payload__findServices` twice to get research data for the source (non-EU) and target (EU) services.

### Step 2: Check if guide exists

Use `mcp__payload__findGuides` to see if a guide already exists for this pair:

```json
{
  "where": "{\"sourceService\": {\"equals\": SOURCE_ID}, \"targetService\": {\"equals\": TARGET_ID}}",
  "limit": 1,
  "depth": 1
}
```

### Step 3: Write the guide sections

**`title`**: "Switching from [Source] to [Target]"

**`description`**: 1-2 sentences. What the target does and time estimate for the switch.

**`difficulty`**: beginner, intermediate, or advanced based on technical complexity.

**`timeRequired`**: Realistic estimate (e.g. "30 minutes" or "1-2 hours").

**`intro`** (richText): Why someone would switch. State facts, not opinions. Reference specific differences from the research. 100-150 words.

**`beforeYouStart`** (richText): The thing people wish they'd known. Data that won't transfer, accounts to update first, preparation needed. 50-100 words.

**`steps`** array: 4-8 ordered steps. Each step has:

- `title`: Action-first (e.g. "Create your ProtonMail account")
- `content`: 2-3 sentences. Action first, context second. Active voice.
- `complete`: false

Step writing rules:

- Start with the verb
- One action per step
- Include specific UI paths ("Go to Settings > Import/Export")
- Note time estimates for longer steps
- Tips and warnings in separate sentences

**`troubleshooting`** (richText): 3-5 common issues as Q&A pairs. Pull from Reddit sentiment in the research data. 100-200 words.

**`outro`** (richText): What to do after switching. Update email on important accounts, tell contacts, etc. 50-100 words.

**`missingFeatures`** array: Features the source has that the target doesn't. Be honest.

### Step 4: Save

Use `mcp__payload__createGuides` (new guide) or `mcp__payload__updateGuides` (existing). Set category, sourceService, targetService relationships by ID. Set `_status: "draft"`.

### Step 5: Report

Tell the user: guide title, step count, word count, saved as draft.

---

## Self-check before saving

Before saving any content, scan for:

1. Any em dashes (—)? Replace with periods or commas.
2. Any banned words from the informational-copy list? Replace with specifics.
3. Any vague claims without numbers? Add specifics from research data.
4. Did you acknowledge at least one trade-off? If not, add a "Worth knowing" item.
5. Does it sound like a person or a website? Rewrite if it sounds like marketing.

````

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/write/
git commit -m "feat: add /write skill for service listings and migration guides"
````

---

## Task 4: Create /humanize skill

**Files:**

- Create: `.claude/skills/humanize/SKILL.md`

Strips AI writing patterns from content already in Payload. This is a separate pass that runs after `/write`, catching anything the self-check missed.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ".claude/skills/humanize"
```

- [ ] **Step 2: Create `.claude/skills/humanize/SKILL.md`**

```markdown
---
name: humanize
description: Strip AI writing patterns from content stored in Payload CMS. Use when asked to "humanize", "de-AI", "make this sound human", "clean up the writing", or review content for AI patterns. Runs a two-pass rewrite on content fetched via MCP.
argument-hint: "'service <name>' or 'guide <slug>'"
---

# Humanize Skill

Remove AI writing patterns from content in Payload CMS. Two-pass process: rewrite, then audit.

## AI Pattern Detection List

These patterns signal AI-generated text. Find and fix all of them.

### Structural patterns

1. **Rule of three**: "X, Y, and Z" lists appearing more than once per 200 words
2. **Parallel sentence openings**: 3+ consecutive sentences starting the same way
3. **Symmetric paragraphs**: Every paragraph roughly the same length
4. **Formulaic transitions**: "Moreover," "Furthermore," "Additionally," at paragraph starts
5. **Setup-punchline structure**: "While X may seem Y, the reality is Z"

### Word-level patterns

6. **Inflated vocabulary**: "utilize" (use), "facilitate" (help), "leverage" (use), "implement" (do/set up), "comprehensive" (specific list instead), "robust" (describe what it actually does)
7. **Hedging clusters**: "It's important to note that," "It's worth mentioning," "It should be noted"
8. **Vague intensifiers**: "very," "really," "incredibly," "extremely," "significantly"
9. **AI-favorite words**: "delve," "landscape," "tapestry," "realm," "paradigm," "synergy," "ecosystem" (unless technically accurate), "holistic," "seamless," "cutting-edge," "game-changer"
10. **Promotional adjectives**: "revolutionary," "groundbreaking," "innovative," "state-of-the-art," "best-in-class"

### Tone patterns

11. **Excessive enthusiasm**: Multiple exclamation marks, "exciting," "amazing," "incredible"
12. **False certainty**: "undoubtedly," "without question," "clearly" (when the thing isn't clear)
13. **Anthropomorphization**: "the tool understands," "the platform knows," "the service cares"
14. **Reader flattery**: "as a savvy user," "for discerning professionals"
15. **Empty empathy**: "we understand how frustrating," "we know how important"

### Punctuation patterns

16. **Em dash overuse**: More than 1 per 500 words (our rule: zero em dashes)
17. **Semicolons**: Remove all. Split into two sentences.
18. **Ellipses for drama**: "And then... everything changed."

## Process

### Step 1: Fetch the content

For services: `mcp__payload__findServices` with name search, get `description`, `content`, `features`, `issues`.
For guides: `mcp__payload__findGuides` with slug search, get `intro`, `beforeYouStart`, `steps`, `troubleshooting`, `outro`.

### Step 2: First pass — Rewrite

Go through every text field. For each one:

- Find every instance of the 18 patterns above
- Rewrite to sound natural. Shorter sentences. Specific details instead of adjectives.
- Vary sentence length: mix 6-word and 20-word sentences
- Use contractions naturally ("it's", "don't", "won't")
- Replace any "not just X, but also Y" with two plain statements

### Step 3: Second pass — Audit

Read the rewritten version and ask: "What still makes this obviously AI-generated?"
Fix those remaining issues. Common second-pass catches:

- Too-perfect paragraph structure (add one short 1-sentence paragraph)
- No contractions (add 2-3 natural ones)
- Every sentence follows subject-verb-object (vary with an occasional "The hard part:" or "In practice:")
- No personality (add one slightly opinionated observation with "Worth knowing:" or "The catch:")

### Step 4: Save back to Payload

Use `mcp__payload__updateServices` or `mcp__payload__updateGuides` to save the rewritten content. Only update the text fields that changed.

### Step 5: Report

Tell the user:

- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns

## Verification

After humanizing, the content should pass these checks:

- [ ] No em dashes anywhere
- [ ] No semicolons
- [ ] No words from the banned list
- [ ] Sentence length varies (some 5-8 words, some 15-25)
- [ ] At least one contraction per 100 words
- [ ] No three consecutive sentences starting the same way
- [ ] At least one acknowledged limitation or trade-off
- [ ] Reading it aloud doesn't feel robotic
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/humanize/
git commit -m "feat: add /humanize skill to strip AI patterns from Payload content"
```

---

## Task 5: Create /seo-check skill

**Files:**

- Create: `.claude/skills/seo-check/SKILL.md`

SEO audit skill that scores content and stores results in the SEO tab via MCP. Distilled from blog-seo-check, meta-tags-optimizer, and content-quality-auditor into a focused 10-point checklist.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ".claude/skills/seo-check"
```

- [ ] **Step 2: Create `.claude/skills/seo-check/SKILL.md`**

```markdown
---
name: seo-check
description: Run an SEO audit on content in Payload CMS and store the score. Use when asked to "check SEO", "audit SEO", "review SEO", "score this page", or "run SEO check". Reads content via MCP, runs a 10-point checklist, stores seoScore and seoNotes.
argument-hint: "'service <name>' or 'guide <slug>' or 'page <slug>'"
---

# SEO Check Skill

Audit content in Payload CMS against a 10-point SEO checklist. Store score and notes via MCP.

## Process

### Step 1: Fetch the content

Determine collection from the argument:

- "service X" → `mcp__payload__findServices` by name
- "guide X" → `mcp__payload__findGuides` by slug
- "page X" → `mcp__payload__findPages` by slug
- "landing X" → `mcp__payload__findLandingPages` by slug

Get all fields including SEO tab fields (metaTitle, metaDescription, keywords, ogTitle, ogDescription).

### Step 2: Run the 10-point checklist

Score each item: PASS (10 pts), PARTIAL (5 pts), FAIL (0 pts).

**1. Meta Title** (field: `metaTitle`)

- PASS: Present, 40-60 characters, contains a target keyword
- PARTIAL: Present but wrong length or missing keyword
- FAIL: Empty

**2. Meta Description** (field: `metaDescription`)

- PASS: Present, 150-160 characters, contains value proposition, not keyword-stuffed
- PARTIAL: Present but wrong length or generic
- FAIL: Empty

**3. Keywords** (field: `keywords`)

- PASS: 3-8 keywords defined, relevant to content
- PARTIAL: 1-2 keywords or some seem irrelevant
- FAIL: Empty

**4. Heading Structure** (analyze `content` or guide sections)

- PASS: Single H1 (or title field), H2s for sections, no skipped levels, keyword in at least one H2
- PARTIAL: Minor issues (skipped level, no keyword in headings)
- FAIL: No headings or broken hierarchy

**5. Content Length**

- For services: PASS if description 50-200 chars AND content body 300+ words
- For guides: PASS if intro + steps + troubleshooting total 500+ words
- PARTIAL: Close to thresholds
- FAIL: Significantly short

**6. Internal Context** (for services)

- PASS: `category` set, `features` has 3+ items, `tags` has 2+ items
- PARTIAL: Some missing
- FAIL: Category missing

**7. Open Graph** (fields: `ogTitle`, `ogDescription`)

- PASS: Both present, ogTitle under 70 chars, ogDescription under 200 chars
- PARTIAL: One present
- FAIL: Both empty

**8. Image** (service: `screenshot` or `logo`; pages: `ogImage`)

- PASS: At least one image present
- PARTIAL: N/A (no image required for this content type)
- FAIL: No images on a page that should have one

**9. Readability** (analyze content text)

- PASS: Paragraphs 1-4 sentences, no paragraph over 150 words, active voice predominant, Flesch Reading Ease estimate 60+
- PARTIAL: Some long paragraphs or passive voice
- FAIL: Wall of text, heavy jargon, passive voice dominant

**10. Freshness signals**

- PASS: `lastSeoReviewAt` within 90 days OR content recently updated
- PARTIAL: Review older than 90 days
- FAIL: Never reviewed

### Step 3: Calculate score

Score = sum of all items. Maximum 100.

Rating:

- 90-100: Excellent
- 70-89: Good
- 50-69: Needs work
- Below 50: Major issues

### Step 4: Generate notes

Write `seoNotes` as a concise summary:
```

Score: [X]/100 ([Rating])
Checked: [date]

PASS: [list items that passed]
ISSUES:

- [Item]: [specific problem + fix recommendation]
- [Item]: [specific problem + fix recommendation]

Suggested metaTitle: "[if missing or bad, suggest one]"
Suggested metaDescription: "[if missing or bad, suggest one]"

```

### Step 5: Store in Payload

Use `mcp__payload__updateServices` (or the appropriate collection's update tool):
- `seoScore`: the number (0-100)
- `seoNotes`: the summary text
- `lastSeoReviewAt`: today's date in ISO format

If `metaTitle` or `metaDescription` are empty, also populate them with suggested values.

### Step 6: Report

Show the user:
- Score and rating
- Table of all 10 checks with status
- Top 3 priority fixes
- Any fields that were auto-populated
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/seo-check/
git commit -m "feat: add /seo-check skill for SEO auditing with Payload MCP storage"
```

---

## Task 6: Create /translate skill

**Files:**

- Create: `.claude/skills/translate/SKILL.md`

Translates content to another locale and stores it in Payload via MCP's locale parameter.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ".claude/skills/translate"
```

- [ ] **Step 2: Create `.claude/skills/translate/SKILL.md`**

```markdown
---
name: translate
description: Translate content in Payload CMS to another locale. Use when asked to "translate", "localize", "write in Dutch", "add Dutch version", or work with non-English content. Reads the English version via MCP, translates all localized fields, and saves the target locale.
argument-hint: "'service <name> <locale>' or 'guide <slug> <locale>' (e.g. 'service ProtonMail nl')"
---

# Translation Skill

Translate content from English to another locale in Payload CMS.

## Supported locales

- `en` — English (source, default)
- `nl` — Dutch (Nederlands)

## Process

### Step 1: Fetch English content

Use the appropriate find tool with `locale: "en"` to get the English version.

For services: `mcp__payload__findServices` — get name, description, startingPrice, features, content, issues
For guides: `mcp__payload__findGuides` — get title, description, intro, beforeYouStart, steps, troubleshooting, outro, missingFeatures

### Step 2: Translate

Translate all localized fields. Follow these rules:

**General:**

- Translate meaning, not words. The Dutch version should read naturally in Dutch.
- Keep the same tone as the English: direct, practical, slightly opinionated.
- Do NOT translate: brand names, service names, technical terms (API, GDPR, URL, etc.)
- Keep the same structure and paragraph breaks.
- Match the informational-copy tone rules in Dutch too: no marketing fluff, no vague claims.

**Dutch-specific:**

- Use "je/jij" (informal you), not "u" (formal). Switch-to.eu is informal.
- Dutch compound words: write as one word (e.g. "privacybeleid" not "privacy beleid").
- Keep sentences short. Dutch tends toward longer constructions — fight that.
- "Data" is both singular and plural in Dutch. Don't write "datas."

**What NOT to translate:**

- `slug` (not localized)
- `url` (not localized)
- `region` (not localized)
- `category` relationship (not localized)
- Research tab fields (not localized)
- SEO fields: translate `metaTitle`, `metaDescription`, `ogTitle`, `ogDescription`, `keywords` but NOT `seoScore`, `seoNotes`, `lastSeoReviewAt`

### Step 3: Save the translation

Use the update tool with the `locale` parameter set to the target locale.

For services: `mcp__payload__updateServices` with the service ID
For guides: `mcp__payload__updateGuides` with the guide ID

Include `locale: "nl"` (or target locale) in the request. Only send the localized fields.

**Important:** The `content`, `intro`, `beforeYouStart`, `steps[].content`, `troubleshooting`, `outro` fields are richText. Write translations as plain text. If the MCP rejects it, note this to the user for manual entry.

### Step 4: Report

Tell the user:

- What was translated (fields list)
- Target locale
- Any fields that couldn't be saved via MCP (for manual entry)
- Remind them to review the translation in the Payload admin

## Post-translation SEO

After translation, the user should run:
```

/seo-check service <name>

```
This will check the translated meta fields for the target locale. The keywords, meta title, and meta description should be localized (not just translated — adapted for the target market's search terms).

## Quality notes

- Machine translation of SEO keywords rarely works. After translating, review keywords for Dutch search intent. "cloud storage" might be searched as "cloudopslag" in Dutch.
- Run `/humanize` on the Dutch version if it reads stiffly.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/translate/
git commit -m "feat: add /translate skill for content localization via MCP"
```

---

## Task 7: Update informational-copy with MCP context

**Files:**

- Modify: `.claude/skills/informational-copy/SKILL.md`

Add a small section noting that this skill works alongside the Payload MCP tools. This helps Claude understand the context when the skill auto-triggers during writing tasks.

- [ ] **Step 1: Add MCP context paragraph**

At the end of the file, before the closing, add:

```markdown
---

## Integration with Payload CMS

This tone of voice applies to all content written for switch-to.eu, whether entered manually or via the Payload MCP tools. When other skills (/write, /humanize, /translate) reference "informational-copy tone," they mean these rules.

Content collections in Payload: services, guides, landing-pages, pages, categories. All have localized text fields (en, nl) and SEO metadata tabs.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/informational-copy/
git commit -m "chore: add Payload MCP context to informational-copy skill"
```

---

## Task 8: Update CLAUDE.md with workflow documentation

**Files:**

- Modify: `CLAUDE.md`

Add a new section documenting the content workflow for the team.

- [ ] **Step 1: Add Content Workflow section to CLAUDE.md**

Add after the existing "Content System (Website)" section:

```markdown
## Content Workflow (AI-Assisted)

The site uses custom Claude Code skills wired to Payload CMS via MCP for a research-to-publish pipeline. All content enters as draft and requires human review before publishing.

### Pipeline
```

/research "ServiceName" → Fills Research tab on service via MCP
/write service "ServiceName" → Writes listing from research data, saves as draft
/humanize service "ServiceName" → Strips AI writing patterns
/seo-check service "ServiceName" → 10-point audit, stores score in SEO tab
→ Editor reviews in /admin, publishes
/translate service "ServiceName" nl → Translates to Dutch locale
→ Editor reviews Dutch version, publishes

```

For guides:
```

/write guide "Gmail" to "ProtonMail" → Creates migration guide from research
/humanize guide "gmail-to-protonmail"
/seo-check guide "gmail-to-protonmail"
→ Review + publish
/translate guide "gmail-to-protonmail" nl
→ Review Dutch + publish

```

### Skills (`.claude/skills/`)

| Skill | Type | Purpose |
|-------|------|---------|
| `informational-copy` | Auto-invoked | Tone of voice: direct, honest, specific, no marketing fluff |
| `research` | `/research` | Web research → Payload Research tab via MCP |
| `write` | `/write` | Content generation from research data |
| `humanize` | `/humanize` | Strip AI writing patterns |
| `seo-check` | `/seo-check` | SEO audit with scoring |
| `translate` | `/translate` | Localization to other EU languages |

### Tone rules (from informational-copy)

- Write like a knowledgeable friend, not a marketing team
- Back every claim with specifics (numbers, features, prices)
- Always acknowledge trade-offs ("Worth knowing:" section is mandatory)
- No em dashes, no semicolons, no banned words (see skill for full list)
- Active voice, short sentences, varied paragraph length

### Draft/Publish workflow

All content collections have `versions: { drafts: true }`. New content from AI skills enters as draft (`_status: "draft"`). Editors review in the Payload admin panel and click "Publish" to make content live. Nothing publishes automatically.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add content workflow documentation to CLAUDE.md"
```

---

## Task 9: Clean up third-party skills

**Files:**

- Various plugin/skill directories

After custom skills are working, uninstall the third-party skill plugins that were absorbed or aren't needed.

- [ ] **Step 1: Identify installed plugin packages**

```bash
ls ~/.claude/plugins/marketplaces/ 2>/dev/null
ls ~/.claude/plugins/cache/ 2>/dev/null
```

List what's installed so we know what to remove.

- [ ] **Step 2: Uninstall SEO/marketing skill packages**

The specific uninstall commands depend on how they were installed. Common patterns:

If installed via marketplace:

```bash
# Check which plugins are installed
claude plugins list
```

Then remove each one that's not in the KEEP list. The user should run these interactively since they may need confirmation:

```
! claude plugins remove <seo-plugin-name>
! claude plugins remove <marketing-plugin-name>
```

- [ ] **Step 3: Remove local skill files that are superseded**

If any third-party skills were copied into `.claude/skills/` (besides `informational-copy`), remove them.

Check:

```bash
ls -la .claude/skills/
```

Keep only: `informational-copy`, `research`, `write`, `humanize`, `seo-check`, `translate`.
Remove anything else in `.claude/skills/` that isn't ours.

- [ ] **Step 4: Also clean up `.agents/skills/` if it exists**

```bash
ls .agents/skills/ 2>/dev/null
```

If this directory has cached skill files from plugins, it can be removed after the plugins are uninstalled.

- [ ] **Step 5: Commit any cleanup**

```bash
git add -A .claude/skills/
git commit -m "chore: clean up third-party skills, keep only custom workflow skills"
```

---

## Post-Implementation: Testing the Pipeline

After all tasks are done, test the full pipeline on a real service:

```
/research "ProtonMail"
```

Verify: Research tab populated in Payload admin.

```
/write service "ProtonMail"
```

Verify: Content appears as draft in Payload admin with informational-copy tone.

```
/humanize service "ProtonMail"
```

Verify: Content reads naturally, no AI patterns.

```
/seo-check service "ProtonMail"
```

Verify: seoScore and seoNotes populated in SEO tab.

Review in admin, publish.

```
/translate service "ProtonMail" nl
```

Verify: Dutch locale fields populated.

Review Dutch version, publish.

---
name: pipeline
description: Run the full content pipeline (write + humanize + SEO check) on one or more services or guides. Use when asked to "run the pipeline", "write and polish", "full content workflow", or "write + humanize + SEO". Runs steps sequentially per item, items in parallel.
argument-hint: "'service <name>' or 'service <name1>, <name2>, ...' or 'service all' or 'guide <source> to <target>'"
---

# Content Pipeline Skill

Run write → humanize → seo-check in sequence on one or more items. When processing multiple items, each item's pipeline runs as a parallel subagent.

## What it does

For each item, the pipeline runs three steps **in order**:
1. **Write** — Generate content from research data (`/write`)
2. **Humanize** — Strip AI patterns from the written content (`/humanize`)
3. **Seo-check** — Audit and score the final content (`/seo-check`)

Each step depends on the previous one completing. But different items are independent and run in parallel.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `service ProtonMail` | Full pipeline for one service |
| `service ProtonMail, Tutanota, Mailbox.org` | Full pipeline for these services in parallel |
| `service all` | Full pipeline for all services with completed research |
| `service unwritten` | Pipeline for researched services that have no content yet |
| `guide Gmail to ProtonMail` | Full pipeline for one guide |
| `guide all` | Full pipeline for all guides |

## Process

### Step 1: Build the item list

Same query logic as the bulk skills:

**For `service all` / `service unwritten`:**
```json
mcp__payload__findServices: {"where": "{\"researchStatus\": {\"equals\": \"complete\"}}", "limit": 100, "depth": 0}
```
For `unwritten`, filter for services where `content` is null/empty.

**For specific names:** Split comma-separated list, look up each.

**For `guide all`:**
```json
mcp__payload__findGuides: {"limit": 100, "depth": 1}
```

### Step 2: Confirm with user

Show:
- Number of items
- List of names
- What will happen: "Each item gets: write → humanize → seo-check (sequential). Items run in parallel."
- Estimated scope (3 MCP updates per item)

Ask for confirmation.

### Step 3: Update pipeline status

For each service, update the `contentPipelineStatus` to "in-progress":
```json
mcp__payload__updateServices: {"contentPipelineStatus": "in-progress"}
```

### Step 4: Dispatch parallel pipeline agents

Launch one subagent per item. Each agent runs the three steps **sequentially** within itself.

**Agent prompt template for services:**

```
You are running the full content pipeline for service "{SERVICE_NAME}" on switch-to.eu.

Run these three steps IN ORDER. Each step must complete before the next starts.

## Step 1: Write (/write)

1. Fetch the service:
   mcp__payload__findServices: {"where": "{\"name\": {\"contains\": \"{SERVICE_NAME}\"}}", "limit": 1, "depth": 1}

2. Verify researchStatus is "complete". If not, return "SKIPPED: research not complete".

3. Write these fields using research data:
   - description: 1-2 sentences, under 200 chars
   - features: 4-6 short tags, 2-4 words each
   - content: 150-250 words Lexical richText JSON (opening → what's different → worth knowing h2)
   - pricingTiers: structured array from pricing research
   - For non-EU: issues array with factual privacy concerns

   Voice: knowledgeable friend. Short sentences. Active voice. No em dashes or semicolons.
   Consumer-friendly: "only you can read your emails" not "zero-access encryption".
   Always include "Worth knowing" section.

4. Save via mcp__payload__updateServices with _status: "draft".

## Step 2: Humanize (/humanize)

1. Re-fetch the service to get the just-written content.

2. Check all text fields for 18 AI patterns:
   Structural: rule of three, parallel openings, symmetric paragraphs, formulaic transitions, setup-punchline
   Word-level: inflated vocab, hedging, vague intensifiers, AI-favorite words, promotional adjectives
   Tone: excessive enthusiasm, false certainty, anthropomorphization, reader flattery, empty empathy
   Punctuation: em dashes (zero), semicolons (zero), ellipses

3. First pass: rewrite flagged text. Shorter sentences, specific details, varied length, natural contractions.

4. Second pass: audit for remaining AI feel. Fix.

5. Save changed fields via mcp__payload__updateServices.

## Step 3: SEO Check (/seo-check)

1. Re-fetch the service to get humanized content.

2. Run 10-point checklist (each: PASS 10, PARTIAL 5, FAIL 0):
   Meta Title, Meta Description, Keywords, Heading Structure, Content Length,
   Internal Context, Open Graph, Image, Readability, Freshness

3. Calculate score (max 100).

4. Save: seoScore, seoNotes, lastSeoReviewAt. Auto-populate empty metaTitle/metaDescription.

5. Update contentPipelineStatus to "complete".

## Return

Return a summary:
- Service name
- Write: word count, pricing tiers count
- Humanize: patterns found/fixed
- SEO: score and rating
- Any issues or gaps
```

**Agent prompt template for guides:**

```
You are running the full content pipeline for guide "{GUIDE_TITLE}" on switch-to.eu.

Run these three steps IN ORDER:

## Step 1: Write
Fetch both source and target services. Write: title, description, difficulty, timeRequired,
intro, beforeYouStart, steps (4-8), troubleshooting, outro, missingFeatures.
Save with _status: "draft".

## Step 2: Humanize
Re-fetch guide. Apply 18-pattern detection + two-pass rewrite on all text fields
(intro, beforeYouStart, step contents, troubleshooting, outro). Save changed fields.

## Step 3: SEO Check
Re-fetch guide. Run 10-point checklist. Save seoScore, seoNotes, lastSeoReviewAt.

Return: guide title, step count, patterns found/fixed, SEO score.
```

### Step 5: Collect and report

```
## Content Pipeline Complete

Processed: X/Y items (write → humanize → seo-check)

| Item | Type | Words | AI Patterns Fixed | SEO Score | Status |
|------|------|-------|-------------------|-----------|--------|
| ProtonMail | Service | 220 | 6 | 85/100 | Complete |
| Tutanota | Service | 195 | 3 | 78/100 | Complete |
| ... | ... | ... | ... | ... | ... |

Average SEO score: XX/100
Total AI patterns fixed: XX

Skipped (no research): [list]
Failed: [list with reasons]

Next steps:
- Review all drafts in Payload admin (/admin)
- Run /bulk-translate to localize completed content
- Publish approved content
```

## Guardrails

- **Max parallel agents:** 10 at a time. Each agent does 3 sequential steps, so they're heavier than single-skill agents.
- **Research required:** Services without completed research are skipped.
- **Sequential within each agent:** Write MUST complete before humanize. Humanize MUST complete before SEO check. This is enforced by the agent running steps in order.
- **Draft status:** Everything saves as draft. No auto-publishing.
- **Idempotent:** Running the pipeline twice on the same service overwrites the previous content. Confirm with user if content already exists.
- **Pipeline status tracking:** The `contentPipelineStatus` field on services tracks progress. Values: not-started → in-progress → complete.

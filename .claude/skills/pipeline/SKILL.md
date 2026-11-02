---
name: pipeline
description: Run the full content pipeline (write + humanize + SEO check) on one or more services, guides, or categories. Use when asked to "run the pipeline", "write and polish", "full content workflow", or "write + humanize + SEO". Runs steps sequentially per item, items in parallel.
argument-hint: "'service <name>' or 'service all' or 'guide all' or 'category all' or 'category <slug1>, <slug2>'"
---

# Content Pipeline Skill

Run write → humanize → seo-check in sequence on one or more items. When processing multiple items, each item's pipeline runs as a parallel subagent.

## What it does

For each item, the pipeline runs three steps **in order**:
1. **Write** — Generate content from research data (`/write-service`, `/write-guide`, or `/write-category`)
2. **Humanize** — Strip AI patterns from the written content (`/humanize-service`, `/humanize-guide`, or `/humanize-category`)
3. **Seo-check** — Audit and score the final content (`/seo-check-service`, `/seo-check-guide`, or `/seo-check-category`)

Each step depends on the previous one completing. But different items are independent and run in parallel.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `service ProtonMail` | Full pipeline for one service |
| `service ProtonMail, Tutanota, Mailbox.org` | Full pipeline for these services in parallel |
| `service all` | Full pipeline for all services with completed research |
| `service unwritten` | Pipeline for researched services that have no content yet |
| `service category Email` | Pipeline for all services in the Email category |
| `guide Gmail to ProtonMail` | Full pipeline for one guide |
| `guide all` | Full pipeline for all guides |
| `category all` | Full pipeline for all categories |
| `category social-media, email` | Full pipeline for these categories |

## Process

### Step 1: Build the item list

Same selection logic as the bulk skills, by grepping the content files (format: `../_shared/content-files.md`):

**For `service all`:**
```bash
grep -l '^researchStatus: complete$' content/services/*/en.md
```

**For `service unwritten`:** the `service all` list, filtered to files with an empty body:
```bash
for f in $(grep -l '^researchStatus: complete$' content/services/*/en.md); do
  [ "$(awk 'BEGIN{n=0} /^---$/{n++; next} n>=2' "$f" | wc -w)" -lt 20 ] && echo "$f"
done
```

**For `service category Email`:** `grep -l '^category: email$' content/services/*/en.md`, keep the researched ones.

**For specific names:** Split the comma-separated list, resolve each with `grep -il '^name: .*<name>' content/services/*/en.md`.

**For `guide all`:** every `content/guides/*/en.md`.

**For `category all`:** every `content/categories/*/en.md`.

### Step 2: Confirm with user

Show:
- Number of items
- List of names
- What will happen: "Each item gets: write → humanize → seo-check (sequential). Items run in parallel."
- Estimated scope (3 file edits per item)

Ask for confirmation.

### Step 3: Update pipeline status

For each item, set `contentPipelineStatus: in-progress` in the `# Workflow` group of its `en.md` (add the key if it's missing).

### Step 4: Dispatch parallel pipeline agents

Launch one subagent per item. Each agent runs the three steps **sequentially** within itself.

**Agent prompt template for services:**

```
You are running the full content pipeline for service "{SERVICE_NAME}" (slug: {SLUG}) on switch-to.eu.

Read .claude/skills/_shared/content-files.md, .claude/skills/_shared/voice.md,
.claude/skills/_shared/humanize-patterns.md and .claude/skills/_shared/seo-checklist.md first.
Edit only content/services/{SLUG}/en.md with targeted Edit calls. Keep group comments, key order and quoting rules
   from .claude/skills/_shared/content-files.md. Run its validation snippet after every save. Don't touch nl.md or git.

Run these three steps IN ORDER. Each step must complete before the next starts.

## Step 1: Write (/write)

1. Read content/services/{SLUG}/en.md in full.

2. Verify researchStatus is "complete". If not, return "SKIPPED: research not complete".

3. Write these fields using research data:
   - description: 1-2 sentences, under 200 chars
   - features: 4-6 short tags, 2-4 words each
   - body (markdown below the frontmatter): 150-250 words (opening → what's different → `## Worth knowing`)
   - pricingTiers: structured array from pricing research
   - For non-EU: issues array with factual privacy concerns

   Voice: knowledgeable friend. Short sentences. Active voice. No em dashes or semicolons.
   Consumer-friendly: "only you can read your emails" not "zero-access encryption".
   Always include "Worth knowing" section.

4. Save to the file. Existing service: no `draft` key. Bump updatedAt.
   Set contentPipelineStatus: written.

## Step 2: Humanize (/humanize)

1. Re-read the file to get the just-written content.

2. Check all text fields for 18 AI patterns:
   Structural: rule of three, parallel openings, symmetric paragraphs, formulaic transitions, setup-punchline
   Word-level: inflated vocab, hedging, vague intensifiers, AI-favorite words, promotional adjectives
   Tone: excessive enthusiasm, false certainty, anthropomorphization, reader flattery, empty empathy
   Punctuation: em dashes (zero), semicolons (zero), ellipses

3. First pass: rewrite flagged text. Shorter sentences, specific details, varied length, natural contractions.

4. Second pass: audit for remaining AI feel. Fix.

5. Save changed fields to the file. Set contentPipelineStatus: humanized.

## Step 3: SEO Check (/seo-check)

1. Re-read the file to get the humanized content.

2. Run 10-point checklist (each: PASS 10, PARTIAL 5, FAIL 0):
   Meta Title, Meta Description, Keywords, Heading Structure, Content Length,
   Internal Context, Open Graph, Image, Readability, Freshness

3. Calculate score (max 100).

4. Save in the file: seoScore, seoNotes (|- block scalar), lastSeoReviewAt ('YYYY-MM-DD') in `# Workflow`.
   Auto-populate empty metaTitle/metaDescription in `# SEO`.

5. Set contentPipelineStatus: seo-checked.

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

Read .claude/skills/write-guide/SKILL.md, .claude/skills/humanize-guide/SKILL.md,
.claude/skills/seo-check-guide/SKILL.md and .claude/skills/_shared/content-files.md first.
Edit only content/guides/{GUIDE_SLUG}/en.md. Keep the section/step markers exact. Run the validation
snippet after every save. Don't touch nl.md or git.

## Step 1: Write
Read both source and target service files. Write: title, description, difficulty, timeRequired,
missingFeatures (frontmatter) and the body sections intro, beforeYouStart, steps (4-8), troubleshooting, outro.
New guide: `draft: true` as first key of `# Workflow`. Existing guide: no draft key, keep step-meta video keys.
Set contentPipelineStatus: written.

## Step 2: Humanize
Re-read the guide. Apply 18-pattern detection + two-pass rewrite on all text
(intro, beforeYouStart, step markdown and titles, troubleshooting, outro). Save changed text.
Set contentPipelineStatus: humanized.

## Step 3: SEO Check
Re-read the guide. Run 10-point checklist. Save seoScore, seoNotes, lastSeoReviewAt in `# Workflow`.
Set contentPipelineStatus: seo-checked.

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
- Review the changes in `git diff` and open a PR
- Run /bulk-translate to localize completed content
- Publish by merging the PR (and removing `draft: true` from any new items you approve)
```

## Guardrails

- **Max parallel agents:** 10 at a time. Each agent does 3 sequential steps, so they're heavier than single-skill agents.
- **Research required:** Services without completed research are skipped.
- **Sequential within each agent:** Write MUST complete before humanize. Humanize MUST complete before SEO check. This is enforced by the agent running steps in order.
- **Review gate:** Nothing publishes automatically. New items get `draft: true`. Edits to existing items go live only when the PR merges. Don't commit unless the user asks.
- **Idempotent:** Running the pipeline twice on the same service overwrites the previous content. Confirm with user if content already exists.
- **Pipeline status tracking:** The `contentPipelineStatus` frontmatter field tracks progress. Values: not-started → in-progress → written → humanized → seo-checked → translated → complete. The pipeline ends at `seo-checked`. `/translate` and human review take it further.

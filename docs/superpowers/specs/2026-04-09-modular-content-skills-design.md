# Modular Content Skills Architecture

**Date:** 2026-04-09
**Status:** Approved

## Problem

The current `/write`, `/humanize`, and `/seo-check` skills are hardwired to services and guides. Adding new content types (categories, pages, landing pages) means editing monolithic skill files and growing them indefinitely. Bulk skills inconsistently support category filtering.

## Design

Split each action skill into per-type skills with shared reference docs. Bulk skills stay generic and dispatch to the right per-type skill.

### File structure

```
.claude/skills/
  _shared/
    voice.md                    # Writing voice, consumer-friendly rewrites, rhythm, honesty
    humanize-patterns.md        # 18 AI patterns, two-pass process, verification checklist
    seo-checklist.md            # 10-point scoring, rating thresholds, note format
    lexical-json.md             # Lexical richText JSON format reference

  write-service/SKILL.md        # /write-service <name>
  write-guide/SKILL.md          # /write-guide <source> to <target>
  write-category/SKILL.md       # /write-category <slug>

  humanize-service/SKILL.md     # /humanize-service <name>
  humanize-guide/SKILL.md       # /humanize-guide <slug>
  humanize-category/SKILL.md    # /humanize-category <slug>

  seo-check-service/SKILL.md    # /seo-check-service <name>
  seo-check-guide/SKILL.md      # /seo-check-guide <slug>
  seo-check-category/SKILL.md   # /seo-check-category <slug>

  bulk-write/SKILL.md           # Generic dispatcher: service/guide/category all|names|category
  bulk-humanize/SKILL.md        # Generic dispatcher
  bulk-seo-check/SKILL.md       # Generic dispatcher
  pipeline/SKILL.md             # Generic: write-{type} → humanize-{type} → seo-check-{type}

  # Unchanged
  research/SKILL.md
  translate/SKILL.md
  bulk-research/SKILL.md
  bulk-translate/SKILL.md
  informational-copy/SKILL.md
```

### Shared reference docs

These are not invocable skills. Per-type skills reference them with "Read `_shared/voice.md` before writing."

**`_shared/voice.md`** — Extracted from current `/write`:
- Writing voice: knowledgeable friend, not marketing
- Consumer-friendly rewrite table (technical term → plain language)
- Sentence rhythm: vary paragraph length, short then long then short
- Honesty patterns: specifics over adjectives, neutral framing
- Banned punctuation: no em dashes, no semicolons, no exclamation marks
- Address reader as "you"/"your", active voice, no jargon without explanation

**`_shared/humanize-patterns.md`** — Extracted from current `/humanize`:
- 18 AI pattern categories (structural, word-level, tone, punctuation)
- Two-pass process: rewrite flagged text, then audit the rewrite
- Verification checklist (no em dashes, no semicolons, no banned words, varied sentence length, contractions, no parallel openings, at least one trade-off)

**`_shared/seo-checklist.md`** — Extracted from current `/seo-check`:
- 10-point scoring: Meta Title, Meta Description, Keywords, Heading Structure, Content Length, Internal Context, Open Graph, Image, Readability, Freshness
- Each scored PASS (10), PARTIAL (5), FAIL (0). Max 100.
- Rating: Excellent 90-100, Good 70-89, Needs work 50-69, Major issues <50
- Note generation format
- Fields to save: seoScore, seoNotes, lastSeoReviewAt

**`_shared/lexical-json.md`** — Extracted from current `/write`:
- Root node structure
- Paragraph, heading, text node formats
- Bold (format: 1), italic (format: 2)

### Per-type write skills

**`write-service/SKILL.md`**
- Invocation: `/write-service ProtonMail`
- References: `_shared/voice.md`, `_shared/lexical-json.md`
- Prerequisite: researchStatus must be "complete"
- Fields to write:
  - `description`: 1-2 sentences, under 200 chars, lead with reader benefit
  - `features`: 4-6 short tags, 2-4 words each
  - `content`: 150-250 words richText (opening, what's different, optional extras, "Worth knowing" h2)
  - `pricingTiers`: structured array from research pricing
  - `gdprNotes`: 2-4 consumer-friendly sentences from research
  - `issues` (non-EU only): factual privacy concerns
- Page structure awareness: overview tab gets features + content, pricing tab gets pricingTiers, security tab gets research fields + gdprNotes
- Do NOT include in content: pricing details, security details, license names, certificate names
- MCP: `findServices`, `updateServices`/`createServices`, save as draft

**`write-guide/SKILL.md`**
- Invocation: `/write-guide Gmail to ProtonMail`
- References: `_shared/voice.md`, `_shared/lexical-json.md`
- Prerequisite: both source and target services must have research complete
- Fields to write:
  - `title`: "Switching from [Source] to [Target]"
  - `description`: 1-2 sentences, what target does + time estimate
  - `difficulty`: beginner/intermediate/advanced
  - `timeRequired`: realistic estimate
  - `intro`: 100-150 words richText, why someone would switch
  - `beforeYouStart`: 50-100 words richText, what people wish they'd known
  - `steps`: 4-8 ordered steps, each with title (verb-first) + content (2-3 sentences richText)
  - `troubleshooting`: 3-5 Q&A pairs, 100-200 words richText
  - `outro`: what to do after switching, 50-100 words richText
  - `missingFeatures`: features source has that target doesn't
- MCP: `findServices` (×2), `findGuides`, `updateGuides`/`createGuides`, save as draft

**`write-category/SKILL.md`**
- Invocation: `/write-category social-media`
- References: `_shared/voice.md`, `_shared/lexical-json.md`
- Fields to write:
  - `description`: 1 sentence subtitle. What makes EU alternatives different in this space. Under 150 chars.
  - `content`: 2-3 sentences richText. Brief context about what the services in this category do and why EU matters here. No "Worth knowing" section. No essay.
- MCP: `findCategories`, `updateCategories`, save as draft

### Per-type humanize skills

All reference `_shared/humanize-patterns.md`. Same two-pass process. Different fields.

**`humanize-service/SKILL.md`**
- Fields: `description`, `content`, `features`, `issues`, `gdprNotes`
- MCP: `findServices`, `updateServices`

**`humanize-guide/SKILL.md`**
- Fields: `intro`, `beforeYouStart`, `steps[].content`, `troubleshooting`, `outro`
- MCP: `findGuides`, `updateGuides`

**`humanize-category/SKILL.md`**
- Fields: `description`, `content`
- MCP: `findCategories`, `updateCategories`

### Per-type SEO check skills

All reference `_shared/seo-checklist.md`. Different field mapping and content thresholds.

**`seo-check-service/SKILL.md`**
- Content length threshold: description 50-200 chars AND content 300+ words
- Internal context: category set, features 3+, tags 2+
- Image: screenshot or logo present
- Includes subpage audit (pricing, security, comparison metadata)
- MCP: `findServices`, `updateServices`

**`seo-check-guide/SKILL.md`**
- Content length threshold: intro + steps + troubleshooting total 500+ words
- Internal context: sourceService and targetService set, difficulty set
- Image: N/A (partial)
- No subpage audit
- MCP: `findGuides`, `updateGuides`

**`seo-check-category/SKILL.md`**
- Content length threshold: description present AND content 30+ words
- Internal context: icon set, slug set
- Image: N/A
- No subpage audit
- MCP: `findCategories`, `updateCategories`

### Bulk skills (updated)

**`bulk-write/SKILL.md`** — Argument routing:
- `service all|unwritten|category <name>|<name1>, <name2>` → dispatches `write-service` per item
- `guide all|<source> to <target>` → dispatches `write-guide` per item
- `category all|<slug1>, <slug2>` → dispatches `write-category` per item

Same routing pattern for **`bulk-humanize/`** and **`bulk-seo-check/`**.

**`pipeline/SKILL.md`** — Same routing. Per item runs: `write-{type}` → `humanize-{type}` → `seo-check-{type}` sequentially. Items in parallel.

### Unchanged skills

- `research/SKILL.md` — Service-only, no changes needed
- `translate/SKILL.md` — Already works generically on any collection's localized fields
- `bulk-research/SKILL.md` — Service-only, no changes needed
- `bulk-translate/SKILL.md` — Already generic
- `informational-copy/SKILL.md` — Tone reference, no changes needed

### Migration

1. Create `_shared/` reference docs by extracting from current skills
2. Create per-type skills (9 new: 3 write + 3 humanize + 3 seo-check)
3. Update bulk skills to add type routing and `category` argument support
4. Update `pipeline/SKILL.md` with type routing
5. Delete old `write/SKILL.md`, `humanize/SKILL.md`, `seo-check/SKILL.md`
6. Update CLAUDE.md skill table

### Adding a new content type in the future

1. Create `write-{type}/SKILL.md` — define fields, MCP tools, content rules
2. Create `humanize-{type}/SKILL.md` — list fields to check
3. Create `seo-check-{type}/SKILL.md` — set thresholds
4. Add type to bulk skill argument tables
5. Add type to pipeline routing

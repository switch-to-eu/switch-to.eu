---
name: bulk-write
description: Write content for multiple services, guides, or categories in parallel using subagents. Use when asked to "write all services", "bulk write", "write content for these services", "write all categories", or need to write content for many items at once.
argument-hint: "'service all' or 'guide all' or 'category all' or 'service <name1>, <name2>' or 'category <slug1>, <slug2>'"
---

# Bulk Write Skill

Write content for multiple services, guides, or categories in parallel by dispatching one subagent per item. Routes to the appropriate per-type skill: `/write-service`, `/write-guide`, or `/write-category`.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota` | Write content for these specific services |
| `service all` | Write content for every service that has research completed |
| `service unwritten` | Write content for services with research done but no content yet |
| `service category Email` | Write content for all services in the Email category |
| `guide all` | Write all guides that have both source and target services researched |
| `category all` | Write content for all categories |
| `category social-media, email` | Write content for these specific categories |

## Process

### Step 1: Build the item list

Grep the frontmatter of the content files (format: `../_shared/content-files.md`). The slug is the directory name.

**For `service all`** — every service with research complete:
```bash
grep -l '^researchStatus: complete$' content/services/*/en.md
```

**For `service unwritten`** — research complete but no body content yet:
```bash
for f in $(grep -l '^researchStatus: complete$' content/services/*/en.md); do
  words=$(awk 'BEGIN{n=0} /^---$/{n++; next} n>=2' "$f" | wc -w)
  [ "$words" -lt 20 ] && echo "$f"
done
```

**For `service category Email`:** `grep -l '^category: email$' content/services/*/en.md`, then keep the researched ones.

**For `guide all`:** list `content/guides/*/en.md`, read each `sourceService` / `targetService`, and keep guides where both `content/services/<slug>/en.md` files have `researchStatus: complete`.

**For `category all`:** `ls content/categories`.

### Step 2: Confirm with user

Show the list and count. Ask for confirmation. Note any services that lack research (these will be skipped with a warning).

### Step 3: Dispatch parallel write agents

Use the **Agent tool** to launch one subagent per item. All agents run in parallel.

**Agent prompt template for services:**

```
You are writing content for the service "{SERVICE_NAME}" (slug: {SLUG}) on switch-to.eu.

Use the /write skill for service content. Here is the process:

Read .claude/skills/write-service/SKILL.md, .claude/skills/_shared/voice.md, .claude/skills/_shared/evidence.md and .claude/skills/_shared/content-files.md first.

1. Read content/services/{SLUG}/en.md in full (frontmatter with research fields + body).

2. Check that researchStatus is "complete". If not, return "SKIPPED: research not complete".

3. Write these fields using the research data:
   - description: 1-2 sentences, under 200 chars. What it is, where it's based, what matters.
   - features: 4-6 short tags, 2-4 words each (pills on overview page)
   - body (markdown below the frontmatter): 150-250 words. Opening → what's different → optional extras → `## Worth knowing`
   - pricingTiers: structured array from research pricing data
   - For non-EU services: issues array with factual privacy concerns

   Voice: knowledgeable friend, not marketing. Short sentences. Active voice. No em dashes, semicolons, jargon.
   Consumer-friendly language: "only you can read your emails" not "zero-access encryption".
   Always include "Worth knowing" section with honest trade-offs.

4. Save by editing content/services/{SLUG}/en.md: listing fields in `# Listing`, issues in `# Non-EU page`,
   body below the closing `---`. Keep group comments, key order and quoting rules. Bump updatedAt.
   Don't add `draft: true` to an existing service. Run the validation snippet from content-files.md.
   Only edit this one file. Don't touch nl.md, other files, or git.

Return: service name, word count, number of pricing tiers written, any issues.
```

**Agent prompt template for guides:**

```
You are writing a migration guide for switching from "{SOURCE}" to "{TARGET}" on switch-to.eu.

Use the /write skill for guide content. Process:

Read .claude/skills/write-guide/SKILL.md, .claude/skills/_shared/voice.md, .claude/skills/_shared/evidence.md and .claude/skills/_shared/content-files.md first.

1. Read both service files (content/services/{SOURCE_SLUG}/en.md, content/services/{TARGET_SLUG}/en.md)
   and the guide file content/guides/{GUIDE_SLUG}/en.md if it exists.
2. Write: title, description, difficulty, timeRequired, missingFeatures (frontmatter), and the body sections
   intro, beforeYouStart, steps (4-8 steps, each with step-start/step-meta title/step-end markers),
   troubleshooting, outro, using the exact markers from content-files.md.
3. Save content/guides/{GUIDE_SLUG}/en.md. New guide: add `draft: true` as the first key of `# Workflow`.
   Existing guide: no draft key, keep existing step-meta video keys. Bump updatedAt. Run the validation snippet.
   Only edit this one file.

Return: guide title, step count, difficulty, any issues.
```

### Step 4: Collect and report

```
## Bulk Write Complete

Written: X/Y items

| Item | Type | Words | Status | Notes |
|------|------|-------|--------|-------|
| ProtonMail | Service | 220 | Done | 5 pricing tiers |
| Gmail to ProtonMail | Guide | 650 | Done | 6 steps, beginner |
| ... | ... | ... | ... | ... |

Skipped (no research): [list]
Failed: [list with reasons]
```

## Guardrails

- **Max parallel agents:** 10 at a time. Batch larger sets.
- **Research required:** Skip services without completed research. Report them.
- **Review gate:** Nothing publishes automatically. New items get `draft: true`. Edits to existing items are reviewed in `git diff` / the PR before merge. Don't commit unless the user asks.
- **No overwrites without confirmation:** If content already exists, ask the user before overwriting.

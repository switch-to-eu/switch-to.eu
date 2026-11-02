---
name: bulk-seo-check
description: Run SEO audits on multiple services, guides, categories, or pages in parallel. Use when asked to "SEO check all", "bulk SEO", "audit all services", "SEO check all categories", or score SEO across many items at once.
argument-hint: "'service all' or 'guide all' or 'category all' or 'service <name1>, <name2>' or 'below <score>'"
---

# Bulk SEO Check Skill

Run SEO audits on multiple items in parallel by dispatching one subagent per item.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota` | SEO check these specific services |
| `service all` | SEO check all services |
| `service category Email` | SEO check all services in the Email category |
| `guide all` | SEO check all guides |
| `service below 70` | Re-check services with seoScore below 70 |
| `service unchecked` | Check services never SEO-reviewed |
| `category all` | SEO check all categories |
| `category social-media, email` | SEO check these specific categories |
| `all` | Check everything (services + guides + categories + pages) |

## Process

### Step 1: Build the item list

Grep the frontmatter of the content files (format: `../_shared/content-files.md`). The slug is the directory name.

**For `service unchecked`** (never reviewed):
```bash
grep -L '^lastSeoReviewAt:' content/services/*/en.md
```

**For `service below 70`:**
```bash
grep -H '^seoScore:' content/services/*/en.md | awk '$2 < 70 {split($1, a, ":"); print a[1]}'
```
Services with no `seoScore` at all count as below any threshold: add `grep -L '^seoScore:' content/services/*/en.md`.

**For `service category Email`:** `grep -l '^category: email$' content/services/*/en.md`.

**For `all`:** list `content/services/*/en.md`, `content/guides/*/en.md`, `content/categories/*/en.md`, `content/pages/*/en.md` and `content/landing-pages/*/en.md`. Combine the lists.

### Step 2: Confirm with user

Show count and list. Ask for confirmation.

### Step 3: Dispatch parallel SEO audit agents

**Agent prompt template:**

```
You are running an SEO audit on {TYPE} "{ITEM_NAME}" for switch-to.eu.

Use the /seo-check skill. Process:

Read .claude/skills/seo-check-{TYPE}/SKILL.md (or seo-check/SKILL.md for pages and landing pages),
.claude/skills/_shared/seo-checklist.md and .claude/skills/_shared/content-files.md first.

1. Read the item's file in full: {FILE_PATH}

2. Run the 10-point SEO checklist. Score each PASS (10), PARTIAL (5), FAIL (0):
   1. Meta Title: present, 40-60 chars, contains keyword
   2. Meta Description: present, 150-160 chars, value proposition
   3. Keywords: 3-8 relevant keywords defined
   4. Heading Structure: proper hierarchy, keyword in H2
   5. Content Length: per-type threshold from the seo-check-{TYPE} skill (service body 300+ words, guide 500+ words)
   6. Internal Context: per-type rule from the seo-check-{TYPE} skill (services: category set, features 3+, tags 2+)
   7. Open Graph: ogTitle + ogDescription present and correct length
   8. Image: screenshot present (services)
   9. Readability: short paragraphs, active voice, Flesch 60+
   10. Freshness: reviewed within 90 days

3. Calculate total score (max 100).

4. Save by editing {FILE_PATH} (targeted Edit calls, keep group comments and key order):
   - seoScore: [number]                        (# Workflow group)
   - seoNotes: [formatted summary with PASS/ISSUES/suggestions, as a |- block scalar]   (# Workflow group)
   - lastSeoReviewAt: '[today YYYY-MM-DD]'     (# Workflow group)
   - If metaTitle or metaDescription empty, populate with suggestions (# SEO group)
   Don't add or remove `draft`. Run the validation snippet. Only edit this one file. Don't touch git.

Return: item name, score, rating, top 3 issues.
```

### Step 4: Collect and report

```
## Bulk SEO Audit Complete

Audited: X/Y items
Average score: XX/100

| Item | Type | Score | Rating | Top Issue |
|------|------|-------|--------|-----------|
| ProtonMail | Service | 85 | Good | Missing ogDescription |
| Gmail | Service | 45 | Major issues | No meta fields |
| ... | ... | ... | ... | ... |

Score distribution:
- Excellent (90-100): X items
- Good (70-89): X items
- Needs work (50-69): X items
- Major issues (<50): X items

Priority fixes (items scoring below 50):
1. [item]: [what to fix]
```

## Guardrails

- **Max parallel agents:** 10 at a time.
- **Lightweight agents:** SEO checks only read and edit local files, so they're fast. Can batch 10 comfortably.
- **Review gate:** Changes sit in the working tree for review in `git diff`. Don't commit unless the user asks.
- **Auto-populate:** Empty metaTitle and metaDescription get filled with suggestions.

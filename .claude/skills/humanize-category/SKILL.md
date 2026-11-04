---
name: humanize-category
description: Strip AI writing patterns from a category page in content/categories/<slug>/en.md. Use when asked to "humanize category", "de-AI category social-media", "make category content sound human".
argument-hint: "'<category slug>'"
---

# Humanize Category Content

Remove AI writing patterns from a category page in `content/categories/<slug>/en.md`. Two-pass process: rewrite, then audit.

**Before starting, read:** `.claude/skills/_shared/humanize-patterns.md` for the 18 AI patterns and two-pass process, and `.claude/skills/_shared/content-files.md` for the file format.

## Fields to check

- `description` (frontmatter)
- the markdown body

## Process

### Step 1: Fetch the category

Read `content/categories/CATEGORY_SLUG/en.md`.

### Step 2: First pass — Rewrite

Apply the pattern detection from `_shared/humanize-patterns.md` to both.

The `description` is a single sentence (under 150 chars). Check for inflated vocabulary and vague claims. The body is 2-3 sentences. Check for all 18 patterns.

### Step 3: Second pass — Audit

Re-read the rewritten version. Fix remaining AI patterns per the audit checklist in `_shared/humanize-patterns.md`.

### Step 4: Save

Edit `content/categories/CATEGORY_SLUG/en.md`. Only update fields that changed. Only change the text that needs it. Keep frontmatter group comments, key order and quoting rules from `_shared/content-files.md`. Bump `updatedAt` and run the validation snippet. Don't add or remove `draft`.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns

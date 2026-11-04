---
name: humanize
description: Strip AI writing patterns from site content in content/ (markdown files). Use when asked to "humanize", "de-AI", "make this sound human", "clean up the writing", or review content for AI patterns. Runs a two-pass rewrite on the content file.
argument-hint: "'service <name>' or 'guide <slug>'"
---

# Humanize Skill

Remove AI writing patterns from content in `content/` (see `.claude/skills/_shared/content-files.md`). Two-pass process: rewrite, then audit.

## Rules

Read `.claude/skills/_shared/voice.md` and `.claude/skills/_shared/humanize-patterns.md` first. They hold the voice, the 18 patterns, the passes and the checklist.

## Process

### Step 1: Fetch the content

For services: find the file with `grep -il '^name: .*NAME' content/services/*/en.md` and read it. Check `description`, `features`, `issues` (frontmatter) and the markdown body.
For guides: read `content/guides/<slug>/en.md`. Check the `intro`, `beforeYouStart`, `steps` (each step's markdown and step-meta `title`), `troubleshooting` and `outro` sections of the body.

### Step 2: Run the passes

Run the rewrite, audit and fact comparison passes from `_shared/humanize-patterns.md` on every text field.

All passes follow the **Evidence guard** in `_shared/humanize-patterns.md`: change the style, never the facts. Keep "not listed" hedges, attributions, numbers and dates. An opinion from us rests on a fact already in the text or the research fields.

### Step 4: Save back to the file

Edit the `en.md` with targeted Edit calls. Only update the text fields that changed. For guides, keep every section and step marker exactly as it was. Only change the text that needs it. Keep frontmatter group comments, key order and quoting rules from `_shared/content-files.md`. Bump `updatedAt` and run the validation snippet. Don't add or remove `draft`.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns

## Verification

Use the checklist in `_shared/humanize-patterns.md`.

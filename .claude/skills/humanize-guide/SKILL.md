---
name: humanize-guide
description: Strip AI writing patterns from a migration guide in content/guides/<slug>/en.md. Use when asked to "humanize guide", "de-AI guide gmail-to-protonmail", "make guide sound human".
argument-hint: "'<guide slug>'"
---

# Humanize Guide Content

Remove AI writing patterns from a migration guide in `content/guides/<slug>/en.md`. Two-pass process: rewrite, then audit.

**Before starting, read:** `.claude/skills/_shared/humanize-patterns.md` for the 18 AI patterns and two-pass process, and `.claude/skills/_shared/content-files.md` for the guide section/step markers.

## Fields to check

Body sections (between the `<!-- section:... -->` / `<!-- end-section -->` markers):
- `intro`
- `beforeYouStart`
- `steps` (each step's markdown, plus the `title` in its step-meta)
- `troubleshooting`
- `outro`

## Process

### Step 1: Fetch the guide

Read `content/guides/GUIDE_SLUG/en.md` in full.

### Step 2: First pass — Rewrite

Apply the pattern detection from `_shared/humanize-patterns.md` to every field listed above.

For `steps`: check each step's markdown individually. Steps should start with an action verb and be 2-3 sentences. Fix any that read like marketing copy.

For `troubleshooting`: Q&A pairs should be direct. No "Great question!" or setup language.

### Step 3: Second pass — Audit

Re-read the rewritten version. Fix remaining AI patterns per the audit checklist in `_shared/humanize-patterns.md`.

### Step 4: Save

Edit `content/guides/GUIDE_SLUG/en.md`. Only update text that changed. Keep every section marker, `step-start` / `step-end` marker and step-meta key (`video`, `videoOrientation`, `complete`) exactly as it was. Only change the text that needs it. Keep frontmatter group comments, key order and quoting rules from `_shared/content-files.md`. Bump `updatedAt` and run the validation snippet. Don't add or remove `draft`.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns

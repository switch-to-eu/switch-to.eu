---
name: write-guide
description: Write or rewrite a migration guide on switch-to.eu using research data from the service content files. Use when asked to "write a guide", "write guide Gmail to ProtonMail", "draft a migration guide".
argument-hint: "'<source> to <target>'"
---

# Write Guide Content

Write a migration guide for switch-to.eu using the research data in `content/services/<slug>/en.md`. The guide lives in `content/guides/<slug>/en.md`.

**Before writing, read:** `.claude/skills/_shared/voice.md` for tone and writing rules, `.claude/skills/_shared/content-files.md` for the file layout, guide section/step markers, frontmatter editing rules and draft handling, `.claude/skills/_shared/evidence.md` for what counts as proof.

## Process

### Step 0 (optional): Knowledge context

```bash
pnpm -s knowledge context services/<target-slug> --budget 3000 2>/dev/null
```

A short, cited brief: the guides that already use the service, its alternatives, the owner company and its other services, recent news and open flags. Run it for the source service too if you need it. `pnpm -s knowledge resolve "NAME" 2>/dev/null` gives a slug. It is not a source: every fact in the guide still comes from the research fields and the vendors' help pages (`_shared/evidence.md`). An open flag on either service means its research may be out of date: tell the user and suggest `/research` first.

### Step 1: Pull research for both services

Find and read the source (non-EU) and target (EU) service files (`grep -il '^name: .*NAME' content/services/*/en.md`). Note both slugs.

### Step 2: Check if guide exists

```bash
grep -l '^sourceService: SOURCE_SLUG$' content/guides/*/en.md | xargs -r grep -l '^targetService: TARGET_SLUG$'
```

If it exists, read the whole `en.md`. If not, the new guide goes to `content/guides/<source-slug>-to-<target-slug>/en.md`.

### Step 3: Write the guide sections

**`title`**: "Switching from [Source] to [Target]"

**`description`**: 1-2 sentences. What the target does and time estimate for the switch.

**`difficulty`**: beginner, intermediate, or advanced based on technical complexity.

**`timeRequired`**: Realistic estimate (e.g. "30 minutes" or "1-2 hours").

**`intro`** section (markdown): 100-150 words. Why someone would switch. State facts, not opinions.

**`beforeYouStart`** section (markdown): 50-100 words. The thing people wish they'd known before starting.

**`steps`** section: 4-8 ordered steps, each wrapped in `<!-- step-start -->` / `<!-- step-end -->` with a `step-meta` block:
- `title` (in step-meta): Action-first ("Create your ProtonMail account", not "Account Creation")
- Step markdown below the step-meta: 2-3 sentences. Action first, context second.
- `complete: false` (in step-meta)
- Keep existing `video` / `videoOrientation` keys when rewriting a step that has them. Don't invent video URLs.

Step writing rules:
- Start with the verb
- One action per step
- Include specific UI paths ("Go to Settings > Import/Export")
- Note time estimates for longer steps

**`troubleshooting`** section (markdown): 3-5 common issues as Q&A pairs. 100-200 words.

**`outro`** section (markdown): What to do after switching. 50-100 words.

**`missingFeatures`** array: Features the source has that the target doesn't. Be honest. List a feature only when the target's docs or research confirm it's missing. If it's only absent from a pricing page, put "check that X works for you" in `beforeYouStart` instead.

Import limits, menu paths and export formats change. Take them from the vendors' current help pages, not from memory, and add each page to the target service's `sourceUrls` with `checkedAt`.

### Step 4: Save

Write `content/guides/<slug>/en.md`:
- Frontmatter: `title`, `description`, `category` (category slug), `sourceService`, `targetService` (service slugs), `difficulty`, `timeRequired`, `missingFeatures`, then the `# Workflow` group with `updatedAt`.
- Body: the five sections with the exact markers from `_shared/content-files.md` (intro, beforeYouStart, steps, troubleshooting, outro).
- Run the validation snippet.

- **Existing guide:** edit in place, no `draft` key. Keep frontmatter keys you didn't change.
- **New guide:** add `draft: true` as the first key of `# Workflow`. Also set `date: '<today>'` and `author: Switch-to.EU Team`.

Don't touch `nl.md`. `/translate` updates it.

## Self-check before saving

1. Would your non-technical friend understand every step?
2. Does every step start with an action verb?
3. Did you include specific UI paths (Settings > Import/Export)?
4. Did you list missing features honestly, and does research confirm each one (`_shared/evidence.md`)?
5. Is the time estimate realistic?

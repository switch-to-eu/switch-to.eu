---
name: bulk-humanize
description: Strip AI writing patterns from multiple services, guides, or categories in parallel. Use when asked to "humanize all", "bulk humanize", "de-AI all content", "humanize all categories", or clean up writing across many items at once.
argument-hint: "'service all' or 'guide all' or 'category all' or 'service <name1>, <name2>' or 'category <slug1>, <slug2>'"
---

# Bulk Humanize Skill

Humanize content for multiple services, guides, or categories in parallel by dispatching one subagent per item. Routes to the appropriate per-type skill: `/humanize-service`, `/humanize-guide`, or `/humanize-category`.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota` | Humanize these specific services |
| `service all` | Humanize all services that have content |
| `service category Email` | Humanize all services in the Email category |
| `guide all` | Humanize all guides that have content |
| `guide gmail-to-protonmail, outlook-to-tutanota` | Humanize specific guides by slug |
| `category all` | Humanize all categories that have content |
| `category social-media, email` | Humanize these specific categories |

## Process

### Step 1: Build the item list

Use the content files (format: `../_shared/content-files.md`). The slug is the directory name. "Has content" means the markdown body below the frontmatter isn't empty:

```bash
body_words() { awk 'BEGIN{n=0} /^---$/{n++; next} n>=2' "$1" | wc -w; }
```

**For `service all`:** every `content/services/*/en.md` with `body_words` > 20.

**For `service category Email`:** `grep -l '^category: email$' content/services/*/en.md`, same body filter.

**For `guide all`:** every `content/guides/*/en.md` whose `<!-- section:intro -->` section has text.

**For `category all`:** every `content/categories/*/en.md` with a non-empty body.

### Step 2: Confirm with user

Show the list and count. Ask for confirmation.

### Step 3: Dispatch parallel humanize agents

**Agent prompt template for services:**

```
You are humanizing the content for service "{SERVICE_NAME}" (slug: {SLUG}) on switch-to.eu.

Use the /humanize skill. Process:

Read .claude/skills/humanize-service/SKILL.md and .claude/skills/_shared/humanize-patterns.md first.

1. Read content/services/{SLUG}/en.md in full.
   Work on: description, features, issues, gdprNotes (frontmatter) and the markdown body.

2. Run the AI Pattern Detection on all text fields. Check for these 18 patterns:

   Structural: rule of three lists, parallel sentence openings, symmetric paragraphs, formulaic transitions, setup-punchline
   Word-level: inflated vocab (utilize→use, leverage→use, comprehensive→[specifics]), hedging clusters, vague intensifiers, AI-favorite words (delve, landscape, paradigm, ecosystem, seamless, cutting-edge), promotional adjectives
   Tone: excessive enthusiasm, false certainty, anthropomorphization, reader flattery, empty empathy
   Punctuation: em dashes (zero allowed), semicolons (zero allowed), ellipses for drama

3. First pass: Rewrite all flagged text. Shorter sentences. Specific details. Varied sentence length. Natural contractions.

4. Second pass: Audit the rewrite. Fix remaining AI-sounding patterns. Add one short paragraph if all paragraphs are same length. Vary sentence structure.

5. Save changed fields with targeted Edit calls. Only edit this one file (en.md). Keep frontmatter group comments, key order and quoting rules
   (see .claude/skills/_shared/content-files.md). Bump updatedAt. Don't add or remove `draft`.
   Run the validation snippet. Don't touch nl.md, other files, or git.

Return: service name, patterns found count by category, fields updated.
```

**Agent prompt template for guides:**

```
You are humanizing the guide "{GUIDE_SLUG}" on switch-to.eu.

Use the /humanize skill. Same 18-pattern detection and two-pass rewrite process.

Read .claude/skills/humanize-guide/SKILL.md and .claude/skills/_shared/humanize-patterns.md first.

1. Read content/guides/{GUIDE_SLUG}/en.md in full.
   Work on the body sections: intro, beforeYouStart, steps (each step's markdown + step-meta title), troubleshooting, outro.

2. Apply pattern detection and two-pass rewrite to every text field.

3. Save changed text with targeted Edit calls. Keep every section/step marker and step-meta key exactly.
   Only edit this one file (en.md). Keep frontmatter group comments, key order and quoting rules
   (see .claude/skills/_shared/content-files.md). Bump updatedAt. Don't add or remove `draft`.
   Run the validation snippet. Don't touch nl.md, other files, or git.

Return: guide slug, patterns found count by category, fields updated.
```

### Step 4: Collect and report

```
## Bulk Humanize Complete

Humanized: X/Y items

| Item | Patterns Found | Patterns Fixed | Remaining |
|------|---------------|----------------|-----------|
| ProtonMail | 8 | 8 | 0 |
| Tutanota | 5 | 4 | 1 (review manually) |
| ... | ... | ... | ... |

Most common patterns across all items:
1. [pattern] — found X times
2. [pattern] — found X times
```

## Guardrails

- **Max parallel agents:** 10 at a time.
- **Content required:** Skip items without content. Report them.
- **Only update changed fields.** Don't edit a field if it didn't change. Each agent edits only its own file.
- **Review gate:** Changes sit in the working tree for review in `git diff` / the PR. Don't commit unless the user asks.

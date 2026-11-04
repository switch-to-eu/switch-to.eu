---
name: bulk-translate
description: Translate multiple services or guides to another locale in parallel. Use when asked to "translate all", "bulk translate", "localize everything to Dutch", or translate many items at once.
argument-hint: "'service all <locale>' or 'guide all <locale>' or 'service <name1>, <name2> <locale>' or 'untranslated <locale>'"
---

# Bulk Translate Skill

Translate multiple items to a target locale in parallel by dispatching one subagent per item.

## Argument parsing

The last word is always the target locale (e.g. `nl`).

| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota nl` | Translate these services to Dutch |
| `service all nl` | Translate all services to Dutch |
| `guide all nl` | Translate all guides to Dutch |
| `service untranslated nl` | Translate services missing Dutch content |
| `all nl` | Translate all services + guides to Dutch |

## Process

### Step 1: Build the item list

Use the content files (format: `../_shared/content-files.md`). The slug is the directory name.

**For `service untranslated nl`:** services with no `nl.md`, or whose `nl.md` is older than the English content (en.md changed after the last translation):
```bash
for d in content/services/*/; do
  if [ ! -f "$d/nl.md" ]; then echo "$d (missing)"
  elif [ "$(git log -1 --format=%ct -- "$d/en.md")" -gt "$(git log -1 --format=%ct -- "$d/nl.md")" ]; then echo "$d (stale)"
  fi
done
```
The "stale" check is a hint, not proof: en.md also changes for research or SEO-only edits. Show the user which is which. Same pattern for `guide untranslated nl` with `content/guides/*/`.

**For `service all nl`:** every `content/services/*/en.md`, regardless of translation status.

### Step 2: Confirm with user

Show count, list, and target locale. Ask for confirmation.

### Step 3: Dispatch parallel translation agents

**Agent prompt template for services:**

```
You are translating the service "{SERVICE_NAME}" (slug: {SLUG}) to {LOCALE} for switch-to.eu.

Use the /translate skill. Process:

Read .claude/skills/translate/SKILL.md and .claude/skills/_shared/content-files.md first.

1. Read content/services/{SLUG}/en.md in full, and content/services/{SLUG}/{LOCALE}.md if it exists.
   Localized fields: name, startingPrice, description, features, angle, issues, oneLineProblem,
   whatYoudGain, whatYoudLose, faqs, gdprNotes, userSentiment, recentNews, pricingTiers + SEO fields + body.

2. Translate all localized fields to {LOCALE}:
   - Translate meaning, not words. Read naturally in the target language.
   - Keep same tone: direct, practical, slightly opinionated.
   - Do NOT translate: brand names, service names, technical terms (API, GDPR, URL).
   - Dutch: use "je/jij" (informal), compound words as one word, short sentences, "data" singular/plural.
   - Also translate SEO fields: metaTitle, metaDescription, ogTitle, ogDescription, keywords.

3. Write content/services/{SLUG}/{LOCALE}.md: frontmatter with only the localized fields whose
   translation differs from English (same key order as en.md, no group comments), then the full
   translated body. Bump updatedAt in en.md. Don't add or remove `draft`.
   Run the validation snippet on both files. Only edit these two files. Don't touch git.

Return: service name, locale, fields translated, any issues.
```

**Agent prompt template for guides:**

```
You are translating the guide "{GUIDE_SLUG}" to {LOCALE} for switch-to.eu.

Read .claude/skills/translate/SKILL.md and .claude/skills/_shared/content-files.md first.

1. Read content/guides/{GUIDE_SLUG}/en.md in full, and {LOCALE}.md if it exists.
   Localized: title, description, missingFeatures, SEO fields + body (all sections and steps).

2. Translate all localized fields following the same rules.

3. Write content/guides/{GUIDE_SLUG}/{LOCALE}.md: differing localized frontmatter fields + full translated body.
   Keep every section/step marker exactly and the same number of steps. In each step-meta, translate
   `title` and copy video/videoOrientation/complete from en.md (keep a Dutch-specific video URL if the
   existing {LOCALE}.md had one). Bump updatedAt in en.md. Run the validation snippet on both files.

Return: guide slug, locale, fields translated, any issues.
```

### Step 4: Collect and report

```
## Bulk Translation Complete

Translated: X/Y items to {LOCALE}

| Item | Type | Fields | Status | Notes |
|------|------|--------|--------|-------|
| ProtonMail | Service | 6 | Done | — |
| Gmail to ProtonMail | Guide | 8 | Done | 6 steps, markers match |
| ... | ... | ... | ... | ... |

Failed: [list with reasons]

Next steps:
- Review translations in `git diff` / the PR
- Run /bulk-seo-check to audit translated SEO fields
- Run /bulk-humanize if translations read stiffly
```

## Guardrails

- **Max parallel agents:** 10 at a time. Translation agents use LLM heavily, so keep batches reasonable.
- **Locale validation:** Only proceed with supported locales (currently: nl). Reject unsupported locales.
- **One locale file per agent:** each agent writes only its own `<locale>.md` (and bumps `updatedAt` in its own `en.md`). No file conflicts.
- **No auto-publish.** Agents never add or remove `draft`. Nothing goes live until the PR is merged. Don't commit unless the user asks.

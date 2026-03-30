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

**For `service untranslated nl`:**
Fetch all services, then for each check if the Dutch locale has content:
```json
mcp__payload__findServices: {"limit": 100, "locale": "nl"}
```
Filter for services where `description` or `name` is empty/matches English (not translated).

**For `service all nl`:** Fetch all services regardless of translation status.

### Step 2: Confirm with user

Show count, list, and target locale. Ask for confirmation.

### Step 3: Dispatch parallel translation agents

**Agent prompt template for services:**

```
You are translating the service "{SERVICE_NAME}" to {LOCALE} for switch-to.eu.

Use the /translate skill. Process:

1. Fetch English content:
   mcp__payload__findServices: {"where": "{\"name\": {\"contains\": \"{SERVICE_NAME}\"}}", "limit": 1, "locale": "en", "depth": 1}
   Get: name, description, startingPrice, features, content, issues

2. Translate all localized fields to {LOCALE}:
   - Translate meaning, not words. Read naturally in the target language.
   - Keep same tone: direct, practical, slightly opinionated.
   - Do NOT translate: brand names, service names, technical terms (API, GDPR, URL).
   - Dutch: use "je/jij" (informal), compound words as one word, short sentences, "data" singular/plural.
   - Also translate SEO fields: metaTitle, metaDescription, ogTitle, ogDescription, keywords.

3. Save via mcp__payload__updateServices with locale: "{LOCALE}".
   Only send localized fields.

Return: service name, locale, fields translated, any issues.
```

**Agent prompt template for guides:**

```
You are translating the guide "{GUIDE_SLUG}" to {LOCALE} for switch-to.eu.

1. Fetch English: mcp__payload__findGuides by slug with locale: "en"
   Get: title, description, intro, beforeYouStart, steps, troubleshooting, outro, missingFeatures

2. Translate all localized fields following the same rules.

3. Save via mcp__payload__updateGuides with locale: "{LOCALE}".

Return: guide slug, locale, fields translated, any issues.
```

### Step 4: Collect and report

```
## Bulk Translation Complete

Translated: X/Y items to {LOCALE}

| Item | Type | Fields | Status | Notes |
|------|------|--------|--------|-------|
| ProtonMail | Service | 6 | Done | — |
| Gmail to ProtonMail | Guide | 8 | Done | richText saved as plain text |
| ... | ... | ... | ... | ... |

Failed: [list with reasons]

Next steps:
- Review translations in Payload admin (/admin)
- Run /bulk-seo-check to audit translated SEO fields
- Run /bulk-humanize if translations read stiffly
```

## Guardrails

- **Max parallel agents:** 10 at a time. Translation agents use LLM heavily, so keep batches reasonable.
- **Locale validation:** Only proceed with supported locales (currently: nl). Reject unsupported locales.
- **richText fields:** Translations may need to be saved as plain text if MCP rejects Lexical JSON. Note this in the report.
- **No auto-publish.** All translations remain in their current draft/published status.

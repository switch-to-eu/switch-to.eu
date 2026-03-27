---
name: translate
description: Translate content in Payload CMS to another locale. Use when asked to "translate", "localize", "write in Dutch", "add Dutch version", or work with non-English content. Reads the English version via MCP, translates all localized fields, and saves the target locale.
argument-hint: "'service <name> <locale>' or 'guide <slug> <locale>' (e.g. 'service ProtonMail nl')"
---

# Translation Skill

Translate content from English to another locale in Payload CMS.

## Supported locales

- `en` — English (source, default)
- `nl` — Dutch (Nederlands)

## Process

### Step 1: Fetch English content

Use the appropriate find tool with `locale: "en"` to get the English version.

For services: `mcp__payload__findServices` — get name, description, startingPrice, features, content, issues
For guides: `mcp__payload__findGuides` — get title, description, intro, beforeYouStart, steps, troubleshooting, outro, missingFeatures

### Step 2: Translate

Translate all localized fields. Follow these rules:

**General:**
- Translate meaning, not words. The Dutch version should read naturally in Dutch.
- Keep the same tone as the English: direct, practical, slightly opinionated.
- Do NOT translate: brand names, service names, technical terms (API, GDPR, URL, etc.)
- Keep the same structure and paragraph breaks.
- Match the informational-copy tone rules in Dutch too: no marketing fluff, no vague claims.

**Dutch-specific:**
- Use "je/jij" (informal you), not "u" (formal). Switch-to.eu is informal.
- Dutch compound words: write as one word (e.g. "privacybeleid" not "privacy beleid").
- Keep sentences short. Dutch tends toward longer constructions — fight that.
- "Data" is both singular and plural in Dutch. Don't write "datas."

**What NOT to translate:**
- `slug` (not localized)
- `url` (not localized)
- `region` (not localized)
- `category` relationship (not localized)
- Research tab fields (not localized)
- SEO fields: translate `metaTitle`, `metaDescription`, `ogTitle`, `ogDescription`, `keywords` but NOT `seoScore`, `seoNotes`, `lastSeoReviewAt`

### Step 3: Save the translation

Use the update tool with the `locale` parameter set to the target locale.

For services: `mcp__payload__updateServices` with the service ID
For guides: `mcp__payload__updateGuides` with the guide ID

Include `locale: "nl"` (or target locale) in the request. Only send the localized fields.

**Important:** The `content`, `intro`, `beforeYouStart`, `steps[].content`, `troubleshooting`, `outro` fields are richText. Write translations as plain text. If the MCP rejects it, note this to the user for manual entry.

### Step 4: Report

Tell the user:
- What was translated (fields list)
- Target locale
- Any fields that couldn't be saved via MCP (for manual entry)
- Remind them to review the translation in the Payload admin

## Post-translation SEO

After translation, the user should run:
```
/seo-check service <name>
```
This will check the translated meta fields for the target locale. The keywords, meta title, and meta description should be localized (not just translated — adapted for the target market's search terms).

## Quality notes

- Machine translation of SEO keywords rarely works. After translating, review keywords for Dutch search intent. "cloud storage" might be searched as "cloudopslag" in Dutch.
- Run `/humanize` on the Dutch version if it reads stiffly.

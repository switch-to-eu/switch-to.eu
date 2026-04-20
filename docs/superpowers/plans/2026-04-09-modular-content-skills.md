# Modular Content Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split monolithic write/humanize/seo-check skills into per-content-type skills with shared reference docs, and update bulk skills to dispatch to the right per-type skill.

**Architecture:** Extract shared knowledge (voice, AI patterns, SEO checklist, Lexical JSON) into `_shared/` reference docs. Create 9 per-type skills (3 actions × 3 types). Update 4 bulk/pipeline skills to route by content type. Delete 3 old monolithic skills. Update CLAUDE.md.

**Tech Stack:** Claude Code skills (Markdown), Payload CMS MCP tools

---

## File Structure

**Create:**
- `.claude/skills/_shared/voice.md`
- `.claude/skills/_shared/humanize-patterns.md`
- `.claude/skills/_shared/seo-checklist.md`
- `.claude/skills/_shared/lexical-json.md`
- `.claude/skills/write-service/SKILL.md`
- `.claude/skills/write-guide/SKILL.md`
- `.claude/skills/write-category/SKILL.md`
- `.claude/skills/humanize-service/SKILL.md`
- `.claude/skills/humanize-guide/SKILL.md`
- `.claude/skills/humanize-category/SKILL.md`
- `.claude/skills/seo-check-service/SKILL.md`
- `.claude/skills/seo-check-guide/SKILL.md`
- `.claude/skills/seo-check-category/SKILL.md`

**Modify:**
- `.claude/skills/bulk-write/SKILL.md`
- `.claude/skills/bulk-humanize/SKILL.md`
- `.claude/skills/bulk-seo-check/SKILL.md`
- `.claude/skills/pipeline/SKILL.md`
- `CLAUDE.md` (skill table + pipeline examples)

**Delete:**
- `.claude/skills/write/SKILL.md`
- `.claude/skills/humanize/SKILL.md`
- `.claude/skills/seo-check/SKILL.md`

---

### Task 1: Create shared reference docs

**Files:**
- Create: `.claude/skills/_shared/voice.md`
- Create: `.claude/skills/_shared/humanize-patterns.md`
- Create: `.claude/skills/_shared/seo-checklist.md`
- Create: `.claude/skills/_shared/lexical-json.md`
- Source: `.claude/skills/write/SKILL.md`, `.claude/skills/humanize/SKILL.md`, `.claude/skills/seo-check/SKILL.md`, `.claude/skills/informational-copy/SKILL.md`

These are reference docs, not invocable skills. No frontmatter needed.

- [ ] **Step 1: Create `_shared/voice.md`**

Extract from `write/SKILL.md` lines 11-56 (Voice section) and merge with `informational-copy/SKILL.md` for the complete banned words list. The file should contain:

```markdown
# Voice & Writing Rules

Reference doc for all content writing skills. Not an invocable skill.

## Voice

Write like a knowledgeable friend explaining something to someone who just wants their email to work and their data to stay private. Not a marketing team. Not a sysadmin. Not an AI assistant hedging every statement.

The reader is a regular person, not a developer. They don't care about AES-256 or zero-access encryption as concepts. They care about whether someone can read their emails.

### Rules

- Clear, simple language. Short sentences. Active voice.
- Address the reader with "you" and "your."
- Translate technical concepts into human outcomes: "even the company can't read your emails" not "zero-access encryption."
- Put the action or key fact first in every sentence.
- No em dashes. Use periods, commas, or colons.
- No semicolons. Split into two sentences.
- No exclamation marks.
- No metaphors, cliches, or setup language ("in conclusion," "it's worth noting").
- No jargon without explanation. If you must use a term like "end-to-end encrypted," follow it with what that means for the reader.

### Consumer-friendly rewrites

| Technical | Consumer-friendly |
|-----------|-------------------|
| "zero-access encryption" | "even the company can't read your emails" |
| "AES-256 encryption at rest" | "your data is scrambled so only you can read it" |
| "ISO 27001 certified" | "passed independent security audits" |
| "GDPR compliant" | "follows EU privacy rules" |
| "open-source clients" | "the code is public, so anyone can check for problems" |
| "end-to-end encrypted" | "only you and your recipient can read the message" |
| "data stored in Swiss jurisdiction" | "your data is stored in Switzerland, outside US legal reach" |

### Sentence rhythm

Vary paragraph length. Short statement. Then a longer sentence with context and a specific example. Then short again. This keeps people reading.

### Honesty patterns

Always acknowledge trade-offs. The "Worth knowing" section is not optional (for services).

- Instead of "blazing fast," write "pages load in under 200ms."
- Instead of "trusted by many," write "used by 100 million people."
- Instead of "easy to set up," write "setup takes about 5 minutes."

Use neutral framing for comparisons:
- Instead of "Gmail spies on your data," write "Gmail scans your emails to show you targeted ads."

### Banned words

can, may, just, that (when unnecessary), very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, revolutionize, disruptive, utilize, utilizing, tapestry, illuminate, unveil, pivotal, intricate, elucidate, hence, furthermore, harness, exciting, groundbreaking, cutting-edge, remarkable, remains to be seen, glimpse into, navigating, landscape, stark, testament, moreover, boost, skyrocketing, opened up, powerful, inquiries, ever-evolving, comprehensive, robust, state-of-the-art, seamless, seamlessly, leverage, dive into, dig into, dive deep, crucial, vital, essential, unleash, supercharge, turbocharge, revolutionary, streamline, elevate, empower, transform (unless literal), holistic, synergy, ecosystem (unless technically accurate), curated (unless you're a curator), shed light, not alone, in a world where, it

### Banned phrases

- "In today's fast-paced world..."
- "It's important to note that..."
- "When it comes to..."
- "In order to..." (write "to")
- "Whether you're a... or a..."
- "Are you ready to take your X to the next level?"
- "Let's dive in" / "Without further ado"
- "At the end of the day..."
- "It goes without saying..."
- "Look no further"
- "One-stop shop"
- "Best-in-class"
- "In conclusion" / "In closing" / "To summarize"
- "Not just X, but also Y"
```

- [ ] **Step 2: Create `_shared/humanize-patterns.md`**

Extract from `humanize/SKILL.md` lines 7-87 (pattern list + process + verification). The file should contain:

```markdown
# AI Pattern Detection & Humanization

Reference doc for all humanize skills. Not an invocable skill.

## AI Pattern Detection List

These patterns signal AI-generated text. Find and fix all of them.

### Structural patterns
1. **Rule of three**: "X, Y, and Z" lists appearing more than once per 200 words
2. **Parallel sentence openings**: 3+ consecutive sentences starting the same way
3. **Symmetric paragraphs**: Every paragraph roughly the same length
4. **Formulaic transitions**: "Moreover," "Furthermore," "Additionally," at paragraph starts
5. **Setup-punchline structure**: "While X may seem Y, the reality is Z"

### Word-level patterns
6. **Inflated vocabulary**: "utilize" (use), "facilitate" (help), "leverage" (use), "implement" (do/set up), "comprehensive" (specific list instead), "robust" (describe what it actually does)
7. **Hedging clusters**: "It's important to note that," "It's worth mentioning," "It should be noted"
8. **Vague intensifiers**: "very," "really," "incredibly," "extremely," "significantly"
9. **AI-favorite words**: "delve," "landscape," "tapestry," "realm," "paradigm," "synergy," "ecosystem" (unless technically accurate), "holistic," "seamless," "cutting-edge," "game-changer"
10. **Promotional adjectives**: "revolutionary," "groundbreaking," "innovative," "state-of-the-art," "best-in-class"

### Tone patterns
11. **Excessive enthusiasm**: Multiple exclamation marks, "exciting," "amazing," "incredible"
12. **False certainty**: "undoubtedly," "without question," "clearly" (when the thing isn't clear)
13. **Anthropomorphization**: "the tool understands," "the platform knows," "the service cares"
14. **Reader flattery**: "as a savvy user," "for discerning professionals"
15. **Empty empathy**: "we understand how frustrating," "we know how important"

### Punctuation patterns
16. **Em dash overuse**: More than 1 per 500 words (our rule: zero em dashes)
17. **Semicolons**: Remove all. Split into two sentences.
18. **Ellipses for drama**: "And then... everything changed."

## Two-Pass Process

### Pass 1: Rewrite

Go through every text field. For each one:
- Find every instance of the 18 patterns above
- Rewrite to sound natural. Shorter sentences. Specific details instead of adjectives.
- Vary sentence length: mix 6-word and 20-word sentences
- Use contractions naturally ("it's", "don't", "won't")
- Replace any "not just X, but also Y" with two plain statements

### Pass 2: Audit

Read the rewritten version and ask: "What still makes this obviously AI-generated?"
Fix those remaining issues. Common second-pass catches:
- Too-perfect paragraph structure (add one short 1-sentence paragraph)
- No contractions (add 2-3 natural ones)
- Every sentence follows subject-verb-object (vary with an occasional "The hard part:" or "In practice:")
- No personality (add one slightly opinionated observation with "Worth knowing:" or "The catch:")

## Verification Checklist

After humanizing, the content should pass these checks:
- [ ] No em dashes anywhere
- [ ] No semicolons
- [ ] No words from the banned list (see `_shared/voice.md`)
- [ ] Sentence length varies (some 5-8 words, some 15-25)
- [ ] At least one contraction per 100 words
- [ ] No three consecutive sentences starting the same way
- [ ] At least one acknowledged limitation or trade-off
- [ ] Reading it aloud doesn't feel robotic
```

- [ ] **Step 3: Create `_shared/seo-checklist.md`**

Extract from `seo-check/SKILL.md` lines 25-100 (checklist + scoring + note format). The file should contain:

```markdown
# SEO Audit Checklist

Reference doc for all seo-check skills. Not an invocable skill.

## 10-Point Checklist

Score each item: PASS (10 pts), PARTIAL (5 pts), FAIL (0 pts).

**1. Meta Title** (field: `metaTitle`)
- PASS: Present, 40-60 characters, contains a target keyword
- PARTIAL: Present but wrong length or missing keyword
- FAIL: Empty

**2. Meta Description** (field: `metaDescription`)
- PASS: Present, 150-160 characters, contains value proposition, not keyword-stuffed
- PARTIAL: Present but wrong length or generic
- FAIL: Empty

**3. Keywords** (field: `keywords`)
- PASS: 3-8 keywords defined, relevant to content
- PARTIAL: 1-2 keywords or some seem irrelevant
- FAIL: Empty

**4. Heading Structure** (analyze `content` or section fields)
- PASS: Single H1 (or title field), H2s for sections, no skipped levels, keyword in at least one H2
- PARTIAL: Minor issues (skipped level, no keyword in headings)
- FAIL: No headings or broken hierarchy

**5. Content Length** (thresholds vary by content type — defined in per-type skill)
- PASS: Meets type-specific threshold
- PARTIAL: Close to threshold
- FAIL: Significantly short

**6. Internal Context** (what to check varies by content type — defined in per-type skill)
- PASS: All required relationships and metadata set
- PARTIAL: Some missing
- FAIL: Critical metadata missing

**7. Open Graph** (fields: `ogTitle`, `ogDescription`)
- PASS: Both present, ogTitle under 70 chars, ogDescription under 200 chars
- PARTIAL: One present
- FAIL: Both empty

**8. Image** (what counts varies by content type — defined in per-type skill)
- PASS: At least one image present
- PARTIAL: N/A (no image required for this content type)
- FAIL: No images on a page that should have one

**9. Readability** (analyze content text)
- PASS: Paragraphs 1-4 sentences, no paragraph over 150 words, active voice predominant, Flesch Reading Ease estimate 60+
- PARTIAL: Some long paragraphs or passive voice
- FAIL: Wall of text, heavy jargon, passive voice dominant

**10. Freshness signals**
- PASS: `lastSeoReviewAt` within 90 days OR content recently updated
- PARTIAL: Review older than 90 days
- FAIL: Never reviewed

## Scoring

Score = sum of all items. Maximum 100.

Rating:
- 90-100: Excellent
- 70-89: Good
- 50-69: Needs work
- Below 50: Major issues

## Note Format

Write `seoNotes` as:
```
Score: [X]/100 ([Rating])
Checked: [date]

PASS: [list items that passed]
ISSUES:
- [Item]: [specific problem + fix recommendation]
- [Item]: [specific problem + fix recommendation]

Suggested metaTitle: "[if missing or bad, suggest one]"
Suggested metaDescription: "[if missing or bad, suggest one]"
```

## Fields to Save

- `seoScore`: the number (0-100)
- `seoNotes`: the summary text
- `lastSeoReviewAt`: today's date in ISO format
- If `metaTitle` or `metaDescription` are empty, also populate them with suggested values
```

- [ ] **Step 4: Create `_shared/lexical-json.md`**

Extract from `write/SKILL.md` lines 197-210 (Lexical JSON reference). The file should contain:

```markdown
# Lexical JSON Reference

Reference doc for skills that write richText fields. Not an invocable skill.

All richText fields in Payload require Lexical JSON format.

## Root structure

```json
{
  "root": {
    "type": "root", "direction": "ltr", "format": "", "indent": 0, "version": 1,
    "children": [ ...nodes... ]
  }
}
```

## Node types

**Paragraph:**
```json
{
  "type": "paragraph",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [
    {
      "type": "text",
      "text": "Your paragraph text here.",
      "mode": "normal",
      "style": "",
      "detail": 0,
      "format": 0,
      "version": 1
    }
  ]
}
```

**Heading (h2):**
```json
{
  "type": "heading",
  "tag": "h2",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [
    {
      "type": "text",
      "text": "Section title",
      "mode": "normal",
      "style": "",
      "detail": 0,
      "format": 0,
      "version": 1
    }
  ]
}
```

## Text formatting

On text nodes, the `format` field controls styling:
- `0` — plain text
- `1` — **bold**
- `2` — *italic*
- `3` — ***bold italic***
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/_shared/
git commit -m "feat: add shared reference docs for modular content skills

Extract voice rules, AI patterns, SEO checklist, and Lexical JSON
reference into reusable docs under .claude/skills/_shared/.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Create per-type write skills

**Files:**
- Create: `.claude/skills/write-service/SKILL.md`
- Create: `.claude/skills/write-guide/SKILL.md`
- Create: `.claude/skills/write-category/SKILL.md`
- Source: `.claude/skills/write/SKILL.md`

- [ ] **Step 1: Create `write-service/SKILL.md`**

Extract Mode 1 from `write/SKILL.md`. Replace inline voice rules with reference to `_shared/voice.md`. Replace inline Lexical JSON with reference to `_shared/lexical-json.md`. Keep all service-specific content: field definitions, page structure awareness table, self-check, MCP tools.

```markdown
---
name: write-service
description: Write or rewrite content for a service listing on switch-to.eu using research data from Payload CMS. Use when asked to "write a service", "write service ProtonMail", "draft service content".
argument-hint: "'<service name>'"
---

# Write Service Content

Write a service listing for switch-to.eu using research data from Payload CMS.

**Before writing, read:** `.claude/skills/_shared/voice.md` for tone and writing rules, `.claude/skills/_shared/lexical-json.md` for richText format.

## Page Structure Awareness

The service detail page has multiple tabs. Each tab has its own content source:

| Tab | Content source | What this skill populates |
|-----|---------------|--------------------------|
| **Overview** | `features` (tags) + `content` (richText) + auto-generated pricing/security snippets | `features`, `content` |
| **Pricing** | `pricingTiers` (structured array) | `pricingTiers` |
| **Security** | Research fields + `gdprNotes` | `gdprNotes` |
| **Comparison** | Auto-generated from both services + guide data | Nothing |

## Process

### Step 1: Pull research data

Use `mcp__Payload__findServices` to get the service with all its research fields:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 1, "depth": 1}
```

If `researchStatus` is "not-started", tell the user to run `/research SERVICE_NAME` first.

### Step 2: Write the content

**`description`** (required, localized): 1-2 sentences. Under 200 characters. Lead with the reader benefit, not company facts.

The description answers: "Why would I use this instead of what I have now?" Start with what makes this service meaningfully different from mainstream alternatives. That's usually a privacy/ownership angle, but could be simplicity, openness, or something else entirely. Mention the country only if it reinforces the point.

- Bad: "Swiss encrypted email from Proton AG. Founded by CERN scientists, owned by a non-profit."
- Bad: "Secure email service based in Switzerland with end-to-end encryption."
- Good: "Email where only you can read your inbox. Based in Switzerland, outside US and EU data requests."
- Good: "A search engine that plants trees with its ad revenue. Based in Berlin, no tracking."

**`features`** array: 4-6 short tags. 2-4 words each. These show as pills on the overview page.
- Bad: "End-to-end encryption between Proton users. Zero-access encryption for all stored mail."
- Good: "End-to-end encrypted", "Free tier available", "Open source", "GDPR compliant"

**`content`** (richText, Lexical JSON): 150-250 words. Consumer-friendly overview:

1. Opening paragraph: What it does, who made it, why you'd trust it. Reference the country.
2. Second paragraph: What makes it different, in plain language. Focus on outcomes not mechanisms.
3. Optional third paragraph: What else comes with it (calendar, storage, etc.) if applicable.
4. "Worth knowing" (h2): 1-2 paragraphs of honest trade-offs written for everyday users.

Do NOT include:
- "What stands out" section (features tags handle that)
- "Pricing" section (pricing tab handles that)
- Technical compliance details (security tab handles that)
- License names (GPLv3, AGPL, MIT) — say "open source" or "the code is public"
- Certificate names (ISO 27001, SOC 2) — say "passed independent security audits"

**`pricingTiers`** array: Structured pricing data from research. Each tier:
```json
{
  "name": "Mail Plus",
  "price": "€3.99/month",
  "billingNote": "billed annually",
  "features": [{"feature": "15 GB storage"}, {"feature": "10 email addresses"}]
}
```
- Free tier name: "Free" with price "Free"
- Keep feature descriptions under 6 words

**`gdprNotes`** (localized text): Rewrite research `gdprNotes` into 2-4 consumer-friendly sentences.
- Bad: "Fully GDPR compliant. Provides a Data Processing Agreement (DPA) for business customers."
- Good: "Tuta follows EU privacy rules and stores all your data on its own servers in Germany. The company doesn't log your IP address by default, so it holds very little data about you."

**For non-EU services also write:**
- `issues` array: Privacy/data concerns, stated factually. "Scans email content for ad targeting" not "spies on your data."

### Step 3: Save

Use `mcp__Payload__updateServices` (existing) or `mcp__Payload__createServices` (new). Set `_status: "draft"`.

## Self-check before saving

1. Would your non-technical friend understand every sentence?
2. Any vague claims without numbers? Add specifics from research data.
3. Did you include "Worth knowing" with at least one honest trade-off?
4. Are features 2-4 word tags, not sentences?
5. Did you populate `pricingTiers` with structured data?
6. Does the content include pricing or security details that belong on their own tabs? Remove them.
```

- [ ] **Step 2: Create `write-guide/SKILL.md`**

Extract Mode 2 from `write/SKILL.md`. Same pattern: reference shared docs, keep guide-specific content.

```markdown
---
name: write-guide
description: Write or rewrite a migration guide on switch-to.eu using research data from Payload CMS. Use when asked to "write a guide", "write guide Gmail to ProtonMail", "draft a migration guide".
argument-hint: "'<source> to <target>'"
---

# Write Guide Content

Write a migration guide for switch-to.eu using research data from Payload CMS.

**Before writing, read:** `.claude/skills/_shared/voice.md` for tone and writing rules, `.claude/skills/_shared/lexical-json.md` for richText format.

## Process

### Step 1: Pull research for both services

Use `mcp__Payload__findServices` twice to get research data for the source (non-EU) and target (EU) services.

### Step 2: Check if guide exists

Use `mcp__Payload__findGuides`:
```json
{"where": "{\"sourceService\": {\"equals\": SOURCE_ID}, \"targetService\": {\"equals\": TARGET_ID}}", "limit": 1, "depth": 1}
```

### Step 3: Write the guide sections

**`title`**: "Switching from [Source] to [Target]"

**`description`**: 1-2 sentences. What the target does and time estimate for the switch.

**`difficulty`**: beginner, intermediate, or advanced based on technical complexity.

**`timeRequired`**: Realistic estimate (e.g. "30 minutes" or "1-2 hours").

**`intro`** (richText, Lexical JSON): 100-150 words. Why someone would switch. State facts, not opinions.

**`beforeYouStart`** (richText, Lexical JSON): 50-100 words. The thing people wish they'd known before starting.

**`steps`** array: 4-8 ordered steps. Each step has:
- `title`: Action-first ("Create your ProtonMail account", not "Account Creation")
- `content` (richText, Lexical JSON): 2-3 sentences. Action first, context second.
- `complete`: false

Step writing rules:
- Start with the verb
- One action per step
- Include specific UI paths ("Go to Settings > Import/Export")
- Note time estimates for longer steps

**`troubleshooting`** (richText, Lexical JSON): 3-5 common issues as Q&A pairs. 100-200 words.

**`outro`** (richText, Lexical JSON): What to do after switching. 50-100 words.

**`missingFeatures`** array: Features the source has that the target doesn't. Be honest.

### Step 4: Save

Use `mcp__Payload__createGuides` (new) or `mcp__Payload__updateGuides` (existing). Set category, sourceService, targetService by ID. Set `_status: "draft"`.

## Self-check before saving

1. Would your non-technical friend understand every step?
2. Does every step start with an action verb?
3. Did you include specific UI paths (Settings > Import/Export)?
4. Did you list missing features honestly?
5. Is the time estimate realistic?
```

- [ ] **Step 3: Create `write-category/SKILL.md`**

New skill. Simpler than the others.

```markdown
---
name: write-category
description: Write or rewrite content for a category page on switch-to.eu. Use when asked to "write a category", "write category social-media", "draft category content".
argument-hint: "'<category slug>'"
---

# Write Category Content

Write a category page description for switch-to.eu.

**Before writing, read:** `.claude/skills/_shared/voice.md` for tone and writing rules, `.claude/skills/_shared/lexical-json.md` for richText format.

## Process

### Step 1: Fetch the category

Use `mcp__Payload__findCategories`:
```json
{"where": "{\"slug\": {\"equals\": \"CATEGORY_SLUG\"}}", "limit": 1}
```

### Step 2: Fetch services in this category

Use `mcp__Payload__findServices` to see what services exist in this category. This gives you context for what to write about.
```json
{"where": "{\"category\": {\"equals\": CATEGORY_ID}}", "limit": 50, "depth": 0}
```

### Step 3: Write the content

**`description`** (required, localized): 1 sentence. Under 150 characters. A subtitle that says what makes EU alternatives different in this space. Lead with the reader's situation, not a definition.

- Bad: "Social media platforms based in the European Union with strong privacy protections."
- Good: "Your posts, your audience, no ads mining your data."
- Bad: "European email providers offering secure and private communication."
- Good: "Your inbox, not an advertising platform."

**`content`** (richText, Lexical JSON): 2-3 sentences. Brief context about what the services in this category do and why EU matters here. Keep it tight. No "Worth knowing" section (that's per-service). No essay.

- State a concrete fact about the mainstream options in this space
- Say what the EU alternatives do differently, in one sentence
- Optionally: acknowledge the real trade-off or friction

Example for email:
"Most free email providers scan your inbox to sell targeted ads. The services listed here are run by European companies that make money from subscriptions instead. You lose some convenience features, but your messages stay private."

### Step 4: Save

Use `mcp__Payload__updateCategories` with the category ID. Set `_status: "draft"`.

## Self-check before saving

1. Is the description under 150 characters?
2. Is the content 2-3 sentences, not more?
3. Does it mention a concrete fact, not a vague claim?
4. Does it avoid repeating what the services themselves say? (No specific service names.)
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/write-service/ .claude/skills/write-guide/ .claude/skills/write-category/
git commit -m "feat: add per-type write skills for service, guide, category

Split write skill into write-service, write-guide, write-category.
Each references shared voice and Lexical JSON docs.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Create per-type humanize skills

**Files:**
- Create: `.claude/skills/humanize-service/SKILL.md`
- Create: `.claude/skills/humanize-guide/SKILL.md`
- Create: `.claude/skills/humanize-category/SKILL.md`
- Source: `.claude/skills/humanize/SKILL.md`

- [ ] **Step 1: Create `humanize-service/SKILL.md`**

```markdown
---
name: humanize-service
description: Strip AI writing patterns from a service listing in Payload CMS. Use when asked to "humanize service", "de-AI service ProtonMail", "make service content sound human".
argument-hint: "'<service name>'"
---

# Humanize Service Content

Remove AI writing patterns from a service listing in Payload CMS. Two-pass process: rewrite, then audit.

**Before starting, read:** `.claude/skills/_shared/humanize-patterns.md` for the 18 AI patterns and two-pass process.

## Fields to check

- `description`
- `content` (richText)
- `features` (array of tags)
- `issues` (array, if present)
- `gdprNotes`

## Process

### Step 1: Fetch the service

Use `mcp__Payload__findServices`:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 1}
```

Get: `description`, `content`, `features`, `issues`, `gdprNotes`.

### Step 2: First pass — Rewrite

Apply the pattern detection from `_shared/humanize-patterns.md` to every field listed above. Rewrite flagged text following the two-pass process.

For `features`: check each tag is 2-4 words and doesn't use inflated vocabulary. Replace "Comprehensive security suite" with "Built-in encryption."

For `content`: this is the main focus. Check every paragraph for all 18 patterns.

### Step 3: Second pass — Audit

Re-read the rewritten version. Fix remaining AI patterns per the audit checklist in `_shared/humanize-patterns.md`.

### Step 4: Save

Use `mcp__Payload__updateServices` with the service ID. Only update fields that changed.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns
```

- [ ] **Step 2: Create `humanize-guide/SKILL.md`**

```markdown
---
name: humanize-guide
description: Strip AI writing patterns from a migration guide in Payload CMS. Use when asked to "humanize guide", "de-AI guide gmail-to-protonmail", "make guide sound human".
argument-hint: "'<guide slug>'"
---

# Humanize Guide Content

Remove AI writing patterns from a migration guide in Payload CMS. Two-pass process: rewrite, then audit.

**Before starting, read:** `.claude/skills/_shared/humanize-patterns.md` for the 18 AI patterns and two-pass process.

## Fields to check

- `intro` (richText)
- `beforeYouStart` (richText)
- `steps[].content` (richText, each step)
- `troubleshooting` (richText)
- `outro` (richText)

## Process

### Step 1: Fetch the guide

Use `mcp__Payload__findGuides`:
```json
{"where": "{\"slug\": {\"equals\": \"GUIDE_SLUG\"}}", "limit": 1}
```

Get all richText fields listed above.

### Step 2: First pass — Rewrite

Apply the pattern detection from `_shared/humanize-patterns.md` to every field listed above.

For `steps`: check each step's content individually. Steps should start with an action verb and be 2-3 sentences. Fix any that read like marketing copy.

For `troubleshooting`: Q&A pairs should be direct. No "Great question!" or setup language.

### Step 3: Second pass — Audit

Re-read the rewritten version. Fix remaining AI patterns per the audit checklist in `_shared/humanize-patterns.md`.

### Step 4: Save

Use `mcp__Payload__updateGuides` with the guide ID. Only update fields that changed.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns
```

- [ ] **Step 3: Create `humanize-category/SKILL.md`**

```markdown
---
name: humanize-category
description: Strip AI writing patterns from a category page in Payload CMS. Use when asked to "humanize category", "de-AI category social-media", "make category content sound human".
argument-hint: "'<category slug>'"
---

# Humanize Category Content

Remove AI writing patterns from a category page in Payload CMS. Two-pass process: rewrite, then audit.

**Before starting, read:** `.claude/skills/_shared/humanize-patterns.md` for the 18 AI patterns and two-pass process.

## Fields to check

- `description` (textarea)
- `content` (richText)

## Process

### Step 1: Fetch the category

Use `mcp__Payload__findCategories`:
```json
{"where": "{\"slug\": {\"equals\": \"CATEGORY_SLUG\"}}", "limit": 1}
```

Get: `description`, `content`.

### Step 2: First pass — Rewrite

Apply the pattern detection from `_shared/humanize-patterns.md` to both fields.

The `description` is a single sentence (under 150 chars). Check for inflated vocabulary and vague claims. The `content` is 2-3 sentences. Check for all 18 patterns.

### Step 3: Second pass — Audit

Re-read the rewritten version. Fix remaining AI patterns per the audit checklist in `_shared/humanize-patterns.md`.

### Step 4: Save

Use `mcp__Payload__updateCategories` with the category ID. Only update fields that changed.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/humanize-service/ .claude/skills/humanize-guide/ .claude/skills/humanize-category/
git commit -m "feat: add per-type humanize skills for service, guide, category

Split humanize skill into humanize-service, humanize-guide, humanize-category.
Each references shared humanize-patterns doc.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Create per-type SEO check skills

**Files:**
- Create: `.claude/skills/seo-check-service/SKILL.md`
- Create: `.claude/skills/seo-check-guide/SKILL.md`
- Create: `.claude/skills/seo-check-category/SKILL.md`
- Source: `.claude/skills/seo-check/SKILL.md`

- [ ] **Step 1: Create `seo-check-service/SKILL.md`**

```markdown
---
name: seo-check-service
description: Run an SEO audit on a service in Payload CMS and store the score. Use when asked to "SEO check service", "audit service SEO", "score service ProtonMail".
argument-hint: "'<service name>'"
---

# SEO Check Service

Audit a service listing against a 10-point SEO checklist. Store score and notes via MCP.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `description` 50-200 chars AND `content` body 300+ words
- PARTIAL: Close to thresholds
- FAIL: Significantly short

**Item 6 — Internal Context:**
- PASS: `category` set, `features` has 3+ items, `tags` has 2+ items
- PARTIAL: Some missing
- FAIL: Category missing

**Item 8 — Image:**
- PASS: `screenshot` or `logo` present
- FAIL: Neither present

## Process

### Step 1: Fetch the service

Use `mcp__Payload__findServices`:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 1}
```

Get all fields including SEO tab fields (metaTitle, metaDescription, keywords, ogTitle, ogDescription).

### Step 2: Run the 10-point checklist

Apply the checklist from `_shared/seo-checklist.md` with the thresholds defined above for items 5, 6, and 8.

### Step 3: Audit subpages

For services, also check subpage metadata:

**Pricing subpage** (if `pricingTiers` or `pricingDetails` exist):
- Check `startingPrice` is set
- Check `freeOption` is set correctly
- Check `pricingTiers` has structured data

**Security subpage** (if security data exists):
- Check `gdprCompliance` is set (not "unknown")
- Check `certifications` has entries
- Check `dataStorageLocations` has entries

**Comparison subpages** (from guides):
- Check guides linking to this service have populated `sourceService` and `targetService`

Include subpage issues in `seoNotes` under a "Subpages" section. These don't affect the main score.

### Step 4: Save

Use `mcp__Payload__updateServices`:
- `seoScore`: the number (0-100)
- `seoNotes`: formatted summary (see `_shared/seo-checklist.md`)
- `lastSeoReviewAt`: today's date in ISO format
- If `metaTitle` or `metaDescription` are empty, populate with suggestions

### Step 5: Report

Show the user: score and rating, table of all 10 checks, subpage audit results, top 3 priority fixes.
```

- [ ] **Step 2: Create `seo-check-guide/SKILL.md`**

```markdown
---
name: seo-check-guide
description: Run an SEO audit on a migration guide in Payload CMS and store the score. Use when asked to "SEO check guide", "audit guide SEO", "score guide gmail-to-protonmail".
argument-hint: "'<guide slug>'"
---

# SEO Check Guide

Audit a migration guide against a 10-point SEO checklist. Store score and notes via MCP.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `intro` + `steps` + `troubleshooting` total 500+ words
- PARTIAL: Close to threshold
- FAIL: Significantly short

**Item 6 — Internal Context:**
- PASS: `sourceService` and `targetService` set, `difficulty` set, `category` set
- PARTIAL: Some missing
- FAIL: sourceService or targetService missing

**Item 8 — Image:**
- PARTIAL: N/A (no image required for guides)

## Process

### Step 1: Fetch the guide

Use `mcp__Payload__findGuides`:
```json
{"where": "{\"slug\": {\"equals\": \"GUIDE_SLUG\"}}", "limit": 1}
```

Get all fields including SEO tab fields.

### Step 2: Run the 10-point checklist

Apply the checklist from `_shared/seo-checklist.md` with the thresholds defined above for items 5, 6, and 8.

No subpage audit for guides.

### Step 3: Save

Use `mcp__Payload__updateGuides`:
- `seoScore`, `seoNotes`, `lastSeoReviewAt`
- Auto-populate empty `metaTitle` / `metaDescription`

### Step 4: Report

Show the user: score and rating, table of all 10 checks, top 3 priority fixes.
```

- [ ] **Step 3: Create `seo-check-category/SKILL.md`**

```markdown
---
name: seo-check-category
description: Run an SEO audit on a category page in Payload CMS and store the score. Use when asked to "SEO check category", "audit category SEO", "score category social-media".
argument-hint: "'<category slug>'"
---

# SEO Check Category

Audit a category page against a 10-point SEO checklist. Store score and notes via MCP.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `description` present AND `content` body 30+ words
- PARTIAL: Description present but no content
- FAIL: No description

**Item 6 — Internal Context:**
- PASS: `icon` set, `slug` set
- PARTIAL: Icon missing
- FAIL: Slug missing

**Item 8 — Image:**
- PARTIAL: N/A (no image required for categories)

## Process

### Step 1: Fetch the category

Use `mcp__Payload__findCategories`:
```json
{"where": "{\"slug\": {\"equals\": \"CATEGORY_SLUG\"}}", "limit": 1}
```

Get all fields including SEO tab fields.

### Step 2: Run the 10-point checklist

Apply the checklist from `_shared/seo-checklist.md` with the thresholds defined above for items 5, 6, and 8.

No subpage audit for categories.

### Step 3: Save

Use `mcp__Payload__updateCategories`:
- `seoScore`, `seoNotes`, `lastSeoReviewAt`
- Auto-populate empty `metaTitle` / `metaDescription`

### Step 4: Report

Show the user: score and rating, table of all 10 checks, top 3 priority fixes.
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/seo-check-service/ .claude/skills/seo-check-guide/ .claude/skills/seo-check-category/
git commit -m "feat: add per-type seo-check skills for service, guide, category

Split seo-check skill into seo-check-service, seo-check-guide, seo-check-category.
Each references shared seo-checklist doc with type-specific thresholds.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Update bulk skills with content-type routing

**Files:**
- Modify: `.claude/skills/bulk-write/SKILL.md`
- Modify: `.claude/skills/bulk-humanize/SKILL.md`
- Modify: `.claude/skills/bulk-seo-check/SKILL.md`
- Modify: `.claude/skills/pipeline/SKILL.md`

- [ ] **Step 1: Update `bulk-write/SKILL.md`**

Update the argument table and agent prompt templates to route to per-type skills. Key changes:

1. Add `category all` and `category <slug1>, <slug2>` to argument table
2. Change agent prompts to reference `write-service`, `write-guide`, or `write-category` skill
3. Keep the existing `service category Email` filter (already supported)

Replace the argument table (lines 13-19) with:

```markdown
| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota` | Write content for these specific services |
| `service all` | Write content for every service that has research completed |
| `service unwritten` | Write content for services with research done but no content yet |
| `service category Email` | Write content for all services in the Email category |
| `guide all` | Write all guides that have both source and target services researched |
| `category all` | Write content for all categories |
| `category social-media, email` | Write content for these specific categories |
```

Replace the service agent prompt template (lines 49-73) to reference `/write-service`:

```
You are writing content for the service "{SERVICE_NAME}" on switch-to.eu.

Use the /write-service skill. Read .claude/skills/_shared/voice.md and .claude/skills/_shared/lexical-json.md first.

1. Fetch the service from Payload:
   mcp__Payload__findServices: {"where": "{\"name\": {\"contains\": \"{SERVICE_NAME}\"}}", "limit": 1, "depth": 1}

2. Check that researchStatus is "complete". If not, return "SKIPPED: research not complete".

3. Write fields per the /write-service skill: description, features, content, pricingTiers, gdprNotes, issues (non-EU only).

4. Save via mcp__Payload__updateServices with _status: "draft".

Return: service name, word count, number of pricing tiers written, any issues.
```

Replace the guide agent prompt template (lines 75-89) to reference `/write-guide`:

```
You are writing a migration guide for switching from "{SOURCE}" to "{TARGET}" on switch-to.eu.

Use the /write-guide skill. Read .claude/skills/_shared/voice.md and .claude/skills/_shared/lexical-json.md first.

1. Fetch both services and the guide from Payload.
2. Write fields per the /write-guide skill: title, description, difficulty, timeRequired, intro, beforeYouStart, steps, troubleshooting, outro, missingFeatures.
3. Save via mcp__Payload__updateGuides or mcp__Payload__createGuides with _status: "draft".

Return: guide title, step count, difficulty, any issues.
```

Add a new category agent prompt template after the guide template:

```
You are writing content for the category "{CATEGORY_SLUG}" on switch-to.eu.

Use the /write-category skill. Read .claude/skills/_shared/voice.md and .claude/skills/_shared/lexical-json.md first.

1. Fetch the category from Payload:
   mcp__Payload__findCategories: {"where": "{\"slug\": {\"equals\": \"{CATEGORY_SLUG}\"}}", "limit": 1}

2. Fetch services in this category to understand context:
   mcp__Payload__findServices: {"where": "{\"category\": {\"equals\": CATEGORY_ID}}", "limit": 50, "depth": 0}

3. Write fields per the /write-category skill: description (1 sentence, under 150 chars), content (2-3 sentences richText).

4. Save via mcp__Payload__updateCategories with _status: "draft".

Return: category slug, description length, content sentence count, any issues.
```

Add to Step 1 "Build the item list" a new section for categories:

```markdown
**For `category all`:**
```json
mcp__Payload__findCategories: {"limit": 100, "depth": 0}
```

**For specific category slugs:** Split comma-separated list, look up each by slug.
```

- [ ] **Step 2: Update `bulk-humanize/SKILL.md`**

Add `category all` and `category <slug1>, <slug2>` to argument table. Add category agent prompt template. Add category query to "Build the item list".

Replace the argument table (lines 13-18) with:

```markdown
| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota` | Humanize these specific services |
| `service all` | Humanize all services that have content |
| `service category Email` | Humanize all services in the Email category |
| `guide all` | Humanize all guides that have content |
| `guide gmail-to-protonmail, outlook-to-tutanota` | Humanize specific guides by slug |
| `category all` | Humanize all categories that have content |
| `category social-media, email` | Humanize these specific categories |
```

Add to Step 1 "Build the item list":

```markdown
**For `category all`:**
```json
mcp__Payload__findCategories: {"limit": 100, "depth": 0}
```
Filter for categories where `content` is not null/empty.

**For `service category X`:**
First find the category ID, then query services:
```json
mcp__Payload__findServices: {"where": "{\"category\": {\"equals\": CATEGORY_ID}}", "limit": 100}
```
Filter for services where `content` is not null/empty.
```

Update service agent prompt to reference `/humanize-service`. Update guide agent prompt to reference `/humanize-guide`. Add category agent prompt:

```
You are humanizing the content for category "{CATEGORY_SLUG}" on switch-to.eu.

Use the /humanize-category skill. Read .claude/skills/_shared/humanize-patterns.md first.

1. Fetch the category:
   mcp__Payload__findCategories: {"where": "{\"slug\": {\"equals\": \"{CATEGORY_SLUG}\"}}", "limit": 1}
   Get: description, content

2. Apply 18-pattern detection and two-pass rewrite to both fields.

3. Save changed fields via mcp__Payload__updateCategories.

Return: category slug, patterns found count by category, fields updated.
```

- [ ] **Step 3: Update `bulk-seo-check/SKILL.md`**

Add `category all` and `category <slug1>, <slug2>` to argument table. Add category agent prompt template. Add category query to "Build the item list".

Replace the argument table (lines 13-19) with:

```markdown
| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota` | SEO check these specific services |
| `service all` | SEO check all services |
| `service category Email` | SEO check all services in the Email category |
| `service below 70` | Re-check services with seoScore below 70 |
| `service unchecked` | Check services never SEO-reviewed |
| `guide all` | SEO check all guides |
| `category all` | SEO check all categories |
| `category social-media, email` | SEO check these specific categories |
| `all` | Check everything (services + guides + categories) |
```

Add to Step 1 "Build the item list":

```markdown
**For `category all`:**
```json
mcp__Payload__findCategories: {"limit": 100}
```

**For `all`:** Query services, guides, categories, and pages separately. Combine the lists.
```

Add category agent prompt:

```
You are running an SEO audit on category "{CATEGORY_SLUG}" for switch-to.eu.

Use the /seo-check-category skill. Read .claude/skills/_shared/seo-checklist.md first.

1. Fetch the category:
   mcp__Payload__findCategories: {"where": "{\"slug\": {\"equals\": \"{CATEGORY_SLUG}\"}}", "limit": 1}

2. Run the 10-point SEO checklist with category-specific thresholds:
   - Content Length: description present AND content 30+ words
   - Internal Context: icon set, slug set
   - Image: N/A (partial)

3. Calculate score, save seoScore, seoNotes, lastSeoReviewAt via mcp__Payload__updateCategories.

Return: category slug, score, rating, top 3 issues.
```

- [ ] **Step 4: Update `pipeline/SKILL.md`**

Add `category all` and `category <slug1>, <slug2>` to argument table. Add category routing to agent dispatch. Update agent prompts to reference per-type skills.

Replace the argument table (lines 22-29) with:

```markdown
| Argument | Meaning |
|----------|---------|
| `service ProtonMail` | Full pipeline for one service |
| `service ProtonMail, Tutanota, Mailbox.org` | Full pipeline for these services in parallel |
| `service all` | Full pipeline for all services with completed research |
| `service unwritten` | Pipeline for researched services that have no content yet |
| `service category Email` | Pipeline for all services in the Email category |
| `guide Gmail to ProtonMail` | Full pipeline for one guide |
| `guide all` | Full pipeline for all guides |
| `category all` | Full pipeline for all categories |
| `category social-media, email` | Full pipeline for these categories |
```

Add to Step 1 "Build the item list":

```markdown
**For `category all`:**
```json
mcp__Payload__findCategories: {"limit": 100, "depth": 0}
```

**For specific category slugs:** Split comma-separated list, look up each by slug.
```

Update the service agent prompt template (lines 72-136) to reference per-type skills: `/write-service`, `/humanize-service`, `/seo-check-service` instead of inline instructions. Same for guide prompt: `/write-guide`, `/humanize-guide`, `/seo-check-guide`.

Add category pipeline agent prompt template:

```
You are running the full content pipeline for category "{CATEGORY_SLUG}" on switch-to.eu.

Run these three steps IN ORDER. Each step must complete before the next starts.

## Step 1: Write (/write-category)

Read .claude/skills/_shared/voice.md and .claude/skills/_shared/lexical-json.md.

1. Fetch the category:
   mcp__Payload__findCategories: {"where": "{\"slug\": {\"equals\": \"{CATEGORY_SLUG}\"}}", "limit": 1}

2. Fetch services in this category for context:
   mcp__Payload__findServices: {"where": "{\"category\": {\"equals\": CATEGORY_ID}}", "limit": 50, "depth": 0}

3. Write:
   - description: 1 sentence, under 150 chars. What makes EU alternatives different here.
   - content: 2-3 sentences richText. Concrete fact, EU difference, optional trade-off.

4. Save via mcp__Payload__updateCategories with _status: "draft".

## Step 2: Humanize (/humanize-category)

Read .claude/skills/_shared/humanize-patterns.md.

1. Re-fetch the category to get just-written content.
2. Check description and content for 18 AI patterns.
3. First pass: rewrite flagged text.
4. Second pass: audit for remaining AI feel.
5. Save changed fields via mcp__Payload__updateCategories.

## Step 3: SEO Check (/seo-check-category)

Read .claude/skills/_shared/seo-checklist.md.

1. Re-fetch the category.
2. Run 10-point checklist with category thresholds:
   - Content Length: description present AND content 30+ words
   - Internal Context: icon set, slug set
   - Image: N/A (partial)
3. Calculate score.
4. Save: seoScore, seoNotes, lastSeoReviewAt. Auto-populate empty metaTitle/metaDescription.

## Return

Return a summary:
- Category slug
- Write: description length, content sentence count
- Humanize: patterns found/fixed
- SEO: score and rating
- Any issues
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/bulk-write/ .claude/skills/bulk-humanize/ .claude/skills/bulk-seo-check/ .claude/skills/pipeline/
git commit -m "feat: update bulk skills with category support and per-type routing

Add category as a content type to bulk-write, bulk-humanize,
bulk-seo-check, and pipeline. Route to per-type skills.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Delete old monolithic skills and update CLAUDE.md

**Files:**
- Delete: `.claude/skills/write/SKILL.md`
- Delete: `.claude/skills/humanize/SKILL.md`
- Delete: `.claude/skills/seo-check/SKILL.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Delete old skills**

```bash
rm .claude/skills/write/SKILL.md && rmdir .claude/skills/write
rm .claude/skills/humanize/SKILL.md && rmdir .claude/skills/humanize
rm .claude/skills/seo-check/SKILL.md && rmdir .claude/skills/seo-check
```

- [ ] **Step 2: Update CLAUDE.md skill table**

Replace the skill table in the "Skills (`.claude/skills/`)" section with:

```markdown
| Skill | Type | Purpose |
|-------|------|---------|
| `informational-copy` | Auto-invoked | Tone of voice: direct, honest, specific, no marketing fluff |
| `research` | `/research` | Web research → Payload Research tab via MCP |
| `write-service` | `/write-service` | Write service listing from research data |
| `write-guide` | `/write-guide` | Write migration guide from research data |
| `write-category` | `/write-category` | Write category page description |
| `humanize-service` | `/humanize-service` | Strip AI writing patterns from service |
| `humanize-guide` | `/humanize-guide` | Strip AI writing patterns from guide |
| `humanize-category` | `/humanize-category` | Strip AI writing patterns from category |
| `seo-check-service` | `/seo-check-service` | SEO audit for service with scoring |
| `seo-check-guide` | `/seo-check-guide` | SEO audit for guide with scoring |
| `seo-check-category` | `/seo-check-category` | SEO audit for category with scoring |
| `translate` | `/translate` | Localization to other EU languages |
| `bulk-research` | `/bulk-research` | Parallel research via subagents |
| `bulk-write` | `/bulk-write` | Parallel content writing (service/guide/category) |
| `bulk-humanize` | `/bulk-humanize` | Parallel humanization (service/guide/category) |
| `bulk-seo-check` | `/bulk-seo-check` | Parallel SEO audits (service/guide/category) |
| `bulk-translate` | `/bulk-translate` | Parallel translation via subagents |
| `pipeline` | `/pipeline` | Combined write→humanize→seo-check (service/guide/category) |
```

- [ ] **Step 3: Update CLAUDE.md single-item pipeline examples**

Replace the "Single-Item Pipeline" section with:

```markdown
### Single-Item Pipeline

```
/research "ServiceName"               → Fills Research tab on service via MCP
/write-service "ServiceName"          → Writes listing from research data, saves as draft
/humanize-service "ServiceName"       → Strips AI writing patterns
/seo-check-service "ServiceName"      → 10-point audit, stores score in SEO tab
→ Editor reviews in /admin, publishes
/translate service "ServiceName" nl   → Translates to Dutch locale
→ Editor reviews Dutch version, publishes
```

For guides:
```
/write-guide "Gmail" to "ProtonMail"        → Creates migration guide from research
/humanize-guide "gmail-to-protonmail"
/seo-check-guide "gmail-to-protonmail"
→ Review + publish
/translate guide "gmail-to-protonmail" nl
→ Review Dutch + publish
```

For categories:
```
/write-category "social-media"         → Writes category description
/humanize-category "social-media"      → Strips AI writing patterns
/seo-check-category "social-media"     → SEO audit
→ Review + publish
/translate category "social-media" nl  → Translates to Dutch
→ Review Dutch + publish
```
```

- [ ] **Step 4: Update CLAUDE.md bulk pipeline examples**

Replace the "Bulk Pipeline" section with:

```markdown
### Bulk Pipeline (Parallel Agents)

```
/bulk-research all                      → Research all unresearched services in parallel
/bulk-write service all                 → Write content for all researched services
/bulk-write category all                → Write content for all categories
/bulk-humanize service all              → Humanize all services with content
/bulk-humanize category all             → Humanize all categories
/bulk-seo-check service all             → SEO audit all services
/bulk-seo-check category all            → SEO audit all categories
/bulk-translate service all nl          → Translate all services to Dutch
/pipeline service all                   → Run write→humanize→seo-check per service
/pipeline category all                  → Run write→humanize→seo-check per category
```

Bulk skills accept: specific names (comma-separated), `all`, `unresearched`/`unwritten`/`unchecked`, `category <name>`. Each dispatches one subagent per item using the Agent tool with `run_in_background: true`. Max 10 parallel agents per batch.
```

- [ ] **Step 5: Commit**

```bash
git add -A .claude/skills/write .claude/skills/humanize .claude/skills/seo-check CLAUDE.md
git commit -m "feat: remove old monolithic skills, update CLAUDE.md

Delete write, humanize, seo-check (replaced by per-type versions).
Update skill table and pipeline examples in CLAUDE.md.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Verify all skills are discoverable

- [ ] **Step 1: List all skill directories**

Run:
```bash
ls -d .claude/skills/*/
```

Expected output should include all new skills:
```
.claude/skills/_shared/
.claude/skills/bulk-humanize/
.claude/skills/bulk-research/
.claude/skills/bulk-seo-check/
.claude/skills/bulk-translate/
.claude/skills/bulk-write/
.claude/skills/humanize-category/
.claude/skills/humanize-guide/
.claude/skills/humanize-service/
.claude/skills/informational-copy/
.claude/skills/pipeline/
.claude/skills/research/
.claude/skills/seo-check-category/
.claude/skills/seo-check-guide/
.claude/skills/seo-check-service/
.claude/skills/translate/
.claude/skills/write-category/
.claude/skills/write-guide/
.claude/skills/write-service/
```

Should NOT include:
```
.claude/skills/write/
.claude/skills/humanize/
.claude/skills/seo-check/
```

- [ ] **Step 2: Verify each SKILL.md has valid frontmatter**

Run:
```bash
for f in .claude/skills/*/SKILL.md; do echo "=== $f ==="; head -5 "$f"; echo; done
```

Every SKILL.md should have `name:`, `description:`, and `argument-hint:` in frontmatter.

- [ ] **Step 3: Verify shared docs exist and have no frontmatter**

Run:
```bash
for f in .claude/skills/_shared/*.md; do echo "=== $f ==="; head -3 "$f"; echo; done
```

Shared docs should start with `# Title`, not `---` frontmatter.

- [ ] **Step 4: Commit (if any fixes needed)**

Only commit if fixes were needed in previous steps.

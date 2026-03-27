---
name: write
description: Write or rewrite content for switch-to.eu using research data from Payload CMS. Handles service listings (descriptions, features, content) and migration guides (intro, steps, troubleshooting). Use when asked to "write a service page", "write a guide", "draft content for", "rewrite the description". Always uses the informational-copy tone of voice.
argument-hint: "'service <name>' or 'guide <source> to <target>'"
---

# Content Writing Skill

Write switch-to.eu content using research data from Payload, following the informational-copy tone of voice.

## Before writing: read the tone-of-voice skill

The `informational-copy` skill at `.claude/skills/informational-copy/SKILL.md` defines our voice. Read it before writing. Key rules:
- Write like a knowledgeable friend, not a marketing team
- Back every claim with specifics
- Acknowledge trade-offs honestly
- No em dashes, no semicolons, no banned words
- Active voice, short sentences, varied paragraph length

## Mode 1: Write a service listing

Usage: `/write service ProtonMail`

### Step 1: Pull research data

Use `mcp__payload__findServices` to get the service with all its research fields:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 1, "depth": 1}
```

If `researchStatus` is "not-started", tell the user to run `/research SERVICE_NAME` first.

### Step 2: Write the content

Using the research data, write these fields:

**`description`** (required, localized): 1-2 sentences. What it is, where it's based, what makes it different. No marketing language. Under 200 characters.

Template: "[Name] is a [country]-based [type]. [One differentiating fact with a number or specific detail.]"

**`features`** array: 4-6 concrete features. Each one specific, not vague.
- Bad: "Strong privacy features"
- Good: "End-to-end encryption for all emails. Even Proton can't read them."

**`content`** (richText, localized): 300-500 words following this structure:

1. Opening paragraph: What it does and who it's for. Reference the country and a specific capability.
2. "What stands out" section: 3-4 specific features with numbers/details from the research.
3. "Worth knowing" section: 2-3 honest limitations or trade-offs. This is mandatory.
4. Pricing paragraph: Specific tiers and prices from the research data.
5. Closing: One sentence on who this is best for.

**For non-EU services also write:**
- `issues` array: Privacy/data concerns, stated factually. "Scans email content for ad targeting" not "spies on your data."

**Write `content` as Lexical richText JSON.** Payload's richText fields require Lexical editor JSON, not markdown. Use this reference to construct it.

### Lexical JSON reference

The `content` field (and all richText fields like `intro`, `beforeYouStart`, `steps[].content`, `troubleshooting`, `outro`, `researchNotes`) must be wrapped in:

```json
{
  "root": {
    "type": "root",
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "version": 1,
    "children": [ ...nodes here... ]
  }
}
```

**Paragraph node:**
```json
{
  "type": "paragraph",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [
    {"type": "text", "text": "Your paragraph text here.", "mode": "normal", "style": "", "detail": 0, "format": 0, "version": 1}
  ]
}
```

**Heading node (h2, h3):**
```json
{
  "type": "heading",
  "tag": "h2",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [
    {"type": "text", "text": "Heading text", "mode": "normal", "style": "", "detail": 0, "format": 0, "version": 1}
  ]
}
```

**Bold text** — set `"format": 1` on the text node. **Italic** — `"format": 2`. **Bold+italic** — `"format": 3`.

**Multiple text formats in one paragraph** — use multiple text children:
```json
{
  "type": "paragraph",
  "children": [
    {"type": "text", "text": "Normal text then ", "format": 0, ...},
    {"type": "text", "text": "bold text", "format": 1, ...},
    {"type": "text", "text": " then normal again.", "format": 0, ...}
  ]
}
```

Construct the full JSON for every richText field. This is the only way to write content via MCP.

### Step 3: Save as draft

Use `mcp__payload__updateServices` to save. Set `_status: "draft"` if drafts are enabled.

### Step 4: Report

Tell the user what was written, word count, and that it's saved as draft for review.

---

## Mode 2: Write a migration guide

Usage: `/write guide Gmail to ProtonMail`

### Step 1: Pull research for both services

Use `mcp__payload__findServices` twice to get research data for the source (non-EU) and target (EU) services.

### Step 2: Check if guide exists

Use `mcp__payload__findGuides` to see if a guide already exists for this pair:
```json
{"where": "{\"sourceService\": {\"equals\": SOURCE_ID}, \"targetService\": {\"equals\": TARGET_ID}}", "limit": 1, "depth": 1}
```

### Step 3: Write the guide sections

**`title`**: "Switching from [Source] to [Target]"

**`description`**: 1-2 sentences. What the target does and time estimate for the switch.

**`difficulty`**: beginner, intermediate, or advanced based on technical complexity.

**`timeRequired`**: Realistic estimate (e.g. "30 minutes" or "1-2 hours").

**`intro`** (richText, Lexical JSON): Why someone would switch. State facts, not opinions. Reference specific differences from the research. 100-150 words.

**`beforeYouStart`** (richText, Lexical JSON): The thing people wish they'd known. Data that won't transfer, accounts to update first, preparation needed. 50-100 words.

**`steps`** array: 4-8 ordered steps. Each step has:
- `title`: Action-first (e.g. "Create your ProtonMail account")
- `content`: 2-3 sentences. Action first, context second. Active voice.
- `complete`: false

Step writing rules:
- Start with the verb
- One action per step
- Include specific UI paths ("Go to Settings > Import/Export")
- Note time estimates for longer steps
- Tips and warnings in separate sentences

**`troubleshooting`** (richText, Lexical JSON): 3-5 common issues as Q&A pairs. Pull from Reddit sentiment in the research data. 100-200 words.

**`outro`** (richText, Lexical JSON): What to do after switching. Update email on important accounts, tell contacts, etc. 50-100 words.

**`steps[].content`** is also richText. Each step's content must be Lexical JSON too.

**`missingFeatures`** array: Features the source has that the target doesn't. Be honest.

### Step 4: Save

Use `mcp__payload__createGuides` (new guide) or `mcp__payload__updateGuides` (existing). Set category, sourceService, targetService relationships by ID. Set `_status: "draft"`.

### Step 5: Report

Tell the user: guide title, step count, word count, saved as draft.

---

## Self-check before saving

Before saving any content, scan for:
1. Any em dashes (—)? Replace with periods or commas.
2. Any banned words from the informational-copy list? Replace with specifics.
3. Any vague claims without numbers? Add specifics from research data.
4. Did you acknowledge at least one trade-off? If not, add a "Worth knowing" item.
5. Does it sound like a person or a website? Rewrite if it sounds like marketing.

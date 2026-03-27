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

**Do NOT write `content` as Lexical richText JSON.** Write it as plain markdown text. The Payload admin can convert it. If the MCP rejects plain text in the richText field, note this to the user and provide the content for manual paste.

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

**`intro`** (richText): Why someone would switch. State facts, not opinions. Reference specific differences from the research. 100-150 words.

**`beforeYouStart`** (richText): The thing people wish they'd known. Data that won't transfer, accounts to update first, preparation needed. 50-100 words.

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

**`troubleshooting`** (richText): 3-5 common issues as Q&A pairs. Pull from Reddit sentiment in the research data. 100-200 words.

**`outro`** (richText): What to do after switching. Update email on important accounts, tell contacts, etc. 50-100 words.

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

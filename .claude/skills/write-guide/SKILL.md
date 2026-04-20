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

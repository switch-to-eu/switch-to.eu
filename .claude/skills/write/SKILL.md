---
name: write
description: Write or rewrite content for switch-to.eu using research data from Payload CMS. Handles service listings (descriptions, features, content) and migration guides (intro, steps, troubleshooting). Use when asked to "write a service page", "write a guide", "draft content for", "rewrite the description".
argument-hint: "'service <name>' or 'guide <source> to <target>'"
---

# Content Writing Skill

Write switch-to.eu content using research data from Payload CMS.

## Voice

Write like a knowledgeable friend who's done the research and is saving someone time. Not a marketing team. Not a Wikipedia editor. Not an AI assistant hedging every statement.

Credibility comes from specificity + honesty about limitations. Every time you acknowledge a limitation, every positive claim becomes more believable.

### Rules

- Clear, simple language. Short sentences. Active voice.
- Address the reader with "you" and "your."
- Support claims with data, numbers, or concrete examples from the research tab.
- Put the action or key fact first in every sentence.
- No em dashes. Use periods, commas, or colons.
- No semicolons. Split into two sentences.
- No exclamation marks.
- No metaphors, cliches, or setup language ("in conclusion," "it's worth noting").

### Sentence rhythm

Vary paragraph length. Short statement. Then a longer sentence with context and a specific example. Then short again. This keeps people reading.

What kills rhythm: same-length paragraphs, same opening words, long blocks without punchy lines, all short fragments with no breathing room.

### Honesty patterns

Always acknowledge trade-offs. The "Worth knowing" section is not optional.

- "Signal is widely considered the most private messaging app available. The trade-off is a smaller user base."
- Instead of "blazing fast," write "pages load in under 200ms."
- Instead of "trusted by many," write "used by 1.2 million accounts."
- Instead of "easy to set up," write "setup takes about 5 minutes."

Use neutral framing for comparisons:
- Instead of "Gmail spies on your data," write "Gmail scans email content to power features like Smart Reply and targeted advertising."

### What to write instead of vague claims

| Don't write | Write instead |
|-------------|---------------|
| "comprehensive solution" | "covers email, calendar, contacts, and file storage" |
| "seamless migration" | "migration takes about 20 minutes and imports your existing data automatically" |
| "robust privacy features" | "blocks trackers by default and doesn't collect browsing history" |
| "cutting-edge encryption" | "uses end-to-end encryption. Even the service provider can't read your data." |
| "trusted by thousands" | "used by 1.2 million accounts across Europe" |

---

## Mode 1: Write a service listing

Usage: `/write service ProtonMail`

### Step 1: Pull research data

Use `mcp__payload__findServices` to get the service with all its research fields:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 1, "depth": 1}
```

If `researchStatus` is "not-started", tell the user to run `/research SERVICE_NAME` first.

### Step 2: Write the content

**`description`** (required, localized): 1-2 sentences. What it is, where it's based, what makes it different. Under 200 characters.

Template: "[Name] is a [country]-based [type]. [One differentiating fact with a number or specific detail.]"

**`features`** array: 4-6 concrete features. Each one specific, not vague.
- Bad: "Strong privacy features"
- Good: "End-to-end encryption for all emails. Even Proton can't read them."

**`content`** (richText, Lexical JSON): 300-500 words following this structure:

1. Opening paragraph: What it does and who it's for. Reference the country and a specific capability.
2. "What stands out" (h2): 3-4 specific features with numbers/details from the research.
3. "Worth knowing" (h2): 2-3 honest limitations or trade-offs. This section is mandatory.
4. "Pricing" (h2): Specific tiers and prices from the research data.
5. Closing paragraph: One sentence on who this is best for.

**Service description formula:**

> [Service Name] is a [country]-based [type of service] built for [who it's for].
>
> [1-2 sentences positioning it vs the well-known service it replaces.]
>
> What stands out:
> - [Specific feature, with numbers]
> - [Specific feature]
>
> Worth knowing:
> - [Honest limitation]
> - [Honest limitation or pricing context]
>
> Based in: [Country]. Free tier: [Yes/No + details]. Platforms: [list].

**For non-EU services also write:**
- `issues` array: Privacy/data concerns, stated factually. "Scans email content for ad targeting" not "spies on your data."

---

## Mode 2: Write a migration guide

Usage: `/write guide Gmail to ProtonMail`

### Step 1: Pull research for both services

Use `mcp__payload__findServices` twice to get research data for the source (non-EU) and target (EU) services.

### Step 2: Check if guide exists

Use `mcp__payload__findGuides`:
```json
{"where": "{\"sourceService\": {\"equals\": SOURCE_ID}, \"targetService\": {\"equals\": TARGET_ID}}", "limit": 1, "depth": 1}
```

### Step 3: Write the guide sections

**`title`**: "Switching from [Source] to [Target]"

**`description`**: 1-2 sentences. What the target does and time estimate for the switch.

**`difficulty`**: beginner, intermediate, or advanced based on technical complexity.

**`timeRequired`**: Realistic estimate (e.g. "30 minutes" or "1-2 hours").

**`intro`** (richText, Lexical JSON): 100-150 words. Why someone would switch. State facts, not opinions.

**Guide intro formula:**

> [1 sentence: what the target service does and why someone might choose it]
>
> [Time estimate for the technical switch + what the real challenge is]
>
> Before you start: [The one thing people wish they'd known. Data that won't transfer, preparation needed.]

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
- Tips and warnings in separate sentences

**`troubleshooting`** (richText, Lexical JSON): 3-5 common issues as Q&A pairs. Pull from Reddit sentiment in the research data. 100-200 words.

**`outro`** (richText, Lexical JSON): What to do after switching. Update email on important accounts, tell contacts, etc. 50-100 words.

**`missingFeatures`** array: Features the source has that the target doesn't. Be honest.

### Step 4: Save

Use `mcp__payload__createGuides` (new) or `mcp__payload__updateGuides` (existing). Set category, sourceService, targetService by ID. Set `_status: "draft"`.

---

## Lexical JSON reference

All richText fields (`content`, `intro`, `beforeYouStart`, `steps[].content`, `troubleshooting`, `outro`) require Lexical JSON:

```json
{
  "root": {
    "type": "root", "direction": "ltr", "format": "", "indent": 0, "version": 1,
    "children": [ ...nodes... ]
  }
}
```

**Paragraph:** `{"type": "paragraph", "format": "", "indent": 0, "version": 1, "direction": "ltr", "children": [{"type": "text", "text": "...", "mode": "normal", "style": "", "detail": 0, "format": 0, "version": 1}]}`

**Heading:** Same but `"type": "heading", "tag": "h2"`.

**Bold text:** `"format": 1` on the text node. **Italic:** `"format": 2`.

---

## Self-check before saving

1. Any vague claims without numbers? Add specifics from research data.
2. Did you acknowledge at least one trade-off? If not, add a "Worth knowing" item.
3. Does it sound like a person or a website? Rewrite if it sounds like marketing.
4. Does every paragraph vary in length? Break up any uniform blocks.

Note: detailed AI pattern detection (banned words, em dashes, parallel openings) happens in `/humanize`, which runs after `/write`.

---
name: bulk-write
description: Write content for multiple services, guides, or categories in parallel using subagents. Use when asked to "write all services", "bulk write", "write content for these services", "write all categories", or need to populate Content tabs for many items at once.
argument-hint: "'service all' or 'guide all' or 'category all' or 'service <name1>, <name2>' or 'category <slug1>, <slug2>'"
---

# Bulk Write Skill

Write content for multiple services, guides, or categories in parallel by dispatching one subagent per item. Routes to the appropriate per-type skill: `/write-service`, `/write-guide`, or `/write-category`.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota` | Write content for these specific services |
| `service all` | Write content for every service that has research completed |
| `service unwritten` | Write content for services with research done but no content yet |
| `service category Email` | Write content for all services in the Email category |
| `guide all` | Write all guides that have both source and target services researched |
| `category all` | Write content for all categories |
| `category social-media, email` | Write content for these specific categories |

## Process

### Step 1: Build the item list

**For `service unwritten`** — find services where research is complete but content is empty:
```json
mcp__payload__findServices: {"where": "{\"researchStatus\": {\"equals\": \"complete\"}}", "limit": 100, "depth": 1}
```
Then filter client-side for services where `content` is null/empty.

**For `service all`** — same query but include all researched services regardless of content status.

**For `guide all`:**
```json
mcp__payload__findGuides: {"limit": 100, "depth": 1}
```
Filter for guides where both sourceService and targetService have research complete.

### Step 2: Confirm with user

Show the list and count. Ask for confirmation. Note any services that lack research (these will be skipped with a warning).

### Step 3: Dispatch parallel write agents

Use the **Agent tool** to launch one subagent per item. All agents run in parallel.

**Agent prompt template for services:**

```
You are writing content for the service "{SERVICE_NAME}" on switch-to.eu.

Use the /write skill for service content. Here is the process:

1. Fetch the service from Payload:
   mcp__payload__findServices: {"where": "{\"name\": {\"contains\": \"{SERVICE_NAME}\"}}", "limit": 1, "depth": 1}

2. Check that researchStatus is "complete". If not, return "SKIPPED: research not complete".

3. Write these fields using the research data:
   - description: 1-2 sentences, under 200 chars. What it is, where it's based, what matters.
   - features: 4-6 short tags, 2-4 words each (pills on overview page)
   - content: 150-250 words Lexical richText JSON. Opening → what's different → optional extras → "Worth knowing" h2
   - pricingTiers: structured array from research pricing data
   - For non-EU services: issues array with factual privacy concerns

   Voice: knowledgeable friend, not marketing. Short sentences. Active voice. No em dashes, semicolons, jargon.
   Consumer-friendly language: "only you can read your emails" not "zero-access encryption".
   Always include "Worth knowing" section with honest trade-offs.

4. Save via mcp__payload__updateServices with _status: "draft".

Return: service name, word count, number of pricing tiers written, any issues.
```

**Agent prompt template for guides:**

```
You are writing a migration guide for switching from "{SOURCE}" to "{TARGET}" on switch-to.eu.

Use the /write skill for guide content. Process:

1. Fetch both services and the guide from Payload.
2. Write: title, description, difficulty, timeRequired, intro (richText), beforeYouStart (richText),
   steps array (4-8 steps with title + richText content), troubleshooting (richText),
   outro (richText), missingFeatures array.
3. Save via mcp__payload__updateGuides or mcp__payload__createGuides with _status: "draft".

Return: guide title, step count, difficulty, any issues.
```

### Step 4: Collect and report

```
## Bulk Write Complete

Written: X/Y items

| Item | Type | Words | Status | Notes |
|------|------|-------|--------|-------|
| ProtonMail | Service | 220 | Done | 5 pricing tiers |
| Gmail to ProtonMail | Guide | 650 | Done | 6 steps, beginner |
| ... | ... | ... | ... | ... |

Skipped (no research): [list]
Failed: [list with reasons]
```

## Guardrails

- **Max parallel agents:** 10 at a time. Batch larger sets.
- **Research required:** Skip services without completed research. Report them.
- **Draft status:** All content is saved as draft. Nothing publishes automatically.
- **No overwrites without confirmation:** If content already exists, ask the user before overwriting.

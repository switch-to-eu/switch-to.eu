---
name: bulk-research
description: Research multiple services in parallel using subagents. Each service gets the full research pass — vendor site, pricing, privacy/GDPR, Reddit sentiment, and recent news — written to both existing research fields and the newer structured fields (userSentiment, redditMentions, recentNews). Use when asked to "research all services", "bulk research", "research these services", or need to populate research fields for many services at once.
argument-hint: "'<name1>, <name2>, ...' or 'all' or 'category <name>' or 'unresearched'"
---

# Bulk Research Skill

Research multiple services in parallel by dispatching one subagent per service. Each subagent edits its own `content/services/<slug>/en.md`.

After the batch, the changes sit in the working tree for review in `git diff`. Don't commit unless the user asks.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `ProtonMail, Tutanota, Mailbox.org` | Research these specific services |
| `all` | Research every service in `content/services/` |
| `unresearched` | Research services where `researchStatus` is "not-started" |
| `category Email` | Research all services in the Email category |
| `needs-update` | Research services where `researchStatus` is "needs-update" |

## Process

### Step 1: Build the service list

Based on the argument, grep the service files in `content/services/*/en.md` (format: `../_shared/content-files.md`). The slug is the directory name.

**For specific names:** Split the comma-separated argument, trim whitespace, and resolve each with `grep -il '^name: .*<name>' content/services/*/en.md`.

**For `all`:**
```bash
ls content/services
```

**For `unresearched`** (`not-started`, or no `researchStatus` key at all):
```bash
grep -l '^researchStatus: not-started$' content/services/*/en.md; grep -L '^researchStatus:' content/services/*/en.md
```

**For `needs-update`:**
```bash
grep -l '^researchStatus: needs-update$' content/services/*/en.md
```

**For `category X`:** match the category slug (see `ls content/categories`):
```bash
grep -l '^category: <category-slug>$' content/services/*/en.md
```

### Step 2: Confirm with user

Before dispatching agents, show the user:
- Total number of services to research
- List of service names
- Ask for confirmation to proceed

This prevents accidentally researching 100 services when the user meant 5.

### Step 3: Dispatch parallel research agents

Use the **Agent tool** to launch one subagent per service. All agents run in parallel.

**Critical rules for parallel dispatch:**
- Each agent gets a **complete, self-contained prompt** with all context it needs
- Agents do NOT share state or read from each other
- Each agent edits only its own `content/services/<slug>/en.md` (no file conflicts)
- Use `run_in_background: true` for all agents

**Agent prompt template** (one per service):

```
You are researching the service "{SERVICE_NAME}" (slug: {SLUG}) for switch-to.eu.

Use the /research skill to research this service. Here is the full process:

Read .claude/skills/research/SKILL.md, .claude/skills/_shared/content-files.md and .claude/skills/_shared/jina.md first.

1. Open the service file: content/services/{SLUG}/en.md. Read it in full.
   Set researchStatus: in-progress and lastResearchedAt: '<today>' so parallel runs don't collide.

2. Research using Jina Reader/Search via curl (see `_shared/jina.md`, key in $JINA_API_KEY) and the Reddit MCP:
   - Company basics: website, headquarters, parent company, founded year, employees, open source
   - Pricing: free tier, paid plans, enterprise, pricing page URL
   - Privacy & GDPR: data storage locations, compliance status, DPA, privacy policy URL
   - Security: certifications, breaches, audits
   - Reddit sentiment: search default subreddits (r/privacy, r/europe, r/selfhosted, r/degoogle) for the service; classify posts as positive/negative/mixed/neutral; collect snippets
   - Recent news: Jina Search with time filter, last 12 months, top 10 results by recency

3. Store findings by editing the `# Research (filled by /research)` group of content/services/{SLUG}/en.md
   with targeted Edit calls (keep group comments, key order, quoting; see `_shared/content-files.md`).
   Map all fields: gdprCompliance, gdprNotes, privacyPolicyUrl, pricingDetails, pricingUrl,
   headquarters, parentCompany, foundedYear, employeeCount, dataStorageLocations, certifications,
   openSource, sourceCodeUrl, sourceUrls, researchNotes (markdown in a |- block scalar, last key of the group),
   userSentiment (group with positive/negative/mixed counts + 2-3 sentence summary),
   redditMentions (array of {subreddit, postUrl, postTitle, sentiment, snippet, date}),
   recentNews (array of {source, url, title, date, summary}),
   researchStatus: complete, lastResearchedAt: '<today>' (quoted YYYY-MM-DD).

   Apply merge semantics: don't overwrite non-empty scalar fields with empty values.
   userSentiment / redditMentions / recentNews always replace (time-sensitive).

4. Also update the `# Listing` group if empty: location, url, freeOption, startingPrice.

5. Run the frontmatter validation snippet from `_shared/content-files.md` on the file. Bump updatedAt.
   Only edit content/services/{SLUG}/en.md. Don't touch nl.md, other services, or git.

Return a brief summary: service name, key findings, any gaps needing follow-up.
```

**Dispatch all agents in a single message** with multiple Agent tool calls. Use `subagent_type: "general-purpose"` and `run_in_background: true`.

### Step 4: Collect results

As agents complete, collect their summaries. When all are done, present a consolidated report:

```
## Bulk Research Complete

Researched: X/Y services

| Service | Status | Key Finding | Gaps |
|---------|--------|-------------|------|
| ProtonMail | Done | Swiss-based, GDPR compliant | None |
| Tutanota | Done | German-based, open source | Employee count unknown |
| ... | ... | ... | ... |

Failed: [list any that failed with reasons]
```

## Guardrails

- **Max parallel agents:** 10 at a time. If more than 10 services, batch them in groups of 10 and wait for each batch to complete before starting the next.
- **Rate limiting:** Jina and the Reddit MCP have rate limits. Batching in groups of 10 helps avoid hitting these.
- **Error handling:** If an agent fails, note it in the report but don't retry automatically. The user can re-run individual failures with `/research`.

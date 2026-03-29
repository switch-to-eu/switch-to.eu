---
name: bulk-research
description: Research multiple services in parallel using subagents. Use when asked to "research all services", "bulk research", "research these services", or need to populate Research tabs for many services at once.
argument-hint: "'<name1>, <name2>, ...' or 'all' or 'category <name>' or 'unresearched'"
---

# Bulk Research Skill

Research multiple services in parallel by dispatching one subagent per service.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `ProtonMail, Tutanota, Mailbox.org` | Research these specific services |
| `all` | Research every service in Payload |
| `unresearched` | Research services where `researchStatus` is "not-started" |
| `category Email` | Research all services in the Email category |
| `needs-update` | Research services where `researchStatus` is "needs-update" |

## Process

### Step 1: Build the service list

Based on the argument, query Payload to get the list of services to research.

**For specific names:** Split the comma-separated argument and trim whitespace.

**For `all`:**
```json
mcp__payload__findServices: {"limit": 100, "depth": 0}
```

**For `unresearched`:**
```json
mcp__payload__findServices: {"where": "{\"researchStatus\": {\"equals\": \"not-started\"}}", "limit": 100}
```

**For `needs-update`:**
```json
mcp__payload__findServices: {"where": "{\"researchStatus\": {\"equals\": \"needs-update\"}}", "limit": 100}
```

**For `category X`:**
First find the category ID, then query services:
```json
mcp__payload__findServices: {"where": "{\"category\": {\"equals\": CATEGORY_ID}}", "limit": 100}
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
- Each agent operates on a different service (no file conflicts)
- Use `run_in_background: true` for all agents

**Agent prompt template** (one per service):

```
You are researching the service "{SERVICE_NAME}" for switch-to.eu.

Use the /research skill to research this service. Here is the full process:

1. Find the service in Payload using mcp__payload__findServices with:
   {"where": "{\"name\": {\"contains\": \"{SERVICE_NAME}\"}}", "limit": 5}

2. Research using WebSearch and WebFetch:
   - Company basics: website, headquarters, parent company, founded year, employees, open source
   - Pricing: free tier, paid plans, enterprise, pricing page URL
   - Privacy & GDPR: data storage locations, compliance status, DPA, privacy policy URL
   - Security: certifications, breaches, audits
   - Public sentiment: Reddit reviews, controversies

3. Store findings via mcp__payload__updateServices with the service ID.
   Map all fields: gdprCompliance, gdprNotes, privacyPolicyUrl, pricingDetails, pricingUrl,
   headquarters, parentCompany, foundedYear, employeeCount, dataStorageLocations, certifications,
   openSource, sourceCodeUrl, researchNotes (Lexical richText JSON), sourceUrls,
   researchStatus: "complete", lastResearchedAt: today's ISO date.

4. Also update General tab if empty: location, url, freeOption, startingPrice.

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
- **Rate limiting:** The MCP server and web searches have rate limits. Batching in groups of 10 helps avoid hitting these.
- **Error handling:** If an agent fails, note it in the report but don't retry automatically. The user can re-run individual failures with `/research`.

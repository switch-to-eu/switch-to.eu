---
name: research
description: Research a digital service and store structured findings in Payload CMS. Use when asked to research a service, investigate a company, gather pricing/privacy/compliance data, or populate the Research tab on a service. Trigger phrases include "research this service", "investigate", "gather data on", "fill in research for".
argument-hint: "service name to research (e.g. 'ProtonMail', 'Mullvad VPN')"
---

# Service Research Skill

Research a digital service and store structured findings in Payload CMS via MCP.

## Process

### Step 1: Find the service in Payload

Use `mcp__payload__findServices` with a where clause to find the service by name:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 5}
```

If not found, ask the user whether to create a new service entry or check the name.

### Step 2: Research the service

Use `WebSearch` and `WebFetch` to gather data on these topics:

**Company basics:**
- Official website URL
- Headquarters location (city, country)
- Parent company (if any)
- Founded year
- Approximate employee count
- Open source status + repo URL if applicable

**Pricing:**
- Free tier availability and limits
- Paid plans with prices (monthly/yearly)
- Enterprise pricing if available
- Fetch the pricing page URL

**Privacy & GDPR:**
- Where user data is stored (countries/regions)
- GDPR compliance status (compliant, partial, non-compliant, unknown)
- Data Processing Agreement availability
- Privacy policy URL
- Notable privacy practices or concerns
- End-to-end encryption status

**Security & compliance:**
- Security certifications (ISO 27001, SOC 2, etc.)
- Known data breaches (search: "[service name] data breach")
- Security audit history

**Public sentiment:**
- Search Reddit: "[service name] site:reddit.com review"
- Note common praise and complaints
- Any notable controversies

### Step 3: Store findings in Payload

Use `mcp__payload__updateServices` with the service ID. Map findings to these fields:

| Research finding | Payload field |
|-----------------|---------------|
| GDPR status | `gdprCompliance` (one of: compliant, partial, non-compliant, unknown) |
| GDPR details | `gdprNotes` |
| Privacy policy link | `privacyPolicyUrl` |
| Pricing breakdown | `pricingDetails` |
| Pricing page link | `pricingUrl` |
| City, Country | `headquarters` |
| Parent org | `parentCompany` |
| Year | `foundedYear` |
| Employee range | `employeeCount` |
| Data center countries | `dataStorageLocations` (array of `{location: "country"}`) |
| Certifications | `certifications` (array of `{certification: "name"}`) |
| Is open source? | `openSource` |
| Repo URL | `sourceCodeUrl` |
| Research summary | `researchNotes` (use plain text, not richText JSON) |
| Source URLs used | `sourceUrls` (array of `{url: "...", label: "..."}`) |
| Status | `researchStatus`: "complete" |
| Date | `lastResearchedAt`: today's date (ISO format) |

Also update the General tab fields if they're empty or outdated:
- `location` (country)
- `url` (official website)
- `freeOption` (boolean)
- `startingPrice` (e.g. "€4.99/month")

### Step 4: Report summary

After saving, report to the user:
- Service name and ID
- Key findings (1-2 sentences each for: pricing, privacy, sentiment)
- Fields that were updated
- Any gaps that need manual follow-up

## Important notes

- Always cite your sources. Every claim in researchNotes should reference a sourceUrl.
- If you can't verify something, say "unverified" rather than guessing.
- For GDPR compliance, look for: DPA availability, data processing location, privacy shield/adequacy decisions. Default to "unknown" if unclear.
- The `researchNotes` field accepts plain text. Do not try to construct Lexical richText JSON. Just write clear, factual paragraphs.
- Set `researchStatus` to "in-progress" at the start, "complete" when done.

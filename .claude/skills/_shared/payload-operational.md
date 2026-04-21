# Shared Helper: Payload Operational Collections

Patterns for writing to the operational collections (`pageAudits`, `contentOpportunities`) and for the new structured fields on `services`. These collections are populated by SEO skills — not by authors — and are reviewed in-admin rather than published.

## Creating a page audit

Tool: `mcp__Payload__createPageAudits`

Minimal required fields:

```json
{
  "pageType": "service" | "guide",
  "service": "<service-id>",    // required when pageType === "service"
  "guide": "<guide-id>",         // required when pageType === "guide"
  "priority": "high" | "medium" | "low",
  "status": "new",
  "auditedAt": "YYYY-MM-DD",
  "summaryTitle": "<slug>-<YYYY-MM-DD>"
}
```

Set the discriminator (`pageType`) and populate only the matching relation field — `service` OR `guide`, not both. `@payloadcms/plugin-mcp` doesn't support Payload's polymorphic relations, so this discriminator + two single-target relations is the idiomatic pattern for this project.

Optional groups and arrays can be added progressively; nothing else is required.

## Creating a content opportunity

Tool: `mcp__Payload__createContentOpportunities`

Minimal required fields:

```json
{
  "type": "missing-guide" | "missing-service" | "almost-ranking" | "new-category",
  "priority": "high" | "medium" | "low",
  "status": "new",
  "discoveredAt": "YYYY-MM-DD",
  "title": "<human readable>",
  "targetKeyword": "<lowercase query>",
  "reasoning": "<Lexical richText — see _shared/lexical-json.md>"
}
```

## Updating structured research fields on a service

Tool: `mcp__Payload__updateServices`

Partial update is supported — only pass fields you want to change. For the new phase-3 fields:

```json
{
  "id": "<service-id>",
  "userSentiment": {
    "positive": 0,
    "negative": 0,
    "mixed": 0,
    "summary": "2-3 sentence consumer-facing summary",
    "lastUpdated": "YYYY-MM-DD"
  },
  "redditMentions": [
    {
      "subreddit": "r/privacy",
      "postUrl": "https://reddit.com/...",
      "postTitle": "...",
      "sentiment": "positive" | "negative" | "mixed" | "neutral",
      "snippet": "...",
      "date": "YYYY-MM-DD"
    }
  ],
  "recentNews": [
    {
      "source": "TechCrunch",
      "url": "https://...",
      "title": "...",
      "date": "YYYY-MM-DD",
      "summary": "1-sentence consumer-facing summary"
    }
  ]
}
```

## Merge semantics for research fields

When the expanded `research` skill re-runs on a service that already has data:
- Scalar fields: overwrite only if new value is non-empty.
- Array fields on `researchFields` (e.g. `certifications`): replace wholesale if new array is non-empty.
- `userSentiment`, `redditMentions`, `recentNews`: always replace with fresh data (time-sensitive).
- `researchNotes`: always regenerate.

## Querying audits/opportunities by their target page

Because we use a discriminator + two single-target relations (not a polymorphic relation), queries target the specific relation field:

```json
// find all audits of a specific service
{
  "where": {
    "and": [
      { "pageType": { "equals": "service" } },
      { "service": { "equals": "<service-id>" } }
    ]
  }
}

// find all audits of guides
{
  "where": { "pageType": { "equals": "guide" } }
}
```

## Rate limits

No practical limit — Payload runs locally. Batch writes in loops are fine.

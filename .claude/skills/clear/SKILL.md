---
name: clear
description: Clear all AI-populated fields on a service in Payload CMS, resetting it for fresh research. Use when asked to "clear a service", "reset a service", "wipe service data", "start fresh on a service", or "clean out a service before researching".
argument-hint: "service name (e.g. 'ProtonMail', 'Mullvad VPN')"
---

# Clear Service Skill

Reset all AI-populated fields on a service in Payload CMS so it can be re-researched from scratch.

## What gets cleared

Everything except the identity/structural fields that define what the service *is*:

**Kept** (not cleared): `slug`, `name`, `region`, `category`, `location`, `url`

**Cleared to null/empty:**

- **General tab:** `description` → `""`, `freeOption` → `false`, `startingPrice` → `null`, `features` → `[]`, `pricingTiers` → `[]`, `tags` → `[]`, `screenshot` → `null`, `logo` → `null`
- **Content tab:** `content` → `null`, `issues` → `[]`, `recommendedAlternative` → `null`
- **Research tab:** `researchStatus` → `"not-started"`, `lastResearchedAt` → `null`, `gdprCompliance` → `"unknown"`, `gdprNotes` → `null`, `privacyPolicyUrl` → `null`, `pricingDetails` → `null`, `pricingUrl` → `null`, `headquarters` → `null`, `parentCompany` → `null`, `foundedYear` → `null`, `employeeCount` → `null`, `dataStorageLocations` → `[]`, `certifications` → `[]`, `openSource` → `false`, `sourceCodeUrl` → `null`, `researchNotes` → `null`, `sourceUrls` → `[]`
- **SEO tab:** `metaTitle` → `null`, `metaDescription` → `null`, `keywords` → `[]`, `ogTitle` → `null`, `ogDescription` → `null`, `ogImage` → `null`, `seoScore` → `null`, `seoNotes` → `null`, `lastSeoReviewAt` → `null`
- **Status:** `_status` → `"draft"`

## Process

### Step 1: Find the service in Payload

Use `mcp__payload__findServices` with a where clause to find the service by name:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 5}
```

If multiple matches are returned, list them and ask the user which one to clear.
If no match is found, tell the user and stop.

### Step 2: Confirm with the user

Before clearing, show the user:
- Service name, slug, and region
- Current `researchStatus` and `_status`

Ask: **"This will wipe all content, research, and SEO data for [Service Name]. The slug, name, region, category, location, and URL will be kept. Proceed?"**

Only continue if the user confirms.

### Step 3: Clear English locale fields

Use `mcp__payload__updateServices` to reset all fields:

```json
{
  "id": "SERVICE_ID",
  "locale": "en",
  "description": "",
  "freeOption": false,
  "startingPrice": null,
  "features": [],
  "pricingTiers": [],
  "tags": [],
  "screenshot": null,
  "logo": null,
  "content": null,
  "issues": [],
  "recommendedAlternative": null,
  "researchStatus": "not-started",
  "lastResearchedAt": null,
  "gdprCompliance": "unknown",
  "gdprNotes": null,
  "privacyPolicyUrl": null,
  "pricingDetails": null,
  "pricingUrl": null,
  "headquarters": null,
  "parentCompany": null,
  "foundedYear": null,
  "employeeCount": null,
  "dataStorageLocations": [],
  "certifications": [],
  "openSource": false,
  "sourceCodeUrl": null,
  "researchNotes": null,
  "sourceUrls": [],
  "metaTitle": null,
  "metaDescription": null,
  "keywords": [],
  "ogTitle": null,
  "ogDescription": null,
  "ogImage": null,
  "seoScore": null,
  "seoNotes": null,
  "lastSeoReviewAt": null,
  "_status": "draft"
}
```

### Step 4: Clear Dutch locale fields

Use `mcp__payload__updateServices` again with `locale: "nl"` to clear localized fields in Dutch:

```json
{
  "id": "SERVICE_ID",
  "locale": "nl",
  "description": "",
  "startingPrice": null,
  "features": [],
  "content": null,
  "issues": [],
  "metaTitle": null,
  "metaDescription": null,
  "keywords": [],
  "ogTitle": null,
  "ogDescription": null
}
```

### Step 5: Confirm success

Tell the user:
- **"[Service Name] has been cleared and set to draft. All content, research, and SEO data has been wiped for both EN and NL locales."**
- **"Identity fields kept: slug, name, region, category, location, URL."**
- **"Ready for `/research [Service Name]`."**

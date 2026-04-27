---
name: payload-rich-text-edit
description: Surgically edit Payload CMS rich-text fields via the Payload MCP. Swap link URLs across all rich-text fields of a doc (including per-step `content` for guides), with optional visible-text rewriting. Pure MCP — no scripts, no file paths. Use when fixing broken outbound links from an SEO crawl, retargeting a vendor's canonical URL, or otherwise rewriting URLs inside published content.
argument-hint: "describe the change — e.g. 'fix broken links from the Ahrefs CSV'"
---

# Payload rich-text edit

Edit rich-text URL references in Payload CMS docs through one declarative MCP tool, `mcp__Payload__replace_link_in_doc`. The MCP server walks the Lexical tree on the server side, so the LLM never has to handle 30+ KB of JSON.

## When to use

- Broken outbound links surfaced by Ahrefs / GSC / similar.
- Vendor changed their canonical URL (e.g. `proton.me/support/knowledge-base` → `proton.me/support`, or `ec.europa.eu/odr` → `consumer-redress.ec.europa.eu/index_en|nl`).
- Locale-specific replacement (an EN landing page vs. an NL landing page on the same vendor domain).

## Process

### Step 1 — gather targets

Group the broken URLs by `(collection, slug)`. For an SEO CSV, parse it once and collect `{ collection, slug, locale_hits, broken_url }`. If the user already named the docs, skip parsing.

### Step 2 — verify replacement URLs (read-only `curl -I`)

Don't trust an obvious replacement. Hit each candidate URL once with `curl -I` and confirm 200 (or a 3xx that lands on 200). When a vendor has locale-specific pages (`/index_en`, `/index_nl`), verify both.

### Step 3 — dry-run per doc

For each `(collection, slug)` pair, call `replace_link_in_doc` with `dryRun: true`. The tool returns per-locale, per-field hit counts and totals.

```
mcp__Payload__replace_link_in_doc({
  collection: "pages",
  slug: "terms",
  oldUrl: "https://ec.europa.eu/odr",
  newUrl: "https://consumer-redress.ec.europa.eu/index_en",  // see locale override below
  newUrlByLocale: {
    en: "https://consumer-redress.ec.europa.eu/index_en",
    nl: "https://consumer-redress.ec.europa.eu/index_nl"
  },
  alsoText: true,
  dryRun: true
})
```

Read the report. Decide:

- Each link's visible text — is it descriptive ("Read the docs") or the URL itself? `alsoText: true` rewrites text that exactly equals the old URL, leaving descriptive text untouched. Default is `true`; set `false` only if you explicitly want the URL change to stay invisible.
- Locale handling — `newUrlByLocale` overrides `newUrl` per locale. When the replacement is the same in every locale, just pass `newUrl`.
- Hit count looks right? If it's zero, the URL probably doesn't appear in this doc at all, or the replacement domain is locale-prefixed differently than expected.

### Step 4 — apply

Drop `dryRun: true` and re-run. The tool walks every rich-text field on the doc (collection-aware), every step's `content` for guides, and saves the doc once per locale that actually had hits. The response includes the per-locale, per-field counts plus a total.

### Step 5 — verify on the live site

Wait a few seconds for revalidation, then `curl` the page and grep for the new URL. For visible-text checks, also confirm the link text rendered correctly. For high-visibility pages (terms, popular guide), screenshot via `dev-browser:dev-browser` as well.

## Tool reference

`mcp__Payload__replace_link_in_doc` — server-side lexical walk + replace + save.

| arg | required | purpose |
| --- | --- | --- |
| `collection` | yes | one of: `pages`, `guides`, `services`, `categories`, `landing-pages` |
| `slug` *or* `id` | yes | how to identify the doc; slug is usually clearer |
| `oldUrl` | yes | exact URL to find on link / autolink nodes |
| `newUrl` | yes | replacement URL (used for any locale not in `newUrlByLocale`) |
| `newUrlByLocale` | no | per-locale override map, e.g. `{ en: "...", nl: "..." }` |
| `alsoText` | no | rewrite visible text when it equals the old URL — default `true` |
| `dryRun` | no | report hits without saving — default `false` |

What the tool walks per collection:

- `pages`, `services`, `categories`, `landing-pages`: the `content` rich-text field, both locales.
- `guides`: `intro`, `beforeYouStart`, `troubleshooting`, `outro` rich-text fields **plus** every `steps[i].content` rich-text field, both locales.

## What this tool intentionally doesn't do

- **Doesn't update simple non-rich-text fields.** Use the existing `mcp__Payload__updateServices` / `updatePages` etc. for things like `affiliateUrl` — those are tiny string args, no MCP-size problem.
- **Doesn't add or remove links.** It only rewrites `fields.url` on existing link nodes. Use the Payload admin for structural edits.
- **Doesn't touch internal links** (e.g. `/privacy`). The skill scope is external URL repair.

## Edge cases

- **Live site still shows the old URL after save** — Next.js page caches via `unstable_cache` with content tags. Either bust the relevant tag (`pages`, `guides`, `services`) or wait the revalidate window.
- **Hit count differs between EN and NL** — expected when the broken URL only appeared in one locale's content.
- **Vendor moved to a totally different platform** — don't rewrite the URL through this tool; the link probably needs replacing with a different *target* anchored to different visible text. That's a content edit, not a URL swap.

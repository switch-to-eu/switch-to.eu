# SEO Skills — Progress Snapshot

**Snapshot taken:** 2026-04-22
**Plan:** `docs/superpowers/plans/2026-04-21-seo-skills-architecture.md`
**Spec:** `docs/superpowers/specs/2026-04-21-seo-skills-architecture-design.md`
**Branch:** `rework`

## Where we are

Phase 1 authoring is **done in code**, not yet verified end-to-end. A SERP-provider blocker is waiting on a decision.

## What shipped

12 commits on `rework` since the spec landed:

| Commit | What |
|---|---|
| `5eb383f` | Create PageAudits collection file |
| `a265baa` | Register PageAudits in Payload + MCP plugin |
| `444d342` | `_shared/gsc.md` helper |
| `323584a` | `_shared/apify.md` helper |
| `126d033` | `_shared/lighthouse.md` helper |
| `cdab093` | `_shared/payload-operational.md` helper |
| `8fb8916` | `seo-audit` SKILL.md |
| `afd222c` | `docs/superpowers/seo-stack-setup.md` |
| `b7d7118` | Fix: discriminator + single-target relations in PageAudits (plugin-mcp polymorphic-relations bug) |
| (uncommitted) | URL construction fix — www + `/services/eu/<slug>` path |
| (uncommitted) | `.mcp.json` — user's improvement to source tokens from `.env` via shell wrapper |

## Phase 1 task status

| # | Task | Status |
|---|---|---|
| 0 | Pre-flight verification | ✓ done |
| 1 | Create PageAudits collection file | ✓ done |
| 2 | Register PageAudits in Payload | ✓ done |
| 3 | Smoke-test MCP exposure of PageAudits | ✓ done (via direct MCP curl after API-key permission fix) |
| 4 | `_shared/gsc.md` | ✓ done |
| 5 | `_shared/apify.md` | ✓ done |
| 6 | `_shared/lighthouse.md` | ✓ done |
| 7 | `_shared/payload-operational.md` | ✓ done |
| 8 | `seo-audit` SKILL.md | ✓ done |
| 9 | Dry-run smoke test | **BLOCKED — SERP provider** |
| 10 | Live 3-pilot run | blocked on 9 |
| 11 | Forced-failure test | blocked on 9 |
| 12 | `seo-stack-setup.md` | ✓ done |

Phases 2 and 3 not started.

## Active blocker — SERP provider

`apify/google-search-scraper` is not runnable on the **Apify Creator plan** (restricted to "Universal only" actors — Google Search Scraper charges a per-call surcharge, so it's not Universal). The 7 Universal actors (Playwright, Puppeteer, Cheerio, etc.) are generic browser automation — not worth building a DIY Google scraper on top of them for our ~40 searches/month volume.

### Decision pending

User needs to pick one:

- **A. Serper.dev** — 2500 free one-time searches (covers ~60 months at our volume), clean JSON API, no CC. Recommended.
- **B. Jina Search (`s.jina.ai`)** — reuses existing Jina API key, shares 10M-token budget.
- **C. SearXNG local Docker** — $0 unlimited, ~10 min to set up.

Once decided, work to unblock:

1. Install chosen SERP MCP / wrapper.
2. Edit `.claude/skills/_shared/apify.md` → rename to whichever provider, or split into `_shared/serper.md` / `_shared/searxng.md`.
3. Edit `.claude/skills/seo-audit/SKILL.md` step 4 ("Scrape the SERP") to call the new tool.
4. Re-run Task 9 dry-run.

`apify/website-content-crawler` can also be dropped entirely — Jina Reader handles our scraping needs, Playwright-on-host handles the JS-heavy stragglers. Saves us needing to fix `website-content-crawler` too if it has the same "not Universal" issue.

## Findings worth recording

These surfaced during Task 9 attempts and should be reflected in the skill (some already are, some still open):

1. **Plugin-mcp can't handle Payload polymorphic relations.** Root cause: `simplifyRelationshipFields` strips all `$ref` oneOf options, schema becomes undefined, `JSON.parse(JSON.stringify(undefined))` crashes registration. **Fix shipped** (`b7d7118`) — use discriminator + two single-target relations. **Must apply same pattern to `ContentOpportunities.resultingContent` in Task 13.**

2. **Plugin-mcp silently skips tool registration when the API key's permission JSON doesn't include the new collection.** API keys are created with a snapshot of collection permissions; new collections don't auto-propagate. Fix: edit key at `/admin/collections/payload-mcp-api-keys` and tick new collection's boxes. **Will recur with `contentOpportunities` and any other new collection.** Worth documenting in `seo-stack-setup.md` as part of this spec.

3. **GSC URL variants from the www migration.** Every page has impressions spread across 2-3 URL variants: `switch-to.eu/en/<path>` (pre-migration), `www.switch-to.eu/<path>` (no `/en/`, odd intermediate), `www.switch-to.eu/en/<path>` (current canonical). Example: proton-drive has 2601/893/8 impressions across the three. The skill's GSC query should use `contains` on the path (e.g. `/services/eu/proton-drive`) rather than `equals` on the full canonical URL — otherwise it misses 99% of historical data on any pre-migration page.
   **Not yet shipped as a skill edit.** When we unblock, update `SKILL.md` step 2 to use path-contains filter.

4. **Slug drift.** Some URLs in GSC are under old slugs (e.g. `/services/eu/protonmail` — no dash — has 48 impressions; the current Payload slug is `proton-mail`). The skill should be aware that GSC history follows old URLs; if no data found at the constructed canonical URL, attempt a broader `contains` match on the slug stem before giving up.

5. **`.mcp.json` shell-wrapper secret sourcing.** User updated `.mcp.json` to source `PAYLOAD_MCP_API_KEY` and `APIFY_API_TOKEN` from `./.env` via a `sh -c '. ./.env && exec ...'` wrapper. Cleaner than inlining tokens. **Uncommitted** — user hasn't committed it yet. The `seo-stack-setup.md` doc should reflect this pattern when either of us commits it.

## Next actions when resumed

1. **User picks** SERP provider (A / B / C above).
2. **Commit** the pending URL-construction fix + `.mcp.json` changes.
3. **Rewire** `_shared/apify.md` → drop it (or keep for `website-content-crawler` only if we keep that), add `_shared/<provider>.md`.
4. **Update** `seo-audit/SKILL.md` step 4 for new SERP provider, step 2 for URL-variant handling (path-contains).
5. **Rerun** Task 9 dry-run against `proton-drive` (known-good GSC data: 88 queries, ~2.6k impressions).
6. **Proceed** to Tasks 10, 11, then Phase 2.

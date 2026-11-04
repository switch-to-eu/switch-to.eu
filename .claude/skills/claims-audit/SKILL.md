---
name: claims-audit
description: Check the factual claims on published service listings and migration guides again, one by one, against the vendors' current pages. Marks each claim current, changed, unverifiable or overclaimed and writes a report to docs/claims-audits/. With --fix, rewrites the claims in the content files. Use when asked to "audit claims", "check if listings are out of date", "verify prices", "are our comparisons still true", "stale content check", "claims audit". For a full research refresh of a service, see research. For news articles, see news-check.
argument-hint: "'<service or guide slug>' (comma-separate for several); 'stale' for the 10 services with the oldest evidence; 'all'; add --fix to apply the rewrites"
---

# Claims Audit Skill

Every listing makes public claims about companies. This skill checks them again, one by one, against each company's current pages. It starts from what the published page says, not from the research fields. That is the difference from `/research`, which gathers a fresh profile of the service.

Read these first:
- `../_shared/evidence.md` — the rules, the claim states and the wording
- `../_shared/content-files.md` — file layout, field shapes, editing rules, validation
- `../_shared/jina.md` — reading vendor pages
- `../_shared/voice.md` — tone for any rewritten public text

## Inputs

- One or more slugs from `content/services/` or `content/guides/`.
- `stale`: the 10 published services with the oldest evidence (newest `checkedAt` in `sourceUrls`, else `lastResearchedAt`):

  ```bash
  for f in content/services/*/en.md; do
    grep -q '^draft: true' "$f" && continue
    d=$(grep -oE "^  checkedAt: '[0-9]{4}-[0-9]{2}-[0-9]{2}'" "$f" | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}" | sort | tail -1)
    [ -n "$d" ] || d=$(grep -oE "^lastResearchedAt: '[0-9]{4}-[0-9]{2}-[0-9]{2}" "$f" | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}")
    echo "${d:-0000-00-00} $(basename "$(dirname "$f")")"
  done | sort | head -10
  ```

- `all`: every service and guide without `draft: true`. Ask before you start a run of more than 10 items.
- `--fix`: apply the rewrites. Without it, the skill writes only the report and changes no content file.

More than 3 items: dispatch one subagent per item with the Agent tool (`run_in_background: true`, at most 10 at once), like the bulk skills. Run `pnpm knowledge:index` once before you dispatch. Give each subagent this file, the slug and the `--fix` setting. Each one returns its claim table and the fixes it made. The main agent writes the batch report.

## Step 1: List the claims

Read the item's `en.md` in full. For a guide, also read the `en.md` of its `sourceService` and `targetService`.

List every checkable claim and where it lives:

| Where | What to extract |
|---|---|
| `description`, body, `faqs`, `gdprNotes` | Numbers, prices, limits, locations, ownership, incidents, comparisons ("cheaper than Gmail"), absences ("no ads", "doesn't scan") |
| `metaTitle`, `metaDescription`, `ogTitle`, `ogDescription` | The same kinds of fact. Search results show these fields. |
| `features` | Each tag ("End-to-end encrypted", "Free tier available") |
| `pricingTiers`, `pricingDetails` | Each tier's name, price, billing note and feature lines |
| `freeOption`, `startingPrice`, `location`, `headquarters`, `parentCompany`, `dataStorageLocations`, `certifications`, `openSource`, `gdprCompliance` | The value. The service page shows all of these. |
| `issues`, `oneLineProblem`, `whatYoudGain`, `whatYoudLose` (non-EU pages) | Each item |
| Guide `missingFeatures`, `timeRequired`, steps | Each missing feature. Each menu path, import limit or export format in the steps. |

Out of scope: `researchNotes`, `foundedYear`, `employeeCount` and the Reddit fields. The site doesn't show them. Fix them only when they repeat a fact that you mark changed.

Skip framing and advice ("If you mostly read email on your phone...") unless a fact sits inside it.

One id per fact (`k1`, `k2`, ...), not per place. When the same fact appears in several fields, give it one id and list every field in the "Where" column. The totals count facts.

## Step 2: Gather current evidence

For each claim, find the source that should prove it, in this order:

1. **The vendor's own current page**: pricing, plans, features, help docs, privacy policy, transparency report, security page. Start from the `sourceUrls` of the service file. Follow links from those pages to other pages on the vendor's own domain when a claim needs them. Read each URL once per run and reuse it for every claim it covers. Use Jina Reader (`_shared/jina.md`). Without `JINA_API_KEY`, use Reader keyless as `_shared/jina.md` describes. If the Exa MCP is connected, `web_fetch_exa` is a second option.
2. **Knowledge**: `pnpm -s knowledge node services/<slug> 2>/dev/null`. If it says there is no store, run `pnpm knowledge:index` once. Under Events it lists the open flags (`flag`) and the service's `recentNews` (`news`). The Links line ending `provides → this` names the company. `pnpm -s knowledge node <company-id> 2>/dev/null` gives that company's fact lines, newest first, with their claim refs. A derived company ("no knowledge note yet") has none. Read the claim behind a fact or flag with `pnpm -s knowledge node <source-slug> 2>/dev/null`. A newer fact line or flag can show a change before the vendor page does.
3. **Search** (Jina Search or `web_search_exa`), only to find the right vendor page or a dated incident. A search result never proves a current price.

Wikipedia, review sites and comparison sites can point you to a primary source. Alone, they don't prove a price, a limit, a feature or a data location: without a primary source, those claims are **unverifiable**. For a dated incident, a news article is a primary source. Add it to `sourceUrls`.

The site shows prices in euros. If a vendor page renders in another currency, find the EUR price on the vendor's help or plan pages. If no vendor page gives a EUR price, the price is **unverifiable**. Never convert a currency yourself.

If a page doesn't load, every claim that depends on it is **unverifiable** for this run, not overclaimed. Record which URL failed.

Never use your own memory as evidence. Each verdict rests on a page read in this run or a knowledge claim.

## Step 3: Mark each claim

Use the four states from `_shared/evidence.md`: current, changed, unverifiable, overclaimed. A claim that the source contradicts is **changed** when the source gives a different value, and **overclaimed** when our text says more than the source. Edge cases:

- The price matches but the billing period differs (monthly vs yearly, yearly vs every 2 years): **changed**.
- A yearly price that is lower than the monthly price is the regular yearly price, even when the page calls it "20% off". Record it with `billingNote: billed annually`. An introductory price holds only for the first term or for a limited time. Don't record it as the price. Mention it in the report.
- "No X" or "doesn't have X" with only a pricing page behind it: **overclaimed**, even if X is in fact missing. Look for a help page that confirms it. If you find one, it is **current**.
- A motive, a trend from one look, or a Reddit view stated as fact: **overclaimed**.
- A self-declaration in `certifications` ("GDPR compliant") is not a certification: **overclaimed**. Keep it as a feature tag if the company states it.
- A claim that is true but needs an attribution, a date or more precision ("doesn't log IP addresses" without "Its privacy policy says", "100 million accounts" without the year): **current**, plus a wording fix.

Keep the evidence for every verdict: the URL, a short quote (under 15 words) or the fact line, and today's date.

## Step 4: Write the report

One file per run: `docs/claims-audits/<YYYY-MM-DD>-<slug>.md`, or `<YYYY-MM-DD>-batch.md` for several items. Create the folder if it's missing.

The example rows below use a made-up service. Never copy their values.

```markdown
# Claims audit: <name> (<YYYY-MM-DD>)

Item: content/services/<slug>/en.md
Claims: <n> · current <n> · changed <n> · unverifiable <n> · overclaimed <n>
Sources read: <n> (<n> failed: <urls>). Reader keyless: yes/no. Search: yes/no.
Knowledge: <open flags, entity fact lines used, or "none">

## Needs a fix

| Id | Where | Claim | State | Evidence | Fix |
|---|---|---|---|---|---|
| k4 | pricingTiers[1].price, pricingDetails | €5/month | changed | examplemail.eu/plans: "€6/month billed yearly" (2026-01-15) | €6/month, billed annually |
| k9 | body (Worth knowing) | "No desktop app" | overclaimed | Not on the plans page. No help page found. | Remove, or "check that the apps cover what you need" in Worth knowing |

## Wording fixes

True claims that need an attribution, a date or more precision.

| Id | Where | Claim | Evidence | Fix |
|---|---|---|---|---|
| k12 | body | "Doesn't log your IP address" | examplemail.eu/privacy: "we do not store IP addresses" | "Its privacy policy says it doesn't log your IP address." |

## Current

| Id | Where | Claim | Evidence |
|---|---|---|---|

## Also affected

Other files that repeat a changed fact (guides, category page, the non-EU page that recommends this service), and the localized fields whose Dutch text now differs.
```

Order "Needs a fix" by reach: public text first (`description`, meta and OG fields, `pricingTiers`, `features`, body, `faqs`, `issues`, `gdprNotes`), then research fields.

## Step 5: Apply the fixes (`--fix` only)

- **changed**: write the new value. Update the matching `sourceUrls` entry with `checkedAt: '<today>'`, or add one. A price change updates `pricingTiers`, `startingPrice`, `freeOption` and `pricingDetails` together.
- **unverifiable**: remove it from public text. In research fields, soften it to "not listed (as of <Month YYYY>)". Don't replace it with a different guess.
- **overclaimed**: rewrite it to what the evidence supports, or remove it.
- **current**: set `checkedAt: '<today>'` on the source entry that confirmed it. Apply its wording fix, if it has one.
- A primary source that confirmed a claim but isn't in `sourceUrls` yet: add it with `checkedAt: '<today>'`.
- Fix a shared fact everywhere it appears. `grep -rl "<slug>" content/` finds the guides, the category page and the non-EU page with `recommendedAlternative: <slug>`.
- Follow `_shared/content-files.md`: targeted Edit calls, bump `updatedAt`, run the validation snippet. Don't touch `nl.md`. List the changed localized fields for `/translate`.
- Don't add or remove `draft`. Don't commit. The review is the `git diff`.
- If more than half of the claims are **changed**, don't patch them one by one. Stop, and recommend `/research <slug>` followed by `/write service <slug>`. The profile is out of date, not one claim.

## Output

Per item:

```
✓ claims-audit: example-mail
  Claims: 40 · current 30 · changed 4 · unverifiable 2 · overclaimed 4 · wording fixes 3
  Changed: Plus €5 → €6/month (billed annually) · free storage 1 GB → 2 GB
  Fixed: 11 claims in content/services/example-mail/en.md        (--fix only)
  Needs Dutch update: description, faqs[2]
  Report: docs/claims-audits/2026-01-15-example-mail.md
```

Batch: `N items · M claims · X changed · Y unverifiable · Z overclaimed`, then the items ordered by the number of claims that need a fix.

## Cost per item

10 to 25 Jina Reader calls, 0 to 2 searches. No Reddit. A service with many plans has 50 or more claims. Keyless Reader with a 3-second wait takes about 10 minutes per service. With the key, about 5 minutes.

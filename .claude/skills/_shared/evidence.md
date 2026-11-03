# Shared Helper: Evidence Rules

Reference doc for every skill that writes, rewrites or checks claims about a service. Not an invocable skill.

Every listing makes public claims about a company: prices, plan limits, features, where data is stored, who owns it, what went wrong. Each claim must survive a reading by that company's own team. If it can't, soften it or cut it.

Adapted from the "Evidence Discipline" rules in [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (`skills/competitors`, MIT license).

## The rules

1. **Not listed is not absent.** A pricing page without a feature is evidence about the page, not about the product. Write "not listed on their pricing page (as of November 2026)", or leave the point out. Write "no X" or "doesn't have X" only when the vendor's docs, help pages or a hands-on test confirm it.
2. **Date what changes.** Prices, plan limits, free-tier limits, data locations, certifications and ownership change. Record when we checked them (see **Where dates go**). Don't write "currently" or "now" without a dated source behind it.
3. **One look is a snapshot.** A single visit can't support a trend ("hasn't raised prices in years", "no new features since 2024"). A trend needs dated history: a changelog, a dated news item, an archived page, or older fact lines in `knowledge/entities/`.
4. **What changed, not why.** "ExampleMail moved custom domains to the paid plan" is a fact. "ExampleMail is squeezing free users" is a guess. Leave motives out unless the company stated them in public. Then attribute them: "ExampleMail says...". (ExampleMail is made up. The examples in this file are patterns, not facts.)
5. **Keep three layers apart.** What the source says. What it means for the reader. What we recommend. Our reading must never pass as the vendor's statement. Signal the layer in the text: "Tuta says...", "In practice...", "If you...".
6. **Every checkable claim has a source.** Numbers, prices, limits, locations, certifications, incidents and ownership trace to a `sourceUrls` entry, a `recentNews` item, or a knowledge claim (`[[source#cN]]`).
7. **The vendor's own page wins for current facts.** For prices, limits, features and data locations, the vendor's current page is the primary source. Reviews, news and Reddit support incidents and sentiment, not current prices. Wikipedia and review sites can lead you to a primary source, but alone they don't prove a current fact. Reddit is opinion: attribute it ("Some Reddit users report..."), never state it as fact.
8. **Practices only the company can see get attributed.** Logging, staff access, deletion and encryption claims come from the company. Attribute them at least once ("Tuta's privacy policy says it doesn't log IP addresses") unless an independent audit confirms them.
9. **Same bar for EU and non-EU.** Don't soften EU services or harden non-EU ones. A trade-off of an EU service needs the same evidence as an issue of a US service.

## Where dates go

- `sourceUrls[].checkedAt: 'YYYY-MM-DD'` is the date we last read that page. `/research` and `/claims-audit` set it on every source they read. The site doesn't show it yet.
- `pricingDetails` and `researchNotes` give prices "(as of <Month YYYY>)". Example: `Plus: €5/month billed yearly (as of November 2026)`.
- `lastResearchedAt` is the date of the last full research run. It doesn't prove that every claim in the file was checked on that date.
- Public fields (`description`, body, `features`, `pricingTiers`, `issues`, `whatYoudLose`, `faqs`, guide text) don't carry dates inline. Their evidence lives in the research fields of the service file.

## Wording

| Evidence | Write | Don't write |
|---|---|---|
| Vendor docs confirm it's missing | "No desktop app." | |
| Only missing from the pricing or feature page | Leave it out of public text. In research fields: "Desktop app not listed on the features page (as of November 2026)." | "No desktop app." |
| One or two Reddit threads | "Some Reddit users report sync problems." | "Sync is unreliable." |
| Company statement about its own practice | "Tuta's privacy policy says it doesn't log IP addresses." | "Tuta never logs IP addresses." |
| Independent audit or certification | "Passed an independent security audit in 2025." | "Proven secure." |
| Price seen once | "€5/month (as of November 2026)" in `pricingDetails` | "Has always cost €5." |
| Dated change, with a dated source | "In March 2026, ExampleMail raised Plus to €6." | "ExampleMail keeps raising prices." |

## Claim states

`/claims-audit` marks each claim it checks with one of these states.

| State | Meaning | Action |
|---|---|---|
| **current** | The source still says it. | Set `checkedAt` on the source to today. If the wording needs an attribution, a date or more precision, list it as a wording fix. |
| **changed** | The source states a different value or fact: price, limit, plan name, location. | Rewrite to the new fact and update the source entry. |
| **unverifiable** | No current primary source confirms it or rules it out. | Soften to "not listed (as of ...)" in research fields, or remove it from public text. |
| **overclaimed** | The claim says more than the source ("all your data" where the source says "your mailbox", "owned by" where it says "main shareholder"), or nothing backs it: an unconfirmed "no X", a guessed motive, a trend from one look, an opinion stated as fact. | Rewrite to what the evidence supports, or remove it. |

"Changed" says nothing about when the fact changed. From one look we can't tell whether the vendor changed it or our text was wrong from the start. So never write "X raised the price" without a dated source for the change (rule 3).

`/news-check` uses other states (supported, overstated, unsupported, contradicted), because it checks articles against knowledge source notes, not against live vendor pages.

## Self-check before saving

- Any "no ...", "doesn't ...", "only ...", "never ..."? A source must confirm the absence, not only fail to mention it.
- Any price, limit, location or certification? Its source must be in `sourceUrls`, with `checkedAt` when this run read it.
- Any "because", "to push", "wants to" about a company? It must be the company's own stated reason, attributed.
- Any "always", "for years", "recently", "now"? A dated source must back it.
- Any Reddit view or review stated as fact? Attribute it.

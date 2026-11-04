# Content review and plan (2026-11-03)

This plan combines six reviews of the site:
- four reviews of all 45 services (completeness, quality, evidence, one live check of each vendor site),
- a page performance audit: [docs/seo/audits/2026-11-03-top-pages.md](../seo/audits/2026-11-03-top-pages.md),
- an offering gaps report: [docs/seo/opportunities/2026-11-03-offering-gaps.md](../seo/opportunities/2026-11-03-offering-gaps.md).

Data: Search Console export (3 months: 142 clicks, 13,664 impressions), site analytics (90 days), Reddit, and the competitor pages and vendor pages read today. The full per-service tables are in the appendix.

## Summary

- **Most facts are old.** 44 of 45 services have evidence older than 180 days. Only Proton Mail was checked today.
- **Some live pages show wrong facts.** Wrong prices: Proton Drive, mailbox.org, Infomaniak Mail, Claude, Google Drive. Renamed products: Tresorit ("SecureCloud"), mailbox.org ("mailbox"), and Mistral's app on its pricing page ("Vibe"). Our text contradicts our own research: HERE WeGo, Ecosia Browser.
- **Guides are the strongest pages in search.** The four guides have 4,723 impressions, more than all 45 service pages together. Two of them have no meta title or description of their own.
- **The non-EU pages are empty where it counts.** All 18 lack `oneLineProblem`, `whatYoudGain`, `whatYoudLose` and `faqs`. No skill writes these fields.
- **The biggest gap in the offering is office suites,** then Dropbox, OneDrive and iCloud in storage, then password managers and VPNs.

## 1. Fix now: wrong facts on live pages

Ordered by reach (visitors and impressions). Run each action, then `/translate`, because every `nl.md` repeats the facts.

| Page | Problem | Action |
|---|---|---|
| proton-drive | Four of five paid tiers show wrong prices ($4.99 against Proton's $3.99), Duo missing, free storage at sign-up. Most visited storage service, 748 impressions, 0 clicks. | `/claims-audit proton-drive --fix`, then a new title and description |
| here-wego | "Owned by a consortium of European car makers" and "No paid tiers": both contradicted by our own research. Most visited service page (81). | `/claims-audit here-wego --fix` |
| mailbox.org | The brand is now "mailbox". Standard €4 (we say €3), Premium €12 (we say €9). 527 impressions. | `/claims-audit mailbox.org --fix` |
| infomaniak-mail | Prices are per user in CHF now. The site sells one-click OpenPGP, but our page says "no end-to-end encryption". 734 impressions. | `/claims-audit infomaniak-mail --fix` |
| claude | Plans, seat prices and model names are out of date. Only page in its batch in the top 10 (157 impressions, position 9, 0 clicks). | `/claims-audit claude --fix` |
| mistral-le-chat | The pricing page calls the product "Vibe". Our alternative for three AI pages. | `/research mistral-le-chat` (the guide research checks the name) |
| qwant | Stale "50%" target (end 2025). Absolute privacy claims that Qwant's own page now qualifies. Alternative for three search pages. | `/claims-audit qwant --fix` |
| google-drive | Plans renamed: Basic 100 GB, Google AI Plus 2 TB, Google AI Pro 5 TB. The 200 GB plan is gone. | `/claims-audit google-drive --fix` |
| bluesky | "No checkmarks, no fees" is wrong (badges since April 2025). | `/claims-audit bluesky --fix` |
| brave | New Brave Origin plan. The VPN covers 5 devices (we say 10). | `/claims-audit brave --fix` |
| tresorit | Renamed "SecureCloud", new plans (Lite, Essential, Pro). | `/research tresorit` |
| Lower reach | vivaldi, pcloud, nextcloud, startpage, ecosia, duckduckgo, tuta, signal, session, threema, x-(twitter), chatgpt, google-gemini, proton-lumo, magic-earth, organic-maps, waterfox | `/claims-audit`, highest reach first |

Small fixes: OsmAnd `startingPrice` "€3.99/month" matches no tier (set "Free"). Proton Mail has no `startingPrice`. Gmail's `url` points to a sign-in redirect.

## 2. Decisions needed

These are editorial rules. Decide them once, then apply them in the fixes above.

1. **Region labels.** Threema (Swiss), Element (London) and pCloud (Swiss) are `eu`. Proton and Infomaniak (Swiss) are `eu-friendly`. Pick one rule for non-EU European companies.
2. **Recommended alternatives: EU-based where a good option exists.** The reviews suggest:
   - Chrome and Edge → Vivaldi (Norway, EEA), not Brave (US).
   - DuckDuckGo → Qwant, not Startpage (owned by a US ad company).
   - Waze → Magic Earth.
   - Facebook, Instagram, TikTok and X: all four point to Bluesky (US). Mastodon is the EU option. Social media is our thinnest category.
3. **Guides end outside the EU member states.** All four current guides end at Signal, Bluesky (US) or at Proton, pCloud (Swiss). Plan at least one guide that ends at a company in an EU member state.
4. **Affiliate disclosure.** Proton Mail and Proton Drive are the only affiliate links. The disclosure shows on every EU page today. Show it only where an affiliate link is, and add `rel="sponsored"`.

## 3. Quick search wins

From the page audit, which has the new titles and descriptions for each page. The click estimates are ranges for 90 days, against today's 142 clicks.

| Page | Now | Change | Estimate |
|---|---|---|---|
| WhatsApp → Signal guide | 2,031 impressions, position 8.5 | Own title and description; sections on stickers (about 110 impressions), group links, chat history and backups; update "missing features" (Signal added backups and polls in 2025) | +30 to +85 |
| Gmail → Proton Mail guide | 1,429 impressions, 1 click | Own title and description; "will your Gmail fit the free plan"; Easy Switch options; the name "Proton Mail"; affiliate disclosure | +14 to +45 |
| Browsers category | 815 impressions, 92% bounce | "European" in the title; a buyer's-guide body; explain Brave; answer "norwegian browser" | +5 to +15 |
| X → Bluesky guide | 1,225 impressions, position 15 | Move the Porto extension up; fix "no direct messages" | +7 to +23 |
| Vivaldi | 455 impressions, 0 clicks | Title and description that promise ownership, EEA status and sync location | +9 to +18 |
| Proton Drive | 748 impressions, 0 clicks | "Proton Drive Review: Price, Free Plan and Trade-offs" | +5 to +15 |
| pCloud, Infomaniak Mail, Google Drive → pCloud guide | 538 to 800 impressions each | Answer what searchers ask: Swiss or EU, where files are stored, what ik.me is | +3 to +12 each |

## 4. New content

Ranked by demand, fit and effort. Research for the five guides started on 2026-11-03, with briefs in `docs/guides/research/`.

1. **Five new guides:** Chrome → Vivaldi, Google Maps → Organic Maps, Google Drive → Proton Drive, ChatGPT → Le Chat, and one "change your default search engine" guide.
2. **Category pages as buyer's guides:** storage first (111 visitors, 60 words today), browsers next. Each has 600 to 900 words, "best for" picks with their trade-offs, a comparison table, and the note "only Proton pays us, order is by use case". The category template needs a text section below the card grid.
3. **Storage starting points:** Dropbox, OneDrive and iCloud as non-EU pages, each with a guide. They come up in 22 r/BuyFromEU threads, and the EU alternatives are written already.
4. **New categories:**
   - office suites (strongest demand: 72 threads, the top one at 3,341 upvotes),
   - password managers (14 threads),
   - VPNs (15 threads, trust is the main theme),
   - video calls and team chat,
   - photo backup (first as a section in storage).
5. **Comparison pages:** email on your own domain (141 impressions at positions 39 to 76), "pCloud vs Google Drive", and an email list beyond Proton and Tuta (a thread asking for exactly that got 172 upvotes).
6. **Broad pages:** 38 general "European alternatives" queries (1,296 impressions) rank on page 2 or 3. The home page and an overview page can win these.

## 5. Process and site fixes

- **Skill gap:** extend `write-service` to write `oneLineProblem`, `whatYoudGain`, `whatYoudLose` and `faqs` for non-EU pages. Then fill the 18 non-EU pages.
- **Meta:** guides and category pages have no meta of their own. Add metaTitle and metaDescription to every guide, and to the category template.
- **Analytics:** track outbound clicks, so a click to a vendor stops counting as a bounce.
- **Bug:** the featured card shows "Premium: Free (5 GB)".
- **Article:** `denmark-digital-ministry-drops-microsoft-office` may be out of date (Reddit, late October 2026, reports the switch stalled). Check it with `/news-check`.
- **Search Console:** set up OAuth (`npx suganthan-gsc-mcp setup`), so the SEO skills can read live data. The export is anonymised: only 35% of impressions have a query.

## Appendix: per-service reviews

### email + messaging

| slug | visitors 90d | GSC impr / pos | compl. | top gaps | quality / evidence issue | big change | next action |
|---|---|---|---|---|---|---|---|
| gmail | 3 | 47 / 15.3 | C | oneLineProblem, whatYoudGain+Lose, faqs | "Free Gmail accounts don't get those protections" (overclaim); undated prices | url points to sign-in redirect | add non-EU fields |
| infomaniak-mail | 15 | 734 / 16.8 | A | pricingTiers, encryption claim, source dates | "No outside investors means no pressure to monetize your data" (motive) | YES: per-user CHF pricing (from CHF 1.76) vs our €5.75/€6.58; one-click OpenPGP contradicts "no E2E" | /claims-audit |
| mailbox.org | 20 | 527 / 13.9 | A | pricingTiers, name, freeOption false | "even Mailbox.org staff can't read it" (unattributed); "no history of data breaches" (no source); "Support response times have stretched to two weeks" (review as fact) | YES: brand now "mailbox"; Standard €4 (we €3), Premium €12 (we €9), storage doubled | /claims-audit |
| proton-mail | 34 | nl 93 / 21.9 | B | startingPrice, tags | body 323 words (> 250) | none | add startingPrice |
| tuta | 3 | 89 / 6.6 | A | undated prices/sources | "Not the company, not anyone else", "skips IP logging" (unattributed); "no way to insert links" (absence unconfirmed) | homepage: post-quantum live; research says "developing" | /claims-audit |
| element | 2 | – | A | region (London HQ tagged eu), conflicting prices, thin research | ogDescription "used by 25+ governments" (source: governments in 25+ countries use Matrix) | sells to governments, no personal plan | /research |
| session | 5 | – | A | stale pricingDetails ("future Session Pro") | "no voice or video calls yet" (no source); "no central database to breach" (absolute) | none | /claims-audit |
| signal | 32 | – | A | – | "zero incentive to collect or sell your data" (motive); "Video calls can be choppy" (user view as fact) | none | /claims-audit |
| threema | 4 | – | A | freeOption false, region (Swiss tagged eu), USD prices | "does not store contact lists" (unattributed); "interface feels a bit dated" (opinion) | none | /claims-audit |
| whatsapp | 3 | 19 / 7.5 | C | non-EU fields | "no opt-out available in EU", "Uploads your entire contact list" (no source); "pattern of recurring vulnerabilities" (trend) | none | /claims-audit, then non-EU fields |

Notes: gmail→proton-mail and whatsapp→signal are sensible; Proton (CH) and Signal (US nonprofit) are not EU: name Tuta/Threema in faqs. Region labels inconsistent: Threema/Element `eu`, Proton/Infomaniak `eu-friendly`. WhatsApp sticker queries (~100 impr) → section in WhatsApp→Signal guide. Gmail→Proton guide 1,429 impr, 0.07% CTR → title/meta. All bodies 197–248 words except Proton; Dutch complete.

Most urgent: 1) mailbox.org wrong prices + rebrand (527 impr, "mailbox germany" 133 impr pos 22). 2) infomaniak-mail most impressions, pricing model changed, encryption contradiction. 3) whatsapp unsourced negative claims + no non-EU fields, feeds the best guide.

### search engines + AI

Evidence 208 days old on all 12. "4 non-EU fields" = oneLineProblem, whatYoudGain, whatYoudLose, faqs. "<4" = not in analytics export.

| slug | visitors | GSC impr/pos | grade | top gaps | quality/evidence | big change | next |
|---|---|---|---|---|---|---|---|
| bing-search | <4 | – | C | non-EU fields, screenshot | 316 words; "stays on Microsoft's servers forever" (windowsnews.ai); "$19.5 billion a year" is a forecast | none | /write service |
| duckduckgo | 4 | – | C | non-EU fields, pricingTiers | "GDPR does not directly apply" (wrong); alternative Startpage is US-owned (Qwant fits better) | Privacy Pro now Plus $9.99 / Pro $19.99 | /claims-audit |
| ecosia | 15 | nl 29/61 | A | AI chat not listed | "a personal counter tracks your contribution" (replaced in 2025 per our research) | 257.9M trees (we say 230M) | /claims-audit |
| google-search | <4 | – | C, featured | non-EU fields | "found Google guilty" (civil case); "EU-based ... Mojeek" (UK-based?); DOJ appeal status old | none | /write service |
| qwant | 45 | – | A, featured | sources undated | "aims to handle 50%" (end-2025 target, past); "the French government uses Qwant" (source: National Assembly) | optional account features share some data with partners | /claims-audit |
| startpage | 18 | en 84/15.7, nl 122/35.2 | A | Trustpilot as source; ownership re-check | "No privacy breaches have surfaced since the deal" (no source) | Ad-Free product with private accounts coming | /claims-audit |
| yahoo-search | <4 | – | C | non-EU fields | "All data sits on US servers" vs own data-location "Global"; "largest data breaches" (Wikipedia only) | none | /write service |
| chatgpt | <4 | – | C, featured | non-EU fields | lists Italy fine but not its 2026 annulment; "most widely used AI tool in the world" (no source) | Free has unlimited GPT-6; Pro 3 usage tiers (we list GPT-5.3, o1-pro, DALL-E) | /claims-audit |
| claude | <4 | 157/9.0, 0 clicks | C | non-EU fields (FAQ could target "claude pricing eu") | "without going off the rails" (opinion); "Stanford flagged the design as misleading" (no source); "~$50,000/year" (not Anthropic) | Ultra $200; Max $100; Team $20/$100; Enterprise $20/seat + usage; Opus 5.5; 1M context | /claims-audit |
| google-gemini | <4 | – | C, featured | non-EU fields | "confusing on purpose" (motive); "Nobody was asked." (no source); description "from $7.99" vs startingPrice $19.99 | Plus 400 GB (we 100), Pro 5 TB (we 2), Gemini 4 Argon | /claims-audit |
| mistral-le-chat | 41+11 nl | – | A, featured | certifications | "Everything runs on EU servers" (unattributed); "That case is still open" (undated) | pricing page says "Vibe", not Le Chat; Team $24.99; No Telemetry Mode not on page | /research |
| proton-lumo | 10 | – | A | certifications | "Image and video input are not supported yet" (Reddit; image generation exists); "not publicly auditable" (Proton: Lumo code fully open source) | plan now "Lumo AI Plus", same price | /claims-audit |

Links: alternatives fine except DuckDuckGo → Qwant (not US-owned Startpage). Guide worth writing: ChatGPT → Le Chat (after Vibe naming settles). Search engines: one shared "change your default search engine" guide.

Watch out: updatedAt 2026-11-03 on AI files comes from a formatting commit, so `knowledge context` showed their pricing as current although nobody re-checked it. Every fix also needs nl.md.

Most urgent: 1) claude: only page here in top 10 (157 impr pos 9, 0 clicks); plans, seat prices, models wrong. 2) mistral-le-chat: busiest AI page + alternative from 3 AI pages; product renamed "Vibe" on pricing page. 3) qwant: busiest page + alternative from 3 search pages; stale Staan target, absolute privacy claims.

### browsers + navigation

Grades: A = page fields present, B = 1-2 relevant gaps, C = non-EU sections missing. Jina blocked (403): chrome, google-maps, ecosia-browser.

| slug | visitors | GSC impr/pos | C | top gaps | evidence / quality | big change | next |
|---|---|---|---|---|---|---|---|
| here-wego | 71+10 | – | B | pricingTiers (WeGo Pro), openSource, certifications | "owned by a consortium of European car makers" (research adds Intel, NTT, Pioneer); "No paid tiers" vs own WeGo Pro source; "HERE deletes your location data" unattributed; 280 words | none | /claims-audit |
| vivaldi | 46+8 | 455 / 9.5, 0 clicks | B | openSource (partial) | "set out to build the browser Opera stopped being" (motive-ish); "no pressure to monetize your data"; "further than any other browser"; 307 words | none | /claims-audit + new meta (ownership, EEA, sync location) |
| brave | 4 | 1 / 7 | A | certifications | US company in an EU category; "US jurisdiction rather than EU data protection law" contradicts gdprNotes; nl titles show "Privé" | Brave Origin $59.99; VPN 5 devices (listing: 10) | /claims-audit |
| ecosia-browser | 13+7 | – | B | screenshot, openSource false | "Search results come from Microsoft Bing" vs research (Qwant index) | not checked (403) | /claims-audit |
| waterfox | 10 | 95 / 6 (no-locale URL) | B | pricingDetails, startingPrice | "Built-in uBlock Origin" vs homepage "search partner ads" | domain now waterfox.com | /claims-audit |
| magic-earth | 12+10 | – | A | openSource false | description sells "offline maps" (Premium); "currently discounted to $8"; "pre-installed on Huawei and Honor" (research: "some") | none | /claims-audit |
| organic-maps | 10+15 | – | A | location (Estonian OÜ) | "without collecting any data" unattributed; "Less storage and battery drain than Google Maps" | 12M installs (research: 6M) | /claims-audit |
| osmand | 10 | – | A | startingPrice | "€3.99/month" matches no tier (en+nl) | none | startingPrice: Free |
| chrome | 2 | – | C | non-EU fields | "3.8 billion" from a stats blog; alternative brave is US | not checked | /write service |
| microsoft-edge | 0 | – | C | non-EU fields | "You cannot uninstall Edge" (check EEA); "All browsing data is processed on US servers" vs own "64+ regions" | none | /write service |
| google-maps | 0 | – | C | non-EU fields, screenshot | "That is not generosity."; "every saved place feeds into a profile" | not checked | /write service |
| waze | 0 | – | C | non-EU fields, screenshot | "Every drive you take is logged" rests on third-party blogs | none | /write service |

Links: point chrome and microsoft-edge at vivaldi (not US brave), waze at magic-earth, consider here-wego for google-maps. Guides worth writing: Chrome→Vivaldi (browsers category 815 impr, no guide), Google Maps→Organic Maps (KML import). Non-EU pages get almost no traffic.

Most urgent: 1) here-wego top service page: "owned by European carmakers" + "No paid tiers" both contradicted by own research. 2) brave: US company as EU alternative for chrome/edge, pricing changed. 3) vivaldi: 0 clicks from 455 impressions; "vivaldi browser country of origin" queries → meta should answer ownership/EEA/sync location.

### social media + storage

All evidence 208-209 days old; nl.md mirrors en.md, so every fix needs /translate afterwards.

| slug | visitors | GSC imp/pos | grade | top gaps | quality / evidence | big change | next |
|---|---|---|---|---|---|---|---|
| bluesky | 25 | guide 1,225/15.0 | A | US company on US servers, yet `featured` and the alternative on 4 pages while Mastodon is `eu`; "GDPR-compliant" tag vs `partial`; 279 words | "No checkmarks, no fees" wrong (badges since Apr 2025); "no encrypted direct messages" no source | Schneider permanent CEO (Jul 2026); no Bluesky+ | /claims-audit |
| mastodon | 18 | – | A | – | "A German nonprofit (Mastodon gGmbH)"; "Your data is not sold to advertisers" (per server) | About page: gGmbH "lost its non-profit status"; foundation move ongoing | /claims-audit |
| facebook | 0 | – | C | non-EU fields | "over 2.5 billion euros since 2023" counts the €530M fine that was TikTok's; Instagram page says 2.2B | none | /claims-audit |
| instagram | 2 | 3/18.3 | C | non-EU fields; Worth knowing lists fines | "because longer sessions mean more ads served" (motive); "with no opt-out" marketing-blog source | Instagram Plus subscription (Jun 2026) vs "You do not pay money" | /claims-audit |
| tiktok | 0 | – | C | non-EU fields, pricingUrl | "95 minutes a day", "further than most competing platforms" no source | none | add non-EU fields |
| x-(twitter) | 0 | – | C | non-EU fields; USD tiers | "500 million posts per day", "A 2024 study found 73%", "free to reuse it however it wants" no source | EU Premium+ €38/month (listed $40) | /claims-audit |
| google-drive | 4 | 246/19.6 | C | non-EU fields; undated prices; alternative proton-drive but guide goes to pCloud | – | plans renamed: Basic 100 GB, "Google AI Plus" 2 TB, "Google AI Pro" 5 TB; 200 GB and "Premium" gone | /claims-audit |
| nextcloud | 10 | 95/20.3 | B | no consumer pricing (tiers are enterprise, 100-user min); "€4/month (hosted)" no source | "End-to-end encryption" feature (optional, per folder); "Android app can feel sluggish" as fact; SOC 2/HIPAA no source | Enterprise €71.29/€104.99/€204.75 (listed ~€68/100/195); Office "powered by Euro-Office" | /claims-audit |
| pcloud | 16 | 800/17.1, 5 clicks; guide 606 | A | openSource false; price dates; redditMentions | "fully GDPR compliant"; "your data stays there" unattributed; "email-only" support no source; Swiss tagged `eu` (Proton `eu-friendly`) | sells pCloud Photos (AI opt-in) + document editors | /claims-audit |
| proton-drive | 37 | 748/11.5, 0 clicks | A | tiers wrong, Duo missing, low CTR | "$4.99/month, Billed annually at $47.88" vs Proton $3.99/month billed $47.88 (same mismatch Unlimited, Family); "cannot access your data, even if compelled to" unattributed | Duo now 2 TB | /claims-audit |
| tresorit | 2 | 42/18.4 | B | freeOption, openSource false; tiers | "not even if a court orders it" unattributed; "not subject to the US CLOUD Act" no source, omits Azure hosting | renamed "SecureCloud"; plans Lite 50 GB / Essential 1 TB / Pro 4 TB; "downgrade to Basic" → check "no free tier" | /research |

Most urgent: 1) Proton Drive tiers wrong on the busiest storage page + 0-click meta → fix tiers, Duo, meta, then /translate. 2) Storage pricing: Google renamed plans; pCloud undated USD (800 impr + guide 606). 3) All 4 non-EU social pages point to Bluesky (US) while Mastodon is EU: breaks "EU-based where a good option exists"; fix "No checkmarks".

SKILL GAP: no skill writes oneLineProblem, whatYoudGain, whatYoudLose or faqs (write-service writes only `issues`). None of the 18 non-EU services has them.

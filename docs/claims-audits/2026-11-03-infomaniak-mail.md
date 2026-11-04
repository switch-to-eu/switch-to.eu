# Claims audit: Infomaniak Mail (2026-11-03)

Item: content/services/infomaniak-mail/en.md (fixed with `--fix`, nl.md updated to match)
Claims: 40 · current 20 · changed 10 · unverifiable 7 · overclaimed 3 · wording fixes 4
Sources read: 22 Reader calls, 18 usable (4 failed or empty: `https://www.infomaniak.com/fr/ksuite/service-mail/prix` (404, wrong guess), the pricing page with `X-Proxy: de` (401, needs a key), `https://www.infomaniak.com/en/ksuite/ksuite-pro/prices` (price cards not rendered), `https://www.infomaniak.com/en/ecology` (empty)). Reader keyless: yes. Search: yes (2 web searches to find help pages, no facts taken from search results).
Knowledge: no open flags. Service evidence was 209 days old (newest check 2026-04-08). Company entity `infomaniak-network` is derived, no fact lines.

## Currency

The price tables on `infomaniak.com/en/ksuite/service-mail/prices` and `/en/ksuite/myksuite/prices` render only in CHF for our reader, also with `?currency=EUR`. The server HTML has CSS classes for a hidden EUR display, so EU visitors probably see euros, but we could not load that view (a geo proxy needs a Jina key). Two marketing blocks show euros without a billing period: "From 1,90 €/month" for my kSuite+ (my kSuite page) and kDrive "from 4.99 € / month" (Mail Service page). The billing help page says the EUR or CHF currency "corresponds to the country registered for your Organization". As briefed, the tiers record CHF as shown, without conversion, and the body says the price pages showed Swiss francs without VAT.

## Needs a fix

| Id | Where | Claim | State | Evidence | Fix |
|---|---|---|---|---|---|
| k1 | description, body, ogDescription, gdprNotes, parentCompany, tags, researchNotes | "employee-owned", "fully owned by its employees" | changed | infomaniak.com/en/investors: about 30 employees became shareholders through founder transfers. Since May 2026 the Infomaniak Foundation holds the majority of voting rights (2026-11-03) | Body: "a public-benefit foundation holds most of the voting rights". parentCompany: Infomaniak SA, SIX-listed, foundation holds most votes. Tag `employee-owned` removed |
| k2 | description, body, gdprNotes, researchNotes | "no outside investors" | changed | infomaniak.com/en/investors: "went public on the Swiss Stock Exchange on 1 October 2026", ticker INFO. Company says it grew "without external capital" and the listing raised no funds | "Infomaniak says it grew without outside capital. Since 1 October 2026 its shares trade on the SIX Swiss Exchange" |
| k3 | body, gdprNotes, researchNotes | "No outside investors means no pressure to monetize your data or show you ads" | overclaimed | A motive, not stated by Infomaniak | Removed. gdprNotes keeps the attributed facts: no ads (my kSuite page), data never resold (about page) |
| k4 | startingPrice, pricingTiers[1], body, pricingDetails | kSuite Standard €5.75/month, "paid plans start at around 5.75 EUR/month" | changed | service-mail/prices (Annual tab selected): kSuite Standard "CHF 1.76 per user per month". myksuite/prices: my kSuite+ "From CHF 1.60 monthly", "CHF 19.00 annually" | startingPrice `CHF 1.60/month`. Tiers rebuilt in CHF (see k5 to k10) |
| k5 | pricingTiers[1].billingNote, pricingDetails | kSuite Standard "Free with Infomaniak domain purchase" | changed | faq/2920: the Starter plan "includes 1 free email address when you purchase a custom domain name" | kSuite Standard now `billed annually`. Starter plan named in the body |
| k6 | pricingTiers[1].features, pricingDetails | kSuite Standard "2TB kDrive" | changed | service-mail/prices: "50 GB of file storage on kDrive per user" | 50 GB per user |
| k7 | pricingTiers[2], pricingDetails | "Mail Service Pro" €6.58/month | changed | service-mail/prices: "Mail Service, From CHF 2.29/month". faq/2920: "For 5 addresses or more: choose a Mail Service" | `Mail Service`, CHF 2.29/month, "starting price, for 5 or more addresses" |
| k8 | pricingTiers[2], pricingDetails | "Up to 300 email addresses", "up to 300 users" | changed | service-mail/prices: Mail Service "Up to 1000 addresses". kSuite offers "maximum of 300 users" | Up to 1,000 addresses (Mail Service), up to 300 users (kSuite) |
| k9 | pricingTiers[3] | kSuite Pro "Custom pricing" | changed | service-mail/prices lists kSuite Business CHF 7.33 and Enterprise CHF 13.83 per user per month. Tailor-made offers go through sales | Replaced by kSuite Business, CHF 7.33/user/month billed annually. Intro price (CHF 3.67, -50% the first year) only in pricingDetails |
| k10 | body (Worth knowing), researchNotes | "Infomaniak Mail does not offer end-to-end encryption" | changed | service-mail: "Email encryption in a single click", "ECC and OpenPGP". faq/1582: keys per address "stored securely in Infomaniak's data centers", decrypted "via Infomaniak authentication". Works in web and mobile apps | Describes the one-click encryption, attributes key storage to Infomaniak, and keeps the pointer to Proton Mail or Tuta for a provider that says it can't read your mail. Feature tag "One-click email encryption" added |
| k11 | features, metaDescription, ogDescription | "Unlimited email storage" with no plan named | overclaimed | myksuite/prices: free plan 20 GB, unlimited on my kSuite+ and paid plans | Feature "Unlimited storage on paid plans". Meta replaced (SEO proposal) |
| k12 | pricingTiers[1].features | kSuite Standard "Custom domain included" | overclaimed | faq/2497: kSuite Pro "customized on a paid domain name". No page says the domain is included | "Your own domain" |
| k13 | gdprNotes | "A data processing agreement is available on request" | changed | GDPR page links the DPA as a PDF | "Infomaniak publishes a data processing agreement (DPA)" |
| k14 | body, researchNotes | "Switzerland's largest cloud company" | unverifiable | Not on the about, investors or trust center pages | Removed from body. researchNotes: "not stated ... (as of November 2026)" |
| k15 | body, dataStorageLocations, researchNotes | Data centers in "Geneva and Winterthur" | unverifiable | Pages read say "exclusively in Switzerland" and "2 data centers", without cities. Housing and ecology pages gave no city | Body: "two of its own data centers, both in Switzerland". dataStorageLocations: Switzerland |
| k16 | body (Worth knowing) | "Support response times can be hit or miss based on user reviews" | unverifiable | Review and forum sources not re-read in this run (no Reddit in this skill) | Removed from public text. researchNotes sentiment kept as it was |
| k17 | pricingTiers[0].features | "Calendar, contacts, and tasks" (tasks) | unverifiable | myksuite/prices lists calendar and address book limits, no tasks | Tier list rebuilt without tasks. Calendar and contacts stay in features |
| k18 | pricingTiers[1], [2] | "AI writing and translation tools" (kSuite Standard), "AI-powered features" (Mail Service Pro) | unverifiable | The "Editorial assistant AI" row on service-mail/prices has no readable per-plan values | Removed from those tiers. my kSuite+ keeps "AI writing and translation in Mail" (myksuite/prices: "Euria in Mail – write, translate and reply") |
| k19 | pricingTiers[3] | kSuite Pro "Dedicated support" | unverifiable | Not on the pages read | Removed with the tier |
| k20 | gdprNotes, researchNotes | Doesn't use data for "commercial analysis" | unverifiable | Not on the pages read. About page: data "never resold or processed for improper purposes" | "never resells the data it hosts" |

## Wording fixes

| Id | Where | Claim | Evidence | Fix |
|---|---|---|---|---|
| k21 | body, gdprNotes | "Your emails stay in Swiss data centers ... and nowhere else", "never transfers data outside Switzerland" | GDPR page: "data centers based exclusively in Switzerland, and never transfer your data outside our own infrastructure". service-mail: "saved in 2 data centers" | "Infomaniak says it keeps your mailbox in two of its own data centers, both in Switzerland." gdprNotes attributed |
| k22 | body | "it follows both Swiss and EU privacy rules" | myksuite: "Compliant with GDPR and FADP" | "it says it complies with both Swiss and EU privacy law" |
| k23 | body | AI tools "that run on Infomaniak's own Swiss servers" | service-mail: "Infomaniak's AI is hosted entirely in Switzerland", messages "not stored" | "Infomaniak says its AI runs in Switzerland and doesn't store the emails it processes." |
| k24 | pricingTiers[2] | "Advanced spam and phishing protection" | service-mail: protection "against viruses ... and undesirable messages", SPF, DKIM, DMARC | "Advanced" is ours. Line dropped from the rebuilt Mail Service tier |

## Current

| Id | Where | Claim | Evidence |
|---|---|---|---|
| k25 | features, location, metaTitle (old), description | Data stored in Switzerland only | GDPR page, service-mail (2026-11-03) |
| k26 | freeOption, pricingTiers[0], body, meta | Free plan with 20 GB email storage | myksuite/prices: "20 GB of storage space for emails" |
| k27 | pricingTiers[0], pricingDetails | Free @ik.me, @ikmail.com or @etik.com address | myksuite/prices, faq/2920 |
| k28 | pricingTiers[0] | 15 GB kDrive on the free plan | myksuite/prices: "15 GB of Cloud storage" |
| k29 | pricingTiers[0] | Basic AI on the free plan | myksuite/prices: Euria with limits (2 projects). Dropped from the tier list for space |
| k30 | description | 30 years of hosting experience | service-mail: "+ 30 years". Description now says "founded in 1994" |
| k31 | body, foundedYear | Around since 1994 | investors: "Since 1994" |
| k32 | headquarters | Geneva | investors: "1227 Les Acacias, Geneva" |
| k33 | features | Calendar and contacts | myksuite/prices, service-mail |
| k34 | features | Custom domain support | faq/2920 |
| k35 | features, body | Free migration help | service-mail: "Migrate your email addresses for free", automatic copy of old emails and folders |
| k36 | body | Webmail, mobile apps and standard email apps | service-mail (mobile), news/email-encryption (IMAP access) |
| k37 | body | kSuite bundles video calls and team tools | myksuite: kMeet "Free, unlimited video, audio and streaming calls". kChat in kSuite comparison |
| k38 | pricingTiers (kSuite) | Unlimited email storage on kSuite plans | service-mail/prices |
| k39 | pricingTiers[2] (old) | SSO integration | service-mail: "SSO ready to use for businesses". Not repeated in the rebuilt Mail Service tier |
| k40 | certifications, gdprCompliance, tags | ISO 27001, 9001, 14001, 50001, Swiss Made Software, Swiss Hosting. GDPR and FADP compliance (self-declared). No ads | certifications page (also B Corp since 2025, added), trust center, myksuite: "No advertising" |

## Applied

- English: startingPrice, description, features (added "Free @ik.me address", "One-click email encryption"), pricingTiers rebuilt in CHF (my kSuite, my kSuite+, kSuite Standard, Mail Service, kSuite Business), tag `employee-owned` removed, metaTitle and metaDescription from `docs/seo/audits/2026-11-03-top-pages.md` (53 and 154 characters), ogTitle and ogDescription set to the same, keyword "ik.me email", gdprNotes, pricingDetails, parentCompany, dataStorageLocations, certifications (+ B Corp), 14 sourceUrls with `checkedAt: '2026-11-03'`, researchNotes (ownership, pricing, privacy, security), body (ik.me sentence, ownership, plans, encryption, currency), updatedAt.
- Dutch (nl.md): every localized field above: startingPrice, description, features, pricingTiers, metaTitle (59), metaDescription (158), keywords, ogTitle, ogDescription, gdprNotes and the full body.

## Also affected

- No other file in `content/` mentions Infomaniak or ik.me.
- `seoScore` and `seoNotes` describe the old text. Run `/seo-check service infomaniak-mail`.
- The knowledge entity is derived from `parentCompany`. After the next `pnpm knowledge:index` it becomes Infomaniak SA (not run here, as briefed).

## For the owner

- **EUR prices:** not found for the Mail or kSuite plans. Tiers show CHF. Check the pricing page in a browser from an EU address if you want euro tiers.
- **Ownership:** Infomaniak listed on the SIX Swiss Exchange on 1 October 2026. Its foundation holds most voting rights. This changed the description, tags and parentCompany.
- **Region:** unchanged (`eu-friendly`). The evidence confirms a Swiss company with Swiss-only storage. The region rule for Swiss services (Threema `eu` vs Proton and Infomaniak `eu-friendly`) still waits for your decision.
- **Mail Service CHF 2.29:** the page doesn't say whether this is per address or for the 5-address minimum.
- **Support sentiment** left the public text as unverifiable in this run. A `/research infomaniak-mail` would refresh it with sources.

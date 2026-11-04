# Claims audit: Proton Drive (2026-11-03)

Item: content/services/proton-drive/en.md
Claims: 45 · current 30 · changed 6 · unverifiable 3 · overclaimed 6 · wording fixes 6
Sources read: 21 (0 failed). Reader keyless: yes. Search: yes (two web searches to find the version history page and a page with EUR prices for Drive Plus; no search result is used as evidence).
Knowledge: no open flags. `services/proton-drive` facts date from 2026-04-08 and repeat the old USD tiers. The company `proton` has no fact lines yet.

Prices: proton.me/drive/pricing renders in USD from Jina's location. EUR prices come from proton.me/support/proton-plans (Unlimited, Duo, Family) and from the EUR offers in the structured data of proton.me/drive (Drive Plus, and the same Unlimited, Duo and Family prices). The yearly prices that Proton marks "20% off" are the regular yearly prices, not introductory offers. The affiliate link was not followed in this run.

## Needs a fix

| Id | Where | Claim | State | Evidence | Fix |
|---|---|---|---|---|---|
| k4 | startingPrice, pricingTiers[0], body, metaDescription, ogDescription, pricingDetails, researchNotes | Free plan has 5 GB | changed | proton.me/support/more-storage-proton-drive: "we'll upgrade your storage from 2 GB to 5 GB" after the welcome checklist, within 30 days (2026-11-03) | "Free (up to 5 GB)". Tier: "2 GB storage, 5 GB after setup steps". Body explains the three setup steps |
| k14 | pricingTiers[1], body, pricingDetails | Drive Plus "$4.99/month, Billed annually at $47.88/year" | changed | proton.me/drive structured data: Drive Plus 1-year plan 3.99 EUR/month, monthly 4.99 EUR. drive/pricing (USD): "$3.99/month", "Billed at $47.88 every 12 months" (2026-11-03) | €3.99/month, billed annually (€4.99 monthly in pricingDetails) |
| k19 | pricingTiers[2], body, pricingDetails | Unlimited "$12.99/month, Billed annually at $119.88/year" | changed | support/proton-plans: "€12.99/month or €119.88 for one year (€9.99/month)" (2026-11-03) | €9.99/month, billed annually |
| k23 | pricingTiers[3], pricingDetails | Family "$29.99/month, Billed annually at $287.88/year" | changed | support/proton-plans: "€29.99/month or €287.88 for one year (€23.99/month)" (2026-11-03) | €23.99/month, billed annually |
| k25 | pricingTiers (missing), pricingDetails | Duo: "$19.99/month, 1 TB shared between 2 users" (research only, no tier) | changed | support/proton-plans: "€19.99/month or €179.88 for one year (€14.99/month)", "Up to two family members share 2 TB" (2026-11-03) | New tier: Proton Duo, €14.99/month billed annually, 2 TB shared, up to 2 users, everything in Unlimited. One sentence in the body |
| k42 | body (Worth knowing), researchNotes | "There is no native Linux client yet." | changed | proton.me/drive/download: desktop apps for Windows and macOS, plus a "Proton Drive CLI (command-line interface) for Linux, macOS, or Windows" (2026-11-03) | "The desktop apps are for Windows and macOS. On Linux, you use the web app or Proton's command-line tool." |
| k2 | description, body, gdprNotes | "a Swiss company that cannot access your data, even if compelled to" | overclaimed | drive/security: "no one, not even Proton, can access your files". No Proton page says "even if compelled to" (2026-11-03) | "Proton says even it has no access to your files." Attributed in body and gdprNotes too |
| k18 | pricingTiers[1].features | "Desktop sync (Windows, macOS)" listed as a Drive Plus feature | overclaimed | drive/download FAQ: free to start, "download Drive for Windows, macOS, Android, iOS". The Drive Plus card lists only 200 GB and 10-year version recovery (2026-11-03) | Removed from the Drive Plus tier. Desktop sync stays in the body |
| k43 | body (Worth knowing) | "Collaboration features exist but are not as deep as Google Workspace." | overclaimed | A comparison with no source read in this run. Proton's Drive menu lists two online editors: documents and spreadsheets (2026-11-03) | "Proton's online editors cover documents and spreadsheets, so check that they do what your team needs before you leave Google Workspace." |
| k41 | body (Worth knowing) | "Encryption adds overhead to batch uploads, so transferring hundreds of files at once runs slower" | overclaimed | User reports stated as fact. No source recorded in the file (researchNotes cite sentiment only) | Removed from public text. researchNotes keep it as a reported criticism |
| k36 | gdprNotes | "voluntarily complies with GDPR even though Swiss law does not require it" | overclaimed | blog/soc-2 names "GDPR and Swiss DPA compliance". No page says the compliance is voluntary or not required (2026-11-03) | "Proton says it complies with GDPR and Swiss data protection law." |
| k30 | gdprNotes, certifications, researchNotes | "Independent audits by Securitum confirm a zero-logging infrastructure", certification "Securitum no-logs audit (2022-2025)" | overclaimed | drive/security names a Securitum audit of the Drive apps, not a no-logs audit. An audit is not a certification (2026-11-03) | gdprNotes: "Securitum, an independent security firm, has audited the Drive apps." Removed from certifications. Added ISO 27001 (May 2024), sourced in blog/soc-2 |
| k26 | pricingTiers[4], pricingDetails | Drive Professional "$9.99/user/month" | unverifiable | No Proton page read gives a EUR price. business/drive/pricing and business/plans render USD only and carry no EUR offers. USD page: "$7.99/month" billed yearly, $9.99 struck through (2026-11-03) | Tier removed from public text. pricingDetails: 1 TB per user, "EUR price not listed on the Proton pages we read (as of November 2026)" |
| k17 | pricingTiers[1].features | "Enhanced sharing controls" in Drive Plus | unverifiable | Not on the Drive Plus card. The sharing page names no plan-specific controls (2026-11-03) | Removed |
| k44 | pricingDetails | "Proton Business Suite: $12.99/user/month" | unverifiable | support/proton-for-business names Workspace Standard and Premium, no "Business Suite". Price not checked (no EUR source). Not a Drive plan | Removed from pricingDetails |

## Wording fixes

True claims that need an attribution, a date or more precision.

| Id | Where | Claim | Evidence | Fix |
|---|---|---|---|---|
| k7 | body | Proton Docs "keeps your documents encrypted even during real-time editing" | drive/docs: "every update is end-to-end encrypted" | "Proton says every edit stays encrypted." |
| k32 | body | "Proton stores data in its own data centers in Switzerland and Germany" | drive/security: "owning and controlling our own server hardware and network in Switzerland and Germany" | "Proton says it owns its servers, which sit in Switzerland and Germany." |
| k33 | body | "outside the Five Eyes surveillance alliance" | drive/security: Switzerland "isn't a member of any Five Eyes or Fourteen Eyes" agreements | "Switzerland is not part of the Five Eyes intelligence-sharing alliance." (The old sentence put Germany in the same claim.) |
| k34 | body | "founded by CERN scientists in 2014" | proton.me/about: "a team of scientists who met at CERN", 2014 | "Scientists who met at CERN founded it in 2014." |
| k35 | body, parentCompany | "now controlled by the non-profit Proton Foundation" / "controlled by ... since June 2024" | proton.me/foundation: "As Proton's primary shareholder"; blog/proton-non-profit-foundation (17 June 2024): "the primary shareholder of Proton" | Body: "Since June 2024, the non-profit Proton Foundation has been its primary shareholder." parentCompany: "Proton AG (primary shareholder since June 2024: Proton Foundation, a non-profit)" |
| k39 | certifications, researchNotes | "SOC 2 Type II" | blog/soc-2: first SOC 2 Type II attestation in July 2025, audited by Schellman | "SOC 2 Type II (attested July 2025, audited by Schellman)" |

## Current

| Id | Where | Claim | Evidence |
|---|---|---|---|
| k1 | description, body, features, metaDescription | Files are end-to-end encrypted on your device before upload | drive/security, drive: "We encrypt your files, their names, and more right on your device" |
| k3 | location, headquarters, description | Swiss company, Plan-les-Ouates, Geneva | Footer of drive/pricing: Route de la Galaise 32, 1228 Plan-les-Ouates. proton.me/about |
| k5 | freeOption | Free plan exists | drive/pricing: "Proton Free", "No credit card required" |
| k6 | features | Zero-access encryption | drive/pricing FAQ: "zero-access and end-to-end encryption" |
| k8 | features, body | Cross-platform sync. Desktop sync on Windows and macOS, mobile apps for iOS and Android | drive: "Windows, macOS, Android, iOS, and web apps". drive/download |
| k9 | features, body | Photo backup on mobile | drive: "automatic mobile backups" |
| k10 | features, openSource, body, metaDescription | Open source apps | community/open-source: "All Proton apps are open source". Drive GitHub linked |
| k11 | pricingTiers[0] | Free includes Proton Docs | support/proton-plans: Proton Drive Free includes "Proton Docs" |
| k12 | pricingTiers[0] | Free includes basic file sharing | drive/file-sharing: "Start sharing for free" |
| k13 | pricingTiers[0], pricingDetails | Free keeps 10 versions for 7 days | support/version-history: "up to 10 versions of each file for up to 7 days" |
| k15 | pricingTiers[1] | Drive Plus 200 GB | drive/pricing: "200 GB" |
| k16 | pricingTiers[1], pricingDetails, researchNotes | Paid plans keep 200 versions for 10 years | support/version-history: "up to 200 versions of each file for up to 10 years" |
| k20 | pricingTiers[2], body | Unlimited 500 GB | support/proton-plans: "500 GB of total storage" |
| k21 | pricingTiers[2], body | Unlimited includes Mail, VPN, Calendar, Pass | support/proton-plans: Plus versions of Mail, Calendar, Drive, Pass, VPN, Wallet |
| k22 | pricingTiers[2] | Unlimited has priority support | support/proton-plans: "Priority customer support" |
| k24 | pricingTiers[3] | Family 3 TB shared, up to 6 users, all apps | support/proton-plans: "Up to six family members share 3 TB" |
| k27 | body, researchNotes | Shared links with password and expiry date | drive/file-sharing: "set passwords and expiration dates" |
| k28 | body, researchNotes | No file size limit | drive/file-sharing FAQ: "We do not impose any size limits on your uploads" |
| k29 | body, ogDescription | Apps independently audited by Securitum | drive/security: "Proton Drive has been audited by Securitum". Reports on community/open-source |
| k31 | dataStorageLocations, body, gdprNotes | Servers in Switzerland and Germany | drive/security: "server hardware and network in Switzerland and Germany" |
| k37 | gdprNotes | Data processing agreement for business customers | business/gdpr: "Data Processing Agreement (DPA) with business users" |
| k38 | gdprCompliance | compliant (Proton's own statement) | blog/soc-2: "GDPR and Swiss DPA compliance" |
| k40 | body (Worth knowing) | Costs more per gigabyte than Google Drive or Dropbox | Same currency as rendered (USD): Proton 200 GB $3.99/month billed yearly (drive/pricing). Google One 2 TB $9.99/month (one.google.com/about/plans). Dropbox Plus 2,000 GB $9.99/month (dropbox.com/plans) |
| k45 | metaTitle, ogTitle (old) | "Encrypted Cloud Storage from Switzerland" | drive: "End-to-end encrypted cloud storage from Switzerland". Replaced for search (see below), not for accuracy |

## SEO fields

From docs/seo/audits/2026-11-03-top-pages.md, section 7:
- `metaTitle` and `ogTitle`: "Proton Drive Review: Price, Free Plan and Trade-offs" (52). Dutch: "Proton Drive review: prijs, gratis abonnement en nadelen" (56).
- `metaDescription` and `ogDescription`: the audit's text ends "Where it beats pCloud, and where not." The page has no pCloud comparison, so that sentence would promise content that isn't there. Used instead: "Proton Drive encrypts files on your device. Free: 2 GB, or 5 GB after setup steps. 200 GB is €3.99/month billed yearly. What it does well, and where it doesn't." (160). Dutch version 158 characters.
- Not done (outside this audit): the audit's body expansion to 600-800 words with a pricing table, a Proton Drive vs pCloud vs Google Drive table, "Who it suits", FAQs and internal links.

## Also affected

- `content/services/proton-drive/nl.md`: updated in this run. Changed keys: startingPrice, description, pricingTiers (EUR, Duo added, Drive Professional removed), metaTitle, metaDescription, ogTitle, ogDescription, gdprNotes, body.
- `content/services/google-drive/en.md` has `recommendedAlternative: proton-drive` but repeats none of the changed facts.
- `content/articles/proton-moves-infrastructure-out-of-switzerland/en.md` mentions Proton Drive, no changed facts.
- `seoNotes` in en.md still describe the old meta title and description. A new `/seo-check service proton-drive` would refresh them.
- `pricingUrl` still points to proton.me/pricing, which this run did not read. proton.me/drive/pricing is the Drive-specific page.
- For the owner: `region: eu-friendly` matches Proton Mail (Swiss company). The content review lists the Swiss region rule (Proton and Infomaniak `eu-friendly`, pCloud and Threema `eu`) as an open decision. Not changed.

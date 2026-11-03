# Research brief: change your default search engine to an EU one

- Guide slug (proposed): `default-search-engine-to-eu` · Category: `search-engines`
- Replaces four near-identical guides: `services/google-search`, `services/bing-search`, `services/yahoo-search`, `services/duckduckgo` → `services/qwant`, `services/ecosia`, `services/startpage`.
- Researched: 2026-11-03. Every claim below cites a knowledge source note in `knowledge/sources/2026/11/` (`[[slug#cN]]`), or a URL read today.
- In the working tree, all four source services have `recommendedAlternative: qwant` (DuckDuckGo's was changed from `startpage`, uncommitted, outside this research).

## Headline findings

1. **There is no single "settings path" answer, and Safari is the wall.** Of the three targets, only Ecosia is in Safari's own engine list, by Ecosia's account, on iPhone and Mac [[2026-11-03-ecosia-default-mobile-help#c1]] [[2026-11-03-ecosia-default-desktop-help#c4]]. Qwant says Safari does not include it [[2026-11-03-qwant-safari-help#c1]] and offers a Mac extension instead [[2026-11-03-qwant-safari-help#c2]]. Startpage says Safari users cannot set it as default at all [[2026-11-03-startpage-safari-not-default-help#c2]]. Most iPhone users browse in Safari, so the "which one" advice depends on the reader's phone. No competing guide says this.
2. **"Search once, then pick it" is the trick that makes most browsers work.** Chrome adds recently visited engines to its list on Android and iOS [[2026-11-03-chrome-default-search-engine-help#c7]], and on a computer some engines only appear under "Inactive shortcuts" after you have searched on the site [[2026-11-03-chrome-default-search-engine-help#c4]]. Edge works the same way [[2026-11-03-edge-default-search-engine-help#c2]] [[2026-11-03-edge-default-search-engine-help#c4]], and Qwant and Startpage document it for their own engines [[2026-11-03-qwant-chrome-manual-help#c1]] [[2026-11-03-startpage-chrome-android-default-help#c1]]. Firefox added a manual Add button in version 140 (June 2025) [[2026-11-03-firefox-140-custom-search-engines#c3]]. This one step removes most "my engine isn't in the list" problems.
3. **The DMA choice screens: only Google shows a *search* choice screen in the EU.** Google shows one during Android setup and in Chrome on iOS and desktop in the EEA [[2026-11-03-android-dma-choice-screen#c2]] [[2026-11-03-chrome-dma-choice-screen#c1]]. Apple's EU screen is for the **browser**, not the search engine [[2026-11-03-apple-eu-browser-choice-screen#c1]] [[2026-11-03-apple-eu-browser-choice-screen#c6]]. Apple's search engine choice screen is for Japan [[2026-11-03-apple-default-apps-choice-screens#c3]]. Microsoft's only designated service under the choice rule is Windows [[2026-11-03-ec-dma-review-2026-choice-screens#c2]]. The Commission found Bing and Edge are not gatekeeper services [[2026-11-03-ec-bing-edge-not-gatekeepers#c1]]. Windows instead lets apps add web search providers to Windows Search [[2026-11-03-windows-dma-updates-2025#c1]]. So the brief's premise ("Google, Microsoft and Apple show search choice screens") is only true for Google. The guide should say so plainly.
4. **None of the three runs fully on its own index.** Qwant crawls with its own bots but fills results from third parties including Bing [[2026-11-03-qwant-ranking-index-sources#c1]] [[2026-11-03-qwant-ranking-index-sources#c2]], and its privacy policy says it uses Microsoft results "when we do not ourselves have the answers" [[2026-11-03-qwant-privacy-policy#c2]]. Ecosia mixes Bing, Google and the EUSP index, and says EUSP results are only served in France [[2026-11-03-ecosia-search-results-providers#c1]] [[2026-11-03-ecosia-search-results-providers#c3]]. Startpage gets results from Google, Bing and others [[2026-11-03-startpage-what-is-startpage#c3]]. The Staan "50%" figure was a target for the end of 2025 [[2026-11-03-techcrunch-staan-launch#c2]]. We found no source that says it was reached.
5. **Startpage is part of a US ad-tech company.** Startpage says it is part of System1, a US public company [[2026-11-03-startpage-what-is-startpage#c2]]. System1 lists both Privacy One Group Limited and Surfboard Holding B.V. as subsidiaries [[2026-11-03-system1-10k-2022-subsidiaries#c1]] [[2026-11-03-system1-10k-2022-subsidiaries#c2]]. Startpage's CEO would not give the percentage [[2026-11-03-computing-startpage-system1-investment#c2]], so write "part of System1", not "majority owned". This matches the new `region` rule in `.claude/skills/_shared/content-files.md` (owner abroad stays `eu`, the page says so).
6. **Two claims in our listings to fix (for the main agent, not this guide).**
   - `services/duckduckgo`: `gdprNotes` says "GDPR does not directly apply", and `metaDescription` says it "falls outside GDPR". The GDPR applies to non-EU companies that offer services to people in the EU [[2026-11-03-gdpr-article-3-territorial-scope#c2]]. DuckDuckGo names a GDPR Article 27 representative in Ireland [[2026-11-03-duckduckgo-privacy-rights-gdpr-representative#c1]]. The same note says "EU queries go through US servers". DuckDuckGo says devices typically connect to regional servers, for example European servers in Europe [[2026-11-03-duckduckgo-privacy-policy#c4]]. Both need rewriting.
   - `services/qwant` body: "It went live in August 2025 and aims to handle 50% of French search queries". The 50% (France) and 33% (Germany) were targets for the end of 2025 [[2026-11-03-techcrunch-staan-launch#c2]]. The sentence should be dated as a past target with no confirmed outcome. The same body says Qwant "relied on Bing ... behind the scenes" in the past tense. Qwant's current privacy policy still describes a Microsoft partnership for results [[2026-11-03-qwant-privacy-policy#c2]].

## Recommended format: one guide, `google-search` → `qwant`, with extra relations

Options, from `content/landing-pages/` and `.claude/skills/_shared/content-files.md`:

| Option | Pros | Cons |
|---|---|---|
| **A. Guide** `sourceService: google-search`, `targetService: qwant`, engine-neutral body | Uses the guide template (steps, troubleshooting, `difficulty`, `timeRequired`, `missingFeatures`). The Google page already links it: non-EU pages show guides for the pair (source, `recommendedAlternative`) (`apps/website/lib/services.ts`, `getMigrationGuidesForPair`). The Qwant page lists guides that target it (`getRelatedGuides`). | Bing, Yahoo and DuckDuckGo pages won't link it (source mismatch). Ecosia and Startpage pages won't list it (target mismatch). `missingFeatures` is per pair. |
| **B. Landing page** (`recommendedServices: [qwant, ecosia, startpage]`, `relatedService: google-search`), like `quit-chatgpt` | Shows all three targets as cards. Free body. | No step markers, `difficulty` or `timeRequired`. Lives under `/pages/`, not `/guides/`. Not linked from any service page. Fits a campaign ("Quit Google Search"), not a how-to. |
| **C. Option A plus a small code change** | Same as A, and every one of the 7 service pages links the one guide. | Needs a loader and filter change. |

**Recommendation: C, with A as the no-code fallback.**

- Frontmatter: `sourceService: google-search`, `targetService: qwant` (all four sources recommend Qwant), plus two new optional list keys, for example `alsoSourceServices: [bing-search, yahoo-search, duckduckgo]` and `alsoTargetServices: [ecosia, startpage]`.
- Code: read the new keys in `apps/website/lib/content/loader.ts` (next to `sourceService`/`targetService`, line ~242). Match them in `getMigrationGuidesForPair` and `getRelatedGuides` in `apps/website/lib/services.ts`.
- Fallback without code: ship A, and add one sentence linking the guide in the bodies of the Bing, Yahoo, DuckDuckGo, Ecosia and Startpage pages.
- Title: "Change your default search engine to an EU one". Keep Google out of the title so Bing, Yahoo and DuckDuckGo readers recognise themselves. Name Google, Bing, Yahoo and DuckDuckGo in the intro and `description`.
- Why Qwant as the primary target and not Ecosia: Ecosia is the easiest on iPhone (finding 1), but making it the pair target means changing `recommendedAlternative` on four pages. The body stays engine-neutral, and step 1 helps the reader pick. If the owner prefers Ecosia, switch both `targetService` and the four `recommendedAlternative` values together.
- B can come later as a campaign page that links to this guide.

## 1. Target queries

**Search Console (last 3 months).** No query in the export asks how to change or set a default search engine. We have no page for it, so there is no demand data from our own site. The search-engine queries we do get are about European engines and Startpage itself.

| Query | Clicks | Impressions | Position | Fit |
|---|---|---|---|---|
| startpage | 0 | 33 | 24.33 | brand, "which one" section |
| duitse zoekmachines | 0 | 24 | 33.42 | Dutch: "German search engines" (Ecosia) |
| search engines no filter | 0 | 12 | 11.33 | weak fit |
| wat is ecosia | 0 | 10 | 70 | Dutch: "what is Ecosia" |
| zoekmachines duitsland | 0 | 9 | 42.11 | Dutch, Ecosia |
| europese zoekmachine | 0 | 9 | 42 | Dutch: "European search engine" |
| startpage zoekmachine | 0 | 4 | 27.75 | brand |
| startpage location netherlands | 0 | 4 | 6 | ownership question (finding 5) |
| groene zoekmachine | 0 | 4 | 90 | Dutch: "green search engine" |
| european search engine | 0 | 3 | 36 | core |
| ecosia zoekmachine | 0 | 3 | 62.67 | brand |
| zoekmachine privacy | 0 | 2 | 25.5 | Dutch |
| duurzame zoekmachine | 0 | 2 | 79.5 | Dutch: "sustainable search engine" |
| beste europese zoekmachine | 0 | 1 | 54 | Dutch: "best European search engine" |
| moteur de recherche européen | 0 | 1 | 3 | French |
| europäische alternative zu google | 0 | 1 | 1 | German |

Excluded: "business startpage" (45 impressions) and "startpagina" (16) are Dutch for a browser home page, not Startpage.

Pages: `/nl/services/eu/startpage` 122 impressions (position 35.2), `/en/services/eu/startpage` 84 impressions and 2 clicks (position 15.7), `/nl/services/search-engines` 53 (38.6), `/nl/services/eu/ecosia` 29 (61.1), `/en/services/search-engines` 28 (16.3).

**Queries to target, from the SERPs (no volume data available to us):** "change default search engine", "how to change search engine in Chrome / Safari / Firefox / Edge", "set Ecosia as default search engine", "set Qwant as default search engine", "Startpage default search engine Safari", "European alternative to Google search". The English SERP is crowded with generic how-tos, none with an EU angle (section 2). The Dutch cluster ("europese zoekmachine", "duitse zoekmachines") suggests the `nl` translation matters.

## 2. Competing guides

Searches run: "how to change your default search engine Chrome Firefox Safari Edge guide 2026", "switch from Google to European search engine Qwant Ecosia Startpage how to set default", "European alternatives to Google Search guide switch default search engine privacy EU".

| # | Guide | Publisher | Date | Length | H2 outline | Method / steps | Pitfalls & FAQs | Affiliate links | Outdated or wrong |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [How to Change Your Browser's Default Search Engine](https://www.computerhope.com/issues/ch001755.htm) | Computer Hope | updated 2025-10-03 | ~1,050 words | Chrome · Firefox · Edge · Edge Legacy · Internet Explorer · Opera · Safari | Desktop settings paths, plus "Add" for custom engines in Chrome, Edge, Opera | None | None seen | Desktop only, no phones. Spends space on Edge Legacy and Internet Explorer. Chrome path goes through "Manage search engines", where Google's current page uses Search engine > Change [[2026-11-03-chrome-default-search-engine-help#c2]]. Safari still calls it the "Preferences window" (Apple: Safari > Settings > Search [[2026-11-03-apple-safari-mac-search-settings#c1]]). |
| 2 | [How To Change Your Default Search Engine In Chrome, Edge, Firefox & Safari](https://www.searchenginejournal.com/change-default-search-engine-browser/464446/) | Search Engine Journal | 2023-03-17 | ~1,800 words | Chrome (add, edit, remove) · Firefox (add, remove) · Edge · Safari desktop · Safari iPhone · Android · Conclusion | Settings paths and adding a custom engine with `%s` | Malware note for Chrome. "Recently visited engines" on Android only. | None seen | Screenshots from February 2023. Chrome "Search engine used in the address bar" dropdown, now a Change button [[2026-11-03-chrome-default-search-engine-help#c2]]. iPhone path Settings > Safari, while Apple's iOS 27 guide gives Settings > Search > Search Engine [[2026-11-03-apple-iphone-default-search-engine-help#c2]]. Firefox add-on route predates the Add button [[2026-11-03-firefox-140-custom-search-engines#c3]]. No EU angle. |
| 3 | [Changing your search engine in Chrome, Firefox or Edge](https://www.ionos.com/digitalguide/online-marketing/search-engine-marketing/change-your-search-engine/) | IONOS Digital Guide | 2022-01-13 | ~670 words | On a PC, smartphone or tablet · Chrome · Firefox · Edge · Other search engines | Google used as the example target | None | None seen (hosting company content marketing) | No Safari, no phones beyond a line on Android. Old Edge path ("Manage search engines" dropdown). Microsoft now says Address bar and search > "Search engine used in the address bar" [[2026-11-03-edge-default-search-engine-help#c3]]. |
| 4 | [How to set Ecosia as your default search engine](https://www.ionos.com/digitalguide/online-marketing/search-engine-marketing/ecosia-as-default-search-engine/) | IONOS Digital Guide | 2023-09-07 | ~800 words | What makes Ecosia "green" · How to make Ecosia your default (Chrome, Edge, Firefox, Safari) · Use Ecosia as an app | Desktop settings, app download for phones | None | None seen | Says Ecosia "donates around 80 percent of its revenue". Ecosia says 100% of profits go to climate action [[2026-11-03-ecosia-how-it-makes-money#c1]]. Says results are "based on Bing", but Ecosia now uses Bing, Google and EUSP [[2026-11-03-ecosia-search-results-providers#c1]]. Doesn't mention that Firefox lists Ecosia only in 8 countries [[2026-11-03-ecosia-default-desktop-help#c6]]. No iPhone Safari setting [[2026-11-03-ecosia-default-mobile-help#c1]]. |
| 5 | [European search engines tested: which one can replace Google?](https://itdaily.com/blogs/software/european-search-engines-tested/) | ITdaily | 2026-09-07 | ~1,230 words | The dark side of Google · Completely Google-free? · European search engines tested (Qwant, Startpage, Swisscows, Ecosia, Lilo, Mojeek) · Unequal struggle | Comparison only, no setup steps | None | None seen | Calls Startpage "the Dutch Startpage" without the System1 link [[2026-11-03-startpage-what-is-startpage#c2]]. Says Qwant is "gradually switching to its own index" without the current Microsoft partnership [[2026-11-03-qwant-privacy-policy#c2]]. Counts Mojeek, which is UK-based, among "European" engines without noting the UK is outside the EU. |

No competing guide got a source note: none holds a useful fact the official docs lack.

**What they all cover (the minimum we need):**
- Chrome, Firefox, Edge and Safari desktop settings paths.
- Adding an engine that isn't listed (Chrome/Edge "Add", Firefox add-ons).
- Two of five cover phones, and only Chrome Android and Safari iPhone.

**What they miss or get wrong (where we win):**
1. **Safari's limits.** Nobody says Qwant and Startpage can't be Safari's engine without an extension, or at all [[2026-11-03-qwant-safari-help#c1]] [[2026-11-03-startpage-safari-not-default-help#c2]], or offers the workarounds: Qwant app as browser, home screen shortcut, Quick Website Search [[2026-11-03-qwant-iphone-app-help#c4]] [[2026-11-03-startpage-safari-ios-homescreen-help#c1]] [[2026-11-03-startpage-safari-not-default-help#c4]].
2. **"Search once first."** Only SEJ mentions recently visited engines, and only for Android (finding 2).
3. **The EU choice screens.** No guide explains that Android and Chrome may already have asked you, and that this choice can be changed later in settings [[2026-11-03-android-dma-choice-screen#c2]] [[2026-11-03-chrome-dma-choice-screen#c2]].
4. **Country-dependent lists.** Firefox lists Ecosia only in 8 countries (as of December 2024) [[2026-11-03-ecosia-default-desktop-help#c6]]. Vivaldi lists Qwant "in selected countries" [[2026-11-03-vivaldi-search-settings-desktop-help#c3]]. Google builds its choice list per country [[2026-11-03-android-dma-search-choice-eligibility#c3]].
5. **Private windows are separate.** Safari on Mac, Brave and Vivaldi keep a separate private-window engine [[2026-11-03-apple-safari-mac-search-settings#c2]] [[2026-11-03-brave-default-search-engine-help#c1]] [[2026-11-03-vivaldi-search-settings-desktop-help#c2]]. People switch the main one and keep Google in private mode by accident.
6. **Extensions do more than search.** Qwant's and Ecosia's extensions also take over the home page [[2026-11-03-qwant-chrome-extension-help#c1]] [[2026-11-03-ecosia-default-desktop-help#c3]]. Qwant's also blocks trackers [[2026-11-03-qwant-chrome-extension-help#c2]]. Chrome may ask the user to confirm the change ("Keep changes") [[2026-11-03-startpage-chrome-default-help#c3]].
7. **An honest comparison of indexes and ownership** (findings 4 and 5). ITdaily is the only one that compares engines, and it leaves out ownership.

## 3. Proposed outline

Frontmatter: `title: Change your default search engine to an EU one` · `category: search-engines` · `sourceService: google-search` · `targetService: qwant` (+ `alsoSourceServices` / `alsoTargetServices` if option C) · `difficulty: beginner` · `timeRequired: 10 minutes`.

**`difficulty: beginner`**: it is one setting per browser, with no account, export or import.
**`timeRequired: 10 minutes`**: about 2 to 3 minutes per browser on each device, and most people have one browser on a computer and one on a phone. Add a few minutes if the engine isn't listed and has to be added by URL. State the per-browser figure in the intro so people with more devices can scale it.

### intro (100–150 words)
- What changes: the engine your browser uses when you type in the address bar. Your bookmarks, passwords and browser stay the same.
- Who it is for: people on Google, Bing, Yahoo or DuckDuckGo. Bing powers Yahoo and most DuckDuckGo results ([[2026-11-03-duckduckgo-results-sources#c1]]; Yahoo per our `services/yahoo-search` research, not re-checked today).
- The EU context, in one sentence: since 2024, EU rules make Google ask Android and Chrome users to pick a search engine [[2026-11-03-android-dma-choice-screen#c1]] [[2026-11-03-chrome-dma-choice-screen#c1]]. If you clicked past it, this is how to change it.

### beforeYouStart (50–100 words)
- Pick your engine first (step 1 helps). If you use Safari on iPhone, Ecosia is the simple choice (finding 1).
- Do it on every browser and every device. The setting doesn't sync between browsers, and on iPhone Chrome and Safari each have their own [[2026-11-03-chrome-default-search-engine-help#c6]] [[2026-11-03-apple-iphone-default-search-engine-help#c2]].
- A work or school browser may be locked by your admin [[2026-11-03-chrome-default-search-engine-help#c9]].
- Extensions change your home page too [[2026-11-03-qwant-chrome-extension-help#c1]].

### steps (one browser per step; each step covers computer and phone)

Write a short "If it isn't in the list" line in each step: visit the engine and search once, then come back (finding 2).

**Step 1. Pick Qwant, Ecosia or Startpage.** A compact table, dated "as of November 2026":

| | Qwant | Ecosia | Startpage |
|---|---|---|---|
| Based in | Paris, France (our listing; owner not re-checked today) | Berlin, Germany; steward-owned, per the EUSP announcement [[2026-11-03-qwant-ecosia-eusp-announcement#c2]] | The Hague, Netherlands; part of US company System1 [[2026-11-03-startpage-what-is-startpage#c2]] |
| Where results come from | Own crawler plus third parties including Bing [[2026-11-03-qwant-ranking-index-sources#c1]] [[2026-11-03-qwant-ranking-index-sources#c2]]; Staan index [[2026-11-03-qwant-privacy-policy#c6]] | Bing, Google, and EUSP in France only [[2026-11-03-ecosia-search-results-providers#c1]] [[2026-11-03-ecosia-search-results-providers#c3]] | Google, Bing and others [[2026-11-03-startpage-what-is-startpage#c3]] |
| What partners receive (company's own account) | Keywords, first 3 bytes of IP, region; full IP for fraud checks [[2026-11-03-qwant-privacy-policy#c3]] [[2026-11-03-qwant-privacy-policy#c4]] | IP address and search terms; Ecosia anonymises IP after 7 days [[2026-11-03-ecosia-privacy-policy#c2]] [[2026-11-03-ecosia-privacy-policy#c3]] | Startpage says it anonymises every search [[2026-11-03-startpage-what-is-startpage#c3]] |
| In Safari's list | No (Mac extension) [[2026-11-03-qwant-safari-help#c1]] [[2026-11-03-qwant-safari-help#c2]] | Yes, per Ecosia [[2026-11-03-ecosia-default-mobile-help#c1]] | No [[2026-11-03-startpage-safari-not-default-help#c2]] |
| How it earns | Contextual ads; Microsoft shopping ads [[2026-11-03-qwant-ranking-index-sources#c4]] | Ads via Google and Microsoft; 100% of profits to climate action [[2026-11-03-ecosia-how-it-makes-money#c1]] [[2026-11-03-ecosia-how-it-makes-money#c2]] | Contextual ads [[2026-11-03-startpage-what-is-startpage#c4]] |
| Extra | Own app with "Zap" [[2026-11-03-qwant-iphone-app-help#c3]] | Own app and browser [[2026-11-03-ecosia-default-mobile-help#c6]] | Anonymous View proxy [[2026-11-03-startpage-what-is-startpage#c5]] |

"Which one should I pick" (honest, reader-led):
- **You use an iPhone with Safari and want it done in one minute:** Ecosia. It is the only one of the three in Safari's list (finding 1).
- **You want results closest to Google's:** Startpage, which gets results from Google among others [[2026-11-03-startpage-what-is-startpage#c3]]. Worth knowing: it is part of US ad company System1 (finding 5). It says US staff can't reach the servers that link searches to people [[2026-11-03-computing-startpage-system1-investment#c4]], but that is the company's own word, from 2020.
- **You want the most European set-up and back the EU index:** Qwant. It runs its own crawler and co-owns EUSP [[2026-11-03-qwant-ranking-index-sources#c1]] [[2026-11-03-qwant-ecosia-eusp-announcement#c1]]. Worth knowing: it still uses Microsoft for some results [[2026-11-03-qwant-privacy-policy#c2]], and it isn't in Safari's list.
- **You care about climate impact:** Ecosia [[2026-11-03-ecosia-how-it-makes-money#c1]]. Worth knowing: your IP and search terms go to Bing or Google [[2026-11-03-ecosia-privacy-policy#c2]].
- Don't rank them overall. Tell readers they can switch again in a minute.

**Step 2. Set it in Chrome.**
- Computer: More (⋮) > Settings > Search engine > Change, pick the engine [[2026-11-03-chrome-default-search-engine-help#c2]]. Not listed: search on the engine's site once, then look under Manage search engines and site search > Inactive shortcuts > Activate, then ⋮ > Make default [[2026-11-03-chrome-default-search-engine-help#c3]] [[2026-11-03-chrome-default-search-engine-help#c4]].
- Android: More > Settings > Basics > Search engine [[2026-11-03-chrome-default-search-engine-help#c5]]. iPhone: More > Settings > Search engine [[2026-11-03-chrome-default-search-engine-help#c6]]. Recently visited engines appear in the list [[2026-11-03-chrome-default-search-engine-help#c7]].
- Startpage on Chrome mobile: Startpage says to switch its settings to GET before Chrome will list it, then back to POST [[2026-11-03-startpage-chrome-android-default-help#c1]] [[2026-11-03-startpage-chrome-android-default-help#c3]] [[2026-11-03-startpage-chrome-ios-default-help#c1]]. Test it (open question 6).
- Extensions as the alternative: Qwant, Ecosia, Startpage [[2026-11-03-qwant-chrome-extension-help#c1]] [[2026-11-03-ecosia-default-desktop-help#c3]] [[2026-11-03-startpage-chrome-default-help#c1]]. If Chrome asks, click "Keep changes" [[2026-11-03-startpage-chrome-default-help#c3]].

**Step 3. Set it in Safari.**
- iPhone: Settings > Search > Search Engine (Apple's iOS 27 page) [[2026-11-03-apple-iphone-default-search-engine-help#c2]]. Apple's Safari page gives Settings > Apps > Safari > Search Engine [[2026-11-03-apple-iphone-safari-search-help#c1]], and Ecosia gives Settings > Safari > Search Engine [[2026-11-03-ecosia-default-mobile-help#c1]]. Give the iOS 27 path, and the other as "on older iOS versions". Verify by hand (open question 1).
- Mac: Safari > Settings > Search > Search engine, and set the Private Browsing search engine too [[2026-11-03-apple-safari-mac-search-settings#c1]] [[2026-11-03-apple-safari-mac-search-settings#c2]].
- Qwant: Mac extension "Qwant for Safari" from the Mac App Store, then enable it under Safari > Settings > Extensions [[2026-11-03-qwant-safari-help#c2]]. On iPhone, use the Qwant app and make it your default browser [[2026-11-03-qwant-iphone-app-help#c4]]. Default browser is set under Settings > Apps > Default Apps > Browser App [[2026-11-03-apple-default-apps-choice-screens#c1]].
- Startpage: it can't be Safari's engine [[2026-11-03-startpage-safari-not-default-help#c2]]. On iPhone, add it to the home screen [[2026-11-03-startpage-safari-ios-homescreen-help#c1]] or use another browser. On Mac, use Quick Website Search: type "startpage", then your search [[2026-11-03-startpage-safari-not-default-help#c4]] [[2026-11-03-apple-safari-mac-search-settings#c4]].

**Step 4. Set it in Firefox.**
- Computer: menu > Settings > Search > Default Search Engine (per Qwant and Ecosia; Mozilla's own page could not be read, open question 2) [[2026-11-03-qwant-firefox-manual-help#c1]] [[2026-11-03-ecosia-default-desktop-help#c6]]. Not listed: since Firefox 140, Settings > Search > Add with the engine's URL [[2026-11-03-firefox-140-custom-search-engines#c3]]. Or right-click the engine's search box > "Add Search Engine" [[2026-11-03-firefox-140-custom-search-engines#c2]].
- URLs for adding: Qwant `https://www.qwant.com/?q=%s` [[2026-11-03-qwant-install-on-computer-help#c5]] · Ecosia `https://www.ecosia.org/search?q=%s` [[2026-11-03-ecosia-default-mobile-help#c4]] · Startpage `https://www.startpage.com/sp/search?query=%s` [[2026-11-03-startpage-firefox-ios-default-help#c1]].
- Android: Settings > Search, or add under "Manage alternative search engines" [[2026-11-03-ecosia-default-mobile-help#c4]]. iPhone: Settings > Search > Add Search Engine, then tap the current default and pick the new one [[2026-11-03-startpage-firefox-ios-default-help#c1]] [[2026-11-03-startpage-firefox-ios-default-help#c2]].

**Step 5. Set it in Edge.**
- Computer: search once with the engine in the address bar, then Settings and more > Settings > Privacy, search, and services > Search and connected services > Address bar and search > "Search engine used in the address bar" [[2026-11-03-edge-default-search-engine-help#c2]] [[2026-11-03-edge-default-search-engine-help#c3]].
- Phone: menu (…) > Settings > General > Default search engine. If it's missing, visit the engine first [[2026-11-03-edge-mobile-faq-search-engine#c2]] [[2026-11-03-edge-mobile-faq-search-engine#c3]].

**Step 6. Set it in Brave or Vivaldi.**
- Brave computer: Menu > Settings > Search Engine, with separate normal and private defaults [[2026-11-03-brave-default-search-engine-help#c1]]. Phone: Settings > Search Engines > Standard Tab [[2026-11-03-brave-search-faq-default-mobile#c1]] [[2026-11-03-brave-search-faq-default-mobile#c2]]. Brave's own help uses Qwant as its example default (note summary).
- Vivaldi computer: Settings > Search > Default Search Engine, and Private Window Search Engine [[2026-11-03-vivaldi-search-settings-desktop-help#c1]] [[2026-11-03-vivaldi-search-settings-desktop-help#c2]]. All three are built in (Qwant in selected countries) [[2026-11-03-vivaldi-search-settings-desktop-help#c3]]. Android and iPhone: Vivaldi menu > Settings > Search Engine > Standard Tab, and Private Tab [[2026-11-03-vivaldi-search-android-help#c1]] [[2026-11-03-vivaldi-search-android-help#c2]] [[2026-11-03-vivaldi-search-ios-help#c1]].
- Worth one line: Vivaldi earns money from Startpage, Ecosia, DuckDuckGo and Qwant as search partners [[2026-11-03-vivaldi-7-1-release-search-partners#c2]].

**Step 7. Check it worked.** Type a search in the address bar of a normal and a private window. On Ecosia, the ⋯ next to a result shows which provider served it [[2026-11-03-ecosia-search-results-providers#c4]].

(Optional step, or a box after step 1: **"Got a choice screen?"** On Android, the screen you saw at setup set Chrome's engine and the home screen search box [[2026-11-03-android-dma-choice-screen#c3]]. On iPhone, Apple's EU screen picks a browser, not a search engine [[2026-11-03-apple-eu-browser-choice-screen#c6]]. Ecosia, Qwant and Startpage browsers appear on some country lists [[2026-11-03-apple-eu-browser-choice-screen#c5]].)

### troubleshooting (3–5 Q&A, 100–200 words)
1. **"My engine isn't in the list."** Search on its site once and check again (Chrome, Edge) [[2026-11-03-chrome-default-search-engine-help#c4]] [[2026-11-03-edge-default-search-engine-help#c4]]. Or add it by URL (Chrome Add, Firefox 140+ Add) [[2026-11-03-chrome-default-search-engine-help#c3]] [[2026-11-03-firefox-140-custom-search-engines#c3]]. Lists differ by country [[2026-11-03-ecosia-default-desktop-help#c6]] [[2026-11-03-ecosia-default-mobile-help#c3]].
2. **"It switched back to Google/Bing."** Check extensions and work-managed settings. Google says unexpected changes can mean malware, and that work or school admins can lock the default [[2026-11-03-chrome-default-search-engine-help#c9]].
3. **"Can I get the choice screen again?"** Neither Google nor Apple documents a way to show it again [[2026-11-03-chrome-dma-choice-screen#c5]]. On iPhone, the browser screen shows once per device, and again only when you move to a new device with Safari as default [[2026-11-03-apple-eu-browser-choice-screen#c2]] [[2026-11-03-apple-eu-browser-choice-screen#c3]]. Change it in settings instead.
4. **"I can't pick Qwant or Startpage in Safari on my iPhone."** See step 3 [[2026-11-03-qwant-safari-help#c1]] [[2026-11-03-startpage-safari-not-default-help#c2]].
5. **"Private windows still use Google."** Set the private-window engine too [[2026-11-03-apple-safari-mac-search-settings#c2]] [[2026-11-03-vivaldi-search-settings-desktop-help#c2]].

### outro (50–100 words)
- Give it two weeks before judging. For a niche query, run it once on another engine and don't switch back. Our Google/Qwant listings note thinner results for niche queries; re-check before quoting.
- Next steps: link the Chrome → Vivaldi guide (`docs/guides/research/chrome-to-vivaldi.md`) and the Ecosia Browser listing (`services/ecosia-browser`).
- No pressure to pick "the best": switching again takes a minute.

## 4. missingFeatures

Only absences an official source confirms. Phrase them as "what you lose when you leave Google/Bing".

- **No personalised results from your search history (Qwant).** Qwant says the order of results is not influenced by your search or browsing history [[2026-11-03-qwant-ranking-index-sources#c5]]. Ecosia doesn't build a personal profile from searches [[2026-11-03-ecosia-privacy-policy#c1]] (by design; frame it as a trade-off, not a flaw).
- **Qwant and Startpage aren't selectable in Safari's search engine setting** [[2026-11-03-qwant-safari-help#c1]] [[2026-11-03-startpage-safari-not-default-help#c2]].
- **Ecosia's own European index results are only served in France** [[2026-11-03-ecosia-search-results-providers#c3]]. Elsewhere you get Bing or Google results. This belongs in the pick table, not `missingFeatures`, since it isn't a Google feature.

**Not listed, so check before claiming (don't put in `missingFeatures`):**
- Equivalents of Google's AI Mode / AI Overviews. Qwant has AI summaries [[2026-11-03-techcrunch-staan-launch#c3]] [[2026-11-03-qwant-privacy-policy#c6]]. Ecosia lists Mistral as the provider of its chat feature (https://support.ecosia.org/article/579-search-results-providers, read today, not captured as a claim). Startpage not checked.
- Maps, local results, shopping, flights: depth versus Google not compared.
- Image and video search quality; reverse image search (Google Lens).
- Search operators (verbatim, `site:`, date filters).
- Search history synced across devices through an account (Google, Microsoft). Qwant's privacy policy mentions user accounts "in the relevant territories only" (not captured as a claim; check what an account offers).
- DuckDuckGo-style `!bang` shortcuts: not checked for any of the three.

## 5. Open questions (test by hand before publishing)

1. **iPhone (iOS 26 and 27):** is the path Settings > Search > Search Engine or Settings > Apps > Safari > Search Engine? Apple's own two pages disagree [[2026-11-03-apple-iphone-default-search-engine-help#c2]] [[2026-11-03-apple-iphone-safari-search-help#c1]]. Which engines does Safari list for an EU (NL, BE, DE, FR) region? Is Ecosia there in all of them? Apple doesn't publish the list [[2026-11-03-apple-iphone-safari-search-help#c3]].
2. **Firefox:** support.mozilla.org returned a bot challenge to every request today, and the Wayback Machine was rate-limited. Verify the desktop, Android and iOS paths on a current Firefox. Check which of the three engines are built in for NL/BE/DE/FR, and whether Qwant is built in for France.
3. **Chrome desktop and Android in the EEA:** after the choice screen, which engines does Search engine > Change offer in NL/BE/DE/FR? Are Qwant, Ecosia and Startpage there without a first search? Ecosia's "top 5" note is probably pre-DMA [[2026-11-03-ecosia-default-mobile-help#c3]], while Google says up to 8 on new Android devices [[2026-11-03-android-dma-search-choice-eligibility#c4]].
4. **Does a new Chrome profile in the EEA show the search choice screen again?** Google says it appears at profile setup [[2026-11-03-chrome-dma-choice-screen#c2]], but not if a non-Google engine is already chosen [[2026-11-03-android-dma-search-choice-eligibility#c5]]. Is there any documented way to see it again on Android, short of a factory reset? We found none.
5. **Safari extensions:** does a current Startpage extension exist for Safari on Mac or iOS? Its Safari article dates from the Safari 13 era [[2026-11-03-startpage-safari-not-default-help#c1]]. Qwant links an iOS Safari article that its help centre doesn't list [[2026-11-03-qwant-safari-help#c5]]: does it exist, and does a "Qwant for Safari" extension work on iPhone?
6. **Startpage GET/POST:** is the GET switch still needed for Chrome on Android and iPhone [[2026-11-03-startpage-chrome-android-default-help#c1]]?
7. **Edge:** after one search, do Qwant, Ecosia and Startpage appear in the desktop and mobile lists in NL/BE/DE? Ecosia says the setting "may not be available in your country" [[2026-11-03-ecosia-default-desktop-help#c5]]. Confirm the Edge mobile path on both Android and iOS [[2026-11-03-edge-mobile-faq-search-engine#c2]].
8. **What do the extensions change?** Qwant, Ecosia and Startpage extensions in Chrome and Firefox: home page, new tab, tracker blocking. Does Chrome's "Keep changes" prompt appear?
9. **Ecosia provider for a Dutch or Belgian user:** Google or Bing by default [[2026-11-03-ecosia-privacy-policy#c4]]? Is EUSP still France-only [[2026-11-03-ecosia-search-results-providers#c3]]? A third-party 2026 blog claimed a German rollout on 2026-07-30 (aiidelist.com, not read in full, not ingested).
10. **Staan:** did EUSP reach its end-2025 targets (50% France, 33% Germany) [[2026-11-03-techcrunch-staan-launch#c2]]? No source found. Ask Qwant or Ecosia press, or check their 2025 transparency reports.
11. **Qwant ownership** (Octave Klaba since 2023, per our listing via Wikipedia): not re-checked today. Confirm before the pick table names an owner.

## 6. Proposed entity facts

Slugs from `pnpm -s knowledge resolve`. New = no match, create the entity first.

**`surfboard`** (Startpage's owner, derived from `parentCompany`, no note yet). Suggest renaming its display name to "Surfboard Holding B.V.".
- 2026-11-03 · Startpage says it is part of System1, a publicly traded US company, through a Dutch company in The Hague. [[2026-11-03-startpage-what-is-startpage#c2]]
- 2022-12-31 · Listed as a subsidiary of System1, Inc. in System1's annual report for fiscal 2022 (exact filing date not on the exhibit). [[2026-11-03-system1-10k-2022-subsidiaries#c2]]
- 2020-07-03 · Startpage's CEO declined to give the share of Surfboard Holding held by System1 through Privacy One Group. [[2026-11-03-computing-startpage-system1-investment#c1]] [[2026-11-03-computing-startpage-system1-investment#c2]]
- Relation: `{to: system1, rel: subsidiary-of}`.

**`system1`** (new, company, US ad-tech; aliases: System1 Inc.)
- 2022-12-31 · Lists Privacy One Group Limited (Delaware) and Surfboard Holding B.V. (Netherlands) as subsidiaries. [[2026-11-03-system1-10k-2022-subsidiaries#c1]] [[2026-11-03-system1-10k-2022-subsidiaries#c2]]
- Relation: `{to: surfboard, rel: owns}`.

**`ecosia`** (derived, no note yet)
- 2026-11-03 · Ecosia says its results come from Bing, Google and EUSP, and that EUSP results are served only in France. [[2026-11-03-ecosia-search-results-providers#c1]] [[2026-11-03-ecosia-search-results-providers#c3]]
- 2026-05-21 · Privacy policy says IP addresses are anonymised after at most 7 days, and IP and search terms are shared with Bing or Google. [[2026-11-03-ecosia-privacy-policy#c2]] [[2026-11-03-ecosia-privacy-policy#c3]]
- 2025-08-06 · Started serving queries through the Staan index with Qwant. [[2026-11-03-techcrunch-staan-launch#c1]]
- 2024-11-08 · Announced European Search Perspective (EUSP), a 50/50 joint venture with Qwant based in Paris. [[2026-11-03-qwant-ecosia-eusp-announcement#c1]]
- Relation: `{to: european-search-perspective, rel: owns}` (50% stake). The partner company Qwant has no entity yet (see `octave-klaba` below), so don't add a `partners-with` edge to `octave-klaba`.

**`octave-klaba`** (derived owner of `services/qwant`). Qwant the company has no entity. Consider creating `qwant` (company) and linking `octave-klaba` → `owns` → `qwant` once ownership is re-checked (open question 11).
- 2026-11-03 · Qwant's privacy policy says it uses Microsoft for search results when it lacks its own answers, and lists Staan as a partner. [[2026-11-03-qwant-privacy-policy#c2]] [[2026-11-03-qwant-privacy-policy#c6]]
- 2025-08-06 · Qwant and Ecosia started serving queries via Staan; EUSP aimed for about 50% of French and 33% of German queries by the end of 2025. [[2026-11-03-techcrunch-staan-launch#c1]] [[2026-11-03-techcrunch-staan-launch#c2]]

**`european-search-perspective`** (new, company; aliases: EUSP, Staan)
- 2025-08-06 · Launched the Staan index; Qwant and Ecosia began serving queries through it. [[2026-11-03-techcrunch-staan-launch#c1]]
- 2024-11-08 · Founded as a 50/50 Ecosia–Qwant joint venture in Paris, outside Ecosia's steward-owned model. [[2026-11-03-qwant-ecosia-eusp-announcement#c1]] [[2026-11-03-qwant-ecosia-eusp-announcement#c2]]

**`duck-duck-go`** (derived)
- 2026-06-17 · Names GRCI Law Limited (Ireland) as its GDPR Article 27 representative. [[2026-11-03-duckduckgo-privacy-rights-gdpr-representative#c1]]
- 2026-06-03 · Privacy policy says devices typically connect to regional servers, for example European servers in Europe. [[2026-11-03-duckduckgo-privacy-policy#c4]]

**`microsoft`** (derived)
- 2025-07-25 · Windows default-browser changes for the DMA started rolling out to retail PCs in the EEA. Windows Search accepts third-party web search providers. [[2026-11-03-windows-dma-updates-2025#c1]] [[2026-11-03-windows-dma-updates-2025#c4]]
- 2024-02-12 · The Commission decided Bing and Edge are not gatekeeper services under the DMA. [[2026-11-03-ec-bing-edge-not-gatekeepers#c1]]

**`alphabet`** (derived; `google` is a derived child)
- 2024-03-06 · Android OEMs must include the DMA choice screen software in new EEA devices; Pixel got it in early March 2024. [[2026-11-03-android-dma-choice-screen#c5]]
- 2023-09-06 · Designated a gatekeeper under the DMA, per Google. [[2026-11-03-android-dma-choice-screen#c1]]

**`apple`** (new, company)
- 2026-11-03 · Apple's EU choice screen is for the default browser; its search engine choice screen applies in Japan. [[2026-11-03-apple-default-apps-choice-screens#c2]] [[2026-11-03-apple-default-apps-choice-screens#c3]]
- 2024-03-25 · Commission opened a DMA non-compliance investigation into Apple's choice screen design, later closed after changes. [[2026-11-03-ec-dma-review-2026-choice-screens#c5]]

**`digital-markets-act`** (new, regulation) and **`european-commission`** (new, institution)
- 2026-04-28 · Commission's DMA review says Article 6(3) covers Apple's iOS, iPadOS and Safari, Alphabet's Android, Chrome and Google Search, and Microsoft's Windows. [[2026-11-03-ec-dma-review-2026-choice-screens#c2]]
- 2026-04-28 · Commission finds it premature to expand Article 6(3) and keeps monitoring choice screens. [[2026-11-03-ec-dma-review-2026-choice-screens#c7]]

## Sources (notes created 2026-11-03)

Browsers: `2026-11-03-chrome-default-search-engine-help`, `-edge-default-search-engine-help`, `-edge-mobile-faq-search-engine`, `-apple-iphone-default-search-engine-help`, `-apple-iphone-safari-search-help`, `-apple-default-apps-choice-screens`, `-apple-safari-mac-search-settings`, `-apple-eu-browser-choice-screen`, `-brave-default-search-engine-help`, `-brave-search-faq-default-mobile`, `-vivaldi-search-settings-desktop-help`, `-vivaldi-search-android-help`, `-vivaldi-search-ios-help`, `-firefox-140-custom-search-engines`.

Qwant and EUSP: `-qwant-install-on-computer-help`, `-qwant-chrome-manual-help`, `-qwant-firefox-manual-help`, `-qwant-safari-help`, `-qwant-iphone-app-help`, `-qwant-android-app-help`, `-qwant-chrome-extension-help`, `-qwant-ranking-index-sources`, `-qwant-privacy-policy`, `-qwant-ecosia-eusp-announcement`, `-techcrunch-staan-launch`.

Ecosia: `-ecosia-default-desktop-help`, `-ecosia-default-mobile-help`, `-ecosia-search-results-providers`, `-ecosia-privacy-policy`, `-ecosia-blog-eusp-index`, `-ecosia-how-it-makes-money`.

Startpage: `-startpage-chrome-default-help`, `-startpage-firefox-default-help`, `-startpage-safari-not-default-help`, `-startpage-chrome-android-default-help`, `-startpage-chrome-ios-default-help`, `-startpage-firefox-ios-default-help`, `-startpage-safari-ios-homescreen-help`, `-startpage-what-is-startpage`, `-system1-10k-2022-subsidiaries`, `-computing-startpage-system1-investment`.

DMA and regulation: `-android-dma-choice-screen`, `-android-dma-search-choice-eligibility`, `-chrome-dma-choice-screen`, `-ec-dma-citizens-qa`, `-ec-dma-review-2026-choice-screens`, `-ec-bing-edge-not-gatekeepers`, `-windows-dma-updates-2025`, `-gdpr-article-3-territorial-scope`.

DuckDuckGo: `-duckduckgo-privacy-policy`, `-duckduckgo-privacy-rights-gdpr-representative`, `-duckduckgo-results-sources`.

Also cited (written by another agent today): `2026-11-03-vivaldi-7-1-release-search-partners`.

Pages that could not be read: support.mozilla.org (bot challenge on every request, 2026-11-03); web.archive.org (rate-limited / blocked); google.com/chrome/choicescreen through Jina (blocked, read through WebFetch instead).

# Research brief: Chrome to Vivaldi

- Guide slug (proposed): `chrome-to-vivaldi`
- Source service: `services/chrome` · Target service: `services/vivaldi` · Category: `browsers`
- Researched: 2026-11-03. Every claim below cites a knowledge source note in `knowledge/sources/2026/11/` (`[[slug#cN]]`).
- No guide exists yet for `sourceService: chrome`. At HEAD, `content/services/chrome/en.md` and `content/services/microsoft-edge/en.md` both have `recommendedAlternative: brave`. The working tree already changes Chrome's to `vivaldi` and Vivaldi's `region` to `eu-friendly` (uncommitted edits made outside this research). The plan is to recommend Vivaldi, so this guide also has to carry the honest Vivaldi-vs-Chrome trade-offs (section 3, intro and missingFeatures).

## Headline findings

1. **On a computer, one dialog moves almost everything.** Vivaldi menu > File > Import from Applications or Files takes bookmarks, passwords, history, open tabs and extensions from Chrome [[2026-11-03-vivaldi-import-export-help#c1]] [[2026-11-03-vivaldi-import-export-help#c3]] [[2026-11-03-vivaldi-import-export-help#c4]] [[2026-11-03-vivaldi-import-export-help#c5]]. Two details no competitor mentions: Chrome must be closed first [[2026-11-03-vivaldi-password-management-help#c2]], and imported extensions arrive switched off until you toggle each one on [[2026-11-03-vivaldi-extensions-help#c4]]. For passwords there is a documented CSV fallback (export from Google Password Manager, import at `vivaldi://password-manager/settings`) [[2026-11-03-chrome-password-import-export-help#c1]] [[2026-11-03-vivaldi-import-export-help#c6]]. We need it: Vivaldi says password import is not possible from all browsers [[2026-11-03-vivaldi-password-management-help#c3]], and forum users report the direct Chrome password import failing [[2026-11-03-vivaldi-forum-chrome-password-import#c1]].
2. **Phones cannot import from Chrome directly.** Vivaldi says direct import from other browsers on iOS is not possible, and routes users through desktop plus Sync [[2026-11-03-vivaldi-ios-import-help#c3]] [[2026-11-03-vivaldi-ios-import-help#c4]]. On Android, Vivaldi imports a bookmarks HTML file [[2026-11-03-vivaldi-android-bookmarks-help#c1]], and its Android password page lists export but no import (see the note's summary). So the guide must be desktop first, then Vivaldi Sync to the phone [[2026-11-03-vivaldi-sync-help#c3]].
3. **Norway is in the EEA, not the EU. Say it plainly.** Vivaldi Technologies AS has its headquarters in Oslo [[2026-11-03-vivaldi-contact-page#c1]]. The EEA is the 27 EU states plus Iceland, Liechtenstein and Norway [[2026-11-03-eur-lex-eea-glossary#c1]]. The GDPR has applied in Norway since 20 July 2018, and Norway's data protection authority says Norway is bound by it the same way as EU states [[2026-11-03-datatilsynet-gdpr-norway#c2]] [[2026-11-03-datatilsynet-gdpr-norway#c3]]. Sync data sits in Iceland [[2026-11-03-vivaldi-sync-privacy-policy#c2]], also EEA and not EU [[2026-11-03-eur-lex-eea-glossary#c1]]. Our listing had `region: eu` at HEAD (the working tree now says `eu-friendly`), and the browsers category calls these "browsers built in Europe". The guide should say "Norway (in the EEA, not the EU)" and let the reader decide. This answers the Search Console cluster "vivaldi browser country of origin" (section 1).
4. **The business model needs to be on the page.** Vivaldi earns from search engine partner deals, bookmark partners, Direct Match and donations [[2026-11-03-vivaldi-about-company#c5]]. Its revenue partners are Startpage, Ecosia, DuckDuckGo and Qwant [[2026-11-03-vivaldi-7-1-release-search-partners#c2]]. A Vivaldi staff member said the default moved from Bing to Startpage in selected regions in December 2024 [[2026-11-03-vivaldi-forum-startpage-default#c1]], and the default list depends on language settings [[2026-11-03-vivaldi-third-party-search-engines#c1]]. No official page names the default engine for Dutch, German or other EU users: test it (section 5). The ad blocker lets partner search engines show ads even with ad blocking on for all sites [[2026-11-03-vivaldi-ad-attribution-help#c2]] [[2026-11-03-vivaldi-ad-attribution-help#c4]].
5. **Our Vivaldi listing has claims to fix (for the main agent, not this guide).** (a) It says search suggestions are on by default. Vivaldi's help says they are disabled by default [[2026-11-03-vivaldi-privacy-settings-help#c1]]. (b) It says Vivaldi "blocks ads and trackers by default". No official page we read states the default level for a new install [[2026-11-03-vivaldi-tracker-ad-blocking-help#c1]]: test it. (c) `region: eu` versus EEA (finding 3), already being changed to `eu-friendly` in the working tree. (d) "Employee-owned" is confirmed only as Vivaldi's own statement [[2026-11-03-vivaldi-for-a-better-web#c2]]: attribute it. (e) User numbers differ between Vivaldi's own pages: 4.0 million [[2026-11-03-vivaldi-about-company#c7]] and 4,500,000+ active users [[2026-11-03-vivaldi-download-page#c4]].

## 1. Target queries

**Search Console (last 3 months, `Queries.csv`).** No query mentions moving from Chrome to Vivaldi. The guide targets demand we don't rank for yet. What we do get is the origin question and the "European browser" cluster.

Vivaldi origin (positions 8 to 10, zero clicks):

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| vivaldi browser country of origin | 0 | 34 | 9.94 |
| vivaldi browser country | 0 | 19 | 8.74 |
| vivaldi browser origin country | 0 | 16 | 9.75 |
| vivaldi browser which country | 0 | 12 | 8.17 |
| where is vivaldi browser from | 0 | 12 | 9.83 |
| vivaldi browser | 0 | 14 | 23 |
| internet browser vivaldi | 0 | 7 | 34.57 |
| vivaldi technologies | 0 | 2 | 36 |
| vivaldi browser privacy | 0 | 1 | 12 |

Norwegian browser:

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| norwegian browser | 0 | 71 | 8.52 |
| norway browser | 0 | 4 | 9.25 |
| norwegian web browser | 0 | 3 | 8 |
| norwegischer browser | 0 | 3 | 58.33 |
| norwegian-born browser | 0 | 1 | 3 |

European / EU browser (mostly the category page's job):

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| european browser | 1 | 132 | 19.08 |
| eu browser | 0 | 82 | 11.84 |
| european browsers | 0 | 67 | 10.72 |
| european web browser | 2 | 25 | 14.6 |
| european web browsers | 2 | 19 | 12.79 |
| eu browsers | 1 | 17 | 6.82 |
| beste europese browser | 0 | 16 | 47.5 |
| europese browser | 0 | 14 | 20.64 |
| browser eu | 0 | 13 | 13.08 |
| browser european | 0 | 10 | 16.8 |
| europe browser | 0 | 10 | 24.3 |
| european internet browser | 0 | 9 | 10.44 |
| euro browser | 0 | 7 | 10.86 |
| eu web browser | 0 | 5 | 8.6 |
| eu browser alternative | 0 | 2 | 23.5 |
| switch web browser | 0 | 1 | 9 |
| niet amerikaanse browser | 0 | 1 | 75 |

Pages: `/en/services/eu/vivaldi` 455 impressions, 0 clicks, position 9.47. `/en/services/browsers` 815 impressions, 11 clicks, position 13.39. The origin cluster belongs to the Vivaldi service page and the EU cluster to the category page (see `docs/seo/audits/2026-11-03-top-pages.md`). The guide should answer both questions in one sentence each and link to those pages, not compete with them.

**Queries people type (seen in today's searches):** "how to switch from chrome to vivaldi", "import chrome passwords to vivaldi not working" (a Vivaldi forum thread title), "vivaldi browser country of origin", "european alternatives to google chrome".

Suggested primary keyword: "switch from Chrome to Vivaldi". Secondary: "import Chrome bookmarks and passwords into Vivaldi", "Chrome extensions in Vivaldi", "is Vivaldi European".

## 2. Competing guides

| # | Guide | Publisher, date | Length | H2 outline | Method and steps | Affiliate links | Outdated or wrong |
|---|---|---|---|---|---|---|---|
| 1 | [How to Switch from Chrome to Vivaldi](https://maketecheasier.com/switch-from-chrome-to-vivaldi/) | Make Tech Easier, 2020-11-22 (marked "from the archive") | ~600 words | Import Bookmarks into Vivaldi / Customizing Vivaldi / Customizing Vivaldi Settings / Change Search Engine / Conclusion | Download, import from the Bookmarks page, themes, change search engine to DuckDuckGo | None seen (display ads, Taboola) | Import path is now File > Import from Applications or Files [[2026-11-03-vivaldi-import-export-help#c1]]. Says the import brings "settings", which the official list does not include. No extensions, tabs, mobile, Sync or default browser. |
| 2 | [Chrome, Vivaldi, and the challenge of changing browsers](https://www.computerworld.com/article/4143858/chrome-vivaldi-changing-browsers.html) | Computerworld (JR Raphael), 2026-03-11 | ~1,100 words | My Chrome to Vivaldi adapting adventure | Opinion. No data steps. Settings to make Vivaldi feel like Chrome [[2026-11-03-computerworld-chrome-to-vivaldi#c3]] | None seen (newsletter promos) | Says the vertical tab bar is on by default. No official source confirms this: test. |
| 3 | [I got sick of Chrome's BS and switched to Vivaldi](https://www.pcworld.com/article/2384494/i-finally-got-sick-of-chromes-bs-and-switched-to-vivaldi.html) | PCWorld, 2024-07-09 | ~1,300 words | Two potential deal-breakers / Everything and the kitchen sink / An ideal mix of power and versatility | Opinion. Extensions and "Open as window" web apps as deal-breakers | Yes. Disclosed; links, including the Vivaldi download, go through Skimlinks | No import steps. Two years old. |
| 4 | [Trying and Migrating to Vivaldi Browser](https://deepakness.com/blog/vivaldi-browser/) | DeepakNess blog, 2026-01-30 (updated 2026-02-03) | 1,369 words | First impression / Customizing as per my needs / Things I loved / Not so cool things | Personal migration on macOS and Android, import during onboarding, setting tweaks | None seen | Says other Chrome profiles could not be imported [[2026-11-03-deepakness-vivaldi-migration-blog#c1]] (one user, test it). Reports installing a Manifest V2 extension in January 2026 [[2026-11-03-deepakness-vivaldi-migration-blog#c5]] (status today unknown). |
| 5 | [Vivaldi Review: Should Chrome Power Users Switch in 2026?](https://www.superchargebrowser.com/library/vivaldi-review-chrome-power-users-2026/) | Supercharge Browser, 2026-06-17 | ~2,000 words | The Verdict in One Table / Who Should Switch / What Vivaldi Does Better Than Chrome / Where Vivaldi Frustrates People / How Vivaldi Stacks Against Chrome / A Note From Testing / If You Want the Features Without the Switch / The One Question That Decides It / FAQ | Review, no migration steps | Conflict of interest: sells its own Chrome extension and ends by telling readers to stay on Chrome | RAM figures cite unnamed "independent" benchmarks. No import, mobile or privacy detail. |

Directories that rank for the origin and "European browser" queries (not guides): [PickEurope](https://pickeurope.com/european/browsers/) correctly labels Norway "EFTA" but says Vivaldi has "No telemetry", which Vivaldi's own privacy policy contradicts: a daily message with a unique ID, version, CPU architecture and screen resolution [[2026-11-03-vivaldi-browser-privacy-policy#c1]]. [European Alternatives](https://european-alternatives.eu/product/vivaldi-browser) has one sentence ("a web browser from Norway"). [EuroShift](https://www.euroshift.nl/services/vivaldi-browser) calls it a European alternative without the EEA distinction. Vivaldi's own [2020 switching post](https://vivaldi.com/blog/google-chrome-to-vivaldi-browser-switch/) is outdated: it moves open tabs with a third-party extension, while the importer now does this for Chromium browsers [[2026-11-03-vivaldi-import-export-help#c4]].

**What they all cover (the minimum we need):** Vivaldi is built on Chromium, so Chrome Web Store extensions work [[2026-11-03-vivaldi-extensions-help#c1]]. There is a built-in importer. Vivaldi has a learning curve because of its many options. It is Norwegian.

**What they miss or get wrong (where we win):**
- A complete data checklist with the current menu path: bookmarks, passwords, history, open tabs, extensions. Nobody says Chrome must be closed or that extensions arrive switched off.
- The password CSV fallback, and deleting the CSV afterwards [[2026-11-03-chrome-password-import-export-help#c6]] [[2026-11-03-vivaldi-import-export-help#c7]].
- Cleaning up Google afterwards: delete Google Password Manager data [[2026-11-03-chrome-manage-passwords-help#c4]] and Chrome sync data at chrome.google.com/data [[2026-11-03-chrome-sign-in-help#c5]]. Nobody covers this.
- Phones: no competitor says that iPhone users can't import from Chrome directly [[2026-11-03-vivaldi-ios-import-help#c3]], or how Sync bridges the gap.
- Vivaldi keeps history for three months by default [[2026-11-03-vivaldi-privacy-settings-help#c6]]. Someone importing years of Chrome history should know (test what happens to older entries).
- Sync's encryption password: Vivaldi can't recover it, so data is lost without a saved backup key [[2026-11-03-vivaldi-sync-help#c5]].
- EEA versus EU, GDPR in Norway, Iceland storage.
- The business model and what Vivaldi still sends home: the daily ping [[2026-11-03-vivaldi-browser-privacy-policy#c1]], Google Safe Browsing [[2026-11-03-vivaldi-browser-privacy-policy#c5]], partner bookmarks [[2026-11-03-vivaldi-browser-privacy-policy#c3]], search partner deals.
- Default browser steps for Windows, macOS, Android and iOS in one place.
- Gmail and Google Docs users: logging in to Google accounts needs the bundled Google Services Token extension to stay on [[2026-11-03-vivaldi-privacy-settings-help#c5]].

## 3. Proposed outline

**Frontmatter**
- `title`: Switching from Chrome to Vivaldi
- `description` (158 chars): "Move bookmarks, passwords, open tabs and extensions from Chrome to Vivaldi, a free browser from Norway. About 30 to 45 minutes on a computer, plus your phone."
- `metaTitle` (57): "Switch from Chrome to Vivaldi: Bookmarks, Passwords, Tabs"
- `metaDescription` (151): "Move bookmarks, passwords, tabs and extensions from Chrome to Vivaldi, a free browser made in Oslo, Norway (EEA, not EU). Steps for computer and phone."
- `difficulty`: `beginner`. The desktop import is one dialog and needs no account. The CSV fallback and Sync setup are the only fiddly parts, and both are optional for a single-computer user.
- `timeRequired`: "30 to 45 minutes". Reason: install about 5 minutes, import about 5 minutes (longer with a large history, to confirm), switching extensions back on 5 minutes, CSV fallback if needed 5 minutes, Vivaldi account plus Sync plus phone install about 10 minutes, default browser on two devices 5 minutes, Google clean-up 5 minutes. Getting used to the interface takes longer, and the guide should say so.

**intro** (100-150 words)
- What Vivaldi is: a free browser made by Vivaldi Technologies, headquartered in Oslo, Norway [[2026-11-03-vivaldi-contact-page#c1]]. Norway is in the EEA but not the EU [[2026-11-03-eur-lex-eea-glossary#c1]], and the GDPR applies there the same way [[2026-11-03-datatilsynet-gdpr-norway#c3]]. Vivaldi says it is employee-owned with no outside investors [[2026-11-03-vivaldi-for-a-better-web#c2]] [[2026-11-03-vivaldi-for-a-better-web#c3]] (attribute).
- Why people switch, from Google's own help: a signed-in Chrome signs you in to Google services automatically, and with Web & App Activity on, synced Chrome history personalises other Google products [[2026-11-03-chrome-sign-in-help#c2]] [[2026-11-03-chrome-sign-in-help#c3]]. Vivaldi Sync encrypts data with a password Vivaldi says it never receives [[2026-11-03-vivaldi-sync-help#c2]], stored on its servers in Iceland [[2026-11-03-vivaldi-sync-help#c4]].
- What stays the same: same Chromium base, so Chrome extensions work [[2026-11-03-vivaldi-extensions-help#c1]].
- The honest line: Vivaldi has far more settings than Chrome, and is free because of search and bookmark partner deals [[2026-11-03-vivaldi-about-company#c5]].

**beforeYouStart** (50-100 words). What people wish they'd known:
- Do the move on a computer first. Phones can't import from Chrome directly [[2026-11-03-vivaldi-ios-import-help#c3]].
- Close Chrome before you import [[2026-11-03-vivaldi-password-management-help#c2]].
- Vivaldi keeps three months of history by default. To keep older Chrome history, change Settings > Privacy and Security > Browsing History first [[2026-11-03-vivaldi-privacy-settings-help#c6]] (confirm the effect in a test).
- To use Vivaldi on your phone too, you'll need a free Vivaldi account and a separate encryption password of at least 12 characters [[2026-11-03-vivaldi-sync-help#c1]] [[2026-11-03-vivaldi-sync-help#c2]].
- Several Chrome profiles: import one at a time (to test, see section 5).

**steps** (8 steps)

1. **Install Vivaldi on your computer.** Download from vivaldi.com for Windows, macOS or Linux [[2026-11-03-vivaldi-download-page#c1]]. The first-run setup offers an import (one user report [[2026-11-03-deepakness-vivaldi-migration-blog#c1]]; check the current onboarding screens and take screenshots).
2. **Close Chrome and import your data.** Vivaldi menu > File > Import from Applications or Files > choose Chrome > tick bookmarks, passwords, history, open tabs and extensions > Start Import [[2026-11-03-vivaldi-import-export-help#c1]] [[2026-11-03-vivaldi-import-export-help#c3]] [[2026-11-03-vivaldi-import-export-help#c4]] [[2026-11-03-vivaldi-import-export-help#c5]] [[2026-11-03-vivaldi-password-management-help#c2]]. Confirm the exact checkbox labels on a test machine.
3. **Switch your extensions back on.** After the import, the Extensions page opens: toggle on each extension you want [[2026-11-03-vivaldi-extensions-help#c4]]. New extensions install from the Chrome Web Store with Add to Vivaldi. If that button is missing, enable Web Store under Settings > Privacy and Security > Google Extensions [[2026-11-03-vivaldi-extensions-help#c3]]. Suggest skipping an ad-blocker extension and trying the built-in one first [[2026-11-03-vivaldi-tracker-ad-blocking-help#c5]].
4. **Check your passwords, and use the CSV route if any are missing.** In Chrome: More > Passwords and autofill > Google Password Manager > Settings > Export passwords > Download file [[2026-11-03-chrome-password-import-export-help#c1]]. In Vivaldi: go to `vivaldi://password-manager/settings` > Import passwords > Select file [[2026-11-03-vivaldi-import-export-help#c6]]. Then delete the CSV file, because anyone with access can read it [[2026-11-03-chrome-password-import-export-help#c6]]. Why this matters: a signed-in Chrome may keep passwords in your Google Account rather than on the computer [[2026-11-03-chrome-manage-passwords-help#c1]], and Google Password Manager exports both (test whether the direct import catches account-stored passwords, section 5).
5. **Choose your blocking level and search engine.** Settings > Privacy and Security > Tracker and Ad Blocking: No Blocking, Block Trackers, or Block Trackers and Ads [[2026-11-03-vivaldi-tracker-ad-blocking-help#c1]]. Vivaldi itself suggests trackers everywhere and ads only where they bother you [[2026-11-03-vivaldi-tracker-ad-blocking-help#c3]]. The cookie-banner lists are under Manage Sources [[2026-11-03-vivaldi-tracker-ad-blocking-help#c6]]. Then Settings > Search to pick the default engine. Say plainly that Startpage, Ecosia, DuckDuckGo and Qwant earn Vivaldi money [[2026-11-03-vivaldi-7-1-release-search-partners#c2]] and that you can choose any engine. Link [[services/startpage]], [[services/ecosia]], [[services/qwant]], [[services/duckduckgo]].
6. **Make Vivaldi your default browser.** Windows: Settings > General > Startup > Default Browser > Set as Default, then pick Vivaldi under Web Browser [[2026-11-03-vivaldi-default-browser-desktop-help#c1]]. macOS: same path, then Use "Vivaldi" [[2026-11-03-vivaldi-default-browser-desktop-help#c2]]. Android: Vivaldi menu > Set as default browser > Browser app > Vivaldi Browser, or Android Settings > Apps > Default Apps [[2026-11-03-vivaldi-default-browser-android-help#c1]] [[2026-11-03-vivaldi-default-browser-android-help#c3]]. iPhone: Vivaldi menu > Settings > Default browser > Open Vivaldi Settings > Default Browser App > Vivaldi [[2026-11-03-vivaldi-default-browser-ios-help#c1]] [[2026-11-03-vivaldi-default-browser-ios-help#c2]].
7. **Bring Vivaldi to your phone with Sync.** On the computer: Settings > Sync, log in or create a Vivaldi account, set the encryption password, save the backup encryption key, pick what to sync [[2026-11-03-vivaldi-sync-help#c1]] [[2026-11-03-vivaldi-sync-help#c2]] [[2026-11-03-vivaldi-sync-help#c3]] [[2026-11-03-vivaldi-sync-help#c5]]. Install Vivaldi from Google Play or the App Store [[2026-11-03-vivaldi-download-page#c2]] and log in to Sync there [[2026-11-03-vivaldi-ios-import-help#c1]]. Android-only alternative without an account: import a bookmarks HTML file via Bookmarks Panel > 3-dot menu > Import Bookmarks; they land in a folder called "Imported" [[2026-11-03-vivaldi-android-bookmarks-help#c1]] [[2026-11-03-vivaldi-android-bookmarks-help#c2]]. Chrome exports that file from Bookmark Manager > Export Bookmarks [[2026-11-03-chrome-bookmarks-import-export-help#c1]].
8. **Remove your data from Google (optional, last).** Only after checking Vivaldi has everything. Optionally download an archive first: Chrome's Google data export covers bookmarks, history, extensions and settings but not passwords [[2026-11-03-chrome-export-data-help#c2]] [[2026-11-03-chrome-export-data-help#c3]]. Then delete Google Password Manager data (passwords and passkeys) via Google Password Manager > Settings > Delete all Google Password Manager data [[2026-11-03-chrome-manage-passwords-help#c4]], delete synced Chrome data at chrome.google.com/data [[2026-11-03-chrome-sign-in-help#c5]], and sign out of Chrome [[2026-11-03-chrome-sign-in-help#c6]]. Warn that passwords in a Google Account are also used on other devices and in some apps [[2026-11-03-chrome-manage-passwords-help#c1]], so a phone that fills passwords from Google loses them too.

**troubleshooting** (Q&A, 100-200 words)
- *My passwords didn't come over.* Use the CSV route in step 4 [[2026-11-03-vivaldi-import-export-help#c6]]. Vivaldi says password import doesn't work from every browser [[2026-11-03-vivaldi-password-management-help#c3]]. Forum users report the same problem with Chrome [[2026-11-03-vivaldi-forum-chrome-password-import#c1]] [[2026-11-03-vivaldi-forum-chrome-password-import#c2]] (attribute as user reports).
- *No "Add to Vivaldi" button in the Chrome Web Store.* Enable Web Store under Settings > Privacy and Security > Google Extensions [[2026-11-03-vivaldi-extensions-help#c3]].
- *An extension works differently.* Vivaldi says some Chrome extensions behave differently [[2026-11-03-vivaldi-extensions-help#c2]]. Extensions still on Manifest V2 are being phased out by Chromium [[2026-11-03-vivaldi-manifest-v3-update-blog#c1]].
- *I can't log in to Gmail or Google Docs.* Check that Google Services Token is on under Settings > Privacy and Security > Google Extensions [[2026-11-03-vivaldi-privacy-settings-help#c5]].
- *A site looks broken.* Lower the blocking level for that site with the shield in the address field [[2026-11-03-vivaldi-tracker-ad-blocking-help#c4]].
- *I forgot my Sync encryption password.* Without a saved backup key, resetting deletes the server copy and re-uploads from a device that still has the data [[2026-11-03-vivaldi-sync-help#c5]].
- *My search engine changed to Startpage.* Vivaldi changed regional defaults for users who never picked an engine [[2026-11-03-vivaldi-forum-startpage-default#c1]] [[2026-11-03-vivaldi-forum-startpage-default#c3]]. Pick yours in Settings > Search.
- *Vivaldi asks to be default every time it starts.* Untick Check on Startup [[2026-11-03-vivaldi-default-browser-desktop-help#c4]].

**outro** (50-100 words)
- Keep Chrome installed for a week in case something is missing.
- Sync is not a backup [[2026-11-03-vivaldi-sync-help#c6]]. Export bookmarks now and then [[2026-11-03-vivaldi-import-export-help#c7]].
- Send tabs between computer and phone with Send to Your Devices [[2026-11-03-vivaldi-sync-help#c9]].
- If the interface feels like a lot: one Computerworld columnist made it feel closer to Chrome with three tab settings and tried one new feature at a time [[2026-11-03-computerworld-chrome-to-vivaldi#c3]] [[2026-11-03-computerworld-chrome-to-vivaldi#c4]] (attribute).
- Link the Vivaldi service page (origin, telemetry, open-source detail) and the browsers category page.

### Honest trade-offs: Vivaldi against Chrome (for the intro, beforeYouStart and the Chrome/Edge `recommendedAlternative` decision)

What a Chrome user gets:
- Sync encrypted with a password Vivaldi says it never sees [[2026-11-03-vivaldi-sync-help#c2]], on servers in Iceland [[2026-11-03-vivaldi-sync-privacy-policy#c2]].
- Built-in tracker and ad blocker [[2026-11-03-vivaldi-tracker-ad-blocking-help#c1]], search suggestions off by default [[2026-11-03-vivaldi-privacy-settings-help#c1]].
- Built-in mail, calendar, feed reader, notes, tab tiling and workspaces, per Vivaldi's own comparison [[2026-11-03-vivaldi-compare-chrome-page#c6]].
- Same extensions [[2026-11-03-vivaldi-extensions-help#c1]].
- A company under the GDPR in Norway [[2026-11-03-datatilsynet-gdpr-norway#c2]].

What a Chrome user gives up or should know:
- No Google account integration in the browser. Sync runs on a Vivaldi account [[2026-11-03-vivaldi-sync-help#c1]], so Chrome on other devices and Google's password filling stop seeing new bookmarks and passwords.
- No built-in AI. Vivaldi confirms no chatbots or summarising tools, and contrasts this with Gemini in Chrome [[2026-11-03-vivaldi-compare-chrome-page#c2]] [[2026-11-03-vivaldi-compare-chrome-page#c3]]. Some will call that a gain.
- Safe Browsing runs in standard mode only. Chrome's enhanced mode is not enabled [[2026-11-03-vivaldi-privacy-settings-help#c3]].
- Google is still in the browser: Safe Browsing gets your IP address [[2026-11-03-vivaldi-privacy-settings-help#c4]], Google DNS fallback is on by default [[2026-11-03-vivaldi-privacy-settings-help#c8]], and Google's autofill feature is on by default (Vivaldi says it sends no personal data to Google) [[2026-11-03-vivaldi-browser-privacy-policy#c7]]. Safe Browsing and the DNS fallback can be switched off on desktop [[2026-11-03-vivaldi-browser-privacy-policy#c5]] [[2026-11-03-vivaldi-privacy-settings-help#c8]].
- Vivaldi sends a daily ping with a unique ID [[2026-11-03-vivaldi-browser-privacy-policy#c1]] and earns from partner search engines, whose ads stay visible even with ad blocking on [[2026-11-03-vivaldi-ad-attribution-help#c2]].
- Phones need the desktop detour [[2026-11-03-vivaldi-ios-import-help#c3]].
- More settings, a steeper start. This is the main complaint in reviews (Computerworld, Supercharge, PCWorld), opinion only.
- Against Brave (the current recommendation): our Brave listing puts Brave Software in San Francisco (not re-checked today), while Vivaldi is headquartered in Oslo. Don't frame it as "GDPR versus no GDPR": the GDPR's reach over non-EU companies that serve EU users is a separate question we have no source note for yet. Frame it as where the company is based. Blocking strength, open source and performance need their own research before we compare them in public.

## 4. missingFeatures

Only absences an official source confirms:
- "No built-in AI assistant: Vivaldi has no chatbot or AI summaries, unlike Gemini in Chrome" [[2026-11-03-vivaldi-compare-chrome-page#c2]] [[2026-11-03-vivaldi-compare-chrome-page#c3]] [[2026-11-03-vivaldi-about-company#c6]].
- "No Google account sync: Vivaldi syncs through its own Vivaldi account, not your Google account" [[2026-11-03-vivaldi-sync-help#c1]].
- "No direct import from Chrome on iPhone and iPad: import on a computer and use Vivaldi Sync" [[2026-11-03-vivaldi-ios-import-help#c3]] [[2026-11-03-vivaldi-ios-import-help#c4]].
- "No enhanced Safe Browsing: Vivaldi uses Google's standard mode only" [[2026-11-03-vivaldi-privacy-settings-help#c3]].

**Not listed, check before claiming:**
- Importing a password CSV on Android. The Android help lists export but not import [[2026-11-03-vivaldi-android-passwords-help#c2]].
- Passkeys. None of the Vivaldi pages read mention importing passkeys from Google Password Manager.
- Importing a second Chrome profile (one blog user says it failed [[2026-11-03-deepakness-vivaldi-migration-blog#c1]]).
- Autofill addresses and payment cards. The Chrome import list on Vivaldi's page names bookmarks, passwords, history, tabs and extensions only.
- Manifest V2 extensions such as uBlock Origin in Vivaldi 8.2. Vivaldi planned to drop support around June 2025 [[2026-11-03-vivaldi-manifest-v3-update-blog#c2]]; a January 2026 blog says one still installed [[2026-11-03-deepakness-vivaldi-migration-blog#c5]].
- Casting to Chromecast and Google Lens: not checked against any Vivaldi page.

## 5. Open questions (test by hand before publishing)

1. On a fresh Vivaldi 8.2 install on Windows and macOS: which data types does the Chrome import dialog list, with exact labels? Does the first-run setup offer the import?
2. With a signed-in Chrome that saves passwords to the Google Account: does the direct import bring them over, or only device-stored passwords? Does it need Chrome closed, and on macOS a Keychain prompt?
3. Can the importer pick a non-default Chrome profile?
4. Does history older than three months survive the import with the default retention setting?
5. Default blocking level on a fresh install, desktop and mobile. Is it set in the onboarding? (Our listing claims "blocks ads and trackers by default".)
6. Default search engine on a fresh install with Dutch, German and English (EU) language settings and IP addresses. Does Vivaldi show prompts to switch back to a partner engine (one user report [[2026-11-03-vivaldi-forum-startpage-default#c4]])?
7. Can a user untick the "Allow Ads from our Partners" list under Manage Sources, and what happens on partner search pages?
8. Does uBlock Origin (Manifest V2) install and run in Vivaldi 8.2 today?
9. Vivaldi on Android: is there a password CSV import anywhere (Settings, Password Manager)? Same question for iOS.
10. Passkeys saved in Google Password Manager: can they move to Vivaldi at all, or should the guide tell people to keep them in a separate password manager?
11. Default tab bar position on a fresh desktop install (Computerworld says vertical; check).
12. After step 8, does Android still autofill passwords in other apps? The guide should tell people what to set instead.
13. Screenshots for each step, desktop and both mobile platforms.

## 6. Proposed entity facts

Company slug: `vivaldi-technologies` (`resolve "Vivaldi Technologies AS"` returns 0.9 alias). No knowledge file exists yet; the slug comes from `parentCompany`.

- 2026-11-03 · Lists its headquarters at Mølleparken 6, 0459 Oslo, Norway, with offices in Seltjarnarnes, Iceland, and Gloucester, Massachusetts. [[2026-11-03-vivaldi-contact-page#c1]] [[2026-11-03-vivaldi-contact-page#c2]] [[2026-11-03-vivaldi-contact-page#c3]]
- 2026-11-03 · Says it is employee-owned and has no external investors. [[2026-11-03-vivaldi-for-a-better-web#c2]] [[2026-11-03-vivaldi-for-a-better-web#c3]] [[2026-11-03-vivaldi-compare-chrome-page#c1]]
- 2026-11-03 · Lists its revenue as partner deals with search engines, bookmark partners and Direct Match, plus donations. [[2026-11-03-vivaldi-about-company#c5]]
- 2026-11-03 · Claims more than 4.5 million active users on its download page and 4.0 million users on its company page. [[2026-11-03-vivaldi-download-page#c4]] [[2026-11-03-vivaldi-about-company#c7]]
- 2026-10-01 · Says its browser has no generative AI features, no chatbots and no summarising tools. [[2026-11-03-vivaldi-compare-chrome-page#c2]]
- 2025-01-23 · Named Startpage, Ecosia, DuckDuckGo and Qwant as its revenue-generating partner search engines with Vivaldi 7.1. [[2026-11-03-vivaldi-7-1-release-search-partners#c2]]
- 2024-12-13 · A Vivaldi staff member said the default search engine in selected regions changed from Bing to Startpage after the Bing deal ended. [[2026-11-03-vivaldi-forum-startpage-default#c1]]
- 2024-12-05 · Published its ad attribution rules, which let partner search engines show ads and credit clicks even with ad blocking on. [[2026-11-03-vivaldi-ad-attribution-help#c1]] [[2026-11-03-vivaldi-ad-attribution-help#c2]]
- 2018-07-13 · Sync privacy policy: encrypted sync data is stored at Hringdu data centres in Iceland and kept up to a year after last use. [[2026-11-03-vivaldi-sync-privacy-policy#c2]] [[2026-11-03-vivaldi-sync-privacy-policy#c5]]

Place/regulation facts (no entity exists; `resolve "Norway"` and `resolve "GDPR"` return no match). If the main agent creates `norway` (place) or `gdpr` (regulation):
- 2018-07-20 · The GDPR became applicable in Norway through the EEA Agreement. [[2026-11-03-datatilsynet-gdpr-norway#c2]]
- 1994-01-01 · The EEA Agreement, which includes Norway, Iceland and Liechtenstein with the EU states, entered into force. [[2026-11-03-eur-lex-eea-glossary#c1]] [[2026-11-03-eur-lex-eea-glossary#c3]]

Google side (slug `google`, owner `alphabet`), only if useful:
- 2026-11-03 · Chrome's help lists AI Mode side-by-side browsing as a feature for signed-in users. [[2026-11-03-chrome-sign-in-help#c4]]

**Listing flags for the main agent** (not knowledge facts): `content/services/vivaldi/en.md` says search suggestions are on by default (contradicted by [[2026-11-03-vivaldi-privacy-settings-help#c1]]), says ads and trackers are blocked by default (unconfirmed), and had `region: eu` at HEAD although Norway is EEA [[2026-11-03-eur-lex-eea-glossary#c1]] (the working tree now says `eu-friendly`). `employeeCount: '60'` was not checked today. Its `sourceUrls` have no `checkedAt`.

## Sources (notes created 2026-11-03)

Vivaldi, official: `2026-11-03-vivaldi-import-export-help`, `2026-11-03-vivaldi-password-management-help`, `2026-11-03-vivaldi-sync-help`, `2026-11-03-vivaldi-sync-privacy-policy`, `2026-11-03-vivaldi-browser-privacy-policy`, `2026-11-03-vivaldi-extensions-help`, `2026-11-03-vivaldi-privacy-settings-help`, `2026-11-03-vivaldi-tracker-ad-blocking-help`, `2026-11-03-vivaldi-ad-attribution-help`, `2026-11-03-vivaldi-default-browser-desktop-help`, `2026-11-03-vivaldi-default-browser-android-help`, `2026-11-03-vivaldi-default-browser-ios-help`, `2026-11-03-vivaldi-ios-import-help`, `2026-11-03-vivaldi-android-bookmarks-help`, `2026-11-03-vivaldi-android-passwords-help`, `2026-11-03-vivaldi-7-1-release-search-partners`, `2026-11-03-vivaldi-third-party-search-engines`, `2026-11-03-vivaldi-about-company`, `2026-11-03-vivaldi-contact-page`, `2026-11-03-vivaldi-download-page`, `2026-11-03-vivaldi-manifest-v3-update-blog`, `2026-11-03-vivaldi-compare-chrome-page` (medium), `2026-11-03-vivaldi-for-a-better-web` (medium), `2026-11-03-vivaldi-forum-startpage-default` (medium, staff statement).

Google, official: `2026-11-03-chrome-password-import-export-help`, `2026-11-03-chrome-manage-passwords-help`, `2026-11-03-chrome-bookmarks-import-export-help`, `2026-11-03-chrome-sign-in-help`, `2026-11-03-chrome-export-data-help`.

EU/EEA: `2026-11-03-eur-lex-eea-glossary`, `2026-11-03-datatilsynet-gdpr-norway`.

Competing or community: `2026-11-03-computerworld-chrome-to-vivaldi` (medium), `2026-11-03-deepakness-vivaldi-migration-blog` (low), `2026-11-03-vivaldi-forum-chrome-password-import` (low).

Blocked or not used: efta.int (bot check, twice). Vivaldi's 2019 business model post and 2020 switching post were read but superseded by newer pages.

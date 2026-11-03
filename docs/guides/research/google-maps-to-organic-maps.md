# Research brief: Google Maps to Organic Maps

- Guide slug (proposed): `google-maps-to-organic-maps`
- Source service: `services/google-maps` · Target service: `services/organic-maps` · Category: `navigation`
- Researched: 2026-11-03. All claims below cite knowledge source notes in `knowledge/sources/2026/11/`.
- No guide exists yet for `sourceService: google-maps`.

## Headline findings

1. **Starred places now import directly.** Organic Maps has imported GeoJSON since October 2025 and names Google Takeout's `Saved Places.json` as supported since release 2025.11.25 [[2026-11-03-organic-maps-november-2025-release#c1]] [[2026-11-03-organic-maps-october-2025-release#c2]]. The maintainer's own steps: Takeout > "Maps (your places)" > open `Saved Places.json` with Organic Maps [[2026-11-03-organic-maps-github-google-takeout-import#c1]] [[2026-11-03-organic-maps-github-google-takeout-import#c2]]. No converter needed for this part. Every competing guide we read misses this.
2. **Custom lists are the hard part.** Lists ("Want to go", "Favourites", your own) come out of Takeout's "Saved" product as CSV with title, note, URL, tags and comment, and Google's schema names no coordinate or address field [[2026-11-03-google-takeout-saved-schema#c1]] [[2026-11-03-google-takeout-saved-schema#c2]] [[2026-11-03-google-takeout-saved-schema#c3]]. Organic Maps does not list CSV as an import format [[2026-11-03-organic-maps-import-faq#c1]]. The only conversion route an official source documents is Google My Maps: it imports CSV using a place-name column and exports KML [[2026-11-03-google-my-maps-import-help#c1]] [[2026-11-03-google-my-maps-import-help#c3]] [[2026-11-03-google-my-maps-export-help#c1]]. This needs a hands-on test (see Open questions).
3. **Our listing is out of date.** Organic Maps added public transport routing (subway, light rail, bus, tram) in June 2026 [[2026-11-03-organic-maps-june-2026-release#c1]]. The service page's "no public transit routing" is now wrong. Installs: about 6M at the end of 2025 [[2026-11-03-organic-maps-2025-year-in-review#c1]], 12M+ in October/November 2026 [[2026-11-03-organic-maps-homepage#c1]] [[2026-11-03-organic-maps-12m-installs#c1]]. Both figures are the project's own and both were right at their date. Ownership also changed (see Proposed entity facts).

## 1. Target queries

**Search Console (last 3 months, `Queries.csv`).** Almost nothing for this topic:

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| european tech map alternatives | 0 | 1 | 1 |
| europäische alternative zu google | 0 | 1 | 1 |

No query mentions Google Maps, Organic Maps, Takeout, KML or saved places. This guide targets demand we don't rank for yet. No volume data is available to us.

**Queries people type (from the searches run today, phrasing as seen in results and forum titles):**
- "import google maps saved places into organic maps" (the GitHub discussion with this title is from 2021 and still gets replies in 2026)
- "export google maps saved places" / "export google maps lists"
- "switch from google maps to organic maps", "google maps alternative privacy"
- "organic maps vs comaps"
- "google takeout saved places json" / "saved places.json kml"

Suggested primary keyword: "google maps to organic maps". Secondary: "export google maps saved places", "import saved places organic maps", "google takeout saved places".

## 2. Competing guides

| # | Guide | Publisher, date | Length | H2 outline | Method | Affiliate links | Outdated or wrong |
|---|---|---|---|---|---|---|---|
| 1 | [Organic Maps: The Open-Source Offline Map You Need to Ditch Google Maps](https://itsfoss.com/organic-maps/) | It's FOSS, 2024-09-13 | ~400 words | Successor to Maps.me / Install Organic Maps | App review, no migration | None seen (membership upsell) | No import steps. Written before GeoJSON import and public transport. |
| 2 | [Organic Maps vs CoMaps: The fork for your privacy](https://korben.info/en/organic-maps-vs-comaps-fork-privacy.html) | Korben, 2025-12-31, update 2026-01-04 | ~900 words | No H2s: update box, then original review | Review, then recommends CoMaps | None seen | Relays open-letter allegations (donations used for holidays, a proprietary component in store builds), hedged with "allegedly" and "reportedly", and recommends switching to CoMaps on that basis. LWN says some of these allegations came without sources [[2026-11-03-lwn-comaps-organic-maps-fork#c5]]. No import steps. |
| 3 | [Ich will weg von Google: 3 alternative Karten-Apps für Google Maps](https://www.gamestar.de/artikel/de-google-maps-alternativen-fussgaenger-navigation,3446947.html) (German) | GameStar, 2026-01-30 | ~1,100 words | 1. Organic Maps / 2. Magic Earth / 3. HERE WeGo / Fazit | Alternatives roundup | None seen | No import. Written before public transport routing (June 2026). Says opening hours show only "sporadically" (one author's area). |
| 4 | [How to Download or Extract Your Google Maps Data](https://www.techbloat.com/how-to-download-or-extract-your-google-maps-data.html) | TechBloat, 2026-10-18 | ~3,000 words of text plus product boxes | Choose the export / Takeout for saved places and lists / Timeline export (computer, Android, iPhone, backups) / Maps and Search history / Store files safely / Why an export may be incomplete / Troubleshoot / Checklist | Export only, no destination app | Yes, Amazon affiliate boxes between sections | Only tells readers to tick "Saved". Misses "Maps (your places)", which is where starred places live as GeoJSON with coordinates [[2026-11-03-google-takeout-maps-your-places-schema#c1]] [[2026-11-03-google-takeout-maps-your-places-schema#c2]]. Otherwise accurate on Timeline. |
| 5 | [Import from Google Maps Saved Places (Discussion #928)](https://github.com/orgs/organicmaps/discussions/928) | Organic Maps GitHub, 2021-07-25 to 2026-03 | ~2,000 words, thread | Q&A thread | Takeout GeoJSON, open in app (maintainer answer, Oct 2025) | One user pitched a paid converter in replies | The 2021 opening post says Organic Maps imports only KML. Outdated: GeoJSON since Oct 2025 [[2026-11-03-organic-maps-october-2025-release#c2]], all five formats now [[2026-11-03-organic-maps-import-faq#c1]]. |

Also read but not usable: MileageWise "How to Export Google Maps Saved Places" (404 today), PopSci "Google Maps to Apple Maps" (Jina blocked, 403), AlternativeTo news on the fork (CAPTCHA).

**What they all cover (the minimum we need):** Organic Maps works offline on OpenStreetMap data, has no ads or tracking, installs from the App Store, Google Play and F-Droid. No live traffic. Search and business details are weaker than Google's. Export goes through Google Takeout.

**What they miss or get wrong (where we win):**
- Nobody combines export and import in one walkthrough. Each source does half.
- Nobody mentions that `Saved Places.json` imports directly since late 2025.
- Nobody explains that starred places and custom lists are two different exports with different formats (GeoJSON with coordinates vs CSV without). This is the single biggest source of confusion in the GitHub thread [[2026-11-03-organic-maps-github-google-takeout-import#c4]] [[2026-11-03-organic-maps-github-google-takeout-import#c5]].
- Nobody gives a documented route for lists. Competitors and forum users point to unofficial scripts and paid extensions. We can document the Google My Maps route from Google's own help pages.
- Nobody warns about places landing at 0,0 in the ocean off Africa [[2026-11-03-organic-maps-github-google-takeout-import#c3]], which Google's schema explains: unknown positions export as 0,0 [[2026-11-03-google-takeout-maps-your-places-schema#c3]].
- Nobody mentions that EU iPhone users can make Organic Maps the default navigation app [[2026-11-03-organic-maps-october-2025-release#c1]].
- Nobody mentions public transport routing (added June 2026). Our own service page still says it is missing.
- Only TechBloat covers Timeline. Nobody says what happens to Timeline in a switch to Organic Maps.

## 3. Proposed outline

**Frontmatter**
- `title`: Switching from Google Maps to Organic Maps
- `difficulty`: `intermediate`. Starred places alone are beginner level. Lists need a computer, a Takeout ZIP and a My Maps conversion, and most Google Maps users keep lists. If the editor makes the list step optional, `beginner` fits.
- `timeRequired`: "45 minutes to 1 hour, plus waiting for Google Takeout". Reason: install and first country map about 10 minutes, Takeout request 5 minutes, importing starred places 5 minutes, My Maps conversion about 10 minutes per list, Timeline export 5 minutes, default-app and backup settings 5 minutes. Google says Takeout can take minutes to days, usually the same day [[2026-11-03-google-takeout-download-data-help#c5]]; a Maps-only export is small, so expect the short end (to confirm). Map download size depends on the country (open question).

**intro** (100-150 words)
- What you keep: places with names and positions, as Organic Maps bookmarks.
- Why people switch: Organic Maps says it collects no data and needs no account [[2026-11-03-organic-maps-homepage#c2]], and runs fully offline once maps are downloaded [[2026-11-03-organic-maps-homepage#c3]]. Attribute both to the project. Contrast, from Google's own help: Timeline, if you turned it on, regularly saves your phone's precise location, also when Google apps are closed [[2026-11-03-google-maps-timeline-help#c6]].
- Organic Maps is free [[2026-11-03-organic-maps-homepage#c2]] and run by an Estonian company, Organic Maps OÜ [[2026-11-03-organic-maps-homepage#c8]].

**beforeYouStart** (50-100 words). What people wish they'd known:
- Google exports places in two pieces. Starred places come as one GeoJSON file with positions. Your other lists come as spreadsheets with names and Google links, but no positions [[2026-11-03-google-takeout-maps-your-places-schema#c2]] [[2026-11-03-google-takeout-saved-schema#c3]]. The first imports in one tap. The second needs a conversion step.
- Takeout only exports what you saved. Lists you only follow are a separate case (open question).
- Use a computer for the Takeout and My Maps steps. My Maps import is documented for computers [[2026-11-03-google-my-maps-import-help#c5]].
- Organic Maps only searches maps you have downloaded [[2026-11-03-organic-maps-search-faq#c1]]. Download your home region on Wi-Fi first.
- Needs iOS 12 or Android 5 or newer, and works on Android phones without Google services [[2026-11-03-organic-maps-supported-versions-faq#c1]] [[2026-11-03-organic-maps-supported-versions-faq#c2]].
- Link to the Organic Maps service page for the 2025 governance dispute and fork (see section 6 note on CoMaps). Keep it to one line here.

**steps**

1. **Install Organic Maps and download your region.** App Store, Google Play, F-Droid, Huawei AppGallery, Accrescent or Obtainium [[2026-11-03-organic-maps-homepage#c5]]. Download the map for your country or region on Wi-Fi. If a download fails, try another Wi-Fi network and check free space [[2026-11-03-organic-maps-map-download-faq#c1]] [[2026-11-03-organic-maps-map-download-faq#c2]].
2. **Request your places from Google Takeout.** On a computer, go to takeout.google.com and select "Maps (your places)" (starred places, GeoJSON) and "Saved" (lists, CSV); other products can be left out (current labels to verify, open question 2) [[2026-11-03-organic-maps-github-google-takeout-import#c2]] [[2026-11-03-google-maps-lists-help#c3]] [[2026-11-03-google-takeout-saved-schema#c1]]. Choose a destination, frequency and file format, then create the export [[2026-11-03-google-maps-lists-help#c3]]. Optional: "Google Maps" for labelled places (Home, Work, pinned locations) [[2026-11-03-google-takeout-maps-schema#c2]]. Products with data are preselected, so untick the rest [[2026-11-03-google-takeout-download-data-help#c2]]. The archive (.zip) can take from minutes to days, most people get it the same day [[2026-11-03-google-takeout-download-data-help#c4]] [[2026-11-03-google-takeout-download-data-help#c5]]. The download link expires after about 7 days [[2026-11-03-google-takeout-download-data-help#c6]]. Exporting does not delete anything from Google [[2026-11-03-google-takeout-download-data-help#c1]]. Work or school accounts may have Takeout blocked by their admin [[2026-11-03-google-takeout-download-data-help#c9]]. (General Takeout note written by the Google Drive guide agent; cited, not duplicated.)
3. **Import your starred places.** Unzip the archive, find `Saved Places.json`, and get it onto your phone (email it to yourself or put it in cloud storage). Tap it and choose "Open with Organic Maps" (Android) or "Import with Organic Maps" from the share icon (iOS) [[2026-11-03-organic-maps-import-faq#c2]]. Look for "Bookmarks loaded successfully!" [[2026-11-03-organic-maps-import-faq#c3]]. Supported since release 2025.11.25, so update the app first [[2026-11-03-organic-maps-november-2025-release#c1]]. Exact folder path inside the ZIP: verify by hand.
4. **Convert your lists with Google My Maps (one list at a time).** Each list is a CSV in the "Saved" folder. In My Maps on a computer: create a map > Add layer > Import > upload the CSV [[2026-11-03-google-my-maps-import-help#c5]]. Pick the Title column as the location column (My Maps accepts place names) [[2026-11-03-google-my-maps-import-help#c3]]. Max 2,000 rows per file [[2026-11-03-google-my-maps-import-help#c4]]; Google lists max out at 3,000 entries [[2026-11-03-google-maps-save-favorite-places-help#c1]], so very long lists need splitting. Then Menu > Export to KML/KMZ [[2026-11-03-google-my-maps-export-help#c1]] and import the KML into Organic Maps as in step 3 [[2026-11-03-organic-maps-import-faq#c1]]. Several files at once: Bookmarks and Tracks > "Import Bookmarks and Tracks" > pick the folder [[2026-11-03-organic-maps-import-faq#c4]]. Say plainly that this step uses a Google tool once, and that place-name matching can pick the wrong place (to test).
5. **Export your Timeline, if you used it.** Android: Settings app > Location > Location services > Timeline > Export Timeline data [[2026-11-03-google-maps-timeline-help#c3]]. iPhone: Google Maps > profile > Settings > Location & Privacy > Export Timeline data > Save to Files, which saves `location-history.json` [[2026-11-03-google-maps-timeline-help#c4]] [[2026-11-03-google-maps-timeline-help#c5]]. Not possible from a computer [[2026-11-03-google-maps-timeline-help#c2]]. Keep it as an archive. Organic Maps doesn't list this format, and whether its `.json` import reads it is untested, so don't promise an import.
6. **Make Organic Maps your default navigation app.** iPhone in the EU: Settings > Apps > Default Apps > Navigation [[2026-11-03-organic-maps-october-2025-release#c1]]. Android: no official source read today (open question).
7. **Back up your bookmarks.** iPhone: turn on iCloud sync in the Organic Maps settings [[2026-11-03-organic-maps-june-2024-release-icloud#c1]]. Android: export each list as KMZ, GPX or GeoJSON via the three-dot menu in Bookmarks and Tracks [[2026-11-03-organic-maps-export-faq#c2]] and keep the file somewhere safe.
8. **Clean up Google (optional, once you've checked your places).** Delete lists on a computer via Saved > More > Delete list [[2026-11-03-google-maps-lists-help#c7]]. Turn off Timeline and delete its data [[2026-11-03-google-maps-timeline-help#c10]]. Warn that deletion is permanent [[2026-11-03-google-maps-timeline-help#c7]] and that Search Services History or Web & App Activity can keep other location data [[2026-11-03-google-maps-timeline-help#c9]].

**troubleshooting** (3-5 Q&A)
- *Some imported places sit in the ocean off Africa.* Google exports unknown positions as 0,0 [[2026-11-03-google-takeout-maps-your-places-schema#c3]], and the maintainer knows about it [[2026-11-03-organic-maps-github-google-takeout-import#c3]]. Fix by hand: open the Google Maps link from the bookmark or the file, and save the place again in Organic Maps. (The edit flow for a bookmark's position is untested, see Open questions.)
- *My lists are missing after importing `Saved Places.json`.* That file only holds starred places. Lists come from "Saved" as CSV [[2026-11-03-google-takeout-saved-schema#c1]] [[2026-11-03-organic-maps-github-google-takeout-import#c4]]. Go to step 4.
- *Search can't find a place.* Download the map for that area and zoom in, or type the town or country name [[2026-11-03-organic-maps-search-faq#c1]]. The place may not be in OpenStreetMap yet.
- *A place is missing or wrong on the map.* Add or fix it in the app with an OpenStreetMap account [[2026-11-03-organic-maps-map-errors-faq#c3]]. The fix shows up after a later map update; the project aims for one to four map updates a month [[2026-11-03-organic-maps-map-errors-faq#c4]].
- *Maps won't download.* [[2026-11-03-organic-maps-map-download-faq#c1]] [[2026-11-03-organic-maps-map-download-faq#c3]].

**outro** (50-100 words)
- Update the app regularly: map data and import fixes ship in app releases (13 releases in 2025 [[2026-11-03-organic-maps-2025-year-in-review#c2]]).
- Improve the map for everyone through OpenStreetMap edits [[2026-11-03-organic-maps-map-errors-faq#c2]].
- Keep the Takeout ZIP until you're sure every place came across.

## 4. missingFeatures

**Confirmed by an official source (evidence rule 1):**
- **Live traffic information.** In Organic Maps' own poll of nearly 1,000 users, "Traffic Info" ranked second among the most requested missing features (Dec 2025) [[2026-11-03-organic-maps-2025-year-in-review#c3]]. No 2026 release note we read adds it. Re-check in the current app before publishing.
- **Live public transport times.** Public transport routing exists since June 2026 [[2026-11-03-organic-maps-june-2026-release#c1]], but the project says live schedules are still in development [[2026-11-03-organic-maps-july-2026-release#c1]].
- **Built-in satellite view.** Satellite imagery is experimental and only works with a tile server URL you supply yourself [[2026-11-03-organic-maps-june-2026-release#c3]].
- **Direct import of Google lists.** Lists export as CSV without positions [[2026-11-03-google-takeout-saved-schema#c3]], and CSV is not among the import formats Organic Maps' FAQ enumerates (KML, KMZ, KMB, GPX, GeoJSON) [[2026-11-03-organic-maps-import-faq#c1]]. Needs the conversion in step 4.

Do NOT list "no public transport routing". That was true before June 2026.

**Not listed, check before claiming (put in beforeYouStart as "check that X works for you", or leave out):**
- Street View or street-level photos: not mentioned anywhere on organicmaps.app pages read.
- User reviews, ratings and photos of businesses: not listed. Opening hours and websites come from OpenStreetMap [[2026-11-03-organic-maps-july-2026-release#c4]].
- Bookmark sync on Android: only iCloud sync (iOS, Apple Silicon Mac) is documented [[2026-11-03-organic-maps-june-2024-release-icloud#c1]].
- Shared or collaborative lists like Google's [[2026-11-03-google-maps-lists-help#c2]]: Organic Maps shares lists as files [[2026-11-03-organic-maps-export-faq#c2]]; live shared lists not listed.
- Automatic location history like Timeline, and importing Google's `location-history.json`.
- Mainline train routing: June 2026 notes name subway, light rail, bus and tram only [[2026-11-03-organic-maps-june-2026-release#c1]].
- Web or Windows access: Organic Maps lists a Linux desktop beta [[2026-11-03-organic-maps-homepage#c5]]; no web version listed.
- Live location sharing with contacts: not listed.

## 5. Open questions (test by hand before publishing)

1. Does `Saved Places.json` import with names intact in the current Android and iOS versions? Does it land in one list, and what is it called? How many places got 0,0?
2. Exact Takeout labels today: "Maps (your places)" vs "Saved", and the file paths inside the ZIP. Does "Saved" also include a CSV for starred places?
3. How long did Takeout take for a Maps-only export? Google only gives "minutes to days" [[2026-11-03-google-takeout-download-data-help#c5]].
4. My Maps route: does choosing Title as the location column place most saved places correctly? How does it handle duplicate or generic names ("Station", "Albert Heijn")? Does the exported KML keep the note and the Google link?
5. Does Organic Maps import a My Maps KML with names, and does each KML become its own bookmark list?
6. Does Organic Maps open the "Maps (your places)" Reviews file or the "Google Maps" labelled-places JSON (`latlng` object, not a GeoJSON array per Google's schema [[2026-11-03-google-takeout-maps-schema#c3]])? Expect no; confirm.
7. Does Organic Maps' `.json` import do anything with Timeline's `location-history.json`? Expect an error; confirm before saying so.
8. Lists the user follows or saved from someone else [[2026-11-03-google-maps-lists-help#c4]]: are they in the "Saved" export?
9. Android: can Organic Maps be set as the default app for map links (Settings > Apps > Default apps, or "Open with")? No official source read today.
10. How to fix a bookmark's position in Organic Maps (move vs delete and re-save)?
11. Live traffic: still absent in the current release? (Check app settings and the next release notes; the team says a release is close [[2026-11-03-organic-maps-12m-installs#c2]].)
12. Map size for one example country (for example the Netherlands) to make the Wi-Fi and storage advice concrete.
13. Public transport: does routing use timetables at all, which cities, and does it cover the reader's country?

## 6. Proposed entity facts

**`organic-maps`** (company; resolves as "Organic Maps OÜ" to `organic-maps`, virtual node derived from `parentCompany`, no entity note yet). Newest first:

- 2026-11-03 · Says total installs passed 12 million, double the total of under a year earlier; its site dates the milestone to October 2026. [[2026-11-03-organic-maps-12m-installs#c1]] [[2026-11-03-organic-maps-homepage#c1]]
- 2026-07-23 · Says live schedules for public transport routes are still in development. [[2026-11-03-organic-maps-july-2026-release#c1]]
- 2026-06-29 · Released public transport routing by subway, light rail, bus and tram, plus experimental satellite imagery that needs a user-supplied tile server. [[2026-11-03-organic-maps-june-2026-release#c1]] [[2026-11-03-organic-maps-june-2026-release#c3]]
- 2026-09-30 · Reported 0 employees and €1,960 taxable turnover for Q3 2026 to the Estonian register. [[2026-11-03-estonian-register-organic-maps-ou#c7]]
- 2026-06-11 · Filed its 2025 annual report with the Estonian register. [[2026-11-03-estonian-register-organic-maps-ou#c6]]
- 2025-12-31 · Reported about 6 million lifetime downloads across platforms and 13 releases in 2025. [[2026-11-03-organic-maps-2025-year-in-review#c1]] [[2026-11-03-organic-maps-2025-year-in-review#c2]]
- 2025-11-26 · Added import of Google Takeout `Saved Places.json` files. [[2026-11-03-organic-maps-november-2025-release#c1]]
- 2025-10-23 · Became selectable as the default navigation app on iOS in the EU. [[2026-11-03-organic-maps-october-2025-release#c1]]
- 2025-09-18 · Alexander Borsuk joined the management board, next to Viktar Havaka. [[2026-11-03-estonian-register-organic-maps-ou#c4]]
- 2025-08-28 · Viktar Havaka became sole shareholder (100%), per the Estonian register. [[2026-11-03-estonian-register-organic-maps-ou#c3]]
- 2025-05-20 · Removed the Kayak hotel referral link from the app. [[2026-11-03-organic-maps-may-2025-release#c1]]
- 2025-04-30 · Contributors forked the code as CoMaps by the end of April 2025, after an open letter of 16 April 2025 asked the shareholders for non-profit governance and financial transparency. [[2026-11-03-lwn-comaps-organic-maps-fork#c4]] [[2026-11-03-lwn-comaps-organic-maps-fork#c6]]
- 2023-11-17 · Added an experimental "Details on Kayak" hotel referral button; F-Droid flagged the app with an ads anti-feature. [[2026-11-03-lwn-comaps-organic-maps-fork#c2]]
- 2021-05-07 · Organic Maps OÜ registered in Estonia (registry code 16225385); the register lists Viktar Havaka and Roman Tsisyk as founders. [[2026-11-03-estonian-register-organic-maps-ou#c1]] [[2026-11-03-estonian-register-organic-maps-ou#c2]]

Corrections the main agent should consider for `content/services/organic-maps` (not edited, per brief):
- "6M+ installs" is superseded by 12M+ (both self-reported).
- "no public transit routing" in the body is wrong since June 2026; "no real-time traffic" still holds per the Dec 2025 poll.
- "Founders: Alexander Borsuk, Viktar Havaka": the register lists Havaka and Roman Tsisyk as company founders [[2026-11-03-estonian-register-organic-maps-ou#c2]]; LWN credits Tsisyk as the project's main driving force with Havaka and Borsuk as contributors [[2026-11-03-lwn-comaps-organic-maps-fork#c1]]. Current owner: Havaka alone since 2025-08-28.
- "employeeCount: 1-5": the register shows 0 employees for Q3 2026 [[2026-11-03-estonian-register-organic-maps-ou#c7]].
- Research notes mention Kayak affiliate links as current; they were removed in May 2025.
- Candidate line for `knowledge/flags.md` (not written, to avoid clashing with parallel agents): `- 2026-11-03 · services/organic-maps · public transport routing added, installs 12M+, sole shareholder since 2025-08 · [[2026-11-03-organic-maps-june-2026-release#c1]]`

**`comaps`** (no match in `resolve`; new entity if the main agent wants one):
- 2025-05-20 · Name CoMaps confirmed by a public vote; code on Codeberg, donations on Open Collective. [[2026-11-03-lwn-comaps-organic-maps-fork#c6]]
- 2026-10-30 · Says it comes preinstalled as the default map app on CalyxOS and iodéOS. [[2026-11-03-comaps-homepage#c5]]

**`google` / `alphabet`:** no company-level facts from this research. Service-level facts for `services/google-maps` research fields: saved lists max 3,000 entries [[2026-11-03-google-maps-save-favorite-places-help#c1]]; Timeline stored on device with optional encrypted cloud backup, not available on computers [[2026-11-03-google-maps-timeline-help#c1]] [[2026-11-03-google-maps-timeline-help#c2]]. The listing's "Google began shifting location history to on-device storage in 2024" can now cite the Timeline help note for the current state (not the date).

### Should the guide name CoMaps?

Recommendation: name it once, factually, and don't recommend it.
- For: readers will meet the fork (Korben recommends switching to CoMaps). Ignoring it looks evasive, and the honesty principle says trade-offs sit next to the recommendation.
- Against a recommendation: CoMaps is not a listed service, we have no research on its legal entity or EU status, and we have not tested these import steps in it.
- Suggested wording basis: "In 2025 some contributors forked Organic Maps as CoMaps after a dispute over governance and finances [[2026-11-03-lwn-comaps-organic-maps-fork#c4]] [[2026-11-03-lwn-comaps-organic-maps-fork#c6]]. This guide covers Organic Maps." Put it in beforeYouStart or as one line linking to the service page's "Worth knowing". Leave out the donation and proprietary-component allegations: LWN says some came without sources [[2026-11-03-lwn-comaps-organic-maps-fork#c5]].
- If CoMaps gets enough interest, run `/research` on it as a separate service first.

## Sources (notes created 2026-11-03)

Google: `2026-11-03-google-maps-lists-help`, `2026-11-03-google-maps-save-favorite-places-help`, `2026-11-03-google-maps-timeline-help`, `2026-11-03-google-takeout-maps-your-places-schema`, `2026-11-03-google-takeout-saved-schema`, `2026-11-03-google-takeout-maps-schema`, `2026-11-03-google-my-maps-import-help`, `2026-11-03-google-my-maps-export-help`.

Organic Maps: `2026-11-03-organic-maps-import-faq`, `2026-11-03-organic-maps-export-faq`, `2026-11-03-organic-maps-homepage`, `2026-11-03-organic-maps-12m-installs`, `2026-11-03-organic-maps-2025-year-in-review`, `2026-11-03-organic-maps-june-2026-release`, `2026-11-03-organic-maps-july-2026-release`, `2026-11-03-organic-maps-november-2025-release`, `2026-11-03-organic-maps-october-2025-release`, `2026-11-03-organic-maps-may-2025-release`, `2026-11-03-organic-maps-june-2024-release-icloud`, `2026-11-03-organic-maps-route-faq`, `2026-11-03-organic-maps-search-faq`, `2026-11-03-organic-maps-map-errors-faq`, `2026-11-03-organic-maps-map-download-faq`, `2026-11-03-organic-maps-supported-versions-faq`, `2026-11-03-organic-maps-github-google-takeout-import`.

Ownership and fork: `2026-11-03-estonian-register-organic-maps-ou`, `2026-11-03-lwn-comaps-organic-maps-fork`, `2026-11-03-comaps-homepage`.

Cited but written by another agent: `2026-11-03-google-takeout-download-data-help` (general Takeout help).

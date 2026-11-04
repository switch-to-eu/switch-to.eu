# Research brief: Google Drive to Proton Drive

- Guide slug (proposed): `google-drive-to-proton-drive`
- Source service: `services/google-drive` · Target service: `services/proton-drive` · Category: `storage`
- Researched: 2026-11-03. All claims below cite knowledge source notes in `knowledge/sources/2026/11/`. Source notes are not indexed yet (`pnpm knowledge:index` not run, per the brief).
- No guide exists yet for this pair. The only `sourceService: google-drive` guide is `google-drive-to-pcloud`, whose structure (Takeout route, 60 minutes, beginner) can be reused.

## Headline findings

1. **There is no Google Drive importer today, but Proton has announced one.** Proton's own help article moves files with a Google Takeout export and a manual upload [[2026-11-03-proton-drive-import-google-drive-help#c1]] [[2026-11-03-proton-drive-import-google-drive-help#c5]] [[2026-11-03-proton-drive-import-google-drive-help#c6]]. Easy Switch imports emails, contacts and calendars from Google, not files [[2026-11-03-proton-easy-switch-help#c2]]. On 15 October 2026 Proton said moving cloud storage "currently" means downloading and re-uploading, and announced an "Easy Switch from Google Drive" for the next six months, with no date [[2026-11-03-proton-autumn-winter-2026-roadmap#c1]] [[2026-11-03-proton-autumn-winter-2026-roadmap#c2]]. A Proton engineering director wrote in August that it was in internal testing [[2026-11-03-reddit-proton-drive-roadmap-h2-2026#c2]] (Reddit, low reliability). Proton's changelog, newest entry 2 October 2026, does not list it as shipped [[2026-11-03-proton-drive-roadmap-page#c6]]. **Write the guide for the Takeout route, and plan a rewrite when the importer ships.** Re-check before publishing.
2. **Google Docs, Sheets and Slides are the hard part, and nobody explains them.** The Drive for desktop "drag between two sync folders" trick that one competitor recommends fails for these files: Google says they open in the browser from the Drive folder [[2026-11-03-google-drive-for-desktop-help#c2]]. On the Proton side, Docs opens .docx, .txt, .md and .html as a new copy [[2026-11-03-proton-docs-import-export-help#c1]] [[2026-11-03-proton-docs-import-export-help#c4]]. Sheets imports XLSX, CSV or TSV only from inside an open spreadsheet [[2026-11-03-proton-sheets-import-export-help#c1]]. Proton lists no presentation editor, and its web preview list doesn't name .pptx [[2026-11-03-proton-drive-previewable-file-types#c4]]. Docs has a 25 MB document limit [[2026-11-03-proton-docs-create-edit-help#c2]].
3. **Our Proton Drive listing has wrong prices and an overstated free plan, and competitors repeat the free-plan error.** Free starts at 2 GB and reaches 5 GB only after a three-task checklist within 30 days [[2026-11-03-proton-drive-free-storage-help#c1]] [[2026-11-03-proton-drive-free-storage-help#c2]]. Google gives 15 GB [[2026-11-03-google-storage-quota-help#c1]]. Correct EUR and USD prices are in step 1 below. The guide's storage step must use these, not the listing.

## 1. Target queries

**Search Console (last 3 months, `Queries.csv`).** No query in the export contains both "google drive" and "proton". No query mentions Takeout. Related clusters:

| Cluster or query | Queries | Impressions | Clicks | Position |
|---|---|---|---|---|
| Proton Drive brand ("proton drive", "proto drive", "protondrive"...) | 22 | 104 | 0 | "proton drive" 25.5 |
| Any query with "google drive" or "gdrive" | 23 | 80 | 0 | "google drive gdpr" 36.3, "google drive pros and cons" 9.3 |
| "pcloud" + "google" (the sister guide) | 6 | 38 | 0 | "google drive to pcloud" 7.2 |
| "gmail" + "proton" (Proton Mail migration intent) | 69 | 177 | 0 | "gmail to protonmail" 17.9 |
| swiss alternative to google drive | 1 | 1 | 0 | 5 |
| proton drive free storage limit | 1 | 1 | 0 | 8 |
| migrate google workspace to proton | 1 | 1 | 0 | 58 |
| migrate from google workspace to protonmail | 1 | 1 | 0 | 53 |

Pages (`Pages.csv`): `/en/services/non-eu/google-drive` 246 impressions, position 19.6. `/en/services/eu/proton-drive` 748, position 11.5. `/en/guides/storage/google-drive-to-pcloud` 538, position 13.4 (NL version 68, position 5.6).

**What the searches show.** Four WebSearch queries ("how to move google drive to proton drive", "migrate google drive to proton drive rclone guide", "transfer files from google drive to proton drive step by step 2026", and an exact-phrase "google drive to proton drive" query) returned Proton's help article in about 20 language versions, and only four third-party pages: one Medium post, one tool vendor's blog (in 10+ languages), two first-person switch stories. Demand exists (Proton wrote a help page, and the Gmail-to-Proton cluster shows Proton migration intent on our site), but Proton owns the SERP. No volume data is available to us.

**Expectation, matching the earlier analysis** (`docs/seo/audits/2026-11-03-top-pages.md`, "Is a Google Drive to Proton Drive guide worth it?"): little search traffic. The job of this guide is the internal path: the Google Drive page recommends Proton Drive, and without a guide there is no "Switch from Google Drive" button.

Suggested primary keyword: "google drive to proton drive". Secondary: "migrate google drive to proton drive", "google takeout proton drive", "proton drive google docs", "proton drive free storage".

## 2. Competing guides

| # | Guide | Publisher, date | Length | H2 outline | Method | Affiliate links | Outdated or wrong |
|---|---|---|---|---|---|---|---|
| 1 | [Three Efficient Methods to Migrate Files from Google Drive to Proton Drive](https://medium.com/@cloudslinker/three-efficient-methods-to-migrate-files-from-google-drive-to-proton-drive-d31e2ac9a60d) | CloudsLinker on Medium, date unknown | Unknown | Not read | Per search snippets: manual download and upload, rclone, and CloudsLinker's own hosted transfer service | Promotes its own product | **Blocked today**: Jina returned 403 (Medium domain block) and WebFetch returned 403. Only search snippets seen, so nothing here is verified. |
| 2 | [Migrate Google Drive to Proton Drive with RcloneView](https://rcloneview.com/support/blog/migrate-google-drive-to-proton-drive-rcloneview) | RcloneView (tool vendor), 2026-06-01 | ~960 words | Product box / Connecting Google Drive and Proton Drive / Folder Compare before migrating / Running the migration job / Scheduled sync during a transition / Getting started | Cloud-to-cloud with a paid-tier GUI over rclone | No affiliate links, but it sells the tool (Plus licence for scheduling) | Has the user type their Proton password into a third-party app and never says rclone's Proton backend is experimental, beta and reverse-engineered [[2026-11-03-rclone-proton-drive-backend-docs#c1]] [[2026-11-03-rclone-proton-drive-backend-docs#c2]] [[2026-11-03-rclone-proton-drive-backend-docs#c3]]. Says the minimum rclone version is v1.69, while rclone says the backend arrived in v1.64.0 [[2026-11-03-rclone-proton-drive-backend-docs#c1]] (later fixes may explain it). Silent on what happens to Google Docs (rclone converts to docx, xlsx, pptx by default [[2026-11-03-rclone-google-drive-backend-docs#c1]]). Useful idea: re-running a copy skips files that already arrived, and checksums beat size checks. |
| 3 | [I ditched Google Drive and Photos for this privacy-focused app](https://www.androidauthority.com/i-ditched-google-drive-for-proton-drive-3647483/) | Android Authority, 2026-03-28 | ~1,340 words | Why I made the switch / What I like about Proton / Nothing is perfect / Privacy vs features | First-person review, no migration steps | Yes: five go.getproton.me affiliate links (aff_id 1555), no disclosure in the article text we read | Says free is 5 GB. It starts at 2 GB [[2026-11-03-proton-drive-free-storage-help#c1]]. Quotes 200 GB at $4.99/month, which is the monthly price. Yearly billing is $3.99/month [[2026-11-03-proton-drive-pricing-page#c2]]. Fair on trade-offs: basic search, no photo editing. |
| 4 | [Why I Switched from Google Drive to Proton Drive](https://tech.yahoo.com/vpn/articles/why-switched-google-drive-proton-194518933.html) | Yahoo Tech (syndicated), 2025-10-31 | ~780 words | What's wrong with Google Drive? / What do you need in a cloud service provider? / Proton Drive is privacy-focused and simple / What else do you get with Proton? | First-person story, no migration steps | Yes: a CJ affiliate link (anrdoezrs.net) on the Play Store link | Yearly prices ($4, $10, $15 for 200 GB, 500 GB, 2 TB) round today's $3.99, $9.99, $14.99 [[2026-11-03-proton-drive-pricing-page#c2]] [[2026-11-03-proton-drive-pricing-page#c3]] [[2026-11-03-proton-drive-pricing-page#c4]]. Doesn't say the 2 TB plan (Duo) is a two-user plan [[2026-11-03-proton-plans-help#c4]]. |
| 5 | [How to move your OneDrive documents to Proton Drive](https://tech.yahoo.com/general/articles/move-onedrive-documents-proton-drive-172217202.html) | Yahoo Tech (syndicated), 2024-12-03 | ~1,080 words | Web method / Native desktop apps / Android / Third-party transfer apps / Goodbye OneDrive | Download-and-upload, or copy between two desktop sync folders | None seen | Says "the same trick" works for Google Drive. For Google Docs, Sheets and Slides it doesn't: they open in the browser from the Drive for desktop folder [[2026-11-03-google-drive-for-desktop-help#c2]], and in the default streaming mode files aren't stored locally [[2026-11-03-google-drive-desktop-stream-mirror-help#c1]]. Predates the Android folder upload [[2026-11-03-proton-drive-release-notes#c1]]. |

Also read, not counted as competitors: Proton's own help article, which ranks first [[2026-11-03-proton-drive-import-google-drive-help#c1]]. It takes about 3 minutes to read and covers files only: nothing on Docs formats, sharing, storage or what to check afterwards. Thurrott (2026-10-15, read) reported the roadmap, and a borncity.com report showed up in search (not read). We cite Proton's own roadmap post instead.

**What they all cover (the minimum we need):** why people switch (end-to-end encryption, Google can read files, Gemini scanning), the free storage gap, the yearly price of the 200 GB plan, and one transfer method (Takeout and upload, or cloud-to-cloud with rclone).

**What they miss or get wrong (where we win):**
- **Google-native files.** Nobody explains what Takeout does to Docs, Sheets and Slides, or how to get them into Proton Docs and Sheets. We can: .docx opens in Docs as a copy, XLSX goes in through File → Import, no Slides equivalent is listed, 25 MB Docs limit (sources in step 6).
- **The desktop-folder trick.** The one competitor that suggests it is wrong for Google-native files (row 5).
- **Storage maths.** Competitors repeat "5 GB free". The honest version: 2 GB at sign-up, 5 GB after a checklist, versus Google's 15 GB shared with Gmail and Photos [[2026-11-03-google-storage-quota-help#c1]]. Paid Proton storage is shared with Mail too [[2026-11-03-proton-drive-faq#c3]].
- **Takeout's limits.** Nobody covers them: 7-day expiry, 5 downloads per archive, split archives and the 50 GB size option [[2026-11-03-google-takeout-download-data-help#c4]] [[2026-11-03-google-takeout-download-data-help#c6]], or that trashed files are included [[2026-11-03-google-drive-takeout-contents-help#c3]].
- **Sharing.** Nobody says that shared links and collaborators stay behind, or how to re-share in Proton (links with password and expiry, email invites with view or edit rights) [[2026-11-03-proton-drive-web-guide#c3]].
- **Linux.** Nobody mentions the official Proton Drive CLI, released 9 June 2026 [[2026-11-03-proton-drive-roadmap-page#c1]].
- **What's coming.** Nobody mentions the announced Google Drive importer [[2026-11-03-proton-autumn-winter-2026-roadmap#c2]].
- **Disclosure.** Both reviews (rows 3 and 4) use affiliate links without a visible disclosure in the text we read. We disclose ours where the link sits.

## 3. Proposed outline

**Frontmatter**
- `title`: "Switching from Google Drive to Proton Drive"
- `description` (150 chars): "Move from Google Drive to Proton Drive with Google Takeout. What happens to Docs, Sheets and Slides, how much storage you need, and what stays behind."
- If a meta title field is used: "Google Drive to Proton Drive: Move Your Files Step by Step" (58 chars).
- `category: storage`, `sourceService: google-drive`, `targetService: proton-drive`
- `difficulty: intermediate`. Reason: Takeout splits big drives into several zip files [[2026-11-03-google-takeout-download-data-help#c4]], Docs and Sheets each need a separate conversion step (step 6), and sharing must be rebuilt by hand. Proton's own engineering director calls the current route "very manual, very technical" [[2026-11-03-reddit-proton-drive-roadmap-h2-2026#c1]]. For a small drive of plain files (PDFs, photos), `beginner` would be fair. The sister pCloud guide says beginner, so the writer may prefer that for consistency.
- `timeRequired: "1-2 hours, plus export and upload time"`. Reason: about an hour of clicking across 8 steps, plus a few minutes per document you convert. Takeout itself takes "from a few minutes to a few days", most people get it the same day [[2026-11-03-google-takeout-download-data-help#c5]]. Upload time depends on size and connection: as plain arithmetic, 20 GB at 50 Mbit/s upload is about 55 minutes before encryption overhead. No source gives Proton upload speeds we can quote as current.

**intro** (100-150 words). Facts to use: Proton Drive encrypts file contents, file names and folder names on the device before upload [[2026-11-03-proton-drive-support-hub#c2]], file size is not encrypted [[2026-11-03-proton-drive-support-hub#c3]]. Our Google Drive listing already covers Gemini access and the CLOUD Act (`content/services/google-drive/en.md`, research from April 2026, re-check before quoting). Say plainly that there is no one-click importer today and that Proton has announced one [[2026-11-03-proton-autumn-winter-2026-roadmap#c2]].

**beforeYouStart** (50-100 words). The thing people wish they'd known:
- Check how much you store first, at drive.google.com/settings/storage [[2026-11-03-google-storage-quota-help#c4]]. Proton Free holds 2 GB, 5 GB after the checklist [[2026-11-03-proton-drive-free-storage-help#c1]].
- Google Docs, Sheets and Slides don't stay Google files. They come out as Office files you open in Proton Docs and Sheets, and there is no Slides editor listed (step 6).
- Shared links and collaborators don't move. People you share with get new Proton links.
- Linux: no desktop sync app yet. Use the web app or the CLI [[2026-11-03-proton-drive-download-page#c1]] [[2026-11-03-proton-drive-download-page#c2]].
- A computer, not a phone: Google recommends a desktop for Takeout [[2026-11-03-google-takeout-download-data-help#c8]].

**steps**

1. **Check your storage and pick a Proton plan.** Google: up to 15 GB shared across Gmail, Drive and Photos [[2026-11-03-google-storage-quota-help#c1]]. Files others shared with you don't count against your quota [[2026-11-03-google-storage-quota-help#c2]]. Proton, as of November 2026:

   | Plan | Storage | EUR (Proton support pages) | USD yearly (pricing page) |
   |---|---|---|---|
   | Free | 2 GB, 5 GB after checklist | €0 | $0 |
   | Drive Plus | 200 GB | "as little as €4.99/month" [[2026-11-03-proton-drive-faq#c1]], yearly EUR not found | $3.99/month, $47.88/year [[2026-11-03-proton-drive-pricing-page#c2]] |
   | Unlimited | 500 GB, plus Mail, VPN, Pass, Calendar | €12.99/month or €119.88/year [[2026-11-03-proton-plans-help#c3]] | $9.99/month, $119.88/year [[2026-11-03-proton-drive-pricing-page#c3]] |
   | Duo | 2 TB for 2 users | €19.99/month or €179.88/year [[2026-11-03-proton-plans-help#c4]] | $14.99/month, $179.88/year [[2026-11-03-proton-drive-pricing-page#c4]] |
   | Family | 3 TB for up to 6 users | €29.99/month or €287.88/year [[2026-11-03-proton-plans-help#c5]] | $23.99/month yearly [[2026-11-03-proton-drive-pricing-page#c5]] |

   Paid storage is shared with Proton Mail, and storage can't be bought for Drive alone [[2026-11-03-proton-drive-faq#c3]] [[2026-11-03-proton-drive-faq#c5]]. The largest single file is limited only by free space [[2026-11-03-proton-drive-support-hub#c4]]. 30-day money-back guarantee, prorated [[2026-11-03-proton-drive-pricing-page#c7]]. **Affiliate disclosure goes here** if this step links to Proton's pricing page (see "Affiliate disclosure" below).

2. **Create your Proton account and finish the welcome checklist.** Sign up, then within 30 days: upload a file or folder, create a shareable link, and add an account recovery method and a data recovery method. That raises free storage from 2 GB to 5 GB, and Proton emails a confirmation [[2026-11-03-proton-drive-free-storage-help#c2]] [[2026-11-03-proton-drive-free-storage-help#c3]] [[2026-11-03-proton-drive-free-storage-help#c5]]. The recovery methods matter more than the bonus: they protect access to encrypted files. **Affiliate disclosure goes here** if the sign-up link is the affiliate URL.

3. **Export your Drive with Google Takeout.** takeout.google.com → "Deselect all" → tick Drive → "Next step" [[2026-11-03-proton-drive-import-google-drive-help#c1]]. Delivery: "Send download link via email". "Add to Drive" counts toward your Google storage [[2026-11-03-google-takeout-download-data-help#c3]]. Frequency: export once. File type .zip. Size: 50 GB means fewer parts [[2026-11-03-google-takeout-download-data-help#c4]]. Empty Drive's trash first, because Takeout includes trashed files [[2026-11-03-google-drive-takeout-contents-help#c3]]. Takeout takes minutes to days, usually the same day [[2026-11-03-google-takeout-download-data-help#c5]]. Mention the "Multiple formats" button for Docs, Sheets and Slides only after the hands-on test (Open questions). If the user wants photos too, start a separate Google Photos export now [[2026-11-03-proton-google-photos-import-help#c1]].

4. **Download every part and unzip it.** Open Google's email → "Manage Google Takeout request" → download all parts → unzip [[2026-11-03-proton-drive-import-google-drive-help#c2]]. Do it within about 7 days, and each archive downloads at most 5 times [[2026-11-03-google-takeout-download-data-help#c6]]. Merge the folders from the different parts on your computer before uploading, because Proton keeps the folder structure you upload [[2026-11-03-proton-drive-import-google-drive-help#c3]]. Takeout also contains an `archive_browser.html` that describes the formats [[2026-11-03-google-takeout-download-data-help#c8]].

5. **Upload the folders to Proton Drive.**
   - **Windows or Mac (recommended for big drives):** install the app (Windows 11/10 x64 or ARM64 [[2026-11-03-proton-drive-windows-app-help#c1]], macOS 13 or later [[2026-11-03-proton-drive-macos-setup-help#c1]]), then drag the unzipped folders into Proton Drive → My files (Windows) or the Proton Drive folder in Finder (Mac) [[2026-11-03-proton-drive-import-google-drive-help#c5]]. Folders can't go in the root on Windows, only inside My files [[2026-11-03-proton-drive-windows-app-help#c3]]. The desktop app retries failed uploads by itself [[2026-11-03-proton-drive-import-google-drive-help#c4]]. Watch progress in Activity [[2026-11-03-proton-drive-windows-app-help#c4]].
   - **Any computer, including Linux:** drive.proton.me → New → "Upload folder", or drag the folders into the window [[2026-11-03-proton-drive-setup-help#c2]] [[2026-11-03-proton-drive-web-guide#c1]].
   - **Linux, scripted:** the official CLI, `./proton-drive filesystem upload <local> /my-files/<folder>` after `./proton-drive auth login` [[2026-11-03-proton-drive-cli-help#c2]] [[2026-11-03-proton-drive-cli-help#c3]]. Keep this to one short paragraph.
   - **Phones:** Android can upload whole folders, iOS imports files only [[2026-11-03-proton-drive-setup-help#c4]] [[2026-11-03-proton-drive-setup-help#c5]]. Not the right tool for a whole drive.

6. **Turn Google Docs and Sheets into Proton files you can edit.**
   - Documents: select the .docx → ⋮ → "Open in Docs". Docs makes a new copy and keeps the original [[2026-11-03-proton-docs-import-export-help#c3]] [[2026-11-03-proton-docs-import-export-help#c4]]. Docs opens .docx, .txt, .md and .html [[2026-11-03-proton-docs-import-export-help#c1]], not .odt yet (ODT import is on Proton's roadmap [[2026-11-03-proton-autumn-winter-2026-roadmap#c5]]). Documents over 25 MB can't be edited [[2026-11-03-proton-docs-create-edit-help#c2]].
   - Spreadsheets: an uploaded .xlsx isn't opened directly. It is edited through Proton Sheets [[2026-11-03-proton-drive-previewable-file-types#c2]]. Create a spreadsheet, then File → Import → pick the XLSX or CSV → "Insert as new sheet" [[2026-11-03-proton-sheets-import-export-help#c1]] [[2026-11-03-proton-sheets-import-export-help#c2]]. Check formulas and dates afterwards (conversion is on by default [[2026-11-03-proton-sheets-import-export-help#c3]]).
   - Presentations: keep the .pptx and open it in PowerPoint, Keynote or LibreOffice. For files you only need to view, also save a PDF from Google first (File → Download → PDF [[2026-11-03-google-drive-download-file-help#c2]]), because PDF previews in Proton's web app and .pptx is not on the preview list [[2026-11-03-proton-drive-previewable-file-types#c3]] [[2026-11-03-proton-drive-previewable-file-types#c4]]. The iOS app does preview Office files [[2026-11-03-proton-drive-previewable-file-types#c5]].
   - Desktop app warning: Proton Docs and Sheets exist on your computer only as placeholders. Copying them out of the Proton Drive folder leaves a 0-byte file and moves the original to Trash. Use Download [[2026-11-03-proton-docs-import-export-help#c5]] [[2026-11-03-proton-docs-import-export-help#c6]] [[2026-11-03-proton-sheets-import-export-help#c5]].

7. **Share again from Proton Drive.** Google share links keep pointing at the Google copy. In Proton, share by link (optional password and expiry date) or invite people by email with view or edit rights. The Shared tab lists everything you share [[2026-11-03-proton-drive-web-guide#c3]] [[2026-11-03-proton-drive-web-guide#c4]]. Tell people the old links will stop working when you delete the Google files.

8. **Check everything arrived, then clean up Google Drive.** Compare folder sizes and file counts between the unzipped export and Proton. Takeout never deletes anything from Google [[2026-11-03-google-takeout-download-data-help#c1]]. Keep Google Drive for a few weeks before deleting, then delete. Proton suggests removing files once they're in Proton Drive [[2026-11-03-proton-drive-import-google-drive-help#c7]]. Google's storage figure takes 48 to 72 hours to update after a big delete [[2026-11-03-google-storage-quota-help#c5]]. Optional: Google Photos, through the web Photos tab or the Windows app's "Import from Google Photos" [[2026-11-03-proton-google-photos-import-help#c4]] [[2026-11-03-proton-google-photos-import-help#c5]].

**troubleshooting** (3-5 Q&A, 100-200 words):
- *"Takeout says my link expired."* Archives expire after about 7 days and allow 5 downloads. Create a new export [[2026-11-03-google-takeout-download-data-help#c6]].
- *"I can't use Takeout on my work or school account."* Admins can block it [[2026-11-03-google-takeout-download-data-help#c9]]. Ask your admin, or download files from drive.google.com (right-click → Download) [[2026-11-03-google-drive-download-file-help#c1]].
- *"An upload stopped halfway."* On the desktop app it retries by itself [[2026-11-03-proton-drive-import-google-drive-help#c4]]. In the web app, upload the folder again and choose "Skip" with "Apply to all duplicate files", so finished files aren't uploaded twice [[2026-11-03-proton-drive-version-history-help#c1]]. Hands-on test needed (Open questions).
- *"My Docs files are tiny .gdoc files."* You copied from the Drive for desktop folder. Those files open in the browser and are not documents [[2026-11-03-google-drive-for-desktop-help#c2]]. Use Takeout, or File → Download → Microsoft Word [[2026-11-03-google-drive-download-file-help#c2]].
- *"I deleted files in Proton but storage didn't go down."* It can take up to three hours [[2026-11-03-proton-drive-support-hub#c5]].
- *"Old versions are missing."* Takeout exports the current version and versions marked "Keep forever" [[2026-11-03-google-drive-takeout-contents-help#c3]], and Proton starts a fresh history (Free: 10 versions for 7 days, paid: up to 200 versions for up to 10 years) [[2026-11-03-proton-drive-version-history-help#c4]] [[2026-11-03-proton-drive-version-history-help#c5]].

**outro** (50-100 words): set up photo backup on the phone, move Google Photos separately, consider Proton Mail if Gmail is next (link the existing `gmail-to-protonmail` guide). Note that Proton has announced a direct Google Drive import [[2026-11-03-proton-autumn-winter-2026-roadmap#c2]], so the guide will change when it ships. Keep Google for a few weeks.

### Affiliate disclosure

- `content/services/proton-drive/en.md` has `affiliateUrl: https://go.getproton.me/aff_c?offer_id=43&aff_id=16890&url_id=1219`.
- The guide page template renders no outbound service button and no `<AffiliateDisclosure>` (`apps/website/app/(frontend)/[locale]/guides/[category]/[service]/page.tsx`, `components/guides/GuideSidebar.tsx`). So any affiliate link in the guide body appears without a disclosure unless the text adds one.
- Where it would sit: step 1 (link to plans and prices) and step 2 (link to sign-up). The Gmail guide puts its affiliate link in step 1 with no disclosure, and the SEO audit flags that.
- Recommendation: either link to plain proton.me URLs in the steps and leave the affiliate button to the service page, or keep the affiliate link in step 2 only, with a one-line note next to it: "Affiliate link: we earn a commission if you subscribe through it. It doesn't change what this guide recommends." Add `rel="sponsored"` once the sitewide fix lands (audit, "Sitewide fixes" item 1). Links to proton.me/support help pages are not affiliate links.

## 4. missingFeatures

**Confirmed by an official source** (evidence rule 1):
- **Less free storage:** Google gives 15 GB shared across Gmail, Drive and Photos [[2026-11-03-google-storage-quota-help#c1]]. Proton Drive Free starts at 2 GB and reaches 5 GB after the checklist [[2026-11-03-proton-drive-free-storage-help#c1]].
- **No direct import from Google Drive yet:** Proton says moving currently means downloading and re-uploading, and an Easy Switch for Google Drive is still planned [[2026-11-03-proton-autumn-winter-2026-roadmap#c1]] [[2026-11-03-proton-autumn-winter-2026-roadmap#c2]]. Easy Switch covers email, contacts and calendars only [[2026-11-03-proton-easy-switch-help#c2]].
- **No folder sync outside the Proton Drive folder on Mac:** Proton calls it the biggest missing feature of the Mac app and has it on the roadmap [[2026-11-03-proton-autumn-winter-2026-roadmap#c4]]. Google's Mac app syncs "Folders from your computer" [[2026-11-03-google-drive-desktop-stream-mirror-help#c6]].
- **Docs can't open ODT files yet:** Docs opens .docx, .txt, .md and .html [[2026-11-03-proton-docs-import-export-help#c1]], and ODT import is on the roadmap [[2026-11-03-proton-autumn-winter-2026-roadmap#c5]].
- **No Sheets editing on mobile yet:** listed as a planned feature [[2026-11-03-proton-autumn-winter-2026-roadmap#c5]]. (Google's mobile Sheets editing was not sourced today. Add a Google source before using it as a comparison.)
- **Search by file name only on web and mobile:** Proton says search beyond file names is coming in increments [[2026-11-03-proton-autumn-winter-2026-roadmap#c6]]. (Google Drive's content search was not sourced today.)

**Not listed, check before stating** (goes in beforeYouStart as "check that X works for you", or leave out):
- A presentation editor (Slides equivalent). Proton's product menus on proton.me/drive/download show Docs and Sheets only, and the web preview list doesn't name .pptx [[2026-11-03-proton-drive-previewable-file-types#c4]]. "Not listed" is not "doesn't exist". Check Proton's help centre or ask support.
- Equivalents for Google Forms, Drawings, Sites and Vids. Takeout exports them [[2026-11-03-google-drive-takeout-contents-help#c3]], but no Proton editor for them was found.
- Comments and suggestions inside exported .docx files: Takeout says comments and suggestions are included [[2026-11-03-google-drive-takeout-contents-help#c4]]. Whether they survive "Open in Docs" is unknown.
- A Linux desktop sync app with a window. Not on the download page [[2026-11-03-proton-drive-download-page#c5]], beta announced [[2026-11-03-proton-autumn-winter-2026-roadmap#c3]]. Google Drive for desktop is Windows and macOS only [[2026-11-03-google-drive-for-desktop-help#c1]], so this is not a feature Google has. Use it in beforeYouStart, not in missingFeatures.

## 5. Open questions (test by hand before publishing)

1. **Has the Google Drive importer shipped?** Check proton.me/drive/roadmap, the Drive release notes and Easy Switch in Proton settings. If it has, the guide's main method changes.
2. **Takeout's Drive format options.** Does the Drive entry still show "Multiple formats", and what are the defaults for Docs, Sheets, Slides and Drawings? Google's help page lists contents, not formats [[2026-11-03-google-drive-takeout-contents-help#c3]]. Screenshot it.
3. **Shared drives and "Shared with me".** Does a personal Takeout include shared drive files or files shared with you? Google lists only "shared drive names" and resource IDs [[2026-11-03-google-drive-takeout-contents-help#c6]]. University IT pages say no (not authoritative). Test with a personal and a Workspace account.
4. **What a Google Doc looks like after Takeout → .docx → "Open in Docs":** headings, images, tables, comments, suggestions, page layout.
5. **Sheets import:** formulas, charts, multiple tabs, conditional formatting from a Google Sheet exported as XLSX.
6. **Web upload of a large folder (10 GB+, 1,000+ files):** does it finish, does "Skip" + "Apply to all duplicate files" work as a resume? The desktop app's retry claim is Proton's [[2026-11-03-proton-drive-import-google-drive-help#c4]].
7. **Drive for desktop copy:** confirm that copying Google-native files out of the Drive folder yields .gdoc/.gsheet link files (Google says they open in the browser [[2026-11-03-google-drive-for-desktop-help#c2]], but doesn't name the file type).
8. **Drive Plus yearly price in EUR.** Proton's EUR pages give only "as little as €4.99/month" [[2026-11-03-proton-drive-faq#c1]]. Read the price at checkout from an EU connection. The pricing page rendered USD only for us.
9. **The welcome checklist:** does uploading via the desktop app count for task 1 (Proton says any app works [[2026-11-03-proton-drive-free-storage-help#c4]])? How long until the 5 GB shows?
10. **Real upload speed** for a typical Takeout folder, to firm up `timeRequired`.

## 6. Proposed entity facts

Slugs from `pnpm -s knowledge resolve`: **`proton`** ("Proton AG" → 0.9 alias, derived from parentCompany, no note yet). **`google`** ("Google" → 1.0 alias, part-of `alphabet`, no note yet). `services/google-drive` is attached to **`alphabet`** ("Alphabet" → 1.0 alias), so the main agent should decide whether Takeout facts go on `google` or `alphabet`.

`proton`:
- 2026-11-03 · Proton Drive Free starts at 2 GB and rises to 5 GB after a welcome checklist completed within 30 days of sign-up. [[2026-11-03-proton-drive-free-storage-help#c1]]
- 2026-11-03 · Lists Proton Unlimited at €12.99/month or €119.88/year, Duo (2 TB, 2 users) at €179.88/year and Family (3 TB, 6 users) at €287.88/year. [[2026-11-03-proton-plans-help#c3]]
- 2026-10-15 · Announced an "Easy Switch from Google Drive" for Proton Drive on its autumn and winter roadmap, without a release date. [[2026-11-03-proton-autumn-winter-2026-roadmap#c2]]
- 2026-10-15 · Said it is working towards a beta of an official Proton Drive Linux app, likely a headless sync daemon first. [[2026-11-03-proton-autumn-winter-2026-roadmap#c3]]
- 2026-06-09 · Released the Proton Drive CLI for Windows, macOS and Linux. [[2026-11-03-proton-drive-roadmap-page#c1]]
- 2026-06-04 · Says its rebuilt Drive SDK made uploads up to 3x and downloads up to 2x faster on all platforms. [[2026-11-03-proton-drive-roadmap-page#c2]]
- 2026-01-15 · Proton Drive for Android gained whole-folder upload (month given as January 2026 in the release notes). [[2026-11-03-proton-drive-release-notes#c1]]
- 2025-12-01 · Launched Proton Sheets, an end-to-end encrypted spreadsheet editor inside Drive (source gives the month only). [[2026-11-03-proton-drive-release-notes#c5]]
- 2025-09-01 · The Proton Drive Windows app gained import of photos and albums from Google Photos (source gives the month only). [[2026-11-03-proton-drive-release-notes#c4]]

`google` (or `alphabet`):
- 2026-11-03 · Each Google Account includes up to 15 GB of storage shared across Gmail, Google Drive and Google Photos. [[2026-11-03-google-storage-quota-help#c1]]
- 2026-11-03 · Google Takeout archives expire after about 7 days and can be downloaded at most 5 times. [[2026-11-03-google-takeout-download-data-help#c6]]

## Notes for the main agent

- **Listing corrections for `services/proton-drive`** (not edited, per the brief): free plan "5 GB" should read 2 GB, 5 GB after setup. Drive Plus, Unlimited, Family and Drive Professional "billed annually" figures mix monthly and yearly prices. Duo is missing (2 TB, 2 users). "No native Linux client" is still true, but an official CLI exists since June 2026. Sources: the step 1 table. A `flags.md` line may be warranted.
- **Source notes written (31):** `2026-11-03-proton-drive-import-google-drive-help`, `-proton-drive-download-page`, `-proton-drive-cli-help`, `-proton-easy-switch-help`, `-proton-drive-pricing-page`, `-proton-plans-help`, `-proton-drive-free-storage-help`, `-proton-drive-faq`, `-proton-drive-support-hub`, `-proton-drive-web-guide`, `-proton-drive-setup-help`, `-proton-docs-import-export-help`, `-proton-sheets-import-export-help`, `-proton-docs-create-edit-help`, `-proton-drive-previewable-file-types`, `-proton-drive-version-history-help`, `-proton-drive-windows-app-help`, `-proton-drive-macos-setup-help`, `-proton-google-photos-import-help`, `-proton-drive-release-notes`, `-proton-drive-roadmap-page`, `-proton-autumn-winter-2026-roadmap`, `-reddit-proton-drive-roadmap-h2-2026`, `-google-takeout-download-data-help`, `-google-drive-takeout-contents-help`, `-google-drive-download-file-help`, `-google-drive-for-desktop-help`, `-google-drive-desktop-stream-mirror-help`, `-google-storage-quota-help`, `-rclone-proton-drive-backend-docs`, `-rclone-google-drive-backend-docs` (each prefixed `2026-11-03`). `pnpm knowledge:index` and `knowledge/log.md` are left to the main agent.
- **Blocked:** the Medium/CloudsLinker guide (403 from Jina and WebFetch). An attempt to read Proton's plans API for EUR prices was refused by the permission classifier, so the EUR Drive Plus yearly price stays open.

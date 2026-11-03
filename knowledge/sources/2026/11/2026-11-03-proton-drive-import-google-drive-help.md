---
type: source
title: Import files from Google Drive to Proton Drive (Proton Support)
url: https://proton.me/support/import-files-google-drive
publisher: Proton
published: '2026-11-03'
fetched: '2026-11-03'
lang: en
reliability: high
entities: [proton]
stories: []
---
**Summary:** Proton's help article on moving files from [[services/google-drive]] to [[services/proton-drive]]. The method is a Google Takeout export of Drive, then an upload through the Proton Drive desktop app or web app. The page shows no date, so the fetch date is used. It describes no direct importer for Google Drive.

**Claims**
- `c1` The export step uses Google Takeout: sign in at takeout.google.com, click "Deselect all", tick Drive, click "Next step", choose destination, frequency, file type and size, then "Create export".
- `c2` When the export is ready, Google sends a download link by email; the user opens "Manage Google Takeout request", downloads every part and unzips them.
- `c3` Proton Drive keeps the folder structure of uploaded files; Proton suggests merging folders from a multi-part Takeout export on the computer before uploading, because that is usually faster than rearranging them afterwards.
- `c4` Proton says the desktop app is generally more stable for many or large files and retries failed uploads automatically, while the web app needs no installation.
- `c5` The desktop route covers Windows and macOS: drag the unzipped files into the Proton Drive folder (Finder on macOS, File Explorer under Proton Drive → My files on Windows) and check the sync status in the app.
- `c6` The web route: sign in at drive.proton.me, optionally create a folder, then drag files in or use the Upload button to pick files or folders; upload progress shows in the web app.
- `c7` After the files are in Proton Drive, Proton suggests removing them from Google Drive and moving Google Photos next.

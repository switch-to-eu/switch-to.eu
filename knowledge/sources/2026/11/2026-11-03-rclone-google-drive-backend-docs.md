---
type: source
title: Google Drive backend (rclone documentation)
url: https://rclone.org/drive/
publisher: rclone
published: '2026-10-09'
fetched: '2026-11-03'
lang: en
reliability: high
entities: [alphabet]
stories: []
---
**Summary:** rclone's documentation for its [[services/google-drive]] backend, read for how Google Docs files are exported and for upload limits. The page shows no date; the server reported 9 October 2026 as its date. Claims are about rclone's behaviour.

**Claims**
- `c1` When rclone downloads a Google document it converts it according to `--drive-export-formats`, which defaults to docx, xlsx, pptx and svg.
- `c2` rclone suggests `--drive-export-formats pdf` for an archive copy, or ods, odt and odp for OpenOffice and LibreOffice formats.
- `c3` rclone adds the file extension to exported Google documents, so "My Spreadsheet" becomes "My Spreadsheet.xlsx".
- `c4` rclone can be pointed at a Google Shared Drive (formerly Team Drive) or at the "Shared with me" folder.
- `c5` rclone's docs state that, at the time of writing, Google Drive accepts about 750 GiB of uploads per day per user, an undocumented limit.

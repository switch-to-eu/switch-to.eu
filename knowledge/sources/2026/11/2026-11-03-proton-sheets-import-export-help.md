---
type: source
title: Importing and exporting in Proton Sheets (Proton Support)
url: https://proton.me/support/sheets-import-export
publisher: Proton
published: '2026-11-03'
fetched: '2026-11-03'
lang: en
reliability: high
entities: [proton]
stories: []
---
**Summary:** Proton's help article on importing data into and exporting data from Proton Sheets, the spreadsheet editor inside [[services/proton-drive]]. It names Google Sheets and Microsoft Excel files as import sources. The page shows no date, so the fetch date is used.

**Claims**
- `c1` Import works from inside an open spreadsheet: File → Import → Browse, accepting CSV, TSV or XLSX files.
- `c2` Imported data can be inserted as a new sheet, replace data from the selected cell, or replace the current sheet; Proton suggests "Insert as new sheet" when unsure.
- `c3` The separator is detected automatically and cannot be changed; automatic conversion of text to numbers, dates and formulas is on by default and can be turned off.
- `c4` Export works through File → Download as XLSX, CSV or TSV.
- `c5` In the Windows and macOS apps, a Sheet is only a placeholder file locally; moving or copying it out of the synced folder leaves a 0-byte file and moves the spreadsheet to Trash.

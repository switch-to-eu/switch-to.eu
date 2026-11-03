---
type: source
title: Import from Google Maps Saved Places (Organic Maps GitHub Discussion 928)
url: https://github.com/orgs/organicmaps/discussions/928
publisher: Organic Maps (GitHub Discussions)
published: '2025-10-31'
fetched: '2026-11-03'
lang: en
reliability: medium
entities: [organic-maps]
stories: []
---
**Summary:** A discussion in the official Organic Maps GitHub organisation, opened in July 2021, on moving Google Maps saved places to [[services/organic-maps]]. The accepted answer by maintainer biodranik was updated in October 2025 (last edited 2025-10-31) with steps for the new GeoJSON import. Other replies are user comments and count as low reliability.

**Claims**
- `c1` The maintainer's answer says that since October 2025 Organic Maps imports GeoJSON, so `Saved Places.json` from Google [[services/google-maps]] can be opened directly in the app.
- `c2` The answer says to get that file from takeout.google.com by choosing "Maps (your places)", the records of starred places and place reviews, with JSON format selected.
- `c3` The maintainer warns that some imported places may have zero coordinates and then appear in the Atlantic Ocean off the coast of Africa (point 0,0).
- `c4` The 2021 opening post reports that the Takeout GeoJSON does not include places saved in custom lists.
- `c5` A user comment (November 2025) says saved lists are exported only as CSV and are not the same as the starred places the GeoJSON import handles.
- `c6` A 2024 user comment says saved lists come out of Takeout as a list of Google place URLs.

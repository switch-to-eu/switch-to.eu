---
type: source
title: Google Maps Schema Reference (Google Data Portability)
url: https://developers.google.com/data-portability/schema-reference/maps
publisher: Google
published: '2026-03-16'
fetched: '2026-11-03'
lang: en
reliability: high
entities: [alphabet]
stories: []
---
**Summary:** Google's developer reference for the "Google Maps" export (separate from "Maps (your places)" and "Saved"). It covers pinned or labelled locations, commute settings, vehicle profiles and contributions from [[services/google-maps]]. Page last updated 2026-03-16.

**Claims**
- `c1` Objects in the Google Maps export are mostly JSON, with photos and videos as JPG/PNG/MP4, navigation feedback as XML and personalisation feedback as CSV.
- `c2` "Aliased Places" holds the user's pinned locations, exported as JSON.
- `c3` Each pinned location has point coordinates, a name and, where possible, an address.
- `c4` The export also covers commute routes and settings, vehicle and electric-vehicle profiles, photos and videos, and edits or questions the user contributed.

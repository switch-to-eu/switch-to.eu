---
type: source
title: Maps (your places) Schema Reference (Google Data Portability)
url: https://developers.google.com/data-portability/schema-reference/local_actions
publisher: Google
published: '2025-02-13'
fetched: '2026-11-03'
lang: en
reliability: high
entities: [alphabet]
stories: []
---
**Summary:** Google's developer reference for the "Maps (your places)" export, which is the Takeout product that holds starred places and reviews from [[services/google-maps]]. It lists the file format and fields. Page last updated 2025-02-13.

**Claims**
- `c1` Starred places and place reviews are both exported in GeoJSON format.
- `c2` Each starred place is a GeoJSON Feature with a Point geometry, a date, a Google Maps URL and location details: name, address and ISO country code.
- `c3` When a place's position is unknown, both its longitude and latitude are exported as 0.
- `c4` The reviews export includes draft and published review text, 1-5 star ratings and answers to questions about the place.
- `c5` Google notes that the fields produced vary by service and user action, so not every export contains every field.

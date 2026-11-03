---
type: source
title: How Ad Attribution is implemented (Vivaldi Help)
url: https://help.vivaldi.com/desktop/privacy/how-ad-attribution-is-implemented/
publisher: Vivaldi Technologies
published: '2024-12-05'
fetched: '2026-11-03'
lang: en
reliability: high
entities: [vivaldi-technologies]
stories: []
---
**Summary:** Vivaldi's technical help page on the ad attribution exception in the [[services/vivaldi]] ad blocker, which lets partner search engines show ads and credit ad clicks. Published 2024-12-05; read on 2026-11-03.

**Claims**
- `c1` Vivaldi added ad attribution support so advertisers can confirm that an ad click led to a visit, which many ad providers need before they pay.
- `c2` For Vivaldi's partner search engines, a rule option primes ad attribution and lets the partner page show ads even when ad blocking is enabled for all sites.
- `c3` After a matching ad click, specific known trackers may load on the advertiser's landing site so the click can be credited. The state is tied to that tab and origin and is always disabled seven days after it was triggered.
- `c4` These rules exist only in Vivaldi's own "Allow Ads from our Partners" list, published at downloads.vivaldi.com/lists/vivaldi/partners-current.txt.

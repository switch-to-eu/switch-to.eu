# Watchlist

What `/news-scan` monitors. EU focus: digital sovereignty, privacy, competition and the European tech market, plus anything that affects the services we list. Edit freely. The scan skill reads this file every run.

`feed:` values marked `verify` are guesses. On first use, `/news-scan` checks them and replaces them with the working feed URL (or `none`, in which case it uses a site search instead).

## Publishers

| Publisher | Site | Feed | Reliability | Notes |
|---|---|---|---|---|
| European Commission press corner | ec.europa.eu/commission/presscorner | https://ec.europa.eu/commission/presscorner/api/rss?language=en | high | Filter: digital, competition, data. Feed holds only the last 10 items, all topics |
| European Data Protection Board | edpb.europa.eu | https://www.edpb.europa.eu/feed/news_en | high | Decisions, guidelines, fines |
| Court of Justice of the EU | curia.europa.eu | none | high | Press releases on data/competition rulings. No RSS found (2026-11-03) |
| European Parliament press | europarl.europa.eu/news | none | high | Votes on digital files. https://www.europarl.europa.eu/rss/doc/press-releases/en.xml returns 403 to scripts (2026-11-03) |
| noyb | noyb.eu | https://noyb.eu/en/rss | high | Complaints and cases against big tech |
| EDRi | edri.org | https://edri.org/feed/ | medium | Digital rights advocacy, policy analysis |
| Euractiv (Tech) | euractiv.com/sections/tech | https://www.euractiv.com/feed/ | high | EU policy newsroom. Section feed returns 403, the site-wide feed works and links to rapporteur.com. Filter on tech |
| Politico Europe (Tech) | politico.eu/section/technology | https://www.politico.eu/section/technology/feed/ | high | |
| EUobserver | euobserver.com | https://euobserver.com/feed | high | |
| The Register | theregister.com | https://www.theregister.com/headlines.atom | medium | Good on cloud/sovereignty, opinionated |
| Computer Weekly | computerweekly.com | https://www.computerweekly.com/rss/All-Computer-Weekly-content.xml | medium | European cloud and procurement |
| heise online | heise.de | https://www.heise.de/rss/heise-atom.xml | high | German, translate |
| netzpolitik.org | netzpolitik.org | https://netzpolitik.org/feed/ | medium | German, translate |
| Tweakers | tweakers.net | https://tweakers.net/feeds/mixed.xml | high | Dutch, translate |
| NOS Tech | nos.nl/nieuws/tech | https://feeds.nos.nl/nosnieuwstech | high | Dutch, translate |
| Bert Hubert | berthub.eu/articles | https://berthub.eu/articles/index.xml | medium | Dutch and English. Analysis and opinion on digital autonomy, cloud dependence and Dutch government IT. Use as a lead, cite primary sources for facts. Added 2026-11-03 |
| Le Monde Informatique | lemondeinformatique.fr | https://www.lemondeinformatique.fr/flux-rss/thematique/toutes-les-actualites/rss.xml | medium | French, translate |
| Sifted | sifted.eu | https://sifted.eu/feed | medium | European startups and funding |
| TechCrunch (Europe) | techcrunch.com | https://techcrunch.com/feed/ | medium | Filter on EU. The Europe tag feed (/tag/europe/feed/) stopped at 2026-05-20 |

## Search queries (Jina search, last 7 days)

- digital sovereignty Europe
- European cloud provider
- EU alternative to Microsoft / Google / AWS
- CLOUD Act Europe data
- GDPR fine
- Digital Markets Act
- Digital Services Act enforcement
- EU Data Act
- EU-US Data Privacy Framework
- AI Act enforcement
- government leaves Microsoft 365
- open source public sector Europe

## Reddit (Reddit MCP, top of the week)

- r/BuyFromEU
- r/europe (filter: tech, privacy, sovereignty)
- r/privacy
- r/degoogle
- r/eutech

## Our own signals

- Google Search Console rising queries (GSC MCP), last 28 days vs previous.
- Services in `content/services` (any news about a listed service is relevant).
- `knowledge/stories` with `status: active` (follow-ups).

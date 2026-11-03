# Watchlist

What `/news-scan` monitors. EU focus: digital sovereignty, privacy, competition and the European tech market, plus anything that affects the services we list. Edit freely. The scan skill reads this file every run.

`feed:` values marked `verify` are guesses. On first use, `/news-scan` checks them and replaces them with the working feed URL (or `none`, in which case it uses a site search instead).

## Publishers

| Publisher | Site | Feed | Reliability | Notes |
|---|---|---|---|---|
| European Commission press corner | ec.europa.eu/commission/presscorner | verify | high | Filter: digital, competition, data |
| European Data Protection Board | edpb.europa.eu | verify | high | Decisions, guidelines, fines |
| Court of Justice of the EU | curia.europa.eu | verify | high | Press releases on data/competition rulings |
| European Parliament press | europarl.europa.eu/news | verify | high | Votes on digital files |
| noyb | noyb.eu | verify | high | Complaints and cases against big tech |
| EDRi | edri.org | verify | medium | Digital rights advocacy, policy analysis |
| Euractiv (Tech) | euractiv.com/sections/tech | verify | high | EU policy newsroom |
| Politico Europe (Tech) | politico.eu/section/technology | verify | high | |
| EUobserver | euobserver.com | verify | high | |
| The Register | theregister.com | verify | medium | Good on cloud/sovereignty, opinionated |
| Computer Weekly | computerweekly.com | verify | medium | European cloud and procurement |
| heise online | heise.de | verify | high | German, translate |
| netzpolitik.org | netzpolitik.org | verify | medium | German, translate |
| Tweakers | tweakers.net | verify | high | Dutch, translate |
| NOS Tech | nos.nl/nieuws/tech | verify | high | Dutch, translate |
| Bert Hubert | berthub.eu/articles | https://berthub.eu/articles/index.xml | medium | Dutch and English. Analysis and opinion on digital autonomy, cloud dependence and Dutch government IT. Use as a lead, cite primary sources for facts. Added 2026-11-03 |
| Le Monde Informatique | lemondeinformatique.fr | verify | medium | French, translate |
| Sifted | sifted.eu | verify | medium | European startups and funding |
| TechCrunch (Europe) | techcrunch.com | verify | medium | Filter on EU |

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

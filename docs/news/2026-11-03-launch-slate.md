# News launch slate: the first five articles

Prepared 2026-11-03. Research and ranking only, no articles written. Scores follow `.claude/skills/news-pick/SKILL.md`: `heat × relevance × freshness × development`. Heat for existing stories comes from `knowledge/graph.json` (before today's new notes were indexed). For proposed stories it is computed with the same formula (`reliability weight × (1 − age/30)` per source, high 3, medium 2) from the sources listed. Every fact below cites a knowledge claim or a page read today.

New source notes added today (not yet indexed, `pnpm knowledge:index` still to run):

- `2026-11-03-404media-proton-ai-reckoning` (high)
- `2026-11-03-404media-proton-ceo-cancels-reinterviews` (high)
- `2026-11-03-kamerbrief-belastingdienst-m365-on-premises` (high, primary)
- `2026-11-03-register-dutch-tax-office-drops-m365` (medium)
- `2026-11-03-noyb-council-omnibus-ai-training` (high, advocacy, attributed)
- `2026-11-03-netzpolitik-council-data-omnibus` (medium)
- `2026-11-03-virtualizationreview-custom-gpt-retirement` (medium)
- `2026-11-03-dfa-newsletter-commission-agenda-11-november` (medium)

## The slate at a glance

| Rank | Working title | Type | Story | Why now | Score |
|---|---|---|---|---|---|
| 1 | Leaked messages show Proton's CEO pushing AI over security checks. What it means if you use Proton | news | `proton-ai-push-security-concerns` (proposed) | 404 Media reports 29 and 30 Oct, heise 3 Nov | 63.8 |
| 2 | Social app builders ask the EU for a right to take your network with you | news | `eu-digital-fairness-act-social-switching` | Digital Fairness Act on the Commission's provisional agenda for 11 Nov. Draft exists | 39.4 |
| 3 | Six German states and the Dutch tax office drop US office clouds, while Merz backs Google for spies | analysis | `european-public-sector-leaves-us-software` | Germany's Digital Summit in Berlin: Merz spoke on 2 Nov, the school deal was reported on 3 Nov | 35.8 |
| 4 | OpenAI switches off custom GPTs on 11 December. Your options, including leaving | news | `openai-custom-gpt-retirement` (proposed) | Fixed date 11 Dec 2026 | 23.6 |
| 5 | EU governments back AI training on your data without consent. What changes, and what you can switch off today | analysis | `eu-digital-omnibus-gdpr-changes` (proposed) | Council position agreed 21 Oct | 24.4 |

Items 4 and 5 are within 4% of each other. Item 4 ranks higher because it has a fixed date and a migration guide behind it.

Mix: three news, two analysis. Subjects: one company the site recommends (Proton), one US company (OpenAI), one consumer law in preparation (DFA), one data protection law in negotiation (GDPR omnibus), one public-sector story across two countries.

---

## 1. Proton's AI push and the security question

- **Working title:** Leaked messages show Proton's CEO pushing AI over security checks. What it means if you use Proton
- **Type:** news, 450-600 words
- **Story:** proposed `proton-ai-push-security-concerns`. Entities `[proton]`. Services `proton-mail`, `proton-drive`, `proton-lumo`. Categories `email`, `storage`.
- **Why now:** 404 Media published its investigation on 29 October [[2026-11-03-404media-proton-ai-reckoning#c1]]. On 30 October Andy Yen cancelled the planned AI "re-interviews" [[2026-11-03-404media-proton-ceo-cancels-reinterviews#c1]]. heise covered his apology and promises on 3 November [[2026-11-03-heise-proton-slack-leak#c6]] [[2026-11-03-heise-proton-slack-leak#c7]]. Proton has promised to publish how it reviews code and uses AI. heise's report gives no date for that, which leaves room for a natural follow-up.
- **Angle:** What the reporting says and what it doesn't. It describes internal pressure to ship AI-written code faster, with security testing waved off [[2026-11-03-404media-proton-ai-reckoning#c2]] [[2026-11-03-404media-proton-ai-reckoning#c3]]. The readable reporting describes no breach of user data. What Proton promised [[2026-11-03-heise-proton-slack-leak#c7]], and what to watch for.
- **Reader action:** Proton Mail and Proton Drive listings (`/services/eu/proton-mail`, `/services/eu/proton-drive`), the email category (`/services/email`) with the two EU-registered options Tuta and mailbox.org (both `region: eu`), the storage category (`/services/storage`) with Nextcloud. The `gmail-to-protonmail` guide stays relevant for readers who stay with Proton.
- **Sources:**
  - 404 Media, 29 Oct (high, paywalled after the opening): sourcing, the "loser thinking" messages, re-interviews, the spokesperson not disputing the reporting. [[2026-11-03-404media-proton-ai-reckoning#c1]] to `#c8`
  - 404 Media, 30 Oct (high, paywalled): re-interviews cancelled. [[2026-11-03-404media-proton-ceo-cancels-reinterviews#c1]] [[2026-11-03-404media-proton-ceo-cancels-reinterviews#c2]]
  - heise, 3 Nov (high): Yen's apology on r/ProtonMail, his promises, the CTO's manifesto, the 90% AI code figure from a meeting recording. [[2026-11-03-heise-proton-slack-leak#c4]] [[2026-11-03-heise-proton-slack-leak#c5]] [[2026-11-03-heise-proton-slack-leak#c6]] [[2026-11-03-heise-proton-slack-leak#c7]]
- **Photo idea:** Geneva, where Proton has its head office (Plan-les-Ouates, per `content/services/proton-mail/en.md`): an openly licensed (CC BY or CC0) view of the city. A photo of Proton's own building under those licences is unlikely. Openverse timed out today, so nothing is checked. Fallback: text header.
- **Doubts and gaps:**
  - **Conflict of interest.** Proton Mail and Proton Drive are the site's only affiliate links, and they are the `recommendedAlternative` for Gmail and Google Drive. The article must meet the same bar as one about a US company (evidence rule 9). The owner decides on a disclosure line.
  - Both 404 Media pieces are paywalled. Only their openings were read. Use heise for anything beyond that.
  - Two 404 Media claims are disputed in secondary coverage: tracking software on staff computers [[2026-11-03-404media-proton-ai-reckoning#c4]] and "the last year Proton will hire engineers" [[2026-11-03-404media-proton-ai-reckoning#c5]]. We have no note with Proton's denial. Attribute them to 404 Media or leave them out.
  - Yen's Reddit post was not read directly (the Reddit archive timed out). heise's account of it is the source.
  - Reports of users cancelling subscriptions (Cybernews, social posts) were not verified. Leave them out.
  - Don't imply a breach, and don't say Proton's encryption is weaker. Neither is in the sources.
  - Ingest logged 0 flags for this news. The owner may want a `flags.md` line for `proton-mail` and `proton-drive` so `/research` reviews their "Worth knowing" sections.
- **Score:** 63.8 = heat 8.1 (heise 3.0 + 404 Media 2.5 + 2.6) × relevance 3.5 (3+ services, email category, gmail-to-protonmail guide) × freshness 1.5 (never covered) × development 1.5 (high sources). Heat is high partly because three notes cover one week of reporting.

## 2. The Digital Fairness Act and portable followers (existing draft)

- **Working title:** Social app builders ask the EU for a right to take your network with you (as drafted in `content/articles/app-builders-ask-eu-for-portable-followers/en.md`)
- **Type:** news, 485 words
- **Story:** `eu-digital-fairness-act-social-switching` (existing)
- **Why now:** The Commission's agenda planning of 29 September puts a consumer package with the Digital Fairness Act on the College meeting of 11 November [[2026-11-03-dfa-newsletter-commission-agenda-11-november#c1]]. The date is indicative [[2026-11-03-dfa-newsletter-commission-agenda-11-november#c2]]. Rapporteur still reported it as due on 11 November on 3 November [[2026-11-03-euractiv-dfa-social-media-switching#c5]]. The coalition published its paper on 3 November [[2026-11-03-dfom-joint-position-paper#c1]].
- **Reader action:** Mastodon (`/services/eu/mastodon`, `region: eu`, the `recommendedAlternative` for X, Instagram and Facebook), Bluesky (`/services/eu/bluesky`, `eu-friendly`, US company), the social media category, the `x-to-bluesky` guide.
- **Sources:** Rapporteur (high) [[2026-11-03-euractiv-dfa-social-media-switching#c1]] [[2026-11-03-euractiv-dfa-social-media-switching#c8]], the coalition's position paper (medium) [[2026-11-03-dfom-joint-position-paper#c3]] [[2026-11-03-dfom-joint-position-paper#c10]], the DFA newsletter for the agenda (medium) [[2026-11-03-dfa-newsletter-commission-agenda-11-november#c1]].
- **Photo:** already in place: the Berlaymont, CC BY 2.0 (Euro Pictures, via Wikimedia Commons). The JPEG is 662 KB, about twice the size of the other article photos. Worth re-compressing.
- **Does the draft hold up?** Yes, with one fix. The sourcing is solid, /news-check passed 19 claims, and it is fair about the Bluesky link (a Bluesky PBC builder signed, the standard starts from the AT Protocol) and about Mastodon's smaller audience. Points to fix or decide:
  - "The Commission is due to present that proposal on 11 November" states an indicative date as fixed. Suggested: "is expected to present ... on 11 November, according to its provisional agenda".
  - The piece expires on 11 November. Publish it before then, or rewrite it as a follow-up once the proposal is out.
  - It gives only the coalition's side. That is fine for a short news piece, but the follow-up should give the Commission's text.
- **Score:** 39.4 = heat 5 × relevance 3.5 (4 services, social media category, x-to-bluesky guide) × freshness 1.5 (never covered before this draft) × development 1.5. Filing the draft set `last_covered` to today, so the story now scores 5.3 for `/news-pick` (freshness 0.2) until 10 November.

## 3. Analysis: who gets to say "sovereign"?

- **Working title:** Six German states and the Dutch tax office drop US office clouds, while Merz backs Google for spies
- **Type:** analysis, 800-1,100 words
- **Story:** `european-public-sector-leaves-us-software` (existing). The text also covers `german-government-google-cloud`. The Dutch decision isn't in either story's timeline yet: `/news-ingest` should add it, because this run does not edit stories.
- **Why now:** On the sidelines of Germany's Digital Summit in Berlin (heise reported the deal on 3 November), six states signed up for a Nextcloud-based school platform run by IONOS in German data centres [[2026-11-03-heise-nextcloud-ionos-school-platform#c1]] [[2026-11-03-heise-nextcloud-ionos-school-platform#c2]] [[2026-11-03-nextcloud-six-states-school-cloud#c5]]. At the same summit, Chancellor Merz defended the intelligence services' plan for an offline cloud with Google [[2026-11-03-heise-merz-google-cloud-sovereign#c3]] [[2026-11-03-heise-merz-google-cloud-sovereign#c4]]. A month earlier, the Dutch Tax Administration, Customs and Benefits Agency dropped Microsoft 365 for their own servers and European open source [[2026-11-03-kamerbrief-belastingdienst-m365-on-premises#c1]] [[2026-11-03-kamerbrief-belastingdienst-m365-on-premises#c3]].
- **Angle:** Three governments, three meanings of "sovereign": open source in German data centres, on-premises servers that still run some Microsoft software, and a US hyperscaler's air-gapped cloud. What each choice says about who controls the data, and what a household can borrow from it.
- **Reader action:** Nextcloud (`/services/eu/nextcloud`, the software the six states chose), the storage category (`/services/storage`), the `google-drive-to-pcloud` guide.
- **Sources:**
  - heise on the school platform (high) [[2026-11-03-heise-nextcloud-ionos-school-platform#c4]] [[2026-11-03-heise-nextcloud-ionos-school-platform#c6]], Nextcloud's announcement (medium) [[2026-11-03-nextcloud-six-states-school-cloud#c3]]
  - heise on Merz (high) [[2026-11-03-heise-merz-google-cloud-sovereign#c5]] [[2026-11-03-heise-merz-google-cloud-sovereign#c7]] [[2026-11-03-heise-merz-google-cloud-sovereign#c8]]
  - The Dutch letter to parliament, 5 Oct (high, primary) [[2026-11-03-kamerbrief-belastingdienst-m365-on-premises#c2]] [[2026-11-03-kamerbrief-belastingdienst-m365-on-premises#c4]] [[2026-11-03-kamerbrief-belastingdienst-m365-on-premises#c6]]
  - The Register for the ICT review board's findings (medium) [[2026-11-03-register-dutch-tax-office-drops-m365#c1]] [[2026-11-03-register-dutch-tax-office-drops-m365#c2]]
- **Photo idea:** the Federal Chancellery (Bundeskanzleramt) in Berlin, which has many photos on Wikimedia Commons. Check for CC BY or CC0, since many are CC BY-SA, which the Openverse filter excludes. Alternative: a Belastingdienst office building. Not checked today (Openverse timed out).
- **Doubts and gaps:**
  - Schools are not obliged to use the platform, and there are no adoption numbers [[2026-11-03-nextcloud-six-states-school-cloud#c3]].
  - No signed Google contract is confirmed (open question on `german-government-google-cloud`). The point that no US cloud runs long without vendor updates is heise's, so attribute it.
  - The Dutch tax office reuses existing licences and runs software on its own servers [[2026-11-03-kamerbrief-belastingdienst-m365-on-premises#c4]]. Write "drops Microsoft 365's cloud", not "leaves Microsoft".
  - The Dutch decision is four weeks old. Use it as context, not as the news.
  - The reader action is indirect. "What this means for you" has to be concrete: Nextcloud from a hosted provider, with its trade-offs from the listing.
- **Score:** 35.8 = heat 5.3 (5 from the graph + Dutch letter 0.1 + The Register 0.2) × relevance 3.0 (nextcloud, google-drive, storage category, google-drive-to-pcloud guide) × freshness 1.5 × development 1.5.

## 4. OpenAI retires custom GPTs on 11 December

- **Working title:** OpenAI switches off custom GPTs on 11 December. Your options, including leaving
- **Type:** news, 450-600 words
- **Story:** proposed `openai-custom-gpt-retirement`. Entities `[openai, mistral-ai]`. Services `chatgpt`, `mistral-le-chat`, `proton-lumo`. Category `artificial-intelligence`.
- **Why now:** Custom GPTs are scheduled to retire on 11 December 2026, and GPT pages become inaccessible then [[2026-11-03-openai-custom-gpt-retirement-faq#c1]] [[2026-11-03-openai-custom-gpt-retirement-faq#c2]]. OpenAI announced this on 11 September [[2026-11-03-virtualizationreview-custom-gpt-retirement#c1]]. People who use someone else's GPT cannot migrate it and don't automatically get its replacement [[2026-11-03-openai-custom-gpt-retirement-faq#c7]]. That is the consumer angle.
- **Angle:** Every GPT owner has to act before 11 December anyway. What carries over to OpenAI's plugins, what doesn't [[2026-11-03-virtualizationreview-custom-gpt-retirement#c4]], and how the same instructions and files move to an EU assistant instead.
- **Reader action:** the `chatgpt-to-mistral` guide (steps "Save your GPTs and project files" and "Rebuild your GPTs as Skills and your projects as Projects"), the Quit ChatGPT landing page, Mistral Vibe (`/services/eu/mistral-le-chat`, the `recommendedAlternative` for ChatGPT, Claude and Gemini), the AI category.
- **Sources:** OpenAI's retirement FAQ (high) [[2026-11-03-openai-custom-gpt-retirement-faq#c3]] [[2026-11-03-openai-custom-gpt-retirement-faq#c4]] [[2026-11-03-openai-custom-gpt-retirement-faq#c6]], Virtualization Review (medium) [[2026-11-03-virtualizationreview-custom-gpt-retirement#c3]] [[2026-11-03-virtualizationreview-custom-gpt-retirement#c5]], Mistral's Vibe launch post on skills (medium) [[2026-11-03-mistral-vibe-agent-launch#c8]]. Optional context: Mistral published Large 4's weights on 30 Oct [[2026-11-03-lmi-mistral-large-4-open-weights#c1]].
- **Photo idea:** OpenAI's San Francisco office (Pioneer Building) or Mistral AI's Paris office. Openly licensed photos of either are uncertain. Not checked today. Fallback: text header.
- **Doubts and gaps:**
  - **Blocker:** the `chatgpt-to-mistral` guide is `draft: true`. Approve it first, or the article's main link is missing in production.
  - OpenAI says timing may vary by account and workspace [[2026-11-03-virtualizationreview-custom-gpt-retirement#c2]]. Write "scheduled to retire".
  - The score understates the item. The FAQ has no date, so the note uses its fetch date. The real announcement (11 Sep) is outside the heat window, and the formula doesn't reward an upcoming deadline. It is ranked on the date, not on heat.
  - Don't present Mistral Skills as a one-to-one replacement for GPTs. Check against the guide's sourced steps.
  - Two AI items in one week (with item 5): run them apart.
- **Score:** 23.6 = heat 3.0 (OpenAI FAQ) × relevance 3.5 (chatgpt, mistral-le-chat, proton-lumo, AI category, chatgpt-to-mistral guide) × freshness 1.5 × development 1.5.

## 5. Analysis: the GDPR omnibus and AI training on your data

- **Working title:** EU governments back AI training on your data without consent. What changes, and what you can switch off today
- **Type:** analysis, 700-1,000 words
- **Story:** proposed `eu-digital-omnibus-gdpr-changes`. Entities `[european-commission]`. Services `chatgpt`, `mistral-le-chat`, `instagram`, `facebook`. Categories `artificial-intelligence`, `social-media`.
- **Why now:** Member states agreed their negotiating position on the data part of the Digital Omnibus on 21 October [[2026-11-03-netzpolitik-council-data-omnibus#c1]]. It would allow AI training on personal data on the basis of legitimate interest, with the right to object kept [[2026-11-03-netzpolitik-council-data-omnibus#c3]]. Parliament's position is expected in February 2027 [[2026-11-03-netzpolitik-council-data-omnibus#c2]].
- **Angle:** What member states agreed, what is still open, and the one tool that survives in every version: your right to object. Use it now, at US and EU services alike.
- **Reader action:** ChatGPT's data controls ([[2026-11-03-openai-chatgpt-data-controls-help]]). Mistral Vibe, which trains on users' chats unless they opt out [[2026-11-03-mistral-help-training-opt-out#c1]] [[2026-11-03-mistral-help-training-opt-out#c3]] (also a step in the `chatgpt-to-mistral` guide). The AI category. Mastodon for readers leaving Meta's platforms.
- **Sources:**
  - netzpolitik.org (medium): the position, the vote, next steps, cookie changes. [[2026-11-03-netzpolitik-council-data-omnibus#c4]] [[2026-11-03-netzpolitik-council-data-omnibus#c6]] [[2026-11-03-netzpolitik-council-data-omnibus#c7]]
  - noyb (high, advocacy, attribute every reading): [[2026-11-03-noyb-council-omnibus-ai-training#c2]] [[2026-11-03-noyb-council-omnibus-ai-training#c3]] [[2026-11-03-noyb-council-omnibus-ai-training#c6]] [[2026-11-03-noyb-council-omnibus-ai-training#c8]]
  - Mistral's opt-out help page (high) and OpenAI's data controls page (high), both already in the graph.
  - **Missing:** the Council's own press release and text (ST 14756/26). consilium.europa.eu returned 403 to our fetcher. Someone has to read it before writing.
- **Photo idea:** the Europa building in Brussels, seat of the Council of the EU. Check for CC BY or CC0 on Commons. Not checked today.
- **Doubts and gaps:**
  - The sources conflict. noyb says the Council would treat pseudonymised data as generally outside the GDPR [[2026-11-03-noyb-council-omnibus-ai-training#c5]]. netzpolitik says the definition stays and pseudonymisation rules are added [[2026-11-03-netzpolitik-council-data-omnibus#c4]]. Only the Council text settles it.
  - It is a negotiating position, not law. Say what is settled and what isn't, with dates.
  - Meta's objection form: another agent added [[2026-11-03-meta-ai-eu-training-announcement]] today (Meta newsroom, medium). It says EU users can object to training on their public data through a form linked from notifications [[2026-11-03-meta-ai-eu-training-announcement#c3]]. That is Meta's own description, so attribute it, and check the form's current location before linking.
  - The EU alternative also opts users in by default. Say so (evidence rule 9).
- **Score:** 24.4 = heat 3.1 (noyb 1.9 + netzpolitik 1.2) × relevance 3.5 (4 services, AI category, chatgpt-to-mistral guide) × freshness 1.5 × development 1.5.

---

## Also considered

| Candidate | Score | Why dropped |
|---|---|---|
| `cjeu-ai-press-publisher-case`: Advocate General on AI and press publishers (3 Nov) | 13.5 | Non-binding opinion, and the case questions were advised inadmissible [[2026-11-03-euractiv-ag-opinion-ai-news-reuse#c3]]. Nothing for a reader to do. Revisit when the court rules. |
| `german-government-google-cloud`: Merz and Google for intelligence services | 6.5 | Folded into item 3. On its own it has no service or category link. |
| `eu-kids-act-social-media-age-limits`: Commission pauses national bans (29 Oct) | 8.4 | Matters, but nothing to switch to. Better once the Council and Parliament agree on age checks. |
| Organic Maps passes 12 million installs (3 Nov) | 11.3 | Self-reported figure from the company [[2026-11-03-organic-maps-12m-installs#c1]]. Too thin for a launch article. |
| Mistral publishes Large 4 weights (30 Oct) | 9.6 | Of interest to developers and administrations [[2026-11-03-lmi-mistral-large-4-open-weights#c4]], not to everyday users. One line of context in item 4. |
| Microsoft's Irish data centres host an Israeli permit app (3 Nov) | 6.8 | Paywalled beyond the opening, a single campaign report, and no reader action. |
| AWS and Azure DMA gatekeeper designation | not scored | Secondary reports expect a decision around November, unconfirmed. Cloud infrastructure has no listing on the site. Revisit when the Commission decides. |
| The DFA proposal itself (11 Nov) | not scored | Hasn't happened yet. It is the natural follow-up to item 2. |
| Chat control (CSAR) trilogues | not scored | Advocacy trackers report no deal and a possible round on 8 December. Not verified. Watch it, given the `whatsapp-to-signal` guide. |
| ChatGPT ads in Europe (from August), WhatsApp ads in the EU (early 2026), Google's €890M DMA fine (July) | not scored | Outside the window. Search results only, not ingested. |
| Proton's planned "Easy Switch from Google Drive" | not scored | A plan with no date [[2026-11-03-proton-autumn-winter-2026-roadmap#c2]]. Also overlaps with item 1. |

## Suggested publishing order (one per weekday)

Assumes the section launches Wednesday 4 November. If launch slips, items 1, 3 and 5 lose value fastest, and item 2 must still run before 11 November.

| Day | Item | Reason for the slot |
|---|---|---|
| Wed 4 Nov | 2. Portable followers (DFA) | Already drafted and checked. Has to run before the 11 November proposal. |
| Thu 5 Nov | 1. Proton | A week after the reporting. Highest score. Shows early that the site covers its own recommendations critically. |
| Fri 6 Nov | 3. Public sector analysis | Still within a week of the Digital Summit. |
| Mon 9 Nov | 5. GDPR omnibus analysis | Already 12 days old. Needs the Council text read first. |
| Tue 10 Nov | 4. Custom GPT retirement | Not perishable before December. Gives the `chatgpt-to-mistral` guide time for approval. Still a month before the deadline. |
| Wed 11 Nov | Follow-up: the DFA proposal | Only if the Commission presents it. Needs the owner to allow it within 7 days of item 2 (a proposal is a step, not a decision, so the big-news override doesn't apply cleanly). |

Alternative: lead with Proton on launch day for the strongest honesty signal, and run the DFA piece on Thursday 5 November.

## Open questions for the owner

1. **Proton at launch.** Proton Mail and Proton Drive are the only affiliate partners and the recommended alternative for Gmail and Google Drive. Run item 1 at launch? Add a disclosure line in the article? Add `flags.md` lines so `/research` re-checks both listings?
2. **The DFA draft.** Approve it with the softened date wording? Allow a follow-up on 11 November despite the 7-day freshness rule?
3. **Guide first.** Approve `content/guides/chatgpt-to-mistral` before item 4 is written.
4. **The omnibus.** Fine to run an analysis on a Council position that Parliament takes up around February 2027? Someone has to read the Council text, which our fetcher couldn't reach.
5. **Knowledge bookkeeping.** Three proposed stories (`proton-ai-push-security-concerns`, `openai-custom-gpt-retirement`, `eu-digital-omnibus-gdpr-changes`) and the Dutch tax office decision in `european-public-sector-leaves-us-software` need `/news-ingest`. This run only added source notes and did not run `pnpm knowledge:index`.
6. **Photos.** Openverse timed out today, so none of the photo ideas are checked. Items 1 and 4 may need the text-header fallback.

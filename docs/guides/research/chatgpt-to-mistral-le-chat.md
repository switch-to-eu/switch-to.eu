# Research brief: ChatGPT to Mistral Vibe (formerly Le Chat)

- Guide slug (proposed): `chatgpt-to-mistral-le-chat` (matches the current service slug; see the naming note below)
- Source service: `services/chatgpt` · Target service: `services/mistral-le-chat` · Category: `artificial-intelligence`
- Researched: 2026-11-03. All claims below cite knowledge source notes in `knowledge/sources/2026/11/`.
- No guide exists yet for `sourceService: chatgpt` or `targetService: mistral-le-chat`.

## Headline findings

1. **The product is now called Vibe. "Le Chat" survives only as "formerly" and "ex-".** On 2026-05-28 Mistral announced that Le Chat is now Vibe, with conversations, settings and plans carried over [[2026-11-03-mistral-vibe-agent-launch#c1]]. Mistral's own pages all use the new name: the product page title is "Mistral Vibe (formerly Le Chat)" and the old `/products/le-chat` URL redirects to it [[2026-11-03-mistral-vibe-product-page#c1]]; the help centre has an article "Le Chat is now Vibe" [[2026-11-03-mistral-help-le-chat-is-now-vibe#c1]]; both app stores list "Vibe by Mistral (ex-Le Chat)" [[2026-11-03-vibe-app-store-listing#c1]] [[2026-11-03-vibe-google-play-listing#c1]]; the pricing page says Vibe and mentions Le Chat only in the student terms [[2026-11-03-mistral-pricing-page#c4]]. The URL is still chat.mistral.ai [[2026-11-03-mistral-help-le-chat-is-now-vibe#c3]]. A "Chat" mode named Vibe Chat existed after the rename [[2026-11-03-mistral-help-le-chat-is-now-vibe#c2]], but since 2026-09-22 Chat and Work are merged into one experience for self-serve accounts [[2026-11-03-mistral-docs-vibe-overview#c2]] [[2026-11-03-mistral-docs-vibe-overview#c3]]. **Recommendation:** title the guide "Switching from ChatGPT to Mistral Vibe (formerly Le Chat)", say "Vibe" in the body, and keep "Le Chat" in the description, keywords and first paragraph, because Apple and Google still show "ex-Le Chat" and people still search for it. The service listing `services/mistral-le-chat` (name "Mistral Le Chat") needs the same rename; that's the main agent's call.
2. **The features a ChatGPT user would rebuild all changed name in September 2026.** Agents became Skills, Memories became the Knowledge Base, Think mode became a fast/think toggle, Deep Research became a Skill [[2026-11-03-mistral-docs-choose-work-code#c2]] [[2026-11-03-mistral-docs-choose-work-code#c3]] [[2026-11-03-mistral-docs-choose-work-code#c5]] [[2026-11-03-mistral-release-notes-vibe#c3]] [[2026-11-03-mistral-release-notes-vibe#c4]]. Every competing guide and our own listing use the old names. On the ChatGPT side, custom GPTs retire on 2026-12-11 and personal accounts can no longer create new ones [[2026-11-03-openai-custom-gpt-retirement-faq#c1]] [[2026-11-03-openai-gpts-help#c2]]. A ChatGPT user with GPTs has to move them somewhere before that date anyway.
3. **No import of chats or memories is documented today.** In September 2025 Mistral announced "fast import of your memories from ChatGPT" in Le Chat Memories [[2026-11-03-mistral-memories-launch-2025#c2]]. The current Knowledge Base and legacy Memories docs describe no import at all [[2026-11-03-mistral-docs-knowledge-base#c2]] [[2026-11-03-mistral-docs-memories-legacy#c2]]. What the docs do support: saving facts by telling Vibe to "remember" them [[2026-11-03-mistral-docs-knowledge-base#c2]], and uploading JSON files to a Library [[2026-11-03-mistral-docs-libraries#c3]]. Whether the 2025 import button still exists needs a hands-on check.
4. **Training is on by default at Mistral too.** Mistral's help centre says Vibe input and output train its models by default unless you opt out [[2026-11-03-mistral-help-training-data-use#c1]] [[2026-11-03-mistral-help-training-opt-out#c1]]. Our "Quit ChatGPT" landing page says Mistral does not use chats to improve its models (`content/landing-pages/quit-chatgpt/en.md` line 45). That is wrong as written. Whether Free users can opt out is unclear: the help article gives the opt-out to "Vibe" users without a plan restriction [[2026-11-03-mistral-help-training-opt-out#c1]], but the pricing table writes "Opt-out" only for paid plans [[2026-11-03-mistral-pricing-page#c8]]. Test on a Free account.
5. **"EU-hosted" needs a footnote.** Mistral says data is hosted in the EU by default [[2026-11-03-mistral-help-data-storage-location#c1]], but its subprocessor list names US companies for web search (Brave) and image generation (Black Forest Labs) [[2026-11-03-mistral-trust-center-subprocessors#c5]] [[2026-11-03-mistral-trust-center-subprocessors#c6]], and EU-region infrastructure from Microsoft and Google [[2026-11-03-mistral-trust-center-subprocessors#c2]] [[2026-11-03-mistral-trust-center-subprocessors#c3]]. Only 10 of 25 entries were readable [[2026-11-03-mistral-trust-center-subprocessors#c1]].

## 1. Target queries

**Search Console (last 3 months, `Queries.csv`).** No query mentions ChatGPT, OpenAI, Mistral, Le Chat or Vibe. The closest:

| Query | Clicks | Impressions | Position |
|---|---|---|---|
| eu-based ai data services | 0 | 18 | 15.83 |
| european ai tools | 0 | 1 | 9 |
| european alternatives ai | 0 | 1 | 28 |
| claude ai eu | 0 | 1 | 11 |
| is claude european | 0 | 1 | 51 |

At page level, `/en/services/non-eu/claude` had 157 impressions at position 9.0 and `/en/services/artificial-intelligence` 24 impressions at 14.25. Neither the ChatGPT nor the Mistral service page appears in `Pages.csv`. This guide targets demand we don't rank for yet. No volume data available.

**Queries people type (seen in today's search results and titles):**
- "switch from ChatGPT to Le Chat", "ChatGPT to Mistral", "Le Chat vs ChatGPT" (also French: "passer de ChatGPT au Chat de Mistral")
- "export ChatGPT data", "export ChatGPT conversations", "export ChatGPT memories", "transfer ChatGPT memory"
- "quit ChatGPT", "delete ChatGPT account" (the #QuitGPT wave of March 2026 drove a lot of these guides [[2026-11-03-decrypt-quitgpt-data-guide#c2]])
- "European ChatGPT alternative", "Mistral Vibe" (new name, little content yet)

Suggested primary keyword: "ChatGPT to Le Chat" / "switch from ChatGPT to Mistral". Secondary: "export ChatGPT memories", "delete ChatGPT account", "Mistral Vibe", "European ChatGPT alternative".

## 2. Competing guides

No dedicated ChatGPT-to-Mistral migration guide turned up in English, French, German or Dutch searches. The five most relevant pages are ChatGPT exit guides (aimed at Claude or Lumo), a memory-transfer guide and a French Le Chat starter guide.

| # | Guide | Publisher, date | Length | H2 outline | Method | Affiliate links | Outdated or wrong |
|---|---|---|---|---|---|---|---|
| 1 | [Before You Quit ChatGPT, Do This to Take Your Data With You](https://decrypt.co/359976/quitgpt-delete-chatgpt-data-privacy-guide) | Decrypt, 2026-03-04 | ~2,000 words | Step 1 Export / 2 Turn off training / 3 Review and export memories / 4 Delete memories / 5 Delete conversations / 6 Revoke connected apps / 7 Cancel subscription incl. app stores / 8 Privacy-portal deletion request / 9 Delete account | Exit checklist, target Claude | None seen (links to email-alias services) | Says to run a separate export inside each Custom GPT or Project; OpenAI's export page says nothing like that [[2026-11-03-openai-chatgpt-data-export-help#c2]]. Says OpenAI requires a login within the last 10 minutes; not in OpenAI's current deletion page [[2026-11-03-openai-chatgpt-delete-account-help#c3]]. Predates the GPT retirement. Best of the five on pitfalls. |
| 2 | [Still thinking of quitting ChatGPT? Make sure you do these 3 things first](https://www.techradar.com/ai-platforms-assistants/chatgpt/theres-no-going-back-still-thinking-of-quitting-chatgpt-make-sure-you-do-these-3-things-first) | TechRadar, 2026-03-11 | ~600 words | 1. Import memories into Claude / Export data / Delete chats | Claude's memory-import prompt, export, delete all chats | Site-wide affiliate disclosure | Claude only. Doesn't mention the training toggle or app-store subscriptions. |
| 3 | [How to delete your ChatGPT account](https://proton.me/blog/how-to-delete-chatgpt-account) | Proton, 2026-06-02 | ~1,300 words | How to delete (web, Privacy Portal, iOS, Android) / Before deleting (export, cancel subscription) / What happens after / Why delete / Choose an AI that respects privacy | Deletion walkthrough, ends with a Lumo pitch | No affiliate; self-promotion for its own AI | Accurate on deletion steps. Describes the export ZIP contents [[2026-11-03-proton-delete-chatgpt-account-guide#c1]]. Nothing on moving memories or GPTs. |
| 4 | [How to Transfer ChatGPT Memory to Claude, Gemini, or a New Chat](https://blog.memoryplugin.com/how-to-transfer-chatgpt-memory-to-another-chat-or-ai-model/) | MemoryPlugin, 2026-06-30 | ~1,700 words | How ChatGPT Memory works / Transfer to another ChatGPT chat / Transfer to another AI tool (Claude import, Gemini import, manual for the rest) / MemoryPlugin | Copy-a-prompt memory import; manual copy for tools without import | Sells its own browser extension throughout | Doesn't cover Mistral. Useful pattern: ask ChatGPT to list everything it knows, paste it elsewhere. |
| 5 | [Le Chat : le guide complet pour bien débuter](https://www.blogdumoderateur.com/le-chat-guide-complet-debuter-alternative-francaise-chatgpt/) (French) | Blog du Modérateur, 2025-02-10 | ~1,200 words | Qu'est-ce que Le Chat / Comment accéder / Formules / Fonctionnalités / Interface / Alternative viable ? / Meilleurs générateurs | Starter tour of Le Chat | None seen (tool directory at the end) | Old name. Says agents are built in "La Plateforme" (developer console); since September 2026 the equivalent is Skills inside Vibe [[2026-11-03-mistral-docs-skills#c2]]. Says the training opt-out is a Pro feature; the help centre now offers it to Vibe users generally [[2026-11-03-mistral-help-training-opt-out#c1]]. Pro €14.99 and Team €24.99 still match [[2026-11-03-mistral-pricing-page#c2]] [[2026-11-03-mistral-pricing-page#c3]]. |

Also read: Journal du Net "Faut-il passer de ChatGPT au Chat de Mistral ?" (2024-11-26, comparison, partly paywalled). It says Le Chat stores all data in Europe; Mistral's own wording is "by default", with US subprocessors for search and images [[2026-11-03-mistral-help-data-storage-location#c1]] [[2026-11-03-mistral-trust-center-subprocessors#c6]]. Sifted's article on the CNIL complaint was paywalled and unreadable.

**What they all cover (the minimum we need):** ChatGPT's export path (Settings > Data controls > Export), the 24-hour download link, deleting chats or the account, the 30-day deletion window. Decrypt and Proton add the app-store subscription trap. TechRadar and MemoryPlugin cover moving memories with a copy-paste prompt.

**What they miss or get wrong (where we win):**
- Nobody covers the Mistral side at all: where custom instructions go (Context > Instructions), how memories get in (tell Vibe to "remember"), what replaces a GPT (a Skill with a SKILL.md and files), what replaces a ChatGPT project (a Vibe Project).
- Nobody uses the name Vibe. Readers who land on chat.mistral.ai or the app store after reading an old guide will be confused.
- Nobody mentions the custom GPT retirement on 2026-12-11 [[2026-11-03-openai-custom-gpt-retirement-faq#c1]]. Saving GPT instructions and knowledge files is urgent for anyone who has GPTs.
- Nobody says that Mistral also trains on chats by default and how to switch that off on web and mobile [[2026-11-03-mistral-help-training-opt-out#c3]] [[2026-11-03-mistral-help-training-opt-out#c4]]. Our own landing page gets this wrong.
- Nobody warns that thumbs-up/down feedback is used for training on both sides, opt-out or not [[2026-11-03-openai-chatgpt-data-controls-help#c6]] [[2026-11-03-mistral-help-training-data-use#c3]].
- Nobody points out that Mistral's in-app Pro price is higher than the web price (€17.99 in the Dutch App Store [[2026-11-03-vibe-app-store-listing#c5]] vs €14.99 excluding tax on the web [[2026-11-03-mistral-pricing-page#c2]]). Needs a VAT check (open question 3).

## 3. Proposed outline

**Frontmatter**
- `title`: Switching from ChatGPT to Mistral Vibe (formerly Le Chat)
- `difficulty`: `beginner`. No file conversion is needed; everything is copy and paste plus settings. If the reader has many GPTs, it's more work but not harder.
- `timeRequired`: "45 minutes to 1 hour, plus up to 7 days for the ChatGPT export". Reason: request export 5 min, copy memories and custom instructions 10-15 min, save each GPT about 5-10 min, create Mistral account and install app 10 min, privacy settings 5 min, re-enter instructions and memories 10-15 min, cancel and delete OpenAI 5-10 min. OpenAI says exports can take up to 7 days [[2026-11-03-openai-chatgpt-data-export-help#c5]].

**intro** (100-150 words)
- Vibe is Mistral AI's assistant, called Le Chat until May 2026 [[2026-11-03-mistral-vibe-agent-launch#c1]]. Same address: chat.mistral.ai [[2026-11-03-mistral-help-le-chat-is-now-vibe#c3]].
- Mistral AI is a French company registered in Paris, and CNIL is the authority it names for complaints [[2026-11-03-mistral-privacy-policy#c1]] [[2026-11-03-mistral-privacy-policy#c7]]. Mistral says data is hosted in the EU by default [[2026-11-03-mistral-help-data-storage-location#c1]]. Attribute both.
- What carries over: your custom instructions, memories, GPT instructions and files, by hand. What doesn't: your chat history (keep it in the export).
- Pro is €14.99 a month excluding VAT [[2026-11-03-mistral-pricing-page#c2]]. ChatGPT prices: not read today (the pricing page renders prices client-side). Leave a ChatGPT price comparison out or check by hand.

**beforeYouStart** (50-100 words). What people wish they'd known:
- The app is called **Vibe** now, in the App Store and Google Play as "Vibe by Mistral (ex-Le Chat)" [[2026-11-03-vibe-app-store-listing#c1]] [[2026-11-03-vibe-google-play-listing#c1]].
- Request the ChatGPT export first. It can take up to 7 days, and the link dies 24 hours after it arrives [[2026-11-03-openai-chatgpt-data-export-help#c5]] [[2026-11-03-openai-chatgpt-data-export-help#c6]].
- If you have custom GPTs, copy them now. OpenAI retires them on 11 December 2026 [[2026-11-03-openai-custom-gpt-retirement-faq#c1]].
- Mistral can't import your ChatGPT chats as far as its docs show (open question 1). Your history stays in the export file.
- Mistral trains on your chats by default too. Switch it off before you paste anything personal (step 4).

**steps**

1. **Request your ChatGPT export.** Web: profile menu > Settings > Data controls > Export data > Export > Confirm export [[2026-11-03-openai-chatgpt-data-export-help#c2]]. Mobile: Settings > Data controls > Export data; the app may send you to the web [[2026-11-03-openai-chatgpt-data-export-help#c3]]. Not available in Business or Enterprise workspaces [[2026-11-03-openai-chatgpt-data-export-help#c1]]. The ZIP holds your chat history and account data [[2026-11-03-openai-chatgpt-data-export-help#c7]], including custom instructions [[2026-11-03-openai-chatgpt-custom-instructions-help#c4]]. Third-party guides name the files `conversations.json` and `chat.html` [[2026-11-03-decrypt-quitgpt-data-guide#c1]] [[2026-11-03-proton-delete-chatgpt-account-guide#c1]] (medium sources, verify in the ZIP). While in Data controls, turn off "Improve the model for everyone" [[2026-11-03-openai-chatgpt-data-controls-help#c2]].
2. **Copy your memories, custom instructions, GPTs and project instructions into a text file.** Memories: Settings > Personalization > Memory, or ask ChatGPT "what do you remember about me?" [[2026-11-03-openai-chatgpt-memory-help#c1]] [[2026-11-03-openai-chatgpt-memory-help#c2]]. Custom instructions: Settings > Personalization > Custom Instructions [[2026-11-03-openai-chatgpt-custom-instructions-help#c2]]. For each GPT you built: copy the instructions and download the knowledge files (a GPT has instructions, starters, knowledge, capabilities, apps or actions [[2026-11-03-openai-gpts-help#c3]]; exact editor path not read today, open question 6). Projects: copy the instructions from Project settings and download files from the project sources list [[2026-11-03-openai-chatgpt-projects-help#c2]] [[2026-11-03-openai-chatgpt-projects-help#c3]].
3. **Create your Mistral account and install the app.** Go to chat.mistral.ai [[2026-11-03-mistral-vibe-agent-launch#c3]]. iPhone/iPad: "Vibe by Mistral (ex-Le Chat)", iOS 16.4 or later [[2026-11-03-vibe-app-store-listing#c3]]. Android: package `ai.mistral.chat` [[2026-11-03-vibe-google-play-listing#c1]]. Plans: Free, Pro €14.99/month excl. VAT, Student €5.99/month for up to 12 months [[2026-11-03-mistral-pricing-page#c2]] [[2026-11-03-mistral-pricing-page#c4]]. If you subscribe, the in-app price is higher [[2026-11-03-vibe-app-store-listing#c5]] (verify with VAT, open question 3). No desktop app is listed (web, CLI, IDE, iOS, Android only [[2026-11-03-mistral-pricing-page#c7]]).
4. **Turn off model training at Mistral.** Web: admin.mistral.ai > Vibe (under Manage) > Privacy > turn off "Allow your interactions to be used to train our models" [[2026-11-03-mistral-help-training-opt-out#c3]]. App: Settings > Data & Account Controls > untick "Enable data sharing" [[2026-11-03-mistral-help-training-opt-out#c4]]. Uploaded documents count as input [[2026-11-03-mistral-help-training-opt-out#c5]]. Don't use thumbs up/down with a comment if you care: feedback is used on every plan [[2026-11-03-mistral-help-training-data-use#c3]]. (Free-plan availability: open question 2.)
5. **Add your custom instructions and memories.** Instructions: sidebar > Context > Instructions, pick a Tone, paste, save; they apply to new chats only [[2026-11-03-mistral-docs-custom-instructions#c1]] [[2026-11-03-mistral-docs-custom-instructions#c2]]. Memories: in a chat, tell Vibe "Remember that ..." for each fact [[2026-11-03-mistral-docs-knowledge-base#c2]], then check Context > Knowledge [[2026-11-03-mistral-docs-knowledge-base#c3]]. Health, religion or politics are not saved unless you turn on "Sensitive data in Knowledge" [[2026-11-03-mistral-docs-knowledge-base#c8]].
6. **Rebuild your GPTs as Skills and your projects as Projects.** Skill: Context > Skills > New Skill; title, a description that says when to use it, the GPT's instructions in the SKILL.md field, and the knowledge files attached [[2026-11-03-mistral-docs-skills#c2]]. Or paste the instructions into a chat and ask Vibe to "turn this into a Skill" [[2026-11-03-mistral-docs-skills#c3]]. Use it with `/` and the name [[2026-11-03-mistral-docs-skills#c4]] (the overview says `@` [[2026-11-03-mistral-docs-vibe-overview#c4]]; check which works, open question 7). Project: New Project next to the Projects header, then Customize for instructions and Upload files [[2026-11-03-mistral-docs-projects#c2]] [[2026-11-03-mistral-docs-projects#c3]]. For large document sets use a Library: up to 100 files at once, 100 MB each [[2026-11-03-mistral-docs-libraries#c2]].
7. **Cancel ChatGPT and delete your OpenAI account (optional, after checking the ZIP).** Cancel app-store subscriptions first; deleting the account doesn't stop Apple or Google billing [[2026-11-03-openai-chatgpt-delete-account-help#c2]]. Web: Settings > Account > Delete account, enter your email, type DELETE [[2026-11-03-openai-chatgpt-delete-account-help#c3]]; mobile: Settings > Data controls [[2026-11-03-openai-chatgpt-delete-account-help#c4]]. OpenAI deletes data within 30 days with legal exceptions; deletion also ends API access and can't be undone [[2026-11-03-openai-chatgpt-delete-account-help#c1]] [[2026-11-03-openai-chatgpt-delete-account-help#c7]]. Can't sign in? Use privacy.openai.com [[2026-11-03-openai-chatgpt-delete-account-help#c5]].

Optional extra step if the hands-on test passes (open question 4): **Make old chats searchable in Vibe** by uploading `conversations.json` to a Library. JSON is an accepted format and HTML is not [[2026-11-03-mistral-docs-libraries#c3]] [[2026-11-03-mistral-docs-libraries#c4]]. Warn that uploads count as training input unless opted out [[2026-11-03-mistral-help-training-opt-out#c5]]. Leave this out if the test fails.

**troubleshooting** (3-5 Q&A)
- *The export email never came.* Check spam and promotions, wait up to 7 days, request again if the link expired [[2026-11-03-openai-chatgpt-data-export-help#c9]].
- *I can't find Le Chat, Agents or Memories.* Le Chat is Vibe [[2026-11-03-mistral-help-le-chat-is-now-vibe#c1]]. Since September 2026, Agents are Skills and Memories are the Knowledge Base [[2026-11-03-mistral-docs-choose-work-code#c2]] [[2026-11-03-mistral-docs-choose-work-code#c5]]. Old memories moved into a knowledge topic [[2026-11-03-mistral-release-notes-vibe#c4]].
- *Vibe ignores something I told it to remember.* Retrieval is not deterministic; Vibe picks relevant entries per turn [[2026-11-03-mistral-docs-knowledge-base#c10]]. Put must-follow rules in custom instructions instead [[2026-11-03-mistral-docs-custom-instructions#c1]]. You can't edit an entry's text directly; ask Vibe to change it [[2026-11-03-mistral-docs-knowledge-base#c4]].
- *Code Interpreter or spreadsheets are missing.* Both are paid-plan features in Work [[2026-11-03-mistral-release-notes-vibe#c6]] [[2026-11-03-mistral-release-notes-vibe#c7]].
- *I'm still being charged for ChatGPT.* App Store and Google Play subscriptions must be cancelled in the store [[2026-11-03-openai-chatgpt-delete-account-help#c2]].

**outro** (50-100 words)
- Keep the ChatGPT ZIP somewhere safe: export can't restore deleted chats [[2026-11-03-openai-chatgpt-data-export-help#c8]], and after deletion there is no going back [[2026-11-03-openai-chatgpt-delete-account-help#c7]].
- Use Temporary Chat in Vibe for things you don't want stored [[2026-11-03-mistral-docs-vibe-overview#c5]].
- You can export your Vibe data any time at admin.mistral.ai/account/export [[2026-11-03-mistral-help-data-export#c2]], and delete the account in the Admin panel [[2026-11-03-mistral-help-delete-account#c1]].

## 4. missingFeatures

**Confirmed by an official source (evidence rule 1):**
- **Editing a saved memory by hand.** ChatGPT lets you edit the memory summary or a saved memory where those controls exist [[2026-11-03-openai-chatgpt-memory-help#c8]]. In Vibe's Knowledge Base you can't edit an entry's text directly; changes go through the model [[2026-11-03-mistral-docs-knowledge-base#c4]].
- **Zero data retention for chats.** Not a loss versus ChatGPT consumer plans, but worth stating in "Worth knowing": Mistral says ZDR is not available in Vibe on any plan [[2026-11-03-mistral-help-zero-data-retention#c2]].

That's a short list on purpose. Most gaps are "not listed", not confirmed.

**Not listed, check before claiming (beforeYouStart as "check that X works for you", or leave out):**
- Importing ChatGPT chat history: no import in Mistral's docs (Knowledge Base, Libraries, help centre) [[2026-11-03-mistral-docs-knowledge-base#c2]]. Absent from the docs, not confirmed absent.
- One-click import of ChatGPT memories: announced in 2025 [[2026-11-03-mistral-memories-launch-2025#c2]], not in today's docs.
- Desktop app for Windows or macOS: Mistral lists web, CLI, IDE and mobile only [[2026-11-03-mistral-pricing-page#c7]].
- Spoken voice conversations. ChatGPT's download page (https://chatgpt.com/download/, read 2026-11-03) says the mobile app lets you "have voice conversations". Vibe's Voice mode doc describes speech-to-text input [[2026-11-03-mistral-docs-voice-mode#c1]]; its "conversation mode" section was empty when read.
- Sharing a project with other people. ChatGPT offers project sharing on all plans including Free [[2026-11-03-openai-chatgpt-projects-help#c7]]. Vibe's Projects page doesn't mention sharing [[2026-11-03-mistral-docs-projects#c1]].
- Public sharing of Skills like the old GPT Store: Vibe lists Personal and Workspace Skills only [[2026-11-03-mistral-docs-skills#c5]]. Note that personal ChatGPT accounts can't publish new GPTs either [[2026-11-03-openai-gpts-help#c2]], so this may not be a loss.
- Code Interpreter and spreadsheets on the Free plan: paid-only at Mistral [[2026-11-03-mistral-release-notes-vibe#c6]]. We did not read what ChatGPT Free includes.
- Video generation: not listed on Mistral's pricing page.
- Custom-instructions character limit at Mistral: not stated [[2026-11-03-mistral-docs-custom-instructions#c5]]. ChatGPT allows 1,500 or 5,000 characters [[2026-11-03-openai-chatgpt-custom-instructions-help#c3]].

## 5. Open questions (test by hand before publishing)

1. **Memory import.** Does Context > Knowledge, or the guided onboarding interview [[2026-11-03-mistral-release-notes-vibe#c8]], offer an "import from ChatGPT" option today? If yes, document it and drop the manual "Remember that ..." route to a fallback.
2. **Training opt-out on Free.** Does a Free account see the "Allow your interactions to be used to train our models" toggle in admin.mistral.ai, and the "Enable data sharing" box in the app? The help article and the pricing table disagree [[2026-11-03-mistral-help-training-opt-out#c1]] [[2026-11-03-mistral-pricing-page#c8]]. This decides whether the guide can say "free users can opt out".
3. **Real price in euros.** What does Pro cost at web checkout with Dutch or German VAT? (€14.99 excl. tax [[2026-11-03-mistral-pricing-page#c2]]; €17.99 in the Dutch App Store [[2026-11-03-vibe-app-store-listing#c5]].) Is the €172.99 yearly in-app option offered on the web too?
4. **Library upload of the export.** Does a Library accept ChatGPT's `conversations.json`, and at what size does it fail (100 MB limit [[2026-11-03-mistral-docs-libraries#c2]], monthly allowance [[2026-11-03-mistral-docs-libraries#c5]])? Do answers cite old chats usefully?
5. **What's in the ChatGPT ZIP.** Confirm `conversations.json` and `chat.html`, and check whether saved memories and project files are in it (OpenAI only confirms custom instructions [[2026-11-03-openai-chatgpt-custom-instructions-help#c4]]).
6. **GPT editor path.** Where exactly to copy a GPT's instructions and download its knowledge files in ChatGPT today (My GPTs > Edit > Configure?). The editor article was not read.
7. **Invoking a Skill.** `/name` or `@name`? The Skills page and the overview say different things [[2026-11-03-mistral-docs-skills#c4]] [[2026-11-03-mistral-docs-vibe-overview#c4]].
8. **Does a pasted GPT prompt work as a Skill without a rewrite?** Test one GPT end to end, including attached files and the file-count limit [[2026-11-03-mistral-docs-skills#c7]].
9. **Spoken replies.** Does Vibe read answers aloud, on web or mobile?
10. **Vibe Pro on mobile vs web.** Can a web subscriber manage the plan in the app and the other way round (help article 392902 not read)?
11. **Remaining 15 subprocessors** on trust.mistral.ai (the page needs JavaScript) [[2026-11-03-mistral-trust-center-subprocessors#c1]].
12. **CNIL complaint status.** No CNIL decision found today. Ask CNIL or check its decisions database before writing anything about the outcome.

## 6. Proposed entity facts

**`mistral-ai`** (company; `resolve "Mistral AI"` → `mistral-ai`, virtual node derived from `parentCompany`, no entity note yet). Newest first:

- 2026-09-22 · Merged Vibe's Chat and Work tabs into one experience, replacing Agents with Skills and Memories with a Knowledge Base; rollout to self-serve accounts began 2026-09-14. [[2026-11-03-mistral-release-notes-vibe#c1]] [[2026-11-03-mistral-release-notes-vibe#c3]] [[2026-11-03-mistral-release-notes-vibe#c4]]
- 2026-09-03 · Current consumer privacy policy took effect; it names Mistral AI (Paris, 952 418 325) as controller and CNIL as a complaint route. [[2026-11-03-mistral-privacy-policy#c1]] [[2026-11-03-mistral-privacy-policy#c7]]
- 2026-05-28 · Renamed its consumer assistant Le Chat to Vibe, combining it with its coding agent under one licence. [[2026-11-03-mistral-vibe-agent-launch#c1]]
- 2026-02-17 · Italy's AGCM made Mistral's commitments on hallucination warnings in Le Chat binding and closed case PS12968 without finding an infringement. [[2026-11-03-agcm-mistral-le-chat-hallucination-commitments#c5]]
- 2025-09-02 · Launched Memories (beta) in Le Chat, announced with an import of ChatGPT memories. [[2026-11-03-mistral-memories-launch-2025#c1]] [[2026-11-03-mistral-memories-launch-2025#c2]]
- 2025-06-03 · AGCM opened consumer-protection proceedings PS12968 over how Le Chat informed users about hallucinations. [[2026-11-03-agcm-mistral-le-chat-hallucination-commitments#c1]]
- 2025-02-12 · Clubic reported a GDPR complaint to CNIL by lawyer Jérémy Roche over the lack of a training opt-out for free Le Chat users. [[2026-11-03-clubic-mistral-cnil-complaint#c1]] [[2026-11-03-clubic-mistral-cnil-complaint#c2]]

**`openai`** (company; `resolve "OpenAI"` → `openai`, virtual node, no entity note yet):

- 2026-10-26 · Ended new GPT creation for affected Enterprise workspaces; says standard retirement of custom GPTs is scheduled for 2026-12-11, with migration to plugins. [[2026-11-03-openai-custom-gpt-retirement-faq#c8]] [[2026-11-03-openai-custom-gpt-retirement-faq#c1]]
- 2026-02-27 · Announced an agreement with the US Department of War, which Decrypt links to the #QuitGPT campaign (2.5 million pledges by early March, per Decrypt). [[2026-11-03-decrypt-quitgpt-data-guide#c2]]

**The undated "That case is still open" on our Mistral page** (`content/services/mistral-le-chat/en.md`, "Worth knowing"): the dated facts we have are the February 2025 complaint [[2026-11-03-clubic-mistral-cnil-complaint#c1]] and no public CNIL decision found on 2026-11-03. Suggested wording basis: "In February 2025 a lawyer complained to CNIL that free users couldn't opt out of training. We found no public decision as of November 2026." Also add the closed Italian case: AGCM accepted Mistral's commitments on hallucination warnings on 17 February 2026 [[2026-11-03-agcm-mistral-le-chat-hallucination-commitments#c5]]. The listing's other claims should also be dated.

**Corrections the main agent should consider (not edited, per brief):**
- `services/mistral-le-chat`: name (now Vibe [[2026-11-03-mistral-vibe-agent-launch#c1]]); Student price $7.04 → €5.99/$5.99, max 12 months, new users only [[2026-11-03-mistral-pricing-page#c4]]; "No Telemetry Mode" and "~25 messages/day" are not on today's pricing page (it says "Opt-out" and "Up to 6x free" [[2026-11-03-mistral-pricing-page#c6]] [[2026-11-03-mistral-pricing-page#c8]]); "up to 500 memories" is not in the current Knowledge Base docs; "Free tier conversations may feed back into model training. The Pro plan fixes that" needs re-checking against the help centre [[2026-11-03-mistral-help-training-opt-out#c1]]; "Everything runs on EU servers" overstates [[2026-11-03-mistral-trust-center-subprocessors#c5]] [[2026-11-03-mistral-trust-center-subprocessors#c6]]; Team plan €24.99/user is missing [[2026-11-03-mistral-pricing-page#c3]]. Image generation is by Black Forest Labs [[2026-11-03-mistral-trust-center-subprocessors#c5]] (matches the listing).
- `services/chatgpt`: custom GPT retirement and the end of GPT creation on personal accounts [[2026-11-03-openai-gpts-help#c1]] [[2026-11-03-openai-gpts-help#c2]].
- `landing-pages/quit-chatgpt` line 45: "EU alternatives like Mistral and Proton do not use your chats to improve their models" is wrong for Mistral [[2026-11-03-mistral-help-training-data-use#c1]].
- Candidate line for `knowledge/flags.md` (not written, to avoid clashing with parallel agents): `- 2026-11-03 · services/mistral-le-chat · Le Chat renamed Vibe, new plans and Student price, Agents/Memories replaced · [[2026-11-03-mistral-vibe-agent-launch#c1]]`

## Sources (notes created 2026-11-03)

Mistral naming, plans and apps: `2026-11-03-mistral-vibe-agent-launch`, `2026-11-03-mistral-help-le-chat-is-now-vibe`, `2026-11-03-mistral-vibe-product-page`, `2026-11-03-mistral-pricing-page`, `2026-11-03-vibe-app-store-listing`, `2026-11-03-vibe-google-play-listing`.

Mistral features: `2026-11-03-mistral-docs-vibe-overview`, `2026-11-03-mistral-release-notes-vibe`, `2026-11-03-mistral-docs-choose-work-code`, `2026-11-03-mistral-docs-knowledge-base`, `2026-11-03-mistral-docs-memories-legacy`, `2026-11-03-mistral-docs-custom-instructions`, `2026-11-03-mistral-docs-projects`, `2026-11-03-mistral-docs-skills`, `2026-11-03-mistral-docs-libraries`, `2026-11-03-mistral-docs-voice-mode`, `2026-11-03-mistral-memories-launch-2025`.

Mistral privacy: `2026-11-03-mistral-help-training-opt-out`, `2026-11-03-mistral-help-training-data-use`, `2026-11-03-mistral-help-data-storage-location`, `2026-11-03-mistral-help-data-export`, `2026-11-03-mistral-help-delete-account`, `2026-11-03-mistral-help-zero-data-retention`, `2026-11-03-mistral-privacy-policy`, `2026-11-03-mistral-trust-center-subprocessors`.

OpenAI: `2026-11-03-openai-chatgpt-data-export-help`, `2026-11-03-openai-chatgpt-memory-help`, `2026-11-03-openai-chatgpt-custom-instructions-help`, `2026-11-03-openai-gpts-help`, `2026-11-03-openai-custom-gpt-retirement-faq`, `2026-11-03-openai-chatgpt-projects-help`, `2026-11-03-openai-chatgpt-data-controls-help`, `2026-11-03-openai-chatgpt-delete-account-help`.

Regulatory and third-party: `2026-11-03-agcm-mistral-le-chat-hallucination-commitments`, `2026-11-03-clubic-mistral-cnil-complaint`, `2026-11-03-decrypt-quitgpt-data-guide`, `2026-11-03-proton-delete-chatgpt-account-guide`.

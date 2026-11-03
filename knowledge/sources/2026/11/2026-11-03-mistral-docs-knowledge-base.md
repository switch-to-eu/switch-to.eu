---
type: source
title: Knowledge Base (Mistral docs, Vibe Work)
url: https://docs.mistral.ai/vibe/work/knowledge
publisher: Mistral AI
published: '2026-11-03'
fetched: '2026-11-03'
lang: en
reliability: high
entities: [mistral-ai]
stories: []
---
**Summary:** Mistral's documentation for Knowledge Base, the memory feature of Vibe Work in [[services/mistral-le-chat]] that replaces the older Memories. It describes how facts are saved, managed, exported and turned off. It does not describe any import from another assistant. The page shows no date, so the fetch date is used.

**Claims**
- `c1` Knowledge Base is the successor to Memories; existing Chat Memories migrate into it as a knowledge topic.
- `c2` Users save a fact explicitly with words such as "remember" or "save" in a chat; Vibe also saves recurring details on its own.
- `c3` It is enabled by default and set up from the sidebar under Context, then Knowledge.
- `c4` Users cannot edit the text of a knowledge entry directly; changes go through the model in chat.
- `c5` Users can delete a topic, a single entry (by asking Vibe) or all entries; deleting all is irreversible.
- `c6` Users can export their data, including what is stored, from Settings.
- `c7` To turn it off, click the organisation name at the bottom left, then Privacy, and deactivate Knowledge under Personalization; turning it off does not delete stored entries.
- `c8` Sensitive personal data (such as health, political opinions or religion) is not saved unless the user turns on "Sensitive data in Knowledge"; passwords, government IDs and financial account numbers are never saved.
- `c9` Knowledge Base supports markdown and text content and is managed only through the chat interface, with no separate API.
- `c10` Vibe decides at each turn which knowledge entries are relevant, and retrieval is non-deterministic: an entry is not used in every conversation.

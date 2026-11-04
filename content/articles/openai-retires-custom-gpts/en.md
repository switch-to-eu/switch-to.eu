---
title: OpenAI plans to shut down custom GPTs on 11 December. What to do with yours
description: OpenAI plans to shut down custom GPTs on 11 December and move creators to plugins. What moves, what doesn't, and how to rebuild a GPT somewhere else.
date: '2026-11-04'
type: news
story: openai-custom-gpt-retirement
entities: [openai, mistral-ai, proton]
services: [chatgpt, mistral-le-chat, proton-lumo]
categories: [artificial-intelligence]
guides: [chatgpt-to-mistral]
sources:
  - {title: 'Custom GPT retirement and migration FAQ', publisher: OpenAI, url: 'https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq', date: '2026-11-03'}
  - {title: 'OpenAI to retire custom GPTs, replace them with plugins', publisher: Virtualization Review, url: 'https://virtualizationreview.com/articles/2026/09/28/openai-to-retire-custom-gpts-replace-them-with-plugins.aspx', date: '2026-09-28'}
  - {title: 'Plugins in ChatGPT', publisher: OpenAI, url: 'https://help.openai.com/en/articles/20001256-plugins-in-chatgpt', date: '2026-11-03'}
  - {title: 'GPTs in ChatGPT', publisher: OpenAI, url: 'https://help.openai.com/en/articles/8554407-gpts-in-chatgpt', date: '2026-11-03'}
  - {title: 'Reuse work with Skills', publisher: Mistral AI, url: 'https://docs.mistral.ai/vibe/work/skills', date: '2026-11-03'}
  - {title: 'Can I opt out of my input or output data being used for training?', publisher: Mistral AI, url: 'https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training', date: '2026-09-03'}
  - {title: 'Where do you store my data or my Organization''s data?', publisher: Mistral AI, url: 'https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data', date: '2026-08-12'}
  - {title: 'Subprocessors', publisher: Mistral AI, url: 'https://trust.mistral.ai/subprocessors', date: '2026-11-03'}
  - {title: 'Lumo privacy', publisher: Proton, url: 'https://proton.me/support/lumo-privacy', date: '2026-11-03'}
  - {title: 'Introducing Lumo 2.0', publisher: Proton, url: 'https://proton.me/blog/lumo-2', date: '2026-06-30'}
  - {title: 'Lumo pricing and plans', publisher: Proton, url: 'https://proton.me/lumo/pricing', date: '2026-11-03'}
author: Simon Peters
image: /images/articles/openai-retires-custom-gpts.jpg
imageAlt: 'The glass office building at 1515 Third Street in San Francisco, home to the headquarters of OpenAI when photographed in June 2025'
imageCredit: 'Photo: Coolcaesar, CC BY 4.0, via Wikimedia Commons'
imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:1515_Third_Street.jpg'
# SEO
metaTitle: 'OpenAI plans custom GPT shutdown 11 December: your options'
keywords: [custom GPT retirement, custom GPTs 11 December, migrate GPT to plugin, ChatGPT plugins, leave ChatGPT, Mistral Vibe Skills, Proton Lumo, European ChatGPT alternative]
# Workflow
draft: true
updatedAt: '2026-11-04'
---

OpenAI plans to shut down custom GPTs in [ChatGPT](/services/non-eu/chatgpt) on 11 December 2026. From that date, [you can't open GPTs or their pages](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq). Some workspaces get until 11 February 2027, including Enterprise workspaces with an approved deferral. OpenAI says the [timing might differ](https://virtualizationreview.com/articles/2026/09/28/openai-to-retire-custom-gpts-replace-them-with-plugins.aspx) by account and workspace, so check the notice in your own account.

Your old GPT conversations stay. [OpenAI says](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq) you can still open them after that date, and you don't have to do anything to keep them. OpenAI [announced the retirement on 11 September](https://virtualizationreview.com/articles/2026/09/28/openai-to-retire-custom-gpts-replace-them-with-plugins.aspx).

## If you built a GPT

To move your GPT to a plugin, OpenAI's replacement, go to **My GPTs** and select **Migrate to plugin** once the option appears for your account.

The instructions become a skill, the knowledge files are copied in as reference files and the connected apps come along. [Some things don't move](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq):

- **Drafts and unpublished edits.** Migration uses the latest published version.
- **The selected model.**
- **Custom actions,** which connect a GPT to another service. OpenAI says rebuilding one might take a custom server and technical setup.

Finish your edits first, because the original GPT turns read-only after the move. The plugin starts private, so people who used your GPT don't get access automatically. Making a personal plugin public takes a separate submission. OpenAI warns that a plugin might respond differently, and advises you to test it with familiar prompts.

If you like ChatGPT and your GPT has no custom actions, we'd migrate. It's the least work: OpenAI does the copying and you test the result. If it has custom actions, we'd first find out who can rebuild them.

## If you use someone else's GPT

You have less control here. Permission to use a GPT doesn't let you migrate it, and [access to the original doesn't give you access to a replacement](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq). Look for a notice on the GPT and for guidance from its creator. Whether you can install a plugin [depends on your plan, workspace, role and region](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt).

## If you want to leave ChatGPT

Save your GPT's instructions before the shutdown. That takes about 5 to 10 minutes per GPT, by our estimate. Find your original knowledge files too, because OpenAI's help pages don't describe a download for them.

### Mistral Vibe

Our [ChatGPT to Mistral guide](/guides/artificial-intelligence/chatgpt-to-mistral) shows how to save a GPT's instructions and rebuild them as a Skill in [Mistral Vibe](/services/eu/mistral-le-chat), formerly Le Chat, from Paris-based Mistral AI. You paste everything by hand, because Mistral's documentation describes no import from ChatGPT.

A Skill isn't a one-to-one copy. [A GPT combines](https://help.openai.com/en/articles/8554407-gpts-in-chatgpt) instructions, conversation starters, knowledge files, capabilities and apps or actions. [A Skill](https://docs.mistral.ai/vibe/work/skills) is a folder with instructions and optional files, and Mistral's page mentions a file limit but doesn't say how many. That page describes private and workspace sharing, not a public directory.

Switch training off before you paste anything personal. Mistral [trains on your Vibe chats by default](https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training), and the opt-out is in your settings. ChatGPT's consumer plans [might also use GPT conversations for training unless you opt out](https://help.openai.com/en/articles/8554407-gpts-in-chatgpt).

Mistral [says data is hosted in the EU by default](https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data), but [its subprocessor list](https://trust.mistral.ai/subprocessors) names US companies for web search and image generation.

### Proton Lumo

[Proton Lumo](/services/eu/proton-lumo) comes from Proton in Geneva, which is outside the EU. Proton [says Lumo doesn't train on your chats](https://proton.me/support/lumo-privacy), apart from anonymised feedback that you choose to send on one model.

[Custom Lumos](https://proton.me/blog/lumo-2) are assistants with instructions that you set once, and Projects keep chats, files and instructions together. Free accounts get [a limited number of both](https://proton.me/lumo/pricing). Proton's announcement doesn't mention files for Custom Lumos, so check this before you rebuild a GPT that depends on knowledge files.

Compare your options on our [Quit ChatGPT page](/pages/quit-chatgpt) and in the [AI category](/services/artificial-intelligence).

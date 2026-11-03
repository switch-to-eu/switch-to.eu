---
title: Custom GPTs are scheduled to retire on 11 December. Your options, including leaving
description: OpenAI plans to retire custom GPTs on 11 December and move creators to plugins. What carries over, what doesn't, and how to rebuild a GPT elsewhere.
date: '2026-11-10'
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
author: Switch-to.eu
image: /images/articles/openai-retires-custom-gpts.jpg
imageAlt: 'The glass office building at 1515 Third Street in San Francisco, home to the headquarters of OpenAI when photographed in June 2025'
imageCredit: 'Photo: Coolcaesar, CC BY 4.0, via Wikimedia Commons'
imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:1515_Third_Street.jpg'
# SEO
metaTitle: 'Custom GPTs scheduled to retire 11 December: your options'
keywords: [custom GPT retirement, custom GPTs 11 December, migrate GPT to plugin, ChatGPT plugins, leave ChatGPT, Mistral Vibe Skills, Proton Lumo, European ChatGPT alternative]
# Workflow
draft: true
updatedAt: '2026-11-03'
---

OpenAI has scheduled custom GPTs in [ChatGPT](/services/non-eu/chatgpt) to retire on 11 December 2026. From that date, GPTs and their pages become inaccessible, [OpenAI's FAQ says](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq). The company [announced the change on 11 September](https://virtualizationreview.com/articles/2026/09/28/openai-to-retire-custom-gpts-replace-them-with-plugins.aspx) and says timing might differ by account and workspace, so check the notice in your own account. Some workspaces, including Enterprise ones with an approved deferral, have until 11 February 2027.

## What moves to a plugin

Plugins are OpenAI's replacement. If you built a GPT, go to **My GPTs** and select **Migrate to plugin** once the option appears for your account. The GPT's instructions become a skill, its knowledge files are copied in as reference files and its connected apps come along. [OpenAI says](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq) your existing GPT conversations stay accessible after retirement, and you don't have to do anything to keep them.

## What stays behind

Migration uses the GPT's latest published version, so drafts and unpublished edits don't transfer. The selected model doesn't carry over. Custom actions, which connect a GPT to another service, don't transfer either, and [OpenAI says](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq) rebuilding one might take a custom server and technical setup.

[Plugins start private](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq). People who used your GPT don't get access automatically, and making a personal plugin public takes a separate submission process. After migration the original GPT turns read-only, so finish your edits first. OpenAI warns a plugin might respond differently and advises testing with familiar prompts.

You have less control over someone else's GPT. Permission to use a GPT doesn't let you migrate the GPT, and [access to the original doesn't give you access to a replacement](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq). Look for a notice on the GPT and guidance from its creator. Installing a plugin also [depends on your plan, workspace, role and region](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt).

## What this means for you

Staying is a fair choice. If you like ChatGPT and your GPT has no custom actions, migrating is the least work: OpenAI does the copying, and you test the result.

Leaving is the other route. Our [ChatGPT to Mistral guide](/guides/artificial-intelligence/chatgpt-to-mistral) shows how to save a GPT's instructions and rebuild them as a Skill in [Mistral Vibe](/services/eu/mistral-le-chat), formerly Le Chat, from Paris-based Mistral AI. Save before retirement: about 5 to 10 minutes per GPT, by our estimate. Find your original knowledge files too, because OpenAI's help pages don't describe a download for them.

A Skill isn't a one-to-one copy, and Mistral's documentation describes no import from ChatGPT, so you paste everything by hand. [A GPT combines](https://help.openai.com/en/articles/8554407-gpts-in-chatgpt) instructions, conversation starters, knowledge files, capabilities and apps or actions. [A Skill](https://docs.mistral.ai/vibe/work/skills) is a folder with instructions and optional files, with a file-count limit Mistral's page doesn't quantify. That page describes private and workspace sharing, not a public directory.

Mistral [trains on your Vibe chats by default](https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training), with an opt-out in your settings, so switch training off before you paste anything personal. ChatGPT's consumer plans [might also use GPT conversations for training unless you opt out](https://help.openai.com/en/articles/8554407-gpts-in-chatgpt). Mistral [says data is hosted in the EU by default](https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data), though [its subprocessor list](https://trust.mistral.ai/subprocessors) names US companies for web search and image generation.

[Proton Lumo](/services/eu/proton-lumo) is another option. Proton, based in Geneva and so outside the EU, [says Lumo doesn't train on your chats](https://proton.me/support/lumo-privacy), apart from anonymised feedback you choose to send on one model.

[Custom Lumos](https://proton.me/blog/lumo-2) are assistants with instructions you set once, and Projects keep chats, files and instructions together. Free accounts get [a limited number of both](https://proton.me/lumo/pricing). Proton's announcement doesn't mention files for Custom Lumos, so check before you rebuild a GPT built around knowledge files.

Compare your options on our [Quit ChatGPT page](/pages/quit-chatgpt) and in the [AI category](/services/artificial-intelligence).

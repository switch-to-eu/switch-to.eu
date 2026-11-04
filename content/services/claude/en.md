---
# Listing
name: Claude
region: non-eu
category: artificial-intelligence
location: United States
url: https://claude.ai/
freeOption: true
startingPrice: $17/month
description: AI assistant from Anthropic (US) for analysis, coding, and writing. Free tier available, Pro from $17/month. Trains on consumer chats unless you opt out.
features:
- Long context window (up to 1M tokens, varies by model)
- Code generation and debugging
- Document and image analysis
- Interactive artifacts
- Extended thinking for complex tasks
pricingTiers:
- name: Free
  price: Free
  features:
  - Sonnet and Haiku models
  - Usage limits that reset every 5 hours and every week
  - Web search, memory, file creation and Artifacts
  - Chats used for training unless you opt out
- name: Pro
  price: $17/month
  billingNote: Billed annually ($200 up front), or $20 paid monthly
  features:
  - Adds Opus models (including Opus 5.5)
  - Fable model paid with usage credits
  - More usage than Free
  - Claude Code access
  - Claude in Chrome and Microsoft 365
  - Chats used for training unless you opt out
- name: Max
  price: $100/month
  billingNote: Billed monthly
  features:
  - 5x Pro usage every 5 hours and every week
  - Fable included, up to half your weekly limit
  - $100/month in API credits
  - Priority access at high traffic times
  - All Pro features included
- name: Ultra
  price: $200/month
  billingNote: Billed monthly. Formerly Max 20x.
  features:
  - 10x Pro usage every week
  - No 5-hour limit for verified accounts
  - Fable included, up to half your weekly limit
  - $200/month in API credits
  - All Max features included
- name: Team Standard
  price: $20/seat/month
  billingNote: Billed annually, or $25 paid monthly. Teams of 2 to 150.
  features:
  - More usage than Pro per seat
  - Claude Code and Claude Cowork
  - Admin tools, central billing and SSO
  - Context window up to 1M tokens (varies by model)
  - No training on your content by default
- name: Team Premium
  price: $100/seat/month
  billingNote: Billed annually, or $125 paid monthly. Teams of 2 to 150.
  features:
  - 5x the usage of a Standard seat
  - Fable included, up to half your weekly limit
  - All Team Standard features, including admin tools
  - No training on your content by default
- name: Enterprise
  price: $20/seat/month plus usage
  billingNote: Billed annually, 20-seat minimum. Usage billed at API rates.
  features:
  - Context window up to 1M tokens (varies by model)
  - SSO and SCIM provisioning
  - HIPAA-ready configuration
  - Custom data retention
  - No training on your content by default
tags:
- ai
- chatbot
- anthropic
# Non-EU page (only used when region is non-eu)
issues:
- Free, Pro, Max and Ultra chats used for AI training unless you opt out (consumer terms update, August 2025)
- Anthropic's privacy policy says personal data goes to its servers in the US or other countries outside the EEA
- EU data residency only through AWS Bedrock and Google Cloud, not on Free, Pro, Max or Ultra plans
- Subject to US surveillance laws including FISA and CLOUD Act
- The training option was switched on by default in the 2025 consent pop-up, PCMag reported
- Data retained for up to 5 years when training is enabled
recommendedAlternative: mistral-le-chat
# SEO
metaTitle: 'Claude AI by Anthropic: Privacy, Pricing & EU Data Concerns'
metaDescription: 'Claude pricing: Free, Pro $20/month, Max $100, Ultra $200. Anthropic trains on consumer chats unless you opt out, and data leaves the EU. See EU alternatives.'
keywords:
- Claude AI
- Anthropic
- Claude privacy
- Claude GDPR
- Claude pricing
- AI assistant EU alternative
- Claude data training
- Claude Pro plan
ogTitle: 'Claude AI by Anthropic: What EU Users Should Know'
ogDescription: Claude is a capable AI assistant, but consumer data goes to Anthropic's servers in the US and trains its models unless you opt out. Learn about privacy trade-offs and EU alternatives.
# Research (filled by /research)
researchStatus: complete
lastResearchedAt: '2026-04-09T00:00:00.000Z'
gdprCompliance: partial
gdprNotes: For users in the EEA, the data controller is Anthropic Ireland, Limited. Anthropic's privacy policy says personal data goes to its servers in the US or other countries outside the EEA, protected by Standard Contractual Clauses or adequacy decisions. Anthropic has a Data Processing Addendum for business customers. EU data residency is available through AWS Bedrock and Google Cloud's Vertex AI, but not through the Claude apps. Since a consumer terms update in August 2025, Free, Pro, Max and Ultra chats are used for model training unless you opt out in your privacy settings. Opting out also cuts data retention from 5 years to 30 days. Team and Enterprise content is not used for training by default.
privacyPolicyUrl: https://www.anthropic.com/legal/privacy
pricingDetails: 'Prices in US dollars before tax, from claude.com/pricing (as of November 2026). No EUR price on Anthropic''s public pages, including the German pricing page: the Pro help article says local-currency pricing is shown at claude.ai/upgrade and varies by region. Free: Sonnet and Haiku, usage limits every 5 hours and every week. Pro: $17/month billed annually ($200 up front) or $20 monthly, adds Opus, Fable via usage credits. Max: $100/month billed monthly, 5x Pro usage. Ultra (formerly Max 20x): $200/month billed monthly, 10x Pro weekly usage, no 5-hour limit for verified accounts. Team (2 to 150 users): Standard seat $20/month billed annually or $25 monthly, Premium seat $100/month billed annually or $125 monthly with 5x Standard usage. Enterprise: $20/seat/month billed annually, 20-seat minimum, plus usage at API rates.'
pricingUrl: https://claude.com/pricing
headquarters: San Francisco, California
parentCompany: Anthropic PBC
foundedYear: 2021
employeeCount: ~5,000
dataStorageLocations:
- United States
- EU (via AWS Bedrock/Google Vertex only)
certifications:
- SOC 2 Type II
- ISO 27001:2022
- ISO/IEC 42001:2023
sourceUrls:
- url: https://privacy.claude.com/en/articles/10023628-what-is-your-approach-to-gdpr-or-related-issues
  label: Anthropic GDPR approach
  checkedAt: '2026-11-03'
- url: https://www.anthropic.com/news/updates-to-our-consumer-terms
  label: Consumer Terms update (Aug 2025)
  checkedAt: '2026-11-03'
- url: https://claude.com/pricing
  label: Claude pricing page
  checkedAt: '2026-11-03'
- url: https://claude.com/de/pricing
  label: Claude pricing page (German, still in USD)
  checkedAt: '2026-11-03'
- url: https://support.claude.com/en/articles/8325606-what-is-the-pro-plan
  label: What is the Pro plan? (local currency pricing)
  checkedAt: '2026-11-03'
- url: https://support.claude.com/en/articles/11049741-what-is-the-max-plan
  label: What is the Max plan?
  checkedAt: '2026-11-03'
- url: https://support.claude.com/en/articles/17728952-what-is-the-ultra-plan
  label: What is the Ultra plan?
  checkedAt: '2026-11-03'
- url: https://trust.anthropic.com/
  label: Anthropic Trust Center
- url: https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained
  label: Anthropic certifications
  checkedAt: '2026-11-03'
- url: https://privacy.claude.com/en/articles/10458704-how-does-anthropic-protect-the-personal-data-of-claude-users
  label: Data protection measures
  checkedAt: '2026-11-03'
- url: https://www.anthropic.com/legal/privacy
  label: Anthropic Privacy Policy (data transfers, EEA controller)
  checkedAt: '2026-11-03'
- url: https://claude.com/regional-compliance
  label: Claude regional compliance (data residency options)
  checkedAt: '2026-11-03'
- url: https://platform.claude.com/docs/en/manage-claude/data-residency
  label: Claude API data residency docs
  checkedAt: '2026-11-03'
- url: https://www.anthropic.com/company
  label: Anthropic company page
  checkedAt: '2026-11-03'
- url: https://platform.claude.com/docs/en/build-with-claude/vision
  label: Claude vision docs (image analysis)
  checkedAt: '2026-11-03'
- url: https://platform.claude.com/docs/en/build-with-claude/extended-thinking
  label: Claude extended thinking docs
  checkedAt: '2026-11-03'
- url: https://tech.yahoo.com/ai/articles/anthropic-collect-chats-coding-sessions-175315875.html
  label: 'PCMag via Yahoo Tech: Anthropic to collect your chats to train Claude (2025-08-29)'
  checkedAt: '2026-11-03'
researchNotes: |-
  ## Company Overview

  Anthropic is an AI safety company founded in 2021 by Dario and Daniela Amodei (former OpenAI). Headquartered in San Francisco. ~5,000 employees. Valued at $380B after $30B Series G (Feb 2026). Total funding: $67.3B across 17 rounds.

  ## Privacy and Data Handling

  Consumer terms update announced 28 August 2025 (existing users had to choose by 8 October 2025): Free, Pro, and Max (now also Ultra) chats used for training unless the user opts out. The pricing page lists model training as "Opt-out" on all consumer plans (as of November 2026). Data retention extended to 5 years if training enabled, 30 days if opted out. Team/Enterprise/API content not used for training by default. Privacy policy: personal data goes to US servers or other countries outside the EEA, under SCCs or adequacy decisions. EEA data controller: Anthropic Ireland, Limited. Data Processing Addendum for business customers. EU data residency only via AWS Bedrock or Google Cloud Vertex AI (Microsoft Foundry "coming soon" for Europe). First-party API workspace geo is US only (as of November 2026). Anthropic says data is encrypted in transit and at rest and that it does not sell user data.

  ## Pricing (as of November 2026)

  Prices in USD before tax. No EUR price on Anthropic's public pages. Free: Sonnet and Haiku, limits every 5 hours and every week. Pro: $17/mo billed annually or $20 monthly, adds Opus, Fable via usage credits. Max: $100/mo, 5x Pro. Ultra (formerly Max 20x): $200/mo, 10x Pro weekly, no 5-hour limit for verified accounts. Team (2 to 150): Standard $20/seat/mo annual or $25 monthly. Premium $100/seat/mo annual or $125 monthly. Enterprise: $20/seat/mo billed annually, 20-seat minimum, plus usage at API rates. Context window up to 1M tokens on all plans, varies by model. Newest models on the pricing page: Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5.

  ## Certifications

  SOC 2 Type I and Type II, ISO 27001:2022, ISO/IEC 42001:2023, listed for commercial products. HIPAA-ready configuration with BAA available (Enterprise), not a certification.

  ## Sentiment and Concerns

  Generally positive sentiment for product quality. Criticism around the August 2025 terms update: PCMag reported on 29 August 2025 that the training option was toggled on by default in the consent pop-up. A Stanford critique mentioned in earlier research could not be confirmed (as of November 2026). No formal GDPR certification.
# Workflow
contentPipelineStatus: translated
updatedAt: '2026-11-03'
seoScore: 82
seoNotes: 'Score: 82/100. Strengths: Clear description under 160 chars, specific pricing data, factual issues list, strong Worth knowing section with trade-offs. Keywords well-targeted for EU privacy audience. Improvements possible: Could add more internal linking opportunities to EU AI alternatives. Content length is good at ~220 words. H2 structure is clean. Missing: comparison angle could be stronger for search intent around ''Claude vs [EU alternative]''.'
lastSeoReviewAt: '2026-04-09T00:00:00.000Z'
---

Claude is Anthropic's AI assistant. Anthropic is a public benefit corporation based in San Francisco. Claude works through long documents (up to 1 million tokens, depending on the model), writes and debugs code, reads images, and generates text. Free users get the Sonnet and Haiku models, with usage limits that reset every 5 hours and every week. Pro costs $20/month, or $17/month billed annually, and adds the Opus models (including Opus 5.5) and Claude Code. Max costs $100/month for 5x the usage of Pro. Ultra, formerly called Max 20x, costs $200/month.

Anthropic calls itself a safety-first AI company. For its business products, it lists SOC 2 Type II and ISO 27001 certifications. Anthropic says your data is encrypted both in transit and at rest, and says it does not sell user data.

For people in the EU, things get tricky. Anthropic's privacy policy says your personal data goes to its servers in the US or to other countries outside the EEA. The EU data residency options it offers all run through AWS Bedrock and Google Cloud, not through the Claude apps. Since a consumer terms update in August 2025, Anthropic uses chats on Free, Pro, Max and Ultra plans to train its models unless you opt out. You turn this off in your privacy settings at any time. When existing users first saw the update, the training option in the pop-up was switched on by default, PCMag reported. With training on, Anthropic keeps your chats for up to 5 years. Opt out and it keeps them for 30 days.

## Worth knowing

Anthropic's pricing page lists prices in US dollars, before tax. Its help center says you pay in your local currency where supported and that prices vary by region. Check claude.ai/upgrade for the price in your currency before you subscribe.

Team and Enterprise plans work differently. Anthropic doesn't train on their content by default, both come with admin controls, and Enterprise offers a HIPAA-ready setup. Team costs $20 per seat per month billed annually ($25 paid monthly), for teams of 2 to 150. Enterprise costs $20 per seat per month plus usage at API rates, with a 20-seat minimum. If you live in the EEA, Anthropic Ireland in Dublin is responsible for your data under GDPR. Anthropic has a Data Processing Addendum for business customers and relies on Standard Contractual Clauses for data it moves out of the EEA.

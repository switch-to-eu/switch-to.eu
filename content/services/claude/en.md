---
# Listing
name: Claude
region: non-eu
category: artificial-intelligence
location: United States
url: https://claude.ai/
freeOption: true
startingPrice: $20/month
description: AI assistant from Anthropic (US) for analysis, coding, and writing. Free tier available, Pro from $20/mo. Trains on consumer chats by default.
features:
- Long context window (200k tokens)
- Code generation and debugging
- Document and image analysis
- Interactive artifacts
- Extended thinking for complex tasks
pricingTiers:
- name: Free
  price: Free
  features:
  - Sonnet 4.5 model access
  - ~30-100 messages per day
  - Basic features
  - Conversations used for training by default
- name: Pro
  price: $20/month
  billingNote: $17/month billed annually
  features:
  - All models (Opus 4.5, Sonnet 4.5, Haiku 4.5)
  - Higher usage limits
  - Claude Code access
  - Google Workspace integration
  - Conversations used for training by default
- name: Max
  price: From $100/month
  billingNote: $200/month for 20x tier
  features:
  - 5-20x Pro usage capacity
  - Priority access
  - All Pro features included
- name: Team Standard
  price: $25/seat/month
  billingNote: Minimum 5 seats
  features:
  - 1.25x Pro usage per seat
  - Admin tools and controls
  - 200k token context
  - No training on conversations
- name: Team Premium
  price: $125/seat/month
  billingNote: Minimum 5 seats
  features:
  - 6.25x Pro usage per seat
  - Claude Code included
  - All admin features
  - No training on conversations
- name: Enterprise
  price: Custom
  billingNote: Starts at ~$50,000/year
  features:
  - 500k token context window
  - SSO and SCIM provisioning
  - HIPAA-ready configuration
  - Custom data retention
  - No training on conversations
tags:
- ai
- chatbot
- anthropic
# Non-EU page (only used when region is non-eu)
issues:
- Consumer conversations used for AI training by default since September 2025
- All consumer data stored and processed on US servers
- No EU data residency for Free, Pro, or Max plans
- Subject to US surveillance laws including FISA and CLOUD Act
- Opt-out UI criticized for making training toggle easy to miss
- Data retained for up to 5 years when training is enabled
recommendedAlternative: mistral-le-chat
# SEO
metaTitle: 'Claude AI by Anthropic: Privacy, Pricing & EU Data Concerns'
metaDescription: Claude is Anthropic's US-based AI assistant. Free tier and Pro from $20/mo. Consumer data stored in US, used for training by default. See EU alternatives.
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
ogDescription: Claude is a capable AI assistant, but consumer data is stored in the US and used for model training by default. Learn about privacy trade-offs and EU alternatives.
# Research (filled by /research)
researchStatus: complete
lastResearchedAt: '2026-04-09T00:00:00.000Z'
gdprCompliance: partial
gdprNotes: Anthropic offers a Data Processing Agreement with Standard Contractual Clauses for EU data transfers. However, consumer accounts (Free, Pro, Max) store data on US servers only. EU data residency is available through AWS Bedrock and Google Vertex AI, but not through the direct Claude interface. Since September 2025, consumer conversations are used for model training by default. You can opt out in your privacy settings, which also reduces data retention from 5 years to 30 days. Team and Enterprise accounts are excluded from training entirely.
privacyPolicyUrl: https://www.anthropic.com/privacy
pricingDetails: De gratis versie geeft toegang tot Sonnet 4.5 met dagelijkse berichtlimieten. Pro kost $20/maand ($17/maand bij jaarlijkse betaling) en ontgrendelt alle modellen en Claude Code. Max-abonnementen kosten $100-200/maand en vermenigvuldigen het gebruik 5-20x. Team-abonnementen beginnen bij $25/gebruiker/maand (minimaal 5 gebruikers). Enterprise-prijzen zijn op maat, vanaf ongeveer $50.000/jaar met compliance-functies.
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
- HIPAA-ready (BAA available)
sourceUrls:
- url: https://privacy.claude.com/en/articles/10023628-what-is-your-approach-to-gdpr-or-related-issues
  label: Anthropic GDPR approach
- url: https://www.anthropic.com/news/updates-to-our-consumer-terms
  label: Consumer Terms update (Sep 2025)
- url: https://claude.com/pricing
  label: Claude pricing page
- url: https://trust.anthropic.com/
  label: Anthropic Trust Center
- url: https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained
  label: Anthropic certifications
- url: https://privacy.claude.com/en/articles/10458704-how-does-anthropic-protect-the-personal-data-of-claude-users
  label: Data protection measures
researchNotes: |-
  ## Company Overview

  Anthropic is an AI safety company founded in 2021 by Dario and Daniela Amodei (former OpenAI). Headquartered in San Francisco. ~5,000 employees. Valued at $380B after $30B Series G (Feb 2026). Total funding: $67.3B across 17 rounds.

  ## Privacy and Data Handling

  Major policy shift Sep 2025: Free, Pro, and Max user conversations now used for training by default (opt-out available). Data retention extended to 5 years if training enabled, 30 days if opted out. Team/Enterprise/API accounts excluded from training. DPA available with Standard Contractual Clauses for EU transfers. EU data residency only via AWS Bedrock or Google Vertex, not on direct API. Data encrypted in transit and at rest. No data sold to third parties.

  ## Pricing (2026)

  Free: Sonnet 4.5 access, ~30-100 messages/day. Pro: $20/mo ($17/mo annual), full model access. Max: $100-200/mo, 5-20x usage. Team Standard: $25/seat/mo (min 5 seats). Team Premium: $125/seat/mo with Claude Code. Enterprise: custom pricing (~$50k+/year), 500k context, HIPAA, SSO/SCIM.

  ## Certifications

  SOC 2 Type II, ISO 27001:2022, ISO/IEC 42001:2023, HIPAA-ready with BAA.

  ## Sentiment and Concerns

  Generally positive sentiment for product quality. Criticism around Sep 2025 privacy policy shift: opt-out design questioned (small toggle, large Accept button). Stanford HAI and privacy advocates flagged the burden placed on users. No formal GDPR certification. US-only data storage for direct accounts.
# Workflow
contentPipelineStatus: translated
updatedAt: '2026-04-20'
seoScore: 82
seoNotes: 'Score: 82/100. Strengths: Clear description under 160 chars, specific pricing data, factual issues list, strong Worth knowing section with trade-offs. Keywords well-targeted for EU privacy audience. Improvements possible: Could add more internal linking opportunities to EU AI alternatives. Content length is good at ~220 words. H2 structure is clean. Missing: comparison angle could be stronger for search intent around ''Claude vs [EU alternative]''.'
lastSeoReviewAt: '2026-04-09T00:00:00.000Z'
---

Claude is Anthropic's AI assistant. The company was started in 2021 by former OpenAI researchers in San Francisco. Claude can work through long documents (up to 200,000 tokens), write and debug code, read images, and generate text. Free users get Sonnet 4.5 with daily message limits. The Pro plan at $20/month opens up all models, including Opus 4.5.

Anthropic talks a lot about AI safety, and Claude is generally good at following instructions without going off the rails. The company has SOC 2 Type II and ISO 27001 certifications. Your data is encrypted both in transit and at rest. Anthropic says it does not sell user data.

For people in the EU, things get tricky. Consumer account data sits on US servers. There is no EU residency option for individual users. In September 2025, Anthropic changed its policy so that Free, Pro, and Max conversations feed into model training by default. You can turn this off in settings, but the opt-out toggle was tucked under a big Accept button. Privacy researchers at Stanford flagged the design as misleading. If you opt out, data retention drops from 5 years to 30 days.

## Worth knowing

Team and Enterprise plans are a different story. Those accounts are never used for training, come with admin controls, and can be set up for HIPAA compliance. EU data residency is possible through AWS Bedrock and Google Vertex AI, but that only works for API and enterprise setups. Use Claude through the website or mobile app and your data still goes to the US, no matter what you pay. Anthropic does offer a Data Processing Agreement with Standard Contractual Clauses, though that mostly matters for business customers.

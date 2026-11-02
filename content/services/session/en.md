---
# Listing
name: Session
region: eu-friendly
category: messaging
location: Switzerland/Global (decentralized)
url: https://getsession.org
freeOption: true
startingPrice: Free
description: Send messages without sharing your phone number, email, or IP address. Session routes everything through a decentralized onion network.
screenshot: /images/services/session.jpg
features:
- End-to-end encryption
- Onion routing
- No phone number needed
- Decentralized network
- Open source
- Cross-platform
pricingTiers:
- name: Free
  price: Free
  features:
  - Unlimited messages
  - Group chats
  - Voice messages
  - File attachments
  - Onion routing
  - Desktop and mobile apps
tags:
- anonymous
- decentralized
- metadata-resistant
# SEO
metaTitle: 'Session: Anonymous Messenger with Onion Routing'
metaDescription: Session lets you message without a phone number or email. Free, open-source messenger using decentralized onion routing to protect your identity and metadata.
keywords:
- Session messenger
- anonymous messaging app
- onion routing messenger
- decentralized messenger
- no phone number messenger
- private messaging
- encrypted chat app
ogTitle: 'Session: Send Messages, Not Metadata'
ogDescription: Free, open-source messenger that needs no phone number or email. Session uses decentralized onion routing to keep your identity and conversations private.
# Research (filled by /research)
researchStatus: complete
lastResearchedAt: '2026-04-08T00:00:00.000Z'
gdprCompliance: compliant
gdprNotes: Session does not ask for your phone number, email, or any personal details when you sign up. Your messages travel through three random nodes using onion routing, so no single server ever sees both sender and recipient. The app is now stewarded by a Swiss foundation, operating under some of the strongest privacy laws in the world.
privacyPolicyUrl: https://getsession.org/app-privacy-policy
pricingDetails: Session is free to use for all core messaging features. A future Session Pro tier may add premium features, payable via Session Token or traditional payment methods. No pricing announced yet for premium features.
pricingUrl: https://getsession.org/faq
headquarters: Zug, Switzerland (Session Technology Foundation)
parentCompany: Session Technology Foundation (STF)
foundedYear: 2018
employeeCount: 10-30
dataStorageLocations:
- Decentralized (global network of Session Nodes)
certifications:
- Quarkslab security audit (2021)
openSource: true
sourceCodeUrl: https://github.com/session-foundation
sourceUrls:
- url: https://getsession.org
  label: Official website
- url: https://getsession.org/faq
  label: Session FAQ
- url: https://getsession.org/app-privacy-policy
  label: Privacy policy
- url: https://session.foundation/
  label: Session Technology Foundation
- url: https://github.com/session-foundation
  label: GitHub repositories
- url: https://en.wikipedia.org/wiki/Session_(software)
  label: Wikipedia article
- url: https://token.getsession.org/blog/introducing-the-session-technology-foundation
  label: STF announcement
- url: https://arxiv.org/pdf/2002.04609
  label: Session protocol whitepaper
researchNotes: |-
  Session is a decentralized, end-to-end encrypted messenger originally developed as Loki Messenger in 2018 by the Oxen Privacy Tech Foundation (OPTF), an Australian not-for-profit. It was rebranded to Session in December 2019 and launched publicly in early 2020. The app was forked from Signal but removed the phone number requirement, replacing it with pseudonymous Session IDs (66-character hex strings from Ed25519 keys).

  In 2024-2025, stewardship transferred from OPTF to the Session Technology Foundation (STF), a Swiss foundation based in Zug. Switzerland was chosen for its constitutional privacy protections and political neutrality. The OPTF no longer contributes to Session.

  In May 2025, Session completed migration from the Oxen Service Node Network to its own Session Network, a decentralized blockchain network purpose-built for encrypted message transmission. Session Token replaced OXEN as the utility token for securing and rewarding Session Nodes.

  In December 2025, Session announced v2 protocol with Perfect Forward Secrecy (PFS) and Post-Quantum Cryptography (PQC). The app uses multi-hop onion routing (3 random service nodes per request) to hide IP addresses and metadata. Messages are temporarily stored encrypted on nodes for offline delivery.

  Quarkslab conducted a security audit in 2021 finding no fundamental flaws but recommending improvements to forward secrecy and key management, both of which are being addressed in the v2 protocol. Session is fully open source with repositories on GitHub under the session-foundation organization.
# Workflow
contentPipelineStatus: translated
updatedAt: '2026-04-20'
seoScore: 88
seoNotes: 'Strong SEO profile. Title is 51 chars (good). Meta description is 156 chars (ideal range). Description leads with reader benefit. Content has clear structure with H2 heading. Keywords target high-intent privacy search terms. Worth knowing section adds authenticity and addresses common questions. Minor deductions: could benefit from a second H2 in main content to break up paragraphs, and the slug ''session'' is very generic which may face competition from unrelated search results for ''session'' as a general word.'
lastSeoReviewAt: '2026-04-08T00:00:00.000Z'
---

Most encrypted messengers still need your phone number to get started. Session skips that entirely. You create an account with a random Session ID and start chatting. No phone number, no email, no personal details handed over.

Your messages travel through three random nodes on a decentralized network using onion routing. Each node only knows the previous and next hop, never the full path. That means no single point in the network can link you to your conversation partner or read what you are saying.

Session runs on thousands of community-operated nodes spread across the globe instead of company-owned servers. If a node goes down, the network keeps working. There is no central database of users or messages for anyone to access or breach.

The app covers the basics well: one-on-one chats, group conversations, voice messages, and file attachments. It works on Android, iOS, Windows, macOS, and Linux. The entire codebase is open source, so anyone can inspect exactly how it works.

## Worth knowing

Session started as an Australian project in 2018 and moved to a Swiss foundation in 2025. The onion routing adds a small delay compared to direct-connection messengers. Group chats have a size limit, and there are no voice or video calls yet. The user base is smaller than mainstream messengers, so you will likely need to invite your contacts yourself.

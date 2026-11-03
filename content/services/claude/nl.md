---
startingPrice: $20/maand
description: AI-assistent van Anthropic (VS) voor analyse, coderen en schrijven. Gratis versie beschikbaar, Pro vanaf $20/maand. Gebruikt standaard gesprekken voor training.
features:
- Groot contextvenster (200k tokens)
- Code genereren en debuggen
- Document- en beeldanalyse
- Interactieve artefacten
- Uitgebreid denken voor complexe taken
pricingTiers:
- name: Gratis
  price: Gratis
  features:
  - Toegang tot Sonnet 4.5
  - ~30-100 berichten per dag
  - Basisfuncties
  - Gesprekken standaard gebruikt voor training
- name: Pro
  price: $20/maand
  billingNote: $17/maand, jaarlijks gefactureerd
  features:
  - Alle modellen (Opus 4.5, Sonnet 4.5, Haiku 4.5)
  - Hogere gebruikslimieten
  - Toegang tot Claude Code
  - Koppeling met Google Workspace
  - Gesprekken standaard gebruikt voor training
- name: Max
  price: Vanaf $100/maand
  billingNote: $200/maand voor de 20x-variant
  features:
  - 5-20x het gebruik van Pro
  - Voorrang bij toegang
  - Alle Pro-functies inbegrepen
- name: Team Standard
  price: $25/gebruiker/maand
  billingNote: Minimaal 5 gebruikers
  features:
  - 1,25x de Pro-limiet per gebruiker
  - Beheertools en -instellingen
  - Context van 200k tokens
  - Geen training op gesprekken
- name: Team Premium
  price: $125/gebruiker/maand
  billingNote: Minimaal 5 gebruikers
  features:
  - 6,25x de Pro-limiet per gebruiker
  - Claude Code inbegrepen
  - Alle beheerfuncties
  - Geen training op gesprekken
- name: Enterprise
  price: Prijs op aanvraag
  billingNote: Vanaf ~$50.000/jaar
  features:
  - Contextvenster van 500k tokens
  - SSO en SCIM-provisioning
  - HIPAA-geschikte configuratie
  - Eigen bewaartermijn voor data
  - Geen training op gesprekken
issues:
- Gesprekken van consumenten worden standaard gebruikt voor AI-training sinds september 2025
- Alle consumentengegevens worden opgeslagen en verwerkt in de VS
- Geen EU-dataresidentie voor Free-, Pro- of Max-abonnementen
- Onderworpen aan Amerikaanse surveillancewetten waaronder FISA en CLOUD Act
- Opt-out interface bekritiseerd omdat de trainingsschakelaar makkelijk te missen is
- Gegevens tot 5 jaar bewaard wanneer training is ingeschakeld
metaTitle: 'Claude AI van Anthropic: Privacy, Prijzen & EU-datazorgen'
metaDescription: Claude is de AI-assistent van Anthropic uit de VS. Gratis versie en Pro vanaf $20/maand. Consumentendata in de VS opgeslagen, standaard gebruikt voor training.
keywords:
- Claude AI
- Anthropic
- Claude privacy
- Claude GDPR
- Claude prijzen
- AI-assistent EU-alternatief
- Claude datatraining
- Claude Pro abonnement
ogTitle: 'Claude AI van Anthropic: Wat EU-gebruikers moeten weten'
ogDescription: Claude is een krachtige AI-assistent, maar consumentendata wordt in de VS opgeslagen en standaard gebruikt voor modeltraining. Lees over privacyafwegingen en EU-alternatieven.
gdprNotes: Anthropic biedt een gegevensverwerkingsovereenkomst (DPA) met standaardcontractbepalingen voor EU-gegevensoverdracht. Consumentenaccounts (Free, Pro, Max) slaan je gegevens echter alleen op in de VS. EU-dataresidentie is beschikbaar via AWS Bedrock en Google Vertex AI, maar niet via de directe Claude-interface. Sinds september 2025 worden gesprekken van consumenten standaard gebruikt voor modeltraining. Je kunt dit uitschakelen in je privacyinstellingen, waardoor de bewaartermijn daalt van 5 jaar naar 30 dagen. Team- en Enterprise-accounts zijn volledig uitgesloten van training.
---

Claude is de AI-assistent van Anthropic. Het bedrijf werd in 2021 opgericht door voormalige OpenAI-onderzoekers in San Francisco. Claude kan lange documenten verwerken (tot 200.000 tokens), code schrijven en debuggen, afbeeldingen lezen en tekst genereren. Gratis gebruikers krijgen Sonnet 4.5 met dagelijkse berichtlimieten. Het Pro-abonnement van $20/maand geeft toegang tot alle modellen, waaronder Opus 4.5.

Anthropic praat veel over AI-veiligheid, en Claude is over het algemeen goed in het opvolgen van instructies zonder ontsporingen. Het bedrijf heeft SOC 2 Type II en ISO 27001 certificeringen. Je gegevens worden versleuteld tijdens verzending en opslag. Anthropic zegt dat het geen gebruikersgegevens verkoopt.

Voor mensen in de EU wordt het ingewikkeld. Gegevens van consumentenaccounts staan op Amerikaanse servers. Er is geen EU-residentieoptie voor individuele gebruikers. In september 2025 veranderde Anthropic het beleid zodat gesprekken van Free-, Pro- en Max-gebruikers standaard worden gebruikt voor modeltraining. Je kunt dit uitschakelen in de instellingen, maar de opt-out schakelaar zat verstopt onder een grote Accepteer-knop. Privacyonderzoekers van Stanford noemden het ontwerp misleidend. Als je je afmeldt, daalt de bewaartermijn van 5 jaar naar 30 dagen.

## Goed om te weten

Team- en Enterprise-abonnementen zijn een ander verhaal. Die accounts worden nooit gebruikt voor training, hebben beheerderstools en kunnen worden ingericht voor HIPAA-compliance. EU-dataresidentie is mogelijk via AWS Bedrock en Google Vertex AI, maar dat werkt alleen voor API- en enterprise-opstellingen. Gebruik je Claude via de website of mobiele app, dan gaan je gegevens naar de VS, ongeacht wat je betaalt. Anthropic biedt wel een gegevensverwerkingsovereenkomst met standaardcontractbepalingen, maar dat is vooral relevant voor zakelijke klanten.

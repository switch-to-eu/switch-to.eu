Deze map bevat individuele markdown-bestanden voor elke dienst die gecategoriseerd kan worden als EU- of niet-EU-diensten.

## Mapstructuur

Diensten zijn georganiseerd in twee submappen:
- `/eu/` - Bevat diensten gevestigd in EU-landen
- `/non-eu/` - Bevat diensten gevestigd buiten de EU

## Bestandsnaamgeving

- Gebruik kleine letters met koppeltekens voor spaties: `dienst-naam.md`
- Houd namen eenvoudig en herkenbaar: `protonmail.md`, `tutanota.md`, enz.

## Verplichte Frontmatter

Elk dienstbestand moet de volgende frontmatter bevatten:

```yaml
---
name: 'Dienstnaam'             # Weergavenaam van de dienst
category: 'categorie-naam'     # Moet overeenkomen met een van de bestaande categorieën (email, storage, enz.)
location: 'Land'               # Land of regio waar de dienst is gevestigd
region: 'eu'                   # 'eu' of 'non-eu'
freeOption: true               # Of er een gratis versie beschikbaar is
startingPrice: false            # Startprijs voor betaalde abonnementen
description: 'Korte beschrijving van de dienst.'
url: 'https://dienst-url.com'  # Officiële website URL
---
```

## Optionele Frontmatter

Je kunt ook deze optionele velden opnemen:

```yaml
logo: 'pad/naar/logo.svg'      # Pad naar het dienstlogo (relatief aan de public map)
features:                       # Lijst met belangrijkste functies
  - 'Functie één'
  - 'Functie twee'
tags:                          # Tags voor filteren/categorisatie
  - 'tag1'
  - 'tag2'
featured: true                 # Of deze dienst in de uitgelichte sectie moet worden getoond
```

## Inhoud

Na de frontmatter kun je aanvullende markdown-inhoud opnemen die de dienst gedetailleerder beschrijft.

## Voorbeelden

### EU-dienst Voorbeeld

```markdown
---
name: 'ProtonMail'
category: 'email'
location: 'Zwitserland'
region: 'eu'
freeOption: true
startingPrice: '€3.99/maand'
description: 'End-to-end versleutelde e-maildienst met sterke focus op privacy.'
url: 'https://proton.me/mail'
features:
  - 'End-to-end encryptie'
  - 'Zero-access encryptie'
  - 'Open source clients'
---

ProtonMail is een versleutelde e-maildienst opgericht in 2013 bij CERN door wetenschappers die elkaar daar ontmoetten en bezorgd waren over de privacy-implicaties van diensten zoals Gmail.

## Belangrijkste Voordelen

- End-to-end encryptie zorgt ervoor dat alleen jij en de ontvanger de e-mails kunnen lezen
- Gevestigd in Zwitserland, dat sterke privacywetten heeft
- Beschikbaar op alle belangrijke platforms, waaronder web, iOS en Android
```

### Niet-EU-dienst Voorbeeld

```markdown
---
name: 'Gmail'
category: 'email'
location: 'Verenigde Staten'
region: 'non-eu'
freeOption: true
startingPrice: false
description: 'Google e-maildienst met krachtige functies maar beperkte privacy.'
url: 'https://gmail.com'
features:
  - 'Geavanceerde zoekmogelijkheden'
  - 'Integratie met Google Workspace'
  - 'Grote gratis opslag'
---

Gmail is de e-maildienst van Google die uitgebreide functies biedt, maar met privacy-concessies vanwege gegevensverwerkingspraktijken.

## Belangrijke Punten

- Een van de meest gebruikte e-maildiensten wereldwijd
- Gebruikt gegevens voor advertentietargeting en AI-training
- Gevestigd in de VS met andere privacyregels dan de EU
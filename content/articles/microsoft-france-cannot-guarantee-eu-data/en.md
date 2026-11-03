---
title: Microsoft France tells Senate it can't guarantee EU data stays out of US hands
description: Under oath before the French Senate, Microsoft's head of legal affairs in France said he could not promise customer data would never reach US authorities.
date: '2025-06-10'
type: analysis
story: us-cloud-act-and-eu-data
entities: [microsoft, cloud-act, french-senate]
services: [proton-drive, nextcloud, tresorit]
categories: [storage]
sources:
  - {title: 'Microsoft tells French lawmakers it can’t protect user data from US demands', publisher: SDxCentral, url: 'https://www.sdxcentral.com/news/microsoft-tells-french-lawmakers-it-cant-protect-user-data-from-us-demands/', date: '2025-07-21'}
author: Switch-to.eu
image: /images/articles/microsoft-france-cannot-guarantee-eu-data.jpg
imageAlt: 'The Palais du Luxembourg in Paris, seat of the French Senate'
imageCredit: 'Photo: Fred Romero, CC BY 2.0, via Flickr'
imageCreditUrl: 'https://www.flickr.com/photos/129231073@N06/38686243740'
# Workflow
sample: true
updatedAt: '2025-06-10'
---

Asked directly by French senators whether he could guarantee that data held by Microsoft for French public bodies would never be handed to US authorities without French approval, Anton Carniaux, Microsoft France's director of public and legal affairs, [answered under oath](https://www.sdxcentral.com/news/microsoft-tells-french-lawmakers-it-cant-protect-user-data-from-us-demands/): no, he could not.

He added that Microsoft contests requests it considers unfounded and that, in his words, such transfers had not happened in practice. But the answer to the question that was asked was no.

## Why the answer couldn't be yes

The reason is the US CLOUD Act. Since 2018, US law lets American authorities order a US company to hand over data it controls, wherever in the world that data is stored. A server in Paris or Frankfurt doesn't change who controls it. Microsoft's EU Data Boundary, which keeps customer data inside the EU, addresses where data sits. It cannot address which country's courts can compel the company that runs it.

That gap is the core of the European sovereignty argument. It applies equally to Amazon Web Services, Google Cloud and any other provider headquartered in the US.

## Where encryption fits

End-to-end encryption narrows the problem. If a provider never holds your keys, it has nothing readable to hand over, whoever asks. Worth knowing: encryption protects file contents, not necessarily metadata such as file names, sizes or who you shared with.

## What this means for you

For personal files, pick storage that is both EU-based and end-to-end encrypted. [Proton Drive](/services/eu/proton-drive) and [Tresorit](/services/eu/tresorit) are Swiss and encrypt files before they leave your device. [Nextcloud](/services/eu/nextcloud) lets you choose the host, or run it yourself.

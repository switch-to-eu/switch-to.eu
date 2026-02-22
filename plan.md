# Plan: KeepFocus About Page Fix + Footer + Terms/Privacy Pages

## 1. Remove ToolShowcase from KeepFocus about page
**File:** `apps/keepfocus/app/[locale]/about/page.tsx`
- Remove the entire "Switch-to.eu Platform Section" (lines 353-411) which contains the broken `<ToolShowcase />` component
- Remove the `ToolShowcase` import (line 27)
- Keep the rest of the about page intact (Hero, About KeepFocus, Technical, Open Source sections)

## 2. Create Privacy page in KeepFocus
**File:** `apps/keepfocus/app/[locale]/privacy/page.tsx`
- i18n translations already exist in both `en.json` and `nl.json` under `PrivacyPage`
- Build a component-based page (like the about page) using the existing translation keys
- Sections: Hero, Summary, Who We Are, Data Collection, Data Protection, Data Retention, Third Party, User Rights, International, Contact, Changes

## 3. Create Terms of Service page in KeepFocus
**File:** `apps/keepfocus/app/[locale]/terms/page.tsx`
- Simple terms page with standard sections
- Add i18n translations to both `en.json` and `nl.json` under a new `TermsPage` key
- Sections: intro, use of service, intellectual property, privacy, disclaimers, limitation of liability, changes, contact

## 4. Create Terms of Service page on switch-to.eu website
**File:** `apps/website/app/[locale]/terms/page.tsx`
- Follow the same pattern as the existing privacy page (markdown content via `getPageContent`)
- Create markdown content files: `apps/website/content/en/pages/terms.md` and `apps/website/content/nl/pages/terms.md`
- Add i18n metadata translations to `packages/i18n/messages/website/en.json` and `nl.json`

## 5. Expand KeepFocus footer
**File:** `apps/keepfocus/app/[locale]/layout.tsx`
- Add `links` prop to the Footer component with: About, Privacy Policy, Terms of Service
- Add `copyright` prop with year and attribution
- Add footer-related i18n translations to keepfocus messages (both en/nl)
- Links will point to local keepfocus pages (`/about`, `/privacy`, `/terms`)

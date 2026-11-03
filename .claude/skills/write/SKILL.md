---
name: write
description: Write or rewrite content for switch-to.eu using research data from the service content files in content/. Handles service listings (descriptions, features, body) and migration guides (intro, steps, troubleshooting). Use when asked to "write a service page", "write a guide", "draft content for", "rewrite the description".
argument-hint: "'service <name>' or 'guide <source> to <target>'"
---

# Content Writing Skill

Write switch-to.eu content using research data stored in `content/services/<slug>/en.md`. Content lives in markdown files. Read `.claude/skills/_shared/content-files.md` for the layout, field shapes, frontmatter editing rules and draft handling.

## Voice

Write like a knowledgeable friend explaining something to someone who just wants their email to work and their data to stay private. Not a marketing team. Not a sysadmin. Not an AI assistant hedging every statement.

The reader is a regular person, not a developer. They don't care about AES-256 or zero-access encryption as concepts. They care about whether someone can read their emails.

### Rules

- Clear, simple language. Short sentences. Active voice.
- Address the reader with "you" and "your."
- Translate technical concepts into human outcomes: "even the company can't read your emails" not "zero-access encryption."
- Put the action or key fact first in every sentence.
- No em dashes. Use periods, commas, or colons.
- No semicolons. Split into two sentences.
- No exclamation marks.
- No metaphors, cliches, or setup language ("in conclusion," "it's worth noting").
- No jargon without explanation. If you must use a term like "end-to-end encrypted," follow it with what that means for the reader.

### Consumer-friendly rewrites

| Technical | Consumer-friendly |
|-----------|-------------------|
| "zero-access encryption" | "even the company can't read your emails" |
| "AES-256 encryption at rest" | "your data is scrambled so only you can read it" |
| "ISO 27001 certified" | "passed independent security audits" |
| "GDPR compliant" | "follows EU privacy rules" |
| "open-source clients" | "the code is public, so anyone can check for problems" |
| "end-to-end encrypted" | "only you and your recipient can read the message" |
| "data stored in Swiss jurisdiction" | "your data is stored in Switzerland, outside US legal reach" |

### Sentence rhythm

Vary paragraph length. Short statement. Then a longer sentence with context and a specific example. Then short again. This keeps people reading.

### Honesty patterns

Always acknowledge trade-offs. The "Worth knowing" section is not optional.

- Instead of "blazing fast," write "pages load in under 200ms."
- Instead of "trusted by many," write "used by 100 million people."
- Instead of "easy to set up," write "setup takes about 5 minutes."

Use neutral framing for comparisons:
- Instead of "Gmail spies on your data," write "Gmail scans your emails to show you targeted ads."

### Evidence rules

Every fact on the page comes from the research fields or `sourceUrls` of the service file. Follow `.claude/skills/_shared/evidence.md`. The ones writers break most:
- Write "no X" only when research confirms the absence. "Not listed on their pricing page" is not proof. Leave it out instead.
- Don't add facts from memory. If research doesn't have it, it doesn't go on the page.
- No motives. "Custom domains moved to the paid plan", not "They want to push free users to pay."
- Attribute practices only the company can see: "Its privacy policy says it doesn't log your IP address."
- Reddit is opinion: "Some users report...", not a fact about the product.

---

## Page Structure Awareness

The service detail page has multiple tabs. Each tab has its own content source. The `/write` skill populates the fields that feed these tabs:

| Tab | Content source | What /write populates |
|-----|---------------|----------------------|
| **Overview** | `features` (tags) + markdown body + auto-generated pricing/security snippets | `features`, body |
| **Pricing** | `pricingTiers` (structured array) | `pricingTiers` |
| **Security** | Research fields (gdprCompliance, certifications, dataStorageLocations, etc.) + `gdprNotes` | `gdprNotes` (rewritten from research into consumer-friendly text) |
| **Comparison** | Auto-generated from both services + guide data | Nothing (auto-generated) |

The overview page auto-generates compact pricing and security snippet cards that link to the Pricing and Security tabs. These pull from `pricingTiers` and research fields. No separate content needed.

---

## Mode 1: Write a service listing

Usage: `/write service ProtonMail`

### Step 0 (optional): Knowledge context

```bash
pnpm -s knowledge context services/<slug> --budget 3000 2>/dev/null
```

A short, cited brief: the guides for this service, its recommended alternative (or the services that point to it), the owner company and its other services, recent news and open flags. `pnpm -s knowledge resolve "SERVICE_NAME" 2>/dev/null` gives the slug. Use it to see the bigger picture and to pick internal links. It is not a source: every fact you write still comes from the research fields of the service file (see Evidence rules above and `_shared/evidence.md`). An open flag means the listing may be out of date: tell the user and suggest `/research SERVICE_NAME` first.

### Step 1: Pull research data

Find and read the service file with all its research fields:
```bash
grep -il '^name: .*SERVICE_NAME' content/services/*/en.md
```
Read the whole `en.md` (frontmatter + body).

If `researchStatus` is "not-started", tell the user to run `/research SERVICE_NAME` first.

### Step 2: Write the content

**`description`** (required, localized): 1-2 sentences. Under 200 characters. Lead with the reader benefit, not company facts.

The description answers: "Why would I use this instead of what I have now?" Start with what makes this service meaningfully different from mainstream alternatives. That's usually a privacy/ownership angle, but could be simplicity, openness, or something else entirely. Mention the country only if it reinforces the point (e.g. EU data protection).

- Bad: "Swiss encrypted email from Proton AG. Founded by CERN scientists, owned by a non-profit." (Wikipedia intro, reader doesn't care about founders)
- Bad: "Secure email service based in Switzerland with end-to-end encryption." (generic, could be any service)
- Good: "Email where only you can read your inbox. Based in Switzerland, outside US and EU data requests." (leads with benefit, location reinforces it)
- Good: "A search engine that plants trees with its ad revenue. Based in Berlin, no tracking." (benefit first, location supports it)

**`features`** array: 4-6 short tags. 2-4 words each. These show as pills on the overview page.
- Bad: "End-to-end encryption between Proton users. Zero-access encryption for all stored mail."
- Good: "End-to-end encrypted"
- Good: "Free tier available"
- Good: "Open source"
- Good: "GDPR compliant"

**Body** (the markdown below the frontmatter): 150-250 words. Consumer-friendly overview:

1. Opening paragraph: What it does, who made it, why you'd trust it. Reference the country. Written for someone who uses email, not someone who builds email servers.
2. Second paragraph: What makes it different, in plain language. Focus on outcomes ("no one can read your emails") not mechanisms ("AES-256 with zero-access architecture").
3. Optional third paragraph: What else comes with it (calendar, storage, etc.) if applicable.
4. `## Worth knowing`: 1-2 paragraphs of honest trade-offs written for everyday users. Not technical caveats. Think: "search is slower than Gmail" not "full-text search requires client-side index decryption."

Do NOT include:
- "What stands out" section (features tags handle that)
- "Pricing" section (pricing tab handles that)
- Technical compliance details (security tab handles that)
- License names (GPLv3, AGPL, MIT, etc.) — say "open source" or "the code is public." Specific licenses belong in the security tab's certifications, not in consumer-facing content.
- Certificate names (ISO 27001, SOC 2, etc.) — say "passed independent security audits." Details belong in the security tab.

**`pricingTiers`** array: Structured pricing data extracted from research. Each tier:
```yaml
pricingTiers:
- name: Mail Plus
  price: €3.99/month
  billingNote: billed annually
  features:
  - 15 GB storage
  - 10 email addresses
```
- Use the free tier name as "Free" with price "Free"
- Keep feature descriptions short (under 6 words)

**`gdprNotes`** (localized text): Rewrite the research `gdprNotes` into 2-4 consumer-friendly sentences. This shows on the Security tab. Don't copy the research text verbatim. Translate technical/legal language into plain outcomes.
- Bad: "Fully GDPR compliant. Provides a Data Processing Agreement (DPA) for business customers as required by GDPR. EU representative is X sàrl in Luxembourg."
- Good: "Tuta follows EU privacy rules and stores all your data on its own servers in Germany. Its privacy policy says it doesn't log your IP address by default, so it holds very little data about you. Your email content, subject lines, contacts, and calendar are all encrypted so nobody can read them."

**For non-EU services also write:**
- `issues` array: Privacy/data concerns, stated factually. "Scans email content for ad targeting" not "spies on your data." Each issue needs a source in `sourceUrls`, `recentNews` or a knowledge claim. No motives.

### Step 3: Save

Edit `content/services/<slug>/en.md`: listing fields in the `# Listing` group, `issues` in the `# Non-EU page` group, `gdprNotes` in its place in `# Research`, body below the closing `---`. Keep group comments and key order, quote where needed (see `_shared/content-files.md`). Bump `updatedAt`. Run the validation snippet.

- **Existing service:** edit in place. Don't add `draft: true` (that would unpublish a live page). The PR review is the gate.
- **New service:** create the file with `draft: true` as the first key of `# Workflow`.

Don't touch `nl.md`. `/translate` updates it.

---

## Mode 2: Write a migration guide

Usage: `/write guide Gmail to ProtonMail`

### Step 0 (optional): Knowledge context

Same as Mode 1, for the target service (`services/<target-slug>`), and for the source service if you need it. It shows the guides that already exist for either one. The facts in the guide still come from research and the vendors' help pages.

### Step 1: Pull research for both services

Find and read the source (non-EU) and target (EU) service files in `content/services/*/en.md` (grep `^name:`). Note both slugs.

### Step 2: Check if guide exists

```bash
grep -l '^sourceService: SOURCE_SLUG$' content/guides/*/en.md | xargs -r grep -l '^targetService: TARGET_SLUG$'
```

If it exists, read the whole `en.md`. If not, the new guide goes to `content/guides/<source-slug>-to-<target-slug>/en.md`.

### Step 3: Write the guide sections

**`title`**: "Switching from [Source] to [Target]"

**`description`**: 1-2 sentences. What the target does and time estimate for the switch.

**`difficulty`**: beginner, intermediate, or advanced based on technical complexity.

**`timeRequired`**: Realistic estimate (e.g. "30 minutes" or "1-2 hours").

**`intro`** section (markdown): 100-150 words. Why someone would switch. State facts, not opinions.

**`beforeYouStart`** section (markdown): 50-100 words. The thing people wish they'd known before starting.

**`steps`** section: 4-8 ordered steps, each wrapped in `<!-- step-start -->` / `<!-- step-end -->` with a `step-meta` block:
- `title` (in step-meta): Action-first ("Create your ProtonMail account", not "Account Creation")
- Step markdown below the step-meta: 2-3 sentences. Action first, context second.
- `complete: false` (in step-meta)
- Keep existing `video` / `videoOrientation` keys when rewriting a step that has them. Don't invent video URLs.

Step writing rules:
- Start with the verb
- One action per step
- Include specific UI paths ("Go to Settings > Import/Export")
- Note time estimates for longer steps

**`troubleshooting`** section (markdown): 3-5 common issues as Q&A pairs. 100-200 words.

**`outro`** section (markdown): What to do after switching. 50-100 words.

**`missingFeatures`** array: Features the source has that the target doesn't. Be honest. List a feature only when the target's docs or research confirm it's missing. If it's only absent from a pricing page, put "check that X works for you" in `beforeYouStart` instead.

### Step 4: Save

Write `content/guides/<slug>/en.md`. Frontmatter: `title`, `description`, `category` (category slug), `sourceService`, `targetService` (service slugs), `difficulty`, `timeRequired`, `missingFeatures`, then `# Workflow` with `updatedAt`. Body: the five sections with the exact markers from `_shared/content-files.md` (intro, beforeYouStart, steps, troubleshooting, outro). Run the validation snippet.

- **Existing guide:** edit in place, no `draft` key.
- **New guide:** add `draft: true` as the first key of `# Workflow`. Also set `date: '<today>'` and `author: Switch-to.EU Team`.

Don't touch `nl.md`. `/translate` updates it.

---

## Self-check before saving

1. Would your non-technical friend understand every sentence? If not, simplify.
2. Any vague claims without numbers? Add specifics from research data.
3. Did you include "Worth knowing" with at least one honest trade-off?
4. Are features 2-4 word tags, not sentences?
5. Did you populate `pricingTiers` with structured data?
6. Does the content include pricing or security details that belong on their own tabs? Remove them.
7. Did you run the self-check in `_shared/evidence.md`? Every "no X", price, issue and company practice traces to research.

Note: detailed AI pattern detection (banned words, em dashes, parallel openings) happens in `/humanize`, which runs after `/write`.

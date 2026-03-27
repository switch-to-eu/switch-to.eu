# AI content skills for Claude Code: a complete landscape

The Claude Code skills ecosystem already offers **dozens of production-ready, open-source skill files** for content rewriting, SEO auditing, translation, and editorial workflows — plus a first-party Payload CMS MCP plugin that enables direct AI-to-CMS content operations. A switch-to.eu rebuild on Payload CMS can leverage these existing resources immediately rather than building from scratch, combining markdown-based skill files with MCP server integrations for a full research-to-publish pipeline with human review gates.

Claude Code's skills system, launched October 2025 and now backed by the open Agent Skills standard (agentskills.io), has exploded into a rich ecosystem: the official Anthropic skills repository holds **37,500+ stars**, community collections exceed **192 skills** each, and purpose-built content marketing skill sets cover everything from keyword research to WordPress publishing. The practical path for switch-to.eu is to assemble a curated stack from these existing resources, customize the skill files for your editorial voice, and wire them to Payload CMS through its official MCP plugin.

---

## How Claude Code skills work and why markdown matters

Claude Code skills are markdown files (SKILL.md) stored in `.claude/skills/<skill-name>/` directories, containing YAML frontmatter and natural-language instructions. They follow a **three-stage progressive disclosure** model: metadata (~100 tokens) loads at startup for all skills, full instructions (<5,000 tokens recommended) load only when activated, and supporting files in `scripts/`, `references/`, and `assets/` folders load on demand. This architecture keeps context lean while enabling rich workflows.

A minimal skill file looks like this:

```markdown
---
name: rewrite-guide
description: Rewrites content guides for switch-to.eu with consistent tone, SEO optimization, and human-readable clarity. Activate when asked to rewrite, edit, or improve guide content.
---

# Guide Rewriting Skill

[Detailed instructions, style rules, banned words, output format specifications...]
```

Skills can be **user-invoked** via `/skill-name` slash commands or **auto-invoked** when Claude detects matching context from the description field. The description field is critical — Claude decides whether to activate a skill based solely on this text. Community practitioners consistently advise making descriptions specific and "pushy" with trigger keywords, as Claude tends to handle tasks on its own without consulting skills unless the description clearly matches.

Skills live in three scopes: **personal** (`~/.claude/skills/` — available across all projects), **project** (`.claude/skills/` — committed to version control and shared with the team), and **plugin marketplace** (installable via `/plugin marketplace add owner/repo`). For switch-to.eu, project-scoped skills committed to the repository ensure every team member gets the same editorial workflow.

Key extended frontmatter fields include `context: fork` (runs the skill in an isolated subagent), `allowed-tools` (pre-approves tools like `Bash(node:*)` without prompting), and `disable-model-invocation: true` (prevents accidental auto-triggering for dangerous operations like publishing). Official documentation lives at https://code.claude.com/docs/en/skills, with authoring best practices at https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.

---

## Rewriting and copywriting skills already available

The most directly useful content rewriting skill is **Humanizer** (https://github.com/blader/humanizer) with **11,200+ stars** — the canonical Claude Code skill for detecting and removing AI writing patterns. It identifies 24 specific patterns including inflated symbolism, promotional language, overused AI vocabulary ("delve," "landscape," "crucial"), em dash overuse, rule-of-three structures, and vague attributions. The skill uses a **two-pass process**: first rewrite, then a self-audit asking "What makes this still obviously AI-generated?" followed by a targeted second fix. It's based on Wikipedia's "Signs of AI writing" guide from WikiProject AI Cleanup and installs directly as a SKILL.md file. Domain-specific forks exist, including **Humanizer Academic** (matsuikentaro1/humanizer_academic) for medical and scientific writing.

For broader copywriting, three repositories stand out:

**coreyhaines31/marketingskills** (https://github.com/coreyhaines31/marketingskills) provides dedicated `copywriting` and `copy-edit` skills alongside SEO, CRO, and content strategy skills. All skills read a shared `product-marketing-context` skill first, ensuring brand consistency. Install via `npx skills add coreyhaines31/marketingskills`.

**Fabric** (https://github.com/danielmiessler/Fabric) with **40,200+ stars** offers 117+ reusable markdown prompt patterns including `humanize` (rewrites AI text naturally), `write_essay`, `analyze_prose` (writing quality analysis), `analyze_prose_pinker` (Steven Pinker-style clarity analysis), `clean_text`, and `summarize`. Each pattern is a `system.md` file that can be directly converted to SKILL.md format by adding YAML frontmatter.

**Prompt Architect** (https://github.com/ckelsoe/claude-skill-prompt-architect) is a meta-skill that transforms vague prompts into structured, expert-level prompts using seven frameworks (CO-STAR, RISEN, RISE, TIDD-EC, RTF, CoT, CoD) — useful for generating consistent copy briefs before writing.

The most production-tested approach comes from **Joe Karlsson at CloudQuery**, who built a `/blog` skill encoding his team's exact editorial process: research → outline → **checkpoint 1** (human approval) → draft → **checkpoint 2** (human review) → Vale linting (must pass with zero errors) → image generation → PR submission. His skill includes explicit **banned words lists** ("dive," "unlock," "unleash," "intricate," "game-changer") and banned phrases ("In today's world," "best practices"). His marketing team adopted it rapidly, going from bottlenecked on one writer to producing content independently.

---

## SEO skill suites that are ready to deploy

Several comprehensive SEO skill suites exist as installable Claude Code plugins:

**claude-seo** (https://github.com/AgriciDaniel/claude-seo) offers **13 sub-skills and 7 specialized subagents** covering technical SEO, E-E-A-T assessment, schema markup generation (JSON-LD), GEO/AEO optimization for AI search engines, and strategic planning. It integrates with MCP servers for Ahrefs, Semrush, Google Search Console, PageSpeed, and DataForSEO. The same author's **claude-blog** (https://github.com/AgriciDaniel/claude-blog) adds 19 sub-skills for blog content including `/blog seo-check`, `/blog audit`, `/blog factcheck`, `/blog geo` (AI citation optimization), and `/blog schema`. This ecosystem has **154 stars, 306 developers, and 14,100+ YouTube views**, making it the most community-validated content skill set.

**seo-geo-claude-skills** (https://github.com/aaron-he-zhu/seo-geo-claude-skills) provides **20 focused skills** for SEO and Generative Engine Optimization: keyword research, content quality auditing, SEO content writing, GEO content optimization, content refreshing, on-page SEO auditing, competitor analysis, meta tag and schema generation, content gap analysis, and SERP analysis. It uses proprietary CORE-EEAT and CITE Domain Rating frameworks. Install via `npx skills add aaron-he-zhu/seo-geo-claude-skills`.

**SEO Machine** (https://github.com/TheCraigHewitt/seomachine) is a specialized Claude Code workspace for long-form SEO blog content, originally built for Castos (podcast hosting SaaS). It includes commands for `/research`, `/write`, `/rewrite`, `/analyze-existing`, `/optimize`, `/performance-review`, and `/publish-draft`, with specialized agents for meta element creation, internal linking, keyword mapping, and CRO analysis. It features **readability scoring and SEO quality ratings on a 0–100 scale** plus WordPress publishing via REST API with Yoast SEO metadata.

For readability scoring specifically, several npm packages can be bundled into skill `scripts/` directories: **text-readability** (Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, ARI), **readability-checker CLI**, and **flesch**. A skill can instruct Claude to run `node scripts/readability.js` on content files before publishing.

---

## MCP servers that connect Claude Code to Payload CMS

The most important finding for switch-to.eu is the **official Payload CMS MCP plugin** (`@payloadcms/plugin-mcp`, documented at https://payloadcms.com/docs/plugins/mcp). This first-party plugin turns a Payload instance into an MCP server, enabling Claude Code to perform full CRUD operations on collections and globals. It supports **role-based permissions per MCP client via API keys**, localization parameters (locale/fallbackLocale), virtual field exclusion, and audit logging. Configuration is straightforward:

```json
{
  "mcpServers": {
    "payload": {
      "url": "http://127.0.0.1:3000/api/mcp",
      "headers": { "Authorization": "Bearer MCP-USER-API-KEY" }
    }
  }
}
```

This means Claude Code skills can directly create draft content entries, update existing guides, query collections for content auditing, and manage translations — all through Payload's permission system with human review before publish.

Three additional Payload CMS MCP servers extend this: **ohnicholas93/payload-mcp-server** (https://github.com/ohnicholas93/payload-mcp-server) provides Python-based REST API access with batch creation, MongoDB-like search queries, and localization support; **disruption-hub/payloadcmsmcp** handles schema scaffolding and code validation; and **@ai-stack/payloadcms** (https://github.com/ashbuilds/payload-ai) integrates AI directly into the Payload admin panel with "Generate with AI" in the Lexical editor.

For SEO, the **Content Optimizer MCP** (installable via `npx -y content-optimizer-mcp`) provides SERP-based content scoring across seven SEO categories, Flesch-Kincaid readability analysis, heading optimization, and entity coverage — a free, self-hosted alternative to tools costing $89–170/month. **seo-mcp** (https://github.com/cnych/seo-mcp) provides Ahrefs-based keyword research and backlink analysis.

For translation, **Lara Translate MCP** (https://github.com/translated/lara-mcp) offers context-aware translation with translation memory support for brand consistency across large content libraries. **DeepL MCP** provides high-quality neural machine translation with formality control. **Lokalise MCP** (https://github.com/AbdallahAHO/lokalise-mcp) manages full localization workflows with 59 tools across 11 domains.

The **Markdown Editor MCP** (https://github.com/KazKozDev/markdown-editor-mcp-server) enables semantic editing of markdown files — structural navigation, content manipulation, and YAML frontmatter management — letting Claude surgically edit content sections without rewriting entire documents.

---

## Content workflow skills for translation, review, and fact-checking

Translation and localization skills are actively developing. **better-i18n/skills** (https://github.com/better-i18n/skills) provides official i18n agent skills for translation workflows, installable via `npx skills add better-i18n/skills`. The pattern from **xcstrings-localize** (https://github.com/CH3COOH/claude-skills) — detect target languages → translate → validate — generalizes well to web content localization.

For editorial review, the most sophisticated pattern comes from **ClaudeBlattman** (https://github.com/chrisblattman/claudeblattman) by University of Chicago professor Chris Blattman: it implements **simulated blind peer review** with two independent Referee agents plus an Editor agent making Accept/Minor/Major/Reject decisions. The peer review pattern — multiple independent reviewers plus an editorial decision agent — adapts directly to content editorial workflows. Its writing style rules ("numbers over adjectives, topic sentences make claims, no throat-clearing") are immediately reusable in a content style skill.

**AI Journalism Skills** (fdaudens/ai-journalism-skills) provides structured fact-checking and verification workflows, installable via `/plugin marketplace add fdaudens/ai-journalism-skills` then `/plugin install fact-checker@ai-journalism-skills`. The fact-checker skill is directly applicable to validating claims in switch-to.eu service guides.

The multi-skill workflow pattern from **Gixo Engineering** demonstrates how to chain skills for content operations: a blog-writing-assistant skill creates outlines, a deep-research-agent gathers information, a technical-verification-planner validates claims, an article-review-assistant checks quality, and a publish-assistant optimizes for the target platform. Their key lesson: apply the **Single Responsibility Principle** to each skill and invest time mapping "in what situations will this skill be used" before building.

---

## Skill libraries and discovery platforms worth bookmarking

The ecosystem has consolidated around several major hubs:

- **anthropics/skills** (https://github.com/anthropics/skills) — official reference with 37,500+ stars, document creation skills, and a skill template
- **alirezarezvani/claude-skills** (https://github.com/alirezarezvani/claude-skills) — **192+ production-ready skills** across engineering, marketing (43 skills), product, and compliance, with 6,600+ stars
- **VoltAgent/awesome-agent-skills** (https://github.com/VoltAgent/awesome-agent-skills) — the most-contributed community list with 1,000+ skills from official teams (Anthropic, Google Labs, Vercel, Stripe, Cloudflare)
- **hesreallyhim/awesome-claude-code** (https://github.com/hesreallyhim/awesome-claude-code) — the definitive curated list of skills, hooks, slash-commands, and agent orchestrators
- **OpenClaudia/openclaudia-skills** (https://github.com/OpenClaudia/openclaudia-skills) — 34 marketing skills with SemRush, Ahrefs, and Google Analytics integrations

Discovery platforms include **SkillsMP** (https://skillsmp.com/) indexing 500,000+ agent skills from GitHub, **ClaudeMarketplaces** (https://claudemarketplaces.com/) ranking plugins by install count, and **SkillKit** (https://github.com/rohitg00/skillkit) managing installations across 40+ agent platforms from a unified CLI.

---

## A practical architecture for switch-to.eu

Based on everything documented above, here is how these pieces assemble for a Payload CMS content pipeline with human review:

**Research phase**: Use a research skill (adapted from Gixo's `deep-research-agent` or the Trend-Pulse MCP for topic discovery) to gather service information. Claude Code's built-in web search plus an SEO keyword research skill (`seo-geo-claude-skills` keyword-research) identifies target terms.

**Writing phase**: A custom `guide-writer` skill, built from the claude-blog `blog-write` pattern with switch-to.eu's tone of voice rules, banned words list, and structural templates, generates draft guides. The Humanizer skill runs as a second pass to strip AI patterns.

**SEO check phase**: The `blog-seo-check` skill or Content Optimizer MCP scores the content, checks meta descriptions, validates heading structure, and confirms keyword density. A readability script in `scripts/` calculates Flesch-Kincaid scores.

**Translation phase**: Lara Translate or DeepL MCP handles initial translation, with translation memory ensuring terminology consistency. Content enters Payload CMS as draft entries in each locale via the official `@payloadcms/plugin-mcp`.

**Review phase**: All content enters Payload as **draft status**, surfaced in the admin UI for human editors. A review skill (adapted from ClaudeBlattman's peer review pattern) can pre-flag issues before human review. Nothing publishes without explicit human approval.

The two most cited lessons from teams running these workflows at scale: **never publish directly from a writer agent** (always run through an audit skill that checks banned words, formatting, tone, and technical SEO), and **make skill descriptions aggressively specific** (Claude under-triggers skills with vague descriptions). The entire stack costs roughly **$0.15–$0.50 per content batch** at current Claude pricing, with the real investment being skill customization and editorial process design.

## Conclusion

The Claude Code content skills ecosystem is far more mature than most teams realize. Rather than building custom AI content tooling from scratch, switch-to.eu can assemble a functional pipeline from existing open-source components within days. The three highest-leverage starting points are: install **Humanizer** for immediate writing quality improvement, deploy the **official Payload CMS MCP plugin** for direct CMS integration, and adapt **claude-blog's 19-skill architecture** as the structural template for your editorial workflow. The gap is not in tooling availability — it's in customizing these generic skills with switch-to.eu's specific brand voice, editorial standards, and review checkpoints. Every skill file is just markdown that your editors can read, review, and refine alongside the content itself.

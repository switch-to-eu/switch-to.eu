# Switch-to.eu

A community-driven platform helping users switch from non-EU digital services to EU alternatives through clear, step-by-step migration guides.

**Live Site**: [switch-to.eu](https://switch-to.eu)

## About

Switch-to.eu empowers users to regain digital sovereignty by providing:

- **Migration Guides** — step-by-step instructions to switch from non-EU services to EU alternatives
- **EU Alternative Listings** — comprehensive database of EU digital services by category
- **Community Contributions** — GitHub-based collaboration for content improvement and expansion

## Monorepo Structure

This is a **pnpm workspace** monorepo orchestrated by **Turborepo**.

```
apps/
  website/          # Main switch-to.eu site
  keepfocus/        # Pomodoro timer app
  plotty/           # Privacy-focused poll/voting app (tRPC + Redis)
  listy/            # Collaborative list/ranking tool (tRPC + Redis)
  website-tool/     # Website analyzer tool

packages/
  ui/               # Shared UI components (shadcn/ui, Radix primitives)
  i18n/             # Shared i18n (next-intl v4, locales: en, nl)
  blocks/           # Page-level shared components (Header, Footer)
  content/          # Content system (Markdown, Zod schemas, Fuse.js search)
  trpc/             # Shared tRPC v11 infrastructure
  db/               # Shared database utilities (Redis)
  eslint-config/    # Shared ESLint 9 flat configs
  typescript-config/ # Shared tsconfig bases
```

All internal packages use the `@switch-to-eu/` scope.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI primitives
- **API**: tRPC v11 (plotty, listy)
- **Data**: Redis (via Upstash)
- **i18n**: next-intl v4 (en, nl)
- **Content**: Markdown with frontmatter (git submodule)
- **Deployment**: Vercel

## Local Development

```bash
# Clone the repository (with content submodule)
git clone https://github.com/switch-to-eu/switch-to.eu.git
cd switch-to.eu
git submodule update --init

# Install dependencies
pnpm install

# Start all dev servers
pnpm dev

# Or run a specific app
pnpm --filter website dev
pnpm --filter @switch-to-eu/keepfocus dev
pnpm --filter @switch-to-eu/plotty dev
```

## Build & Test

```bash
pnpm build             # Build all apps/packages
pnpm lint              # Lint all apps/packages

# E2E smoke tests
pnpm --filter website test:e2e

# Unit tests (keepfocus)
pnpm --filter @switch-to-eu/keepfocus test
```

## Contributing

We welcome contributions! See our [Contribution Guidelines](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Clone your fork and create a new branch
3. Make your changes
4. Submit a pull request with a clear description

## Acknowledgements

- All contributors who have helped build this platform
- The EU digital services that provide alternatives to non-EU services
- The open-source community for the tools and libraries used in this project
- See [CREDITS.md](./CREDITS.md) for detailed attribution of fonts and other resources

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/switch-to-eu/switch-to.eu?utm_source=oss&utm_medium=github&utm_campaign=switch-to-eu%2Fswitch-to.eu&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

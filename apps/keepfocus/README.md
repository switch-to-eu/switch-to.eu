# keepfocus

A Next.js application in the tools-mono monorepo.

## Development

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter=@workspace/keepfocus dev

# Build the app
pnpm --filter=@workspace/keepfocus build

# Run database commands
pnpm --filter=@workspace/keepfocus db:push
pnpm --filter=@workspace/keepfocus db:studio
```

## Environment Variables

Create a `.env.local` file in this directory with:

```
DATABASE_URL="postgresql://..."
```

## Features

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- tRPC for type-safe APIs
- Drizzle ORM with PostgreSQL
- Internationalization with next-intl
- Shared UI components from @switch-to-eu/ui

# @switch-to-eu/trpc

Shared tRPC v11 infrastructure for consistent configuration across all apps in the monorepo.

## Exports

### `@switch-to-eu/trpc/init`

Initializes tRPC with SuperJSON transformer, Zod error formatting (dev only), and SSE support.

```typescript
import { createTRPCInit } from "@switch-to-eu/trpc/init";

const t = createTRPCInit(createTRPCContext);
```

### `@switch-to-eu/trpc/middleware`

Reusable middleware exposed as tRPC procedures. Apps compose them via `.concat()` for full type safety — no `any` types needed.

```typescript
import { timingProcedure, createRateLimitProcedure } from "@switch-to-eu/trpc/middleware";

export const publicProcedure = t.procedure
  .concat(timingProcedure)
  .concat(
    createRateLimitProcedure({
      prefix: "myapp",
      windowMs: 60_000,
      maxRequests: 30,
    }),
  );
```

- **`timingProcedure`** — adds 100-400ms artificial delay in development to surface waterfalls.
- **`createRateLimitProcedure`** — Redis sliding window rate limiter per IP. Requires `headers` and `redis` in the app's tRPC context.

### `@switch-to-eu/trpc/query-client`

Shared React Query client with SuperJSON serialization and 30s SSR stale time.

```typescript
import { createQueryClient } from "@switch-to-eu/trpc/query-client";
```

### `@switch-to-eu/trpc/react`

Client-side utilities: `getQueryClient` (singleton), `getBaseUrl` (auto-detects localhost/Vercel), and re-exports `createTRPCReact`.

```typescript
import { createTRPCReact, getBaseUrl, getQueryClient } from "@switch-to-eu/trpc/react";
```

### `@switch-to-eu/trpc/server`

Server context factory for React Server Components. Wraps your app's `createTRPCContext` with `cache()` and sets the `x-trpc-source: rsc` header.

```typescript
import { createServerContext } from "@switch-to-eu/trpc/server";

const createContext = createServerContext(createTRPCContext);
```

## Usage

### `server/api/trpc.ts`

```typescript
import { createTRPCInit } from "@switch-to-eu/trpc/init";
import { timingProcedure, createRateLimitProcedure } from "@switch-to-eu/trpc/middleware";
import { getRedis } from "@switch-to-eu/db/redis";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const redis = await getRedis();
  return { redis, ...opts };
};

const t = createTRPCInit(createTRPCContext);

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure
  .concat(timingProcedure)
  .concat(
    createRateLimitProcedure({
      prefix: "myapp",
      windowMs: 60_000,
      maxRequests: 30,
    }),
  );
```

### `server/api/trpc-server.ts`

```typescript
import "server-only";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";

import { createCaller, type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createQueryClient } from "@switch-to-eu/trpc/query-client";
import { createServerContext } from "@switch-to-eu/trpc/server";

const createContext = createServerContext(createTRPCContext);
const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } =
  createHydrationHelpers<AppRouter>(caller, getQueryClient);
```

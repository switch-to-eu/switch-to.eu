# @workspace/trpc

Shared tRPC utilities for consistent configuration across all apps in the monorepo.

## Exports

### `@workspace/trpc/query-client`

Shared React Query client configuration with SuperJSON serialization.

```typescript
import { createQueryClient } from "@workspace/trpc/query-client";
```

### `@workspace/trpc/init`

Utility for initializing tRPC with consistent settings (SuperJSON, Zod error handling, SSE).

```typescript
import { createTRPCInit } from "@workspace/trpc/init";

const t = createTRPCInit(createTRPCContext, {
  enableSSE: true, // optional, defaults to true
});
```

### `@workspace/trpc/middleware`

Reusable timing middleware that adds development delays and logs execution time.

```typescript
import { createTimingMiddleware } from "@workspace/trpc/middleware";

const timingMiddleware = createTimingMiddleware(t);
const publicProcedure = t.procedure.use(timingMiddleware);
```

### `@workspace/trpc/server`

Server context utility for React Server Components with standardized headers.

```typescript
import { createServerContext } from "@workspace/trpc/server";

const createContext = createServerContext(createTRPCContext);
```

## Usage Example

Here's how to use these utilities in your app's `server/api/trpc.ts`:

```typescript
import { createTRPCInit } from "@workspace/trpc/init";
import { createTimingMiddleware } from "@workspace/trpc/middleware";
import { db } from "@/server/db";

// 1. Create your context
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

// 2. Initialize tRPC with shared configuration
const t = createTRPCInit(createTRPCContext, {
  enableSSE: true,
});

// 3. Create router and middleware
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const timingMiddleware = createTimingMiddleware(t);
export const publicProcedure = t.procedure.use(timingMiddleware);
```

And in your `server/api/trpc-server.ts`:

```typescript
import "server-only";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";

import { createCaller, type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createQueryClient } from "@workspace/trpc/query-client";
import { createServerContext } from "@workspace/trpc/server";

const createContext = createServerContext(createTRPCContext);
const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
```

## Benefits

- **Consistency**: All apps use the same tRPC configuration
- **DRY**: No code duplication across apps
- **Maintainability**: Updates to shared utilities affect all apps
- **Type Safety**: Full TypeScript support
- **Flexibility**: Apps can still customize as needed

## Migration

To migrate existing apps:

1. Replace `initTRPC` usage with `createTRPCInit`
2. Replace manual timing middleware with `createTimingMiddleware`
3. Replace manual context creation with `createServerContext`
4. Update imports to use the shared utilities

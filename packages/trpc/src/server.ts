import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

/**
 * Creates a standardized context factory for tRPC server-side calls from React Server Components.
 * This ensures all apps use the same headers setup and caching strategy.
 *
 * @param createTRPCContext - Your app's createTRPCContext function
 * @returns A cached context creator with standardized RSC headers
 */
export function createServerContext<T>(
  createTRPCContext: (opts: { headers: Headers }) => Promise<T>
) {
  return cache(async () => {
    const heads = new Headers(await headers());
    heads.set("x-trpc-source", "rsc");

    return createTRPCContext({
      headers: heads,
    });
  });
}

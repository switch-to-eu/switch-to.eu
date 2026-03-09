import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

/**
 * Creates a tRPC instance with consistent configuration across all apps.
 * Includes SuperJSON transformer, Zod error formatting, and SSE support.
 *
 * @param createTRPCContext - Your app's context creator function
 * @returns Configured tRPC instance with standardized settings
 */
export function createTRPCInit<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCreateTRPCContext extends (...args: any[]) => any,
>(createTRPCContext: TCreateTRPCContext) {
  return initTRPC.context<TCreateTRPCContext>().create({
    transformer: superjson,
    isDev: process.env.NODE_ENV === "development",
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            process.env.NODE_ENV === "development" &&
            error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
        },
      };
    },
    sse: {
      ping: {
        enabled: true,
        intervalMs: 2_000,
      },
      client: {
        reconnectAfterInactivityMs: 5_000,
      },
    },
  });
}

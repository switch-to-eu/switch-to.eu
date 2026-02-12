import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

interface ErrorFormatterOptions {
  shape: {
    data: Record<string, unknown>;
    [key: string]: unknown;
  };
  error: {
    cause?: unknown;
    [key: string]: unknown;
  };
}

export interface TRPCInitOptions {
  /**
   * Enable Server-Sent Events configuration
   */
  enableSSE?: boolean;
  /**
   * Custom error formatter (optional)
   */
  customErrorFormatter?: (opts: ErrorFormatterOptions) => {
    data: Record<string, unknown>;
    [key: string]: unknown;
  };
}

/**
 * Creates a tRPC instance with consistent configuration across all apps.
 * Includes SuperJSON transformer, Zod error formatting, and optional SSE support.
 *
 * @param createTRPCContext - Your app's context creator function
 * @param options - Configuration options
 * @returns Configured tRPC instance with standardized settings
 */
export function createTRPCInit<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCreateTRPCContext extends (...args: any[]) => any,
>(createTRPCContext: TCreateTRPCContext, options: TRPCInitOptions = {}) {
  const { customErrorFormatter } = options;

  const config = {
    transformer: superjson,
    errorFormatter:
      customErrorFormatter ||
      (({ shape, error }: ErrorFormatterOptions) => {
        return {
          ...shape,
          data: {
            ...shape.data,
            zodError:
              error.cause instanceof ZodError ? error.cause.flatten() : null,
          },
        };
      }),
    sse: {
      ping: {
        enabled: true,
        intervalMs: 2_000,
      },
      client: {
        reconnectAfterInactivityMs: 5_000,
      },
    },
  };

  return initTRPC.context<TCreateTRPCContext>().create(config);
}

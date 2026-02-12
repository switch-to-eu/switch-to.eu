interface TRPCInstance {
  middleware: (fn: MiddlewareFunction) => unknown;
  _config?: {
    isDev?: boolean;
  };
}

interface MiddlewareContext {
  next: () => Promise<unknown>;
  path: string;
}

type MiddlewareFunction = (context: MiddlewareContext) => Promise<unknown>;

/**
 * Reusable timing middleware for tRPC procedures.
 * Adds artificial delay in development and logs execution time.
 *
 * @param t - tRPC instance created with initTRPC
 * @returns Timing middleware that can be used with procedures
 */
export function createTimingMiddleware(t: TRPCInstance) {
  return t.middleware(async ({ next }: MiddlewareContext) => {
    if (t._config?.isDev) {
      // artificial delay in dev
      const waitMs = Math.floor(Math.random() * 400) + 100;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    return result;
  });
}

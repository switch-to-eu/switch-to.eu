/**
 * Reusable timing middleware for tRPC procedures.
 * Adds artificial delay in development and logs execution time.
 *
 * @param t - tRPC instance created with initTRPC
 * @returns Timing middleware that can be used with procedures
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTimingMiddleware(t: any) {
  return t.middleware(async ({ next }: { next: () => Promise<unknown>; path: string }) => {
    if (t._config?.isDev) {
      // artificial delay in dev
      const waitMs = Math.floor(Math.random() * 400) + 100;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    return result;
  });
}

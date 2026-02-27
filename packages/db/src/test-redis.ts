/**
 * Shared Testcontainers Redis helper for integration tests.
 *
 * Spins up a real Redis container in Docker. Use in vitest globalSetup
 * or directly in test files with beforeAll/afterAll.
 *
 * Usage:
 *   import { setupRedisContainer, teardownRedisContainer, getTestRedisUrl } from "@switch-to-eu/db/test-redis";
 *
 *   beforeAll(async () => { await setupRedisContainer(); });
 *   afterAll(async () => { await teardownRedisContainer(); });
 *
 *   // Use getTestRedisUrl() for the connection URL
 */
import { RedisContainer, type StartedRedisContainer } from "@testcontainers/redis";

let container: StartedRedisContainer | null = null;

export async function setupRedisContainer(): Promise<string> {
  container = await new RedisContainer("redis:7-alpine").start();
  const url = container.getConnectionUrl();
  process.env.REDIS_URL = url;
  return url;
}

export async function teardownRedisContainer(): Promise<void> {
  if (container) {
    await container.stop();
    container = null;
  }
}

export function getTestRedisUrl(): string {
  if (!container) {
    throw new Error(
      "Redis container not started. Call setupRedisContainer() first.",
    );
  }
  return container.getConnectionUrl();
}

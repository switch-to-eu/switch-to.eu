import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
  redisSubscriber: RedisClientType | undefined;
};

async function createRedisClient(url: string): Promise<RedisClientType> {
  const client = createClient({ url });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();
  return client as RedisClientType;
}

export async function getRedis(url?: string): Promise<RedisClientType> {
  if (globalForRedis.redis?.isReady) {
    return globalForRedis.redis;
  }

  const redisUrl = url ?? process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
  }

  const client = await createRedisClient(redisUrl);
  globalForRedis.redis = client;
  return client;
}

/**
 * Shared subscriber connection for Pub/Sub.
 * Redis requires a dedicated connection for subscribers — a client in subscribe mode
 * cannot execute other commands. This is cached globally so all subscriptions share
 * a single connection rather than creating one per SSE client.
 */
export async function getRedisSubscriber(url?: string): Promise<RedisClientType> {
  if (globalForRedis.redisSubscriber?.isReady) {
    return globalForRedis.redisSubscriber;
  }

  const redisUrl = url ?? process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
  }

  const client = await createRedisClient(redisUrl);
  globalForRedis.redisSubscriber = client;
  return client;
}

export type { RedisClientType } from "redis";

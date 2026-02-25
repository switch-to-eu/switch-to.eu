import { createClient, type RedisClientType } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is required");
}

/**
 * Cache Redis connections globally. In production, serverless functions may share
 * the same process, so caching avoids creating new connections per request.
 */
const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
  redisSubscriber: RedisClientType | undefined;
};

async function createRedisClient(): Promise<RedisClientType> {
  const client = createClient({ url: redisUrl });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();
  return client as RedisClientType;
}

export async function getRedis(): Promise<RedisClientType> {
  if (globalForRedis.redis?.isReady) {
    return globalForRedis.redis;
  }

  const client = await createRedisClient();
  globalForRedis.redis = client;
  return client;
}

/**
 * Shared subscriber connection for Pub/Sub.
 * Redis requires a dedicated connection for subscribers — a client in subscribe mode
 * cannot execute other commands. This is cached globally so all subscriptions share
 * a single connection rather than creating one per SSE client.
 */
export async function getRedisSubscriber(): Promise<RedisClientType> {
  if (globalForRedis.redisSubscriber?.isReady) {
    return globalForRedis.redisSubscriber;
  }

  const client = await createRedisClient();
  globalForRedis.redisSubscriber = client;
  return client;
}

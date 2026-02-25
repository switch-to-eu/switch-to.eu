import { createClient, type RedisClientType } from "redis";

function getRedisUrl(): string {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is required");
  }
  return url;
}

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
  redisSubscriber: RedisClientType | undefined;
};

async function createRedisClient(): Promise<RedisClientType> {
  const client = createClient({ url: getRedisUrl() });

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

export async function getRedisSubscriber(): Promise<RedisClientType> {
  if (globalForRedis.redisSubscriber?.isReady) {
    return globalForRedis.redisSubscriber;
  }

  const client = await createRedisClient();
  globalForRedis.redisSubscriber = client;
  return client;
}

import { createClient, type RedisClientType } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is required");
}

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
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

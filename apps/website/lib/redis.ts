import { createClient } from "redis";

// Create a Redis client factory function to avoid reconnecting on every request
let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient(): Promise<ReturnType<typeof createClient>> {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
  }
  return client;
}

export async function getFromRedis(key: string) {
  try {
    const redis = await getRedisClient();
    return await redis.get(key);
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

export async function setInRedis(
  key: string,
  value: string | object,
  expiryInSeconds = 60 * 60 * 24 * 7
) {
  try {
    const redis = await getRedisClient();
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    await redis.set(key, stringValue);
    await redis.expire(key, expiryInSeconds);
    return true;
  } catch (error) {
    console.error("Redis set error:", error);
    return false;
  }
}

import { createClient } from "redis";

if (!process.env.REDIS_URL) {
  throw new Error("Missing REDIS_URL");
}

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

if (!redis.isOpen) {
  await redis.connect();
}
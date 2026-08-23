import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is not set");
}

export const redis = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
  lazyConnect: false,
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => console.log("[Redis] Connected"));
redis.on("error", (err) => console.error("[Redis] Error:", err.message));

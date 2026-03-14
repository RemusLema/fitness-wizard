// src/lib/redis.ts — Shared Upstash Redis client
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
    // Upstash uses these env vars (auto-set by Vercel when KV store was migrated)
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || url === "REPLACE_ME" || token === "REPLACE_ME") {
        return null;
    }

    if (!redis) {
        redis = new Redis({ url, token });
    }

    return redis;
}

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

// Fallback mock member list when Redis is not available/configured in development
const FALLBACK_MEMBERS: Record<string, string[]> = {
    "waka-fitness": ["waka@test.com", "0788123456", "hello@ramafit.xyz", "member@waka.fit"],
    "cali-fitness": ["cali@test.com", "0788654321", "member@cali.fit"]
};

/**
 * Checks if a member email or phone number is active for a given gym.
 * Queries Redis if available, otherwise falls back to a predefined development mock list.
 */
export async function isGymMemberActive(gymSlug: string, emailOrPhone: string): Promise<boolean> {
    const formattedInput = emailOrPhone.trim().toLowerCase();
    if (!formattedInput) return false;

    const client = getRedis();
    if (client) {
        try {
            // Check if member is stored in the gym's verified members set
            const exists = await client.sismember(`gym:${gymSlug}:members`, formattedInput);
            return exists === 1;
        } catch (err) {
            console.error("Redis isGymMemberActive error, falling back to mock lists:", err);
        }
    }

    // Fallback logic for local testing/dev
    const fallbackList = FALLBACK_MEMBERS[gymSlug] || [];
    return fallbackList.map(item => item.toLowerCase()).includes(formattedInput);
}

/**
 * Logs a plan generation event in Redis under the gym's usage tracker.
 */
export async function logGymPlanGeneration(gymSlug: string, emailOrPhone: string): Promise<void> {
    const client = getRedis();
    const timestamp = Date.now();
    const formattedInput = emailOrPhone.trim().toLowerCase();

    if (client) {
        try {
            // Push generation record to a sorted set for usage reporting and timelines
            await client.zadd(`gym:${gymSlug}:usage`, { score: timestamp, member: `${formattedInput}:${timestamp}` });
            // Increment the counter for this gym
            await client.incr(`gym:${gymSlug}:total_generations`);
        } catch (err) {
            console.error("Redis logGymPlanGeneration error:", err);
        }
    } else {
        console.log(`[B2B Gym Log] Local usage recorded: 1 plan generated for ${formattedInput} at ${gymSlug}`);
    }
}

/**
 * Returns the full authorized member list for a gym.
 * Reads from Redis set; falls back to mock list in dev.
 */
export async function getGymMembers(gymSlug: string): Promise<string[]> {
    const client = getRedis();
    if (client) {
        try {
            const members = await client.smembers(`gym:${gymSlug}:members`);
            return (members as string[]).sort();
        } catch (err) {
            console.error("Redis getGymMembers error:", err);
        }
    }
    // Fallback for dev
    return FALLBACK_MEMBERS[gymSlug] || [];
}

/**
 * Adds a member email/phone to the gym's authorized Redis set.
 * Returns true if newly added, false if already present.
 */
export async function addGymMember(gymSlug: string, emailOrPhone: string): Promise<boolean> {
    const normalized = emailOrPhone.trim().toLowerCase();
    if (!normalized) return false;

    const client = getRedis();
    if (client) {
        try {
            const added = await client.sadd(`gym:${gymSlug}:members`, normalized);
            return added === 1;
        } catch (err) {
            console.error("Redis addGymMember error:", err);
        }
    }
    // Dev: mutate in-memory fallback
    const list = FALLBACK_MEMBERS[gymSlug] || [];
    if (!list.map(i => i.toLowerCase()).includes(normalized)) {
        FALLBACK_MEMBERS[gymSlug] = [normalized, ...list];
        return true;
    }
    return false;
}

/**
 * Removes a member email/phone from the gym's authorized Redis set.
 * Returns true if removed, false if it wasn't present.
 */
export async function removeGymMember(gymSlug: string, emailOrPhone: string): Promise<boolean> {
    const normalized = emailOrPhone.trim().toLowerCase();
    if (!normalized) return false;

    const client = getRedis();
    if (client) {
        try {
            const removed = await client.srem(`gym:${gymSlug}:members`, normalized);
            return removed === 1;
        } catch (err) {
            console.error("Redis removeGymMember error:", err);
        }
    }
    // Dev: mutate in-memory fallback
    if (FALLBACK_MEMBERS[gymSlug]) {
        const before = FALLBACK_MEMBERS[gymSlug].length;
        FALLBACK_MEMBERS[gymSlug] = FALLBACK_MEMBERS[gymSlug].filter(
            i => i.toLowerCase() !== normalized
        );
        return FALLBACK_MEMBERS[gymSlug].length < before;
    }
    return false;
}

/**
 * Increments the goal counter for analytics.
 * Stored as a Redis hash: gym:{slug}:goals  →  { weight_loss: N, muscle_gain: N, … }
 */
export async function logGymGoal(gymSlug: string, goal: string): Promise<void> {
    if (!gymSlug || !goal) return;
    const client = getRedis();
    if (client) {
        try {
            await client.hincrby(`gym:${gymSlug}:goals`, goal, 1);
        } catch (err) {
            console.error("Redis logGymGoal error:", err);
        }
    }
}

/**
 * Reads real goal counts from Redis and returns percentage breakdown.
 * Returns null if Redis is unavailable (caller should use mock data).
 */
export async function getGymGoalBreakdown(gymSlug: string): Promise<Record<string, number> | null> {
    const client = getRedis();
    if (!client) return null;
    try {
        const raw = await client.hgetall(`gym:${gymSlug}:goals`) as Record<string, string> | null;
        if (!raw || Object.keys(raw).length === 0) return null;

        const counts: Record<string, number> = {};
        let total = 0;
        for (const [goal, count] of Object.entries(raw)) {
            counts[goal] = parseInt(count, 10);
            total += counts[goal];
        }
        if (total === 0) return null;

        const pct: Record<string, number> = {};
        for (const [goal, count] of Object.entries(counts)) {
            pct[goal] = Math.round((count / total) * 100);
        }
        return pct;
    } catch (err) {
        console.error("Redis getGymGoalBreakdown error:", err);
        return null;
    }
}

/**
 * Persists the gym's active equipment list to Redis.
 */
export async function setGymEquipment(gymSlug: string, equipment: string[]): Promise<void> {
    const client = getRedis();
    if (client) {
        try {
            await client.set(`gym:${gymSlug}:equipment`, JSON.stringify(equipment));
        } catch (err) {
            console.error("Redis setGymEquipment error:", err);
        }
    }
}

/**
 * Retrieves the gym's active equipment list from Redis.
 * Returns null if not set (caller should fall back to gymConfig defaults).
 */
export async function getGymEquipment(gymSlug: string): Promise<string[] | null> {
    const client = getRedis();
    if (!client) return null;
    try {
        const raw = await client.get<string>(`gym:${gymSlug}:equipment`);
        if (!raw) return null;
        return JSON.parse(raw) as string[];
    } catch (err) {
        console.error("Redis getGymEquipment error:", err);
        return null;
    }
}

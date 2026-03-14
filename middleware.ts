// middleware.ts — IP rate limiting for /api/generate-sample only
import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: ["/api/generate-sample"],
};

export async function middleware(req: NextRequest) {
    // Only rate-limit the sample endpoint
    if (!req.nextUrl.pathname.startsWith("/api/generate-sample")) {
        return NextResponse.next();
    }

    try {
        const { getRedis } = await import("@/lib/redis");
        const redis = getRedis();
        if (!redis) return NextResponse.next(); // Redis not configured — skip

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const key = `ratelimit:sample:${ip}`;
        const count = await redis.get<number>(key);

        if (count !== null && count >= 2) {
            return NextResponse.json(
                {
                    error:
                        "Too many free sample requests from your location. Try again tomorrow or upgrade for your full plan.",
                },
                { status: 429 }
            );
        }
    } catch {
        // Redis error — let request through (graceful degradation)
    }

    return NextResponse.next();
}

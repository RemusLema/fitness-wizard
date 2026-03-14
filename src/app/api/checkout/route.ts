// src/app/api/checkout/route.ts — Lemon Squeezy checkout
import { NextRequest, NextResponse } from "next/server";

const VARIANT_IDS: Record<string, string> = {
    starter: process.env.LS_STARTER_VARIANT_ID || "769073",
    transform: process.env.LS_TRANSFORM_VARIANT_ID || "846148",
    elite: process.env.LS_ELITE_VARIANT_ID || "846152",
};

export async function POST(req: NextRequest) {
    try {
        // ── Security: Body size limit ───────────────────────────────────────
        const contentLength = req.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > 10240) {
            return NextResponse.json({ error: "Request too large" }, { status: 413 });
        }

        // ── Security: IP rate limiting (5 checkouts per IP per hour) ────────
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") || "unknown";

        try {
            const { getRedis } = await import("@/lib/redis");
            const redis = getRedis();
            if (redis) {
                const key = `ratelimit:checkout:${ip}`;
                const count = await redis.get<number>(key);
                if (count !== null && count >= 5) {
                    return NextResponse.json(
                        { error: "Too many checkout attempts. Please try again later." },
                        { status: 429 }
                    );
                }
                await redis.set(key, (count || 0) + 1, { ex: 3600 });
            }
        } catch { /* Redis not configured — skip rate limiting */ }

        const body = await req.json();
        const { tier, formData } = body;

        // ── Security: Strict tier validation ────────────────────────────────
        const validTiers = ["starter", "transform", "elite"];
        if (!tier || !validTiers.includes(tier) || !VARIANT_IDS[tier]) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }
        if (!formData?.email || !formData?.name) {
            return NextResponse.json({ error: "Name and email required" }, { status: 400 });
        }

        const apiKey = process.env.LEMONSQUEEZY_API_KEY;
        const storeId = process.env.LEMONSQUEEZY_STORE_ID;
        if (!apiKey || !storeId) {
            return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        // Pack formData into custom data for webhook retrieval
        const customData = {
            name: formData.name,
            email: formData.email,
            goal: formData.goal || "",
            fitnessLevel: formData.fitnessLevel || "",
            timeline: formData.timeline || "",
            tier,
            dietaryPreference: formData.dietaryPreference || "",
            equipment: Array.isArray(formData.equipment) ? formData.equipment.join(",") : "",
            waterIntake: formData.waterIntake || "",
            workoutLocation: formData.workoutLocation || "",
            intensity: formData.intensity || "",
            age: formData.age || "",
            gender: formData.gender || "",
        };

        const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
            method: "POST",
            headers: {
                "Accept": "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                data: {
                    type: "checkouts",
                    attributes: {
                        checkout_data: {
                            email: formData.email,
                            name: formData.name,
                            custom: customData,
                        },
                        product_options: {
                            redirect_url: `${baseUrl}/success?tier=${tier}`,
                        },
                    },
                    relationships: {
                        store: {
                            data: { type: "stores", id: storeId },
                        },
                        variant: {
                            data: { type: "variants", id: VARIANT_IDS[tier] },
                        },
                    },
                },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Lemon Squeezy error:", response.status, errText);
            return NextResponse.json(
                { error: "Failed to create checkout", details: `LS API returned ${response.status}` },
                { status: 500 }
            );
        }

        const result = await response.json();
        const checkoutUrl = result?.data?.attributes?.url;

        if (!checkoutUrl) {
            return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
        }

        return NextResponse.json({ checkoutUrl });
    } catch (error: any) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}

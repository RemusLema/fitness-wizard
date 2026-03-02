// src/app/api/webhook/route.ts — Lemon Squeezy webhook handler
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("x-signature");
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!sig || !secret) {
        console.error("Missing webhook signature or secret");
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    try {
        if (!verifySignature(body, sig, secret)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
    } catch (err: any) {
        console.error("Signature verification error:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventName = event?.meta?.event_name;

    if (eventName === "order_created") {
        const customData = event?.meta?.custom_data || event?.data?.attributes?.first_order_item?.custom_data || {};

        // Try to extract formData from custom checkout data
        const formData = {
            name: customData.name || "",
            email: customData.email || event?.data?.attributes?.user_email || "",
            goal: customData.goal || "",
            fitnessLevel: customData.fitnessLevel || "",
            timeline: customData.timeline || "",
            dietaryPreference: customData.dietaryPreference || "",
            equipment: customData.equipment ? customData.equipment.split(",") : [],
            waterIntake: customData.waterIntake || "",
            workoutLocation: customData.workoutLocation || "",
            intensity: customData.intensity || "",
            age: customData.age || "",
            gender: customData.gender || "",
        };
        const tier = customData.tier || "starter";

        if (formData.name && formData.email) {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
                const internalSecret = process.env.INTERNAL_API_SECRET || "";
                await fetch(`${baseUrl}/api/generate-plan`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-internal-secret": internalSecret,
                    },
                    body: JSON.stringify({
                        ...formData,
                        tier,
                        want: { email: true, pdf: true },
                    }),
                });
                console.log("✅ Plan generation triggered via webhook for:", formData.name);
            } catch (err) {
                console.error("❌ Webhook plan generation error:", err);
            }
        }
    }

    return NextResponse.json({ received: true });
}

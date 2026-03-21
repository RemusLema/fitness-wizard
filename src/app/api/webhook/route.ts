// src/app/api/webhook/route.ts — Lemon Squeezy webhook handler
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { waitUntil } from "@vercel/functions";
import { generateAndEmailPlan } from "@/lib/services/planService";

function verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(payload).digest("hex");
    // timingSafeEqual requires equal-length buffers
    const sigBuf = Buffer.from(signature);
    const digBuf = Buffer.from(digest);
    if (sigBuf.length !== digBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, digBuf);
}

export async function POST(req: NextRequest) {
    console.log("🔔 Webhook received at", new Date().toISOString());

    let body: string;
    try {
        body = await req.text();
    } catch (err) {
        console.error("❌ Webhook: failed to read body", err);
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const sig = req.headers.get("x-signature");
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    console.log("🔔 Webhook: sig present:", !!sig, "| secret present:", !!secret, "| body length:", body.length);

    if (!sig || !secret) {
        console.error("❌ Webhook: Missing signature or secret");
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    try {
        if (!verifySignature(body, sig, secret)) {
            console.error("❌ Webhook: Signature mismatch");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
    } catch (err: any) {
        console.error("❌ Webhook: Signature verification crashed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("✅ Webhook: Signature verified");

    let event: any;
    try {
        event = JSON.parse(body);
    } catch (err) {
        console.error("❌ Webhook: Failed to parse JSON body");
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventName = event?.meta?.event_name;
    console.log("🔔 Webhook event:", eventName);

    if (eventName === "order_created") {
        // LS sends custom data in meta.custom_data
        const customData = event?.meta?.custom_data || {};
        const userEmail = event?.data?.attributes?.user_email || "";

        console.log("🔔 Webhook: custom_data keys:", Object.keys(customData));
        console.log("🔔 Webhook: user_email from order:", userEmail);

        // Try to extract formData from custom checkout data
        const formData = {
            name: customData.name || "",
            email: customData.email || userEmail,
            goal: customData.goal || "",
            fitnessLevel: customData.fitnessLevel || "",
            timeline: customData.timeline || "",
            dietaryPreference: customData.dietaryPreference || "",
            eatingStyle: customData.eatingStyle || "",
            localFoods: customData.localFoods ? customData.localFoods.split(",") : [],
            equipment: customData.equipment ? customData.equipment.split(",") : [],
            waterIntake: customData.waterIntake || "",
            workoutLocation: customData.workoutLocation || "",
            intensity: customData.intensity || "",
            age: customData.age || "",
            gender: customData.gender || "",
        };
        const tier = customData.tier || "starter";

        console.log("🔔 Webhook: Extracted — name:", formData.name, "| email:", formData.email, "| tier:", tier);

        if (formData.name && formData.email) {
            try {
                console.log("🔔 Webhook: Triggering generateAndEmailPlan internally...");
                
                // Use waitUntil to tell Vercel to keep this function alive until generation finishes
                waitUntil(
                    generateAndEmailPlan({
                        ...formData,
                        tier,
                        want: { email: true, pdf: true },
                    }).catch((err: any) => {
                        console.error("❌ Webhook: generateAndEmailPlan background error:", err);
                    })
                );
            } catch (err: any) {
                console.error("❌ Webhook: generateAndEmailPlan trigger error:", err);
            }
        } else {
            console.error("❌ Webhook: Missing name or email in custom_data. name:", formData.name, "email:", formData.email);
        }
    }

    return NextResponse.json({ received: true });
}

// src/app/api/webhook/route.ts — Lemon Squeezy webhook handler
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
                const internalSecret = process.env.INTERNAL_API_SECRET || "";
                console.log("🔔 Webhook: Calling generate-plan at", `${baseUrl}/api/generate-plan`);

                const genRes = await fetch(`${baseUrl}/api/generate-plan`, {
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

                const genStatus = genRes.status;
                const genBody = await genRes.text();
                console.log("🔔 Webhook: generate-plan response:", genStatus, genBody.slice(0, 200));

                if (genStatus === 200) {
                    console.log("✅ Plan generation triggered via webhook for:", formData.name);
                } else {
                    console.error("❌ Webhook: generate-plan failed with status", genStatus, genBody.slice(0, 500));
                }
            } catch (err: any) {
                console.error("❌ Webhook: generate-plan fetch error:", err.message);
            }
        } else {
            console.error("❌ Webhook: Missing name or email in custom_data. name:", formData.name, "email:", formData.email);
        }
    }

    return NextResponse.json({ received: true });
}

// src/app/api/generate-plan/route.tsx
// B2B plan generation endpoint — called directly when a gym member bypasses payment.
// Re-verifies gym membership server-side before generating; never trusts the client flag.
import { NextRequest, NextResponse } from "next/server";
import { generateAndEmailPlan } from "@/lib/services/planService";
import { isGymMemberActive } from "@/lib/redis";
import { getGymProfile } from "@/lib/gymConfig";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const gymSlug: string = (body.gymSlug || "").trim();
        const memberIdentifier: string = (body.memberIdentifier || "").trim();

        // ── B2B path: gym member bypass checkout ────────────────────────────
        // If gymSlug is present we MUST re-verify server-side.
        // A client cannot skip this by faking the memberVerified flag.
        if (gymSlug) {
            const gym = getGymProfile(gymSlug);
            if (!gym) {
                console.warn(`⚠️ generate-plan: unknown gymSlug "${gymSlug}"`);
                return NextResponse.json(
                    { error: "Partner gym not found. Please contact your gym administrator." },
                    { status: 400 }
                );
            }

            if (!memberIdentifier) {
                return NextResponse.json(
                    { error: "Member identifier required for gym bypass checkout." },
                    { status: 400 }
                );
            }

            const verified = await isGymMemberActive(gymSlug, memberIdentifier);
            if (!verified) {
                console.warn(
                    `⚠️ generate-plan: rejected unverified member "${memberIdentifier}" for gym "${gymSlug}"`
                );
                return NextResponse.json(
                    { error: "Membership verification failed. Your identifier is not on the active member roster." },
                    { status: 403 }
                );
            }

            console.log(
                `✅ generate-plan: verified member "${memberIdentifier}" for gym "${gymSlug}" — proceeding.`
            );
        }

        // ── Generate and email the plan ──────────────────────────────────────
        const result = await generateAndEmailPlan(body);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("❌ /api/generate-plan error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

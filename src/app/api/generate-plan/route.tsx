import { NextRequest, NextResponse } from "next/server";
import { generateAndEmailPlan } from "@/lib/services/planService";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // This acts as a wrapper for testing/manual triggering
        // The real generation is now triggered internally via webhook/route.ts -> planService.ts
        const result = await generateAndEmailPlan(body);
        
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("❌ /api/generate-plan wrapper error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

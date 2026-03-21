import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/services/roadmapService";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Wrapper for Postman testing
        const roadmap = await generateRoadmap(body);
        
        return NextResponse.json({ roadmap });
    } catch (error: any) {
        console.error("❌ /api/generate-roadmap wrapper error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

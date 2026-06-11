import { NextRequest, NextResponse } from "next/server";
import { isGymMemberActive } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gymSlug, emailOrPhone } = body;

    if (!gymSlug || !emailOrPhone) {
      return NextResponse.json({ error: "Missing required parameters: gymSlug, emailOrPhone" }, { status: 400 });
    }

    const isVerified = await isGymMemberActive(gymSlug, emailOrPhone);

    return NextResponse.json({ verified: isVerified });
  } catch (error: any) {
    console.error("❌ /api/verify-member error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

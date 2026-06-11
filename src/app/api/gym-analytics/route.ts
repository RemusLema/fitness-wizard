// src/app/api/gym-analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRedis, getGymGoalBreakdown } from "@/lib/redis";
import { getGymProfile } from "@/lib/gymConfig";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gymSlug = searchParams.get("gym");

    if (!gymSlug) {
      return NextResponse.json({ error: "Missing required query parameter: gym" }, { status: 400 });
    }

    const gym = getGymProfile(gymSlug);
    if (!gym) {
      return NextResponse.json({ error: "Gym profile not found" }, { status: 404 });
    }

    const client = getRedis();
    let totalGenerations = 0;

    // Mock fallback for when Redis isn't configured (dev/staging)
    const MOCK_BREAKDOWN = {
      weight_loss: 45,
      muscle_gain: 35,
      toning: 15,
      endurance: 5,
    };

    if (client) {
      try {
        const redisCount = await client.get(`gym:${gymSlug}:total_generations`);
        totalGenerations = redisCount ? parseInt(String(redisCount)) : 0;
      } catch (err) {
        console.error("Redis analytics query error:", err);
      }
    } else {
      // Mock stats for dev
      totalGenerations = 124;
    }

    // Read REAL goal breakdown from Redis; fall back to mock distribution
    const realBreakdown = await getGymGoalBreakdown(gymSlug);
    const goalBreakdown = realBreakdown ?? MOCK_BREAKDOWN;

    const planFee = 1.5; // $1.50 per plan Pay-As-You-Go trial fee
    const currentBill = totalGenerations * planFee;

    return NextResponse.json({
      success: true,
      gymName: gym.name,
      primaryColor: gym.primaryColor,
      secondaryColor: gym.secondaryColor,
      billingTier: gym.billingTier,
      totalGenerations,
      currentBill,
      goalBreakdown,
      equipmentCount: gym.equipmentList.length,
      isRealData: realBreakdown !== null,
    });
  } catch (error: any) {
    console.error("❌ /api/gym-analytics error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

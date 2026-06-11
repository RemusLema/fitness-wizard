// src/app/api/gym-equipment/route.ts
// GET  → fetch active equipment list from Redis (falls back to gymConfig)
// POST → save equipment list to Redis
import { NextRequest, NextResponse } from "next/server";
import { getGymProfile } from "@/lib/gymConfig";
import { getGymEquipment, setGymEquipment } from "@/lib/redis";
import { verifyCookieValue } from "@/app/api/gym-auth/route";

const COOKIE_NAME = "ramafit_gym_session";

function isAuthorized(req: NextRequest, gymSlug: string): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  return verifyCookieValue(cookie) === gymSlug;
}

// ── GET: return current equipment ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gymSlug = searchParams.get("gym");

    if (!gymSlug) {
      return NextResponse.json({ error: "Missing ?gym= parameter" }, { status: 400 });
    }
    const gym = getGymProfile(gymSlug);
    if (!gym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }
    if (!isAuthorized(req, gymSlug)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Redis first, fall back to gymConfig defaults
    const redisEquipment = await getGymEquipment(gymSlug);
    const equipment = redisEquipment ?? gym.equipmentList;

    return NextResponse.json({ success: true, equipment });
  } catch (err: any) {
    console.error("❌ GET /api/gym-equipment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST: save equipment list ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gymSlug, equipment } = body;

    if (!gymSlug || !Array.isArray(equipment)) {
      return NextResponse.json(
        { error: "Missing gymSlug or equipment array" },
        { status: 400 }
      );
    }
    if (!getGymProfile(gymSlug)) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }
    if (!isAuthorized(req, gymSlug)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate equipment items are strings
    const sanitized = equipment
      .filter((item): item is string => typeof item === "string")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    await setGymEquipment(gymSlug, sanitized);

    return NextResponse.json({
      success: true,
      equipment: sanitized,
      message: "Equipment inventory saved successfully",
    });
  } catch (err: any) {
    console.error("❌ POST /api/gym-equipment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

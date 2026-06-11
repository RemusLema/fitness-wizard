// src/app/api/gym-members/route.ts
// GET    → fetch member roster from Redis
// POST   → add a member to the roster
// DELETE → remove a member from the roster
import { NextRequest, NextResponse } from "next/server";
import { getGymProfile } from "@/lib/gymConfig";
import { getGymMembers, addGymMember, removeGymMember } from "@/lib/redis";
import { verifyCookieValue } from "@/app/api/gym-auth/route";

const COOKIE_NAME = "ramafit_gym_session";

/** Validate that the request cookie belongs to the given gymSlug */
function isAuthorized(req: NextRequest, gymSlug: string): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  const slug = verifyCookieValue(cookie);
  return slug === gymSlug;
}

// ── GET: list members ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gymSlug = searchParams.get("gym");

    if (!gymSlug) {
      return NextResponse.json({ error: "Missing ?gym= parameter" }, { status: 400 });
    }
    if (!getGymProfile(gymSlug)) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }
    if (!isAuthorized(req, gymSlug)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await getGymMembers(gymSlug);
    return NextResponse.json({ success: true, members });
  } catch (err: any) {
    console.error("❌ GET /api/gym-members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST: add member ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gymSlug, emailOrPhone } = body;

    if (!gymSlug || !emailOrPhone) {
      return NextResponse.json({ error: "Missing gymSlug or emailOrPhone" }, { status: 400 });
    }
    if (!getGymProfile(gymSlug)) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }
    if (!isAuthorized(req, gymSlug)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Basic format validation — must be email or phone
    const val = emailOrPhone.trim().toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isPhone = /^[\d\s+\-()]{7,20}$/.test(val);
    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { error: "Invalid format — must be a valid email or phone number" },
        { status: 400 }
      );
    }

    const added = await addGymMember(gymSlug, val);
    return NextResponse.json({
      success: true,
      added,
      message: added ? "Member registered successfully" : "Member already exists in roster",
    });
  } catch (err: any) {
    console.error("❌ POST /api/gym-members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE: remove member ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { gymSlug, emailOrPhone } = body;

    if (!gymSlug || !emailOrPhone) {
      return NextResponse.json({ error: "Missing gymSlug or emailOrPhone" }, { status: 400 });
    }
    if (!getGymProfile(gymSlug)) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }
    if (!isAuthorized(req, gymSlug)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const removed = await removeGymMember(gymSlug, emailOrPhone);
    return NextResponse.json({
      success: true,
      removed,
      message: removed ? "Member removed from roster" : "Member not found in roster",
    });
  } catch (err: any) {
    console.error("❌ DELETE /api/gym-members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

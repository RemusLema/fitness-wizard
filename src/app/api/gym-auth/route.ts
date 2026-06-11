// src/app/api/gym-auth/route.ts
// POST  → verify PIN, set signed session cookie
// DELETE → clear session cookie (logout)
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getGymProfile } from "@/lib/gymConfig";

const COOKIE_NAME = "ramafit_gym_session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

/** Sign a payload with HMAC-SHA256 using DASHBOARD_SECRET */
function sign(payload: string): string {
  const secret = process.env.DASHBOARD_SECRET || "ramafit-dev-secret-change-in-prod";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/** Build the cookie value: `{payload}.{hmac}` */
function buildCookieValue(gymSlug: string): string {
  const payload = `${gymSlug}:${Date.now()}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

/** Verify a cookie value and return the gymSlug, or null if invalid */
export function verifyCookieValue(cookie: string): string | null {
  const lastDot = cookie.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = cookie.slice(0, lastDot);
  const sig = cookie.slice(lastDot + 1);
  const expected = sign(payload);
  // Constant-time compare
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  const gymSlug = payload.split(":")[0];
  return gymSlug || null;
}

// ── POST: verify PIN ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gymSlug, pin } = body;

    if (!gymSlug || !pin) {
      return NextResponse.json({ error: "Missing gymSlug or pin" }, { status: 400 });
    }

    const gym = getGymProfile(gymSlug);
    if (!gym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }

    // Hash the submitted PIN and compare
    const submittedHash = crypto.createHash("sha256").update(String(pin).trim()).digest("hex");
    const isValid = submittedHash === gym.adminPinHash;

    if (!isValid) {
      console.warn(`⚠️ Failed dashboard login attempt for gym: ${gymSlug}`);
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const cookieValue = buildCookieValue(gymSlug);
    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    console.log(`✅ Dashboard login: ${gymSlug}`);
    return response;
  } catch (err: any) {
    console.error("❌ /api/gym-auth POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE: logout ───────────────────────────────────────────────────────────
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

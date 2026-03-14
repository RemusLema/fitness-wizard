// src/lib/security.ts — Shared security utilities

import { NextRequest, NextResponse } from "next/server";

// ── CSRF Protection: Origin/Referer check ───────────────────────────────────
// Validates that POST requests originate from our own domain

const ALLOWED_ORIGINS = [
    "https://ramafit.xyz",
    "https://www.ramafit.xyz",
    "http://localhost:3000",
    "http://localhost:3001",
];

export function checkOrigin(req: NextRequest): NextResponse | null {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    // Webhook calls from Lemon Squeezy won't have matching origin — skip for those
    const isWebhook = req.nextUrl.pathname === "/api/webhook";
    if (isWebhook) return null;

    // Internal server-to-server calls (webhook → generate-plan) have the internal secret
    const hasInternalSecret = req.headers.get("x-internal-secret");
    if (hasInternalSecret) return null;

    // Check origin header first, then referer
    const requestOrigin = origin || (referer ? new URL(referer).origin : null);

    if (!requestOrigin) {
        // No origin header — could be a direct API call (curl, Postman)
        // Allow in development, block in production
        if (process.env.NODE_ENV === "production") {
            logSecurityEvent("csrf_no_origin", req);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return null;
    }

    if (!ALLOWED_ORIGINS.includes(requestOrigin)) {
        logSecurityEvent("csrf_bad_origin", req, { origin: requestOrigin });
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return null; // Origin OK
}

// ── Security Event Logging ──────────────────────────────────────────────────
// Structured logging for security-relevant events

type SecurityEvent =
    | "csrf_no_origin"
    | "csrf_bad_origin"
    | "rate_limited"
    | "auth_blocked"
    | "captcha_failed"
    | "checkout_spam"
    | "body_too_large"
    | "input_sanitized";

export function logSecurityEvent(
    event: SecurityEvent,
    req: NextRequest,
    extra?: Record<string, string>
) {
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        ip,
        path: req.nextUrl.pathname,
        method: req.method,
        userAgent: req.headers.get("user-agent")?.slice(0, 100) || "unknown",
        ...extra,
    };

    // Structured log — Vercel Runtime Logs will capture this
    console.warn(`🔒 SECURITY [${event}]`, JSON.stringify(logEntry));
}

// ── Input Sanitizer ─────────────────────────────────────────────────────────
// Strips dangerous HTML/script characters and limits length

export function sanitizeInput(value: string, maxLength = 500): string {
    if (!value || typeof value !== "string") return "";
    return value
        .replace(/[<>'"&\\]/g, "") // Strip HTML/script chars
        .replace(/javascript:/gi, "") // Strip JS protocol
        .replace(/on\w+\s*=/gi, "") // Strip event handlers
        .trim()
        .slice(0, maxLength);
}

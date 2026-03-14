// src/app/api/generate-sample/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import crypto from "crypto";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

// ── Redis helpers (gracefully degrade if Redis not configured) ─────────────────
import { getRedis } from "@/lib/redis";

async function kvGet(key: string): Promise<string | null> {
    try {
        const redis = getRedis();
        if (!redis) return null;
        return await redis.get<string>(key);
    } catch { return null; }
}
async function kvSet(key: string, value: string, opts?: { ex?: number }) {
    try {
        const redis = getRedis();
        if (!redis) return;
        if (opts?.ex) await redis.set(key, value, { ex: opts.ex });
        else await redis.set(key, value);
    } catch { /* Redis not configured — skip silently */ }
}

function hashEmail(email: string): string {
    return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

// ── PDF Styles ────────────────────────────────────────────────────────────────
const sampleStyles = StyleSheet.create({
    page: { padding: 24, paddingBottom: 50, fontSize: 9, fontFamily: "Helvetica", backgroundColor: "#fff" },
    watermark: {
        backgroundColor: "#7c3aed", padding: 8, marginBottom: 12, borderRadius: 6,
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    watermarkText: { color: "#ffffff", fontSize: 8, fontWeight: "bold", flex: 1 },
    watermarkBadge: {
        backgroundColor: "#fff", borderRadius: 10, paddingTop: 2, paddingBottom: 2,
        paddingLeft: 6, paddingRight: 6,
    },
    watermarkBadgeText: { color: "#7c3aed", fontSize: 7, fontWeight: "bold" },
    header: { marginBottom: 10 },
    title: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 2 },
    subtitle: { fontSize: 9, color: "#64748b" },
    weekTitle: {
        fontSize: 12, fontWeight: "bold", color: "#be185d",
        marginTop: 8, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#fbcfe8", paddingBottom: 2,
    },
    dayGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 5 },
    dayBox: {
        width: "32%", backgroundColor: "#ffffff", borderRadius: 5, padding: 6,
        marginBottom: 6, borderWidth: 1, borderColor: "#e2e8f0",
    },
    dayHeaderWorkout: {
        fontSize: 8, fontWeight: "bold", color: "#ffffff",
        backgroundColor: "#2563eb", padding: 4, borderRadius: 3, marginBottom: 4,
    },
    dayHeaderRest: {
        fontSize: 8, fontWeight: "bold", color: "#ffffff",
        backgroundColor: "#16a34a", padding: 4, borderRadius: 3, marginBottom: 4,
    },
    sectionLabel: { fontSize: 7, fontWeight: "bold", color: "#64748b", marginTop: 3, marginBottom: 1 },
    item: { fontSize: 7, color: "#334155", lineHeight: 1.3, marginBottom: 1, paddingLeft: 3 },
    macroRow: {
        flexDirection: "row", backgroundColor: "#f0fdf4", borderRadius: 3,
        padding: 3, marginTop: 3, justifyContent: "space-between",
    },
    macroItem: { fontSize: 6, fontWeight: "bold", color: "#15803d" },
    noteBox: { backgroundColor: "#f3e8ff", padding: 4, borderRadius: 3, marginTop: 4, borderLeftWidth: 2, borderLeftColor: "#7c3aed" },
    noteText: { fontSize: 6, color: "#4c1d95", fontStyle: "italic" },
    footer: {
        position: "absolute", bottom: 14, left: 24, right: 24,
        textAlign: "center", fontSize: 7, color: "#94a3b8",
        borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 5,
    },
    lockedPage: {
        flex: 1, justifyContent: "center", alignItems: "center", padding: 40,
    },
    lockedTitle: { fontSize: 22, fontWeight: "bold", color: "#7c3aed", marginBottom: 12, textAlign: "center" },
    lockedBody: { fontSize: 11, color: "#475569", textAlign: "center", lineHeight: 1.6, marginBottom: 20 },
    lockedUrl: { fontSize: 14, fontWeight: "bold", color: "#7c3aed", textAlign: "center" },
});

function SamplePDF({ name, goal, week }: { name: string; goal: string; week: any }) {
    const days: any[] = Array.isArray(week?.days) ? week.days : [];

    return createElement(Document, null,
        // Week 1 page
        createElement(Page, { size: "A4", orientation: "landscape", style: sampleStyles.page } as any,
            // Watermark banner
            createElement(View, { style: sampleStyles.watermark },
                createElement(Text, { style: sampleStyles.watermarkText },
                    `Sample Plan for ${name} \u2014 Week 1 of Your 4-Week ${goal.replace(/_/g, " ").toUpperCase()} Plan`
                ),
                createElement(View, { style: sampleStyles.watermarkBadge },
                    createElement(Text, { style: sampleStyles.watermarkBadgeText }, "FREE SAMPLE")
                )
            ),
            createElement(View, { style: sampleStyles.header },
                createElement(Text, { style: sampleStyles.title }, `${name}\u2019s 4-Week Plan \u2014 Week 1 Preview`),
                createElement(Text, { style: sampleStyles.subtitle }, `Goal: ${goal.replace(/_/g, " ")}  \u2022  This is 1 of 4 weeks in your full plan`)
            ),
            createElement(Text, { style: sampleStyles.weekTitle }, week?.weekTitle || "Week 1: Foundation"),
            // Day grid
            createElement(View, { style: sampleStyles.dayGrid },
                ...days.map((day: any, i: number) => {
                    const focus = String(day?.focus || "General");
                    const isRest = focus.toLowerCase().includes("rest") || focus.toLowerCase().includes("recovery");
                    const headerStyle = isRest ? sampleStyles.dayHeaderRest : sampleStyles.dayHeaderWorkout;
                    const workout = String(day?.workout || "");
                    const exercises = workout.split(";").map((e: string) => e.trim()).filter(Boolean).slice(0, 4);
                    const meals = String(day?.meals || "");
                    const mealLines = meals.split(";").map((m: string) => m.trim()).filter(Boolean).slice(0, 3);
                    const macros = day?.macros ? String(day.macros) : null;
                    const macroParts = macros ? macros.split("|").map((p: string) => p.trim()) : [];
                    const note = day?.trainerNote ? String(day.trainerNote) : null;

                    return createElement(View, { key: i, style: sampleStyles.dayBox, wrap: false } as any,
                        createElement(Text, { style: headerStyle }, `${day?.dayTitle || `Day ${i + 1}`} \u2014 ${focus}`),
                        exercises.length > 0 && createElement(View, null,
                            createElement(Text, { style: sampleStyles.sectionLabel }, "WORKOUT"),
                            ...exercises.map((ex: string, j: number) =>
                                createElement(Text, { key: j, style: sampleStyles.item }, `\u25a2 ${ex}`)
                            )
                        ),
                        mealLines.length > 0 && createElement(View, null,
                            createElement(Text, { style: sampleStyles.sectionLabel }, "NUTRITION"),
                            ...mealLines.map((ml: string, j: number) =>
                                createElement(Text, { key: j, style: sampleStyles.item }, `\u25a2 ${ml}`)
                            )
                        ),
                        macroParts.length > 0 && createElement(View, { style: sampleStyles.macroRow },
                            ...macroParts.map((p: string, j: number) =>
                                createElement(Text, { key: j, style: sampleStyles.macroItem }, p)
                            )
                        ),
                        note && createElement(View, { style: sampleStyles.noteBox },
                            createElement(Text, { style: sampleStyles.noteText }, `Trainer: ${note}`)
                        )
                    );
                })
            ),
            createElement(Text, { style: sampleStyles.footer, fixed: true } as any,
                "ramafit.xyz  |  Sample plan only \u2014 Weeks 2\u20134 available with your full plan"
            )
        ),
        // Upgrade page
        createElement(Page, { size: "A4", orientation: "landscape", style: sampleStyles.page } as any,
            createElement(View, { style: sampleStyles.lockedPage },
                createElement(Text, { style: sampleStyles.lockedTitle }, "\uD83D\uDD12 Weeks 2\u20134 are waiting for you"),
                createElement(Text, { style: sampleStyles.lockedBody },
                    `This is Week 1 of your personalized ${goal.replace(/_/g, " ")} plan.\n\nYour full plan includes 28 days of tailored workouts, daily meal plans with macros, trainer coaching tips, and a professional PDF delivered to your inbox.\n\nUpgrade now to unlock everything.`
                ),
                createElement(Text, { style: sampleStyles.lockedUrl }, "ramafit.xyz")
            ),
            createElement(Text, { style: sampleStyles.footer, fixed: true } as any, "ramafit.xyz")
        )
    );
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, goal, fitnessLevel, equipment, dietaryPreference } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

        // ── Layer 0: Turnstile CAPTCHA verification ─────────────────────────────
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        const { turnstileToken } = body;
        if (turnstileSecret && turnstileSecret !== "REPLACE_ME") {
            if (!turnstileToken) {
                return NextResponse.json({ error: "CAPTCHA verification required" }, { status: 400 });
            }
            const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${turnstileSecret}&response=${turnstileToken}`,
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
                return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 403 });
            }
        }

        // ── Layer 1: IP rate limit (max 2 per IP per 24h) ─────────────────────────
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") || "unknown";
        const ipKey = `ratelimit:sample:${ip}`;
        const ipCount = await kvGet(ipKey);
        if (ipCount && parseInt(ipCount) >= 2) {
            return NextResponse.json(
                { error: "Too many sample requests from your location. Please try again tomorrow or upgrade for your full plan." },
                { status: 429 }
            );
        }

        // ── Layer 2: Email hash check ──────────────────────────────────────────────
        const emailHash = hashEmail(email);
        const emailKey = `sample:email:${emailHash}`;
        const emailUsed = await kvGet(emailKey);
        if (emailUsed) {
            return NextResponse.json(
                { error: "A free sample has already been sent to this email. Upgrade to get your full 4-week plan!" },
                { status: 429 }
            );
        }

        // ── AI: Generate Week 1 only ───────────────────────────────────────────────
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a world-class personal trainer. Generate ONLY Week 1 (7 days) of a 4-week fitness plan.
Return VALID JSON only:
{
  "weekTitle": "Week 1: Foundation",
  "weekTarget": "3x/week compound lifts | Rest: 90s | Focus: Form",
  "days": [
    {
      "dayTitle": "Day 1",
      "focus": "Upper Body Strength",
      "timing": "Wake: 7am, Workout: 8am",
      "workout": "Push-ups: 3x12; Bench Press: 4x10; Overhead Press: 3x10",
      "meals": "Breakfast: Oats + banana (400 cal); Lunch: Chicken + rice (550 cal); Dinner: Salmon + veg (600 cal); Snacks: Greek yogurt",
      "calories": "1800",
      "macros": "Protein: 140g | Carbs: 180g | Fat: 55g",
      "trainerNote": "Focus on form over weight today."
    }
  ]
}
RULES:
- 7 days exactly (Day 1–7). Include 2 rest/recovery days.
- Use level-specific titles for the weekTitle based on fitnessLevel.
- Goal: ${goal}, Level: ${fitnessLevel}, Equipment: ${Array.isArray(equipment) && equipment.length > 0 ? equipment.join(", ") : "bodyweight"}, Diet: ${dietaryPreference}
- All values must be STRINGS. Be specific and realistic. Do NOT truncate.`
                },
                { role: "user", content: `Generate Week 1 for: ${name}, goal: ${goal}, level: ${fitnessLevel}` }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" },
        });

        const aiText = completion.choices[0]?.message?.content;
        if (!aiText) throw new Error("No AI response");

        const week = JSON.parse(aiText);

        // ── Render PDF ─────────────────────────────────────────────────────────────
        const pdfElement = createElement(SamplePDF, { name, goal, week });
        const pdfBlob = await pdf(pdfElement as any).toBlob();
        const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

        // ── Write KV records ───────────────────────────────────────────────────────
        await kvSet(emailKey, "1"); // permanent — email never gets another sample
        const newCount = ipCount ? parseInt(ipCount) + 1 : 1;
        await kvSet(ipKey, String(newCount), { ex: 86400 }); // 24h TTL

        // ── Return PDF + set cookie ────────────────────────────────────────────────
        const response = new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="RamaFit_Sample_${name.replace(/\s+/g, "_")}.pdf"`,
                "Set-Cookie": `ramafit_sample=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure`,
            },
        });
        return response;

    } catch (error: any) {
        console.error("Sample generation error:", error);
        return NextResponse.json({ error: "Failed to generate sample. Please try again." }, { status: 500 });
    }
}

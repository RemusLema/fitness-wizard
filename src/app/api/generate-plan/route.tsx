// src/app/api/generate-plan/route.tsx
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { BonusPDF } from "@/lib/BonusPDF";
import { Resend } from "resend";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'AI Fitness Wizard'
  },
});

const resend = new Resend(process.env.RESEND_API_KEY!);

// Enhanced PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 80, // Increased to prevent footer overlap
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff"
  },
  header: {
    backgroundColor: "#7c3aed",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#e9d5ff",
  },
  section: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#7c3aed",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4c1d95",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#be185d",
    marginTop: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#fbcfe8",
    paddingBottom: 3,
  },
  dayContainer: {
    marginBottom: 6,
    padding: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  dayHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
    backgroundColor: "#f1f5f9",
    padding: 3,
    borderRadius: 3,
  },
  subHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748b",
    marginTop: 3,
    marginBottom: 1,
    textTransform: "uppercase",
  },
  text: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#334155",
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  field: {
    width: "48%",
    marginBottom: 5,
  },
  label: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 1,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 10,
    color: "#1e293b",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  bulletPoint: {
    fontSize: 8,
    lineHeight: 1.5,
    color: "#334155",
    marginBottom: 1,
    paddingLeft: 8,
  },
  mealSection: {
    marginTop: 2,
    marginBottom: 2,
  },
  mealType: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 1,
  },
  mealItem: {
    fontSize: 8,
    lineHeight: 1.4,
    color: "#475569",
    marginBottom: 1,
    paddingLeft: 8,
  },
  dayBox: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 3,
    borderLeftColor: "#7c3aed",
    borderRadius: 6,
    padding: 6,
    marginBottom: 8,
  },
  progressionSection: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f0f4ff",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#7c3aed",
  },
  progressionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 6,
  },
  progressionText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#1e293b",
  },
});

// Helper: Normalize PDF text (fix common artifacts)
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u00A0/g, ' ')  // Non-breaking spaces
    .replace(/-\n\s*/g, '')   // Hyphenated line breaks: "car-dio\n" -> "cardio"
    .replace(/([a-zA-Z])- ([a-zA-Z])/g, '$1$2')  // Mid-word hyphens: "pro-tein" -> "protein"
    .replace(/\s+/g, ' ')     // Multiple spaces -> single
    .trim();
}

// IMPROVED: Workout parser
function parseWorkoutIntoBullets(workout: string): string[] {
  const normalized = normalizeText(workout);
  if (!normalized) return [];

  const bullets: string[] = [];
  // Split ONLY on: semicolons, newlines, commas followed by space
  // DO NOT split on periods or hyphens (preserves "push-ups", "3.5 mins", etc.)
  const parts = normalized
    .split(/[;,]\s+|\n+/)  // Semicolon, comma+space, or newlines
    .map(p => p.trim())
    .filter(p => p.length > 3);  // Slightly higher threshold

  for (const part of parts) {
    // Enhanced cleaning: numbers/lists/bullets at START only
    const cleaned = part.replace(/^\s*\d+\.\s+/, '').trim();  // Strip ONLY numbered lists like "1. " (requires period)
    if (cleaned.length > 3) {
      bullets.push(cleaned);
    }
  }

  return bullets.length > 0 ? bullets : [normalized];  // Fallback to full text
}

// IMPROVED: Meals parser (complete implementation)
function parseMealsIntoSections(meals: string): { [key: string]: string[] } {
  const normalized = normalizeText(meals);
  if (!normalized) return {};

  const sections: { [key: string]: string[] } = {};
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-Workout', 'Post-Workout', 'Brunch', 'Supper'];

  // Find all sections by splitting on headers
  let remaining = normalized;
  for (const mealType of mealTypes) {
    const regex = new RegExp(`^(${mealType})\\s*:?\\s*(.*?)(?=(?:${mealTypes.join('|')})[:\\n]|$)`, 'i');
    const match = regex.exec(remaining);
    if (match) {
      const content = match[2].trim();
      sections[mealType] = parseWorkoutIntoBullets(content);  // Reuse bullet parser!
      remaining = remaining.slice(match.index + match[0].length);  // Advance
    }
  }

  // Fallback: If no sections, treat whole as 'Meals'
  if (Object.keys(sections).length === 0) {
    sections['Meals'] = parseWorkoutIntoBullets(normalized);
  }

  return sections;
}
// ✅ FIXED: Added proper null checks and type safety
const FitnessPDF = ({ data, plan }: { data: any; plan: any }) => {
  // Safety checks
  const safeName = data?.name || "Athlete";
  const safeTitle = plan?.title || "Fitness Plan";
  const safeIntro = plan?.introduction || "Your personalized fitness journey starts here!";
  const safeGoal = data?.goal ? String(data.goal).replace(/_/g, " ").toUpperCase() : "NOT SPECIFIED";
  const safeFitnessLevel = data?.fitnessLevel ? String(data.fitnessLevel).toUpperCase() : "NOT SPECIFIED";
  const safeTimeline = data?.timeline ? String(data.timeline).replace(/_/g, " ").toUpperCase() : "NOT SPECIFIED";
  const safeEquipment = Array.isArray(data?.equipment) && data.equipment.length > 0
    ? data.equipment.join(", ")
    : "Bodyweight Only";

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.headerTitle}>Fitness Wizard Plan</Text>
          <Text style={pdfStyles.headerSubtitle}>
            Customized for {safeName} • {data.timeline === "1_month"
              ? "Your Complete 4-Week Plan"
              : `Cycle 1 of Your ${safeTimeline} Journey`}
          </Text>
        </View>

        {/* Profile Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Athlete Profile</Text>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}>
              <Text style={pdfStyles.label}>Goal</Text>
              <Text style={pdfStyles.value}>{safeGoal}</Text>
            </View>
            <View style={pdfStyles.field}>
              <Text style={pdfStyles.label}>Fitness Level</Text>
              <Text style={pdfStyles.value}>{safeFitnessLevel}</Text>
            </View>
            <View style={pdfStyles.field}>
              <Text style={pdfStyles.label}>Timeline</Text>
              <Text style={pdfStyles.value}>{safeTimeline}</Text>
            </View>
            <View style={pdfStyles.field}>
              <Text style={pdfStyles.label}>Equipment</Text>
              <Text style={pdfStyles.value}>{safeEquipment}</Text>
            </View>
          </View>
        </View>

        {/* Introduction */}
        <View style={{ marginBottom: 20 }}>
          <Text style={pdfStyles.text}>{safeIntro}</Text>
        </View>

        {/* ✅ FIXED: Added proper null checks and array validation */}
        {Array.isArray(plan?.weeks) && plan.weeks.length > 0 ? (
          plan.weeks.map((week: any, wIndex: number) => {
            const weekTitle = week?.weekTitle || `Week ${wIndex + 1}`;

            return (
              <View key={wIndex} break={wIndex > 0} style={{ flexDirection: "column" }}>
                <Text style={pdfStyles.weekTitle}>
                  {weekTitle}
                </Text>

                {/* ✅ FIXED: Validate days array */}
                {Array.isArray(week?.days) && week.days.length > 0 ? (
                  week.days.map((day: any, dIndex: number) => {
                    // ✅ FIXED: Convert all values to strings to prevent object rendering
                    const dayTitle = String(day?.dayTitle || `Day ${dIndex + 1}`);
                    const focus = String(day?.focus || "General Fitness");
                    const timing = String(day?.timing || "Flexible timing");
                    const workout = String(day?.workout || "Rest day or active recovery");
                    const meals = String(day?.meals || "Balanced nutrition throughout the day");

                    // Parse workouts and meals for better readability
                    const workoutBullets = parseWorkoutIntoBullets(workout);
                    const mealSections = parseMealsIntoSections(meals);

                    return (
                      <View key={dIndex} style={pdfStyles.dayBox} wrap={false}>
                        <Text style={pdfStyles.dayHeader}>
                          {dayTitle} — {focus}
                        </Text>

                        <Text style={pdfStyles.subHeader}>Timing</Text>
                        <Text style={pdfStyles.text}>{timing}</Text>

                        <Text style={pdfStyles.subHeader}>WORKOUT</Text>
                        {workoutBullets.length > 0 ? (
                          workoutBullets.map((exercise, idx) => (
                            <Text key={idx} style={pdfStyles.bulletPoint}>
                              • {exercise}
                            </Text>
                          ))
                        ) : (
                          <Text style={pdfStyles.text}>{workout}</Text>
                        )}

                        <Text style={pdfStyles.subHeader}>NUTRITION</Text>
                        {Object.keys(mealSections).length > 0 ? (
                          Object.entries(mealSections).map(([mealType, items], idx) => (
                            <View key={idx} style={pdfStyles.mealSection}>
                              <Text style={pdfStyles.mealType}>{mealType}:</Text>
                              {items.map((item, itemIdx) => (
                                <Text key={itemIdx} style={pdfStyles.mealItem}>
                                  {item}
                                </Text>
                              ))}
                            </View>
                          ))
                        ) : (
                          <Text style={pdfStyles.text}>{meals}</Text>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <Text style={pdfStyles.text}>No days scheduled for this week.</Text>
                )}
              </View>
            );
          })
        ) : (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.text}>
              Your personalized plan is being prepared. Please try generating again.
            </Text>
          </View>
        )}

        {/* Progression Notes for Multi-Month Plans */}
        {plan.progressionNotes && data.timeline !== "1_month" && (
          <View style={pdfStyles.progressionSection}>
            <Text style={pdfStyles.progressionTitle}>
              Progression Plan for Your {safeTimeline} Journey
            </Text>
            <Text style={pdfStyles.progressionText}>
              {plan.progressionNotes}
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={pdfStyles.footer} fixed>
          Generated by AI Fitness Wizard • {new Date().toLocaleString()} • v2.0 • Stay Consistent!
        </Text>
      </Page>
    </Document>
  );
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ FIXED: Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { want, ...formData } = body;

    // ✅ FIXED: Validate required fields
    if (!formData.name || !formData.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    console.log("📋 Generating plan for:", formData.name);

    // Generate AI plan with JSON structure
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a world-class personal trainer with 15+ years experience coaching beginners to elite athletes.

Create a highly detailed, personalized 4-week training + nutrition cycle based on the user's exact:
- Goal: ${formData.goal}
- Fitness level: ${formData.fitnessLevel} ← USE THIS EXACTLY (never assume beginner)
- Timeline: ${formData.timeline}
- Equipment: ${formData.equipment?.length > 0 ? formData.equipment.join(", ") : "bodyweight"}
- Diet preference: ${formData.dietaryPreference}

RULES:
- If timeline is "1_month" → this is their COMPLETE plan. Do NOT include "progressionNotes" field.
- If timeline is "3_months" or "6_months" → this is Cycle 1 of a multi-cycle program. You MUST include a "progressionNotes" field explaining how to progress in the next 4-week cycle.
- Use level-specific week titles (CRITICAL - follow these patterns EXACTLY):
  * Beginner level: "Week 1: Foundation", "Week 2: Form Building", "Week 3: Strength Introduction", "Week 4: Consistency"
  * Intermediate level: "Week 1: Build Strength", "Week 2: Progressive Load", "Week 3: Intensity Increase", "Week 4: Power Week"
  * Advanced level: "Week 1: Peak Performance", "Week 2: Intensity Push", "Week 3: Maximum Load", "Week 4: Elite Challenge"
- NEVER use generic titles like "Strength Building" - always match the user's exact fitness level.
- Week titles must reflect progressive difficulty within the user's level.

Return VALID JSON only (no extra text):

{
  "title": "Your Custom 4-Week Cycle",
  "introduction": "Motivational 2-3 sentence intro using their name and goal",
  "athleteProfile": {
    "goal": "${formData.goal?.replace("_", " ").toUpperCase()}",
    "level": "${formData.fitnessLevel?.toUpperCase()}",
    "timeline": "${formData.timeline?.replace("_", " ")}"
  },
  "weeks": [
    {
      "weekTitle": "Week 1: Strength Building",
      "days": [
        {
          "dayTitle": "Day 1",
          "focus": "Upper Body Strength",
          "timing": "Wake: 7am, Workout: 8am, Meals: 12pm/3pm/7pm",
          "workout": "Push-ups: 3 sets of 12 reps; Dumbbell Bench Press: 4 sets of 8-10 reps; Overhead Press: 3 sets of 10 reps; Tricep Dips: 3 sets of 12 reps; Plank: 3 sets of 45 seconds",
          "meals": "Breakfast: Oatmeal with banana and almonds (400 cal); Lunch: Grilled chicken with quinoa and vegetables (550 cal); Dinner: Salmon with sweet potato and broccoli (600 cal); Snacks: Greek yogurt, protein shake"
        },
        {
          "dayTitle": "Day 2",
          "focus": "Lower Body Strength",
          "timing": "Wake: 7am, Workout: 8am, Meals: 12pm/3pm/7pm",
          "workout": "Squats: 4 sets of 10 reps; Deadlifts: 3 sets of 8 reps; Lunges: 3 sets of 12 reps per leg; Leg Press: 3 sets of 15 reps; Calf Raises: 4 sets of 20 reps",
          "meals": "Breakfast: Scrambled eggs with whole grain toast (450 cal); Lunch: Turkey wrap with avocado (500 cal); Dinner: Lean beef stir-fry with brown rice (650 cal); Snacks: Protein bar, mixed nuts"
        }
      ]
    },
    {
      "weekTitle": "Week 2: Progressive Overload",
      "days": [ ... continue with 7 days ... ]
    },
    {
      "weekTitle": "Week 3: Intensity",
      "days": [ ... continue with 7 days ... ]
    },
    {
      "weekTitle": "Week 4: Peak Performance",
      "days": [ ... continue with 7 days ... ]
    }
  ],
  "progressionNotes": "Week 5-8 (Next Cycle): Increase all compound lifts by 5-10%; Add 1-2 reps per set; Reduce rest periods by 10-15 seconds; Introduce supersets on upper body days; Add plyometric variations to lower body sessions"
}

CRITICAL FORMATTING INSTRUCTIONS:
- Each week MUST have 7 days (Day 1-7) with complete details
- "workout" field: Use semicolons to separate exercises. Format: "Exercise Name: Sets x Reps; Next Exercise: Sets x Reps"
- "meals" field: Use format "Breakfast: food details (calories); Lunch: food details (calories); Dinner: food details (calories); Snacks: items"
- All values (dayTitle, focus, workout, meals, timing) MUST be STRINGS, never objects or arrays
- **progressionNotes requirement**: If timeline is "3_months" or "6_months" → "progressionNotes" field is MANDATORY. Provide specific progression instructions (weight increases, rep additions, rest reductions, exercise progressions)
- Be detailed but stay under token limit — do NOT truncate the JSON
- Use encouraging but realistic tone`
        },
        {
          role: "user",
          content: `Create a fitness plan for:\n${JSON.stringify(formData, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 10000,
      response_format: { type: "json_object" }
    });

    const aiContent = completion.choices[0]?.message?.content;

    // ✅ FIXED: Better error handling for AI response
    if (!aiContent) {
      throw new Error("No response from AI");
    }

    let aiPlan;
    try {
      aiPlan = JSON.parse(aiContent);
      console.log("✅ AI Plan parsed successfully");
    } catch (parseError) {
      console.error("❌ Failed to parse AI JSON:", parseError);

      // ✅ FIXED: Better fallback structure
      aiPlan = {
        title: "Your Custom Fitness Plan",
        introduction: "Your personalized fitness and nutrition plan has been generated. Due to formatting, some details may be simplified.",
        weeks: [
          {
            weekTitle: "Week 1-4: Complete Plan",
            days: [
              {
                dayTitle: "Overview",
                focus: "Full Program",
                workout: aiContent.substring(0, 500) + "...",
                meals: "See full plan details",
                timing: "Flexible schedule"
              }
            ]
          }
        ]
      };
    }

    // ✅ FIXED: Validate AI plan structure
    if (!aiPlan.weeks || !Array.isArray(aiPlan.weeks)) {
      aiPlan.weeks = [];
    }

    console.log("📄 Generating PDF...");

    // Generate PDF with error boundary
    let pdfBuffer: Buffer;
    try {
      const pdfDoc = <FitnessPDF data={formData} plan={aiPlan} />;
      const pdfBlob = await pdf(pdfDoc).toBlob();
      pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
      console.log("✅ PDF generated successfully");
    } catch (pdfError) {
      console.error("❌ PDF generation failed:", pdfError);
      throw new Error("Failed to generate PDF document");
    }

    // Generate Bonus PDF for 12-week and 6-month timelines
    let bonusBuffer: Buffer | null = null;
    let bonusFilename = "";

    if (formData.timeline === "3_months" || formData.timeline === "6_months") {
      try {
        console.log("📄 Generating bonus PDF for timeline:", formData.timeline);
        const bonusPdfDoc = (
          <BonusPDF
            name={formData.name}
            goal={formData.goal?.replace(/_/g, " ") || "fitness"}
            level={formData.fitnessLevel || "intermediate"}
            timeline={formData.timeline}
          />
        );
        const bonusPdfBlob = await pdf(bonusPdfDoc).toBlob();
        bonusBuffer = Buffer.from(await bonusPdfBlob.arrayBuffer());
        bonusFilename =
          formData.timeline === "3_months"
            ? "Bonus_3_Month_Roadmap.pdf"
            : "Bonus_6_Month_Blueprint.pdf";
        console.log("✅ Bonus PDF generated successfully:", bonusFilename);
      } catch (bonusError) {
        console.error("❌ Bonus PDF generation failed:", bonusError);
        // Don't fail the entire request if bonus PDF fails
        bonusBuffer = null;
      }
    }

    const response: any = { success: true, message: "Plan ready!" };

    // ✅ FIXED: Better plain text formatting with safety checks
    const plainTextPlan = `
${aiPlan.title || "Your Fitness Plan"}

${aiPlan.introduction || ""}

${Array.isArray(aiPlan.weeks) ? aiPlan.weeks.map((w: any, wIdx: number) => `
${w?.weekTitle || `Week ${wIdx + 1}`}
${Array.isArray(w?.days) ? w.days.map((d: any, dIdx: number) => `
  ${d?.dayTitle || `Day ${dIdx + 1}`}: ${d?.focus || "Training"}
  Timing: ${d?.timing || "Flexible"}
  Workout: ${d?.workout || "See plan"}
  Meals: ${d?.meals || "Balanced nutrition"}
`).join('\n') : 'No days scheduled'}
`).join('\n') : 'Plan details unavailable'}
    `.trim();

    response.plan = plainTextPlan;

    // Email with PDF
    if (want?.email && formData.email) {
      try {
        console.log("📧 Sending email to:", formData.email);
        await resend.emails.send({
          from: "AI Fitness Wizard <noreply@ramafit.xyz>",
          to: formData.email,
          subject: `Your Custom Fitness Plan is Here, ${formData.name.split(" ")[0]}!`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f9f9f9; padding:20px;">
              <!-- Header -->
              <div style="background:#7c3aed; padding:32px 24px; border-radius:16px 16px 0 0; text-align:center; color:white;">
                <h1 style="margin:0; font-size:28px; font-weight:bold;">Your AI Fitness + Nutrition Plan</h1>
                <p style="margin:8px 0 0; font-size:18px; opacity:0.95;">4 weeks, custom-built for you</p>
              </div>

              <!-- Greeting -->
              <div style="background:white; padding:32px 28px; border-radius:0 0 16px 16px; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                <p style="font-size:18px; color:#1f2937;">
                  Hey <strong>${formData.name.split(" ")[0]}</strong>,<br><br>
                  Congrats — your personalized plan is ready! 🎉<br><br>
                  This is built 100% for your goal (${formData.goal?.replace(/_/g, " ") || "fitness"}), current level, and equipment.
                </p>

                <!-- Plan -->
                <div style="background:#f8f9fc; padding:24px; border-radius:12px; margin:24px 0; font-size:15px; line-height:1.7; white-space:pre-wrap; max-height:500px; overflow-y:auto;">
${plainTextPlan}
                </div>

                <!-- PDF Attached Notice -->
                <div style="text-align:center; margin:32px 0; padding:20px; background:#f0fdf4; border-radius:12px; border-left:4px solid #10b981;">
                  <p style="margin:0; color:#047857; font-size:16px;">
                    📎 <strong>${bonusBuffer ? "2 PDFs attached" : "Full PDF is attached"} to this email</strong><br>
                    <span style="font-size:14px; opacity:0.8;">${bonusBuffer ? "Your 4-week plan + bonus roadmap for long-term success!" : "Download it for offline access and detailed breakdowns"}</span>
                  </p>
                </div>

                <!-- Closing -->
                <p style="color:#4b5563; font-size:16px; line-height:1.6;">
                  You've got this.<br>
                  Any questions or want tweaks? Just hit reply — I read every single message.
                </p>

                <!-- Signature -->
                <div style="margin-top:40px; padding-top:20px; border-top:2px solid #e5e7eb;">
                  <p style="margin:0; font-weight:bold; color:#1f2937;">Rama</p>
                  <p style="margin:5px 0; color:#7c3aed; font-weight:600;">Founder & Head Coach</p>
                  <p style="margin:5px 0 12px; color:#6b7280; font-size:14px;">
                    AI Fitness Wizard<br>
                    noreply@ramafit.xyz
                  </p>
                </div>

                <!-- Footer -->
                <div style="margin-top:32px; font-size:12px; color:#9ca3af; text-align:center;">
                  <p>You're receiving this because you requested your custom plan.<br>
                  <a href="https://fitness-wizard-kappa.vercel.app" style="color:#7c3aed; text-decoration:none;">fitness-wizard-kappa.vercel.app</a> • 
                  <a href="mailto:noreply@ramafit.xyz?subject=Unsubscribe" style="color:#9ca3af; text-decoration:underline;">Unsubscribe</a>
                  </p>
                </div>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "Your_4_Week_Plan.pdf",
              content: pdfBuffer,
            },
            ...(bonusBuffer
              ? [
                {
                  filename: bonusFilename,
                  content: bonusBuffer,
                },
              ]
              : []),
          ]
        });
        console.log("✅ Email sent successfully");
      } catch (emailError) {
        console.error("❌ Email failed:", emailError);
        // Don't fail the entire request if email fails
        response.emailError = "Email delivery failed, but your plan is ready";
      }
    }

    // Add PDF for download
    if (want?.pdf) {
      response.pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("❌ Generate plan error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate plan. Please try again!",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
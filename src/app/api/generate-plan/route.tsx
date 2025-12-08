// src/app/api/generate-plan/route.tsx
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
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
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#7c3aed",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4c1d95",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#be185d",
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fbcfe8",
    paddingBottom: 5,
  },
  dayContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    backgroundColor: "#f1f5f9",
    padding: 5,
    borderRadius: 4,
  },
  subHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
    marginTop: 6,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#334155",
    marginBottom: 4,
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
    fontSize: 9,
    lineHeight: 1.7,
    color: "#334155",
    marginBottom: 3,
    paddingLeft: 10,
  },
  mealSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  mealType: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 3,
  },
  mealItem: {
    fontSize: 9,
    lineHeight: 1.6,
    color: "#475569",
    marginBottom: 2,
    paddingLeft: 10,
  },
  dayBox: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 4,
    borderLeftColor: "#7c3aed",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
});

// IMPROVED: Helper function to parse workout into bullet points
function parseWorkoutIntoBullets(workout: string): string[] {
  if (!workout || workout.trim().length === 0) return [];

  const bullets: string[] = [];

  // Split by newlines first to get sections (warm-up, circuit, cooldown, etc.)
  const lines = workout.split(/\\n/).map(l => l.trim()).filter(l => l.length > 5);

  for (const line of lines) {
    // Pattern: "Label: content" or "Label - content"
    const match = line.match(/^([^:]+?)[:]\s*(.+)$/);

    if (match) {
      const label = match[1].trim();
      const content = match[2].trim();

      // Check if content has multiple items (circuit style)  
      // Look for pattern with commas: "Ex1, Ex2, Ex3"
      if (content.includes(',') && (content.match(/,/g) || []).length >= 2) {
        // This is a circuit/list  
        bullets.push(`${label}:`);

        // Split on commas and add as sub-items
        content.split(',').forEach(item => {
          const cleaned = item.trim();
          if (cleaned.length > 2) {
            bullets.push(`  • ${cleaned}`);
          }
        });
      } else {
        // Single item, add normally
        bullets.push(line);
      }
    } else {
      // No colon, add as-is
      bullets.push(line);
    }
  }
  return bullets.length >= 2 ? bullets : [];
}

// Helper function to parse meals into sections
function parseMealsIntoSections(meals: string): { [key: string]: string[] } {
  if (!meals || meals.trim().length === 0) return {};

  const sections: { [key: string]: string[] } = {};
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-Workout', 'Post-Workout'];

  // Create a regex pattern that matches any of the meal types
  const allTypesPattern = mealTypes.join('|');

  mealTypes.forEach(mealType => {
    // Regex: Match the meal type, optional colon, then capture everything until the next meal type or end of string
    const regex = new RegExp(`${mealType}\\s*:?\\s*([\\s\\S]+?)(?=(?:${allTypesPattern})|$)`, 'i');
    const match = meals.match(regex);

    if (match && match[1]) {
      const content = match[1].trim();

      let items: string[] = [];

      if (content.includes('\n')) {
        items = content
          .split(/\n/)
          .map(item => item.trim())
          .map(item => item.replace(/^[•\-\d+\.]+\s*/, '')) // Remove bullets
          .filter(item => item.length > 2);
      } else {
        items = content
          .split(/[,;]/)
          .map(item => item.trim())
          .map(item => item.replace(/^[•\-\d+\.]+\s*/, ''))
          .filter(item => item.length > 2);
      }

      if (items.length > 0) {
        sections[mealType] = items.slice(0, 8);
      }
    }
  });

  // If no specific sections were found, fall back to generic parsing
  if (Object.keys(sections).length === 0) {
    const items = meals
      .split(/[,;\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 3)
      .slice(0, 10);

    if (items.length > 0) {
      sections['Daily Nutrition'] = items;
    }
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
            Customized for {safeName} • {safeTitle}
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

                        <Text style={pdfStyles.subHeader}>💪 Workout</Text>
                        {workoutBullets.length > 0 ? (
                          workoutBullets.map((exercise, idx) => (
                            <Text key={idx} style={pdfStyles.bulletPoint}>
                              • {exercise}
                            </Text>
                          ))
                        ) : (
                          <Text style={pdfStyles.text}>{workout}</Text>
                        )}

                        <Text style={pdfStyles.subHeader}>🍽️ Nutrition</Text>
                        {Object.keys(mealSections).length > 0 ? (
                          Object.entries(mealSections).map(([mealType, items], idx) => (
                            <View key={idx} style={pdfStyles.mealSection}>
                              <Text style={pdfStyles.mealType}>{mealType}:</Text>
                              {items.map((item, itemIdx) => (
                                <Text key={itemIdx} style={pdfStyles.mealItem}>
                                  ◦ {item}
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
          content: `You are a world-class fitness coach. Create a highly detailed 4-week fitness and nutrition plan.
Return the response as a valid JSON object with the following structure:
{
  "title": "Plan Title",
  "introduction": "Motivational intro...",
  "weeks": [
    {
      "weekTitle": "Week 1: Foundation",
      "days": [
        {
          "dayTitle": "Day 1",
          "focus": "Full Body",
          "workout": "Detailed exercises, sets, reps...",
          "meals": "Breakfast: ..., Lunch: ..., Dinner: ..., Snacks: ...",
          "timing": "Wake up: 7am, Workout: 8am..."
        }
      ]
    }
  ]
}

CRITICAL: Ensure ALL values (dayTitle, focus, workout, meals, timing) are STRINGS, not objects or arrays. 
Make the plan detailed but ensure it fits within token limits. Do not truncate the JSON.`
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
                    📎 <strong>Full PDF is attached to this email</strong><br>
                    <span style="font-size:14px; opacity:0.8;">Download it for offline access and detailed breakdowns</span>
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
          attachments: [{
            filename: "Your_AI_Fitness_Plan.pdf",
            content: pdfBuffer
          }]
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
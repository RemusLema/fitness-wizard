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
});

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

                    return (
                      <View key={dIndex} style={pdfStyles.dayContainer} wrap={false}>
                        <Text style={pdfStyles.dayHeader}>
                          {dayTitle} — {focus}
                        </Text>

                        <Text style={pdfStyles.subHeader}>Timing</Text>
                        <Text style={pdfStyles.text}>{timing}</Text>

                        <Text style={pdfStyles.subHeader}>Workout</Text>
                        <Text style={pdfStyles.text}>{workout}</Text>

                        <Text style={pdfStyles.subHeader}>Meals</Text>
                        <Text style={pdfStyles.text}>{meals}</Text>
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
          html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your AI Fitness Plan</title><style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5}table{border-collapse:collapse}@media only screen and (max-width:600px){.container{width:100%!important}.mobile-padding{padding:20px!important}}</style></head><body><table role="presentation" style="width:100%;background-color:#f5f5f5" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px"><table role="presentation" class="container" style="width:600px;max-width:100%;background-color:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1)" cellpadding="0" cellspacing="0"><tr><td style="background:linear-gradient(135deg,#7c3aed 0%,#db2777 100%);padding:40px 30px;text-align:center;border-radius:12px 12px 0 0"><h1 style="margin:0;color:#fff;font-size:32px;font-weight:bold">🏋️ AI Fitness Wizard</h1><p style="margin:10px 0 0 0;color:#f3e8ff;font-size:16px">Your Personalized Journey Starts Now</p></td></tr><tr><td class="mobile-padding" style="padding:40px 30px"><h2 style="margin:0 0 20px 0;color:#1f2937;font-size:28px">Congrats, ${formData.name.split(" ")[0]}! 🎉</h2><p style="margin:0 0 20px 0;color:#4b5563;font-size:16px;line-height:1.6">Your <strong>personalized 4-week fitness and nutrition plan</strong> is ready!</p><table role="presentation" style="width:100%;background-color:#f0fdf4;border-left:4px solid #10b981;border-radius:8px;margin:30px 0" cellpadding="0" cellspacing="0"><tr><td style="padding:20px"><p style="margin:0 0 10px 0;color:#065f46;font-size:14px;font-weight:bold">📋 YOUR PLAN OVERVIEW</p><p style="margin:0;color:#047857;font-size:15px;line-height:1.6"><strong>Goal:</strong> ${formData.goal?.replace(/_/g, ' ') || 'Fitness'}<br><strong>Level:</strong> ${formData.fitnessLevel || 'Beginner'}<br><strong>Duration:</strong> 4 weeks</p></td></tr></table><table role="presentation" style="width:100%;margin:30px 0" cellpadding="0" cellspacing="0"><tr><td align="center"><span style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#7c3aed 0%,#db2777 100%);color:#fff;font-size:16px;font-weight:bold;border-radius:8px">📥 Download Your Plan (Attached)</span></td></tr></table><table role="presentation" style="width:100%;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border-radius:8px;margin:30px 0" cellpadding="0" cellspacing="0"><tr><td style="padding:20px;text-align:center"><p style="margin:0;color:#92400e;font-size:18px;font-weight:bold">💪 You've got this!</p><p style="margin:10px 0 0 0;color:#b45309;font-size:14px">Consistency is key. Start today, trust the process.</p></td></tr></table><h3 style="margin:40px 0 20px 0;color:#1f2937;font-size:20px">🎯 Quick Tips for Success</h3><table role="presentation" style="width:100%" cellpadding="0" cellspacing="0"><tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb"><p style="margin:0;color:#4b5563;font-size:15px">✓ <strong>Stay Hydrated:</strong> Drink 8+ glasses daily</p></td></tr><tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb"><p style="margin:0;color:#4b5563;font-size:15px">✓ <strong>Track Progress:</strong> Photos & measurements weekly</p></td></tr><tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb"><p style="margin:0;color:#4b5563;font-size:15px">✓ <strong>Rest Days Matter:</strong> Recovery = growth</p></td></tr><tr><td style="padding:12px 0"><p style="margin:0;color:#4b5563;font-size:15px">✓ <strong>Listen to Your Body:</strong> Adjust as needed</p></td></tr></table></td></tr><tr><td style="background-color:#f9fafb;padding:30px;text-align:center;border-radius:0 0 12px 12px;border-top:1px solid #e5e7eb"><p style="margin:0 0 15px 0;color:#6b7280;font-size:14px">Need support? We're here to help!</p><p style="margin:0 0 20px 0;color:#9ca3af;font-size:13px">This email was sent to ${formData.email}<br>© ${new Date().getFullYear()} AI Fitness Wizard</p><p style="margin:0;color:#9ca3af;font-size:12px"><a href="mailto:nutritionandrecovery@gmail.com?subject=Unsubscribe" style="color:#7c3aed;text-decoration:underline">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`,
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
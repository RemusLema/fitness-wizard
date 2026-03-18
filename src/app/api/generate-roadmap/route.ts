// src/app/api/generate-roadmap/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { stripEmojis } from "@/lib/utils";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { formData, month1Plan, timeline } = body;

        if (!formData || !timeline) {
            return NextResponse.json({ error: "Missing formData or timeline" }, { status: 400 });
        }

        // Determine how many months to cover (beyond Month 1)
        const extraMonths = timeline === "6_months" ? 5 : 2;
        const totalWeeks = extraMonths * 4;

        // Phase structure
        let phaseStructure = "";
        if (timeline === "3_months") {
            phaseStructure = `
2 phases total:
- Phase 1 — Month 2 (Weeks 5-8): "Progressive Overload" — increase intensity from Month 1
- Phase 2 — Month 3 (Weeks 9-12): "Peak Performance" — maximize results before completion`;
        } else {
            phaseStructure = `
3 phases total:
- Phase 1 — Months 2-3 (Weeks 5-12): "Progressive Overload" — build systematically on Month 1
- Phase 2 — Months 4-5 (Weeks 13-20): "Development & Intensity" — advanced techniques, higher load
- Phase 3 — Month 6 (Weeks 21-24): "Peak & Consolidation" — maximum performance, test improvements`;
        }

        // Extract key Month 1 context from the plan
        const m1Context = month1Plan ? `
Month 1 plan summary:
- Title: ${month1Plan.title}
- Week titles: ${Array.isArray(month1Plan.weeks) ? month1Plan.weeks.map((w: any) => w.weekTitle).join(", ") : "not available"}
- Sample workout style: ${Array.isArray(month1Plan.weeks) && month1Plan.weeks[0]?.days?.[0]?.workout ? month1Plan.weeks[0].days[0].workout.substring(0, 200) : "compound lifts focus"}
` : "";

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a world-class strength and conditioning coach creating a professional progression roadmap.

The client has just completed (or is about to start) their Month 1 training block. Now create a tailored progression roadmap for the REMAINING months of their program.

Client profile:
- Name: ${formData.name}
- Goal: ${formData.goal?.replace(/_/g, " ")}
- Fitness level: ${formData.fitnessLevel}
- Equipment: ${Array.isArray(formData.equipment) && formData.equipment.length > 0 ? formData.equipment.join(", ") : "bodyweight"}
- Diet: ${formData.dietaryPreference}
- Timeline: ${timeline.replace(/_/g, " ")}
${m1Context}

Phase structure to follow:
${phaseStructure}

Return VALID JSON only:
{
  "roadmapTitle": "Your ${extraMonths}-Month Progression Roadmap",
  "clientName": "${formData.name}",
  "goal": "${formData.goal?.replace(/_/g, " ")}",
  "phases": [
    {
      "phaseNumber": 1,
      "phaseTitle": "Phase 1 — Month 2: Progressive Overload",
      "phaseSummary": "2-3 sentence description of what this phase achieves and why",
      "phaseGoal": "Specific, measurable outcome for this phase",
      "weeks": [
        {
          "weekNumber": 5,
          "weekTitle": "Week 5: Loading Phase",
          "focus": "Primary training focus for this week",
          "workoutAdjustments": "Specific changes from Month 1: e.g. add 5-10% to barbell lifts; increase sets from 3 to 4; reduce rest from 90s to 75s",
          "nutritionAdjustments": "Specific nutrition changes: e.g. increase protein to 160g; add 30g carbs pre-workout on training days",
          "keyExercises": "2-3 specific exercises to prioritize this week with target weights/reps",
          "trainerNote": "One specific, actionable coaching tip for this week. Max 20 words."
        }
      ]
    }
  ],
  "completionMessage": "Motivational message for completing the full program"
}

RULES:
- Cover EXACTLY ${totalWeeks} weeks across ${extraMonths} months (Weeks 5 through Week ${4 + totalWeeks})
- Every week must have ALL fields filled in with SPECIFIC, MEASURABLE instructions
- workoutAdjustments must reference actual changes (not generic advice)
- nutritionAdjustments must include specific macros/calories targets
- keyExercises must list exercises with sets/reps/percentages
- Be specific to the user's goal (${formData.goal}), level (${formData.fitnessLevel}), and equipment
- All values MUST be STRINGS`
                },
                { role: "user", content: `Create the progression roadmap for ${formData.name}'s ${timeline.replace(/_/g, " ")} ${formData.goal?.replace(/_/g, " ")} program.` }
            ],
            temperature: 0.7,
            max_tokens: 6000,
            response_format: { type: "json_object" },
        });

        const aiText = completion.choices[0]?.message?.content;
        if (!aiText) throw new Error("No AI response for roadmap");

        const roadmap = stripEmojis(JSON.parse(aiText));
        return NextResponse.json({ roadmap });

    } catch (error: any) {
        console.error("Roadmap generation error:", error);
        return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
    }
}

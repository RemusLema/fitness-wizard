import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { BonusPDF } from "@/lib/BonusPDF";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { formData } = await req.json();

        if (!formData || !formData.email) {
            return NextResponse.json({ error: "Missing form data" }, { status: 400 });
        }

        console.log("🎁 Starting Bonus PDF generation for:", formData.email);

        // Verify eligibility
        if (formData.timeline !== "3_months" && formData.timeline !== "6_months") {
            console.log("⚠️ Not eligible for bonus, skipping.");
            return NextResponse.json({ success: true, message: "No bonus required" }); // Not an error
        }

        // Generate Bonus PDF
        const bonusPdfDoc = (
            <BonusPDF
                name={formData.name}
                goal={formData.goal?.replace(/_/g, " ") || "fitness"}
                level={formData.fitnessLevel || "intermediate"}
                timeline={formData.timeline as "3_months" | "6_months"}
            />
        );

        const bonusPdfBlob = await pdf(bonusPdfDoc).toBlob();
        const bonusBuffer = Buffer.from(await bonusPdfBlob.arrayBuffer());

        const durationText = formData.timeline === "3_months" ? "3-Month" : "6-Month";
        const bonusFilename =
            formData.timeline === "3_months"
                ? "Bonus_3_Month_Roadmap.pdf"
                : "Bonus_6_Month_Blueprint.pdf";

        console.log("✅ Bonus PDF generated successfully:", bonusFilename);

        // Send Bonus Email
        if (formData.want?.email && process.env.RESEND_API_KEY) {
            console.log("📧 Sending bonus email to:", formData.email);

            await resend.emails.send({
                from: "Fitness Wizard <hello@ramafit.xyz>",
                to: formData.email,
                subject: `Your Bonus ${durationText} Roadmap! 🎁`,
                html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #7c3aed;">Your Bonus Roadmap is Here! 🎁</h1>
            <p>Hi ${formData.name.split(' ')[0]},</p>
            <p>As promised, here is your <strong>${durationText}</strong> bonus roadmap to guide your long-term success.</p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0;">
              <p style="margin: 0;">This roadmap includes your milestones, progression phases, and key focus areas for the next few months.</p>
            </div>
            <p>Keep crushing your goals!</p>
            <p>- The Fitness Team</p>
          </div>
        `,
                attachments: [
                    {
                        filename: bonusFilename,
                        content: bonusBuffer,
                    },
                ],
            });
            console.log("✅ Bonus email sent successfully");
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("❌ Bonus API Error:", error);
        // Don't expose internal errors to client in production
        return NextResponse.json(
            { error: "Failed to generate bonus", details: error.message },
            { status: 500 }
        );
    }
}

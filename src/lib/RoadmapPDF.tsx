// src/lib/RoadmapPDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
    page: { padding: 30, paddingBottom: 50, fontSize: 9, fontFamily: "Helvetica", backgroundColor: "#fff" },
    // Cover page
    coverPage: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
    coverBadge: { backgroundColor: "#7c3aed", paddingTop: 4, paddingBottom: 4, paddingLeft: 12, paddingRight: 12, borderRadius: 20, marginBottom: 16 },
    coverBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold", textTransform: "uppercase" },
    coverTitle: { fontSize: 28, fontWeight: "bold", color: "#1e293b", textAlign: "center", marginBottom: 8, lineHeight: 1.2 },
    coverSub: { fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 30 },
    coverDivider: { width: 60, height: 3, backgroundColor: "#7c3aed", marginBottom: 30 },
    coverStats: { flexDirection: "row", gap: 30, justifyContent: "center", marginBottom: 40 },
    coverStatBox: { alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 10, padding: 14, width: 100 },
    coverStatValue: { fontSize: 22, fontWeight: "bold", color: "#7c3aed", marginBottom: 2 },
    coverStatLabel: { fontSize: 8, color: "#64748b", textAlign: "center" },
    coverFooter: { fontSize: 9, color: "#94a3b8", textAlign: "center" },
    // Phase header
    phaseHeader: { backgroundColor: "#7c3aed", padding: 12, marginBottom: 8, borderRadius: 6 },
    phaseHeaderNum: { fontSize: 8, color: "#c4b5fd", fontWeight: "bold", marginBottom: 2 },
    phaseHeaderTitle: { fontSize: 14, color: "#fff", fontWeight: "bold", marginBottom: 2 },
    phaseHeaderSub: { fontSize: 9, color: "#ddd6fe" },
    phaseGoal: { backgroundColor: "#f3e8ff", borderLeftWidth: 3, borderLeftColor: "#7c3aed", padding: 8, marginBottom: 10, borderRadius: 3 },
    phaseGoalLabel: { fontSize: 7, fontWeight: "bold", color: "#7c3aed", marginBottom: 2 },
    phaseGoalText: { fontSize: 9, color: "#4c1d95" },
    // Week row
    weekGrid: { flexDirection: "column", gap: 6, marginBottom: 8 },
    weekCard: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 5, padding: 8, backgroundColor: "#fff" },
    weekCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
    weekNum: { backgroundColor: "#ede9fe", paddingTop: 2, paddingBottom: 2, paddingLeft: 6, paddingRight: 6, borderRadius: 8 },
    weekNumText: { fontSize: 7, fontWeight: "bold", color: "#7c3aed" },
    weekTitle: { fontSize: 9, fontWeight: "bold", color: "#1e293b", flex: 1, marginLeft: 8 },
    weekGrid2col: { flexDirection: "row", gap: 6, marginTop: 4 },
    weekCol: { flex: 1 },
    fieldLabel: { fontSize: 7, fontWeight: "bold", color: "#64748b", marginBottom: 2, textTransform: "uppercase" },
    fieldText: { fontSize: 8, color: "#334155", lineHeight: 1.4 },
    trainerBox: { backgroundColor: "#fdf4ff", borderLeftWidth: 2, borderLeftColor: "#a855f7", padding: 5, marginTop: 5, borderRadius: 3 },
    trainerText: { fontSize: 7, color: "#7e22ce", fontStyle: "italic" },
    focusBadge: { backgroundColor: "#dbeafe", paddingTop: 2, paddingBottom: 2, paddingLeft: 6, paddingRight: 6, borderRadius: 8, alignSelf: "flex-start", marginBottom: 4 },
    focusBadgeText: { fontSize: 7, color: "#1d4ed8" },
    // Completion
    completionBox: { backgroundColor: "#f0fdf4", borderRadius: 8, padding: 20, marginTop: 10 },
    completionTitle: { fontSize: 14, fontWeight: "bold", color: "#15803d", marginBottom: 8, textAlign: "center" },
    completionText: { fontSize: 9, color: "#166534", textAlign: "center", lineHeight: 1.6 },
    // Footer
    footer: {
        position: "absolute", bottom: 16, left: 30, right: 30,
        textAlign: "center", fontSize: 7, color: "#94a3b8",
        borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 5,
    },
    sectionDivider: { borderTopWidth: 1, borderTopColor: "#f1f5f9", marginTop: 6, marginBottom: 6 },
});

export function RoadmapPDF({ roadmap }: { roadmap: any }) {
    if (!roadmap) return null;

    const phases: any[] = Array.isArray(roadmap.phases) ? roadmap.phases : [];
    const totalWeeks = phases.reduce((acc: number, p: any) => acc + (Array.isArray(p.weeks) ? p.weeks.length : 0), 0);
    const totalMonths = Math.round(totalWeeks / 4);

    return (
        <Document>
            {/* ── Cover Page ──────────────────────────────────────────────────── */}
            <Page size="A4" orientation="landscape" style={s.page}>
                <View style={s.coverPage}>
                    <View style={s.coverBadge}>
                        <Text style={s.coverBadgeText}>ramafit.xyz — Your Roadmap</Text>
                    </View>
                    <Text style={s.coverTitle}>{roadmap.roadmapTitle || "Your Progression Roadmap"}</Text>
                    <Text style={s.coverSub}>
                        Personalized for {roadmap.clientName} · Goal: {String(roadmap.goal || "").replace(/_/g, " ")}
                    </Text>
                    <View style={s.coverDivider} />
                    <View style={s.coverStats}>
                        <View style={s.coverStatBox}>
                            <Text style={s.coverStatValue}>{totalMonths}</Text>
                            <Text style={s.coverStatLabel}>Months of Progression</Text>
                        </View>
                        <View style={s.coverStatBox}>
                            <Text style={s.coverStatValue}>{totalWeeks}</Text>
                            <Text style={s.coverStatLabel}>Weeks of Training</Text>
                        </View>
                        <View style={s.coverStatBox}>
                            <Text style={s.coverStatValue}>{phases.length}</Text>
                            <Text style={s.coverStatLabel}>Training Phases</Text>
                        </View>
                    </View>
                    <Text style={s.coverFooter}>
                        This roadmap complements your Month 1 full plan.{"\n"}
                        Combined with Month 1, this gives you a complete {totalMonths + 1}-month system.
                    </Text>
                </View>
                <Text style={s.footer} fixed>ramafit.xyz  |  Your personalized fitness is our mission</Text>
            </Page>

            {/* ── Phase Pages ─────────────────────────────────────────────────── */}
            {phases.map((phase: any, pIdx: number) => {
                const weeks: any[] = Array.isArray(phase.weeks) ? phase.weeks : [];
                return (
                    <Page key={pIdx} size="A4" orientation="landscape" style={s.page} break>
                        {/* Phase header */}
                        <View style={s.phaseHeader}>
                            <Text style={s.phaseHeaderNum}>PHASE {phase.phaseNumber || pIdx + 1}</Text>
                            <Text style={s.phaseHeaderTitle}>{phase.phaseTitle}</Text>
                            {phase.phaseSummary && <Text style={s.phaseHeaderSub}>{phase.phaseSummary}</Text>}
                        </View>

                        {/* Phase goal */}
                        {phase.phaseGoal && (
                            <View style={s.phaseGoal}>
                                <Text style={s.phaseGoalLabel}>Phase Goal</Text>
                                <Text style={s.phaseGoalText}>{phase.phaseGoal}</Text>
                            </View>
                        )}

                        {/* Week cards */}
                        <View style={s.weekGrid}>
                            {weeks.map((week: any, wIdx: number) => (
                                <View key={wIdx} style={s.weekCard} wrap={false}>
                                    <View style={s.weekCardHeader}>
                                        <View style={s.weekNum}>
                                            <Text style={s.weekNumText}>WEEK {week.weekNumber}</Text>
                                        </View>
                                        <Text style={s.weekTitle}>{week.weekTitle}</Text>
                                    </View>
                                    {/* Focus badge */}
                                    {week.focus && (
                                        <View style={s.focusBadge}>
                                            <Text style={s.focusBadgeText}>{week.focus}</Text>
                                        </View>
                                    )}
                                    {/* 2-col grid: Workout | Nutrition */}
                                    <View style={s.weekGrid2col}>
                                        <View style={s.weekCol}>
                                            <Text style={s.fieldLabel}>Workout Adjustments</Text>
                                            <Text style={s.fieldText}>{week.workoutAdjustments}</Text>
                                        </View>
                                        <View style={s.weekCol}>
                                            <Text style={s.fieldLabel}>Nutrition Adjustments</Text>
                                            <Text style={s.fieldText}>{week.nutritionAdjustments}</Text>
                                        </View>
                                    </View>
                                    {/* Key exercises */}
                                    {week.keyExercises && (
                                        <View style={{ marginTop: 4 }}>
                                            <Text style={s.fieldLabel}>Key Exercises / Targets</Text>
                                            <Text style={s.fieldText}>{week.keyExercises}</Text>
                                        </View>
                                    )}
                                    {/* Trainer note */}
                                    {week.trainerNote && (
                                        <View style={s.trainerBox}>
                                            <Text style={s.trainerText}>Coach: {week.trainerNote}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>

                        <Text style={s.footer} fixed>
                            ramafit.xyz  |  {roadmap.roadmapTitle}  |  Phase {phase.phaseNumber || pIdx + 1} of {phases.length}
                        </Text>
                    </Page>
                );
            })}

            {/* ── Completion Page ──────────────────────────────────────────────── */}
            <Page size="A4" orientation="landscape" style={s.page}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
                    <Text style={{ fontSize: 40, marginBottom: 20 }}>🏆</Text>
                    <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1e293b", textAlign: "center", marginBottom: 12 }}>
                        {roadmap.clientName} — Your {totalMonths + 1}-Month Journey Complete
                    </Text>
                    <View style={s.completionBox}>
                        <Text style={s.completionTitle}>You did it.</Text>
                        <Text style={s.completionText}>
                            {roadmap.completionMessage || `You've completed a structured ${totalMonths + 1}-month fitness program designed specifically for you. This is a real achievement. Track your progress, share your results, and never stop improving.`}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", marginTop: 30 }}>
                        Thank you for trusting ramafit.xyz with your journey.{"\n"}
                        Ready for your next cycle? Generate a new plan anytime.
                    </Text>
                </View>
                <Text style={s.footer} fixed>ramafit.xyz  |  Your personalized fitness is our mission</Text>
            </Page>
        </Document>
    );
}

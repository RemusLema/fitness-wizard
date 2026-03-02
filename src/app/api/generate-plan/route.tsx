import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { BonusPDF } from "@/lib/BonusPDF";
import { RoadmapPDF } from "@/lib/RoadmapPDF";
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
    paddingBottom: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff"
  },
  header: {
    backgroundColor: "#7c3aed",
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerBadge: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
  },
  headerBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 11,
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
  // Week block
  weekTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 2,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#fbcfe8",
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#be185d",
  },
  weekTargetText: {
    fontSize: 7,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 6,
  },
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  progressBarTrack: {
    fontSize: 8,
    color: "#7c3aed",
    fontFamily: "Courier",
    letterSpacing: 0,
  },
  progressBarLabel: {
    fontSize: 7,
    color: "#94a3b8",
  },
  // Day box — 3-column grid
  dayBox: {
    width: "32%",
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  // Color-coded day headers
  dayHeaderWorkout: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    padding: 4,
    borderRadius: 3,
    marginBottom: 4,
  },
  dayHeaderRest: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#16a34a",
    padding: 4,
    borderRadius: 3,
    marginBottom: 4,
  },
  dayHeaderCardio: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#ea580c",
    padding: 4,
    borderRadius: 3,
    marginBottom: 4,
  },
  dayHeaderDefault: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#7c3aed",
    padding: 4,
    borderRadius: 3,
    marginBottom: 4,
  },
  // Section headers (inside day)
  subHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 4,
    marginBottom: 2,
  },
  timingHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ea580c",
    marginTop: 4,
    marginBottom: 2,
  },
  workoutHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 4,
    marginBottom: 2,
  },
  nutritionHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#16a34a",
    marginTop: 4,
    marginBottom: 2,
  },
  checkboxItem: {
    fontSize: 7,
    lineHeight: 1.3,
    color: "#334155",
    marginBottom: 1,
    paddingLeft: 3,
  },
  // Macro summary row
  macroRow: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
    padding: 4,
    marginTop: 4,
    marginBottom: 2,
    justifyContent: "space-between",
  },
  macroItem: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#15803d",
  },
  // Trainer note box
  trainerNoteBox: {
    backgroundColor: "#f3e8ff",
    borderLeftWidth: 2,
    borderLeftColor: "#7c3aed",
    borderRadius: 3,
    padding: 5,
    marginTop: 5,
  },
  trainerNoteLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#6d28d9",
    marginBottom: 1,
  },
  trainerNoteText: {
    fontSize: 7,
    color: "#4c1d95",
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  // Divider
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginTop: 3,
    marginBottom: 3,
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
    bottom: 18,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
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
    fontSize: 8,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 1,
  },
  mealItem: {
    fontSize: 7,
    lineHeight: 1.4,
    color: "#475569",
    marginBottom: 1,
    paddingLeft: 6,
  },
  weekContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
  },
  text: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#334155",
    marginBottom: 2,
  },
  progressionSection: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
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
    lineHeight: 1.5,
    color: "#1e293b",
  },
  dayContainer: {
    marginBottom: 6,
  },
  dayHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#7c3aed",
    padding: 5,
    borderRadius: 4,
    marginBottom: 5,
  },
});

// ✅ NEW: Mobile-Optimized PDF Styles
const mobilePdfStyles = StyleSheet.create({
  page: {
    padding: 15,
    paddingBottom: 45,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff"
  },
  header: {
    backgroundColor: "#7c3aed",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flex: 1 },
  headerBadge: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 6,
    paddingRight: 6,
  },
  headerBadgeText: { fontSize: 7, fontWeight: "bold", color: "#7c3aed" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff", marginBottom: 2 },
  headerSubtitle: { fontSize: 9, color: "#e9d5ff" },
  section: {
    marginBottom: 6, padding: 6, backgroundColor: "#f8fafc",
    borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#7c3aed",
  },
  sectionTitle: {
    fontSize: 11, fontWeight: "bold", color: "#4c1d95",
    marginBottom: 4, textTransform: "uppercase",
  },
  weekTitleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 8, marginBottom: 2, paddingBottom: 2,
    borderBottomWidth: 1, borderBottomColor: "#fbcfe8",
  },
  weekTitle: { fontSize: 12, fontWeight: "bold", color: "#be185d" },
  weekTargetText: { fontSize: 6, color: "#64748b", fontStyle: "italic", marginBottom: 5 },
  progressBarRow: { flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 5 },
  progressBarTrack: { fontSize: 7, color: "#7c3aed", fontFamily: "Courier" },
  progressBarLabel: { fontSize: 6, color: "#94a3b8" },
  dayContainer: { marginBottom: 4 },
  dayBox: {
    width: "100%", backgroundColor: "#ffffff",
    borderRadius: 5, padding: 7, marginBottom: 6,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  dayHeaderWorkout: {
    fontSize: 9, fontWeight: "bold", color: "#ffffff",
    backgroundColor: "#2563eb", padding: 4, borderRadius: 3, marginBottom: 4,
  },
  dayHeaderRest: {
    fontSize: 9, fontWeight: "bold", color: "#ffffff",
    backgroundColor: "#16a34a", padding: 4, borderRadius: 3, marginBottom: 4,
  },
  dayHeaderCardio: {
    fontSize: 9, fontWeight: "bold", color: "#ffffff",
    backgroundColor: "#ea580c", padding: 4, borderRadius: 3, marginBottom: 4,
  },
  dayHeaderDefault: {
    fontSize: 9, fontWeight: "bold", color: "#ffffff",
    backgroundColor: "#7c3aed", padding: 4, borderRadius: 3, marginBottom: 4,
  },
  dayHeader: {
    fontSize: 9, fontWeight: "bold", color: "#ffffff",
    backgroundColor: "#7c3aed", padding: 4, borderRadius: 3, marginBottom: 4,
  },
  subHeader: { fontSize: 8, fontWeight: "bold", color: "#1e293b", marginTop: 3, marginBottom: 2 },
  timingHeader: { fontSize: 7, fontWeight: "bold", color: "#ea580c", marginTop: 3, marginBottom: 2 },
  workoutHeader: { fontSize: 7, fontWeight: "bold", color: "#2563eb", marginTop: 3, marginBottom: 2 },
  nutritionHeader: { fontSize: 7, fontWeight: "bold", color: "#16a34a", marginTop: 3, marginBottom: 2 },
  checkboxItem: { fontSize: 7, lineHeight: 1.4, color: "#334155", marginBottom: 2, paddingLeft: 4 },
  macroRow: {
    flexDirection: "row", backgroundColor: "#f0fdf4",
    borderRadius: 3, padding: 3, marginTop: 3, marginBottom: 2,
    justifyContent: "space-between",
  },
  macroItem: { fontSize: 6, fontWeight: "bold", color: "#15803d" },
  trainerNoteBox: {
    backgroundColor: "#f3e8ff", borderLeftWidth: 2,
    borderLeftColor: "#7c3aed", borderRadius: 3, padding: 4, marginTop: 4,
  },
  trainerNoteLabel: { fontSize: 6, fontWeight: "bold", color: "#6d28d9", marginBottom: 1 },
  trainerNoteText: { fontSize: 6, color: "#4c1d95", fontStyle: "italic", lineHeight: 1.3 },
  divider: { borderTopWidth: 1, borderTopColor: "#e2e8f0", marginTop: 2, marginBottom: 2 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  field: { width: "48%", marginBottom: 4 },
  label: { fontSize: 7, color: "#64748b", marginBottom: 1, textTransform: "uppercase" },
  value: { fontSize: 9, color: "#1e293b", fontWeight: "bold" },
  footer: {
    position: "absolute", bottom: 12, left: 15, right: 15,
    textAlign: "center", color: "#94a3b8", fontSize: 7,
    borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 5,
  },
  bulletPoint: { fontSize: 7, lineHeight: 1.4, color: "#334155", marginBottom: 1, paddingLeft: 6 },
  mealSection: { marginTop: 2, marginBottom: 2 },
  mealType: { fontSize: 7, fontWeight: "bold", color: "#15803d", marginBottom: 1 },
  mealItem: { fontSize: 6, lineHeight: 1.3, color: "#475569", marginBottom: 1, paddingLeft: 5 },
  weekContainer: { flexDirection: "column", gap: 5 },
  text: { fontSize: 8, lineHeight: 1.4, color: "#334155", marginBottom: 2 },
  progressionSection: {
    marginTop: 8, marginBottom: 8, padding: 8, backgroundColor: "#f0f4ff",
    borderRadius: 6, borderLeftWidth: 4, borderLeftColor: "#7c3aed",
  },
  progressionTitle: { fontSize: 11, fontWeight: "bold", color: "#7c3aed", marginBottom: 4 },
  progressionText: { fontSize: 8, lineHeight: 1.4, color: "#1e293b" },
});

// Helper: Normalize PDF text (fix common artifacts)
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u00A0/g, ' ')  // Non-breaking spaces
    .replace(/-\n\s*/g, '')   // Hyphenated line breaks: "car-dio\n" -> "cardio"
    .replace(/([a-zA-Z])- ([a-zA-Z])/g, '$1$2')  // Mid-word hyphens: "pro-tein" -> "protein"
    .replace(/^#{1,6}\s*/gm, '')  // Strip markdown headers: "## TIMING" -> "TIMING"
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')  // Strip bold/italic markdown: **text** -> text
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
    const cleaned = part
      .replace(/^\s*\d+\.\s+/, '')  // Strip ONLY numbered lists like "1. " (requires period)
      .replace(/^#+\s*/, '')  // Strip any leading # chars
      .trim();
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
const FitnessPDF = ({ data, plan, isMobile = false }: { data: any; plan: any; isMobile?: boolean }) => {
  const styles = isMobile ? mobilePdfStyles : pdfStyles;

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
      <Page size="A4" orientation={isMobile ? "portrait" : "landscape"} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fitness Wizard Plan</Text>
          <Text style={styles.headerSubtitle}>
            Customized for {safeName} • {data.timeline === "1_month"
              ? "Your Complete 4-Week Plan"
              : `Cycle 1 of Your ${safeTimeline} Journey`}
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Athlete Profile</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Goal</Text>
              <Text style={styles.value}>{safeGoal}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Fitness Level</Text>
              <Text style={styles.value}>{safeFitnessLevel}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Timeline</Text>
              <Text style={styles.value}>{safeTimeline}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Equipment</Text>
              <Text style={styles.value}>{safeEquipment}</Text>
            </View>
          </View>
        </View>

        {/* Introduction */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.text}>{safeIntro}</Text>
        </View>

        {/* Weeks + Days renderer */}
        {Array.isArray(plan?.weeks) && plan.weeks.length > 0 ? (
          plan.weeks.map((week: any, wIndex: number) => {
            const totalWeeks = plan.weeks.length;
            const weekTitle = week?.weekTitle || `Week ${wIndex + 1}`;
            const weekTarget = week?.weekTarget ? String(week.weekTarget) : null;

            // Build ASCII progress bar: e.g. "[====------]"
            const filled = Math.round(((wIndex + 1) / totalWeeks) * 10);
            const empty = 10 - filled;
            const progressBar = `[${'='.repeat(filled)}${'-'.repeat(empty)}]`;

            return (
              <View key={wIndex} break={wIndex > 0} style={{ flexDirection: "column" }}>
                {/* Week header row */}
                <View style={styles.weekTitleRow}>
                  <Text style={styles.weekTitle}>{weekTitle}</Text>
                  <Text style={styles.progressBarLabel}>Week {wIndex + 1} of {totalWeeks}</Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarRow}>
                  <Text style={styles.progressBarTrack}>{progressBar}</Text>
                  {weekTarget && (
                    <Text style={styles.weekTargetText}>{weekTarget}</Text>
                  )}
                </View>

                {/* 2-Column Grid */}
                <View style={styles.weekContainer}>
                  {Array.isArray(week?.days) && week.days.length > 0 ? (
                    week.days.map((day: any, dIndex: number) => {
                      const dayTitle = String(day?.dayTitle || `Day ${dIndex + 1}`);
                      const focus = String(day?.focus || "General Fitness");
                      const timing = String(day?.timing || "Flexible timing");
                      const workout = String(day?.workout || "Rest day or active recovery");
                      const meals = String(day?.meals || "Balanced nutrition throughout the day");
                      const calories = day?.calories ? String(day.calories) : null;
                      const macros = day?.macros ? String(day.macros) : null;
                      const trainerNote = day?.trainerNote ? String(day.trainerNote) : null;

                      // Determine day type for color-coding
                      const focusLower = focus.toLowerCase();
                      const isRest = focusLower.includes("rest") || focusLower.includes("recovery");
                      const isCardio = focusLower.includes("cardio") || focusLower.includes("hiit") || focusLower.includes("run");
                      const dayHeaderStyle = isRest
                        ? styles.dayHeaderRest
                        : isCardio
                          ? styles.dayHeaderCardio
                          : styles.dayHeaderWorkout;

                      const workoutBullets = parseWorkoutIntoBullets(workout);
                      const mealSections = parseMealsIntoSections(meals);

                      // Parse macros string into parts
                      const macroParts = macros ? macros.split("|").map((p: string) => p.trim()) : [];

                      return (
                        <View key={dIndex} style={styles.dayBox} wrap={false}>
                          {/* Color-coded day header */}
                          <Text style={dayHeaderStyle}>
                            {dayTitle} — {focus}
                          </Text>

                          <Text style={styles.timingHeader}>TIMING</Text>
                          {timing.split(/[,;]/).map((t, idx) => (
                            <Text key={idx} style={styles.checkboxItem}>
                              [ ] {t.trim()}
                            </Text>
                          ))}

                          <Text style={styles.workoutHeader}>WORKOUT</Text>
                          {workoutBullets.length > 0 ? (
                            workoutBullets.map((exercise, idx) => (
                              <Text key={idx} style={styles.checkboxItem}>
                                [ ] {exercise}
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.checkboxItem}>[ ] {workout}</Text>
                          )}

                          <Text style={styles.nutritionHeader}>NUTRITION</Text>
                          {Object.keys(mealSections).length > 0 ? (
                            Object.entries(mealSections).map(([mealType, items], idx) => (
                              <View key={idx} style={styles.mealSection}>
                                <Text style={styles.mealType}>{mealType.toUpperCase()}:</Text>
                                {items.map((item, itemIdx) => (
                                  <Text key={itemIdx} style={styles.checkboxItem}>
                                    [ ] {item}
                                  </Text>
                                ))}
                              </View>
                            ))
                          ) : (
                            <Text style={styles.checkboxItem}>[ ] {meals}</Text>
                          )}

                          {/* Macro summary row */}
                          {(calories || macroParts.length > 0) && (
                            <View style={styles.macroRow}>
                              {calories && (
                                <Text style={styles.macroItem}>Cal: {calories}</Text>
                              )}
                              {macroParts.map((part: string, idx: number) => (
                                <Text key={idx} style={styles.macroItem}>{part}</Text>
                              ))}
                            </View>
                          )}

                          {/* Trainer note */}
                          {trainerNote && (
                            <View style={styles.trainerNoteBox}>
                              <Text style={styles.trainerNoteLabel}>Trainer Note</Text>
                              <Text style={styles.trainerNoteText}>{trainerNote}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.text}>No days scheduled for this week.</Text>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.section}>
            <Text style={styles.text}>
              Your personalized plan is being prepared. Please try generating again.
            </Text>
          </View>
        )}

        {/* Progression Notes for Multi-Month Plans */}
        {plan.progressionNotes && data.timeline !== "1_month" && (
          <View style={styles.progressionSection}>
            <Text style={styles.progressionTitle}>
              Progression Plan for Your {safeTimeline} Journey
            </Text>
            <Text style={styles.progressionText}>
              {plan.progressionNotes}
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          ramafit.xyz  |  Your personalized fitness is our mission
        </Text>
      </Page>
    </Document>
  );
};

export async function POST(req: NextRequest) {
  try {
    // ── Security: Body size limit (10KB) ────────────────────────────────────
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10240) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    // ── Security: Auth gate ─────────────────────────────────────────────────
    // Only webhook (with internal secret) can trigger plan generation
    const internalSecret = process.env.INTERNAL_API_SECRET;
    const providedSecret = req.headers.get("x-internal-secret");

    if (!internalSecret || providedSecret !== internalSecret) {
      console.warn("⛔ Unauthorized generate-plan attempt blocked");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // ── Extract formData (from webhook) ─────────────────────────────────────
    let formData: any;
    let want: any;
    let tier = body.tier || "starter";

    const { want: w, tier: t, ...fd } = body;
    formData = fd;
    want = w;
    if (t) tier = t;

    // ── Security: Sanitize inputs ───────────────────────────────────────────
    const sanitize = (s: string) => s?.replace(/[<>'"&]/g, '').slice(0, 500) || '';
    formData.name = sanitize(formData.name);
    formData.email = sanitize(formData.email);
    formData.goal = sanitize(formData.goal || '');
    formData.fitnessLevel = sanitize(formData.fitnessLevel || '');
    formData.dietaryPreference = sanitize(formData.dietaryPreference || '');
    formData.workoutLocation = sanitize(formData.workoutLocation || '');
    formData.intensity = sanitize(formData.intensity || '');
    formData.pastInjuries = sanitize(formData.pastInjuries || '');

    if (!formData.name || !formData.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    console.log("📋 Generating plan for:", formData.name, "| tier:", tier);

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
      "weekTarget": "Volume: 3x compound lifts | Rest: 90s | Focus: Form",
      "days": [
        {
          "dayTitle": "Day 1",
          "focus": "Upper Body Strength",
          "timing": "Wake: 7am, Workout: 8am, Meals: 12pm/3pm/7pm",
          "workout": "Push-ups: 3 sets of 12 reps; Dumbbell Bench Press: 4 sets of 8-10 reps; Overhead Press: 3 sets of 10 reps; Tricep Dips: 3 sets of 12 reps; Plank: 3 sets of 45 seconds",
          "meals": "Breakfast: Oatmeal with banana and almonds (400 cal); Lunch: Grilled chicken with quinoa and vegetables (550 cal); Dinner: Salmon with sweet potato and broccoli (600 cal); Snacks: Greek yogurt, protein shake",
          "calories": "1800",
          "macros": "Protein: 140g | Carbs: 180g | Fat: 55g",
          "trainerNote": "Focus on slow controlled reps — form beats weight every time."
        },
        {
          "dayTitle": "Day 2",
          "focus": "Lower Body Strength",
          "timing": "Wake: 7am, Workout: 8am, Meals: 12pm/3pm/7pm",
          "workout": "Squats: 4 sets of 10 reps; Deadlifts: 3 sets of 8 reps; Lunges: 3 sets of 12 reps per leg; Leg Press: 3 sets of 15 reps; Calf Raises: 4 sets of 20 reps",
          "meals": "Breakfast: Scrambled eggs with whole grain toast (450 cal); Lunch: Turkey wrap with avocado (500 cal); Dinner: Lean beef stir-fry with brown rice (650 cal); Snacks: Protein bar, mixed nuts",
          "calories": "1750",
          "macros": "Protein: 135g | Carbs: 175g | Fat: 52g",
          "trainerNote": "Drive through your heels on squats — protect your knees."
        }
      ]
    },
    {
      "weekTitle": "Week 2: Progressive Overload",
      "weekTarget": "Increase weight 5-10% | Rest: 75s | Focus: Progression",
      "days": [ ... continue with 7 days, each including calories, macros, trainerNote ... ]
    },
    {
      "weekTitle": "Week 3: Intensity",
      "weekTarget": "Volume up 15% | Supersets on 2 days | Rest: 60s",
      "days": [ ... continue with 7 days, each including calories, macros, trainerNote ... ]
    },
    {
      "weekTitle": "Week 4: Peak Performance",
      "weekTarget": "Max effort | Deload last 2 days | Test 1-rep maxes",
      "days": [ ... continue with 7 days, each including calories, macros, trainerNote ... ]
    }
  ],
  "progressionNotes": "Week 5-8 (Next Cycle): Increase all compound lifts by 5-10%; Add 1-2 reps per set; Reduce rest periods by 10-15 seconds; Introduce supersets on upper body days; Add plyometric variations to lower body sessions"
}

CRITICAL FORMATTING INSTRUCTIONS:
- Each week MUST have 7 days (Day 1-7) with complete details
- "workout" field: Use semicolons to separate exercises. Format: "Exercise Name: Sets x Reps; Next Exercise: Sets x Reps"
- "meals" field: Use format "Breakfast: food details (calories); Lunch: food details (calories); Dinner: food details (calories); Snacks: items"
- "calories" field: Total daily calories as a plain number string, e.g. "1800". Adjust for goal (deficit for weight loss, surplus for muscle gain).
- "macros" field: Format exactly as "Protein: Xg | Carbs: Xg | Fat: Xg". Derive from calories and goal. Keep realistic.
- "trainerNote" field: ONE specific sentence of coaching advice relevant to that day's focus. Be concrete, not generic. Max 20 words.
- "weekTarget" field per week: ONE line summarizing the week's training focus/metrics. Format: "Key metric | Key metric | Focus: X".
- All values MUST be STRINGS, never objects or arrays
- **progressionNotes requirement**: If timeline is "3_months" or "6_months" → "progressionNotes" field is MANDATORY.
- Be detailed but concise — do NOT truncate the JSON, do NOT pad with filler text
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

    console.log("📄 Generating PDFs...");

    // ✅ NEW: Generate both desktop and mobile PDFs
    const desktopPdfBuffer = await generatePDF(formData, aiPlan, false);
    console.log("✅ Desktop PDF generated, size:", desktopPdfBuffer.length);

    const mobilePdfBuffer = await generatePDF(formData, aiPlan, true);
    console.log("✅ Mobile PDF generated, size:", mobilePdfBuffer.length);

    // 5. Send Email (Main Plan Only)
    let emailError = null;
    if (want?.email && formData.email) {
      if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ No RESEND_API_KEY found, skipping email.");
      } else {
        try {
          console.log("📧 Sending email to:", formData.email);

          const durationText = formData.timeline === "1_month" ? "4-Week" :
            formData.timeline === "3_months" ? "3-Month" :
              formData.timeline === "6_months" ? "6-Month" : "Custom";

          await resend.emails.send({
            from: "Fitness Wizard <hello@ramafit.xyz>",
            to: formData.email,
            subject: `Your Personalized ${durationText} Fitness Plan 🚀`,
            html: `
              <div style="font-family: sans-serif; color: #333;">
                <h1>Your Plan is Ready! 🎉</h1>
                <p>Hi ${formData.name.split(' ')[0]},</p>
                <p>Here is your personalized <strong>${durationText}</strong> fitness plan.</p>
                <p>Open the attachment to view your full 4-week cycle detail!</p>
                ${(formData.timeline === "3_months" || formData.timeline === "6_months") ? `
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                  <em>* Your bonus roadmap will arrive in a separate email shortly! 🎁</em>
                </p>
                ` : ''}
                <p style="margin-top:30px; color:#666; font-size:14px;">
                  Questions? Reply to this email or reach out directly:<br>
                  <strong>hello@ramafit.xyz</strong> 
                </p>
              </div>
            `,
            attachments: [
              {
                filename: "Your_4_Week_Plan.pdf",
                content: desktopPdfBuffer,
              },
            ],
          });
          console.log("✅ Email sent successfully");
        } catch (emailError_) {
          emailError = emailError_;
          console.error("❌ Email failed:", emailError);
        }
      }
    }

    // ── Roadmap generation for Transform / Elite tiers ───────────────────────
    const needsRoadmap = tier === "transform" || tier === "elite" ||
      formData.timeline === "3_months" || formData.timeline === "6_months";

    if (needsRoadmap) {
      console.log("🗺️ Triggering progression roadmap...");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      // Fire and forget — roadmap emails separately
      fetch(`${baseUrl}/api/generate-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, month1Plan: aiPlan, timeline: formData.timeline }),
      })
        .then(async (r) => {
          if (!r.ok) { console.error("Roadmap API error", r.status); return; }
          const { roadmap } = await r.json();
          if (!roadmap) { console.error("No roadmap returned"); return; }
          // Render roadmap PDF
          const { pdf: pdfFn } = await import("@react-pdf/renderer");
          const { createElement } = await import("react");
          const roadmapElement = createElement(RoadmapPDF, { roadmap });
          const roadmapBlob = await pdfFn(roadmapElement as any).toBlob();
          const roadmapBuffer = Buffer.from(await roadmapBlob.arrayBuffer());
          // Send roadmap as separate email
          if (formData.email && process.env.RESEND_API_KEY) {
            const label = formData.timeline === "6_months" ? "6-Month" : "3-Month";
            await resend.emails.send({
              from: "Fitness Wizard <hello@ramafit.xyz>",
              to: formData.email,
              subject: `Your ${label} Progression Roadmap is here 🗺️`,
              html: `<div style="font-family:sans-serif;color:#333">
                <h1>Your Progression Roadmap 🗺️</h1>
                <p>Hi ${formData.name.split(' ')[0]},</p>
                <p>Attached is your personalized <strong>${label} Progression Roadmap</strong>.</p>
                <p>It picks up right where your Month 1 plan leaves off — with specific workout progressions, nutrition adjustments, and coaching tips for every week.</p>
                <p style="color:#666;font-size:13px">Questions? Reply to this email or reach us at <strong>hello@ramafit.xyz</strong></p>
              </div>`,
              attachments: [{ filename: `RamaFit_${label}_Roadmap.pdf`, content: roadmapBuffer }],
            });
            console.log("✅ Roadmap email sent");
          }
        })
        .catch((err) => console.error("❌ Roadmap generation failed:", err));
    }

    return NextResponse.json({
      success: true,
      plan: aiPlan,
      email: formData.email,
      emailError: emailError,
      needsRoadmap,
      desktopPdf: Buffer.from(desktopPdfBuffer).toString("base64"),
      mobilePdf: Buffer.from(mobilePdfBuffer).toString("base64")
    });

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

// --- Helper Functions for Memory Management ---

async function generateMainPDF(formData: any, planData: any, isMobile: boolean = false): Promise<Buffer> {
  const doc = <FitnessPDF data={formData} plan={planData} isMobile={isMobile} />;
  const blob = await pdf(doc).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}

async function generatePDF(formData: any, planData: any, isMobile: boolean): Promise<Buffer> {
  return generateMainPDF(formData, planData, isMobile);
}

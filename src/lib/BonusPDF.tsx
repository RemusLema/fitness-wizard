import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/**
 * Styles for the Bonus PDF document
 * Note: @react-pdf/renderer has limited CSS support compared to standard CSS
 * - Use font families like "Helvetica-Bold" instead of fontWeight
 * - Use absolute lineHeight values (numbers in points) instead of relative (1.5)
 */
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 12,
        fontFamily: "Helvetica",
        backgroundColor: "#f9f9ff",
    },
    cover: {
        textAlign: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: "Helvetica-Bold",
        color: "#7c3aed",
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        color: "#1f2937",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: "#4c1d95",
    },
    intro: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 30,
        color: "#374151",
    },
    section: {
        marginBottom: 25,
    },
    heading: {
        fontSize: 20,
        fontFamily: "Helvetica-Bold",
        color: "#7c3aed",
        marginBottom: 10,
    },
    bullet: {
        fontSize: 13,
        marginLeft: 20,
        marginBottom: 8,
        lineHeight: 20,
    },
    footer: {
        fontSize: 10,
        color: "#9ca3af",
        textAlign: "center",
        marginTop: 40,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 10,
    },
    // New styles for enhancements
    quoteBox: {
        backgroundColor: "#f0f4ff",
        borderLeftWidth: 4,
        borderLeftColor: "#7c3aed",
        padding: 16,
        marginBottom: 30,
        borderRadius: 4,
    },
    quote: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
        color: "#4c1d95",
        lineHeight: 24,
        textAlign: "center",
        fontStyle: "italic",
    },
    quoteAuthor: {
        fontSize: 12,
        color: "#7c3aed",
        textAlign: "center",
        marginTop: 8,
    },
    progressContainer: {
        marginBottom: 30,
    },
    progressHeading: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
        color: "#7c3aed",
        marginBottom: 15,
    },
    milestoneRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    milestoneBar: {
        width: 120,
        height: 8,
        backgroundColor: "#e5e7eb",
        borderRadius: 4,
        marginRight: 12,
    },
    milestoneBarFilled: {
        width: 120,
        height: 8,
        backgroundColor: "#7c3aed",
        borderRadius: 4,
        marginRight: 12,
    },
    milestoneText: {
        fontSize: 12,
        color: "#374151",
        flex: 1,
    },
    milestoneTextCompleted: {
        fontSize: 12,
        color: "#7c3aed",
        fontFamily: "Helvetica-Bold",
        flex: 1,
    },
    motivationalBox: {
        backgroundColor: "#fef3c7",
        padding: 14,
        marginBottom: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#fbbf24",
    },
    motivationalText: {
        fontSize: 13,
        color: "#92400e",
        lineHeight: 20,
        textAlign: "center",
        fontFamily: "Helvetica-Bold",
    },
    separator: {
        borderBottomWidth: 2,
        borderBottomColor: "#e5e7eb",
        marginVertical: 20,
    },
});

/**
 * Timeline type for better type safety
 */
type Timeline = "3_months" | "6_months";

interface BonusPDFProps {
    name: string;
    goal: string;
    level: string;
    timeline: Timeline;
}

/**
 * BonusPDF Component
 * Generates a personalized fitness roadmap PDF with progress tracking and motivation
 */
export const BonusPDF = ({ name, goal, level, timeline }: BonusPDFProps) => {
    const is3Month = timeline === "3_months";
    const duration = is3Month ? "3-Month Transformation" : "6-Month Mastery";
    const firstName = name.split(" ")[0] || name;

    // Milestone data based on timeline
    const milestones3Month = [
        { week: "Month 1", description: "Foundation & Form ✓", completed: true },
        { week: "Month 2", description: "Building Strength", completed: false },
        { week: "Month 3", description: "Peak Performance", completed: false },
    ];

    const milestones6Month = [
        { week: "Month 1", description: "Foundation & Form ✓", completed: true },
        { week: "Month 2", description: "Building Strength", completed: false },
        { week: "Month 3", description: "Increasing Intensity", completed: false },
        { week: "Month 4", description: "Advanced Techniques", completed: false },
        { week: "Month 5", description: "Peak Performance", completed: false },
        { week: "Month 6", description: "Consolidation & Celebration", completed: false },
    ];

    const milestones = is3Month ? milestones3Month : milestones6Month;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cover Section */}
                <View style={styles.cover}>
                    <Text style={styles.title}>{duration}</Text>
                    <Text style={styles.name}>For {name}</Text>
                    <Text style={styles.subtitle}>
                        Goal: {goal} • Level: {level}
                    </Text>
                </View>

                {/* Motivational Quote */}
                <View style={styles.quoteBox}>
                    <Text style={styles.quote}>
                        "Success is the sum of small efforts repeated day in and day out."
                    </Text>
                    <Text style={styles.quoteAuthor}>— Robert Collier</Text>
                </View>

                {/* Introduction */}
                <View style={styles.section}>
                    <Text style={styles.heading}>Welcome, {firstName}!</Text>
                    <Text style={styles.intro}>
                        This roadmap builds on your 4-week cycle to guide you through the
                        full {duration.toLowerCase()} journey. Stay consistent, track your
                        progress, and watch the transformation happen. You've got this!
                    </Text>
                </View>

                {/* Progress Tracker */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressHeading}>📊 Your Journey Milestones</Text>
                    {milestones.map((milestone, idx) => (
                        <View key={idx} style={styles.milestoneRow}>
                            <View style={milestone.completed ? styles.milestoneBarFilled : styles.milestoneBar} />
                            <Text style={milestone.completed ? styles.milestoneTextCompleted : styles.milestoneText}>
                                {milestone.week}: {milestone.description}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.separator} />

                {/* Progression Phases */}
                <View style={styles.section}>
                    <Text style={styles.heading}>🚀 Your Progression Roadmap</Text>
                    <Text style={styles.bullet}>
                        • Weeks 1-4: Follow your current AI-generated cycle
                    </Text>
                    <Text style={styles.bullet}>
                        • Weeks 5-8: Increase weights 5-10%, add 1-2 reps per set, reduce
                        rest by 15s
                    </Text>
                    <Text style={styles.bullet}>
                        • Weeks 9-12: Add supersets/drop sets, introduce advanced variations
                    </Text>
                    {!is3Month && (
                        <>
                            <Text style={styles.bullet}>
                                • Months 4-5: Strength & endurance focus — higher volume, new
                                blocks
                            </Text>
                            <Text style={styles.bullet}>
                                • Month 6: Peak phase + deload — celebrate your progress!
                            </Text>
                        </>
                    )}
                </View>

                {/* Motivational Box */}
                <View style={styles.motivationalBox}>
                    <Text style={styles.motivationalText}>
                        💪 Every rep counts. Every meal matters. Every day is progress.
                    </Text>
                </View>

                {/* Progress Tracking Tips */}
                <View style={styles.section}>
                    <Text style={styles.heading}>✨ Track Your Wins</Text>
                    <Text style={styles.bullet}>📸 Take progress photos every 4 weeks</Text>
                    <Text style={styles.bullet}>
                        📝 Log workouts & measurements weekly
                    </Text>
                    <Text style={styles.bullet}>
                        🎉 Celebrate small victories — you're building something incredible
                    </Text>
                </View>

                {/* Final Motivation */}
                <View style={styles.section}>
                    <Text style={styles.heading}>Remember, {firstName}...</Text>
                    <Text style={styles.intro}>
                        Transformation isn't about being perfect. It's about being consistent.
                        Show up for yourself every day, trust the process, and the results
                        will follow. You're not just building a better body—you're building
                        discipline, confidence, and a stronger version of yourself. Keep going!
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Generated by AI Fitness Wizard • {new Date().toLocaleDateString()} •
                    Stay Consistent! 💜
                </Text>
            </Page>
        </Document>
    );
};

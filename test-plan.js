// test-plan.js
// Run this file using "node test-plan.js" to test the plan generation locally.
// Make sure your dev server is running on http://localhost:3000

async function testGeneration() {
  console.log("🚀 Initiating simulated 3-Month Plan Generation...");

  // Simulated data that the webhook usually passes
  const payload = {
    name: "Kwame Tester",
    email: "test@example.com", // CHANGE THIS TO YOUR EMAIL to see the PDFs!
    age: "28",
    gender: "male",
    weight: "75",
    height: "178",
    goal: "muscle_gain",
    fitnessLevel: "intermediate",
    equipment: ["dumbbells", "pullup_bar"],
    timeline: "3_months",
    eatingStyle: "mixed",
    localFoods: ["ibishyimbo", "ibirayi", "dodo"],
    waterIntake: "2_3_liters",
    workoutLocation: "outdoor",
    intensity: "moderate",
    tier: "transform",
    want: { email: true, pdf: true }
  };

  try {
    const response = await fetch("http://localhost:3000/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(`\n✅ Status: ${response.status}`);
    
    if (response.ok) {
        console.log("✅ Main Plan Data Generated Successfully!");
        console.log(`Email Sent To: ${data.email}`);
        console.log(`Roadmap Triggered: ${data.needsRoadmap}`);
        console.log("PDFs are returned as base64 strings (not printed here to save space).");
        console.log("\nCheck your inbox to see the generated attachments!");
    } else {
        console.error("❌ Generation Failed:", data);
    }

  } catch (error) {
    console.error("❌ Error running script:", error);
  }
}

testGeneration();

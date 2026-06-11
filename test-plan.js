// test-plan.js
// Run this file using "node test-plan.js" to test the plan generation locally.
// Make sure your dev server is running on http://localhost:3000

async function testGeneration() {
  console.log("🚀 Initiating simulated 6-Month Plan Generation...");

  // Simulated data that the webhook usually passes
  const payload = {
    name: "Kwame Tester",
    email: "remislama4@gmail.com", // CHANGE THIS TO YOUR EMAIL to see the PDFs!
    age: "28",
    gender: "female",
    weight: "85",
    height: "178",
    goal: "weight-loss",
    fitnessLevel: "beginner",
    equipment: ["dumbbells", "pullup_bar"],
    timeline: "6_months",
    eatingStyle: "local",
    localFoods: ["ibishyimbo", "ibirayi", "dodo", "Ubugali", "Amata", "Inyama y'inka"],
    waterIntake: "2_3_liters",
    workoutLocation: "outdoor",
    intensity: "moderate",
    tier: "elite",
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

// src/app/step/[step]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Target, Salad, Dumbbell, Clock } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  goal: string;
  intensity: string;
  timeline: string;
  dietaryPreference: string;
  foodAllergies: string;
  waterIntake: string;
  fitnessLevel: string;
  workoutLocation: string;
  pastInjuries: string;
  equipment: string[];
  targetWeightLoss: string;
  // Added missing fields to match usage
  [key: string]: any;
};

type WantOptions = {
  pdf: boolean;
  email: boolean;
};

type Section = {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: (
    data: FormData,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
    errors: Record<string, string>,
    bmi: number | null,
    want: WantOptions,
    setWant: React.Dispatch<React.SetStateAction<WantOptions>>,
    result: any,
    formData: FormData
  ) => React.ReactNode;
};

const sections: Section[] = [
  {
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: <User className="w-12 h-12 text-purple-600" />,
    fields: (data, onChange, errors, bmi) => (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Full Name *</label>
            <input name="name" value={data.name} onChange={onChange} required className="w-full p-3 md:p-4 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-500 bg-white dark:bg-gray-800" placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Email *</label>
            <input name="email" type="email" value={data.email} onChange={onChange} required className="w-full p-3 md:p-4 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-500 bg-white dark:bg-gray-800" placeholder="john@example.com" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div><label className="block text-sm font-semibold mb-2">Age</label><input name="age" type="number" value={data.age} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800" placeholder="30" min="13" /></div>
          <div>
            <label className="block text-sm font-semibold mb-2">Gender</label>
            <select name="gender" value={data.gender} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
          </div>
          <div><label className="block text-sm font-semibold mb-2">Weight (kg)</label><input name="weight" type="number" step="0.1" value={data.weight} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800" placeholder="75" /></div>
          <div><label className="block text-sm font-semibold mb-2">Height (cm)</label><input name="height" type="number" value={data.height} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800" placeholder="175" /></div>
        </div>

        {bmi !== null && (
          <div className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-2xl border border-indigo-300 dark:border-indigo-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Your BMI</p>
                <p className={`text-4xl font-bold ${bmi < 18.5 ? 'text-blue-600' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {bmi}
                </p>
                <p className="text-sm mt-1">{bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese'}</p>
              </div>
              <div className="text-2xl md:text-5xl">Chart</div>
            </div>
          </div>
        )}
      </div>
    )
  },
  {
    title: "Fitness Goals",
    description: "What do you want to achieve?",
    icon: <Target className="w-12 h-12 text-red-500" />,
    fields: (data, onChange) => (
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-semibold mb-3">Primary Goal *</label>
          <select name="goal" value={data.goal} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800">
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="toning">Toning & Shape</option>
            <option value="endurance">Endurance & Health</option>
          </select>
        </div>

        {data.goal === "weight_loss" && (
          <div className="p-5 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-xl">
            <label className="block font-medium mb-2">Target Weight Loss (kg)</label>
            <input name="targetWeightLoss" type="number" step="0.5" value={data.targetWeightLoss} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800" placeholder="8" />
            <p className="text-xs text-gray-600 mt-2">Healthy rate: 0.5–1 kg per week</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Intensity Level</label>
            <select name="intensity" value={data.intensity} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800">
              <option value="light">Light (Beginner)</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="very_high">Very High (Athlete)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Timeline</label>
            <select name="timeline" value={data.timeline} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800">
              <option value="1_month">1 Month</option>
              <option value="3_months">3 Months</option>
              <option value="6_months">6 Months</option>
            </select>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Diet & Lifestyle",
    description: "Eating habits and daily life rhythm",
    icon: <Salad className="w-12 h-12 text-green-500" />,
    fields: (data, onChange) => (
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-semibold mb-3">Dietary Preference</label>
          <select name="dietaryPreference" value={data.dietaryPreference} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800">
            <option value="standard">No restrictions</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto / Low-Carb</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Food Allergies</label>
          <input name="foodAllergies" value={data.foodAllergies} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800" placeholder="e.g. peanuts, lactose" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Daily Water Intake</label>
          <select name="waterIntake" value={data.waterIntake} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800">
            <option value="4">Less than 4 glasses</option>
            <option value="6">4–6 glasses</option>
            <option value="8">8 glasses (Recommended)</option>
            <option value="10">10+ glasses</option>
          </select>
        </div>
      </div>
    )
  },
  {
    title: "Fitness Background",
    description: "Your experience level",
    icon: <Dumbbell className="w-12 h-12 text-blue-500" />,
    fields: (data, onChange) => (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Current Fitness Level</label>
            <select name="fitnessLevel" value={data.fitnessLevel} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800">
              <option value="beginner">Beginner (0–6 months)</option>
              <option value="intermediate">Intermediate (6 months–2 years)</option>
              <option value="advanced">Advanced (2+ years)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Where do you train?</label>
            <select name="workoutLocation" value={data.workoutLocation} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800">
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Past Injuries or Conditions</label>
          <textarea name="pastInjuries" rows={3} value={data.pastInjuries} onChange={onChange} className="w-full p-3 md:p-4 text-sm md:text-base border rounded-xl bg-white dark:bg-gray-800" placeholder="e.g. lower back pain, knee surgery…" />
        </div>
      </div>
    )
  },
  {
    title: "Equipment & Schedule",
    description: "Final step — let’s build your plan!",
    icon: <Clock className="w-12 h-12 text-yellow-500" />,
    fields: (data, onChange, _errors, _bmi, want, setWant, result, formData) => (
      <div className="space-y-10">
        <div>
          <label className="block text-lg font-bold mb-4">Available Equipment *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {["Bodyweight Only", "Dumbbells", "Resistance Bands", "Kettlebells", "Pull-up Bar", "Gym Access"].map(item => (
              <label key={item} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <input type="checkbox" value={item} checked={data.equipment.includes(item)} onChange={onChange} className="w-5 h-5 text-purple-600 rounded" />
                <span className="text-sm font-medium">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {result?.success && (
          <div className="p-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 text-center">
            <h3 className="text-2xl font-bold mb-6">Your AI Plan is Ready!</h3>

            {result.pdfUrl && want.pdf && (
              <div className="mb-8">
                <a
                  href={result.pdfUrl}
                  download={`Fitness_Plan_${formData.name.replace(" ", "_")}.pdf`}
                  className="inline-block px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-2xl shadow-lg transition transform hover:scale-105"
                >
                  Download Your PDF Now
                </a>
              </div>
            )}

            {result.plan && (
              <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl text-left max-h-96 overflow-y-auto font-mono text-sm">
                <pre className="whitespace-pre-wrap">{result.plan}</pre>
              </div>
            )}

            <div className="mt-8 space-y-4 text-left">
              <label className="flex items-center gap-4 text-lg">
                <input type="checkbox" checked={want.pdf} disabled className="w-6 h-6 text-emerald-600 rounded" />
                <span className="text-emerald-600 font-bold">PDF Generated ✓</span>
              </label>
              <label className="flex items-center gap-4 text-lg">
                <input type="checkbox" checked={want.email} disabled className="w-6 h-6 text-emerald-600 rounded" />
                {result.emailError ? (
                  <span className="text-amber-600 font-bold flex items-center gap-2">
                    ⚠️ {result.emailError}
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold">
                    Email sent to {formData.email} ✓
                  </span>
                )}
              </label>
            </div>
          </div>
        )}
      </div>
    )
  }
];

export default function WizardStep() {
  const router = useRouter();
  const pathname = usePathname();
  const step = Number(pathname.split("/").pop()) || 1;
  const index = step - 1;

  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", age: "", gender: "", weight: "", height: "",
    goal: "weight_loss", intensity: "moderate", timeline: "3_months",
    dietaryPreference: "standard", foodAllergies: "", waterIntake: "6",
    fitnessLevel: "beginner", workoutLocation: "home", pastInjuries: "",
    equipment: [], targetWeightLoss: ""
  });
  const [bmi, setBmi] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [want, setWant] = useState<WantOptions>({ pdf: true, email: true });
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    // Load saved data
    const saved = localStorage.getItem("fitnessWizard2025");
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("fitnessWizard2025", JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // BMI
  useEffect(() => {
    if (formData.height && formData.weight) {
      const h = Number(formData.height) / 100;
      const w = Number(formData.weight);
      setBmi(Number((w / (h * h)).toFixed(1)));
    } else {
      setBmi(null);
    }
  }, [formData.height, formData.weight]);

  if (!mounted) {
    return null; // Prevents hydration mismatch, strictly after all hooks
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox" && !name) {
      const val = (e.target as HTMLInputElement).value;
      setFormData(prev => ({
        ...prev,
        equipment: checked ? [...prev.equipment, val] : prev.equipment.filter(i => i !== val)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const go = (n: number) => router.push(`/step/${n}`);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          want: { pdf: want.pdf, email: want.email }
        })
      });

      const data = await res.json();

      if (data.success) {
        // Fix: backend now returns object for PDF usage, but frontend needs string for display
        let displayPlan = "";
        const p = data.plan;

        if (typeof p === 'object' && p !== null) {
          // Reconstruct readable string from object
          displayPlan = `${p.title || "Your Fitness Plan"}\n\n${p.introduction || ""}\n\n`;

          if (Array.isArray(p.weeks)) {
            displayPlan += p.weeks.map((w: any, i: number) =>
              `${w.weekTitle || `Week ${i + 1}`}\n` +
              (w.days ? w.days.map((d: any) => `  ${d.dayTitle}: ${d.focus}\n  Workout: ${d.workout}\n`).join('\n') : '')
            ).join('\n');
          }
        } else {
          displayPlan = p || "Your plan was generated and sent!";
        }

        setResult({
          success: true,
          plan: displayPlan,
          pdfUrl: data.pdfUrl,
          emailError: data.emailError // Pass emailError to state
        });

        // Trigger Bonus PDF generation in background if eligible
        if (data.isBonusEligible) {
          console.log("🎁 Eligible for bonus! Triggering background generation...");
          fireAndForgetBonus(formData);
        }

        localStorage.removeItem("fitnessWizard2025");
        window.dispatchEvent(new CustomEvent("fitness-success"));
      } else {
        alert("Error: " + (data.error || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Helper to fire bonus generation without waiting
  const fireAndForgetBonus = (data: FormData) => {
    fetch("/api/generate-bonus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: data }),
      keepalive: true, // Ensure request survives page close
    }).catch(err => console.error("Bonus trigger failed (background):", err));
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-pink-950 transition-colors">
        <button onClick={() => setDarkMode(!darkMode)} className="fixed top-6 right-6 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-2xl">
          {darkMode ? 'Sun' : 'Moon'}
        </button>

        <div className="min-h-screen px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {sections[index].icon} {sections[index].title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">{sections[index].description}</p>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              {sections.map((_, i) => (
                <button key={i} onClick={() => go(i + 1)}
                  className={`h-3 rounded-full transition-all ${i === index ? "w-16 bg-purple-600" : i < index ? "w-3 bg-emerald-500" : "w-3 bg-gray-300"}`}
                />
              ))}
            </div>

            <form onSubmit={submit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-4 md:p-12" key={step} >
              {sections[index].fields(formData, handleChange, errors, bmi, want, setWant, result, formData)}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => go(step - 1)} disabled={step === 1}
                  className="px-5 py-3 md:px-8 md:py-4 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold disabled:opacity-50">
                  ← Back
                </button>

                {index === sections.length - 1 ? (
                  <button type="submit" disabled={loading}
                    className="px-6 py-3 md:px-12 md:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg md:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105">
                    {loading ? "Generating..." : "Generate My AI Plan"}
                  </button>
                ) : (
                  <button type="button" onClick={() => go(step + 1)}
                    className="px-6 py-3 md:px-12 md:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg md:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105">
                    Next →
                  </button>
                )}
              </div>
            </form>

            <footer className="mt-12 text-center">
              <Link
                href="/privacy"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </Link>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
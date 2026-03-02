'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Target, Salad, Dumbbell, Clock } from 'lucide-react';
import SamplePlanPreview from '@/components/SamplePlanPreview';
import { Turnstile } from '@marsidev/react-turnstile';

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

        {/* TRUST BUILDER: Sample Plan Preview on Step 1 */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <SamplePlanPreview />
        </div>
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
    title: "Choose Your Plan",
    description: "Select the option that fits your goals",
    icon: <Clock className="w-12 h-12 text-yellow-500" />,
    fields: (data, onChange, _errors, _bmi, want, setWant, result, formData) => (
      <div className="space-y-10">
        {/* Equipment */}
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

        {/* Success state — shown after free sample generation */}
        {result?.success && (
          <div className="p-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 text-center">
            <h3 className="text-2xl font-bold mb-4">🎉 Your Sample Plan is Ready!</h3>
            {result.pdfUrl && (
              <a href={result.pdfUrl} download className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-2xl shadow transition mb-6">
                ↓ Download Your Week 1 Sample
              </a>
            )}
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                Want Weeks 2–4 + macros, trainer notes & email delivery? Upgrade below. 👇
              </p>
            </div>
          </div>
        )}

        {/* Tier cards */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
            All plans are AI-generated specifically for your profile
          </p>
          <div className="grid md:grid-cols-2 gap-5">

            {/* Free Sample */}
            <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col gap-4 hover:border-purple-300 transition">
              <div>
                <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Free</span>
                <h4 className="text-xl font-bold mt-1">1-Week Sample</h4>
                <p className="text-3xl font-black mt-2">$0</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                <li className="flex gap-2">✓ Week 1 of your plan (7 days)</li>
                <li className="flex gap-2">✓ Tailored to your goal & equipment</li>
                <li className="flex gap-2">✓ PDF download, instant</li>
                <li className="flex gap-2 text-gray-400">✗ No email delivery</li>
                <li className="flex gap-2 text-gray-400">✗ Weeks 2–4 locked</li>
                <li className="flex gap-2 text-gray-400">✗ No macros or trainer notes</li>
              </ul>
              <p className="text-xs text-gray-400 italic">One free sample per person</p>
            </div>

            {/* Starter */}
            <div className="relative border-2 border-purple-500 rounded-2xl p-6 flex flex-col gap-4 shadow-lg shadow-purple-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-purple-400 tracking-widest">Starter</span>
                <h4 className="text-xl font-bold mt-1">4-Week Full Plan</h4>
                <p className="text-3xl font-black mt-2">$4.99 <span className="text-sm font-normal text-gray-400">one-time</span></p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                <li className="flex gap-2">✓ Complete 4-week plan (28 days)</li>
                <li className="flex gap-2">✓ Daily workouts with sets & reps</li>
                <li className="flex gap-2">✓ Daily meal plans with macros</li>
                <li className="flex gap-2">✓ Trainer coaching notes</li>
                <li className="flex gap-2">✓ PDF delivered to your email</li>
              </ul>
            </div>

            {/* Transform */}
            <div className="relative border-2 border-blue-500 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:shadow-blue-500/10 transition">
              <div>
                <span className="text-xs font-bold uppercase text-blue-400 tracking-widest">Transform</span>
                <h4 className="text-xl font-bold mt-1">3-Month Transformation</h4>
                <p className="text-3xl font-black mt-2">$14.99 <span className="text-sm font-normal text-gray-400">one-time</span></p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                <li className="flex gap-2">✓ Full 4-week starter plan (PDF)</li>
                <li className="flex gap-2">✓ Months 2–3: Progression Roadmap PDF</li>
                <li className="flex gap-2">✓ Weekly workout & nutrition adjustments</li>
                <li className="flex gap-2">✓ Phase goals & trainer checkpoints</li>
                <li className="flex gap-2">✓ Both PDFs delivered to your email</li>
              </ul>
            </div>

            {/* Elite */}
            <div className="relative border-2 border-amber-500 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:shadow-amber-500/10 transition">
              <div>
                <span className="text-xs font-bold uppercase text-amber-500 tracking-widest">Elite</span>
                <h4 className="text-xl font-bold mt-1">6-Month Journey</h4>
                <p className="text-3xl font-black mt-2">$29.99 <span className="text-sm font-normal text-gray-400">one-time</span></p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                <li className="flex gap-2">✓ Full 4-week starter plan (PDF)</li>
                <li className="flex gap-2">✓ Months 2–6: Periodized Roadmap PDF</li>
                <li className="flex gap-2">✓ 3 training phases: Foundation → Peak</li>
                <li className="flex gap-2">✓ Specific exercise progressions per week</li>
                <li className="flex gap-2">✓ Both PDFs delivered to your email</li>
                <li className="flex gap-2 font-semibold text-amber-600">→ Best value for serious results</li>
              </ul>
            </div>
          </div>
        </div>
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
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [want, setWant] = useState<WantOptions>({ pdf: true, email: true });
  const [mounted, setMounted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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

    // Cycle through loading messages
    const loadingSteps = [
      "Analyzing your profile...",
      "Building your 4-week plan...",
      "Calculating nutrition targets...",
      "Preparing your PDF...",
    ];
    let stepIdx = 0;
    setLoadingMsg(loadingSteps[0]);
    const msgInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % loadingSteps.length;
      setLoadingMsg(loadingSteps[stepIdx]);
    }, 2200);

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
          emailError: data.emailError
        });

        localStorage.removeItem("fitnessWizard2025");
        window.dispatchEvent(new CustomEvent("fitness-success"));
      } else {
        alert("Error: " + (data.error || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect. Is your backend running?");
    } finally {
      clearInterval(msgInterval);
      setLoadingMsg("");
      setLoading(false);
    }
  };

  const handleSample = async () => {
    // Layer 2: cookie check
    if (document.cookie.includes("ramafit_sample=1") || localStorage.getItem("ramafit_sampled") === "1") {
      alert("You've already received your free sample plan! Upgrade below for your full 4-week plan.");
      return;
    }
    if (!formData.name || !formData.email) {
      alert("Please fill in your name and email in step 1 first.");
      return;
    }
    setLoading(true);
    setLoadingTier("sample");
    const msgs = ["Analyzing your profile...", "Building your Week 1 plan...", "Generating your PDF..."];
    let mi = 0;
    setLoadingMsg(msgs[0]);
    const inv = setInterval(() => { mi = (mi + 1) % msgs.length; setLoadingMsg(msgs[mi]); }, 2000);
    try {
      // Always send timeline as 1_month for sample — ignore onboarding selection
      const sampleData = { ...formData, timeline: "1_month", turnstileToken: turnstileToken || "" };
      const res = await fetch("/api/generate-sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sampleData),
      });
      if (res.status === 429) {
        const data = await res.json();
        alert(data.error || "Free sample limit reached. Upgrade for your full plan!");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to generate sample. Please try again.");
        return;
      }
      // Download PDF
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RamaFit_Sample_${formData.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Set abused flags
      localStorage.setItem("ramafit_sampled", "1");
      setResult({ success: true, pdfUrl: url });
    } catch (err) {
      console.error(err);
      alert("Connection failed. Please try again.");
    } finally {
      clearInterval(inv);
      setLoadingMsg("");
      setLoading(false);
      setLoadingTier(null);
    }
  };

  const handleCheckout = async (tier: "starter" | "transform" | "elite") => {
    if (!formData.name || !formData.email) {
      alert("Please fill in your name and email in step 1 first.");
      return;
    }
    setLoading(true);
    setLoadingTier(tier);
    setLoadingMsg("Preparing your checkout...");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, formData }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Could not start checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection failed. Please try again.");
    } finally {
      setLoadingMsg("");
      setLoading(false);
      setLoadingTier(null);
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-pink-950 transition-colors">
        <button onClick={() => setDarkMode(!darkMode)} className="fixed top-6 right-6 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-2xl">
          {darkMode ? '☽' : '☀'}
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
              {index === sections.length - 1 ? (
                <div className="flex flex-col gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center w-full">
                    <button type="button" onClick={() => go(step - 1)} disabled={step === 1}
                      className="px-5 py-3 md:px-8 md:py-4 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold disabled:opacity-50">
                      ← Back
                    </button>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-right">Select a plan to continue</p>
                  </div>
                  {/* Cloudflare Turnstile CAPTCHA (invisible / managed mode) */}
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== "REPLACE_ME" && (
                    <div className="flex justify-center">
                      <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                        onSuccess={(token) => setTurnstileToken(token)}
                        options={{ size: "compact", theme: darkMode ? "dark" : "light" }}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSample}
                      className="py-3 border-2 border-gray-300 dark:border-gray-600 text-sm font-bold rounded-xl hover:border-purple-400 transition disabled:opacity-50"
                    >
                      {loadingTier === "sample" ? loadingMsg : "Free Sample"}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleCheckout("starter")}
                      className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loadingTier === "starter" ? loadingMsg : "Starter — $4.99"}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleCheckout("transform")}
                      className="py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loadingTier === "transform" ? loadingMsg : "Transform — $14.99"}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleCheckout("elite")}
                      className="py-3 bg-amber-500 text-white text-sm font-bold rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loadingTier === "elite" ? loadingMsg : "Elite — $29.99"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => go(step - 1)} disabled={step === 1}
                    className="px-5 py-3 md:px-8 md:py-4 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold disabled:opacity-50">
                    ← Back
                  </button>
                  <button type="button" onClick={() => go(step + 1)}
                    className="px-6 py-3 md:px-12 md:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg md:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105">
                    Next →
                  </button>
                </div>
              )}
            </form>

            <footer className="mt-12 text-center space-x-4">
              <Link
                href="/privacy"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link
                href="/terms"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Terms & Refunds
              </Link>
            </footer>
          </div>
        </div>
      </div >
    </div >
  );
}
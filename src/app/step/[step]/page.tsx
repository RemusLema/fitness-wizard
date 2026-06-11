'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { User, Target, Salad, Dumbbell, Clock } from 'lucide-react';
import SamplePlanPreview from '@/components/SamplePlanPreview';
import { Turnstile } from '@marsidev/react-turnstile';
import { localFoodOptions } from '@/lib/localFoods';
import { getGymProfile, PREDEFINED_EQUIPMENT, GymProfile } from '@/lib/gymConfig';

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
  eatingStyle: string;
  localFoods: string[];
  foodAllergies: string;
  waterIntake: string;
  fitnessLevel: string;
  workoutLocation: string;
  pastInjuries: string;
  equipment: string[];
  targetWeightLoss: string;
  [key: string]: any;
};

// FIX: Removed WantOptions type and want/setWant state — dead code, never used
// (all plan actions use handleSample/handleCheckout directly, not the form submit)

type Section = {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: (
    data: FormData,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
    errors: Record<string, string>,
    bmi: number | null,
    result: any,
    formData: FormData,
    activeGym?: GymProfile | null,
    gymState?: {
      gymMemberId: string;
      setGymMemberId: (val: string) => void;
      memberVerified: boolean;
      verifyingMember: boolean;
      verificationError: string;
      handleVerifyMember: () => Promise<void>;
    }
  ) => React.ReactNode;
};

const sections: Section[] = [
  {
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: <User className="w-12 h-12 text-purple-600" />,
    fields: (data, onChange, errors, bmi) => (
      <div className="space-y-8">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 text-center shadow-inner">
          <p className="text-purple-700 dark:text-purple-300 font-bold italic text-lg tracking-wide">
            🇷🇼 Murakaza neza kuri RamaFit!
          </p>
        </div>
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
        {/* Eating Style */}
        <div>
          <label className="block text-sm font-semibold mb-3">What best describes your eating style?</label>
          <div className="space-y-3">
            {[
              { value: 'local_rwandan', label: 'I eat mostly local Rwandan foods' },
              { value: 'mixed', label: 'I eat a mix of local and international foods' },
              { value: 'international', label: 'I prefer international / gym-diet foods' },
            ].map(opt => (
              <label key={opt.value} className={`flex items-center gap-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition ${
                data.eatingStyle === opt.value ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}>
                <input type="radio" name="eatingStyle" value={opt.value} checked={data.eatingStyle === opt.value} onChange={onChange} className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Local Foods Multi-Select — shown when eating style includes local foods */}
        {(data.eatingStyle === 'local_rwandan' || data.eatingStyle === 'mixed') && (
          <div>
            <label className="block text-sm font-semibold mb-3">Which local foods do you eat regularly? <span className="text-gray-400 font-normal">(select all that apply)</span></label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {localFoodOptions.map(food => (
                <label key={food.key} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition ${
                  // FIX: ?? [] guard in case localFoods is ever undefined (e.g. stale localStorage)
                  (data.localFoods ?? []).includes(food.key) ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}>
                  <input
                    type="checkbox"
                    // FIX: added name="localFoods" so handleChange can identify this input correctly
                    name="localFoods"
                    value={food.key}
                    checked={(data.localFoods ?? []).includes(food.key)}
                    onChange={(e) => {
                      const val = e.target.value;
                      const current = data.localFoods ?? [];
                      const updated = current.includes(val)
                        ? current.filter((f: string) => f !== val)
                        : [...current, val];
                      onChange({ target: { name: 'localFoods', value: updated } } as any);
                    }}
                    className="w-5 h-5 text-green-600 rounded"
                  />
                  <span className="text-sm font-medium">{food.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Preference (kept for veg/vegan/keto users) */}
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
            <option value="6">4-6 glasses</option>
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
              <option value="outdoor_hills">Outdoor / Hills & Tracks</option>
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
    fields: (data, onChange, _errors, _bmi, result, formData, activeGym, gymState) => {
      // Predefined B2B equipment list
      const equipmentOptions = activeGym 
        ? activeGym.equipmentList 
        : ["Bodyweight Only", "Dumbbells", "Resistance Bands", "Kettlebells", "Pull-up Bar", "Gym Access"];

      const tiersList = [
        {
          key: "starter",
          name: "Starter",
          price: "$6.99",
          period: "one-time",
          badge: "MOST POPULAR",
          features: [
            "Complete 4-week plan (28 days)",
            "Daily workouts with sets & reps",
            "Daily meal plans with macros",
            "Trainer coaching notes",
            "PDF delivered to your email"
          ]
        },
        {
          key: "transform",
          name: "Transform",
          price: "$14.99",
          period: "one-time",
          badge: "",
          features: [
            "Full 4-week starter plan (PDF)",
            "Months 2–3: Progression Roadmap PDF",
            "Weekly workout & nutrition adjustments",
            "Phase goals & trainer checkpoints",
            "Both PDFs delivered to your email"
          ]
        },
        {
          key: "elite",
          name: "Elite",
          price: "$29.99",
          period: "one-time",
          badge: "BEST VALUE",
          features: [
            "Full 4-week starter plan (PDF)",
            "Months 2–6: Periodized Roadmap PDF",
            "3 training phases: Foundation → Peak",
            "Specific exercise progressions per week",
            "Both PDFs delivered to your email",
            "Best value for serious results"
          ]
        }
      ];

      return (
        <div className="space-y-10">
          {/* Equipment */}
          <div>
            <label className="block text-lg font-bold mb-2">
              {activeGym ? `Available Equipment at ${activeGym.name} *` : "Available Equipment *"}
            </label>
            {activeGym && (
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-4">
                ✨ Pre-loaded with standard equipment available at WAKA/Cali Kigali facility.
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {equipmentOptions.map(item => (
                <label key={item} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <input type="checkbox" name="equipment" value={item} checked={(data.equipment ?? []).includes(item)} onChange={onChange} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-sm font-medium">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* B2B Gym Member Verification Portal */}
          {activeGym && gymState && (
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                <h4 className="text-lg font-bold" style={{ color: activeGym.primaryColor }}>
                  {activeGym.name} Member Verification
                </h4>
              </div>
              {gymState.memberVerified ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-400">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <span>✓</span> Active Membership Verified!
                  </p>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                    Your {activeGym.name} member profile is active. Standard fees are sponsored. Select your preferred tier below to generate your plan instantly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your registered member email address or phone number to bypass payment:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={gymState.gymMemberId}
                      onChange={(e) => gymState.setGymMemberId(e.target.value)}
                      placeholder="e.g. waka@test.com or 0788123456"
                      className="flex-1 p-3 border rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': activeGym.primaryColor } as any}
                    />
                    <button
                      type="button"
                      disabled={gymState.verifyingMember}
                      onClick={gymState.handleVerifyMember}
                      className="px-6 py-3 font-bold text-white rounded-xl transition duration-200 disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${activeGym.primaryColor} 0%, ${activeGym.secondaryColor} 100%)` }}
                    >
                      {gymState.verifyingMember ? "Verifying..." : "Verify Membership"}
                    </button>
                  </div>
                  {gymState.verificationError && (
                    <p className="text-red-500 text-sm font-semibold">{gymState.verificationError}</p>
                  )}
                  {process.env.NODE_ENV === "development" && (
                    <p className="text-xs text-gray-400">
                      💡 Hint: Use <code className="bg-white/10 px-1 py-0.5 rounded">waka@test.com</code> or <code className="bg-white/10 px-1 py-0.5 rounded">0788123456</code> to test during development.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Success state — shown after free sample generation */}
          {result?.success && (
            <div className="p-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 text-center">
              <h3 className="text-2xl font-bold mb-4">🎉 Your Workout Plan is Ready!</h3>
              {result.pdfUrl && (
                <a href={result.pdfUrl} download className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-2xl shadow transition mb-6">
                  ↓ Download Plan PDF
                </a>
              )}
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  Your full multi-week training progression is successfully built and generated.
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
            <div className="grid md:grid-cols-3 gap-5">
              {tiersList.map(tier => {
                const isPromo = activeGym && gymState?.memberVerified;
                return (
                  <div key={tier.key} className={`relative border-2 rounded-2xl p-6 flex flex-col gap-4 transition bg-white dark:bg-gray-900 ${
                    tier.badge ? 'border-purple-500 shadow-lg shadow-purple-500/10' : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full">{tier.badge}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold uppercase text-purple-400 tracking-widest">{tier.name}</span>
                      <h4 className="text-xl font-bold mt-1">{tier.name} Plan</h4>
                      <p className="text-3xl font-black mt-2">
                        {isPromo ? (
                          <>
                            <span className="line-through text-gray-400 text-lg mr-2">{tier.price}</span>
                            <span className="text-emerald-500">FREE</span>
                          </>
                        ) : (
                          <>
                            {tier.price} <span className="text-sm font-normal text-gray-400">one-time</span>
                          </>
                        )}
                      </p>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex gap-2">✓ {f}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  }
];

export default function WizardStep() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const step = Number(pathname.split("/").pop()) || 1;
  const index = step - 1;

  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", age: "", gender: "", weight: "", height: "",
    goal: "weight_loss", intensity: "moderate", timeline: "3_months",
    dietaryPreference: "standard", eatingStyle: "mixed", localFoods: [],
    foodAllergies: "", waterIntake: "6",
    fitnessLevel: "beginner", workoutLocation: "home", pastInjuries: "",
    equipment: [], targetWeightLoss: ""
  });
  const [bmi, setBmi] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // B2B Gym states
  const [activeGym, setActiveGym] = useState<GymProfile | null>(null);
  const [gymMemberId, setGymMemberId] = useState("");
  const [memberVerified, setMemberVerified] = useState(false);
  const [verifyingMember, setVerifyingMember] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // Handle hydration mismatch and B2B gym routing load
  useEffect(() => {
    setMounted(true);
    // Dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    const saved = localStorage.getItem("fitnessWizard2025");
    let loadedData: any = {};
    if (saved) {
      loadedData = JSON.parse(saved);
    }

    // B2B Gym Slug Resolution
    const gymQuery = searchParams.get("gym");
    const savedGym = localStorage.getItem("ramafit_active_gym");
    const slug = gymQuery || savedGym;
    let profile: GymProfile | null = null;
    
    if (slug) {
      const p = getGymProfile(slug);
      if (p) {
        profile = p;
        setActiveGym(p);
        localStorage.setItem("ramafit_active_gym", slug);
      }
    }

    setFormData(prev => {
      // Pre-populate with gym equipment list if brand new profile in a partner gym context
      const equipmentInit = profile && (!loadedData.equipment || loadedData.equipment.length === 0)
        ? profile.equipmentList 
        : (loadedData.equipment ?? prev.equipment);

      return {
        ...prev,
        ...loadedData,
        localFoods: loadedData.localFoods ?? prev.localFoods,
        equipment: equipmentInit,
      };
    });
  }, [searchParams]);

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

  // FIX: handleChange now correctly handles three distinct cases:
  //   1. localFoods — synthetic array event from the local foods checkboxes
  //   2. equipment  — named checkbox inputs (name="equipment")
  //   3. everything else — standard controlled inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'localFoods') {
      // Synthetic event from local foods checkbox onChange — value is already the updated array
      setFormData(prev => ({ ...prev, localFoods: value as any }));
    } else if (type === "checkbox" && name === "equipment") {
      // FIX: use name === "equipment" instead of !name — explicit and safe
      setFormData(prev => ({
        ...prev,
        equipment: checked
          ? [...prev.equipment, value]
          : prev.equipment.filter(i => i !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const go = (n: number) => router.push(`/step/${n}`);

  // FIX: validate name + email before leaving step 1, and clear errors on valid advance
  const goNext = () => {
    if (index === 0) {
      const newErrors: Record<string, string> = {};
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }
    }
    setErrors({});
    go(step + 1);
  };

  // FIX: removed submit() function and want/setWant state — dead code.
  // All plan actions go through handleSample / handleCheckout directly.
  // The form's onSubmit is set to a no-op to prevent accidental native submission.

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
      // Set abuse-prevention flags
      localStorage.setItem("ramafit_sampled", "1");
      // FIX: pass pdfUrl as null — blob was already revoked above so storing the URL
      // would produce a broken download link in the success card
      setResult({ success: true, pdfUrl: null });
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

  const handleVerifyMember = async () => {
    if (!activeGym) return;
    if (!gymMemberId.trim()) {
      setVerificationError("Please enter your member email or phone number");
      return;
    }
    setVerifyingMember(true);
    setVerificationError("");
    try {
      const res = await fetch("/api/verify-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymSlug: activeGym.slug, emailOrPhone: gymMemberId }),
      });
      const data = await res.json();
      if (data.verified) {
        setMemberVerified(true);
        // Sync B2B identifier to email if it looks like an email
        if (gymMemberId.includes("@")) {
          setFormData(prev => ({ ...prev, email: gymMemberId }));
        }
      } else {
        setVerificationError("Verification failed. Member not found on gym active roster.");
      }
    } catch (err) {
      console.error(err);
      setVerificationError("Connection error. Please try again.");
    } finally {
      setVerifyingMember(false);
    }
  };

  const handleB2BCheckout = async (tier: "starter" | "transform" | "elite") => {
    if (!formData.name || !formData.email) {
      alert("Please fill in your name and email in step 1 first.");
      return;
    }
    setLoading(true);
    setLoadingTier(tier);
    setLoadingMsg("Generating your co-branded gym plan...");
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          tier,
          gymSlug: activeGym?.slug,
          memberIdentifier: gymMemberId
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ success: true, pdfUrl: data.pdfUrl || null });
        alert(`Success! Your full 4-week ${tier} plan has been generated and emailed to you. You can check your inbox.`);
      } else {
        alert(data.error || "Failed to generate your plan. Please try again.");
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

            {/* FIX: onSubmit is a no-op — actual actions go through handleSample/handleCheckout */}
            <form onSubmit={(e) => e.preventDefault()} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-4 md:p-12" key={step}>
              {/* Inject activeGym and gymState methods for dynamic co-branded rendering in step fields */}
              {sections[index].fields(
                formData, 
                handleChange, 
                errors, 
                bmi, 
                result, 
                formData, 
                activeGym, 
                {
                  gymMemberId,
                  setGymMemberId,
                  memberVerified,
                  verifyingMember,
                  verificationError,
                  handleVerifyMember
                }
              )}
              {index === sections.length - 1 ? (
                <div className="flex flex-col gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center w-full">
                    <button type="button" onClick={() => go(step - 1)} disabled={step === 1}
                      className="px-5 py-3 md:px-8 md:py-4 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold disabled:opacity-50">
                      ← Back
                    </button>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                      {activeGym && !memberVerified ? "Verify membership above or choose B2C checkout" : "Select a plan to continue"}
                    </p>
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
                      onClick={() => activeGym && memberVerified ? handleB2BCheckout("starter") : handleCheckout("starter")}
                      className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loadingTier === "starter" 
                        ? loadingMsg 
                        : activeGym && memberVerified 
                          ? "Starter — FREE" 
                          : "Starter — $6.99"}
                    </button>
                    
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => activeGym && memberVerified ? handleB2BCheckout("transform") : handleCheckout("transform")}
                      className="py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loadingTier === "transform" 
                        ? loadingMsg 
                        : activeGym && memberVerified 
                          ? "Transform — FREE" 
                          : "Transform — $14.99"}
                    </button>
                    
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => activeGym && memberVerified ? handleB2BCheckout("elite") : handleCheckout("elite")}
                      className="py-3 bg-amber-500 text-white text-sm font-bold rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loadingTier === "elite" 
                        ? loadingMsg 
                        : activeGym && memberVerified 
                          ? "Elite — FREE" 
                          : "Elite — $29.99"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => go(step - 1)} disabled={step === 1}
                    className="px-5 py-3 md:px-8 md:py-4 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold disabled:opacity-50">
                    ← Back
                  </button>
                  {/* FIX: onClick now calls goNext() instead of go(step+1) — validates step 1 before advancing */}
                  <button type="button" onClick={goNext}
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
      </div>
    </div>
  );
}
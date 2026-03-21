// src/app/success/page.tsx — Post-payment confirmation (Lemon Squeezy)
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import ActualWeek1Preview from "@/components/ActualWeek1Preview";

const tierInfo: Record<string, { label: string; description: string }> = {
    starter: {
        label: "Starter Plan",
        description: "Your complete 4-week personalized training and nutrition plan",
    },
    transform: {
        label: "Transform Plan",
        description: "Your 4-week plan plus 3-month progression roadmap",
    },
    elite: {
        label: "Elite Plan",
        description: "Your 4-week plan plus 6-month periodized journey",
    },
};

const steps = [
    { icon: "📊", label: "Analyzing your body metrics..." },
    { icon: "🍎", label: "Calculating your calorie targets..." },
    { icon: "🏋️", label: "Building your weekly workout split..." },
    { icon: "🥗", label: "Customizing your nutrition plan..." },
    { icon: "🧠", label: "Adding trainer coaching notes..." },
];

function SuccessContent() {
    const params = useSearchParams();
    const tier = params.get("tier") || "starter";
    const info = tierInfo[tier] || tierInfo.starter;

    const [week1Plan, setWeek1Plan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [progressStep, setProgressStep] = useState(0);
    const [hasAttempted, setHasAttempted] = useState(false);

    useEffect(() => {
        if (hasAttempted) return;
        setHasAttempted(true);

        const saved = localStorage.getItem("fitnessWizard2025");
        if (!saved) {
            setLoading(false);
            return;
        }

        const timer = setInterval(() => {
            setProgressStep((s) => Math.min(s + 1, steps.length - 1));
        }, 3500);

        fetch("/api/generate-sample", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...JSON.parse(saved),
                isSuccessPreview: true
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.plan) {
                setWeek1Plan(data.plan);
                localStorage.removeItem("fitnessWizard2025");
            }
        })
        .catch(err => console.error("Preview fetch err:", err))
        .finally(() => {
            clearInterval(timer);
            setLoading(false);
        });

        return () => clearInterval(timer);
    }, [hasAttempted]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-950 to-pink-950 flex flex-col justify-center items-center px-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                    <h2 className="text-2xl font-bold text-white text-center mb-8">Crafting Your Plan</h2>
                    <div className="space-y-6">
                        {steps.map((step, idx) => (
                            <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${
                                idx <= progressStep ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'
                            }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors duration-500 ${
                                    idx < progressStep ? 'bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 
                                    idx === progressStep ? 'bg-purple-500/30 animate-pulse border border-purple-500/50' : 'bg-white/5'
                                }`}>
                                    {idx < progressStep ? '✓' : step.icon}
                                </div>
                                <span className={`font-medium ${
                                    idx <= progressStep ? 'text-white' : 'text-gray-500'
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (week1Plan) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-12 pb-24 px-4 font-sans print:bg-white print:p-0">
                <div className="max-w-4xl mx-auto mb-8 print:hidden">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">📬</div>
                            <div>
                                <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">Your Week 1 plan is ready — scroll down to start today!</h2>
                                <p className="text-emerald-700 dark:text-emerald-500 mt-1">Your complete <strong>{info.label}</strong> is being finalized and will arrive in your inbox within 5 minutes.</p>
                            </div>
                        </div>
                        <Link href="/step/1" className="shrink-0 px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-xl shadow-sm hover:shadow transition border border-gray-200 dark:border-gray-700">
                            Done
                        </Link>
                    </div>
                </div>
                
                <ActualWeek1Preview plan={week1Plan} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-950 to-pink-950 flex items-center justify-center px-6">
            <div className="max-w-lg w-full text-center">
                <div className="text-6xl mb-6 animate-bounce">🎉</div>
                <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
                <p className="text-lg text-purple-300 mb-2">{info.label}</p>
                <p className="text-gray-400 mb-8">{info.description}</p>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-xl">📧</span>
                        </div>
                        <h2 className="text-lg font-semibold text-white">Check Your Email</h2>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Your plan is being generated right now. It will be delivered to your email
                        within <strong className="text-white">2–5 minutes</strong>.
                    </p>
                    <p className="text-gray-500 text-xs mt-3">
                        Check your spam/junk folder too — emails from ramafit.xyz sometimes land there.
                    </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span>✓</span>
                        </div>
                        <div className="text-left">
                            <p className="text-white text-sm font-medium">One-time purchase</p>
                            <p className="text-gray-500 text-xs">No subscription — the plan is yours forever</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/step/1"
                        className="block w-full py-3 bg-white/10 text-white font-medium rounded-2xl hover:bg-white/20 transition"
                    >
                        ← Back to Homepage
                    </Link>
                </div>

                <p className="text-xs text-gray-500 mt-8">
                    Didn&apos;t receive your plan? Email us at{" "}
                    <a href="mailto:hello@ramafit.xyz" className="text-purple-400 hover:text-purple-300">
                        hello@ramafit.xyz
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-950 to-pink-950 flex items-center justify-center">
                    <div className="animate-spin w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent" />
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}

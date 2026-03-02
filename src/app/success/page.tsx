// src/app/success/page.tsx — Post-payment confirmation (Lemon Squeezy)
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

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

function SuccessContent() {
    const params = useSearchParams();
    const tier = params.get("tier") || "starter";
    const info = tierInfo[tier] || tierInfo.starter;

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

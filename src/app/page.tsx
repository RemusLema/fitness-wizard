// src/app/page.tsx — RamaFit Landing Page
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const features = [
  {
    icon: "🧬",
    title: "AI-Personalized",
    desc: "Every workout, every meal — built around your exact goal, level, and equipment.",
  },
  {
    icon: "⚡",
    title: "Instant Delivery",
    desc: "Your full plan generated and emailed in under 60 seconds. No waiting.",
  },
  {
    icon: "🍽️",
    title: "Nutrition Included",
    desc: "Daily meal plans built exactly for Rwandan foods, with macros, calories, and snack suggestions.",
  },
  {
    icon: "📄",
    title: "PDF You Own Forever",
    desc: "Download, print, and use offline. No app subscription needed. It's yours.",
  },
  {
    icon: "🏋️",
    title: "Any Environment",
    desc: "Bodyweight, gym, or outdoor running on Kigali hills — we adapt to your location and equipment.",
  },
  {
    icon: "📈",
    title: "Progressive Roadmaps",
    desc: "Multi-month progression plans that evolve your training phase by phase.",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "$6.99",
    rwf: "(~10,000 RWF)",
    period: "one-time",
    highlight: false,
    badge: "",
    features: [
      "Complete 4-week training plan",
      "Daily workout routines with sets & reps",
      "Full nutrition plan with macros",
      "Trainer coaching notes",
      "PDF download + email delivery",
    ],
  },
  {
    name: "Transform",
    price: "$14.99",
    rwf: "(~21,000 RWF)",
    period: "one-time",
    highlight: true,
    badge: "MOST POPULAR",
    features: [
      "Everything in Starter",
      "3-month progression roadmap",
      "Phase-by-phase training evolution",
      "Nutrition adjustments per phase",
      "Priority email delivery",
    ],
  },
  {
    name: "Elite",
    price: "$29.99",
    rwf: "(~43,000 RWF)",
    period: "one-time",
    highlight: false,
    badge: "BEST VALUE",
    features: [
      "Everything in Transform",
      "6-month periodized journey",
      "3 distinct training phases",
      "Advanced exercise progressions",
      "Complete nutrition periodization",
    ],
  },
];

const faqs = [
  {
    q: "How does RamaFit work?",
    a: "You fill out a short wizard with your fitness goals, experience level, equipment, and dietary preferences. Our AI then generates a complete, personalized training and nutrition plan delivered instantly as a PDF.",
  },
  {
    q: "Is this a subscription?",
    a: "No. All plans are one-time purchases. You pay once, and the plan is yours forever. No recurring charges, no hidden fees.",
  },
  {
    q: "Can I try before I buy?",
    a: "Yes! We offer a free 1-week sample plan so you can see the quality before committing. Just click 'Free Sample' on the last step of the wizard.",
  },
  {
    q: "What if I don't receive my plan?",
    a: "Check your spam folder first. If you still haven't received it within 10 minutes, email us at hello@ramafit.xyz and we'll sort it out immediately.",
  },
  {
    q: "How is this different from a fitness app?",
    a: "Most fitness apps charge $10-35/month and lock your workouts inside their app. RamaFit gives you a complete PDF plan you own — print it, save it, use it offline. One price, no subscription.",
  },
  {
    q: "Can I get a refund?",
    a: "We offer refunds for non-delivery, technical issues, or duplicate charges. Since plans are generated uniquely for you, we can't refund after delivery. That's why we offer a free sample first.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left group"
      >
        <span className="font-semibold text-white group-hover:text-purple-400 transition-colors pr-4">
          {q}
        </span>
        <span className={`text-purple-400 text-xl transition-transform ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
        <p className="text-gray-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-gray-950 text-white overflow-x-hidden">
      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏋️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              RamaFit
            </span>
            <span className="ml-4 hidden lg:inline-block text-xs text-purple-300/80 italic border-l border-purple-500/30 pl-4 py-1">
              Ubuzima bw'umwimerere, ibiryo by'iwacu
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>
          <Link
            href="/step/1"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full hover:opacity-90 transition shadow-lg shadow-purple-500/20"
          >
            Get Your Plan
          </Link>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-rwanda.png"
            alt="Fitness training in Rwanda"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              AI-Powered Fitness Plans
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-3">
              AI Fitness Plans<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Built for Rwanda 🇷🇼
              </span>
            </h1>
            
            <p className="text-purple-300/90 italic text-xl mb-6 font-medium">Ubuzima bw'umwimerere, ibiryo by'Iwacu</p>

            <p className="text-lg md:text-xl text-gray-400 max-w-lg mb-10 leading-relaxed">
              A complete 4-week training and nutrition plan — personalized to your goals, level, and equipment.
              Delivered in under 60 seconds. No subscription.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/step/1"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02]"
              >
                Start Now (Tangira Ubu)
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 transition"
              >
                View Pricing
              </a>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> No subscription
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Instant delivery
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Free sample available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ────────────────────────────────────────────── */}
      <section className="py-8 border-y border-white/5 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇷🇼</span>
            <span><strong className="text-gray-300">Built for Rwanda</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <span><strong className="text-gray-300">Local food plans</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span><strong className="text-gray-300">Instant delivery</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span><strong className="text-gray-300">Secure checkout</strong></span>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Your plan in{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
            <p className="text-gray-500 text-lg">No sign-up required. No app to download.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "📝",
                title: "Tell Us About You",
                desc: "Fill out a quick 5-step wizard with your goals, fitness level, equipment, and dietary preferences.",
              },
              {
                step: "02",
                icon: "🧬",
                title: "AI Builds Your Plan",
                desc: "Our GPT-4o engine creates a fully personalized 4-week training and nutrition program in seconds.",
              },
              {
                step: "03",
                icon: "📧",
                title: "Get Your Plan",
                desc: "View Week 1 instantly in your browser. Full PDF in your inbox within 5 minutes.",
                subtext: "🥗 Meal plans include Rwandan foods like ibishyimbo, ibirayi, and isombe."
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/30 transition-all h-full">
                  <div className="text-xs font-bold text-purple-400 tracking-widest mb-4">{item.step}</div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  {(item as any).subtext && (
                    <p className="mt-4 text-sm text-green-400 italic bg-green-900/20 p-3 rounded-xl border border-green-800/30">
                      {(item as any).subtext}
                    </p>
                  )}
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-gray-700 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Everything you need.{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Nothing you don't.
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              No bloat, no upsells. Just a complete plan built for your body and your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 hover:bg-gray-900 transition-all group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              One price.{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Yours forever.
              </span>
            </h2>
            <p className="text-gray-500 text-lg">No subscriptions. No recurring charges. Ever.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 flex flex-col ${tier.highlight
                    ? "bg-gradient-to-b from-purple-500/10 to-pink-500/10 border-2 border-purple-500/40 shadow-xl shadow-purple-500/10"
                    : "bg-gray-900 border border-gray-800"
                  }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${tier.highlight
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                      }`}>
                      {tier.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <div className="flex flex-col mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{tier.price}</span>
                    <span className="text-gray-500 text-sm">/{tier.period}</span>
                  </div>
                  <span className="text-green-400 font-medium text-sm mt-1">{(tier as any).rwf}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/step/1"
                  className={`block w-full py-3 text-center font-bold rounded-xl transition ${tier.highlight
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/20"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    }`}
                >
                  Get {tier.name} (Tangira Ubu)
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 text-sm mt-8">
            🔒 Secure checkout via Lemon Squeezy. Try our{" "}
            <Link href="/step/1" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
              free 1-week sample
            </Link>{" "}
            first.
          </p>
        </div>
      </section>

      {/* ─── VS COMPETITORS ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Why pay{" "}
              <span className="line-through text-gray-600">$15/month</span>{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                when $6.99 gets you more?
              </span>
            </h2>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-4 md:p-6 border-b border-r border-gray-800 font-bold text-gray-500 text-sm">Feature</div>
              <div className="p-4 md:p-6 border-b border-r border-gray-800 text-center">
                <div className="font-bold text-purple-400">RamaFit</div>
                <div className="text-xs text-gray-500">from $6.99</div>
              </div>
              <div className="p-4 md:p-6 border-b border-gray-800 text-center">
                <div className="font-bold text-gray-400">Typical App</div>
                <div className="text-xs text-gray-500">$10-35/mo</div>
              </div>

              {[
                ["Personalized workouts", true, true],
                ["Full nutrition plan", true, false],
                ["Macros & calories", true, false],
                ["PDF you own forever", true, false],
                ["No subscription", true, false],
                ["Works offline", true, false],
                ["Instant delivery", true, false],
              ].map(([feature, us, them], i) => (
                <div key={i} className="contents">
                  <div className="p-3 md:p-4 border-b border-r border-gray-800 text-sm text-gray-400">{feature as string}</div>
                  <div className="p-3 md:p-4 border-b border-r border-gray-800 text-center text-lg">
                    {us ? "✅" : "❌"}
                  </div>
                  <div className="p-3 md:p-4 border-b border-gray-800 text-center text-lg">
                    {them ? "✅" : "❌"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>

          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Ready to transform
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              your fitness journey?
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            Join hundreds of people who&apos;ve already gotten their personalized plans.
            Start free with a 1-week sample.
          </p>
          <Link
            href="/step/1"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02]"
          >
            Build My Plan Now (Tangira Ubu) →
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏋️</span>
              <span className="font-bold text-gray-400">RamaFit</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 font-medium font-mono text-xs">
                <span>🇷🇼</span> Proudly built in Rwanda
              </span>
              <Link href="/privacy" className="hover:text-gray-400 transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-400 transition">Terms & Refunds</Link>
              <a href="mailto:hello@ramafit.xyz" className="hover:text-gray-400 transition">Contact</a>
            </div>

            <p className="text-sm text-gray-700">
              © {new Date().getFullYear()} RamaFit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
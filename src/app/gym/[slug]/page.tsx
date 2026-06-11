import { getGymProfile } from "@/lib/gymConfig";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GymLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const gym = getGymProfile(slug);

  // Redirect to B2C landing if gym slug doesn't match any registered partner
  if (!gym) {
    redirect("/");
  }

  const primaryColor = gym.primaryColor;
  const secondaryColor = gym.secondaryColor;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Dynamic styling customizer injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .gym-glow-text {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .gym-btn-gradient {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          box-shadow: 0 10px 30px -10px ${primaryColor}80;
        }
        .gym-btn-gradient:hover {
          box-shadow: 0 15px 35px -5px ${primaryColor}cc;
          transform: translateY(-2px);
        }
        .gym-border-glow {
          border-color: ${primaryColor}20;
        }
        .gym-border-glow:hover {
          border-color: ${primaryColor}60;
        }
        .gym-badge-bg {
          background-color: ${primaryColor}15;
          border-color: ${primaryColor}30;
          color: ${primaryColor};
        }
      `}} />

      {/* NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏋️</span>
            <span className="text-xl font-bold gym-glow-text">
              RamaFit × {gym.name}
            </span>
          </div>
          <div className="text-xs text-gray-400 font-medium px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            🇸🇳 Partner Gym Portal
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative flex-1 flex items-center justify-center pt-24 pb-12 px-6">
        {/* Subtle background ambient gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse"
            style={{ backgroundColor: primaryColor }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
            style={{ backgroundColor: secondaryColor }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center py-12">
          {/* Partnership Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 gym-badge-bg border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
            Member Exclusive Access
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Get Your Custom Plan<br />
            <span className="gym-glow-text">
              Tailored for {gym.name}
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            {gym.welcomeMessage || `Welcome to your member portal. Generate a professional training and nutrition plan customized exactly to ${gym.name}'s facility equipment and local foods.`}
          </p>

          {/* Pricing info box */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/5 border border-white/10 mb-10 text-left gym-border-glow transition-all">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <span>🎁</span> Member Benefit Program
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Bypass B2C payment ($6.99–$29.99 retail). Verify your active member email or phone number in the builder wizard to get your plan completely managed by your gym.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`/step/1?gym=${gym.slug}`}
              className="gym-btn-gradient inline-flex items-center justify-center px-8 py-4 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform"
            >
              Start Plan Builder →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 transition"
            >
              B2C Public Home
            </Link>
          </div>

          {/* Benefit Quick List */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-16 text-center text-xs text-gray-400 font-medium">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-lg block mb-1">📋</span>
              Gym Equipment Pre-mapped
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-lg block mb-1">🥗</span>
              Localized Rwandan Nutrition
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 col-span-2 md:col-span-1">
              <span className="text-lg block mb-1">⚡</span>
              Bypass Standard Billing
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} RamaFit B2B Partnership. Powered by RamaFit AI Engine.</p>
      </footer>
    </div>
  );
}

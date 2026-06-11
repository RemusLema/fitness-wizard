"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  BarChart3,
  Dumbbell,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  Settings,
  HelpCircle,
  FileText,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function GymDashboard({ params }: PageProps) {
  const { slug } = use(params);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Dashboard state ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "equipment">("overview");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  // ── Member state ─────────────────────────────────────────────────────────────
  const [memberInput, setMemberInput] = useState("");
  const [membersList, setMembersList] = useState<string[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSuccessMsg, setMemberSuccessMsg] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  // ── Equipment state ──────────────────────────────────────────────────────────
  const PREDEFINED_EQUIPMENT = [
    "Bodyweight Only",
    "Dumbbells",
    "Barbell",
    "Cable Machines",
    "Leg Extension Machine",
    "Treadmill",
    "Bike",
    "Trapbar",
  ];
  const [activeEquipment, setActiveEquipment] = useState<string[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipmentSaveLoading, setEquipmentSaveLoading] = useState(false);
  const [equipmentSaveMsg, setEquipmentSaveMsg] = useState("");

  // ── Login ────────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setLoginLoading(true);
    setPinError("");
    try {
      const res = await fetch("/api/gym-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymSlug: slug, pin: pinInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinInput("");
      } else {
        setPinError(data.error || "Invalid PIN. Please try again.");
      }
    } catch {
      setPinError("Connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await fetch("/api/gym-auth", { method: "DELETE" }).catch(() => {});
    setIsAuthenticated(false);
    setAnalytics(null);
    setMembersList([]);
    setActiveEquipment([]);
  };

  // ── Fetch analytics (once authenticated) ─────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setPageError("");
        const res = await fetch(`/api/gym-analytics?gym=${slug}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setAnalytics(data);
        } else {
          setPageError(data.error || "Failed to load gym data");
        }
      } catch {
        setPageError("Network error loading analytics.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [isAuthenticated, slug]);

  // ── Fetch members (when members tab selected or after auth) ──────────────────
  const fetchMembers = async () => {
    setMembersLoading(true);
    setMemberError("");
    try {
      const res = await fetch(`/api/gym-members?gym=${slug}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMembersList(data.members);
      } else {
        setMemberError(data.error || "Failed to load members.");
      }
    } catch {
      setMemberError("Connection error loading members.");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === "members") {
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab]);

  // ── Fetch equipment (when equipment tab selected or after auth) ───────────────
  const fetchEquipment = async () => {
    setEquipmentLoading(true);
    try {
      const res = await fetch(`/api/gym-equipment?gym=${slug}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveEquipment(data.equipment);
      }
    } catch {
      // Falls back to empty; user can toggle and save
    } finally {
      setEquipmentLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === "equipment") {
      fetchEquipment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab]);

  // ── Member handlers ───────────────────────────────────────────────────────────
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = memberInput.trim().toLowerCase();
    if (!val) return;
    setMemberActionLoading(true);
    setMemberError("");
    setMemberSuccessMsg("");
    try {
      const res = await fetch("/api/gym-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymSlug: slug, emailOrPhone: val }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMemberSuccessMsg(data.message);
        setMemberInput("");
        await fetchMembers(); // Refresh from Redis
        setTimeout(() => setMemberSuccessMsg(""), 4000);
      } else {
        setMemberError(data.error || "Failed to register member.");
      }
    } catch {
      setMemberError("Connection error. Please try again.");
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleRemoveMember = async (emailOrPhone: string) => {
    setMemberError("");
    setMemberSuccessMsg("");
    try {
      const res = await fetch("/api/gym-members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymSlug: slug, emailOrPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Optimistic update + refresh
        setMembersList((prev) => prev.filter((m) => m !== emailOrPhone));
      } else {
        setMemberError(data.error || "Failed to remove member.");
      }
    } catch {
      setMemberError("Connection error. Please try again.");
    }
  };

  // ── Equipment handlers ────────────────────────────────────────────────────────
  const handleToggleEquipment = (item: string) => {
    setActiveEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSaveEquipment = async () => {
    setEquipmentSaveLoading(true);
    setEquipmentSaveMsg("");
    try {
      const res = await fetch("/api/gym-equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymSlug: slug, equipment: activeEquipment }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEquipmentSaveMsg("Equipment inventory saved successfully!");
        setTimeout(() => setEquipmentSaveMsg(""), 4000);
      } else {
        setEquipmentSaveMsg("Save failed: " + (data.error || "Unknown error"));
      }
    } catch {
      setEquipmentSaveMsg("Connection error. Please try again.");
    } finally {
      setEquipmentSaveLoading(false);
    }
  };

  // ── PIN Gate ─────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              RamaFit
            </span>
            <p className="text-gray-400 text-sm mt-2">Partner Manager Portal</p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-500/10 rounded-xl">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Dashboard Access</h2>
                <p className="text-gray-500 text-xs capitalize">{slug.replace(/-/g, " ")} portal</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Admin PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter your admin PIN"
                    className="w-full p-3.5 pr-12 border border-white/10 rounded-xl bg-gray-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {pinError && (
                <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading || !pinInput.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold rounded-xl text-sm text-white flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Access Dashboard
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              Forgot your PIN? Contact{" "}
              <strong className="text-gray-400">business@ramafit.xyz</strong>
            </p>
          </div>

          <div className="text-center mt-6">
            <Link
              href={`/gym/${slug}`}
              className="text-xs text-gray-600 hover:text-gray-400 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to gym landing page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mb-4" />
        <p className="text-gray-400">Loading B2B Partner Portal...</p>
      </div>
    );
  }

  if (pageError && !analytics) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Partner Portal Error</h2>
        <p className="text-gray-400 max-w-md mb-8">{pageError}</p>
        <Link href="/" className="px-6 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-700 transition">
          Return to Home
        </Link>
      </div>
    );
  }

  // ── Authenticated dashboard ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              RamaFit
            </span>
            <span className="text-gray-600">|</span>
            <span className="font-bold text-gray-300">{analytics?.gymName} Manager Portal</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Billing Tier: {analytics?.billingTier}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition text-xs font-medium"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{analytics?.gymName} Portal</h1>
            <p className="text-gray-400 text-sm mt-1">
              Analyze client plan generations, customize equipment profiles, and manage active member access roster.
            </p>
          </div>
          <Link
            href={`/gym/${slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            View Co-branded Landing Page
          </Link>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-purple-500/20 transition-all">
            <div className="absolute top-4 right-4 p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Generated Plans</span>
            <span className="text-4xl font-black block mt-2">{analytics?.totalGenerations ?? "—"}</span>
            <p className="text-xs text-gray-400 mt-2">Active client fitness plans generated cycle-to-date.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
            <div className="absolute top-4 right-4 p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Est. Billable Balance</span>
            <span className="text-4xl font-black block mt-2">
              {analytics?.billingTier === "TRIAL"
                ? `$${(analytics?.currentBill ?? 0).toFixed(2)}`
                : "$149.00"}
            </span>
            <p className="text-xs text-gray-400 mt-2">
              {analytics?.billingTier === "TRIAL"
                ? "Pay-As-You-Go Trial pricing: $1.50 per generated plan."
                : "Premium B2B licensing fee billed monthly (Flat-Rate)."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <div className="absolute top-4 right-4 p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Active Equipment Profile</span>
            <span className="text-4xl font-black block mt-2">
              {activeEquipment.length} <span className="text-sm font-normal text-gray-400">/ {PREDEFINED_EQUIPMENT.length}</span>
            </span>
            <p className="text-xs text-gray-400 mt-2">Equipment items mapped to AI prompts.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 gap-6 text-sm font-medium">
          {(["overview", "members", "equipment"] as const).map((tab) => {
            const icons = { overview: BarChart3, members: Users, equipment: Dumbbell };
            const labels = { overview: "Overview Analytics", members: `Member Directory (${membersList.length})`, equipment: "Equipment Setup" };
            const Icon = icons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 transition relative flex items-center gap-2 ${
                  activeTab === tab ? "text-purple-400 font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {labels[tab]}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="mt-4">

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Client Goals Distribution</h3>
                  <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-400 cursor-help" />
                </div>
                <div className="space-y-4">
                  {analytics.isRealData === false && (
                    <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                      📊 Showing estimated data — real goal data will appear after first plan generation.
                    </p>
                  )}
                  {Object.entries(analytics.goalBreakdown).map(([goal, pct]: any) => {
                    const formattedGoal = goal.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
                    let color = "bg-purple-500";
                    if (goal === "muscle_gain") color = "bg-blue-500";
                    if (goal === "toning") color = "bg-pink-500";
                    if (goal === "endurance") color = "bg-amber-500";
                    return (
                      <div key={goal} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-300">{formattedGoal}</span>
                          <span className="text-gray-400 font-medium">{pct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic bg-white/[0.01] p-3 rounded-lg border border-white/5">
                  💡 Use this breakdown to tailor class scheduling and group programming to match member demand.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-4">Partner Pricing Tiers</h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border transition-all ${
                      analytics.billingTier === "TRIAL" ? "border-purple-500 bg-purple-500/5" : "border-white/5 bg-white/[0.01]"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold block text-sm">Pay-As-You-Go Trial {analytics.billingTier === "TRIAL" ? "(Active)" : ""}</span>
                          <span className="text-xs text-gray-400 mt-1 block">Ideal to test client interest without high upfront fees.</span>
                        </div>
                        <span className="text-sm font-black text-purple-400">$1.50 / plan</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border transition-all ${
                      analytics.billingTier === "SAAS_PREMIUM" ? "border-purple-500 bg-purple-500/5" : "border-white/5 bg-white/[0.01]"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold block text-sm">Flat SaaS Premium {analytics.billingTier === "SAAS_PREMIUM" ? "(Active)" : ""}</span>
                          <span className="text-xs text-gray-400 mt-1 block">Unlimited client generated plans, custom welcome emails, and trainer PDFs.</span>
                        </div>
                        <span className="text-sm font-black text-gray-400">$149 / month</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex gap-4 items-center">
                  <span className="text-2xl">🔥</span>
                  <div className="text-xs text-gray-400">
                    Want to switch to flat B2B licensing or configure integrated MTN Mobile Money checkout? Contact <strong>business@ramafit.xyz</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEMBERS */}
          {activeTab === "members" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Registration form */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 h-fit">
                <h3 className="text-lg font-bold">Register Active Member</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Register member email addresses or phone numbers to authorize sponsored checkout bypasses on the RamaFit plan builder wizard.
                </p>
                <form onSubmit={handleAddMember} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Member Email or Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      placeholder="e.g. client@email.com or 0788..."
                      className="w-full p-3 border border-white/10 rounded-xl bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={memberActionLoading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    {memberActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Register Credentials
                  </button>
                </form>

                {memberSuccessMsg && (
                  <p className="text-green-400 text-sm font-semibold flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg">
                    <Check className="w-4 h-4" />
                    {memberSuccessMsg}
                  </p>
                )}
                {memberError && (
                  <p className="text-red-400 text-sm font-semibold p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {memberError}
                  </p>
                )}
              </div>

              {/* Roster list */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Authorized Members Directory</h3>
                  <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gray-400">
                    {membersList.length} Active Records
                  </span>
                </div>

                {membersLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading roster...
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto divide-y divide-white/5 rounded-xl border border-white/5">
                    {membersList.length > 0 ? (
                      membersList.map((email, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between bg-white/[0.005] hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold">
                              {email.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-medium block text-gray-200">{email}</span>
                              <span className="text-xs text-gray-500">Active member — authorized to bypass checkout.</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(email)}
                            className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-500 transition-colors"
                            title="Revoke active status"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No active member records registered. Add new credentials to authorize sponsored access!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: EQUIPMENT */}
          {activeTab === "equipment" && (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
              <div>
                <h3 className="text-lg font-bold">Equipment Inventory Setup</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Check the equipment items available in your physical gym. RamaFit AI constraints are automatically updated, mapping client exercise routines strictly to checked items.
                </p>
              </div>

              {equipmentLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading equipment profile...
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  {PREDEFINED_EQUIPMENT.map((item) => {
                    const isActive = activeEquipment.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleEquipment(item)}
                        className={`p-4 border rounded-xl flex flex-col justify-between text-left transition duration-200 cursor-pointer h-24 hover:border-purple-400/50 ${
                          isActive
                            ? "border-purple-500 bg-purple-500/5 shadow-md shadow-purple-500/5"
                            : "border-white/5 bg-white/[0.01]"
                        }`}
                      >
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory Item</span>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-semibold">{item}</span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-xs ${
                            isActive ? "bg-purple-500 border-purple-400 text-white" : "border-white/20 text-transparent"
                          }`}>
                            ✓
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-400">
                  ⚠️ Note: Unchecking equipment instantly prevents AI models from assigning exercises using that specific gear (e.g. unchecking Leg Extension machine shifts workouts to dumbbells/squats).
                </p>
                <div className="flex items-center gap-4">
                  {equipmentSaveMsg && (
                    <span className={`text-sm font-semibold ${equipmentSaveMsg.startsWith("Save failed") ? "text-red-400" : "text-green-400"}`}>
                      {equipmentSaveMsg}
                    </span>
                  )}
                  <button
                    onClick={handleSaveEquipment}
                    disabled={equipmentSaveLoading}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition font-bold rounded-xl text-sm flex items-center gap-2"
                  >
                    {equipmentSaveLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Save Inventory Setup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 border-t border-white/5 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} RamaFit Partner Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, DollarSign, BarChart3, Dumbbell, Plus, Trash2, Check,
  ArrowLeft, FileText, Lock, LogOut, Eye, EyeOff, Loader2,
  Search, TrendingUp, ShieldCheck, AlertTriangle, RefreshCw, X,
} from "lucide-react";

const PREDEFINED_EQUIPMENT = [
  "Bodyweight Only", "Dumbbells", "Barbell",
  "Cable Machines", "Leg Extension Machine", "Treadmill", "Bike", "Trapbar",
];

const EQUIPMENT_ICONS: Record<string, string> = {
  "Bodyweight Only": "🏃", "Dumbbells": "🏋️", "Barbell": "⚖️",
  "Cable Machines": "🔗", "Leg Extension Machine": "🦵", "Treadmill": "🚶",
  "Bike": "🚲", "Trapbar": "⬡",
};

// ── Small reusable components ────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent, suffix,
}: {
  label: string; value: React.ReactNode; sub: string;
  icon: React.ElementType; accent: string; suffix?: React.ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 group hover:scale-[1.01]"
      style={{ borderColor: `${accent}20`, background: `${accent}06` }}
    >
      <div
        className="absolute top-4 right-4 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${accent}18` }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <span className="text-xs font-bold tracking-widest uppercase block" style={{ color: `${accent}99` }}>
        {label}
      </span>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-4xl font-black text-white">{value}</span>
        {suffix}
      </div>
      <p className="text-xs text-gray-400 mt-2 leading-relaxed">{sub}</p>
    </div>
  );
}

function GoalBar({ goal, pct, primary }: { goal: string; pct: number; primary: string }) {
  const label = goal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const colors: Record<string, string> = {
    weight_loss: "#a855f7", muscle_gain: "#3b82f6",
    toning: "#ec4899", endurance: "#f59e0b",
  };
  const color = colors[goal] || primary;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-gray-300">{label}</span>
        <span className="font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── Main dashboard component ─────────────────────────────────────────────────

export default function GymDashboard({ slug }: { slug: string }) {
  // Auth
  const [authState, setAuthState] = useState<"checking" | "login" | "dashboard">("checking");
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [pinError, setPinError] = useState("");

  // Core data
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "equipment">("overview");

  // Members
  const [members, setMembers] = useState<string[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [memberAddLoading, setMemberAddLoading] = useState(false);
  const [memberMsg, setMemberMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  // Equipment
  const [equipment, setEquipment] = useState<string[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipSaving, setEquipSaving] = useState(false);
  const [equipMsg, setEquipMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Auth: probe session cookie on mount ─────────────────────────────────────
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`/api/gym-members?gym=${slug}`);
        if (res.status === 200) {
          setAuthState("dashboard");
        } else {
          setAuthState("login");
        }
      } catch {
        setAuthState("login");
      }
    }
    checkSession();
  }, [slug]);

  // ── Fetch analytics ─────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const res = await fetch(`/api/gym-analytics?gym=${slug}`);
      const data = await res.json();
      if (res.ok && data.success) setAnalytics(data);
      else setAnalyticsError(data.error || "Failed to load analytics.");
    } catch {
      setAnalyticsError("Network error loading analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (authState === "dashboard") fetchAnalytics();
  }, [authState, fetchAnalytics]);

  // ── Fetch members ───────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await fetch(`/api/gym-members?gym=${slug}`);
      const data = await res.json();
      if (res.ok && data.success) setMembers(data.members);
    } catch { /* noop */ }
    finally { setMembersLoading(false); }
  }, [slug]);

  useEffect(() => {
    if (authState === "dashboard" && activeTab === "members") fetchMembers();
  }, [authState, activeTab, fetchMembers]);

  // ── Fetch equipment ─────────────────────────────────────────────────────────
  const fetchEquipment = useCallback(async () => {
    setEquipmentLoading(true);
    try {
      const res = await fetch(`/api/gym-equipment?gym=${slug}`);
      const data = await res.json();
      if (res.ok && data.success) setEquipment(data.equipment);
    } catch { /* noop */ }
    finally { setEquipmentLoading(false); }
  }, [slug]);

  useEffect(() => {
    if (authState === "dashboard" && activeTab === "equipment") fetchEquipment();
  }, [authState, activeTab, fetchEquipment]);

  // ── Handlers ────────────────────────────────────────────────────────────────
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
        setAuthState("dashboard");
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

  const handleLogout = async () => {
    await fetch("/api/gym-auth", { method: "DELETE" }).catch(() => {});
    setAuthState("login");
    setAnalytics(null);
    setMembers([]);
    setEquipment([]);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = memberInput.trim().toLowerCase();
    if (!val) return;
    setMemberAddLoading(true);
    setMemberMsg(null);
    try {
      const res = await fetch("/api/gym-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymSlug: slug, emailOrPhone: val }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMemberMsg({ text: data.message, ok: true });
        setMemberInput("");
        await fetchMembers();
      } else {
        setMemberMsg({ text: data.error || "Failed to add member.", ok: false });
      }
    } catch {
      setMemberMsg({ text: "Connection error.", ok: false });
    } finally {
      setMemberAddLoading(false);
      setTimeout(() => setMemberMsg(null), 4000);
    }
  };

  const handleRemoveMember = async (m: string) => {
    setRemovingMember(m);
    setMemberMsg(null);
    try {
      const res = await fetch("/api/gym-members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymSlug: slug, emailOrPhone: m }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((x) => x !== m));
        setMemberMsg({ text: `Removed ${m}`, ok: true });
        setTimeout(() => setMemberMsg(null), 3000);
      }
    } catch { /* noop */ }
    finally { setRemovingMember(null); }
  };

  const handleToggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSaveEquipment = async () => {
    setEquipSaving(true);
    setEquipMsg(null);
    try {
      const res = await fetch("/api/gym-equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymSlug: slug, equipment }),
      });
      const data = await res.json();
      setEquipMsg({
        text: res.ok ? "Equipment inventory saved!" : (data.error || "Save failed."),
        ok: res.ok,
      });
    } catch {
      setEquipMsg({ text: "Connection error.", ok: false });
    } finally {
      setEquipSaving(false);
      setTimeout(() => setEquipMsg(null), 4000);
    }
  };

  // Derive brand colors once analytics are loaded (fallback to purple/pink)
  const primary = analytics?.primaryColor || "#a855f7";
  const secondary = analytics?.secondaryColor || "#ec4899";
  const gradientStyle = { background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` };

  const filteredMembers = members.filter((m) =>
    m.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-purple-500 border-purple-500/20 animate-spin" />
          <p className="text-gray-500 text-sm">Checking session...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (authState === "login") {
    const gymDisplayName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
            style={{ backgroundColor: "#a855f7" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] opacity-10"
            style={{ backgroundColor: "#ec4899" }} />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          {/* Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-3xl">🏋️</span>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                RamaFit
              </span>
            </div>
            <p className="text-gray-500 text-sm">Partner Manager Portal</p>
          </div>

          {/* Login card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-3xl p-8 shadow-2xl shadow-black/60">
            {/* Gym badge */}
            <div className="flex items-center gap-3 mb-8 p-3 bg-white/[0.03] rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg, #a855f720 0%, #ec489920 100%)" }}>
                🏢
              </div>
              <div>
                <p className="text-white font-bold text-sm">{gymDisplayName}</p>
                <p className="text-gray-500 text-xs">Dashboard Access Required</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span className="text-amber-400 text-[10px] font-bold">SECURED</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                  Admin PIN
                </label>
                <div className="relative">
                  <input
                    id="pin-input"
                    type={showPin ? "text" : "password"}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter your admin PIN"
                    autoComplete="current-password"
                    autoFocus
                    required
                    className="w-full py-3.5 px-4 pr-12 bg-gray-900/80 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {pinError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-sm">{pinError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !pinInput.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={loginLoading || !pinInput.trim() ? { background: "#6b21a8" } : gradientStyle}
              >
                {loginLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying PIN...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Access Dashboard</>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <p className="text-gray-600 text-xs">
                Forgot your PIN?{" "}
                <a href="mailto:business@ramafit.xyz" className="text-gray-400 hover:text-white transition">
                  Contact business@ramafit.xyz
                </a>
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              href={`/gym/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to gym landing page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  const gymName = analytics?.gymName || slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#070710] text-white font-sans flex flex-col">

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[180px] opacity-[0.06]"
          style={{ backgroundColor: primary }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[180px] opacity-[0.04]"
          style={{ backgroundColor: secondary }} />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
      <header className="relative z-10 sticky top-0 bg-gray-950/70 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/gym/${slug}`}
              className="p-2 hover:bg-white/5 rounded-lg transition text-gray-500 hover:text-white"
              title="Back to gym page"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                RamaFit
              </span>
              <span className="text-gray-700">×</span>
              <span className="font-bold text-gray-200 text-sm">{gymName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Billing tier badge */}
            {analytics?.billingTier && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold"
                style={{ borderColor: `${primary}40`, color: primary, background: `${primary}10` }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: primary }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: primary }} />
                </span>
                {analytics.billingTier === "TRIAL" ? "Trial Tier" : "Premium"}
              </div>
            )}

            <button
              onClick={() => fetchAnalytics()}
              className="p-2 hover:bg-white/5 rounded-lg transition text-gray-500 hover:text-gray-300"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg text-gray-400 hover:text-white transition text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ──────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">

        {/* Page title + action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 text-xs font-bold px-3 py-1 rounded-full border"
              style={{ color: primary, borderColor: `${primary}30`, background: `${primary}10` }}>
              🏢 Partner Manager Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{gymName}</h1>
            <p className="text-gray-400 text-sm mt-1.5 max-w-xl">
              Manage your authorized member roster, equipment inventory, and review client plan generation analytics — all in one place.
            </p>
          </div>
          <Link
            href={`/gym/${slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 rounded-xl text-sm font-semibold text-gray-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] transition shrink-0"
          >
            <FileText className="w-4 h-4" style={{ color: primary }} />
            View Member Landing Page
          </Link>
        </div>

        {/* ── STAT CARDS ──────────────────────────────────────────────────────── */}
        {analyticsLoading && !analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              label="Plans Generated"
              value={analytics?.totalGenerations ?? "—"}
              sub="Total fitness plans created for your members this cycle."
              icon={TrendingUp}
              accent={primary}
            />
            <StatCard
              label="Estimated Bill"
              value={
                analytics?.billingTier === "TRIAL"
                  ? `$${(analytics?.currentBill ?? 0).toFixed(2)}`
                  : "$149.00"
              }
              sub={
                analytics?.billingTier === "TRIAL"
                  ? "Pay-As-You-Go: $1.50 per plan generated."
                  : "SaaS Premium flat-rate billed monthly."
              }
              icon={DollarSign}
              accent="#22d3ee"
            />
            <StatCard
              label="Active Members"
              value={members.length > 0 ? members.length : "—"}
              sub="Members authorized for sponsored checkout bypass."
              icon={Users}
              accent={secondary}
              suffix={
                <span className="text-base font-normal text-gray-500 self-end mb-1">
                  accounts
                </span>
              }
            />
          </div>
        )}

        {/* ── TABS ────────────────────────────────────────────────────────────── */}
        <div className="border-b border-white/5">
          <div className="flex gap-1">
            {(["overview", "members", "equipment"] as const).map((tab) => {
              const config = {
                overview: { label: "Analytics Overview", icon: BarChart3 },
                members: { label: `Members${members.length > 0 ? ` (${members.length})` : ""}`, icon: Users },
                equipment: { label: "Equipment Setup", icon: Dumbbell },
              }[tab];
              const Icon = config.icon;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all rounded-t-xl ${
                    isActive ? "text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                  }`}
                  style={isActive ? { color: primary } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────────────────────────── */}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Goal breakdown — left (wider) */}
            <div className="lg:col-span-3 p-7 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Client Goal Distribution</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Breakdown of what your members train for
                  </p>
                </div>
                {analyticsLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
              </div>

              {analyticsError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {analyticsError}
                </div>
              )}

              {analytics?.isRealData === false && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Showing estimated benchmark data — real stats will populate after your first member plan generation.</span>
                </div>
              )}

              {analytics?.goalBreakdown ? (
                <div className="space-y-5">
                  {Object.entries(analytics.goalBreakdown).map(([goal, pct]: any) => (
                    <GoalBar key={goal} goal={goal} pct={pct} primary={primary} />
                  ))}
                </div>
              ) : (
                !analyticsLoading && (
                  <div className="py-12 text-center text-gray-500 text-sm">
                    No analytics data yet.
                  </div>
                )
              )}

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  💡 Use this to tailor group class schedules and equipment prioritization to match member demand.
                </p>
              </div>
            </div>

            {/* Billing + quick stats — right */}
            <div className="lg:col-span-2 space-y-5">

              {/* Billing tier card */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <h3 className="text-base font-bold">Billing Plan</h3>
                <div className="space-y-3">
                  {[
                    {
                      key: "TRIAL",
                      name: "Pay-As-You-Go Trial",
                      desc: "Ideal for testing client demand.",
                      price: "$1.50 / plan",
                    },
                    {
                      key: "SAAS_PREMIUM",
                      name: "Flat SaaS Premium",
                      desc: "Unlimited plans, custom branding, priority support.",
                      price: "$149 / mo",
                    },
                  ].map(({ key, name, desc, price }) => {
                    const isActive = analytics?.billingTier === key;
                    return (
                      <div
                        key={key}
                        className="p-4 rounded-xl border transition-all"
                        style={{
                          borderColor: isActive ? `${primary}50` : "rgba(255,255,255,0.05)",
                          background: isActive ? `${primary}08` : "transparent",
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="font-semibold text-sm block">
                              {name}
                              {isActive && (
                                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ color: primary, background: `${primary}20` }}>
                                  ACTIVE
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5 block">{desc}</span>
                          </div>
                          <span className="text-sm font-black shrink-0" style={{ color: isActive ? primary : "#6b7280" }}>
                            {price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick stat: equipment */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold">Equipment Profile</h3>
                  <Dumbbell className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{analytics?.equipmentCount ?? "—"}</span>
                  <span className="text-gray-500 text-sm">/ {PREDEFINED_EQUIPMENT.length} items</span>
                </div>
                <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${((analytics?.equipmentCount ?? 0) / PREDEFINED_EQUIPMENT.length) * 100}%`,
                      background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                    }}
                  />
                </div>
                <button
                  onClick={() => setActiveTab("equipment")}
                  className="mt-4 text-xs font-semibold transition hover:underline"
                  style={{ color: primary }}
                >
                  Manage equipment →
                </button>
              </div>

              {/* Upgrade CTA */}
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.015] text-center space-y-2">
                <p className="text-xs font-bold text-gray-400">Ready to scale?</p>
                <p className="text-xs text-gray-500">
                  Switch to flat SaaS or configure MTN Mobile Money checkout integration.
                </p>
                <a
                  href="mailto:business@ramafit.xyz"
                  className="inline-block text-xs font-bold py-2 px-4 rounded-xl transition-all mt-1 text-white"
                  style={gradientStyle}
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === "members" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Add member form */}
            <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/5 h-fit space-y-5">
              <div>
                <h3 className="text-lg font-bold">Register Member</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Add a member email or phone number to authorize them for sponsored checkout bypass on the plan wizard.
                </p>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Email or Phone Number
                  </label>
                  <input
                    id="member-input"
                    type="text"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    placeholder="client@gym.com or 0788123456"
                    required
                    className="w-full py-3 px-4 bg-gray-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/15 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  id="add-member-btn"
                  disabled={memberAddLoading || !memberInput.trim()}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={memberAddLoading ? { background: "#6b21a8" } : gradientStyle}
                >
                  {memberAddLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add to Roster
                </button>
              </form>

              {/* Feedback */}
              {memberMsg && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    memberMsg.ok
                      ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/8 border-red-500/20 text-red-400"
                  }`}
                >
                  {memberMsg.ok ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {memberMsg.text}
                </div>
              )}

              <div className="pt-4 border-t border-white/5 text-xs text-gray-500 space-y-1.5">
                <p>✓ Accepts valid email addresses</p>
                <p>✓ Accepts phone numbers (7–20 digits)</p>
                <p>✓ Normalized to lowercase automatically</p>
                <p>✓ Duplicates are safely ignored</p>
              </div>
            </div>

            {/* Roster list */}
            <div className="lg:col-span-2 p-7 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Authorized Roster</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {members.length} active {members.length === 1 ? "record" : "records"}
                  </p>
                </div>
                <button
                  onClick={fetchMembers}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition px-3 py-1.5 bg-white/[0.02] border border-white/8 rounded-lg"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="member-search"
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full py-2.5 pl-10 pr-4 bg-gray-900/60 border border-white/8 rounded-xl text-sm placeholder-gray-600 text-white focus:outline-none focus:border-white/20 transition"
                />
                {memberSearch && (
                  <button
                    onClick={() => setMemberSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {membersLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading member roster...
                </div>
              ) : filteredMembers.length > 0 ? (
                <div className="max-h-[420px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {filteredMembers.map((m, idx) => {
                    const isPhone = /^\+?[\d\s\-()]{7,}$/.test(m);
                    const initials = isPhone ? "📱" : m.substring(0, 2).toUpperCase();
                    return (
                      <div
                        key={idx}
                        className="group flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border"
                            style={{ background: `${primary}15`, borderColor: `${primary}25`, color: primary }}
                          >
                            {isPhone ? "📱" : initials}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-200 block">{m}</span>
                            <span className="text-xs text-gray-600">
                              {isPhone ? "Phone" : "Email"} · Active member · Checkout bypass authorized
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(m)}
                          disabled={removingMember === m}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Remove from roster"
                        >
                          {removingMember === m ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-gray-500 space-y-2">
                  {memberSearch ? (
                    <>
                      <p className="text-sm">No members match &quot;{memberSearch}&quot;</p>
                      <button onClick={() => setMemberSearch("")} className="text-xs text-gray-600 hover:text-gray-400 transition underline">
                        Clear search
                      </button>
                    </>
                  ) : (
                    <>
                      <Users className="w-8 h-8 mx-auto text-gray-700" />
                      <p className="text-sm">No authorized members yet.</p>
                      <p className="text-xs text-gray-600">Add credentials above to grant sponsored checkout access.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EQUIPMENT TAB */}
        {activeTab === "equipment" && (
          <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/5 space-y-7">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Equipment Inventory</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Toggle which equipment is available at your facility.
                  RamaFit AI will <span className="font-semibold text-white">only assign exercises</span> that match the active selection below.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-gray-500">
                  {equipment.length} of {PREDEFINED_EQUIPMENT.length} items active
                </p>
                <div className="mt-1.5 w-40 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(equipment.length / PREDEFINED_EQUIPMENT.length) * 100}%`,
                      background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                    }}
                  />
                </div>
              </div>
            </div>

            {equipmentLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading equipment profile...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {PREDEFINED_EQUIPMENT.map((item) => {
                  const isActive = equipment.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleEquipment(item)}
                      className="relative p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all duration-200 cursor-pointer group active:scale-[0.97]"
                      style={{
                        borderColor: isActive ? `${primary}60` : "rgba(255,255,255,0.05)",
                        background: isActive ? `${primary}08` : "rgba(255,255,255,0.01)",
                        boxShadow: isActive ? `0 0 24px ${primary}12` : "none",
                      }}
                    >
                      {/* Active indicator */}
                      <div
                        className="absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all"
                        style={{
                          background: isActive ? primary : "transparent",
                          borderColor: isActive ? primary : "rgba(255,255,255,0.15)",
                          color: isActive ? "white" : "transparent",
                        }}
                      >
                        ✓
                      </div>

                      <span className="text-2xl">{EQUIPMENT_ICONS[item] || "🏋️"}</span>
                      <div>
                        <span className="text-xs text-gray-500 block mb-0.5 font-medium uppercase tracking-wider">
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-sm font-bold leading-tight">{item}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Save row */}
            <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
                ⚠️ Unchecking an item immediately removes it from AI exercise constraints — members will receive plans adapted to remaining equipment.
              </p>
              <div className="flex items-center gap-4 shrink-0">
                {equipMsg && (
                  <span
                    className={`text-sm font-semibold flex items-center gap-1.5 ${
                      equipMsg.ok ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {equipMsg.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {equipMsg.text}
                  </span>
                )}
                <button
                  id="save-equipment-btn"
                  onClick={handleSaveEquipment}
                  disabled={equipSaving}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 active:scale-[0.97]"
                  style={equipSaving ? { background: "#6b21a8" } : gradientStyle}
                >
                  {equipSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Inventory
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-6 border-t border-white/5 text-center text-xs text-gray-600">
        <span suppressHydrationWarning>© {new Date().getFullYear()}</span>{" "}RamaFit B2B Partner Portal · Powered by RamaFit AI Engine
      </footer>
    </div>
  );
}

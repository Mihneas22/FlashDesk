"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy, Zap, BookOpen, Star, Target, TrendingUp,
  Clock, Award, ChevronRight, Activity,
  CheckCircle, Brain, Layers, Calendar, Sparkles,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { User } from '../../lib/store';
import { StudyHeatmap } from "../../components/heatmap";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const USER = {
  name: "Ana Mihailescu",
  university: "TU Delft — Electrical Engineering, 3rd year",
  avatar: "AM",
  joinedDaysAgo: 47,
  currentStreak: 14,
  longestStreak: 21,
  totalCards: 1284,
  masteredCards: 847,
  totalDecks: 9,
  completedDecks: 4,
  studyMinutesTotal: 3120,
  weeklyGoalMet: 5,
};

const TOPICS = [
  { name: "Signals & Systems", cards: 340, mastered: 298, color: "from-violet-500 to-purple-600",  ringColor: "#8b5cf6", pct: 88 },
  { name: "Linear Algebra",    cards: 210, mastered: 189, color: "from-fuchsia-500 to-pink-600",   ringColor: "#d946ef", pct: 90 },
  { name: "Electrodynamics",   cards: 180, mastered: 122, color: "from-cyan-500 to-blue-600",      ringColor: "#06b6d4", pct: 68 },
  { name: "Numerical Methods", cards: 160, mastered: 88,  color: "from-amber-500 to-orange-600",   ringColor: "#f59e0b", pct: 55 },
  { name: "Data Structures",   cards: 130, mastered: 94,  color: "from-emerald-500 to-teal-600",   ringColor: "#10b981", pct: 72 },
  { name: "Discrete Math",     cards: 110, mastered: 46,  color: "from-rose-500 to-red-600",       ringColor: "#f43f5e", pct: 42 },
];

const WEEKLY = [
  { day: "Mon", cards: 32, minutes: 18 },
  { day: "Tue", cards: 45, minutes: 26 },
  { day: "Wed", cards: 12, minutes: 8  },
  { day: "Thu", cards: 58, minutes: 34 },
  { day: "Fri", cards: 41, minutes: 22 },
  { day: "Sat", cards: 70, minutes: 42 },
  { day: "Sun", cards: 29, minutes: 17 },
];

const ACHIEVEMENTS = [
  { icon: "🔥", label: "14-Day Streak",  desc: "Study every day for 2 weeks",    unlocked: true  },
  { icon: "🧮", label: "Formula Master", desc: "Master 500+ cards",              unlocked: true  },
  { icon: "📚", label: "Deck Destroyer", desc: "Complete 4 full decks",          unlocked: true  },
  { icon: "⚡", label: "Speed Learner",  desc: "Review 50 cards in one session", unlocked: true  },
  { icon: "🏆", label: "Top 10%",        desc: "Rank in the top 10% this month", unlocked: false },
  { icon: "🌙", label: "Night Owl",      desc: "Study after midnight 5 times",   unlocked: false },
  { icon: "🤝", label: "Collaborator",   desc: "Share a deck with 3 people",     unlocked: false },
  { icon: "💎", label: "Legendary",      desc: "Maintain a 30-day streak",       unlocked: false },
];

const ACTIVITY = [
  { text: "Mastered Fourier Transform deck",      time: "2h ago",    icon: "✦", color: "text-violet-400" },
  { text: "14-day streak milestone reached",      time: "Today",     icon: "🔥", color: "text-orange-400" },
  { text: "Reviewed 58 cards in Electrodynamics", time: "Yesterday", icon: "⚡", color: "text-cyan-400"   },
  { text: "Created new Numerical Methods deck",   time: "2d ago",    icon: "📚", color: "text-emerald-400" },
  { text: "Shared Linear Algebra deck with group",time: "3d ago",    icon: "↗", color: "text-pink-400"   },
];

const INSIGHTS = [
  { icon: <Star className="w-5 h-5" />,        label: "Favourite topic", val: "Signals & Systems", sub: "340 cards studied",       grad: "from-violet-500 to-purple-600", delay: 0   },
  { icon: <Clock className="w-5 h-5" />,       label: "Avg. session",    val: "26 min",            sub: "Per study session",        grad: "from-cyan-500 to-blue-600",    delay: 80  },
  { icon: <CheckCircle className="w-5 h-5" />, label: "Accuracy rate",   val: "84%",               sub: "Cards answered correctly", grad: "from-emerald-500 to-teal-600", delay: 160 },
  { icon: <TrendingUp className="w-5 h-5" />,  label: "Weekly growth",   val: "+12%",              sub: "vs last week",             grad: "from-pink-500 to-rose-600",    delay: 240 },
];


// ─── Hooks ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Counter({ value, suffix = "", duration = 1400 }: { value: number; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = value / (duration / 16);
    const t = setInterval(() => {
      n = Math.min(n + step, value);
      setCount(Math.floor(n));
      if (n >= value) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [inView, value, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Ring({ pct, size = 110, stroke = 9, color = "#8b5cf6" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const { ref, inView } = useInView();
  const [p, setP] = useState(0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const t = setInterval(() => { cur = Math.min(cur + 1.5, pct); setP(cur); if (cur >= pct) clearInterval(t); }, 12);
    return () => clearInterval(t);
  }, [inView, pct]);
  return (
    <div ref={ref} style={{ width: size, height: size }} className="relative flex-shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ - (circ * p) / 100}
          style={{ transition: "stroke-dashoffset 0.05s linear" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black text-white leading-none">{Math.round(p)}%</span>
      </div>
    </div>
  );
}


// ─── Section: Topic Mastery ───────────────────────────────────────────────────
function TopicMastery() {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`rounded-3xl border border-purple-500/20 bg-gray-900/40 backdrop-blur-md p-6 transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-pink-900/40">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Topic Mastery</h2>
            <p className="text-[11px] text-gray-500">Breakdown by course</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400 transition-colors font-semibold">
          See all <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map((t, i) => (
          <div
            key={t.name}
            className="group p-4 rounded-2xl bg-gray-800/30 border border-gray-700/30 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 cursor-default"
            style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(16px)", transitionDelay: `${i * 80}ms`, transition: "all 0.5s ease" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-sm font-bold text-white truncate">{t.name}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{t.mastered}/{t.cards} mastered</div>
              </div>
              <Ring pct={t.pct} size={52} stroke={5} color={t.ringColor} />
            </div>
            <div className="h-1.5 rounded-full bg-gray-700/50 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${t.color} transition-all duration-1000`}
                style={{ width: inView ? `${t.pct}%` : "0%", transitionDelay: `${i * 80 + 300}ms` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-[10px] font-bold ${t.pct >= 75 ? "text-emerald-400" : t.pct >= 50 ? "text-amber-400" : "text-red-400"}`}>
                {t.pct >= 75 ? "Strong ✓" : t.pct >= 50 ? "Developing" : "Needs work"}
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">{t.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Insights Strip ──────────────────────────────────────────────────
function InsightsStrip() {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`grid grid-cols-2 sm:grid-cols-4 gap-4 transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {INSIGHTS.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-gray-700/30 bg-gray-900/40 backdrop-blur-md p-5 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 group cursor-default"
          style={{ transitionDelay: `${s.delay}ms` }}
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
            {s.icon}
          </div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{s.label}</div>
          <div className="text-xl font-black text-white mb-0.5">{s.val}</div>
          <div className="text-[11px] text-gray-600">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    interface UserStatsDto {
        cardsMastered: number;
        totalCards: number;
        decksCompleted: number;
        totalDecks: number;
        daysStudiedThisWeek: number;
        overallMasteryPct: number;
    }

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setNewUserId] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStatsDto | null>(null);

    const [loading, setLoading] = useState(true);

    const fetchUserAsync = useCallback(async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const headers = {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          };

          const [userRes, statsRes] = await Promise.all([
              fetch(`http://localhost:5000/api/user/getuser`, { headers }),
              fetch(`http://localhost:5000/api/user/user-stats`, { headers }) 
          ]);

          if (userRes.ok) {
              const userData = await userRes.json();
              if (userData.flag && userData.user) {
                  setUser(userData.user as User);
              } else {
                  setUser(null);
              }
          }

          if (statsRes.ok) {
              const statsData = await statsRes.json();
              if (statsData.flag && statsData.data) {
                  setStats(statsData.data as UserStatsDto);
              } else {
                  setStats(null);
              }
          }
      } catch (error) {
          console.error("Error fetching data:", error);
      } finally {
          setLoading(false);
      }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const extractedId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub || decoded.nameid;
    
            if (extractedId) {
              setIsLoggedIn(true);
              setNewUserId(extractedId);
              fetchUserAsync();
            } else {
              setLoading(false);
            }
          } catch (error) {
            console.error("Token invalid:", error);
            setIsLoggedIn(false);
            setLoading(false);
          }
        } else {
          setIsLoggedIn(false);
          setLoading(false);
        }
      }, [fetchUserAsync]);

  const currentStats = stats || {
      cardsMastered: 0,
      totalCards: 0,
      decksCompleted: 0,
      totalDecks: 0,
      daysStudiedThisWeek: 0,
      overallMasteryPct: 0
  };
  const overallMastery = currentStats.overallMasteryPct;
  //const maxCards = Math.max(...WEEKLY.map((d) => d.cards));
  //const studyHours = Math.floor(USER.studyMinutesTotal / 60);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const { ref: achRef,  inView: achIn  } = useInView();
  const { ref: actRef,  inView: actIn  } = useInView();

  const HERO_STATS = [
      { icon: <Zap className="w-4 h-4 text-cyan-400" />,      label: "Cards Mastered",   val: currentStats.cardsMastered, suffix: "" },
      { icon: <Layers className="w-4 h-4 text-pink-400" />,   label: "Total Cards",      val: currentStats.totalCards,    suffix: "" },
      { icon: <BookOpen className="w-4 h-4 text-violet-400" />,label:"Decks Completed",  val: currentStats.decksCompleted,suffix: `/${currentStats.totalDecks}` },
      { icon: <Activity className="w-4 h-4 text-emerald-400" />,label:"This Week",       val: currentStats.daysStudiedThisWeek, suffix: "/7 days" },
  ];

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">Loading profile...</p>
            </div>
            </div>
        );
    }
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gray-950 text-gray-100">

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-6">

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <div className={`relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gray-900/40 backdrop-blur-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-transparent pointer-events-none" />
          {/* Decorative float formula */}
          <div className="absolute top-6 right-8 text-violet-500/10 font-mono text-5xl font-bold select-none pointer-events-none hidden sm:block animate-float">
            ∫∑∂
          </div>

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-900/60 text-3xl font-black text-white">
                {USER.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-orange-900/50 border-2 border-gray-950">
                🔥 {user?.streak?.currentStreak}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  {user?.username}
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold">
                  <Sparkles className="w-3 h-3" /> Core
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">{USER.university}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Calendar className="w-3 h-3 text-purple-400" />, text: `Member for ${Math.floor((new Date().getTime() - new Date(user?.createdAt!).getTime()) / (1000 * 60 * 60 * 24))} days` },
                  { icon: <Trophy className="w-3 h-3 text-amber-400" />,   text: `Best streak: ${user?.streak?.maxStreak} days` },
                ].map((b) => (
                  <span key={b.text} className="px-3 py-1 rounded-lg bg-gray-800/70 border border-gray-700/50 text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    {b.icon} {b.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Ring */}
            <div className="flex flex-col items-center gap-2 self-center">
              <Ring pct={overallMastery} size={110} stroke={9} color="#8b5cf6" />
              <span className="text-xs text-gray-500 font-semibold">overall mastery</span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative border-t border-gray-800/60 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-800/60">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-6 py-4 flex items-center gap-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${200 + i * 80}ms` }}
              >
                <div className="w-8 h-8 rounded-xl bg-gray-800/60 flex items-center justify-center flex-shrink-0">{s.icon}</div>
                <div>
                  <div className="text-xl font-black text-white leading-none">
                    <Counter value={s.val} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HEATMAP + WEEKLY BAR ────────────────────────────────────────── */}
        <StudyHeatmap
          userId={userId}
          currentStreak={user?.streak?.currentStreak ?? 0}
        />

        {/* ── TOPIC MASTERY ───────────────────────────────────────────────── */}
        <TopicMastery />

        {/* ── ACHIEVEMENTS + RECENT ACTIVITY ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Achievements */}
          <div
            ref={achRef}
            className={`lg:col-span-3 rounded-3xl border border-purple-500/20 bg-gray-900/40 backdrop-blur-md p-6 transition-all duration-700 ${achIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Achievements</h2>
                <p className="text-[11px] text-gray-500">
                  {ACHIEVEMENTS.filter((a) => a.unlocked).length} of {ACHIEVEMENTS.length} unlocked
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((a, i) => (
                <div
                  key={a.label}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all duration-500 group ${
                    a.unlocked
                      ? "bg-gray-800/40 border-gray-700/50 hover:border-violet-500/40 hover:scale-105 cursor-default"
                      : "bg-gray-900/30 border-gray-800/30"
                  }`}
                  style={{
                    opacity: achIn ? (a.unlocked ? 1 : 0.38) : 0,
                    transform: achIn ? "translateY(0)" : "translateY(20px)",
                    filter: a.unlocked ? "none" : "grayscale(1)",
                    transitionDelay: `${i * 60}ms`,
                    transition: "all 0.5s ease",
                  }}
                >
                  <div className={`text-3xl mb-2 transition-transform duration-300 ${a.unlocked ? "group-hover:scale-125 group-hover:rotate-12" : ""}`}>
                    {a.icon}
                  </div>
                  <div className="text-xs font-black text-white leading-tight mb-1">{a.label}</div>
                  <div className="text-[10px] text-gray-500 leading-tight mb-2">{a.desc}</div>
                  {a.unlocked ? (
                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                      Unlocked
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 rounded-full bg-gray-700/30 border border-gray-700/20 text-[9px] font-bold text-gray-600 uppercase tracking-wider">
                      Locked
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            ref={actRef}
            className={`lg:col-span-2 rounded-3xl border border-purple-500/20 bg-gray-900/40 backdrop-blur-md p-6 transition-all duration-700 delay-150 ${actIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/40">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Recent Activity</h2>
                <p className="text-[11px] text-gray-500">Your latest actions</p>
              </div>
            </div>

            <div className="space-y-1">
              {ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-300 group cursor-default"
                  style={{
                    opacity: actIn ? 1 : 0,
                    transform: actIn ? "translateX(0)" : "translateX(-16px)",
                    transitionDelay: `${i * 80}ms`,
                    transition: "all 0.5s ease",
                  }}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-800/60 border border-gray-700/40 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${a.color}`}>{a.text}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Exam countdown */}
            <div className="mt-5 p-4 rounded-2xl bg-violet-950/40 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-black text-violet-300 uppercase tracking-wide">Next Exam</span>
              </div>
              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="text-3xl font-black text-white">18</span>
                <span className="text-sm text-gray-400 font-semibold">days left</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Signals &amp; Systems · Jan 28</p>
              <div className="h-1.5 rounded-full bg-gray-800/60 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 w-3/4" />
              </div>
              <p className="text-[10px] text-violet-400 font-semibold mt-2">Review 22 cards today to stay on track</p>
            </div>
          </div>
        </div>

        {/* ── INSIGHTS STRIP ──────────────────────────────────────────────── */}
        <InsightsStrip />

      </main>

      <style>{`
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          25%      { transform: translate(20px,-50px) scale(1.1); }
          50%      { transform: translate(-20px,20px) scale(0.9); }
          75%      { transform: translate(20px,50px) scale(1.05); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-12px); }
        }
        .animate-blob          { animation: blob 7s infinite; }
        .animation-delay-2000  { animation-delay: 2s; }
        .animation-delay-4000  { animation-delay: 4s; }
        .animate-float         { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
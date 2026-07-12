"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy, Zap, BookOpen, Activity, Layers, Calendar, Sparkles, X,
  Settings, User as UserIcon, Mail, Key, Lock, ArrowUpRight, Target,
  Award, TrendingUp, Clock, Flame, CheckCircle2, AlertCircle,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { User, MappedTopic } from "../../lib/store";
import { StudyHeatmap } from "../../components/heatmap";
import { Navbar } from "@/components/navbar";
import { TopicMastery } from "@/components/topic-mastery";
import { Ring } from "@/components/ui/ring";
import { useInView } from "@/hooks/use-in-view";

/* ─── Sub-components ─── */
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

/* ─── Achievement Badge Component ─── */
function AchievementBadge({ icon, label, unlocked, color = "amber" }: any) {
  const colorClasses = {
    amber: unlocked ? "bg-amber-500/10 border-amber-500/40" : "bg-slate-700/20 border-slate-600/50",
    cyan: unlocked ? "bg-cyan-500/10 border-cyan-500/40" : "bg-slate-700/20 border-slate-600/50",
    green: unlocked ? "bg-green-500/10 border-green-500/40" : "bg-slate-700/20 border-slate-600/50",
    red: unlocked ? "bg-red-500/10 border-red-500/40" : "bg-slate-700/20 border-slate-600/50",
  };

  const iconBgClasses = {
    amber: unlocked ? "bg-amber-500/20" : "bg-slate-800",
    cyan: unlocked ? "bg-cyan-500/20" : "bg-slate-800",
    green: unlocked ? "bg-green-500/20" : "bg-slate-800",
    red: unlocked ? "bg-red-500/20" : "bg-slate-800",
  };

  const textColorClasses = {
    amber: unlocked ? "text-amber-300" : "text-slate-400",
    cyan: unlocked ? "text-cyan-300" : "text-slate-400",
    green: unlocked ? "text-green-300" : "text-slate-400",
    red: unlocked ? "text-red-300" : "text-slate-400",
  };

  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all border ${unlocked ? "" : "opacity-40 grayscale"} ${colorClasses.green}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClasses.amber}`}>
        <span className="text-lg">{icon}</span>
      </div>
      <span className={`text-xs font-semibold text-center leading-tight ${textColorClasses.cyan}`}>{label}</span>
    </div>
  );
}

/* ─── Study Session Card ─── */
function StudySessionCard({ topic, cards, duration, mastery, date }: any) {
  const masteryColor = mastery >= 80 ? "text-green-400" : mastery >= 60 ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-100">{topic}</div>
        <div className="text-xs text-slate-400 mt-1">{cards} cards • {duration} min</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-bold ${masteryColor}`}>{mastery}%</div>
        <div className="text-xs text-slate-400">{date}</div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
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
  const [hasPremiumAccess, setHasPremiumAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<MappedTopic[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'password'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleOpenSettings = () => {
    setEditUsername(user?.username || "");
    setActiveTab('profile');
    setMessage({ type: "", text: "" });
    setIsSettingsOpen(true);
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`https://learnqhub.com/api/api/user/update-username`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editUsername })
      });

      if (res.ok) {
        setUser(prev => prev ? { ...prev, username: editUsername } : null);
        setMessage({ type: "success", text: "Username updated successfully!" });
      } else throw new Error("Failed");
    } catch {
      setMessage({ type: "error", text: "Could not update username." });
    } finally { setIsUpdating(false); }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.currentPassword) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`https://learnqhub.com/api/user/update-email`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: emailForm.newEmail, password: emailForm.currentPassword })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Email updated successfully! Check your inbox." });
        setEmailForm({ newEmail: "", currentPassword: "" });
      } else throw new Error("Failed");
    } catch {
      setMessage({ type: "error", text: "Invalid password or email already in use." });
    } finally { setIsUpdating(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`https://learnqhub.com/api/user/update-password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else throw new Error("Failed");
    } catch {
      setMessage({ type: "error", text: "Could not change password. Check current password." });
    } finally { setIsUpdating(false); }
  };

  const fetchUserAsync = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [userRes, statsRes, masteryRes] = await Promise.all([
        fetch(`https://learnqhub.com/api/user/getuser`, { headers }),
        fetch(`https://learnqhub.com/api/user/user-stats`, { headers }),
        fetch(`https://learnqhub.com/api/user/user-mastery`, { headers })
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.flag && userData.user) {
          setUser(userData.user as User);
        } else {
          setUser(null);
        }
      }

      if (statsRes.status === 403 || masteryRes.status === 403 || statsRes.status === 401)
        setHasPremiumAccess(false);
      else {
        setHasPremiumAccess(true);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.flag && statsData.data) {
            setStats(statsData.data as UserStatsDto);
          } else {
            setStats(null);
          }
        }
        if (masteryRes.ok) {
          const masteryData = await masteryRes.json();
          if (masteryData.flag && masteryData.data) {
            const colorPalette = [
              { color: "from-amber-400 to-amber-600", ringColor: "#FFB84D" },
              { color: "from-cyan-400 to-cyan-600", ringColor: "#00D9FF" },
              { color: "from-green-400 to-green-600", ringColor: "#4ADE80" },
              { color: "from-red-400 to-red-600", ringColor: "#FF6B6B" },
            ];

            interface MasteryApiItem {
              topic: string;
              totalCards: number;
              masteredCards: number;
              masteryPct: number;
            }

            const mappedTopics = masteryData.data.map((item: MasteryApiItem, index: number) => {
              const palette = colorPalette[index % colorPalette.length];
              return {
                name: item.topic,
                cards: item.totalCards,
                mastered: item.masteredCards,
                pct: item.masteryPct,
                color: palette.color,
                ringColor: palette.ringColor
              };
            });
            setTopics(mappedTopics);
          }
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
        interface DecodedToken {
          sub?: string;
          nameid?: string;
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
        }
        const decoded = jwtDecode<DecodedToken>(token);
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
  const memberDays = user?.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const HERO_STATS = [
    { icon: <Zap className="w-4 h-4" />, label: "Mastered", val: currentStats.cardsMastered, suffix: "", color: "text-amber-400" },
    { icon: <Layers className="w-4 h-4" />, label: "Total Cards", val: currentStats.totalCards, suffix: "", color: "text-cyan-400" },
    { icon: <BookOpen className="w-4 h-4" />, label: "Decks Done", val: currentStats.decksCompleted, suffix: `/${currentStats.totalDecks}`, color: "text-green-400" },
    { icon: <Activity className="w-4 h-4" />, label: "This Week", val: currentStats.daysStudiedThisWeek, suffix: "/7", color: "text-red-400" },
  ];

  const achievements = [
    { icon: "🔥", label: "7-Day Streak", unlocked: (user?.streak?.currentStreak ?? 0) >= 7, color: "red" },
    { icon: "⚡", label: "First 100", unlocked: currentStats.cardsMastered >= 100, color: "amber" },
    { icon: "🎯", label: "Perfect Day", unlocked: currentStats.daysStudiedThisWeek >= 1, color: "cyan" },
    { icon: "💚", label: "Completionist", unlocked: currentStats.decksCompleted >= 5, color: "green" },
    { icon: "🚀", label: "Speed Learner", unlocked: currentStats.totalCards > 0 && (currentStats.cardsMastered / currentStats.totalCards) > 0.8, color: "amber" },
    { icon: "🏆", label: "Master", unlocked: overallMastery >= 90, color: "cyan" },
  ];

  const recentSessions = [
    { topic: "React Hooks", cards: 24, duration: 18, mastery: 85, date: "Today" },
    { topic: "TypeScript Generics", cards: 18, duration: 22, mastery: 72, date: "Yesterday" },
    { topic: "Database Design", cards: 32, duration: 35, mastery: 65, date: "2 days ago" },
  ];

  const studyGoals = [
    { goal: "Master 500 cards", progress: currentStats.cardsMastered, target: 500, icon: <Target className="w-4 h-4" />, color: "bg-amber-500", barColor: "bg-amber-500" },
    { goal: "Complete 10 decks", progress: currentStats.decksCompleted, target: 10, icon: <BookOpen className="w-4 h-4" />, color: "bg-green-500", barColor: "bg-green-500" },
    { goal: "Maintain 14-day streak", progress: user?.streak?.currentStreak ?? 0, target: 14, icon: <Flame className="w-4 h-4" />, color: "bg-red-500", barColor: "bg-red-500" },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full animate-spin border-4 border-slate-700 border-t-amber-500" />
          <p className="animate-pulse text-sm font-medium text-slate-500">loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-950 text-slate-100">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.07]">
        <div className="absolute top-0 -left-20 w-[36rem] h-[36rem] rounded-full blur-3xl animate-blob bg-amber-500" />
        <div className="absolute top-0 -right-20 w-[36rem] h-[36rem] rounded-full blur-3xl animate-blob animation-delay-2000 bg-cyan-500" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12 space-y-8">

        {/* PAGE HEADER */}
        <div className="flex items-center gap-2 px-1 text-amber-500" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-500" />
          {"// user.profile"}
        </div>

        {/* HERO SECTION */}
        <div className={`relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/60 backdrop-blur-xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-amber-500/10 via-transparent to-transparent" />
          <div className="absolute top-6 right-8 text-5xl font-bold select-none pointer-events-none hidden sm:block animate-float opacity-10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>∫∑∂</div>

          {/* Settings Button */}
          <button
            onClick={handleOpenSettings}
            className="absolute top-5 right-5 z-10 p-2 rounded-xl transition-all bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-500/50"
            title="Account Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-2xl shadow-amber-500/30">
                {user.username?.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-red-500 text-slate-950 border-2 border-slate-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                🔥 {user?.streak?.currentStreak}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-8 sm:pr-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
                  {user?.username}
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/40 text-cyan-300">
                  <Sparkles className="w-3 h-3" /> {user?.plan}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Calendar className="w-3 h-3" />, text: memberDays !== null ? `Member for ${memberDays} days` : "New member", iconColor: "text-cyan-400" },
                  { icon: <Trophy className="w-3 h-3" />, text: `Best streak: ${user?.streak?.maxStreak ?? 0} days`, iconColor: "text-amber-400" },
                ].map((b) => (
                  <span key={b.text} className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-400">
                    <span className={b.iconColor}>{b.icon}</span> {b.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Ring */}
            <div className="flex flex-col items-center gap-2 self-center">
              <Ring pct={overallMastery} size={110} stroke={9} color="#FFB84D" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>overall mastery</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="relative grid grid-cols-2 sm:grid-cols-4 border-t border-slate-700">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-6 py-4 flex items-center gap-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{
                  transitionDelay: `${200 + i * 80}ms`,
                  borderTop: i >= 2 ? "1px solid rgb(51, 65, 85)" : undefined,
                  borderLeft: i % 2 === 1 ? "1px solid rgb(51, 65, 85)" : i === 2 || i === 3 ? undefined : undefined,
                }}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-800 ${s.color}`}>{s.icon}</div>
                <div>
                  <div className="text-xl font-black leading-none text-slate-100" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <Counter value={s.val} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mt-0.5 text-slate-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasPremiumAccess ? (
          <>
            {/* STUDY GOALS SECTION */}
            <section>
              <div className="flex items-center gap-2 px-1 mb-4 text-cyan-500" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em" }}>
                <Target className="w-4 h-4" />
                {"// learning.goals"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {studyGoals.map((goal, i) => {
                  const progressPct = Math.min((goal.progress / goal.target) * 100, 100);
                  return (
                    <div key={i} className="rounded-xl p-4 border border-slate-700 bg-slate-900 hover:border-slate-600 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={goal.color + " text-slate-950"}>{goal.icon}</span>
                        <span className="font-semibold text-sm text-slate-100">{goal.goal}</span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-slate-400">{goal.progress}/{goal.target}</span>
                          <span className={`text-xs font-bold ${goal.barColor.replace("bg-", "text-")}`}>{Math.round(progressPct)}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-slate-800">
                          <div
                            className={`h-full ${goal.barColor} transition-all duration-300`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{goal.target - goal.progress} to go</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ACHIEVEMENTS SECTION */}
            <section>
              <div className="flex items-center gap-2 px-1 mb-4 text-amber-500" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em" }}>
                <Award className="w-4 h-4" />
                {"// achievements"}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {achievements.map((achievement, i) => (
                  <div key={i}>
                    <AchievementBadge
                      icon={achievement.icon}
                      label={achievement.label}
                      unlocked={achievement.unlocked}
                      color={achievement.color}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* STUDY PATTERNS & RECOMMENDATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Study Sessions */}
              <section>
                <div className="flex items-center gap-2 px-1 mb-4 text-green-500" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em" }}>
                  <Clock className="w-4 h-4" />
                  {"// recent.sessions"}
                </div>
                <div className="rounded-xl p-4 space-y-3 border border-slate-700 bg-slate-900">
                  {recentSessions.map((session, i) => (
                    <StudySessionCard key={i} {...session} />
                  ))}
                </div>
              </section>

              {/* Recommended Topics */}
              <section>
                <div className="flex items-center gap-2 px-1 mb-4 text-red-500" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em" }}>
                  <TrendingUp className="w-4 h-4" />
                  {"// suggestions"}
                </div>
                <div className="rounded-xl p-4 space-y-3 border border-slate-700 bg-slate-900">
                  {[
                    { topic: "Advanced TypeScript", reason: "Based on your React progress", difficulty: "Expert", diffColor: "bg-red-500/10 border-red-500/40 text-red-300" },
                    { topic: "Web Performance", reason: "Complements your frontend skills", difficulty: "Intermediate", diffColor: "bg-cyan-500/10 border-cyan-500/40 text-cyan-300" },
                    { topic: "System Design", reason: "Next step after databases", difficulty: "Advanced", diffColor: "bg-amber-500/10 border-amber-500/40 text-amber-300" },
                  ].map((rec, i) => (
                    <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-slate-100">{rec.topic}</div>
                        <div className="text-xs mt-1 text-slate-400">{rec.reason}</div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${rec.diffColor}`}>{rec.difficulty}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Premium Features */}
            <StudyHeatmap
              userId={userId}
              currentStreak={user?.streak?.currentStreak ?? 0}
            />
            <TopicMastery topics={topics} />
          </>
        ) : (
          <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-slate-900/40 backdrop-blur-md p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-0 pointer-events-none" />
            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700/50">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">Unlock Advanced Analytics</h3>
              <p className="text-slate-400 text-sm">
                Upgrade to Core or Pro to see your study heatmap, topic mastery breakdowns, learning goals, achievements, and detailed statistics.
              </p>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/25"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS MODAL */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
                <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" /> Account Settings
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-100 transition-colors bg-slate-800/50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-6 pt-4 gap-4 border-b border-slate-800 overflow-x-auto no-scrollbar">
                {[
                  { id: 'profile', icon: UserIcon, label: 'Profile' },
                  { id: 'email', icon: Mail, label: 'Email' },
                  { id: 'password', icon: Key, label: 'Security' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setMessage({ type: "", text: "" }); }}
                    className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-amber-500 text-amber-400"
                        : "border-transparent text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                {/* Messages */}
                {message.text && (
                  <div className={`mb-6 p-3 rounded-xl text-sm font-semibold border ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* TAB: PROFILE */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleUpdateUsername} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full py-3 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-all"
                    >
                      {isUpdating ? "Saving..." : "Update Profile"}
                    </button>
                  </form>
                )}

                {/* TAB: EMAIL */}
                {activeTab === 'email' && (
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <p className="text-xs text-slate-400 mb-4">To change your email address, you must confirm with your current password.</p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Email Address</label>
                      <input
                        type="email"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                      <input
                        type="password"
                        value={emailForm.currentPassword}
                        onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full py-3 rounded-xl text-sm font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 transition-all"
                    >
                      {isUpdating ? "Updating..." : "Update Email"}
                    </button>
                  </form>
                )}

                {/* TAB: PASSWORD */}
                {activeTab === 'password' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          minLength={6}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                          minLength={6}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full py-3 rounded-xl text-sm font-bold text-slate-950 bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-900/20"
                    >
                      {isUpdating ? "Saving..." : "Change Password"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
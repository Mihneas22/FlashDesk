"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy, Zap, BookOpen, Activity,
  Layers, Calendar, Sparkles, X,
  Settings, User as UserIcon, Mail, Key, Lock, ArrowUpRight,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { User, MappedTopic } from "../../lib/store";
import { StudyHeatmap } from "../../components/heatmap";
import { Navbar } from "@/components/navbar";
import { TopicMastery } from "@/components/topic-mastery";
import { Ring } from "@/components/ui/ring";
import { useInView } from "@/hooks/use-in-view";

/* ─── LearnQHub design tokens (shared with the landing page) ─── */
const C = {
  bg0: "#0F1419",
  bg1: "#1A1F2E",
  bg2: "#252D3D",
  amber: "#FFB84D",
  amberD: "#E69B00",
  cyan: "#00D9FF",
  text: "#E8EAED",
  muted: "#7A8394",
  border: "#2A3142",
  green: "#4ADE80",
  red: "#FF6B6B",
} as const;
const MONO = "'JetBrains Mono', monospace";

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
          else
          {
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
                            { color: "from-[#FFB84D] to-[#E69B00]", ringColor: C.amber },
                            { color: "from-[#00D9FF] to-[#00B8D4]", ringColor: C.cyan },
                            { color: "from-[#4ADE80] to-[#16A34A]", ringColor: C.green },
                            { color: "from-[#FF6B6B] to-[#DC2626]", ringColor: C.red },
                            { color: "from-[#FFD08A] to-[#FFB84D]", ringColor: "#FFD08A" },
                            { color: "from-[#67E8F9] to-[#00D9FF]", ringColor: "#67E8F9" },
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
      { icon: <Zap className="w-4 h-4" style={{ color: C.amber }} />,      label: "Cards Mastered",   val: currentStats.cardsMastered, suffix: "" },
      { icon: <Layers className="w-4 h-4" style={{ color: C.cyan }} />,    label: "Total Cards",      val: currentStats.totalCards,    suffix: "" },
      { icon: <BookOpen className="w-4 h-4" style={{ color: C.green }} />, label: "Decks Completed",  val: currentStats.decksCompleted, suffix: `/${currentStats.totalDecks}` },
      { icon: <Activity className="w-4 h-4" style={{ color: C.amber }} />, label: "This Week",        val: currentStats.daysStudiedThisWeek, suffix: "/7 days" },
  ];

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg0 }}>
              <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full animate-spin" style={{ border: `3px solid ${C.border}`, borderTopColor: C.amber }} />
                <p className="animate-pulse text-sm font-medium" style={{ color: C.muted, fontFamily: MONO }}>loading profile…</p>
              </div>
            </div>
        );
    }
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: C.bg0, color: C.text, fontFamily: "'Inter', sans-serif" }}>

      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.07]">
        <div className="absolute top-0 -left-20 w-[36rem] h-[36rem] rounded-full blur-3xl animate-blob" style={{ background: C.amber }} />
        <div className="absolute top-0 -right-20 w-[36rem] h-[36rem] rounded-full blur-3xl animate-blob animation-delay-2000" style={{ background: C.cyan }} />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12 space-y-6">

        {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-1" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.amber }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
          {"// user.profile"}
        </div>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <div className={`relative rounded-2xl overflow-hidden transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ border: `1px solid ${C.border}`, background: `${C.bg1}99`, backdropFilter: "blur(12px)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${C.amber}14, transparent 55%)` }} />
          {/* Decorative float formula — echoes the landing page's floating math motif */}
          <div className="absolute top-6 right-8 text-5xl font-bold select-none pointer-events-none hidden sm:block animate-float" style={{ color: `${C.amber}1a`, fontFamily: MONO }}>
            ∫∑∂
          </div>

          {/* Settings — top-right corner, out of the identity row */}
          <button
            onClick={handleOpenSettings}
            className="absolute top-5 right-5 z-10 p-2 rounded-xl transition-all"
            style={{ background: `${C.bg2}99`, border: `1px solid ${C.border}`, color: C.muted }}
            onMouseEnter={e => { e.currentTarget.style.color = C.amber; e.currentTarget.style.borderColor = `${C.amber}4d`; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
            title="Account Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black" style={{ background: C.amber, color: C.bg0, boxShadow: `0 20px 40px -12px ${C.amber}40` }}>
                {user.username?.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full" style={{ background: C.amber, color: C.bg0, border: `2px solid ${C.bg1}`, fontFamily: MONO }}>
                🔥 {user?.streak?.currentStreak}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-8 sm:pr-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${C.amber}, ${C.cyan})` }}>
                  {user?.username}
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${C.cyan}1a`, border: `1px solid ${C.cyan}4d`, color: C.cyan }}>
                  <Sparkles className="w-3 h-3" /> {user?.plan}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Calendar className="w-3 h-3" style={{ color: C.cyan }} />, text: memberDays !== null ? `Member for ${memberDays} days` : "New member" },
                  { icon: <Trophy className="w-3 h-3" style={{ color: C.amber }} />,   text: `Best streak: ${user?.streak?.maxStreak ?? 0} days` },
                ].map((b) => (
                  <span key={b.text} className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5" style={{ background: `${C.bg2}b3`, border: `1px solid ${C.border}`, color: C.muted }}>
                    {b.icon} {b.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Ring */}
            <div className="flex flex-col items-center gap-2 self-center">
              <Ring pct={overallMastery} size={110} stroke={9} color={C.amber} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted, fontFamily: MONO }}>overall mastery</span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative grid grid-cols-2 sm:grid-cols-4" style={{ borderTop: `1px solid ${C.border}` }}>
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-6 py-4 flex items-center gap-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{
                  transitionDelay: `${200 + i * 80}ms`,
                  borderTop: i >= 2 ? `1px solid ${C.border}` : undefined,
                  borderLeft: i % 2 === 1 ? `1px solid ${C.border}` : i === 2 || i === 3 ? undefined : undefined,
                  borderRight: undefined,
                }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.bg2}99` }}>{s.icon}</div>
                <div>
                  <div className="text-xl font-black leading-none" style={{ color: C.text, fontFamily: MONO }}>
                    <Counter value={s.val} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: C.muted }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasPremiumAccess ? (
          <>
            <StudyHeatmap
              userId={userId}
              currentStreak={user?.streak?.currentStreak ?? 0}
            />
            <TopicMastery topics={topics} />
          </>
        ) : (
          <div className="relative rounded-3xl overflow-hidden border border-gray-800/60 bg-gray-900/40 backdrop-blur-md p-8 sm:p-12 flex flex-col items-center justify-center text-center">
             <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-0 pointer-events-none" />
             
             <div className="relative z-10 max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700/50">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold text-white">Unlock Advanced Analytics</h3>
                <p className="text-gray-400 text-sm">
                  Upgrade to Core or Pro to see your study heatmap, topic mastery breakdowns, and detailed learning statistics.
                </p>
                <button 
                  onClick={() => window.location.href = '/pricing'} 
                  className="mt-4 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/25"
                >
                  Upgrade Now
                </button>
             </div>
          </div>
        )}

        {/* ── SETTINGS MODAL ────────────────────────────────────────────── */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-lg bg-gray-900 border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-violet-400" /> Account Settings
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-gray-400 hover:text-white transition-colors bg-gray-800/50 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex px-6 pt-4 gap-4 border-b border-gray-800 overflow-x-auto no-scrollbar">
                {[
                  { id: 'profile', icon: UserIcon, label: 'Profile' },
                  { id: 'email', icon: Mail, label: 'Email' },
                  { id: 'password', icon: Key, label: 'Security' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setMessage({type:"", text:""}); }}
                    className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? "border-violet-500 text-violet-400" 
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                {/* Afișare mesaje */}
                {message.text && (
                  <div className={`mb-6 p-3 rounded-xl text-sm font-semibold border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {message.text}
                  </div>
                )}

                {/* TAB: PROFILE */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleUpdateUsername} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                      <input 
                        type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                      />
                    </div>
                    <button type="submit" disabled={isUpdating} className="w-full py-3 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-all">
                      {isUpdating ? "Saving..." : "Update Profile"}
                    </button>
                  </form>
                )}

                {/* TAB: EMAIL */}
                {activeTab === 'email' && (
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <p className="text-xs text-gray-500 mb-4">To change your email address, you must confirm with your current password.</p>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Email Address</label>
                      <input 
                        type="email" value={emailForm.newEmail} onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})} required
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                      <input 
                        type="password" value={emailForm.currentPassword} onChange={(e) => setEmailForm({...emailForm, currentPassword: e.target.value})} required
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                    <button type="submit" disabled={isUpdating} className="w-full py-3 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-all">
                      {isUpdating ? "Updating..." : "Update Email"}
                    </button>
                  </form>
                )}

                {/* TAB: PASSWORD */}
                {activeTab === 'password' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                      <input 
                        type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                        <input 
                          type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength={6}
                          className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:border-violet-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm New</label>
                        <input 
                          type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required minLength={6}
                          className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:border-violet-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={isUpdating} className="w-full py-3 mt-2 rounded-xl text-sm font-bold text-white bg-red-600/90 hover:bg-red-500 disabled:opacity-50 transition-all shadow-lg shadow-red-900/20">
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
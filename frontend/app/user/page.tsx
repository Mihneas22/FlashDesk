"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy, Zap, BookOpen, Star, Target, TrendingUp,
  Clock, Award, Activity,
  CheckCircle, Layers, Calendar, Sparkles, Edit2, X,
  Settings, User as UserIcon, Mail, Key // <-- Iconițe noi
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { User } from '../../lib/store';
import { StudyHeatmap } from "../../components/heatmap";
import { Navbar } from "@/components/navbar";
import { MappedTopic } from "../../lib/store";
import { TopicMastery } from "@/components/topic-mastery";
import { Ring } from "@/components/ui/ring";
import { useInView } from "@/hooks/use-in-view";

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
                            { color: "from-violet-500 to-purple-600", ringColor: "#8b5cf6" },
                            { color: "from-fuchsia-500 to-pink-600", ringColor: "#d946ef" },
                            { color: "from-cyan-500 to-blue-600", ringColor: "#06b6d4" },
                            { color: "from-amber-500 to-orange-600", ringColor: "#f59e0b" },
                            { color: "from-emerald-500 to-teal-600", ringColor: "#10b981" },
                            { color: "from-rose-500 to-red-600", ringColor: "#f43f5e" },
                        ];

                        const mappedTopics = masteryData.data.map((item: any, index: number) => {
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

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

      <Navbar isLoggedIn={isLoggedIn} />

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
                {user.username?.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-orange-900/50 border-2 border-gray-950">
                🔥 {user?.streak?.currentStreak}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  {user?.username}
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold">
                  <Sparkles className="w-3 h-3" /> {user?.plan}
                </span>
                <button 
                  onClick={handleOpenSettings}
                  className="ml-2 p-2 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-violet-500/20 hover:border-violet-500/30 transition-all shadow-sm"
                  title="Account Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Calendar className="w-3 h-3 text-purple-400" />, text: `Member for ${Math.floor((new Date().getTime() - new Date(user?.createdAt!).getTime()) / (1000 * 60 * 60 * 24))+1} days` },
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
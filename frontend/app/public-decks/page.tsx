"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, Sparkles, BookOpen, Trophy, Zap, AlertCircle, CheckCircle, X,
  TrendingUp, Clock, Users, Target, Star, Flame, ArrowRight, Filter
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { DeckCard } from "@/components/deck-card";
import { jwtDecode } from "jwt-decode";
import { Footer } from "@/components/footer";

const TOPICS = [
  "Mathematical Analysis",
  "Physics",
  "C++ / Computer Programming",
  "Special Mathematics",
  "Numerical Methods",
  "Data Structures",
  "Discrete Mathematics",
  "Electrical Engineering",
  "Linear Algebra",
  "Basics of Computer Operation",
  "Object-oriented programming",
  "Assembly language programming",
  "Others"
];

const DIFFICULTY_LEVELS = [
  { label: "Beginner", value: "beginner", color: "from-green-500 to-green-600" },
  { label: "Intermediate", value: "intermediate", color: "from-amber-500 to-amber-600" },
  { label: "Advanced", value: "advanced", color: "from-red-500 to-red-600" },
  { label: "Expert", value: "expert", color: "from-cyan-500 to-cyan-600" },
];

// Mock trending decks
const MOCK_TRENDING_DECKS = [
  { id: 1, title: "React Hooks Mastery", creator: "Sarah Chen", cards: 245, difficulty: "intermediate", trending: 1, color: "from-cyan-500/20 to-blue-500/20" },
  { id: 2, title: "System Design Patterns", creator: "Alex Kumar", cards: 189, difficulty: "advanced", trending: 2, color: "from-amber-500/20 to-orange-500/20" },
  { id: 3, title: "Database Optimization", creator: "Jordan Lee", cards: 267, difficulty: "advanced", trending: 3, color: "from-red-500/20 to-rose-500/20" },
];

// Mock recent decks
const MOCK_RECENT_DECKS = [
  { id: 4, title: "TypeScript Advanced Types", creator: "Emma Davis", cards: 142, postedTime: "2 hours ago", difficulty: "intermediate" },
  { id: 5, title: "Web Performance Tips", creator: "Mike Johnson", cards: 98, postedTime: "5 hours ago", difficulty: "beginner" },
  { id: 6, title: "Cloud Architecture", creator: "Lisa Wong", cards: 203, postedTime: "1 day ago", difficulty: "advanced" },
];

// Mock top creators
const MOCK_TOP_CREATORS = [
  { id: 1, name: "Sarah Chen", decks: 24, followers: 1250, cards: 3420, avatar: "🧠" },
  { id: 2, name: "Alex Kumar", decks: 18, followers: 980, cards: 2890, avatar: "💻" },
  { id: 3, name: "Jordan Lee", decks: 15, followers: 750, cards: 2340, avatar: "🚀" },
  { id: 4, name: "Emma Davis", decks: 22, followers: 890, cards: 3100, avatar: "⭐" },
  { id: 5, name: "Mike Johnson", decks: 12, followers: 620, cards: 1950, avatar: "🔥" },
];
type ToastState = {
    show: boolean;
    message: string;
    type: "error" | "success";
  };

export default function PublicDecksPage() {
  const [publicDecks, setPublicDecks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">("recent");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [toast, setToast] = useState<ToastState>({ 
    show: false, 
    message: "", 
    type: "error" 
  });

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
  }, []);
  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  const fetchSearchDeck = useCallback(async () => {
    const query = search.trim();
    const isPublic = true;
    try {
      setLoading(true);
      const url = new URL("https://learnqhub.com/api/deck/getDecksByName");
      url.searchParams.append("Name", query);
      url.searchParams.append("Status", isPublic.toString());

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.flag) {
        const rawData = data.deck ? [data.deck] : (data.decks || []);
        const mapped = rawData.map((d: any) => ({
          ...d,
          id: d.id || d.deckId,
          cards: d.deckCards || d.cards || []
        }));
        setPublicDecks(mapped);
      } else {
        setPublicDecks([]);
      }
    } catch (error) {
      console.error("Failed to fetch decks:", error);
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  const fetchPublicDecks = useCallback(async (filterText: string) => {
    const safeFilter = filterText === "All Topics" ? "all" : filterText;
    try {
      setLoading(true);
      const response = await fetch(
        `https://learnqhub.com/api/deck/getPublicDecks?filter=${encodeURIComponent(safeFilter)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.flag || data.success) {
          const rawDecks = data.decks || [];
          const mappedDecks = rawDecks.map((d: any) => ({
            ...d,
            id: d.id || d.deckId,
            cards: d.deckCards || []
          }));
          setPublicDecks(mappedDecks);
        }
      } else {
        showToast("Failed to load decks.", "error");
      }
    } catch (error) {
      showToast("Network error.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded) setIsLoggedIn(true);
      } catch (e) { setIsLoggedIn(false); }
    }
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      fetchPublicDecks(selectedTopic);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchSearchDeck();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedTopic, fetchSearchDeck, fetchPublicDecks]);

  const displayDecks = search.trim() ? publicDecks : publicDecks.filter(d =>
    (selectedTopic === "All Topics" || d.topic === selectedTopic)
  );

  const totalCards = publicDecks.reduce((acc, d) => acc + (d.cards?.length || 0), 0);
  const totalDecks = publicDecks.length;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 -z-10 opacity-[0.08] pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-500 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 space-y-12">

        {/* HERO SECTION */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-float">
                  <BookOpen className="w-6 h-6 text-slate-950 font-bold" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-amber-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                  Explore Public Decks
                </h1>
              </div>
              <p className="text-lg text-slate-400 ml-16">
                Discover flashcards created by the community
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-md shadow-lg border border-amber-500/30 hover:scale-105 transition-transform hover:border-amber-500/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">{totalDecks}</div>
                  <div className="text-xs text-slate-400 font-medium">Decks</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-md shadow-lg border border-cyan-500/30 hover:scale-105 transition-transform hover:border-cyan-500/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">{totalCards}</div>
                  <div className="text-xs text-slate-400 font-medium">Cards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-8 space-y-4">
            {/* Main Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-64 relative">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full h-14 px-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700 text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 shadow-lg transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="All Topics" className="bg-slate-900 text-slate-100">All Topics</option>
                  {TOPICS.map((topic) => (
                    <option key={topic} value={topic} className="bg-slate-900 text-slate-100">
                      {topic}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search public decks..."
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 shadow-lg transition-all font-medium"
                />
              </div>
            </div>

            {/* Difficulty & Sort Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2 flex-wrap">
                {DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedDifficulty(level.value)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedDifficulty === level.value
                        ? `bg-gradient-to-r ${level.color} text-slate-950 shadow-lg`
                        : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>

              <div className="sm:ml-auto flex gap-2">
                {(["recent", "popular", "trending"] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      sortBy === sort
                        ? "bg-amber-500/20 border border-amber-500 text-amber-300"
                        : "bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TRENDING SECTION */}
        {!search && (
          <section className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-black text-slate-100">Trending This Week</h2>
              <span className="ml-auto text-sm text-slate-400">Top picks from the community</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_TRENDING_DECKS.map((deck, idx) => (
                <div
                  key={deck.id}
                  className={`group relative rounded-2xl border border-slate-700 bg-gradient-to-br ${deck.color} hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer overflow-hidden`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    #{deck.trending}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                        ⭐
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-100 truncate">{deck.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">by {deck.creator}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                      <div className="text-sm">
                        <div className="font-bold text-slate-100">{deck.cards}</div>
                        <div className="text-xs text-slate-400">cards</div>
                      </div>
                      <div className={`ml-auto px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${
                        deck.difficulty === "beginner" ? "from-green-500/20 to-green-600/20 text-green-300" :
                        deck.difficulty === "intermediate" ? "from-amber-500/20 to-amber-600/20 text-amber-300" :
                        "from-red-500/20 to-red-600/20 text-red-300"
                      }`}>
                        {deck.difficulty.charAt(0).toUpperCase() + deck.difficulty.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RECENT DECKS SECTION */}
        {!search && (
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-black text-slate-100">Recently Added</h2>
              <span className="ml-auto text-sm text-slate-400">Fresh content from creators</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_RECENT_DECKS.map((deck) => (
                <div
                  key={deck.id}
                  className="group relative rounded-2xl border border-slate-700 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                      📚
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">{deck.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{deck.postedTime}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 mb-4">by {deck.creator}</p>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                    <div className="text-sm">
                      <div className="font-bold text-slate-100">{deck.cards}</div>
                      <div className="text-xs text-slate-500">cards</div>
                    </div>
                    <button className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-500/50 transition-all">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TOP CREATORS LEADERBOARD */}
        {!search && (
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-black text-slate-100">Top Creators</h2>
              <span className="ml-auto text-sm text-slate-400">Most active community members</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {MOCK_TOP_CREATORS.map((creator, idx) => (
                <div
                  key={creator.id}
                  className="rounded-2xl border border-slate-700 bg-slate-900/40 hover:border-green-500/50 hover:bg-slate-900/60 transition-all p-5 text-center cursor-pointer group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{creator.avatar}</div>
                  <h3 className="font-bold text-slate-100 mb-1 text-sm">{creator.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">{creator.followers} followers</p>

                  <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-slate-700/50">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{creator.decks}</div>
                      <div className="text-xs text-slate-500">decks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{creator.cards}</div>
                      <div className="text-xs text-slate-500">cards</div>
                    </div>
                  </div>

                  <button className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-green-500/20 border border-green-500/30 text-green-300 hover:border-green-500/50 transition-all">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MAIN DECKS GRID */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black text-slate-100">
              {search ? `Search Results (${displayDecks.length})` : "All Public Decks"}
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-700 border-t-amber-500 animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-amber-500 animate-pulse" />
              </div>
              <p className="mt-6 text-lg font-semibold text-slate-400">Loading public decks...</p>
            </div>
          ) : displayDecks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
              {displayDecks.map((deck, index) => (
                <div
                  key={deck.id}
                  style={{ animationDelay: `${index * 75}ms` }}
                  className="animate-slide-up"
                >
                  <DeckCard deck={deck} usId={"empty"} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6 bg-slate-900/30 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center shadow-inner">
                  <Search className="w-16 h-16 text-slate-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                  <Sparkles className="w-6 h-6 text-slate-950" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-100 mb-2">No matching decks found</p>
              <p className="text-slate-400 text-center max-w-sm">
                {search || selectedTopic !== "All Topics"
                  ? "Try adjusting your search or topic filter to find what you're looking for."
                  : "No public decks are available right now."}
              </p>
            </div>
          )}
        </section>

        {/* LEARNING PATHS SECTION */}
        {!search && (
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-black text-slate-100">Curated Learning Paths</h2>
              <span className="ml-auto text-sm text-slate-400">Structured learning journeys</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Full Stack Web Development", decks: 8, cards: 1240, level: "Intermediate", progress: 35 },
                { title: "Competitive Programming", decks: 6, cards: 980, level: "Advanced", progress: 60 },
              ].map((path, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900/60 to-slate-800/40 hover:border-red-500/50 transition-all p-6 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-100 mb-1 group-hover:text-red-300 transition-colors">{path.title}</h3>
                      <p className="text-sm text-slate-400">{path.decks} decks • {path.cards} cards</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300">
                      {path.level}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span className="text-slate-100 font-bold">{path.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/20 border border-red-500/30 text-red-300 hover:border-red-500/50 transition-all flex items-center justify-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* COMMUNITY HIGHLIGHTS */}
        {!search && (
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-black text-slate-100">Community Highlights</h2>
              <span className="ml-auto text-sm text-slate-400">Most recommended this month</span>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  { icon: "🎯", label: "Highest Rated", value: "4.9/5", desc: "Average rating" },
                  { icon: "🚀", label: "Most Studied", value: "12.5K", desc: "Students this month" },
                  { icon: "💡", label: "Best Updated", value: "45 new", desc: "Decks added today" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-100 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        <Footer />
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up transition-all ${
          toast.type === "error"
            ? "bg-red-950/90 border-red-500/50 text-red-200"
            : "bg-green-950/90 border-green-500/50 text-green-200"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          <p className="font-semibold text-sm mr-2">{toast.message}</p>
          <button
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className={`p-1 rounded-lg transition-colors ${
              toast.type === "error" ? "hover:bg-red-900/50" : "hover:bg-green-900/50"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out backwards;
        }
      `}</style>
    </div>
  );
}
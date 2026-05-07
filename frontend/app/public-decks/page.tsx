"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Sparkles, BookOpen, Trophy, Zap, AlertCircle, CheckCircle, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { DeckCard } from "@/components/deck-card";
import { jwtDecode } from "jwt-decode";

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

export default function PublicDecksPage() {
  const [publicDecks, setPublicDecks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  const fetchSearchDeck = useCallback(async () =>{
      const query = search.trim();
      try {
        setLoading(true);
        const res = await fetch(`https://learnqhub.com/api/deck/getDecksByName/${encodeURIComponent(query)}`, {
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
  }, [search])

  const fetchPublicDecks = useCallback(async (filterText: string) => {
    const safeFilter = filterText === "All Topics" ? "all" : encodeURIComponent(filterText);
    
    try {
      setLoading(true);
      const response = await fetch(`https://learnqhub.com/api/deck/getPublicDecks/${safeFilter}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

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
        console.error(" from the server.:", response.statusText);
        setPublicDecks([]);
        showToast("Failed to load decks from the server.", "error");
      }
    } catch (error) {
      console.error("Failed to fetch public decks:", error);
      setPublicDecks([]);
      showToast("Network error. Could not connect to the server.", "error");
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
    selectedTopic === "All Topics" || d.topic === selectedTopic
  );

  const totalCards = publicDecks.reduce((acc, d) => acc + d.cards.length, 0);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100">
      {/* Animated gradient background - Dark mode optimized */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Stats Section */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50 animate-float">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Explore Public Decks
                </h1>
              </div>
              <p className="text-lg text-gray-400 ml-16">
                Discover flashcards created by the community
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900/60 backdrop-blur-md shadow-lg border border-purple-500/20 hover:scale-105 transition-transform hover:border-purple-500/40">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{publicDecks.length}</div>
                  <div className="text-xs text-gray-400 font-medium">Decks</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900/60 backdrop-blur-md shadow-lg border border-cyan-500/20 hover:scale-105 transition-transform hover:border-cyan-500/40">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalCards}</div>
                  <div className="text-xs text-gray-400 font-medium">Cards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="sm:w-64 relative group">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-purple-500/30 text-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 shadow-lg transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="All Topics" className="bg-gray-900 text-white">All Topics</option>
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic} className="bg-gray-900 text-white">
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search public decks..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-purple-500/30 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 shadow-lg transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Decks Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-purple-500 animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-500 animate-pulse" />
            </div>
            <p className="mt-6 text-lg font-semibold text-gray-400">Loading public decks...</p>
          </div>
        ) : displayDecks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
            {displayDecks.map((deckList, index) => (
              <div
                key={deckList.id}
                style={{ animationDelay: `${index * 75}ms` }}
                className="animate-slide-up"
              >
                <DeckCard deck={deckList} usId={"empty"}/>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-gray-900/30 rounded-3xl border border-gray-800/50 backdrop-blur-sm mt-8">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-3xl bg-gray-800/50 border border-gray-700 flex items-center justify-center shadow-inner">
                <Search className="w-16 h-16 text-gray-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50 animate-bounce">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              No matching decks found
            </p>
            <p className="text-gray-400 text-center max-w-sm">
              {search || selectedTopic !== "All Topics" 
                ? "Try adjusting your search or topic filter to find what you're looking for." 
                : "No public decks are available right now."}
            </p>
          </div>
        )}
      </main>

      {/* Global Toast Notification */}
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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
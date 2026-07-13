"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2, Sparkles, BookOpen, Trophy, Zap, FileText, CheckCircle, AlertCircle, X, Flame } from "lucide-react";
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

const STATUS = [
  "Private",
  "Public"
];

export default function DashboardPage() {
  const [decks, setDecks] = useState<any[]>([]);
  
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newStatus, setNewStatus] = useState("");
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setNewUserId] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const [streakDays, setStreakDays] = useState(0);

  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://learnqhub.com/api/deck/getDecksByUser`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            if (data.flag !== false && data.success !== false) {
              const rawDecks = data.decks || (Array.isArray(data) ? data : []);
              const mappedDecks = rawDecks.map((d: any) => ({
                ...d,
                id: d.id || d.deckId,
                cards: d.deckCards || []
              }));
              setDecks(mappedDecks); 
            } else {
              showToast(data.message || "Failed to fetch decks.", "error");
            }
          } catch (e) {
             console.error("Failed to parse fetch decks response");
          }
        }
      } else {
        showToast("Server encountered an error while fetching decks.", "error");
      }
    } catch (error) {
      console.error("Failed to fetch decks:", error);
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateUserStreak = useCallback(async () => {
    try {
      const response = await fetch(`https://learnqhub.com/api/user/updateStreak`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        if (data.flag && data.currentStreak !== undefined) {
           setStreakDays(data.currentStreak);
        } else {
           console.log("Streak response:", data);
        }
      }
    } catch (error) {
      console.error("Failed to update streak:", error);
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
          fetchDecks();
          updateUserStreak();
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
  }, [fetchDecks, updateUserStreak]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get("success") === "true") {
      showToast("Payment was successful! Your account has been updated. Please login again!", "success");
      window.history.replaceState(null, '', window.location.pathname);
      
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
      }, 3000); 
    }

    if (params.get("canceled") === "true") {
      showToast("The payment was canceled.", "error");
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [showToast]);

  const filtered = decks.filter(
    (d) =>
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setGenerationSuccess(false);
      setGeneratedCards([]);
    }
  };

  const handleGenerateFromPdf = async () => {
    if (!pdfFile) return;

    setIsGeneratingCards(true);
    setGenerationSuccess(false);

    try {
      const formData = new FormData();
      formData.append("pdfFile", pdfFile);

      const response = await fetch("https://learnqhub.com/api/deck/generateFlashcards", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const rawText = await response.text();
        
        let cleanText = rawText;
        const firstIndex = cleanText.indexOf('[');
        const lastIndex = cleanText.lastIndexOf(']');
        
        if (firstIndex !== -1 && lastIndex !== -1) {
          cleanText = cleanText.substring(firstIndex, lastIndex + 1);
        }

        let data;
        try {
          data = JSON.parse(cleanText);
        } catch (err) {
          console.error("Error parsing JSON. The extracted text was:", cleanText);
          showToast("The API generated an incomplete or invalid response. Please try again.", "error");
          setIsGeneratingCards(false);
          return;
        }
        
        const parsedCards = typeof data === 'string' ? JSON.parse(data) : data;
        const cardsArray = Array.isArray(parsedCards) ? parsedCards : (parsedCards.cards || []);
        
        setGeneratedCards(cardsArray);
        setGenerationSuccess(true);
        showToast("Flashcards generated successfully!", "success");
      } else if (response.status === 429){
        showToast("You have reached your AI usage limit! Upgrade to a higher plan to generate more flashcards.", "error");
      }else {
        console.error("Error generating cards:", await response.text());
        showToast("Failed to generate cards from the PDF.", "error");
      }
    } catch (error) {
      console.error("Network error during generation:", error);
      showToast("Network error. Please check your connection and try again.", "error");
    } finally {
      setIsGeneratingCards(false);
    }
  };

  async function handleCreate() {
    if (!newTitle.trim() || !userId || !newTopic) return;

    const deckDto = {
      title: newTitle.trim(),
      description: newDesc.trim() || "No description",
      topic: newTopic.trim(),
      status: newStatus.trim(),
      cards: (generatedCards || []).map(card => ({
          question: card.question || "", 
          answer: card.answer || "",
          tips: card.tips || [],
          graphConfig: card.viewConfig || null 
      }))
    };

    try {
      const response = await fetch("https://learnqhub.com/api/deck/addDeck", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deckDto),
      });

      if (response.ok) {
        const text = await response.text();
        let isSuccess = true;
        let errorMessage = "Could not create the deck.";

        if (text) {
          try {
            const result = JSON.parse(text);
            if (result.success === false || result.flag === false) {
              isSuccess = false;
              errorMessage = result.message || errorMessage;
            }
          } catch (e) {
          }
        }

        if (isSuccess) {
          fetchDecks();
          setNewTitle("");
          setNewDesc("");
          setNewTopic("");
          setShowCreateModal(false);
          setGeneratedCards([]);
          showToast("Deck created successfully!", "success");
        } else {
          showToast(errorMessage, "error");
        }
      } else {
        showToast("Server encountered an error while creating the deck.", "error");
      }
    } catch (error) {
      console.error("Network error:", error);
      showToast("Network error. Please check your connection.", "error");
    }
  }

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20">
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
                  My Study Decks
                </h1>
              </div>
              <p className="text-lg text-gray-400 ml-16">
                Your personal flashcard collection
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              {/* STREAK UI - The psychological retention engine */}
              <button 
                  onClick={() => {
                    updateUserStreak();
                    showToast(`Your current streak is ${streakDays} days! Keep it up! 🔥`, "success");
                  }}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900/80 backdrop-blur-md border transition-all duration-500 relative overflow-hidden group active:scale-95
                    ${streakDays > 0 
                      ? "border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)] cursor-pointer" 
                      : "border-gray-700 shadow-none grayscale opacity-70 cursor-help"}`}
                >
                  {/* Background Glow Effect - se activează la streak mare */}
                  {streakDays >= 3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-transparent animate-pulse" />
                  )}
                  
                  {/* Icon Container */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 
                    ${streakDays > 0 
                      ? "bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-900/50" 
                      : "bg-gray-800 shadow-none"}`}>
                    <Flame className={`w-5 h-5 text-white ${streakDays > 0 ? "animate-pulse" : ""}`} />
                  </div>

                  {/* Text Info */}
                  <div className="flex flex-col justify-center relative z-10 text-left">
                    <div className={`text-2xl font-black leading-none mb-1 transition-colors
                      ${streakDays > 0 
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500" 
                        : "text-gray-500"}`}>
                      {streakDays}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                      {streakDays === 1 ? "Day Streak" : "Days Streak"}
                    </div>
                  </div>

                  {/* Mic indicator de "Keep it up" (Punctul pulsatoriu) */}
                  {streakDays > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </span>
                    </div>
                  )}
                </button>

              {/* Existing Stats */}
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900/60 backdrop-blur-md shadow-lg border border-purple-500/20 hover:scale-105 transition-transform hover:border-purple-500/40">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white leading-none mb-1">{decks.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Decks</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900/60 backdrop-blur-md shadow-lg border border-cyan-500/20 hover:scale-105 transition-transform hover:border-cyan-500/40">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white leading-none mb-1">{totalCards}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Cards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Create Section */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your decks..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-purple-500/30 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 shadow-lg transition-all font-medium"
              />
            </div>

            {isLoggedIn && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-purple-900/40 hover:shadow-2xl hover:shadow-purple-700/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                Create Deck
                <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Decks Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-purple-500 animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-500 animate-pulse" />
            </div>
            <p className="mt-6 text-lg font-semibold text-gray-400">Loading your decks...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
            {filtered.map((deckList, index) => (
              <div
                key={deckList.id}
                style={{ animationDelay: `${index * 75}ms` }}
                className="animate-slide-up"
              >
                <DeckCard 
                  deck={deckList} 
                  usId={userId} 
                  onDeckDeleted={(deletedId) => {
                    setDecks(prevDecks => prevDecks.filter(d => d.id !== deletedId));
                  }}
                  onDeckUpdated={() => fetchDecks()} 
                />
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
              {search ? "No matching decks" : "Start your study journey!"}
            </p>
            <p className="text-gray-400 text-center max-w-sm">
              {search 
                ? "Try adjusting your search to find what you're looking for" 
                : "Create your first deck and begin building your knowledge base"}
            </p>
            {!search && isLoggedIn && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all shadow-purple-900/50"
              >
                Create Your First Deck
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowCreateModal(false)} 
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl animate-scale-in overflow-hidden">
            {/* Modal Header with Gradient */}
            <div className="relative px-8 py-6 bg-gradient-to-r from-violet-900 via-purple-900 to-gray-900 border-b border-purple-500/20">
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                </div>
                <h2 className="text-2xl font-black text-white">Create New Deck</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

              <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-900/10 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-300 uppercase tracking-wide">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Auto-Generate AI Cards (Optional)
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex-1 px-4 py-3 border border-dashed border-purple-500/50 rounded-xl text-sm text-gray-300 hover:bg-purple-900/30 hover:border-purple-400 cursor-pointer transition-all flex items-center justify-center gap-2 group"
                  >
                    <FileText className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    {pdfFile ? <span className="truncate max-w-[200px]">{pdfFile.name}</span> : "Upload PDF Document"}
                  </label>
                  
                  {pdfFile && !generationSuccess && (
                    <button
                      type="button"
                      onClick={handleGenerateFromPdf}
                      disabled={isGeneratingCards}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
                    >
                      {isGeneratingCards ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generate</>
                      )}
                    </button>
                  )}
                  
                  {generationSuccess && (
                    <div className="px-5 py-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/30 flex items-center justify-center gap-2 font-bold animate-fade-in">
                      <CheckCircle className="w-5 h-5" />
                      {generatedCards.length} Cards Ready
                    </div>
                  )}
                </div>
                {isGeneratingCards && (
                  <p className="text-xs text-purple-400 animate-pulse text-center">
                    The AI is reading your PDF and extracting the best flashcards...
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">
                  Deck Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Quantum Physics Fundamentals"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description to help you remember..."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">
                    Topic
                  </label>
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-500">Choose topic...</option>
                    {TOPICS.map((topic) => (
                      <option key={topic} value={topic} className="bg-gray-900 text-white">
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-500">Choose status...</option>
                    {STATUS.map((status) => (
                      <option key={status} value={status} className="bg-gray-900 text-white">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-gray-900 border-t border-gray-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newTopic || !newStatus || isGeneratingCards}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg shadow-purple-900/40 hover:shadow-xl hover:shadow-purple-700/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                Create Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-up transition-all ${
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
      <Footer></Footer>
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
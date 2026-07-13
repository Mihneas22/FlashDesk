"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Search, Loader2, Sparkles, BookOpen, Trophy, Zap, 
  FileText, CheckCircle, AlertCircle, X, Flame, Users, 
  TrendingUp, Activity, Award, ChevronRight, Globe 
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { DeckCard } from "@/components/deck-card";
import { jwtDecode } from "jwt-decode";
import { Footer } from "@/components/footer";

// Paleta de culori solicitata aplicata direct in componente
const C = {
  bg0:    "#0F1419",
  bg1:    "#1A1F2E",
  bg2:    "#252D3D",
  amber:  "#FFB84D",
  amberD: "#E69B00",
  cyan:   "#00D9FF",
  cyanD:  "#00B8D4",
  text:   "#E8EAED",
  muted:  "#7A8394",
  border: "#2A3142",
  green:  "#4ADE80",
  red:    "#FF6B6B",
} as const;

const TOPICS = [
  "Mathematical Analysis", "Physics", "C++ / Computer Programming",
  "Special Mathematics", "Numerical Methods", "Data Structures",
  "Discrete Mathematics", "Electrical Engineering", "Linear Algebra",
  "Basics of Computer Operation", "Object-oriented programming",
  "Assembly language programming", "Others"
];

const STATUS = ["Private", "Public"];

// --- DATE MOCK PENTRU DESIGNUL "LEETCODE-ISH" SI COMUNITATE ---
const MOCK_LEADERBOARD = [
  { rank: 1, name: "Andrei_Dev", xp: 12450, streak: 42, avatar: "⚡" },
  { rank: 2, name: "Elena_M", xp: 9820, streak: 28, avatar: "🧠" },
  { rank: 3, name: "Cosmin_Algo", xp: 8150, streak: 19, avatar: "🚀" },
  { rank: 4, name: "Maria_Code", xp: 7400, streak: 14, avatar: "🎨" }
];

const MOCK_TRENDING_DECKS = [
  { id: "t1", title: "Algoritmi Grafuri Interviu", author: "Dr_Stefan", cardsCount: 45, saves: 312, topic: "Data Structures" },
  { id: "t2", title: "C++ Pointeri & Memorie", author: "CPP_Master", cardsCount: 28, saves: 194, topic: "C++ / Computer Programming" },
  { id: "t3", title: "Mecanică Cuantică Esențiale", author: "QuantumGuy", cardsCount: 50, saves: 145, topic: "Physics" }
];

const MOCK_ACTIVITIES = [
  { id: 1, text: "Ai finalizat 15 carduri din 'Linear Algebra'", time: "Acum 2 ore" },
  { id: 2, text: "Ai generat un pachet nou din PDF cu ajutorul AI", time: "Ieri" },
  { id: 3, text: "Ai atins un Streak de 5 zile consecutive!", time: "Acum 2 zile" }
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
        setIsLoggedIn(false);
        setLoading(false);
      }
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, [fetchDecks, updateUserStreak]);

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
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
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

        let data = JSON.parse(cleanText);
        const parsedCards = typeof data === 'string' ? JSON.parse(data) : data;
        const cardsArray = Array.isArray(parsedCards) ? parsedCards : (parsedCards.cards || []);
        
        setGeneratedCards(cardsArray);
        setGenerationSuccess(true);
        showToast("Flashcards generated successfully!", "success");
      } else {
        showToast("Failed to generate cards from the PDF.", "error");
      }
    } catch (error) {
      showToast("Network error during generation.", "error");
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
        fetchDecks();
        setNewTitle("");
        setNewDesc("");
        setNewTopic("");
        setShowCreateModal(false);
        setGeneratedCards([]);
        showToast("Deck created successfully!", "success");
      }
    } catch (error) {
      showToast("Network error. Please check your connection.", "error");
    }
  }

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);

  // Calcule Mock-up stil LeetCode pentru statistici circulare
  const masteredCardsCount = Math.floor(totalCards * 0.4);
  const learningCardsCount = Math.floor(totalCards * 0.35);
  const newCardsCount = totalCards - masteredCardsCount - learningCardsCount;

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#E8EAED] font-sans antialiased">
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        
        {/* LEETCODE TOP HEADER ROW: Hero & Streak Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-center bg-[#1A1F2E] border border-[#2A3142] p-6 rounded-2xl">
          <div className="lg:col-span-7 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#FFB84D] flex items-center justify-center shadow-lg shadow-black/40">
              <BookOpen className="w-7 h-7 text-[#0F1419]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#E8EAED] tracking-tight flex items-center gap-2">
                Panou de Studiu <span className="text-xs px-2 py-0.5 rounded-md bg-[#252D3D] text-[#00D9FF] border border-[#2A3142] font-mono">PRO</span>
              </h1>
              <p className="text-[#7A8394] text-sm mt-0.5">Gestionează-ți colecțiile și concurează cu comunitatea.</p>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex flex-wrap gap-4 lg:justify-end">
            {/* Streak Counter */}
            <button 
              onClick={() => showToast(`Streak-ul tău actual este de ${streakDays} zile! 🔥`, "success")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#252D3D] border transition-all active:scale-95 ${
                streakDays > 0 ? "border-[#FFB84D] text-[#FFB84D]" : "border-[#2A3142] text-[#7A8394]"
              }`}
            >
              <Flame className={`w-5 h-5 ${streakDays > 0 ? "animate-pulse text-[#FFB84D]" : ""}`} />
              <div className="text-left">
                <div className="text-xl font-black leading-none">{streakDays}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#7A8394]">Zile Streak</div>
              </div>
            </button>

            {/* Total Decks */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#252D3D] border border-[#2A3142]">
              <Trophy className="w-5 h-5 text-[#FFB84D]" />
              <div className="text-left">
                <div className="text-xl font-black leading-none">{decks.length}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#7A8394]">Pachete</div>
              </div>
            </div>

            {/* Total Cards */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#252D3D] border border-[#2A3142]">
              <Zap className="w-5 h-5 text-[#00D9FF]" />
              <div className="text-left">
                <div className="text-xl font-black leading-none">{totalCards}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#7A8394]">Carduri</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT: Split into 2 columns (Content Left, LeetCode Side panels Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE: Core functionality, Decks grid, Custom Filters */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* LEETCODE DAILY CHALLENGE BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#1A1F2E] via-[#252D3D] to-[#1A1F2E] border border-[#2A3142] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="absolute top-0 right-0 p-1 bg-[#FFB84D] text-[#0F1419] font-mono text-[9px] font-bold px-2 rounded-bl-lg">
                DAILY BONUS +200 XP
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFB84D]/10 flex items-center justify-center text-[#FFB84D] border border-[#FFB84D]/20">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#E8EAED]">Provocarea Zilei</h4>
                  <p className="text-sm text-[#7A8394]">Repetă 20 de carduri din pachetul recomandat pentru a asigura streak-ul.</p>
                </div>
              </div>
              <button className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#FFB84D] hover:bg-[#E69B00] text-[#0F1419] font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md">
                Începe sesiunea <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Action Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8394]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Caută în colecțiile tale de carduri..."
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#1A1F2E] border border-[#2A3142] text-[#E8EAED] placeholder-[#7A8394] focus:border-[#00D9FF] focus:outline-none transition-all text-sm"
                />
              </div>

              {isLoggedIn && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="h-11 px-5 rounded-xl bg-[#00D9FF] hover:bg-[#00B8D4] text-[#0F1419] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00D9FF]/10 group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                  Creează Pachet
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Decks Render Container */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1A1F2E] border border-[#2A3142] rounded-2xl">
                <Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" />
                <p className="mt-3 text-sm text-[#7A8394]">Se încarcă structura de date...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((deckList) => (
                  <DeckCard 
                    key={deckList.id}
                    deck={deckList} 
                    usId={userId} 
                    onDeckDeleted={(deletedId) => {
                      setDecks(prevDecks => prevDecks.filter(d => d.id !== deletedId));
                    }}
                    onDeckUpdated={() => fetchDecks()} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#1A1F2E] rounded-2xl border border-[#2A3142]">
                <Search className="w-10 h-10 text-[#7A8394] mb-3" />
                <p className="text-base font-bold text-[#E8EAED]">Nu s-au găsit pachete</p>
                <p className="text-[#7A8394] text-xs text-center mt-1 max-w-xs">
                  {search ? "Încearcă să modifici termenii căutați." : "Începe prin a crea prima ta colecție manual sau prin AI."}
                </p>
              </div>
            )}

            {/* COMUNITATE: TRENDING DECKS SECTION */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#4ADE80]" />
                <h3 className="text-lg font-bold text-[#E8EAED]">Pachete Populare în Comunitate</h3>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                {MOCK_TRENDING_DECKS.map((td) => (
                  <div key={td.id} className="bg-[#1A1F2E] border border-[#2A3142] p-4 rounded-xl flex flex-col justify-between hover:border-[#7A8394] transition-all cursor-pointer">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#252D3D] text-[#7A8394] border border-[#2A3142] font-semibold">
                        {td.topic}
                      </span>
                      <h4 className="text-sm font-bold text-[#E8EAED] mt-2 line-clamp-1">{td.title}</h4>
                      <p className="text-xs text-[#7A8394] mt-0.5">Autor: @{td.author}</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#7A8394] mt-4 pt-2 border-t border-[#2A3142]">
                      <span className="font-mono text-[#00D9FF]">{td.cardsCount} carduri</span>
                      <span className="flex items-center gap-1 text-[#FFB84D]">⭐ {td.saves} salvări</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: LEETCODE SIDEBAR METRICS & COMMUNITY SOCIAL HUBS */}
          <div className="lg:col-span-4 space-y-6">

            {/* LEETCODE STYLE PROGRESS BREAKDOWN */}
            <div className="bg-[#1A1F2E] border border-[#2A3142] p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-[#7A8394] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00D9FF]" /> Progresul Cardurilor
              </h3>
              
              <div className="flex items-center gap-6 mb-6">
                {/* Center Core Circle representation */}
                <div className="relative w-20 h-20 rounded-full border-4 border-[#2A3142] flex flex-col items-center justify-center bg-[#0F1419]">
                  <span className="text-xl font-black text-[#E8EAED]">{totalCards}</span>
                  <span className="text-[9px] text-[#7A8394] uppercase font-bold">Total</span>
                </div>

                {/* Progress bars indicators */}
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-[#4ADE80] font-semibold">Mastered</span>
                      <span className="text-[#E8EAED] font-mono">{masteredCardsCount}/{totalCards}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#252D3D] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4ADE80]" style={{ width: `${totalCards ? (masteredCardsCount/totalCards)*100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-[#FFB84D] font-semibold">Learning</span>
                      <span className="text-[#E8EAED] font-mono">{learningCardsCount}/{totalCards}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#252D3D] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFB84D]" style={{ width: `${totalCards ? (learningCardsCount/totalCards)*100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-[#00D9FF] font-semibold">New</span>
                      <span className="text-[#E8EAED] font-mono">{newCardsCount}/{totalCards}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#252D3D] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00D9FF]" style={{ width: `${totalCards ? (newCardsCount/totalCards)*100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMMUNITY GLOBAL LEADERBOARD */}
            <div className="bg-[#1A1F2E] border border-[#2A3142] p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-[#7A8394] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FFB84D]" /> Clasament Global (Top)
              </h3>
              
              <div className="space-y-3">
                {MOCK_LEADERBOARD.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-2.5 rounded-xl bg-[#252D3D]/50 border border-[#2A3142] hover:bg-[#252D3D] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-center font-mono text-xs font-black ${
                        user.rank === 1 ? "text-[#FFB84D]" : user.rank === 2 ? "text-[#7A8394]" : "text-[#E8EAED]"
                      }`}>
                        {user.rank}
                      </span>
                      <span className="text-base">{user.avatar}</span>
                      <span className="text-sm font-bold text-[#E8EAED]">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-mono font-bold text-[#00D9FF]">{user.xp} XP</span>
                      <span className="text-[#FFB84D] font-bold flex items-center gap-0.5">🔥 {user.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT USER SESSION ACTIVITIES */}
            <div className="bg-[#1A1F2E] border border-[#2A3142] p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-[#7A8394] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF6B6B]" /> Activitate Recentă
              </h3>
              <div className="space-y-4 pl-2 relative border-l border-[#2A3142]">
                {MOCK_ACTIVITIES.map((act) => (
                  <div key={act.id} className="relative pl-4">
                    <div className="absolute left-[-13px] top-1 w-2 h-2 rounded-full bg-[#00D9FF]" />
                    <p className="text-xs font-medium text-[#E8EAED]">{act.text}</p>
                    <span className="text-[10px] text-[#7A8394] block mt-0.5">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* CREATE DECK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-xl rounded-2xl bg-[#1A1F2E] border border-[#2A3142] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 bg-[#252D3D] border-b border-[#2A3142] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00D9FF]" />
                <h2 className="text-xl font-bold text-[#E8EAED]">Creează un Pachet Nou</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#7A8394] hover:text-[#E8EAED]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* AI Generation Box */}
              <div className="p-4 rounded-xl border border-[#00D9FF]/20 bg-[#252D3D]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00D9FF] uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" /> Generare Automată prin AI (Opțional)
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />
                  <label htmlFor="pdf-upload" className="flex-1 px-3 py-2 border border-dashed border-[#2A3142] rounded-xl text-xs text-[#7A8394] hover:border-[#00D9FF] cursor-pointer transition-all flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-[#00D9FF]" />
                    {pdfFile ? <span className="truncate max-w-[180px] text-[#E8EAED]">{pdfFile.name}</span> : "Încarcă Document PDF"}
                  </label>
                  
                  {pdfFile && !generationSuccess && (
                    <button type="button" onClick={handleGenerateFromPdf} disabled={isGeneratingCards} className="px-4 py-2 bg-[#00D9FF] hover:bg-[#00B8D4] text-[#0F1419] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                      {isGeneratingCards ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Generează
                    </button>
                  )}
                </div>
                {generationSuccess && (
                  <div className="text-xs text-[#4ADE80] font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {generatedCards.length} Carduri AI pregătite!
                  </div>
                )}
              </div>

              {/* Form Input fields */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7A8394] uppercase tracking-wide">Titlu Pachet</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="ex: Structuri de Date - Arbori" className="w-full px-3 py-2.5 rounded-xl border border-[#2A3142] bg-[#0F1419] text-[#E8EAED] placeholder-[#2A3142] focus:border-[#00D9FF] focus:outline-none text-sm font-medium" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7A8394] uppercase tracking-wide">Descriere</label>
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="O scurtă descriere a pachetului..." className="w-full px-3 py-2.5 rounded-xl border border-[#2A3142] bg-[#0F1419] text-[#E8EAED] placeholder-[#2A3142] focus:border-[#00D9FF] focus:outline-none text-sm font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7A8394] uppercase tracking-wide">Topic / Materie</label>
                  <select value={newTopic} onChange={(e) => setNewTopic(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#2A3142] bg-[#0F1419] text-[#E8EAED] focus:border-[#00D9FF] focus:outline-none text-sm cursor-pointer">
                    <option value="" disabled className="text-[#7A8394]">Alege topic...</option>
                    {TOPICS.map((topic) => <option key={topic} value={topic} className="bg-[#1A1F2E]">{topic}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7A8394] uppercase tracking-wide">Status Vizibilitate</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#2A3142] bg-[#0F1419] text-[#E8EAED] focus:border-[#00D9FF] focus:outline-none text-sm cursor-pointer">
                    <option value="" disabled className="text-[#7A8394]">Alege status...</option>
                    {STATUS.map((status) => <option key={status} value={status} className="bg-[#1A1F2E]">{status}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#252D3D] border-t border-[#2A3142] flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-[#7A8394] hover:text-[#E8EAED]">Anulează</button>
              <button onClick={handleCreate} disabled={!newTitle.trim() || !newTopic || !newStatus || isGeneratingCards} className="px-5 py-2 rounded-xl bg-[#00D9FF] hover:bg-[#00B8D4] text-[#0F1419] font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                Creează Colecția
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GLOBAL TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all ${
          toast.type === "error" ? "bg-[#1A1F2E] border-[#FF6B6B]/40 text-[#FF6B6B]" : "bg-[#1A1F2E] border-[#4ADE80]/40 text-[#4ADE80]"
        }`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <p className="font-semibold text-xs text-[#E8EAED] mr-2">{toast.message}</p>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="p-0.5 rounded hover:bg-[#252D3D] text-[#7A8394]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
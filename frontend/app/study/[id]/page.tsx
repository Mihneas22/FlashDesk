"use client";

import { use, useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, RotateCcw, ArrowRight, Trophy, 
  Brain, Sparkles, AlertCircle, CheckCircle, X, 
  LineChart as LineChartIcon, Activity,
  ZoomIn, ZoomOut, Maximize, Smile, Meh, Frown
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { FlashcardView } from "@/components/flashcard-view";
import { useStore } from "@/lib/store";
import { jwtDecode } from "jwt-decode";

import { evaluate } from 'mathjs';
import { 
  XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceDot,
  ResponsiveContainer, Line, ComposedChart, Tooltip
} from 'recharts';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudyPage({ params }: PageProps) {
  const { id } = use(params);
  const { decks } = useStore();
  
  const [mounted, setMounted] = useState(false);

  const [userId, setUserID] = useState("");
  const [localDeck, setLocalDeck] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [showPlotter, setShowPlotter] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const [cardFeedback, setCardFeedback] = useState<{ 
      cardId: string; 
      rating: string; 
      timeSpent: number; 
      reviewAt: string;
    }[]>([]);
  const cardStartTimeRef = useRef<number>(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [domainX, setDomainX] = useState<[number, number]>([-10, 10]);
  const [domainY, setDomainY] = useState<[number, number]>([-10, 10]);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const lastPanRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const extractedId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub || decoded.nameid;

        if (extractedId) {
          setIsLoggedIn(true);
          setUserID(extractedId);
        }
      } catch (error) {
        console.error("Token invalid:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [mounted]);

  const fetchDeckData = useCallback(async () => {
    if (!mounted) return;
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/card/getDeckCards/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const mappedCards = data.cards.map((c: any) => ({
          id: c.cardId,
          front: c.question,
          back: c.answer,
          tips: c.tips || [],
          viewConfig: c.viewConfig || null
        }));
        setCards(mappedCards);

        if (data.flag) {
          setLocalDeck({
            id: id,
            title: data.title || "Study Session",
            description: data.description || "",
          });
        } else {
          showToast(data.message || "Failed to load deck data.", "error");
        }
      } else {
        console.error("Server error:", response.statusText);
        showToast("Failed to fetch deck from the server.", "error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("Network error. Could not connect to the server.", "error");
    } finally {
      setLoading(false);
    }
  }, [id, mounted, showToast]);

  useEffect(() => {
    if (mounted) {
      fetchDeckData();
    }
  }, [fetchDeckData, mounted]);

  useEffect(() => {
    setShowPlotter(false);
    cardStartTimeRef.current = Date.now();
  }, [currentIndex])

  useEffect(() => {
    if (showPlotter && cards[currentIndex]?.viewConfig) {
      const vc = cards[currentIndex].viewConfig;
      setDomainX(vc.viewBox?.x || [-10, 10]);
      setDomainY(vc.viewBox?.y || [-10, 10]);
    }
  }, [showPlotter, currentIndex, cards]);

  const deck = localDeck || decks.find(d => d.id === id);

  // --- ZOOM HANDLERS ---
  const handleZoom = (delta: number) => {
    setDomainX(prev => {
      const newMin = prev[0] - delta;
      const newMax = prev[1] + delta;
      if (newMin >= newMax) return prev;
      return [newMin, newMax];
    });
    setDomainY(prev => {
      const newMin = prev[0] - delta;
      const newMax = prev[1] + delta;
      if (newMin >= newMax) return prev;
      return [newMin, newMax];
    });
  };

  const handleResetZoom = () => {
    const vc = cards[currentIndex]?.viewConfig;
    if (vc) {
      setDomainX(vc.viewBox?.x || [-10, 10]);
      setDomainY(vc.viewBox?.y || [-10, 10]);
    }
  };

  // --- PAN HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    lastPanRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!lastPanRef.current || !chartContainerRef.current) return;

    const dx = e.clientX - lastPanRef.current.x;
    const dy = e.clientY - lastPanRef.current.y;

    const rect = chartContainerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    setDomainX(prev => {
      const spanX = prev[1] - prev[0];
      const shiftX = (dx / width) * spanX;
      return [prev[0] - shiftX, prev[1] - shiftX];
    });

    setDomainY(prev => {
      const spanY = prev[1] - prev[0];
      const shiftY = (dy / height) * spanY;
      return [prev[0] + shiftY, prev[1] + shiftY];
    });
    
    lastPanRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
    lastPanRef.current = null;
  };

  const graphData = useMemo(() => {
    const currentCard = cards[currentIndex];
    if (!currentCard?.viewConfig) return null;

    const vc = currentCard.viewConfig;
    const [minX, maxX] = domainX;
    const [minY, maxY] = domainY;
    
    const lineData = [];
    const step = (maxX - minX) / 100; 
    
    for (let x = minX; x <= maxX; x += step) {
        let point: any = { x: Number(x.toFixed(3)) };
        
        vc.functions?.forEach((f: any, i: number) => {
            try {
                const y = evaluate(f.expr, { x });
                if (typeof y === 'number' && y >= minY - (maxY-minY) && y <= maxY + (maxY-minY)) {
                    point[`f${i}`] = y;
                } else {
                    point[`f${i}`] = null;
                }
            } catch (e) {
                point[`f${i}`] = null;
            }
        });
        lineData.push(point);
    }

    return { 
        lineData, 
        functions: vc.functions || [],
        points: vc.points || []
    };
  }, [cards, currentIndex, domainX, domainY]);

  // 3. Stabilizăm submitSessionResults cu useCallback
  const submitSessionResults = useCallback(async (finalFeedback: typeof cardFeedback) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/deck/deck-submission`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deckId: id,
          reviews: finalFeedback
        })
      });

      if (!response.ok) {
        console.error("Submission failed");
        showToast("Session finished, but failed to save results online.", "error");
      } else {
        showToast("Session results saved successfully!", "success");
      }
    } catch (error) {
      console.error("Network error during submission:", error);
      showToast("Network error. Results couldn't be saved.", "error");
    } finally {
      setIsSubmitting(false);
      setSessionDone(true);
    }
  }, [id, userId, showToast]);

  const handleFeedback = async (difficulty: 'hard' | 'medium' | 'easy') => {
  const currentCard = cards[currentIndex];
  
  // Calculează timpul petrecut în secunde
  const timeSpentInSeconds = Math.floor((Date.now() - cardStartTimeRef.current) / 1000);

  const newFeedback = { 
      cardId: currentCard.id, 
      rating: difficulty, // Se mapează pe C# CardReview.Rating
      timeSpent: timeSpentInSeconds, // Se mapează pe C# CardReview.TimeSpent
      reviewAt: new Date().toISOString() // Se mapează pe C# CardReview.ReviewAt
    };
    
    const updatedFeedback = [...cardFeedback, newFeedback];
    setCardFeedback(updatedFeedback);

    if (currentIndex + 1 >= cards.length) {
      await submitSessionResults(updatedFeedback);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  function handleRestart() {
    setCurrentIndex(0);
    setSessionDone(false);
    setCardFeedback([]);
  }

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" />
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-violet-500 animate-pulse" />
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-400">Loading your study session...</p>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-6 animate-fade-in-up">
        <div className="w-24 h-24 rounded-3xl bg-[#121317] border border-white/10 flex items-center justify-center mb-6 shadow-xl">
          <Brain className="w-10 h-10 text-violet-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Deck Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">We couldn't load the details for this study session.</p>
        <Link href="/" className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Decks
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-6 animate-fade-in-up">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="w-24 h-24 rounded-3xl bg-[#121317] border border-dashed border-white/20 flex items-center justify-center mb-6 shadow-sm">
          <Sparkles className="w-10 h-10 text-violet-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">No cards to study</h2>
        <p className="text-gray-400 mb-8 max-w-md">This deck is currently empty. Add some flashcards to start learning.</p>
        <Link href={`/deck/${deck.id}`} className="px-8 py-3 rounded-xl bg-white/5 text-white font-bold shadow-sm border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group">
          Go to deck <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  const totalCards = cards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100;
  const currentCard = cards[currentIndex];
  const hasViewConfig = !!currentCard?.viewConfig;

  if (sessionDone) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-32 px-4 animate-scale-in">
          <div className="bg-[#121317] rounded-3xl p-10 border border-white/10 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full filter blur-[50px]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/20 rounded-full filter blur-[50px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl text-white">
                <Trophy className="h-12 w-12" />
              </div>
              <h1 className="text-3xl font-black text-white mb-3">Session Complete!</h1>
              <p className="text-gray-400 mb-8 text-lg">
                Awesome job! You reviewed all <span className="font-bold text-violet-400">{totalCards}</span> cards in <br/>
                <span className="font-bold text-gray-200">{deck.title}</span>.
              </p>

              <div className="flex flex-col sm:flex-row w-full gap-4">
                <button onClick={handleRestart} className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-bold text-white hover:bg-white/10 transition-all group active:scale-95">
                  <RotateCcw className="h-5 w-5 group-hover:-rotate-180 transition-transform duration-500" /> Study Again
                </button>
                <Link href={`/deck/${deck.id}`} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Back to Deck
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in flex flex-col items-center">
        
        <div className="w-full mb-8 bg-[#121317] rounded-2xl border border-white/10 shadow-lg px-5 py-4 flex items-center justify-between">
          <Link href={`/deck/${deck.id}`} className="group flex items-center gap-3 text-sm font-bold text-gray-300 hover:text-white transition-colors">
            <div className="p-1.5 rounded-lg bg-white/5 shadow-sm border border-white/10 group-hover:border-violet-500/50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            {deck.title}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white tabular-nums">{currentIndex + 1}</span>
            <span className="text-sm font-bold text-gray-600">/</span>
            <span className="text-sm font-bold text-gray-500 tabular-nums">{totalCards}</span>
          </div>
        </div>

        <div className="w-full mb-10 h-3 overflow-hidden rounded-full bg-white/5 border border-white/5 shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative" style={{ width: `${progress}%` }}>
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-[2px]" />
          </div>
        </div>

        <div className="w-full animate-slide-up" key={currentIndex}>
          <FlashcardView card={currentCard} resetKey={currentCard.id} />
        </div>

        {!showPlotter && hasViewConfig && (
          <button 
            onClick={() => setShowPlotter(true)}
            className="mt-6 flex items-center gap-2 px-5 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all font-semibold text-sm shadow-xl shadow-violet-500/10"
          >
            <LineChartIcon size={20} />
            Open Interactive Graph
          </button>
        )}

        {showPlotter && hasViewConfig && graphData && (
          <div className="mt-6 w-full bg-[#121317] rounded-2xl border border-white/10 p-6 animate-slide-up shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-violet-500" />
                Interactive Graph
              </h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#0a0a0a] rounded-lg border border-white/10 p-1 mr-2">
                  <button onClick={() => handleZoom(-1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button onClick={() => handleZoom(1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button onClick={handleResetZoom} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Reset View">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowPlotter(false)} 
                  className="text-gray-400 hover:text-red-400 transition-colors bg-white/5 p-2 rounded-lg hover:bg-red-500/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div 
              ref={chartContainerRef}
              className={`h-[400px] w-full bg-[#0a0a0a]/50 rounded-xl p-4 border border-white/5 relative select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <ResponsiveContainer width="100%" height="100%" className="pointer-events-none">
                <ComposedChart data={graphData.lineData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  
                  <XAxis 
                    dataKey="x" 
                    type="number" 
                    domain={domainX} 
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff80', fontSize: 12 }} 
                    allowDataOverflow={true} 
                  />
                  <YAxis 
                    type="number" 
                    domain={domainY} 
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff80', fontSize: 12 }}
                    allowDataOverflow={true} 
                  />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121317', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#a78bfa', fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value: any) => Number(value).toFixed(2)}
                  />
                  
                  <ReferenceLine x={0} stroke="#ffffff40" strokeWidth={1} />
                  <ReferenceLine y={0} stroke="#ffffff40" strokeWidth={1} />

                  {graphData.functions.map((f: any, i: number) => (
                    <Line 
                      key={`line-${i}`}
                      type="monotone" 
                      dataKey={`f${i}`} 
                      stroke={f.color || "#8b5cf6"} 
                      strokeWidth={3}
                      dot={false}
                      name={f.latexLabel || f.expr}
                      isAnimationActive={false}
                    />
                  ))}

                  {graphData.points.map((p: any, i: number) => (
                    <ReferenceDot 
                      key={`point-${i}`}
                      x={p.coords[0]} 
                      y={p.coords[1]} 
                      r={6}
                      fill={p.color || "#ec4899"} 
                      stroke="#121317"
                      strokeWidth={2}
                      label={{ 
                        position: 'top', 
                        value: p.latexLabel || `P${i+1}`, 
                        fill: p.color || '#ec4899', 
                        fontSize: 14, 
                        fontWeight: 'bold',
                        offset: 10
                      }}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* FEEDBACK BUTTONS SECTION */}
        <div className="mt-12 flex flex-col items-center w-full animate-slide-up">
          <p className="text-gray-400 font-medium mb-4 text-sm tracking-wide uppercase">How did you find this card?</p>
          <div className="flex flex-col sm:flex-row justify-center w-full max-w-lg gap-3">
            
            <button
              onClick={() => handleFeedback('hard')}
              disabled={isSubmitting}
              className="flex-1 flex flex-col items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Frown className="h-6 w-6" />
              <span className="font-bold">Hard</span>
            </button>
            
            <button
              onClick={() => handleFeedback('medium')}
              disabled={isSubmitting}
              className="flex-1 flex flex-col items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Meh className="h-6 w-6" />
              <span className="font-bold">Medium</span>
            </button>

            <button
              onClick={() => handleFeedback('easy')}
              disabled={isSubmitting}
              className="flex-1 flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smile className="h-6 w-6" />
              <span className="font-bold">Easy</span>
            </button>
            
          </div>
        </div>
      </main>

      {/* TOAST SYSTEM */}
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up transition-all ${
          toast.type === "error" ? "bg-red-950/90 border-red-500/50 text-red-200" : "bg-green-950/90 border-green-500/50 text-green-200"
        }`}>
          {toast.type === "error" ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
          <p className="font-semibold text-sm mr-2">{toast.message}</p>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className={`p-1 rounded-lg transition-colors ${toast.type === "error" ? "hover:bg-red-900/50" : "hover:bg-green-900/50"}`}>
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out backwards; }
        .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
}
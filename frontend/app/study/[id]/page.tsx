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
import { Flashcard, ViewConfig, MatrixConfig} from "@/lib/store";
import { useStore } from "@/lib/store";
import { jwtDecode } from "jwt-decode";
import { evaluate } from "mathjs";
import {
  XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceDot,
  ResponsiveContainer, Line, ComposedChart, Tooltip,
} from "recharts";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the single "active" graph config for a card.
 * matrixConfig takes precedence if both exist (shouldn't happen, but just in case).
 */
function getActiveConfig(card: Flashcard | null): ViewConfig | MatrixConfig | null {
  if (!card) return null;
  return card.matrixConfig ?? card.viewConfig ?? null;
}

function isMatrixConfig(cfg: ViewConfig | MatrixConfig | null): cfg is MatrixConfig {
  return !!cfg && (cfg as MatrixConfig).type === "2d_transform";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudyPage({ params }: PageProps) {
  const { id } = use(params);
  const { decks } = useStore();

  const [mounted, setMounted] = useState(false);
  const [userId, setUserID] = useState("");
  const [localDeck, setLocalDeck] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [showPlotter, setShowPlotter] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const [cardFeedback, setCardFeedback] = useState<
    { cardId: string; rating: string; timeSpent: number; reviewAt: string }[]
  >([]);
  const cardStartTimeRef = useRef<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [domainX, setDomainX] = useState<[number, number]>([-10, 10]);
  const [domainY, setDomainY] = useState<[number, number]>([-10, 10]);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const lastPanRef = useRef<{ x: number; y: number } | null>(null);

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("token");
    if (!token) { setIsLoggedIn(false); return; }
    try {
      const decoded: any = jwtDecode(token);
      const extractedId =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded.sub ||
        decoded.nameid;
      if (extractedId) { setIsLoggedIn(true); setUserID(extractedId); }
    } catch { setIsLoggedIn(false); }
  }, [mounted]);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchDeckData = useCallback(async () => {
    if (!mounted) return;
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await fetch(`https://learnqhub.com/api/card/getDeckCards/${id}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        const mappedCards: Flashcard[] = data.cards.map((c: any) => ({
          id:           c.cardId,
          front:        c.question,
          back:         c.answer,
          tips:         c.tips ?? [],
          viewConfig:   c.viewConfig   ?? null,
          matrixConfig: c.matrixConfig ?? null,
        }));
        setCards(mappedCards);
        if (data.flag) {
          setLocalDeck({ id, title: data.title || "Study Session", description: data.description || "" });
        } else {
          showToast(data.message || "Failed to load deck data.", "error");
        }
      } else {
        showToast("Failed to fetch deck from the server.", "error");
      }
    } catch {
      showToast("Network error. Could not connect to the server.", "error");
    } finally {
      setLoading(false);
    }
  }, [id, mounted, showToast]);

  useEffect(() => { if (mounted) fetchDeckData(); }, [fetchDeckData, mounted]);

  // ─── Reset graph on card change ────────────────────────────────────────────
  useEffect(() => {
    setShowPlotter(false);
    cardStartTimeRef.current = Date.now();
  }, [currentIndex]);

  // ─── Sync domain to active config on open ─────────────────────────────────
  useEffect(() => {
    if (!showPlotter) return;
    const activeConfig = getActiveConfig(cards[currentIndex] ?? null);
    if (!activeConfig) return;

    if (isMatrixConfig(activeConfig)) {
      setDomainX([-4, 4]);
      setDomainY([-4, 4]);
    } else {
      setDomainX((activeConfig as ViewConfig).viewBox?.x ?? [-10, 10]);
      setDomainY((activeConfig as ViewConfig).viewBox?.y ?? [-10, 10]);
    }
  }, [showPlotter, currentIndex, cards]);

  // ─── Derived values for current card ──────────────────────────────────────
  const deck = localDeck || decks.find((d) => d.id === id);
  const currentCard: Flashcard | null = cards[currentIndex] ?? null;
  const activeConfig = getActiveConfig(currentCard);
  const hasGraph = !!activeConfig;
  const isMatrix = isMatrixConfig(activeConfig);

  // ─── Graph data (only for viewConfig/Recharts path) ───────────────────────
  const graphData = useMemo(() => {
    if (!currentCard || isMatrixConfig(getActiveConfig(currentCard))) return null;
    const vc = currentCard.viewConfig;
    if (!vc) return null;

    const [minX, maxX] = domainX;
    const [minY, maxY] = domainY;
    const step = (maxX - minX) / 300;
    const lineData: any[] = [];

    for (let x = minX; x <= maxX + step; x += step) {
      const point: any = { x: Number(x.toFixed(4)) };
      vc.functions?.forEach((f, i) => {
        try {
          const y = evaluate(f.expr, { x });
          if (typeof y === "number" && isFinite(y) && y >= minY - (maxY - minY) && y <= maxY + (maxY - minY)) {
            point[`f${i}`] = y;
          } else {
            point[`f${i}`] = null;
          }
        } catch {
          point[`f${i}`] = null;
        }
      });
      lineData.push(point);
    }

    return {
      lineData,
      functions: vc.functions ?? [],
      points: vc.points ?? [],
      lines: vc.lines ?? [],
    };
  }, [currentCard, domainX, domainY]);

  // ─── Zoom & Pan ────────────────────────────────────────────────────────────
  const handleZoom = (delta: number) => {
    setDomainX((prev) => {
      const next: [number, number] = [prev[0] - delta, prev[1] + delta];
      return next[0] >= next[1] ? prev : next;
    });
    setDomainY((prev) => {
      const next: [number, number] = [prev[0] - delta, prev[1] + delta];
      return next[0] >= next[1] ? prev : next;
    });
  };

  const handleResetZoom = () => {
    if (!activeConfig) return;
    if (isMatrixConfig(activeConfig)) {
      setDomainX([-4, 4]);
      setDomainY([-4, 4]);
    } else {
      setDomainX((activeConfig as ViewConfig).viewBox?.x ?? [-10, 10]);
      setDomainY((activeConfig as ViewConfig).viewBox?.y ?? [-10, 10]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    lastPanRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!lastPanRef.current || !chartContainerRef.current) return;
    const dx = e.clientX - lastPanRef.current.x;
    const dy = e.clientY - lastPanRef.current.y;
    const rect = chartContainerRef.current.getBoundingClientRect();

    setDomainX((prev) => {
      const span = prev[1] - prev[0];
      const shift = (dx / rect.width) * span;
      return [prev[0] - shift, prev[1] - shift];
    });
    setDomainY((prev) => {
      const span = prev[1] - prev[0];
      const shift = (dy / rect.height) * span;
      return [prev[0] + shift, prev[1] + shift];
    });

    lastPanRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
    lastPanRef.current = null;
  };

  // ─── Submission ────────────────────────────────────────────────────────────
  const submitSessionResults = useCallback(async (finalFeedback: typeof cardFeedback) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://learnqhub.com/api/deck/deck-submission`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: id, reviews: finalFeedback }),
      });
      if (!response.ok) showToast("Session finished, but failed to save results.", "error");
      else showToast("Session results saved successfully!", "success");
    } catch {
      showToast("Network error. Results couldn't be saved.", "error");
    } finally {
      setIsSubmitting(false);
      setSessionDone(true);
    }
  }, [id, showToast]);

  const handleFeedback = async (difficulty: "hard" | "medium" | "easy") => {
    if (!currentCard) return;
    const timeSpentInSeconds = Math.floor((Date.now() - cardStartTimeRef.current) / 1000);
    const newFeedback = {
      cardId: currentCard.id,
      rating: difficulty,
      timeSpent: timeSpentInSeconds,
      reviewAt: new Date().toISOString(),
    };
    const updated = [...cardFeedback, newFeedback];
    setCardFeedback(updated);
    if (currentIndex + 1 >= cards.length) {
      await submitSessionResults(updated);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRestart = () => { setCurrentIndex(0); setSessionDone(false); setCardFeedback([]); };

  // ─── Loading / guard states ────────────────────────────────────────────────
  if (!mounted) return <div className="min-h-screen bg-[#0a0a0a]" />;

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-[#121317] border border-white/10 flex items-center justify-center mb-6">
          <Brain className="w-10 h-10 text-violet-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Deck Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">We couldn't load this study session.</p>
        <Link href="/" className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Decks
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-6">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="w-24 h-24 rounded-3xl bg-[#121317] border border-dashed border-white/20 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-violet-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">No cards to study</h2>
        <p className="text-gray-400 mb-8 max-w-md">This deck is empty. Add some flashcards to start learning.</p>
        <Link href={`/deck/${deck.id}`} className="px-8 py-3 rounded-xl bg-white/5 text-white font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group">
          Go to deck <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  const totalCards = cards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100;

  // ─── Session done ──────────────────────────────────────────────────────────
  if (sessionDone) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-32 px-4 animate-scale-in">
          <div className="bg-[#121317] rounded-3xl p-10 border border-white/10 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full filter blur-[50px]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/20 rounded-full filter blur-[50px]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white mb-3">Session Complete!</h1>
              <p className="text-gray-400 mb-8 text-lg">
                You reviewed all <span className="font-bold text-violet-400">{totalCards}</span> cards in{" "}
                <span className="font-bold text-gray-200">{deck.title}</span>.
              </p>
              <div className="flex flex-col sm:flex-row w-full gap-4">
                <button onClick={handleRestart} className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-bold text-white hover:bg-white/10 transition-all group active:scale-95">
                  <RotateCcw className="h-5 w-5 group-hover:-rotate-180 transition-transform duration-500" /> Study Again
                </button>
                <Link href={`/deck/${deck.id}`} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all">
                  Back to Deck
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main study UI ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      {/* Blobs */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in flex flex-col items-center">

        {/* Header bar */}
        <div className="w-full mb-8 bg-[#121317] rounded-2xl border border-white/10 shadow-lg px-5 py-4 flex items-center justify-between">
          <Link href={`/deck/${deck.id}`} className="group flex items-center gap-3 text-sm font-bold text-gray-300 hover:text-white transition-colors">
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-violet-500/50 transition-colors">
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

        {/* Progress bar */}
        <div className="w-full mb-10 h-3 overflow-hidden rounded-full bg-white/5 border border-white/5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-[2px]" />
          </div>
        </div>

        {/* Flashcard */}
        <div className="w-full animate-slide-up" key={currentIndex}>
          <FlashcardView card={currentCard} resetKey={currentCard?.id ?? ""} />
        </div>

        {/* ── Toggle button for graph/matrix ─────────────────────────────── */}
        {!showPlotter && hasGraph && (
          <button
            onClick={() => setShowPlotter(true)}
            className="mt-6 flex items-center gap-2 px-5 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all font-semibold text-sm shadow-xl shadow-violet-500/10"
          >
            <LineChartIcon size={20} />
            {isMatrix ? "Open Matrix Transform Visualizer" : "Open Interactive Graph"}
          </button>
        )}

        {/* ── Graph / Matrix panel ─────────────────────────────────────────── */}
        {showPlotter && hasGraph && activeConfig && (
          <div className="mt-6 w-full bg-[#121317] rounded-2xl border border-white/10 p-6 animate-slide-up shadow-xl">

            {/* Panel header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-violet-500" />
                {isMatrix ? "2D Matrix Transformation" : "Interactive Graph"}
              </h3>
              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <div className="flex items-center bg-[#0a0a0a] rounded-lg border border-white/10 p-1 mr-2">
                  <button onClick={() => handleZoom(-1)} title="Zoom In" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button onClick={() => handleZoom(1)} title="Zoom Out" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button onClick={handleResetZoom} title="Reset View" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setShowPlotter(false)} className="text-gray-400 hover:text-red-400 transition-colors bg-white/5 p-2 rounded-lg hover:bg-red-500/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div
              ref={chartContainerRef}
              className={`h-[420px] w-full bg-[#0a0a0a]/50 rounded-xl border border-white/5 relative select-none overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {/* ══ MATRIX TRANSFORM (SVG renderer) ══ */}
              {isMatrix && (activeConfig as MatrixConfig).matrix && (() => {
                const mc = activeConfig as MatrixConfig;
                const [[a, b], [c, d]] = mc.matrix;
                return (
                  <div className="w-full h-full relative pointer-events-none">
                    {/* Overlay */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 z-10">
                      <span className="text-white font-bold text-sm block mb-2">{mc.description}</span>
                      {/* Matrix display */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400 text-xs font-mono">M =</span>
                        <div className="border border-white/20 rounded px-2 py-1 font-mono text-xs text-white leading-5">
                          <div>[{a}  {b}]</div>
                          <div>[{c}  {d}]</div>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1 text-red-400">
                          <div className="w-2 h-2 rounded-full bg-red-500" /> î (col 1)
                        </span>
                        <span className="flex items-center gap-1 text-blue-400">
                          <div className="w-2 h-2 rounded-full bg-blue-500" /> ĵ (col 2)
                        </span>
                        <span className="flex items-center gap-1 text-violet-400">
                          <div className="w-2 h-2 rounded-full bg-violet-400" /> result
                        </span>
                      </div>
                    </div>

                    <svg
                      width="100%"
                      height="100%"
                      viewBox={`${domainX[0]} ${-domainY[1]} ${domainX[1] - domainX[0]} ${domainY[1] - domainY[0]}`}
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <marker id="arr-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                        </marker>
                        <marker id="arr-j" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                        </marker>
                        <marker id="arr-orig-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef444450" />
                        </marker>
                        <marker id="arr-orig-j" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f650" />
                        </marker>
                      </defs>

                      <g transform="scale(1,-1)">
                        {/* Grid */}
                        {Array.from({ length: 41 }, (_, i) => i - 20).map((i) => (
                          <g key={`g${i}`}>
                            <line x1={-20} y1={i} x2={20} y2={i} stroke={i === 0 ? "#ffffff40" : "#ffffff0d"} vectorEffect="non-scaling-stroke" strokeWidth={i === 0 ? 1.5 : 1} />
                            <line x1={i} y1={-20} x2={i} y2={20} stroke={i === 0 ? "#ffffff40" : "#ffffff0d"} vectorEffect="non-scaling-stroke" strokeWidth={i === 0 ? 1.5 : 1} />
                          </g>
                        ))}

                        {/* Original unit square (ghost) */}
                        <polygon points="0,0 1,0 1,1 0,1" fill="#ffffff05" stroke="#ffffff40" strokeDasharray="0.05 0.05" vectorEffect="non-scaling-stroke" strokeWidth={1.5} />
                        {/* Original basis vectors (ghost) */}
                        <line x1="0" y1="0" x2="0.85" y2="0" stroke="#ef4444" strokeOpacity="0.3" vectorEffect="non-scaling-stroke" strokeWidth={2} markerEnd="url(#arr-orig-i)" />
                        <line x1="0" y1="0" x2="0" y2="0.85" stroke="#3b82f6" strokeOpacity="0.3" vectorEffect="non-scaling-stroke" strokeWidth={2} markerEnd="url(#arr-orig-j)" />

                        {/* Transformed parallelogram */}
                        <polygon
                          points={`0,0 ${a},${c} ${a + b},${c + d} ${b},${d}`}
                          fill="#8b5cf620"
                          stroke="#8b5cf6"
                          vectorEffect="non-scaling-stroke"
                          strokeWidth={1.5}
                        />

                        {/* Transformed î (first column) */}
                        <line x1="0" y1="0" x2={a * 0.88} y2={c * 0.88} stroke="#ef4444" vectorEffect="non-scaling-stroke" strokeWidth={3} markerEnd="url(#arr-i)" />
                        {/* Transformed ĵ (second column) */}
                        <line x1="0" y1="0" x2={b * 0.88} y2={d * 0.88} stroke="#3b82f6" vectorEffect="non-scaling-stroke" strokeWidth={3} markerEnd="url(#arr-j)" />

                        {/* Origin dot */}
                        <circle cx="0" cy="0" r="0.06" fill="#ffffff80" vectorEffect="non-scaling-stroke" />
                      </g>
                    </svg>
                  </div>
                );
              })()}

              {/* ══ STANDARD GRAPH (Recharts renderer) ══ */}
              {!isMatrix && graphData && (
                <div className="w-full h-full p-4 pointer-events-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={graphData.lineData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                      <XAxis
                        dataKey="x"
                        type="number"
                        domain={domainX}
                        stroke="#ffffff40"
                        tick={{ fill: "#ffffff80", fontSize: 12 }}
                        allowDataOverflow
                      />
                      <YAxis
                        type="number"
                        domain={domainY}
                        stroke="#ffffff40"
                        tick={{ fill: "#ffffff80", fontSize: 12 }}
                        allowDataOverflow
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#121317", border: "1px solid #ffffff20", borderRadius: "8px", color: "#fff" }}
                        labelStyle={{ color: "#a78bfa", fontWeight: "bold", marginBottom: "4px" }}
                        formatter={(value: any) => (typeof value === "number" ? value.toFixed(3) : value)}
                        labelFormatter={(label) => `x = ${Number(label).toFixed(3)}`}
                      />
                      <ReferenceLine x={0} stroke="#ffffff40" strokeWidth={1} />
                      <ReferenceLine y={0} stroke="#ffffff40" strokeWidth={1} />

                      {/* Extra reference lines from viewConfig.lines */}
                      {graphData.lines.map((l, i) =>
                        l.axis === "x" ? (
                          <ReferenceLine key={`rl-${i}`} x={l.value} stroke={l.color ?? "#ffffff30"} strokeDasharray="4 4" label={{ value: l.latexLabel ?? "", fill: l.color ?? "#aaa", fontSize: 11, position: "insideTopRight" }} />
                        ) : (
                          <ReferenceLine key={`rl-${i}`} y={l.value} stroke={l.color ?? "#ffffff30"} strokeDasharray="4 4" label={{ value: l.latexLabel ?? "", fill: l.color ?? "#aaa", fontSize: 11, position: "insideTopRight" }} />
                        )
                      )}

                      {graphData.functions.map((f, i) => (
                        <Line
                          key={`line-${i}`}
                          type="monotone"
                          dataKey={`f${i}`}
                          stroke={f.color ?? "#8b5cf6"}
                          strokeWidth={2.5}
                          dot={false}
                          name={f.latexLabel ?? f.expr}
                          isAnimationActive={false}
                          connectNulls={false}
                        />
                      ))}

                      {graphData.points.map((p, i) => (
                        <ReferenceDot
                          key={`pt-${i}`}
                          x={p.coords[0]}
                          y={p.coords[1]}
                          r={6}
                          fill={p.color ?? "#ec4899"}
                          stroke="#121317"
                          strokeWidth={2}
                          label={{
                            position: "top",
                            value: p.latexLabel ?? `P${i + 1}`,
                            fill: p.color ?? "#ec4899",
                            fontSize: 12,
                            fontWeight: "bold",
                            offset: 10,
                          }}
                        />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Fallback: no data */}
              {!isMatrix && !graphData && (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  No graph data available for this card.
                </div>
              )}
            </div>

            {/* Legend strip */}
            {!isMatrix && graphData && graphData.functions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3 px-1">
                {graphData.functions.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-300">
                    <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: f.color ?? "#8b5cf6" }} />
                    <span>{f.latexLabel ?? f.expr}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Feedback buttons ──────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-col items-center w-full animate-slide-up">
          <p className="text-gray-400 font-medium mb-4 text-sm tracking-wide uppercase">How did you find this card?</p>
          <div className="flex flex-col sm:flex-row justify-center w-full max-w-lg gap-3">
            <button
              onClick={() => handleFeedback("hard")}
              disabled={isSubmitting}
              className="flex-1 flex flex-col items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Frown className="h-6 w-6" />
              <span className="font-bold">Hard</span>
            </button>
            <button
              onClick={() => handleFeedback("medium")}
              disabled={isSubmitting}
              className="flex-1 flex flex-col items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Meh className="h-6 w-6" />
              <span className="font-bold">Medium</span>
            </button>
            <button
              onClick={() => handleFeedback("easy")}
              disabled={isSubmitting}
              className="flex-1 flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smile className="h-6 w-6" />
              <span className="font-bold">Easy</span>
            </button>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up transition-all ${
          toast.type === "error"
            ? "bg-red-950/90 border-red-500/50 text-red-200"
            : "bg-green-950/90 border-green-500/50 text-green-200"
        }`}>
          {toast.type === "error"
            ? <AlertCircle className="w-5 h-5 text-red-400" />
            : <CheckCircle className="w-5 h-5 text-green-400" />}
          <p className="font-semibold text-sm mr-2">{toast.message}</p>
          <button onClick={() => setToast((p) => ({ ...p, show: false }))} className={`p-1 rounded-lg transition-colors ${toast.type === "error" ? "hover:bg-red-900/50" : "hover:bg-green-900/50"}`}>
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
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
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
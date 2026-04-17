"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Check, Loader2, ArrowRight, Trophy, Brain, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { FlashcardView } from "@/components/flashcard-view";
import { useStore } from "@/lib/store";
import type { Flashcard } from "@/lib/store";

// IMPORTURI PENTRU MATH RENDER
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudyPage({ params }: PageProps) {
  const { id } = use(params);
  const { decks } = useStore();
  
  const [localDeck, setLocalDeck] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const fetchDeckData = useCallback(async () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

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
        }));
        setCards(mappedCards);

        if (data.flag) {
          setLocalDeck({
            id: id,
            title: data.title || "Study Session",
            description: data.description || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch deck:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeckData();
  }, [fetchDeckData]);

  const deck = localDeck || decks.find(d => d.id === id);

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
      <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-40 text-center px-6 animate-fade-in-up">
          <div className="w-24 h-24 rounded-3xl bg-[#121317] border border-white/10 flex items-center justify-center mb-6 shadow-xl">
            <Brain className="w-10 h-10 text-violet-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Deck Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md">We couldn't load the details for this study session.</p>
          <Link 
            href="/" 
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Decks
          </Link>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-40 text-center px-6 animate-fade-in-up">
          <div className="w-24 h-24 rounded-3xl bg-[#121317] border border-dashed border-white/20 flex items-center justify-center mb-6 shadow-sm">
            <Sparkles className="w-10 h-10 text-violet-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">No cards to study</h2>
          <p className="text-gray-400 mb-8 max-w-md">This deck is currently empty. Add some flashcards to start learning.</p>
          <Link 
            href={`/deck/${deck.id}`} 
            className="px-8 py-3 rounded-xl bg-white/5 text-white font-bold shadow-sm border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group"
          >
            Go to deck 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  const totalCards = cards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100;
  const currentCard = cards[currentIndex];

  function handleNext() {
    if (currentIndex + 1 >= totalCards) {
      setSessionDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSessionDone(false);
  }

  if (sessionDone) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-32 px-4 animate-scale-in">
          <div className="bg-[#121317] rounded-3xl p-10 border border-white/10 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
            {/* Decorative background elements inside the card */}
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
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-bold text-white hover:bg-white/10 transition-all group active:scale-95"
                >
                  <RotateCcw className="h-5 w-5 group-hover:-rotate-180 transition-transform duration-500" />
                  Study Again
                </button>
                <Link
                  href={`/deck/${deck.id}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
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
      {/* Animated gradient background - Dark Mode Version */}
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
        
        {/* Header Setup */}
        <div className="mb-8 bg-[#121317] rounded-2xl border border-white/10 shadow-lg px-5 py-4 flex items-center justify-between">
          <Link
            href={`/deck/${deck.id}`}
            className="group flex items-center gap-3 text-sm font-bold text-gray-300 hover:text-white transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-white/5 shadow-sm border border-white/10 group-hover:border-violet-500/50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            {deck.title}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white tabular-nums">
              {currentIndex + 1}
            </span>
            <span className="text-sm font-bold text-gray-600">/</span>
            <span className="text-sm font-bold text-gray-500 tabular-nums">
              {totalCards}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 h-3 w-full overflow-hidden rounded-full bg-white/5 border border-white/5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-[2px]" />
          </div>
        </div>

        {/* Notă: Asigură-te că FlashcardView are și el un design adaptat temei dark */}
        <div className="animate-slide-up" key={currentIndex}>
          <FlashcardView card={currentCard} resetKey={currentCard.id} />
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleNext}
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-10 py-4 text-lg font-bold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            {currentIndex + 1 === totalCards ? "Finish Session" : "Next Card"}
            {currentIndex + 1 === totalCards ? (
              <Check className="h-5 w-5 group-hover:scale-110 transition-transform" />
            ) : (
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </main>

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
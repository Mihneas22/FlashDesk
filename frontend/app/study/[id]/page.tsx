"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Check, Loader2, ArrowRight } from "lucide-react";
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
  
  // 1. Stare locală pentru deck (pentru a preveni eroarea la refresh)
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

        // 2. Salvăm datele deck-ului local pentru a evita "Deck not found"
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

  // Fallback: căutăm în store, dacă nu, folosim ce a venit de la API
  const deck = localDeck || decks.find(d => d.id === id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-40 text-center">
          <p className="text-lg font-semibold text-foreground">Deck details not found</p>
          <Link href="/" className="mt-4 text-sm text-primary hover:underline">
            &larr; Back to decks
          </Link>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-40 gap-3 text-center px-4">
          <p className="text-lg font-semibold text-foreground">No cards to study</p>
          <p className="text-sm text-muted-foreground">Add some cards to this deck first.</p>
          <Link href={`/deck/${deck.id}`} className="mt-2 text-sm text-primary hover:underline">
            Go to deck &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const totalCards = cards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100; // Calcul progres mai precis
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
      <div className="min-h-screen bg-background text-foreground">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Session Complete!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You reviewed all {totalCards} cards in <span className="text-foreground font-medium">{deck.title}</span>
          </p>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Study Again
            </button>
            <Link
              href={`/deck/${deck.id}`}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Back to Deck
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/deck/${deck.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {deck.title}
          </Link>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {currentIndex + 1} / {totalCards}
          </span>
        </div>

        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* NOTĂ: Va trebui să modifici și componenta FlashcardView 
            pentru a folosi ReactMarkdown în interiorul ei 
        */}
        <FlashcardView card={currentCard} resetKey={currentCard.id} />

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {currentIndex + 1 === totalCards ? "Finish Session" : "Next Card"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
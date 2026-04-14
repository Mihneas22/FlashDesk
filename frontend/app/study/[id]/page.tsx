"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Check } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { FlashcardView } from "@/components/flashcard-view";
import { StudyControls, type StudyRating } from "@/components/study-controls";
import { useStore } from "@/lib/store";
import type { Flashcard } from "@/lib/store";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface StudyCard extends Flashcard {
  status: "unseen" | "again" | "hard" | "good" | "easy";
}

export default function StudyPage({ params }: PageProps) {
  const { id } = use(params);
  const { getDeckById } = useStore();
  const deck = getDeckById(id);

  const [queue, setQueue] = useState<StudyCard[]>(() =>
    (deck?.cards ?? []).map((c) => ({ ...c, status: "unseen" as const }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const totalCards = queue.length;
  const ratedCards = useMemo(
    () => queue.filter((c) => c.status !== "unseen"),
    [queue]
  );
  const progress = totalCards > 0 ? (ratedCards.length / totalCards) * 100 : 0;

  const currentCard = queue[currentIndex];

  if (!deck) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 text-center">
          <p className="text-lg font-semibold text-foreground">Deck not found</p>
          <Link href="/" className="mt-4 text-sm text-primary hover:underline">
            &larr; Back to decks
          </Link>
        </div>
      </div>
    );
  }

  if (deck.cards.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
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

  function handleRate(rating: StudyRating) {
    setQueue((prev) =>
      prev.map((c, i) => (i === currentIndex ? { ...c, status: rating } : c))
    );

    // Move to next card or finish
    if (currentIndex + 1 >= queue.length) {
      setSessionDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleRestart() {
    setQueue((deck?.cards ?? []).map((c) => ({ ...c, status: "unseen" as const })));
    setCurrentIndex(0);
    setSessionDone(false);
  }

  if (sessionDone) {
    const counts = {
      again: queue.filter((c) => c.status === "again").length,
      hard: queue.filter((c) => c.status === "hard").length,
      good: queue.filter((c) => c.status === "good").length,
      easy: queue.filter((c) => c.status === "easy").length,
    };

    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-good/15">
            <Check className="h-8 w-8 text-good" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Session Complete!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You reviewed all {totalCards} cards in <span className="text-foreground font-medium">{deck.title}</span>
          </p>

          {/* Result breakdown */}
          <div className="mt-8 grid w-full grid-cols-4 gap-3">
            <ResultStat label="Again" value={counts.again} color="text-again" />
            <ResultStat label="Hard" value={counts.hard} color="text-hard" />
            <ResultStat label="Good" value={counts.good} color="text-good" />
            <ResultStat label="Easy" value={counts.easy} color="text-easy" />
          </div>

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
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-10">
        {/* Top bar */}
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

        {/* Progress bar */}
        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card */}
        <FlashcardView card={currentCard} resetKey={currentCard.id} />

        {/* Controls */}
        <div className="mt-8">
          <p className="mb-3 text-center text-xs text-muted-foreground">
            How well did you recall this?
          </p>
          <StudyControls onRate={handleRate} />
        </div>
      </main>
    </div>
  );
}

function ResultStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-4">
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

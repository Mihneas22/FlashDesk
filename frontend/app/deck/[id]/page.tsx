"use client";

import { use, useState, useEffect } from "react"; // Adăugat useEffect
import Link from "next/link";
import { ArrowLeft, Plus, PlayCircle, Pencil, Trash2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CardEditorModal } from "@/components/card-editor-modal";
import { useStore, addCard, updateCard, deleteCard } from "@/lib/store";
import type { Flashcard } from "@/lib/store";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DeckPage({ params }: PageProps) {
  const { id } = use(params);
  const { getDeckById } = useStore();
  const deck = getDeckById(id);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Stare pentru autentificare
  const [addOpen, setAddOpen] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Verificăm dacă utilizatorul este logat
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  if (!deck) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-40 text-center">
          <p className="text-lg font-semibold text-foreground">Deck not found</p>
          <Link href="/" className="mt-4 text-sm text-primary hover:underline">
            &larr; Back to decks
          </Link>
        </div>
      </div>
    );
  }

  function handleAddCard(front: string, back: string) {
    addCard(deck!.id, { front, back });
  }

  function handleEditCard(front: string, back: string) {
    if (!editCard) return;
    updateCard(deck!.id, editCard.id, { front, back });
    setEditCard(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Back */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Decks
        </Link>

        {/* Deck header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", deck.color)}>
              <span className="text-lg font-bold text-white">{deck.title[0]}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground text-balance">{deck.title}</h1>
              <p className="text-sm text-muted-foreground">{deck.description}</p>
              <p className="text-sm text-muted-foreground">{deck.topic}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/study/${deck.id}`}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <PlayCircle className="h-4 w-4" />
              Study
            </Link>
            
            {/* Butonul Add Card apare doar dacă ești logat */}
            {isLoggedIn && (
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Card
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mb-6 flex items-center gap-6 rounded-xl border border-border bg-card px-5 py-3">
          <Stat label="Total cards" value={deck.cards.length} />
          <div className="h-8 w-px bg-border" />
          <Stat label="Due today" value={Math.min(deck.cards.length, 5)} />
          <div className="h-8 w-px bg-border" />
          <Stat label="Mastered" value={0} />
        </div>

        {/* Cards list */}
        {deck.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-sm font-medium text-foreground">No cards yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLoggedIn ? "Add your first card to get started" : "Sign in to add cards to this deck"}
            </p>
            {isLoggedIn && (
              <button
                onClick={() => setAddOpen(true)}
                className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Add Card
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {deck.cards.map((card, i) => (
              <div
                key={card.id}
                className="group flex items-start justify-between rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/30 hover:bg-card-hover transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <span className="mt-0.5 text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{card.front}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 font-mono">{card.back}</p>
                  </div>
                </div>

                {/* Butoanele de Edit/Delete apar doar dacă ești logat */}
                {isLoggedIn && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                    <button
                      onClick={() => setEditCard(card)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      aria-label="Edit card"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(card.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive-foreground transition-colors"
                      aria-label="Delete card"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals... */}
      <CardEditorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddCard}
        title="Add Card"
      />

      <CardEditorModal
        open={!!editCard}
        onClose={() => setEditCard(null)}
        onSave={handleEditCard}
        initialCard={editCard ?? undefined}
        title="Edit Card"
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/50">
            <h2 className="text-base font-semibold text-foreground">Delete Card?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { deleteCard(deck.id, deleteTarget); setDeleteTarget(null); }}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-lg font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
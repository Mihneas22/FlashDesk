"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, PlayCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CardEditorModal } from "@/components/card-editor-modal";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Flashcard } from "@/lib/store";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DeckPage({ params }: PageProps) {
  const { id } = use(params);
  const { setDecks, decks } = useStore();
  
  const deck = decks.find(d => d.id === id);
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editCard, setEditCard] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchDeckData = useCallback(async () => {
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
          tips: c.tips,
        }));

        setCards(mappedCards);
      }
    } catch (error) {
      console.error("Failed to fetch deck:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    fetchDeckData();
  }, [id, fetchDeckData]);

  // UPDATE: Funcția primește acum un array de stringuri pentru tips
  async function handleAddCard(front: string, back: string, tips: string[]) {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/card/addCard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ DeckId: id, Question: front, Answer: back, Tips: tips })
      });

      if (response.ok) {
        setAddOpen(false);
        fetchDeckData();
      }
    } catch (err) { console.error(err); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/card/deleteCard/${deleteTarget}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setDeleteTarget(null);
        fetchDeckData();
      }
    } catch (err) { console.error(err); }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          All Decks
        </Link>

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
            <Link href={`/study/${deck.id}`} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <PlayCircle className="h-4 w-4" />
              Study
            </Link>
            
            {isLoggedIn && (
              <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                <Plus className="h-4 w-4" />
                Add Card
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-6 rounded-xl border border-border bg-card px-5 py-3">
          <Stat label="Total cards" value={cards?.length || 0} />
          <div className="h-8 w-px bg-border" />
          <Stat label="Due today" value={Math.min(cards?.length || 0, 5)} />
        </div>

        {cards == null || cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-sm font-medium text-foreground">No cards yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLoggedIn ? "Add your first card to get started" : "Sign in to add cards to this deck"}
            </p>
            {isLoggedIn && (
              <button onClick={() => setAddOpen(true)} className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4" />
                Add Card
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cards.map((card, i) => (
              <div key={card.id} className="group flex items-start justify-between rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/30 hover:bg-card-hover transition-colors">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <span className="mt-0.5 text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}</span>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="text-base font-medium text-foreground truncate">
                      <InlineMath math={card.front || ""} />
                    </div>
                  </div>
                </div>

                {isLoggedIn && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                    <button onClick={() => setEditCard(card)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Edit card">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(card.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive-foreground transition-colors" aria-label="Delete card">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal adaugare card */}
      <CardEditorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddCard}
        title="Add Card"
      />

      {/* Modal stergere card */}
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
                onClick={confirmDelete}
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
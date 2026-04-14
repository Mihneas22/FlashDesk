"use client";

import { useState, useEffect } from "react"; // Adăugat useEffect
import { Plus, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { DeckCard } from "@/components/deck-card";
import { useStore, addDeck } from "@/lib/store";

const DECK_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-good",
  "bg-again",
  "bg-hard",
  "bg-easy",
];

export default function DashboardPage() {
  const { decks } = useStore();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  
  // Stare pentru autentificare
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificăm dacă utilizatorul este logat la montarea componentei
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const filtered = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (!newTitle.trim()) return;
    addDeck({
      title: newTitle.trim(),
      description: newDesc.trim() || "No description",
      color: DECK_COLORS[Math.floor(Math.random() * DECK_COLORS.length)],
    });
    setNewTitle("");
    setNewDesc("");
    setShowCreateModal(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Pasăm starea de logare către Navbar */}
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              My Decks
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {decks.length} deck{decks.length !== 1 ? "s" : ""} &middot;{" "}
              {decks.reduce((acc, d) => acc + d.cards.length, 0)} total cards
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search decks..."
                className="h-9 w-48 rounded-lg border border-border bg-secondary pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Butonul de Create Deck apare doar dacă ești logat */}
            {isLoggedIn && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Create Deck
              </button>
            )}
          </div>
        </div>

        {/* Deck grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No decks found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search 
                ? "Try a different search term" 
                : isLoggedIn 
                  ? 'Create your first deck with the "Create Deck" button'
                  : 'Please sign in to create and manage your decks'}
            </p>
          </div>
        )}
      </main>

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-black/50">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Create New Deck</h2>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="deck-title" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Title
                </label>
                <input
                  id="deck-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Electromagnetics"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="deck-desc" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Description
                </label>
                <input
                  id="deck-desc"
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Short description of the topic"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
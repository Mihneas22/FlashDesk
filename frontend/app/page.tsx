"use client";

import { useState, useEffect,useCallback } from "react"; // Adăugat useEffect
import { Plus, Search, Loader2, List } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { DeckCard } from "@/components/deck-card";
import { useStore, addDeck, Deck } from "@/lib/store";
import { jwtDecode } from "jwt-decode";

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
  const [newTopic, setNewTopic] = useState("");
  const [decksList, setDecks] = useState<Deck[]>([]);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setNewUserId] = useState("");

  const fetchDecks = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/deck/getDecksByUser/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // data.decks ar trebui să fie lista venită din GetDecksResponse
        // Folosim o funcție din store pentru a salva deck-urile global
        if (data.success) {
           setDecks(data.decks); 
        }
      }
    } catch (error) {
      console.error("Failed to fetch decks:", error);
    } finally {
      setLoading(false);
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
          fetchDecks(extractedId);
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
  }, [fetchDecks]);

  const filtered = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    if (!newTitle.trim() || !userId) return;

    const deckDto = {
      userId: userId, // Luat din token via state-ul userId
      title: newTitle.trim(),
      description: newDesc.trim() || "No description",
      topic: newTopic.trim() || "General",
    };

    try {
      const response = await fetch("http://localhost:5000/api/deck/addDeck", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deckDto),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          fetchDecks(userId); 
          setNewTitle("");
          setNewDesc("");
          setNewTopic("");
          setShowCreateModal(false);
        } else {
          alert("Server error: " + result.message);
        }
      } else {
        console.error("Failed to create deck on server.");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-6xl px-6 py-10">
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
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <Search className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No decks found</p>
            <p className="text-xs text-muted-foreground">
              {search ? "Try another search" : "Your collection is empty"}
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
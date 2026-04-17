"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, BookOpen } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { DeckCard } from "@/components/deck-card";
import { jwtDecode } from "jwt-decode";

const TOPICS = [
  "Mathematical Analysis",
  "Physics",
  "C++ / Computer Programming",
  "Special Mathematics",
  "Numerical Methods",
  "Data Structures",
  "Discrete Mathematics",
  "Electrical Engineering",
  "Linear Algebra",
  "Basics of Computer Operation",
  "Object-oriented programming",
  "Assembly language programming"
];

export default function PublicDecksPage() {
  const [publicDecks, setPublicDecks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPublicDecks = useCallback(async (filterText: string) => {
    const safeFilter = filterText === "All Topics" ? "all" : encodeURIComponent(filterText);
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/deck/getPublicDecks/${safeFilter}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.flag || data.success) {
          const rawDecks = data.decks || [];
          const mappedDecks = rawDecks.map((d: any) => ({
            ...d,
            id: d.id || d.deckId,
            cards: d.cards || []
          }));
          
          setPublicDecks(mappedDecks); 
        }
      } else {
        console.error("Eroare de la server:", response.statusText);
        setPublicDecks([]);
      }
    } catch (error) {
      console.error("Failed to fetch public decks:", error);
      setPublicDecks([]);
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
        }
      } catch (error) {
        console.error("Token invalid:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
    fetchPublicDecks(selectedTopic);
  }, [fetchPublicDecks, selectedTopic]);

  const filtered = publicDecks.filter(
    (d) => 
      d.title?.toLowerCase().includes(search.toLowerCase()) || 
      d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Explore Public Decks
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover flashcards created by the community
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="h-9 w-full sm:w-48 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="All Topics">All Topics</option>
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search public decks..."
                className="h-9 w-full sm:w-48 rounded-lg border border-border bg-secondary pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((deckList) => (
              <DeckCard key={deckList.id} deck={deckList} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center bg-card/50">
            <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No decks found</p>
            <p className="text-xs text-muted-foreground">
              {search || selectedTopic !== "All Topics" 
                ? "Try adjusting your search or topic filter" 
                : "No public decks available right now"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, PlayCircle, Pencil, Trash2, Loader2, Sparkles, BookOpen, Layers } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CardEditorModal } from "@/components/card-editor-modal";
import { cn } from "@/lib/utils";
import { Flashcard } from "@/lib/store";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DeckDetails {
  id: string;
  title: string;
  description: string;
  topic: string;
  color?: string;
}

export default function DeckPage({ params }: PageProps) {
  const { id } = use(params);
  
  const [currentDeck, setCurrentDeck] = useState<DeckDetails | null>(null);
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
      const response = await fetch(`http://localhost:5000/api/deck/getDeckById/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.flag && data.deck) {
          setCurrentDeck({
            id: data.deck.deckId || id,
            title: data.deck.title || "Untitled Deck",
            description: data.deck.description || "No description provided.",
            topic: data.deck.topic || "General",
            color: data.deck.color || "bg-gradient-to-br from-violet-500 to-purple-600"
          });

          const rawCards = data.deck.deckCards || data.deck.cards || [];
          const mappedCards = rawCards.map((c: any) => ({
            id: c.cardId || c.id,
            front: c.question,
            back: c.answer,
            tips: c.tips || [],
          }));
          
          setCards(mappedCards);
        } else {
          setCurrentDeck(null);
          setCards([]);
        }
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
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50" />
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600 animate-pulse" />
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-600">Loading deck details...</p>
      </div>
    );
  }

  if (!currentDeck) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50" />
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-40 text-center px-6 animate-fade-in-up">
          <div className="w-24 h-24 rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-purple-100 flex items-center justify-center mb-6 shadow-xl">
            <BookOpen className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">Deck Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-md">The deck you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link 
            href="/" 
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to All Decks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50" />
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="animate-fade-in">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-xl bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-purple-100 text-gray-600 hover:text-violet-600 transition-all font-medium shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Decks
          </Link>

          {/* Header Section */}
          <div className="mb-10 bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg", 
                currentDeck.color?.includes('bg-') ? currentDeck.color : "bg-gradient-to-br from-violet-500 to-purple-600"
              )}>
                <span className="text-2xl font-black text-white">{currentDeck.title[0]}</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{currentDeck.title}</h1>
                <p className="text-gray-600 text-sm sm:text-base mb-1">{currentDeck.description}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
                  {currentDeck.topic}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href={`/study/${currentDeck.id}`} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all group"
              >
                <PlayCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Study Now
              </Link>
              
              {isLoggedIn && (
                <button 
                  onClick={() => setAddOpen(true)} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border-2 border-purple-200 bg-white/80 px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-purple-50 hover:border-violet-300 hover:text-violet-600 transition-all active:scale-95 group"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                  Add Card
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px] bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-purple-100 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Layers className="w-6 h-6" />
              </div>
              <Stat label="Total Cards" value={cards?.length || 0} />
            </div>
            <div className="flex-1 min-w-[150px] bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-pink-100 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <Stat label="Due Today" value={Math.min(cards?.length || 0, 5)} />
            </div>
          </div>

          {/* Cards List */}
          {cards == null || cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-purple-200 bg-white/40 backdrop-blur-sm py-24 text-center px-6 animate-fade-in-up">
              <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-xl font-bold text-gray-800">No cards yet</p>
              <p className="mt-2 text-gray-500 max-w-sm">
                {isLoggedIn 
                  ? "Build your knowledge base by adding your first flashcard." 
                  : "Sign in to contribute and add cards to this deck."}
              </p>
              {isLoggedIn && (
                <button 
                  onClick={() => setAddOpen(true)} 
                  className="mt-6 flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-600 border border-purple-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Add First Card
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-slide-up">
              {cards.map((card, i) => (
                <div 
                  key={card.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border-2 border-transparent bg-white/80 backdrop-blur-sm px-6 py-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all gap-4"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-600">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden pt-1">
                      <div className="prose prose-sm max-w-none text-gray-800 font-medium markdown-content">
                        <ReactMarkdown 
                          remarkPlugins={[remarkMath]} 
                          rehypePlugins={[rehypeKatex]}
                        >
                          {card.front || ""}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {isLoggedIn && (
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 sm:ml-4 self-end sm:self-auto">
                      <button 
                        onClick={() => setEditCard(card)} 
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-violet-100 hover:text-violet-600 transition-colors" 
                        aria-label="Edit card"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(card.id)} 
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" 
                        aria-label="Delete card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <CardEditorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddCard}
        title="Add New Card"
      />

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setDeleteTarget(null)} 
            aria-hidden="true" 
          />
          <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Delete Card?</h2>
            <p className="text-gray-500 mb-8">
              Are you sure you want to delete this flashcard? This action cannot be undone and the data will be lost forever.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
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
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out backwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-black text-gray-900 tabular-nums leading-none mb-1">{value}</span>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
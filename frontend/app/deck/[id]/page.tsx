"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, PlayCircle, Pencil, Trash2, Sparkles, BookOpen, Layers, AlertCircle, CheckCircle, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CardEditorModal } from "@/components/card-editor-modal";
import { cn } from "@/lib/utils";
import { Flashcard, ViewConfig } from "@/lib/store";
import { jwtDecode } from "jwt-decode";
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
  deckUsId: string;
}

export default function DeckPage({ params }: PageProps) {
  const { id } = use(params);
  
  const [currentDeck, setCurrentDeck] = useState<DeckDetails | null>(null);
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setNewUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [addOpen, setAddOpen] = useState(false);
  const [editCard, setEditCard] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

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
            color: data.deck.color || "bg-gradient-to-br from-violet-500 to-purple-600",
            deckUsId: data.deck.deckUserId || "Undefined Deck User Id"
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
      } else {
        showToast("Failed to fetch deck data.", "error");
      }
    } catch (error) {
      console.error("Failed to fetch deck:", error);
      showToast("Network error. Could not connect to the server.", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const extractedId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub || decoded.nameid;
        
        const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
        const userRoles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];

        if (extractedId) {
          setIsLoggedIn(true);
          setNewUserId(extractedId);
          setIsAdmin(userRoles.includes("admin"));
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Token invalid:", error);
        setIsLoggedIn(false);
        setIsAdmin(false);
        setLoading(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setLoading(false);
    }
    fetchDeckData();
  }, [id, fetchDeckData]);

  async function handleAddCard(front: string, back: string, tips: string[], graphConfig?: ViewConfig | null) {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/card/addCard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ DeckId: id, Question: front, Answer: back, Tips: tips, GraphConfig: graphConfig || null })
      });
      if (response.ok) {
        setAddOpen(false);
        showToast("Card added successfully!", "success");
        fetchDeckData();
      } else {
        showToast("Failed to add the card.", "error");
      }
    } catch (err) { 
      console.error(err);
      showToast("Network error. Could not add the card.", "error");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`http://localhost:5000/api/card/deleteCard`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          CardId: deleteTarget, 
          DeckId: id,
        })
      });
      
      if (response.ok) {
        setDeleteTarget(null);
        showToast("Card deleted successfully!", "success");
        fetchDeckData();
      } else {
        console.error("Error deleting card");
        showToast("Failed to delete the card.", "error");
      }
    } catch (err) { 
      console.error(err);
      showToast("Network error. Could not delete the card.", "error");
    }
  }

  async function handleEditCard(front: string, back: string, tips: string[], graphConfig?: ViewConfig | null) {
    if (!editCard) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/card/editCard`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          CardId: editCard.id, 
          DeckId: id, 
          Question: front, 
          Answer: back, 
          Tips: tips,
          GraphConfig: graphConfig || null 
        })
      });

      if (response.ok) {
        setEditCard(null);
        showToast("Card updated successfully!", "success");
        fetchDeckData(); 
      } else {
        console.error("Error editing card");
        showToast("Failed to update the card.", "error");
      }
    } catch (err) { 
      console.error(err);
      showToast("Network error. Could not update the card.", "error");
    }
  }

  const showEditsModal = (userId === currentDeck?.deckUsId) || isAdmin;

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-violet-500 animate-pulse" />
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-400">Loading deck details...</p>
      </div>
    );
  }

  if (!currentDeck) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-40 text-center px-6 animate-fade-in-up">
          <div className="w-24 h-24 rounded-3xl bg-[#121317] border border-white/10 flex items-center justify-center mb-6 shadow-xl">
            <BookOpen className="w-10 h-10 text-violet-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Deck Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md">The deck you're looking for doesn't exist or you don't have permission to view it.</p>
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
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="animate-fade-in">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-xl bg-[#121317] border border-white/10 text-gray-400 hover:text-white transition-all font-medium shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Decks
          </Link>

          <div className="mb-10 bg-[#121317] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg", 
                currentDeck.color?.includes('bg-') ? currentDeck.color : "bg-gradient-to-br from-violet-500 to-purple-600"
              )}>
                <span className="text-2xl font-black text-white">{currentDeck.title[0]}</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">{currentDeck.title}</h1>
                <p className="text-gray-400 text-sm sm:text-base mb-2">{currentDeck.description}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider border border-violet-500/20">
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
              
              {isLoggedIn && showEditsModal && (
                <button 
                  onClick={() => setAddOpen(true)} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 group"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                  Add Card
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px] bg-[#121317] rounded-2xl p-5 border border-white/10 shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Layers className="w-6 h-6" />
              </div>
              <Stat label="Total Cards" value={cards?.length || 0} />
            </div>
            <div className="flex-1 min-w-[150px] bg-[#121317] rounded-2xl p-5 border border-white/10 shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <Stat label="Due Today" value={Math.min(cards?.length || 0, 5)} />
            </div>
          </div>

          {cards == null || cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-[#121317] py-24 text-center px-6 animate-fade-in-up">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-violet-500" />
              </div>
              <p className="text-xl font-bold text-white">No cards yet</p>
              <p className="mt-2 text-gray-400 max-w-sm">
                {isLoggedIn 
                  ? "Build your knowledge base by adding your first flashcard." 
                  : "Sign in to contribute and add cards to this deck."}
              </p>
              {isLoggedIn && showEditsModal && (
                <button 
                  onClick={() => setAddOpen(true)} 
                  className="mt-6 flex items-center gap-2 rounded-xl bg-white/5 px-6 py-3 text-sm font-bold text-white border border-white/10 shadow-sm hover:bg-white/10 transition-all"
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
                  className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-white/5 bg-[#121317] px-6 py-5 shadow-lg hover:border-violet-500/50 transition-all gap-4"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-gray-400">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden pt-1">
                      <div className="prose prose-sm prose-invert max-w-none text-gray-300 font-medium markdown-content">
                        <ReactMarkdown 
                          remarkPlugins={[remarkMath]} 
                          rehypePlugins={[rehypeKatex]}
                        >
                          {card.front}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {isLoggedIn && showEditsModal && (
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 sm:ml-4 self-end sm:self-auto">
                      <button 
                        onClick={() => setEditCard(card)} 
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-violet-500/20 hover:text-violet-400 transition-colors" 
                        aria-label="Edit card"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(card.id)} 
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors" 
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
        initialCard={null}
      />

      {editCard && (
        <CardEditorModal
          open={!!editCard}
          onClose={() => setEditCard(null)}
          onSave={handleEditCard}
          title="Edit Card"
          initialCard={editCard} 
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setDeleteTarget(null)} 
            aria-hidden="true" 
          />
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#121317] p-8 shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Delete Card?</h2>
            <p className="text-gray-400 mb-8">
              Are you sure you want to delete this flashcard? This action cannot be undone and the data will be lost forever.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
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

      {/* Global Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up transition-all ${
          toast.type === "error" 
            ? "bg-red-950/90 border-red-500/50 text-red-200" 
            : "bg-green-950/90 border-green-500/50 text-green-200"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          <p className="font-semibold text-sm mr-2">{toast.message}</p>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))} 
            className={`p-1 rounded-lg transition-colors ${
              toast.type === "error" ? "hover:bg-red-900/50" : "hover:bg-green-900/50"
            }`}
          >
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
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out backwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-black text-white tabular-nums leading-none mb-1">{value}</span>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
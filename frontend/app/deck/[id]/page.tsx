"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, PlayCircle, Pencil, Trash2, BookOpen, AlertCircle, CheckCircle, X, Terminal, Code2, Database, Activity, LayoutGrid } from "lucide-react";
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
      const response = await fetch(`https://learnqhub.com/api/deck/getDeckById/${id}`, {
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
            color: data.deck.color || "bg-[#252D3D]",
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
      const response = await fetch(`https://learnqhub.com/api/card/addCard`, {
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
      const response = await fetch(`https://learnqhub.com/api/card/deleteCard`, {
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
      const response = await fetch(`https://learnqhub.com/api/card/editCard`, {
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
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#0F1419]">
        <div className="flex flex-col items-center gap-4 font-mono text-sm text-[#7A8394]">
          <div className="w-12 h-12 rounded-lg border-2 border-[#2A3142] border-t-[#00D9FF] animate-spin" />
          <p className="tracking-widest animate-pulse">INITIALIZING_ENVIRONMENT...</p>
        </div>
      </div>
    );
  }

  if (!currentDeck) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-[#E8EAED] font-sans">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex flex-col items-center justify-center pt-40 text-center px-6 animate-fade-in">
          <div className="w-16 h-16 rounded-xl bg-[#1A1F2E] border border-[#2A3142] flex items-center justify-center mb-6 shadow-xl">
            <Terminal className="w-8 h-8 text-[#FFB84D]" />
          </div>
          <h2 className="text-2xl font-mono font-bold text-[#E8EAED] mb-2">ERR_DECK_NOT_FOUND</h2>
          <p className="text-[#7A8394] mb-8 max-w-md text-sm">The targeted scope link is missing, corrupted, or access clearance is unverified.</p>
          <Link 
            href="/dashboard" 
            className="px-5 py-2.5 rounded-lg bg-[#252D3D] border border-[#2A3142] text-[#E8EAED] font-mono text-sm hover:border-[#00D9FF] transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN_TO_DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#E8EAED] font-sans selection:bg-[#00D9FF]/30">
      {/* Grid pattern specific to the tech theme */}
      <div className="fixed inset-0 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#2A3142 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.15 }} />

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 relative z-10 animate-fade-in">
        <div>
          {/* Back Trigger */}
          <Link 
            href="/dashboard" 
            className="group inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-lg bg-[#1A1F2E] border border-[#2A3142] text-[#7A8394] hover:text-[#E8EAED] hover:border-[#00D9FF]/40 transition-all font-mono text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            ../all_decks
          </Link>

          {/* Repository Deck Header Panel */}
          <div className="mb-6 bg-[#1A1F2E] rounded-xl p-6 border border-[#2A3142] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#252D3D] border border-[#2A3142] text-[#00D9FF] font-mono font-black text-xl shadow-inner">
                {currentDeck.title[0]?.toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#E8EAED]">{currentDeck.title}</h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#252D3D] text-[#FFB84D] border border-[#FFB84D]/20 font-mono text-[10px] tracking-wider uppercase font-bold">
                    {currentDeck.topic}
                  </span>
                </div>
                <p className="text-[#7A8394] text-sm max-w-xl">{currentDeck.description}</p>
              </div>
            </div>

            {/* Panel Control Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href={`/study/${currentDeck.id}`} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-[#00D9FF] text-[#0F1419] font-mono text-sm font-bold px-5 py-2.5 hover:bg-[#00B8D4] transition-all shadow-[0_0_15px_rgba(0,217,255,0.15)] group"
              >
                <PlayCircle className="h-4 w-4" />
                EXECUTE_STUDY
              </Link>
              
              {isLoggedIn && showEditsModal && (
                <button 
                  onClick={() => setAddOpen(true)} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg border border-[#2A3142] bg-[#252D3D] text-[#E8EAED] font-mono text-sm font-bold px-5 py-2.5 hover:border-[#00D9FF]/60 hover:bg-[#2A3142] transition-all group"
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                  ADD_CARD
                </button>
              )}
            </div>
          </div>

          {/* IDE Style Metadata Dashboard Counters */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="bg-[#1A1F2E] rounded-xl p-4 border border-[#2A3142] flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-md bg-[#252D3D] border border-[#2A3142] flex items-center justify-center text-[#00D9FF]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xl font-mono font-bold text-[#E8EAED] leading-none mb-1">{cards?.length || 0}</span>
                <span className="block text-[10px] font-mono font-bold text-[#7A8394] tracking-wider uppercase">Compilation Units</span>
              </div>
            </div>
            <div className="bg-[#1A1F2E] rounded-xl p-4 border border-[#2A3142] flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-md bg-[#252D3D] border border-[#2A3142] flex items-center justify-center text-[#FFB84D]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xl font-mono font-bold text-[#E8EAED] leading-none mb-1">{Math.min(cards?.length || 0, 5)}</span>
                <span className="block text-[10px] font-mono font-bold text-[#7A8394] tracking-wider uppercase">Active In Queue</span>
              </div>
            </div>
          </div>

          {/* Card Execution Rows Context */}
          {cards == null || cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#2A3142] bg-[#1A1F2E] py-20 text-center px-6">
              <div className="w-12 h-12 rounded-lg bg-[#252D3D] border border-[#2A3142] flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-[#7A8394]" />
              </div>
              <p className="text-base font-mono font-bold text-[#E8EAED]">BUFFER_EMPTY</p>
              <p className="mt-1 text-sm text-[#7A8394] max-w-xs">
                {isLoggedIn 
                  ? "No components defined in this module repository scope yet." 
                  : "Authentication required to append lines to this structure."}
              </p>
              {isLoggedIn && showEditsModal && (
                <button 
                  onClick={() => setAddOpen(true)} 
                  className="mt-5 flex items-center gap-2 rounded-lg bg-[#252D3D] text-xs font-mono font-bold text-[#00D9FF] border border-[#2A3142] px-4 py-2 hover:bg-[#2A3142] transition-all"
                >
                  <Plus className="h-3.5 h-3.5" />
                  INIT_FIRST_CARD
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 animate-slide-up">
              {cards.map((card, i) => (
                <div 
                  key={card.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#2A3142] bg-[#1A1F2E] px-5 py-4 shadow-sm hover:border-[#7A8394]/50 hover:bg-[#1F2635] transition-all gap-4"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="flex h-6 w-11 shrink-0 items-center justify-center rounded bg-[#252D3D] font-mono text-[11px] font-bold text-[#7A8394] border border-[#2A3142]">
                      LN_{String(i + 1).padStart(3, '0')}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden pt-0.5">
                      <div className="prose prose-sm prose-invert max-w-none text-[#E8EAED] text-sm font-medium markdown-content">
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
                    <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-end sm:self-auto">
                      <button 
                        onClick={() => setEditCard(card)} 
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-[#252D3D] border border-[#2A3142] text-[#7A8394] hover:text-[#00D9FF] hover:border-[#00D9FF]/30 transition-colors" 
                        aria-label="Edit item lines"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(card.id)} 
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-[#252D3D] border border-[#2A3142] text-[#7A8394] hover:text-red-400 hover:border-red-500/30 transition-colors" 
                        aria-label="Terminate row sequence"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Structured Modals & System Prompts */}
      <CardEditorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddCard}
        title="Add New Card Component"
        initialCard={null}
      />

      {editCard && (
        <CardEditorModal
          open={!!editCard}
          onClose={() => setEditCard(null)}
          onSave={handleEditCard}
          title="Modify Sequence Scope"
          initialCard={editCard} 
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setDeleteTarget(null)} 
            aria-hidden="true" 
          />
          <div className="relative w-full max-w-sm rounded-xl border border-[#2A3142] bg-[#1A1F2E] p-6 shadow-2xl animate-scale-in">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-mono font-bold text-[#E8EAED] mb-1.5">TERMINATE_OBJECT?</h2>
            <p className="text-[#7A8394] text-xs mb-6 leading-relaxed">
              Are you sure you want to drop this component frame sequence data? Memory blocks cannot be re-allocated after continuous destruction execution.
            </p>
            <div className="flex justify-end gap-2.5 font-mono text-xs">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="px-4 py-2 rounded-md font-bold text-[#7A8394] hover:bg-[#252D3D] hover:text-[#E8EAED] transition-colors"
              >
                ABORT
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-500 text-[#0F1419] font-bold hover:bg-red-600 transition-all shadow-[0_0_10px_rgba(239,68,68,0.15)]"
              >
                CONFIRM_DROP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified System Toast Diagnostics Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up font-mono text-xs ${
          toast.type === "error" 
            ? "bg-[#1A1F2E] border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
            : "bg-[#1A1F2E] border-[#4ADE80] text-green-200 shadow-[0_0_20px_rgba(74,222,128,0.1)]"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#4ADE80]" />
          )}
          <span className="font-bold tracking-tight">{toast.message}</span>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))} 
            className="p-1 rounded ml-1.5 hover:bg-[#252D3D] text-[#7A8394] hover:text-[#E8EAED] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out backwards; }
        .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-mono font-bold text-[#E8EAED] tabular-nums leading-none mb-1">{value}</span>
      <span className="text-[10px] font-mono font-bold text-[#7A8394] uppercase tracking-wider">{label}</span>
    </div>
  );
}
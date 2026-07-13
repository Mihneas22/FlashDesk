"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Plus, PlayCircle, Pencil, Trash2, BookOpen, 
  AlertCircle, CheckCircle, X, Terminal, Code2, Database, 
  Activity, LayoutGrid, Search, ChevronDown, ChevronUp, PieChart, Hash
} from "lucide-react";
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
  
  // UX States
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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

  const toggleExpand = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const showEditsModal = (userId === currentDeck?.deckUsId) || isAdmin;

  // Filter cards based on search query (Front and Back)
  const filteredCards = cards?.filter(card => 
    card.front.toLowerCase().includes(searchQuery.toLowerCase()) || 
    card.back.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock Mastery Calculation
  const mockMastery = cards && cards.length > 0 ? Math.floor(Math.random() * 40) + 45 : 0; // Random 45-85% for demo

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
      <div className="fixed inset-0 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#2A3142 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.15 }} />

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 relative z-10 animate-fade-in">
        <div>
          <Link 
            href="/dashboard" 
            className="group inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-lg bg-[#1A1F2E] border border-[#2A3142] text-[#7A8394] hover:text-[#E8EAED] hover:border-[#00D9FF]/40 transition-all font-mono text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            ../all_decks
          </Link>

          <div className="mb-6 bg-[#1A1F2E] rounded-xl p-6 border border-[#2A3142] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Subtle tech background accent */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#00D9FF]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#252D3D] border border-[#2A3142] text-[#00D9FF] font-mono font-black text-2xl shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#00D9FF]/10 to-transparent opacity-50" />
                {currentDeck.title[0]?.toUpperCase()}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#E8EAED]">{currentDeck.title}</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#252D3D] text-[#FFB84D] border border-[#FFB84D]/20 font-mono text-[10px] tracking-wider uppercase font-bold">
                    <Code2 className="w-3 h-3" />
                    {currentDeck.topic}
                  </span>
                </div>
                <p className="text-[#7A8394] text-sm max-w-xl">{currentDeck.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10">
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
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1A1F2E] rounded-xl p-4 border border-[#2A3142] flex items-center gap-3.5 hover:border-[#7A8394]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#252D3D] border border-[#2A3142] flex items-center justify-center text-[#00D9FF]">
                <Database className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-xl font-mono font-bold text-[#E8EAED] leading-none mb-1">{cards?.length || 0}</span>
                <span className="block text-[10px] font-mono font-bold text-[#7A8394] tracking-wider uppercase">Compilation Units</span>
              </div>
            </div>
            
            <div className="bg-[#1A1F2E] rounded-xl p-4 border border-[#2A3142] flex items-center gap-3.5 hover:border-[#7A8394]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#252D3D] border border-[#2A3142] flex items-center justify-center text-[#FFB84D]">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-xl font-mono font-bold text-[#E8EAED] leading-none mb-1">{Math.min(cards?.length || 0, 5)}</span>
                <span className="block text-[10px] font-mono font-bold text-[#7A8394] tracking-wider uppercase">Active In Queue</span>
              </div>
            </div>

            <div className="bg-[#1A1F2E] rounded-xl p-4 border border-[#2A3142] flex flex-col justify-center gap-2 hover:border-[#7A8394]/30 transition-colors">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#4ADE80]" />
                  <span className="text-[10px] font-mono font-bold text-[#7A8394] tracking-wider uppercase">Test Coverage</span>
                </div>
                <span className="text-sm font-mono font-bold text-[#4ADE80]">{mockMastery}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#252D3D] rounded-full overflow-hidden">
                <div className="h-full bg-[#4ADE80] rounded-full" style={{ width: `${mockMastery}%` }} />
              </div>
            </div>
          </div>

          {/* List Toolbar (Search & Filters) */}
          {cards && cards.length > 0 && (
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#7A8394]" />
                </div>
                <input
                  type="text"
                  placeholder="grep 'keyword' ./deck_cards"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#2A3142] rounded-lg bg-[#1A1F2E] text-[#E8EAED] font-mono text-sm focus:outline-none focus:border-[#00D9FF]/50 focus:ring-1 focus:ring-[#00D9FF]/50 transition-all placeholder:text-[#7A8394]/50"
                />
              </div>
            </div>
          )}

          {/* Card Execution Rows Context */}
          {cards == null || cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#2A3142] bg-[#1A1F2E] py-20 text-center px-6">
              <div className="w-12 h-12 rounded-lg bg-[#252D3D] border border-[#2A3142] flex items-center justify-center mb-4">
                <Terminal className="w-5 h-5 text-[#7A8394]" />
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
                  className="mt-5 flex items-center gap-2 rounded-lg bg-[#252D3D] text-xs font-mono font-bold text-[#00D9FF] border border-[#2A3142] px-4 py-2 hover:bg-[#2A3142] hover:border-[#00D9FF]/40 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  INIT_FIRST_CARD
                </button>
              )}
            </div>
          ) : filteredCards?.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#2A3142] bg-[#1A1F2E] py-16 text-center px-6">
              <Search className="w-8 h-8 text-[#7A8394] mb-3" />
              <p className="text-sm font-mono font-bold text-[#E8EAED]">NO_MATCHES_FOUND</p>
              <p className="mt-1 text-xs text-[#7A8394] font-mono">Exit status 1. Try a different grep pattern.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 animate-slide-up">
              {filteredCards?.map((card, i) => {
                const isExpanded = expandedCards.has(card.id);
                // Generate some mock tags visually based on the index to look cool
                const mockTags = i % 3 === 0 ? ['concept'] : i % 2 === 0 ? ['syntax', 'core'] : ['review'];

                return (
                  <div 
                    key={card.id} 
                    className={cn(
                      "group flex flex-col rounded-xl border transition-all overflow-hidden",
                      isExpanded ? "border-[#00D9FF]/30 bg-[#1F2635] shadow-[0_4px_20px_rgba(0,0,0,0.2)]" : "border-[#2A3142] bg-[#1A1F2E] hover:border-[#7A8394]/50 hover:bg-[#1F2635]"
                    )}
                    style={{ animationDelay: `${(i % 10) * 30}ms` }}
                  >
                    {/* Front of Card (Always visible) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4">
                      <div className="flex items-start gap-4 min-w-0 flex-1 cursor-pointer" onClick={() => toggleExpand(card.id)}>
                        <div className="flex flex-col gap-1.5 items-center mt-0.5">
                          <div className={cn(
                            "flex h-6 w-11 shrink-0 items-center justify-center rounded font-mono text-[11px] font-bold border transition-colors",
                            isExpanded ? "bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30" : "bg-[#252D3D] text-[#7A8394] border-[#2A3142]"
                          )}>
                            LN_{String(i + 1).padStart(3, '0')}
                          </div>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="prose prose-sm prose-invert max-w-none text-[#E8EAED] text-sm font-medium markdown-content line-clamp-3">
                            <ReactMarkdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex]}
                            >
                              {card.front}
                            </ReactMarkdown>
                          </div>
                          
                          {/* Mock Tags */}
                          <div className="flex items-center gap-1.5 mt-2.5">
                            {mockTags.map(tag => (
                              <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#252D3D] border border-[#2A3142] text-[9px] font-mono text-[#7A8394] uppercase tracking-wider">
                                <Hash className="w-2.5 h-2.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button 
                          onClick={() => toggleExpand(card.id)} 
                          className="flex h-8 px-2.5 items-center justify-center gap-1.5 rounded-md bg-[#252D3D] border border-[#2A3142] text-[#7A8394] hover:text-[#E8EAED] hover:bg-[#2A3142] transition-colors font-mono text-[10px] font-bold mr-2" 
                        >
                          {isExpanded ? (
                            <><ChevronUp className="h-3.5 w-3.5" /> FOLD</>
                          ) : (
                            <><ChevronDown className="h-3.5 w-3.5" /> EXPAND</>
                          )}
                        </button>

                        {isLoggedIn && showEditsModal && (
                          <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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
                    </div>

                    {/* Back of Card (Expanded Payload) */}
                    {isExpanded && (
                      <div className="border-t border-[#2A3142] bg-[#12161F] px-5 py-4 pb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Terminal className="w-3.5 h-3.5 text-[#4ADE80]" />
                          <span className="text-[10px] font-mono font-bold text-[#7A8394] tracking-wider uppercase">Returned Payload (Answer)</span>
                        </div>
                        <div className="pl-5 border-l-2 border-[#2A3142] ml-1.5 prose prose-sm prose-invert max-w-none text-[#E8EAED] text-sm font-medium markdown-content">
                          <ReactMarkdown 
                            remarkPlugins={[remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                          >
                            {card.back}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
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
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { 
  BookOpen, MoreVertical, Eye, Lock, Sparkles, Layers, 
  Edit2, Trash2, X, AlertCircle, Save, Loader2 
} from "lucide-react";
import Link from "next/link";
import { Deck } from "@/lib/store";

interface DeckCardProps {
  usId: string;
  deck: Deck;
  onDeckDeleted?: (deckId: string) => void;
  onDeckUpdated?: () => void;
}

const topicColors: Record<string, { gradient: string; badgeBg: string; badgeText: string; shadow: string }> = {
  "Mathematical Analysis": { gradient: "from-blue-500 to-cyan-500", badgeBg: "bg-blue-50", badgeText: "text-blue-600", shadow: "shadow-blue-500/30" },
  "Physics": { gradient: "from-purple-500 to-pink-500", badgeBg: "bg-purple-50", badgeText: "text-purple-600", shadow: "shadow-purple-500/30" },
  "C++ / Computer Programming": { gradient: "from-green-500 to-emerald-500", badgeBg: "bg-emerald-50", badgeText: "text-emerald-600", shadow: "shadow-green-500/30" },
  "Special Mathematics": { gradient: "from-orange-500 to-red-500", badgeBg: "bg-orange-50", badgeText: "text-orange-600", shadow: "shadow-orange-500/30" },
  "Numerical Methods": { gradient: "from-indigo-500 to-purple-500", badgeBg: "bg-indigo-50", badgeText: "text-indigo-600", shadow: "shadow-indigo-500/30" },
  "Data Structures": { gradient: "from-teal-500 to-cyan-500", badgeBg: "bg-teal-50", badgeText: "text-teal-600", shadow: "shadow-teal-500/30" },
  "Discrete Mathematics": { gradient: "from-pink-500 to-rose-500", badgeBg: "bg-pink-50", badgeText: "text-pink-600", shadow: "shadow-pink-500/30" },
  "Electrical Engineering": { gradient: "from-yellow-500 to-orange-500", badgeBg: "bg-yellow-50", badgeText: "text-yellow-600", shadow: "shadow-yellow-500/30" },
  "Linear Algebra": { gradient: "from-violet-500 to-purple-500", badgeBg: "bg-violet-50", badgeText: "text-violet-600", shadow: "shadow-violet-500/30" },
  "Basics of Computer Operation": { gradient: "from-sky-500 to-blue-500", badgeBg: "bg-sky-50", badgeText: "text-sky-600", shadow: "shadow-sky-500/30" },
  "Object-oriented programming": { gradient: "from-emerald-500 to-teal-500", badgeBg: "bg-emerald-50", badgeText: "text-emerald-600", shadow: "shadow-emerald-500/30" },
  "Assembly language programming": { gradient: "from-slate-600 to-gray-700", badgeBg: "bg-slate-100", badgeText: "text-slate-700", shadow: "shadow-slate-500/30" }
};

const defaultColors = { 
  gradient: "from-violet-500 to-fuchsia-500", 
  badgeBg: "bg-violet-50",
  badgeText: "text-violet-600",
  shadow: "shadow-violet-500/30"
};

export function DeckCard({ usId, deck, onDeckDeleted, onDeckUpdated }: DeckCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  
  const colors = deck.topic ? (topicColors[deck.topic] || defaultColors) : defaultColors;
  const cardCount = deck.cards?.length || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const openEditModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  };
  

  const handleDelete = async () => {
    setIsLoading(true);
    
    const deletePayload = {
      deckId: deck.id,
      userId: usId 
    };

    try {
      const response = await fetch(`http://localhost:5000/api/deck/deleteDeck`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deletePayload),
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        if (onDeckDeleted) onDeckDeleted(deck.id);
      } else {
        console.error("Eroare la ștergere.");
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API CALL: EDIT ---
  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const editPayload = {
      deckId: deck.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      topic: formData.get("topic") as string,
      status: formData.get("status") ? "1" : "0" // 1 public, 0 private (conform C#)
    };

    try {
      const response = await fetch(`http://localhost:5000/api/deck/editDeck`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPayload),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        if (onDeckUpdated) onDeckUpdated();
      } else {
        console.error("Eroare la editare.");
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Link href={`/deck/${deck.id}`} className="block h-full outline-none">
        <div className="group relative h-full flex flex-col">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-[2rem] opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-500" />
          
          <div className="relative flex flex-col h-full bg-white/95 backdrop-blur-sm rounded-3xl border border-purple-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgb(139,92,246,0.1)] transition-all duration-500 group-hover:-translate-y-1.5 overflow-hidden">
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-5">
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} p-[2px] shadow-lg ${colors.shadow} transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-500`}>
                  <div className="w-full h-full rounded-[14px] bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                </div>

                {/* Meniu Dropdown */}
                {usId !== "empty" && (
                  <div className="relative" ref={menuRef}>
                    <button 
                      className={`p-2 rounded-xl text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors z-10 relative ${isMenuOpen ? 'opacity-100 bg-violet-50 text-violet-600' : 'opacity-0 group-hover:opacity-100'}`}
                      onClick={toggleMenu}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-36 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.1)] border border-purple-50 overflow-hidden z-20 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1.5 flex flex-col gap-1">
                          <button 
                            onClick={openEditModal}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-semibold text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button 
                            onClick={openDeleteModal}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
                  {deck.title}
                </h3>
                {deck.description && (
                  <p className="text-sm font-medium text-gray-500 line-clamp-2 mb-4">
                    {deck.description}
                  </p>
                )}
                
                <div className="flex-1" />

                {deck.topic && (
                  <div className="mt-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${colors.badgeBg} ${colors.badgeText} transition-colors`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      {deck.topic}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-purple-50/50">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                <Layers className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-bold text-gray-700">{cardCount}</span>
                <span className="text-xs font-bold text-gray-400">
                  {cardCount === 1 ? "CARD" : "CARDS"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {deck.status === false ? (
                  <div className="flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-lg">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Private</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Public</span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.06]">
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} transform rotate-45 translate-x-16 -translate-y-16 rounded-3xl`} />
            </div>

          </div>
        </div>
      </Link>

      {/* 2. MODAL ȘTERGERE (Rămâne în afara Link-ului) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isLoading && setIsDeleteModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-5 border border-red-100">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Deck</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-700">"{deck.title}"</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Deleting..." : "Yes, delete it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL EDITARE (Rămâne în afara Link-ului) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isLoading && setIsEditModalOpen(false)} />
          
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Edit Deck</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 overflow-y-auto flex-1">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Title</label>
                  <input 
                      name="title" 
                      defaultValue={deck.title} 
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-gray-900 font-medium"
                    />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Topic</label>
                  <input 
                    name="topic" defaultValue={deck.topic} required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-gray-900 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea 
                    name="description" defaultValue={deck.description} required rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none resize-none text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="status" defaultChecked={deck.status} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-3 text-sm font-bold text-gray-700">Make this deck public</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end pt-6 border-t border-gray-100">
                <button 
                  type="button" onClick={() => setIsEditModalOpen(false)} disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { 
  BookOpen, MoreVertical, Eye, Lock, Sparkles, Layers, 
  Edit2, Trash2, X, AlertCircle, Save, Loader2, CheckCircle 
} from "lucide-react";
import Link from "next/link";
import { Deck } from "@/lib/store";

interface DeckCardProps {
  usId: string;
  deck: Deck;
  onDeckDeleted?: (deckId: string) => void;
  onDeckUpdated?: () => void;
}

// Enhanced color palette mapping for topics using LearnQHub brand colors
const topicColors: Record<string, { 
  gradient: string; 
  bgGradient: string; 
  badge: string; 
  badgeText: string; 
  icon: string;
  iconBg: string;
  hoverShadow: string;
}> = {
  "Mathematical Analysis": { 
    gradient: "from-cyan-500 to-cyan-600", 
    bgGradient: "from-cyan-500/8 to-cyan-600/8",
    badge: "bg-cyan-500/25", 
    badgeText: "text-cyan-300", 
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    hoverShadow: "hover:shadow-cyan-500/20"
  },
  "Physics": { 
    gradient: "from-amber-500 to-amber-600", 
    bgGradient: "from-amber-500/8 to-amber-600/8",
    badge: "bg-amber-500/25", 
    badgeText: "text-amber-300", 
    icon: "text-amber-400",
    iconBg: "bg-amber-500/15",
    hoverShadow: "hover:shadow-amber-500/20"
  },
  "C++ / Computer Programming": { 
    gradient: "from-green-500 to-green-600", 
    bgGradient: "from-green-500/8 to-green-600/8",
    badge: "bg-green-500/25", 
    badgeText: "text-green-300", 
    icon: "text-green-400",
    iconBg: "bg-green-500/15",
    hoverShadow: "hover:shadow-green-500/20"
  },
  "Special Mathematics": { 
    gradient: "from-red-500 to-red-600", 
    bgGradient: "from-red-500/8 to-red-600/8",
    badge: "bg-red-500/25", 
    badgeText: "text-red-300", 
    icon: "text-red-400",
    iconBg: "bg-red-500/15",
    hoverShadow: "hover:shadow-red-500/20"
  },
  "Numerical Methods": { 
    gradient: "from-cyan-500 to-blue-600", 
    bgGradient: "from-cyan-500/8 to-blue-600/8",
    badge: "bg-cyan-500/25", 
    badgeText: "text-cyan-300", 
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    hoverShadow: "hover:shadow-cyan-500/20"
  },
  "Data Structures": { 
    gradient: "from-green-500 to-cyan-600", 
    bgGradient: "from-green-500/8 to-cyan-600/8",
    badge: "bg-green-500/25", 
    badgeText: "text-green-300", 
    icon: "text-green-400",
    iconBg: "bg-green-500/15",
    hoverShadow: "hover:shadow-green-500/20"
  },
  "Discrete Mathematics": { 
    gradient: "from-amber-500 to-amber-600", 
    bgGradient: "from-amber-500/8 to-amber-600/8",
    badge: "bg-amber-500/25", 
    badgeText: "text-amber-300", 
    icon: "text-amber-400",
    iconBg: "bg-amber-500/15",
    hoverShadow: "hover:shadow-amber-500/20"
  },
  "Electrical Engineering": { 
    gradient: "from-amber-500 to-red-600", 
    bgGradient: "from-amber-500/8 to-red-600/8",
    badge: "bg-amber-500/25", 
    badgeText: "text-amber-300", 
    icon: "text-amber-400",
    iconBg: "bg-amber-500/15",
    hoverShadow: "hover:shadow-amber-500/20"
  },
  "Linear Algebra": { 
    gradient: "from-cyan-500 to-cyan-600", 
    bgGradient: "from-cyan-500/8 to-cyan-600/8",
    badge: "bg-cyan-500/25", 
    badgeText: "text-cyan-300", 
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    hoverShadow: "hover:shadow-cyan-500/20"
  },
  "Basics of Computer Operation": { 
    gradient: "from-green-500 to-green-600", 
    bgGradient: "from-green-500/8 to-green-600/8",
    badge: "bg-green-500/25", 
    badgeText: "text-green-300", 
    icon: "text-green-400",
    iconBg: "bg-green-500/15",
    hoverShadow: "hover:shadow-green-500/20"
  },
  "Object-oriented programming": { 
    gradient: "from-green-500 to-green-600", 
    bgGradient: "from-green-500/8 to-green-600/8",
    badge: "bg-green-500/25", 
    badgeText: "text-green-300", 
    icon: "text-green-400",
    iconBg: "bg-green-500/15",
    hoverShadow: "hover:shadow-green-500/20"
  },
  "Assembly language programming": { 
    gradient: "from-slate-600 to-slate-700", 
    bgGradient: "from-slate-600/8 to-slate-700/8",
    badge: "bg-slate-600/25", 
    badgeText: "text-slate-300", 
    icon: "text-slate-400",
    iconBg: "bg-slate-600/15",
    hoverShadow: "hover:shadow-slate-500/20"
  },
  "Others": {
    gradient: "from-amber-500 to-amber-600", 
    bgGradient: "from-amber-500/8 to-amber-600/8",
    badge: "bg-amber-500/25",
    badgeText: "text-amber-300",
    icon: "text-amber-400",
    iconBg: "bg-amber-500/15",
    hoverShadow: "hover:shadow-amber-500/20"
  }
};

const defaultColors = { 
  gradient: "from-amber-500 to-amber-600", 
  bgGradient: "from-amber-500/8 to-amber-600/8",
  badge: "bg-amber-500/25",
  badgeText: "text-amber-300",
  icon: "text-amber-400",
  iconBg: "bg-amber-500/15",
  hoverShadow: "hover:shadow-amber-500/20"
};

export function DeckCard({ usId, deck, onDeckDeleted, onDeckUpdated }: DeckCardProps) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  type ToastState = {
    show: boolean;
    message: string;
    type: "error" | "success";
  };
  
  const menuRef = useRef<HTMLDivElement>(null);
  const colors = (deck.topic && topicColors[deck.topic]) ? topicColors[deck.topic] : defaultColors;
  const cardCount = deck.cards?.length || 0;

  const [toast, setToast] = useState<ToastState>({ 
      show: false, 
      message: "", 
      type: "error" 
    });
  
  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
  }, []);
  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.show]);
  

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

    try {
      const response = await fetch(`https://learnqhub.com/api/deck/deleteDeck/${deck.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const text = await response.text();
        let isSuccess = true;
        let errorMessage = "Could not delete the deck.";

        if (text) {
          try {
            const result = JSON.parse(text);
            if (result.success === false || result.flag === false) {
              isSuccess = false;
              errorMessage = result.message || errorMessage;
            }
          } catch (e) {
            // Valid OK response
          }
        }

        if (isSuccess) {
          setIsDeleteModalOpen(false);
          showToast("Deck deleted successfully!", "success");
          setTimeout(() => {
             if (onDeckDeleted) onDeckDeleted(deck.id);
          }, 300);
        } else {
          showToast(errorMessage, "error");
        }
      } else {
        showToast("Server encountered an error while deleting.", "error");
      }
    } catch (error) {
      console.error("Network error:", error);
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const editPayload = {
      deckId: deck.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      topic: formData.get("topic") as string,
      status: formData.get("status") ? "1" : "0"
    };

    try {
      const response = await fetch(`https://learnqhub.com/api/deck/editDeck`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(editPayload),
      });

      if (response.ok) {
        const text = await response.text();
        let isSuccess = true;
        let errorMessage = "Could not update the deck.";

        if (text) {
          try {
            const result = JSON.parse(text);
            if (result.success === false || result.flag === false) {
              isSuccess = false;
              errorMessage = result.message || errorMessage;
            }
          } catch (e) {
            // Valid OK response
          }
        }

        if (isSuccess) {
          setIsEditModalOpen(false);
          showToast("Deck updated successfully!", "success");
          if (onDeckUpdated) onDeckUpdated();
        } else {
          showToast(errorMessage, "error");
        }
      } else {
        showToast("Server encountered an error while updating.", "error");
      }
    } catch (error) {
      console.error("Network error:", error);
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Link href={`/deck/${deck.id}`} className="block h-full outline-none">
        <div className="group relative h-full flex flex-col">
          {/* Animated gradient border on hover */}
          <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500 group-hover:duration-300`} />
          
          {/* Main Card Container */}
          <div className={`relative flex flex-col h-full bg-gradient-to-br ${colors.bgGradient} backdrop-blur-xl rounded-2xl border border-slate-700/40 shadow-2xl ${colors.hoverShadow} transition-all duration-500 group-hover:-translate-y-2 overflow-hidden`}>
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700" />
            </div>

            {/* Content */}
            <div className="relative p-6 flex flex-col flex-1 z-10">
              {/* Header: Icon + Menu */}
              <div className="flex items-start justify-between mb-6">
                
                {/* Topic Icon - Animated */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} p-0.5 shadow-xl ${colors.hoverShadow} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <div className={`w-full h-full rounded-[15px] ${colors.iconBg} backdrop-blur-md flex items-center justify-center border border-slate-700/50 group-hover:border-slate-600/50 transition-colors`}>
                    <BookOpen className={`w-7 h-7 ${colors.icon} group-hover:scale-125 transition-transform duration-500`} />
                  </div>
                </div>

                {/* More Menu Button */}
                {usId !== "empty" && (
                  <div className="relative" ref={menuRef}>
                    <button 
                      className={`p-2.5 rounded-xl transition-all duration-300 z-20 relative ${
                        isMenuOpen 
                          ? `bg-slate-800/60 text-amber-400 shadow-lg` 
                          : `text-slate-500 hover:text-amber-400 hover:bg-slate-800/40 opacity-0 group-hover:opacity-100`
                      }`}
                      onClick={toggleMenu}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 flex flex-col gap-1">
                          <button 
                            onClick={openEditModal}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-amber-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                          >
                            <Edit2 className="w-4 h-4" /> Edit Deck
                          </button>
                          <button 
                            onClick={openDeleteModal}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-2 leading-snug">
                  {deck.title}
                </h3>
                {deck.description && (
                  <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-4 group-hover:text-slate-300 transition-colors duration-300">
                    {deck.description}
                  </p>
                )}
                
                <div className="flex-1" />

                {/* Topic Badge */}
                {deck.topic && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${colors.badge} ${colors.badgeText} border border-slate-700/40 group-hover:border-slate-600/60 transition-all duration-300 backdrop-blur-sm`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      {deck.topic}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Section */}
            <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800/20 to-slate-900/20 border-t border-slate-700/30 z-10 backdrop-blur-sm">
              {/* Cards Count */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/40 group-hover:bg-slate-800/60 transition-all duration-300">
                <Layers className={`w-4 h-4 ${colors.icon}`} />
                <span className="text-sm font-black text-slate-100">{cardCount}</span>
                <span className="text-xs font-bold text-slate-500">
                  {cardCount === 1 ? "CARD" : "CARDS"}
                </span>
              </div>

              {/* Privacy Badge */}
              <div>
                {deck.status === false ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/30 border border-slate-700/50">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Private</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40 group-hover:bg-green-500/30 transition-all duration-300">
                    <Eye className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-black text-green-300 uppercase tracking-wide">Public</span>
                  </div>
                )}
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute bottom-0 right-0 w-40 h-40 opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity duration-500">
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} blur-3xl`} />
            </div>

          </div>
        </div>
      </Link>

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-slate-950/60" onClick={() => !isLoading && setIsDeleteModalOpen(false)} />
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-700/50 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-100 mb-2">Delete Deck?</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-200">"{deck.title}"</span>? This action is permanent and cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-slate-950/60" onClick={() => !isLoading && setIsEditModalOpen(false)} />
          
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-700/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/30">
              <h3 className="text-xl font-black text-slate-100">Edit Deck</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEdit} className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Deck Title</label>
                <input 
                  name="title" 
                  defaultValue={deck.title} 
                  required
                  placeholder="Enter a descriptive title"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none font-medium transition-all duration-200"
                />
              </div>

              {/* Topic Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Topic</label>
                <input 
                  name="topic" 
                  defaultValue={deck.topic} 
                  required
                  placeholder="e.g., Data Structures"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none font-medium transition-all duration-200"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={deck.description} 
                  required 
                  rows={4}
                  placeholder="Describe what this deck covers..."
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder:text-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none resize-none font-medium transition-all duration-200"
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center gap-4 pt-2 bg-slate-800/20 px-4 py-3 rounded-lg border border-slate-700/30">
                <label className="relative inline-flex items-center cursor-pointer flex-1">
                  <input 
                    type="checkbox" 
                    name="status" 
                    defaultChecked={deck.status} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-100 after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  <span className="ml-3 text-sm font-bold text-slate-300">Make this deck public</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-slate-700/50">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300 transition-all ${
          toast.type === "error" 
            ? "bg-red-950/95 border-red-500/50" 
            : "bg-green-950/95 border-green-500/50"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          )}
          <p className={`font-semibold text-sm ${toast.type === "error" ? "text-red-200" : "text-green-200"}`}>
            {toast.message}
          </p>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))} 
            className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
              toast.type === "error" ? "text-red-400 hover:bg-red-900/50" : "text-green-400 hover:bg-green-900/50"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
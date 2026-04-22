"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Delete, Plus, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { Button } from "@/components/ui/button";

const MATH_KEYS = [
  { id: "frac", display: "a/b", code: "\\frac{}{}", cursorOffset: -3, title: "Fraction" },
  { id: "pow", display: "x²", code: "^{2}", cursorOffset: 0, title: "Squared" },
  { id: "pow-custom", display: "xⁿ", code: "^{}", cursorOffset: -1, title: "Custom Power" },
  { id: "sqrt", display: "√", code: "\\sqrt{}", cursorOffset: -1, title: "Square Root" },
  { id: "pi", display: "π", code: "\\pi ", cursorOffset: 0, title: "Pi" },
  { id: "int", display: "∫", code: "\\int ", cursorOffset: 0, title: "Integral" },
  { id: "inf", display: "∞", code: "\\infty ", cursorOffset: 0, title: "Infinity" },
  { id: "sum", display: "∑", code: "\\sum_{i=1}^{n} ", cursorOffset: 0, title: "Sum" },
  { id: "alpha", display: "α", code: "\\alpha ", cursorOffset: 0, title: "Alpha" },
  { id: "beta", display: "β", code: "\\beta ", cursorOffset: 0, title: "Beta" },
  { id: "theta", display: "θ", code: "\\theta ", cursorOffset: 0, title: "Theta" },
];

export function CardEditorModal({ open, onClose, onSave, initialCard, title }: any) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const frontTextareaRef = useRef<HTMLTextAreaElement>(null);
  const backTextareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  useEffect(() => {
    if (open) {
      setFront(initialCard?.front || "");
      setBack(initialCard?.back || "");
      setTips(initialCard?.tips || []); 
      setToast({ show: false, message: "", type: "error" }); // Reset toast on open
    }
  }, [open, initialCard]);

  if (!open) return null;

  const insertMath = (target: 'front' | 'back', code: string, cursorOffset: number) => {
    const textarea = target === 'front' ? frontTextareaRef.current : backTextareaRef.current;
    const value = target === 'front' ? front : back;
    const setter = target === 'front' ? setFront : setBack;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    const newText = textBefore + code + textAfter;
    setter(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + code.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleAddTip = () => {
    setTips([...tips, ""]);
  };

  const handleTipChange = (index: number, value: string) => {
    const newTips = [...tips];
    newTips[index] = value;
    setTips(newTips);
  };

  const handleRemoveTip = (index: number) => {
    const newTips = tips.filter((_, i) => i !== index);
    setTips(newTips);
  };

  const handleSave = () => {
    if (!front.trim() || !back.trim()) {
      showToast("Both Front and Back fields are required.", "error");
      return;
    }

    const filteredTips = tips.filter(tip => tip.trim() !== "");
    onSave(front, back, filteredTips);
    
    setFront("");
    setBack("");
    setTips([]);
  };

  const MathToolbar = ({ target }: { target: 'front' | 'back' }) => (
    <div className="rounded-t-xl border border-purple-100 border-b-0 bg-[#fcfcff] p-2 transition-colors">
      <div className="flex flex-wrap gap-2">
        {MATH_KEYS.map((key) => (
          <button
            key={key.id}
            type="button"
            title={key.title}
            onClick={() => insertMath(target, key.code, key.cursorOffset)}
            className="flex h-8 min-w-[36px] items-center justify-center rounded-lg bg-white px-2 text-sm font-serif border border-purple-100 text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 transition-all active:scale-95 shadow-sm"
          >
            {key.display}
          </button>
        ))}
        <div className="flex-1" />
        <button 
          onClick={() => target === 'front' ? setFront("") : setBack("")}
          className="flex h-8 px-3 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-xs font-bold gap-1.5"
        >
          <Delete className="h-3.5 w-3.5" /> Clear
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/50 bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-purple-100 px-6 py-5 bg-white/50 backdrop-blur-md">
          <Sparkles className="absolute top-5 right-14 h-5 w-5 text-purple-300 animate-pulse" />
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-xs font-medium text-gray-500 mt-1">Design your flashcard content</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-8 overflow-y-auto bg-gray-50/30">
          
          {/* --- FRONT EDITOR --- */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Front (Question - LaTeX - Keep formulas between $$)</label>
            <div className="shadow-sm rounded-xl">
              <MathToolbar target="front" />
              <textarea
                ref={frontTextareaRef}
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="min-h-[100px] w-full rounded-b-xl border border-purple-100 bg-white px-4 py-3 text-gray-800 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all resize-y"
                placeholder="Ex: \int_{0}^{\infty} e^{-x^2} dx"
              />
            </div>
            {front.trim() && (
              <div className="mt-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-4 shadow-inner animate-fade-in-up">
                <span className="text-[10px] font-black uppercase text-violet-500 tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></div>
                  Front Preview
                </span>
                <div className="flex min-h-[60px] items-center justify-center p-2 text-xl text-gray-800 overflow-x-auto">
                  <BlockMath math={front.replace(/\$/g, '')} />
                </div>
              </div>
            )}
          </div>

          <div className="w-full border-t border-purple-100/60" />

          {/* --- BACK EDITOR --- */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Back (Answer - LaTeX - Keep formulas between $$)</label>
            <div className="shadow-sm rounded-xl">
              <MathToolbar target="back" />
              <textarea
                ref={backTextareaRef}
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="min-h-[100px] w-full rounded-b-xl border border-purple-100 bg-white px-4 py-3 text-gray-800 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-y"
                placeholder="The answer or step-by-step solution..."
              />
            </div>
            {back.trim() && (
              <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-inner animate-fade-in-up">
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Back Preview
                </span>
                <div className="flex min-h-[60px] items-center justify-center p-2 text-xl text-gray-800 overflow-x-auto">
                  <BlockMath math={back.replace(/\$/g, '')} />
                </div>
              </div>
            )}
          </div>

          <div className="w-full border-t border-purple-100/60" />

          {/* --- TIPS SECTION --- */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-bold text-gray-700">Tips (Optional)</label>
              <button 
                onClick={handleAddTip} 
                className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-full transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Tip
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {tips.map((tip, index) => (
                <div key={index} className="flex gap-2 items-center animate-fade-in-up">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-600 font-bold text-xs shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => handleTipChange(index, e.target.value)}
                    placeholder="Add a helpful hint..."
                    className="flex-1 h-12 rounded-xl border border-purple-100 bg-white px-4 text-sm font-medium text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all shadow-sm"
                  />
                  <button 
                    onClick={() => handleRemoveTip(index)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all shrink-0"
                    title="Delete hint"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {tips.length === 0 && (
                <div className="rounded-2xl border border-dashed border-purple-200 bg-white py-8 text-center flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-purple-200" />
                  <p className="text-sm font-medium text-gray-400">You haven't added any clues yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-purple-100 px-6 py-5 bg-white">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-11 px-6 rounded-xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="h-11 px-8 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            Save Card
          </Button>
        </div>
      </div>

      {/* Global Toast Notification */}
      {toast.show && (
        <div className={`absolute bottom-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up transition-all ${
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
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
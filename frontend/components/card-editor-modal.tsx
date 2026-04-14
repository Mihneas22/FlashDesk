"use client";

import { useState, useEffect, useRef } from "react";
import { X, Delete } from "lucide-react";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex'
import type { Flashcard } from "@/lib/store";

const MATH_KEYS = [
  { id: "frac", display: "a/b", code: "\\frac{}{}", cursorOffset: -3, title: "Fracție" },
  { id: "pow", display: "x²", code: "^{2}", cursorOffset: 0, title: "La puterea 2" },
  { id: "pow-custom", display: "xⁿ", code: "^{}", cursorOffset: -1, title: "Putere personalizată" },
  { id: "sqrt", display: "√", code: "\\sqrt{}", cursorOffset: -1, title: "Radical" },
  { id: "pi", display: "π", code: "\\pi ", cursorOffset: 0, title: "Pi" },
  { id: "int", display: "∫", code: "\\int ", cursorOffset: 0, title: "Integrală" },
  { id: "inf", display: "∞", code: "\\infty ", cursorOffset: 0, title: "Infinit" },
  { id: "sum", display: "∑", code: "\\sum_{i=1}^{n} ", cursorOffset: 0, title: "Sumă" },
  { id: "alpha", display: "α", code: "\\alpha ", cursorOffset: 0, title: "Alpha" },
  { id: "beta", display: "β", code: "\\beta ", cursorOffset: 0, title: "Beta" },
  { id: "theta", display: "θ", code: "\\theta ", cursorOffset: 0, title: "Theta" },
];

interface CardEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (front: string, back: string) => void;
  initialCard?: Partial<Flashcard>;
  title?: string;
}

export function CardEditorModal({ open, onClose, onSave, initialCard, title }: any) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  
  const backTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setFront(initialCard?.front || "");
      setBack(initialCard?.back || "");
    }
  }, [open, initialCard]);

  if (!open) return null;

  // 2. Funcția de inserare la click (ca la un calculator)
  const insertMath = (code: string, cursorOffset: number) => {
    const textarea = backTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = back.substring(0, start);
    const textAfter = back.substring(end);

    const newText = textBefore + code + textAfter;
    setBack(newText);

    // Punem focusul înapoi pe textarea și mutăm cursorul inteligent
    // (ex: la \frac{}{} vrem cursorul fix în prima acoladă)
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + code.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = () => {
    if (!front.trim() || !back.trim()) return;
    onSave(front, back);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Modal */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* Front Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Front (Question)</label>
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g., Derivative of sin(x)?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Back (Answer - LaTeX Editor)</label>
            
            {/* Tastatura Virtuală (Math Keypad) */}
            <div className="rounded-t-lg border border-border border-b-0 bg-secondary/40 p-2">
              <div className="flex flex-wrap gap-1.5">
                {MATH_KEYS.map((key) => (
                  <button
                    key={key.id}
                    type="button"
                    title={key.title}
                    onClick={() => insertMath(key.code, key.cursorOffset)}
                    className="flex h-8 min-w-[36px] items-center justify-center rounded bg-card px-2 text-sm font-serif border border-border/60 text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                  >
                    {key.display}
                  </button>
                ))}
                
                {/* Buton de stergere rapida (optional) */}
                <div className="flex-1" />
                <button 
                  onClick={() => setBack("")}
                  className="flex h-8 px-2 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-xs gap-1"
                >
                  <Delete className="h-4 w-4" /> Clear
                </button>
              </div>
            </div>

            {/* Textarea pentru Cod */}
            <textarea
              ref={backTextareaRef}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="min-h-[120px] w-full rounded-b-lg border border-border bg-background px-4 py-3 text-foreground font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow resize-y"
              placeholder="Folosește butoanele de mai sus sau scrie cod LaTeX aici..."
            />

            {/* Live Preview (Simulare vizuală) */}
            {back.trim() && (
              <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">Live Preview</span>
                
                <div className="mt-4 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-inner">
                  <div className="bg-primary/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Math Preview
                  </div>
                  <div className="flex min-h-[80px] items-center justify-center p-6 text-2xl text-foreground">
                    {/* Folosim un try-catch vizual implicit: dacă back e invalid, KaTeX va afișa eroarea */}
                    <BlockMath math={back.trim() ? back.replace(/\$/g, '') : "f(x)"} />
                  </div>
                </div>
                
                <span className="mt-2 block font-mono text-xs text-muted-foreground opacity-70">
                  Cod sursă: {back}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-card">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Save Card
          </button>
        </div>

      </div>
    </div>
  );
}
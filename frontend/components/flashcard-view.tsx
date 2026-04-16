"use client";

import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import type { Flashcard } from "@/lib/store";

interface ExtendedFlashcard extends Flashcard {
  tips: string[];
}

interface FlashcardViewProps {
  card: ExtendedFlashcard;
  resetKey: string;
}

export function FlashcardView({ card, resetKey }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Resetăm flip-ul și tips-urile de fiecare dată când se schimbă cardul
  useEffect(() => {
    setIsFlipped(false);
    setShowTips(false);
  }, [resetKey]);

  if (!card) return null;

  // Îndepărtăm simbolurile $ folosite în editor pentru a fi rulate corect de BlockMath
  const frontMath = card.front ? card.front.replace(/\$/g, '') : '';
  const backMath = card.back ? card.back.replace(/\$/g, '') : '';

  return (
    <div className="flex w-full flex-col items-center gap-6">
      
      {/* 3D Flip Card Container */}
      <div 
        className="group relative h-80 w-full cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1000px" }}
      >
        <div 
          className="relative h-full w-full rounded-2xl transition-transform duration-500 ease-out shadow-lg"
          style={{ 
            transformStyle: "preserve-3d", 
            transform: isFlipped ? "rotateX(180deg)" : "rotateX(0deg)" 
          }}
        >
          {/* --- FRONT (Întrebarea) --- */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="absolute left-6 top-6 text-xs font-bold uppercase tracking-wider text-primary">
              Question
            </span>
            <div className="text-xl md:text-2xl w-full max-h-[80%] overflow-y-auto font-serif">
              <BlockMath math={frontMath} />
            </div>
            <p className="absolute bottom-6 text-xs text-muted-foreground animate-pulse">
              Click to flip
            </p>
          </div>

          {/* --- BACK (Răspunsul) --- */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateX(180deg)" 
            }}
          >
            <span className="absolute left-6 top-6 text-xs font-bold uppercase tracking-wider text-emerald-500">
              Answer
            </span>
            <div className="text-xl md:text-2xl w-full max-h-[80%] overflow-y-auto font-serif">
              <BlockMath math={backMath} />
            </div>
          </div>
        </div>
      </div>

      {/* --- SECȚIUNEA DE TIPS / INDICII --- */}
      {card.tips && card.tips.length > 0 && (
        <div className="w-full flex flex-col items-center gap-3">
          <button 
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 text-sm font-medium text-amber-500 hover:text-amber-600 hover:bg-amber-500/15 transition-colors bg-amber-500/10 px-5 py-2.5 rounded-full"
          >
            <Lightbulb className="h-4 w-4" />
            {showTips ? "Ascunde Indiciile" : "Arată Indiciile"}
          </button>
          
          {showTips && (
            <div className="flex flex-col gap-2 w-full max-w-md mt-2">
              {card.tips.map((tip, idx) => (
                <div 
                  key={idx} 
                  className="bg-card border border-border p-4 rounded-xl text-sm text-foreground shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <span className="font-semibold text-amber-500 mr-2">Indiciu {idx + 1}:</span>
                  {tip}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
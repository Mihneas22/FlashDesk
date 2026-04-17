"use client";

import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
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

  useEffect(() => {
    setIsFlipped(false);
    setShowTips(false);
  }, [resetKey]);

  if (!card) return null;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div 
        className="group relative h-80 w-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1000px" }}
      >
        <div 
          className="relative h-full w-full rounded-2xl transition-transform duration-500 ease-out shadow-lg"
          style={{ 
            transformStyle: "preserve-3d", 
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
          }}
        >
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="absolute left-6 top-6 text-xs font-bold uppercase tracking-wider text-primary">
              Question
            </span>
            
            <div className="text-xl md:text-2xl w-full max-h-[80%] overflow-y-auto prose dark:prose-invert flex flex-col items-center">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {card.front || ""}
              </ReactMarkdown>
            </div>

            <p className="absolute bottom-6 text-xs text-muted-foreground animate-pulse">
              Click to flip
            </p>
          </div>
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)" 
            }}
          >
            <span className="absolute left-6 top-6 text-xs font-bold uppercase tracking-wider text-emerald-500">
              Answer
            </span>
            
            <div className="text-xl md:text-2xl w-full max-h-[80%] overflow-y-auto prose dark:prose-invert flex flex-col items-center">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {card.back || ""}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECȚIUNEA DE TIPS --- */}
      {card.tips && card.tips.length > 0 && (
        <div className="w-full flex flex-col items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevenim flip-ul cardului când dăm click pe buton
              setShowTips(!showTips);
            }}
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
                  {/* Putem randa markdown și în tips dacă dorim */}
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {tip}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Sparkles, CheckCircle2 } from "lucide-react";
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
    <div className="flex w-full flex-col items-center gap-8">
      
      {/* 3D Card Container */}
      <div 
        className="group relative h-80 w-full max-w-2xl cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1500px" }}
      >
        {/* Glow effect in background */}
        <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500" />

        <div 
          className="relative h-full w-full rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_10px_40px_rgb(0,0,0,0.08)] group-hover:shadow-[0_20px_50px_rgb(139,92,246,0.15)]"
          style={{ 
            transformStyle: "preserve-3d", 
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
          }}
        >
          {/* --- FRONT (QUESTION) --- */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-white/60 bg-white/95 backdrop-blur-xl p-8 text-center overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Top Badge */}
            <div className="absolute left-6 top-6 flex items-center gap-1.5 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                Question
              </span>
            </div>
            
            {/* Content */}
            <div className="text-xl md:text-3xl font-medium text-gray-800 w-full max-h-[75%] overflow-y-auto prose dark:prose-invert flex flex-col items-center justify-center scrollbar-hide">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {card.front || ""}
              </ReactMarkdown>
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-6 flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Click to flip
            </div>
          </div>

          {/* --- BACK (ANSWER) --- */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-white/60 bg-white/95 backdrop-blur-xl p-8 text-center overflow-hidden"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)" 
            }}
          >
            {/* Top Badge */}
            <div className="absolute left-6 top-6 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                Answer
              </span>
            </div>
            
            {/* Content */}
            <div className="text-xl md:text-3xl font-medium text-gray-800 w-full max-h-[75%] overflow-y-auto prose dark:prose-invert flex flex-col items-center justify-center scrollbar-hide">
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

      {/* --- TIPS SECTION --- */}
      {card.tips && card.tips.length > 0 && (
        <div className="w-full flex flex-col items-center gap-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowTips(!showTips);
            }}
            className="group flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 px-6 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Lightbulb className={`h-4 w-4 transition-transform ${showTips ? 'fill-amber-400 text-amber-500 rotate-180' : ''}`} />
            {showTips ? "Hide Tips" : "Show Tips"}
          </button>
          
          {showTips && (
            <div className="flex flex-col gap-3 w-full max-w-2xl mt-2 perspective-1000">
              {card.tips.map((tip, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden bg-white/80 backdrop-blur-md border border-purple-50 p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] animate-in slide-in-from-top-4 fade-in duration-500 ease-out flex gap-4 items-start"
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 font-black text-xs shadow-inner">
                    {idx + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-700 pt-1.5 flex-1 prose-sm prose-p:my-0">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {tip}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
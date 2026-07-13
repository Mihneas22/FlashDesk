"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Sparkles, CheckCircle2, Volume2 } from "lucide-react";
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

// Process LaTeX to ensure proper formatting
const processLatex = (text: string) => {
  if (!text) return "";
  
  if (text.includes('$')) return text;
  const containsMath = text.includes('\\') || /[_^]/.test(text);
  
  if (containsMath) {
    return `$$${text}$$`;
  }

  return text;
};

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
      
      {/* 3D CARD CONTAINER */}
      <div 
        className="group relative h-[420px] md:h-[480px] w-full max-w-3xl cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1500px" }}
      >
        {/* Animated gradient border glow on hover */}
        <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 via-cyan-500 to-green-500 rounded-[2.5rem] opacity-0 group-hover:opacity-25 blur-3xl transition-all duration-700 group-hover:duration-500" />
        
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700" />
        </div>

        {/* Card Container */}
        <div 
          className="relative h-full w-full rounded-3xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl group-hover:shadow-2xl group-hover:shadow-amber-500/20"
          style={{ 
            transformStyle: "preserve-3d", 
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
          }}
        >
          {/* --- FRONT (QUESTION) --- */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-slate-600/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 backdrop-blur-xl p-8 text-center overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Top Badge - Cyan for Question */}
            <div className="absolute left-8 top-8 flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-500/40 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
                Question
              </span>
            </div>
            
            {/* Content Area */}
            <div className="text-xl md:text-2xl font-semibold text-slate-100 w-full max-h-[80%] overflow-y-auto px-4 prose prose-sm md:prose-base flex flex-col items-center justify-center scrollbar-hide [&_*]:text-slate-100 [&_*]:font-medium [&_p]:my-2 [&_h1]:text-2xl [&_h2]:text-xl [&_code]:bg-slate-800/50 [&_code]:text-cyan-300 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {processLatex(card.front)}
              </ReactMarkdown>
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-8 flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800/50 px-4 py-2.5 rounded-full border border-slate-700/50 group-hover:text-cyan-300 group-hover:bg-cyan-500/10 transition-all duration-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Click to reveal answer
            </div>

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* --- BACK (ANSWER) --- */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-slate-600/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 backdrop-blur-xl p-8 text-center overflow-hidden"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)" 
            }}
          >
            {/* Top Badge - Green for Answer */}
            <div className="absolute left-8 top-8 flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/40 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-green-300">
                Answer
              </span>
            </div>
            
            {/* Content Area */}
            <div className="text-xl md:text-2xl font-semibold text-slate-100 w-full max-h-[80%] overflow-y-auto px-4 prose prose-sm md:prose-base flex flex-col items-center justify-center scrollbar-hide [&_*]:text-slate-100 [&_*]:font-medium [&_p]:my-2 [&_h1]:text-2xl [&_h2]:text-xl [&_code]:bg-slate-800/50 [&_code]:text-green-300 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {processLatex(card.back)}
              </ReactMarkdown>
            </div>

            {/* Corner accent */}
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* --- TIPS SECTION --- */}
      {card.tips && card.tips.length > 0 && (
        <div className="w-full flex flex-col items-center gap-5">
          {/* Tips Toggle Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowTips(!showTips);
            }}
            className={`group flex items-center gap-3 text-sm font-bold px-6 py-3 rounded-2xl border transition-all duration-300 shadow-lg active:scale-95 ${
              showTips
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-amber-500/20 hover:bg-amber-500/30 hover:border-amber-500/60"
                : "bg-slate-800/50 border-slate-700/50 text-slate-300 shadow-slate-900/50 hover:bg-slate-800 hover:border-amber-500/40 hover:text-amber-300"
            }`}
          >
            <Lightbulb className={`w-4 h-4 transition-all duration-300 ${showTips ? 'fill-amber-400 text-amber-400 rotate-12' : 'group-hover:text-amber-400'}`} />
            <span>{showTips ? "Hide Tips" : "Show Tips"}</span>
            {card.tips.length > 0 && (
              <span className={`ml-1 px-2 py-1 rounded-lg text-xs font-black transition-all ${showTips ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-700/50 text-slate-400 group-hover:bg-amber-500/20 group-hover:text-amber-300'}`}>
                {card.tips.length}
              </span>
            )}
          </button>
          
          {/* Tips Cards */}
          {showTips && (
            <div className="flex flex-col gap-4 w-full max-w-2xl mt-2">
              {card.tips.map((tip, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-amber-500/30 p-6 rounded-2xl shadow-xl shadow-amber-500/10 animate-in slide-in-from-top-4 fade-in duration-500 ease-out flex gap-4 items-start group hover:border-amber-500/50 hover:shadow-amber-500/20 transition-all"
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  {/* Tip Number Badge */}
                  <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>

                  {/* Tip Content */}
                  <div className="text-sm font-medium text-slate-200 pt-1 flex-1 prose prose-sm prose-invert [&_*]:text-slate-200 [&_*]:font-medium [&_p]:my-0 [&_code]:bg-slate-900/50 [&_code]:text-amber-300 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {processLatex(tip)}
                    </ReactMarkdown>
                  </div>

                  {/* Accent glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
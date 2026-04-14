"use client";

import { useState, useEffect } from "react";
import type { Flashcard } from "@/lib/store";

interface FlashcardViewProps {
  card: Flashcard;
  /** Reset the flip state when the card changes */
  resetKey?: string | number;
}

export function FlashcardView({ card, resetKey }: FlashcardViewProps) {
  const [flipped, setFlipped] = useState(false);

  // Reset flip whenever the card changes
  useEffect(() => {
    setFlipped(false);
  }, [resetKey]);

  return (
    <div
      className="relative h-64 w-full cursor-pointer select-none"
      style={{ perspective: "1200px" }}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-label={flipped ? "Show front" : "Click to reveal answer"}
      onKeyDown={(e) => e.key === "Enter" || e.key === " " ? setFlipped((f) => !f) : undefined}
    >
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <CardFace side="front" flipped={flipped}>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3 block">
            Question
          </span>
          <p className="text-xl font-semibold text-foreground text-balance text-center leading-snug">
            {card.front}
          </p>
          <span className="mt-4 text-xs text-muted-foreground">
            Click to reveal answer
          </span>
        </CardFace>

        {/* Back */}
        <CardFace side="back" flipped={flipped}>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3 block">
            Answer
          </span>
          <LatexRenderer content={card.back} />
        </CardFace>
      </div>
    </div>
  );
}

function CardFace({
  side,
  children,
  flipped,
}: {
  side: "front" | "back";
  children: React.ReactNode;
  flipped: boolean;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-8 py-6 shadow-xl shadow-black/30"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: side === "back" ? "rotateY(180deg)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

function LatexRenderer({ content }: { content: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    // Dynamically import KaTeX to avoid SSR issues
    import("katex").then((katex) => {
      // Split on $$ ... $$ blocks (display math) and $ ... $ (inline math)
      const result = content
        .split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g)
        .map((part) => {
          if (part.startsWith("$$") && part.endsWith("$$")) {
            const math = part.slice(2, -2);
            try {
              return katex.default.renderToString(math, {
                displayMode: true,
                throwOnError: false,
              });
            } catch {
              return part;
            }
          }
          if (part.startsWith("$") && part.endsWith("$")) {
            const math = part.slice(1, -1);
            try {
              return katex.default.renderToString(math, {
                displayMode: false,
                throwOnError: false,
              });
            } catch {
              return part;
            }
          }
          // Escape plain text HTML
          return part.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        })
        .join("");
      setHtml(result);
    });
  }, [content]);

  if (!html) {
    return (
      <p className="text-sm text-foreground text-center leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  return (
    <div
      className="katex-content w-full text-center text-foreground leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

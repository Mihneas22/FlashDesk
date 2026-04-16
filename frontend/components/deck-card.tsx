"use client";

import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import type { Deck } from "@/lib/store";
import { cn } from "@/lib/utils";

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:bg-card-hover hover:shadow-lg hover:shadow-black/20">
      {/* Accent dot */}
      <div
        className={cn(
          "mb-4 flex h-10 w-10 items-center justify-center rounded-lg",
          deck.color,
          "opacity-90"
        )}
      >
        <BookOpen className="h-5 w-5 text-white" />
      </div>

      <h2 className="text-balance text-base font-semibold text-foreground leading-snug">
        {deck.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {deck.description}
      </p>
      <h4 className="mt-1 text-sm leading-relaxed font-semibold text-foreground line-clamp-2">
        {deck.topic}
      </h4>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {(deck.status == true)? "Public" : "Private"}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Link
            href={`/deck/${deck.id}`}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            View
          </Link>
          <Link
            href={`/study/${deck.id}`}
            className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Study
          </Link>
        </div>
      </div>

      {/* Full-card link for accessibility */}
      <Link href={`/deck/${deck.id}`} className="absolute inset-0 rounded-xl" aria-label={`Open ${deck.title}`} />
    </div>
  );
}

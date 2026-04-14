"use client";

import { cn } from "@/lib/utils";

export type StudyRating = "again" | "hard" | "good" | "easy";

interface StudyControlsProps {
  onRate: (rating: StudyRating) => void;
  disabled?: boolean;
}

const ratings: Array<{ key: StudyRating; label: string; description: string; colorClass: string }> = [
  {
    key: "again",
    label: "Again",
    description: "Complete blackout",
    colorClass: "border-again/50 text-again hover:bg-again/10",
  },
  {
    key: "hard",
    label: "Hard",
    description: "Significant difficulty",
    colorClass: "border-hard/50 text-hard hover:bg-hard/10",
  },
  {
    key: "good",
    label: "Good",
    description: "With some effort",
    colorClass: "border-good/50 text-good hover:bg-good/10",
  },
  {
    key: "easy",
    label: "Easy",
    description: "Perfect response",
    colorClass: "border-easy/50 text-easy hover:bg-easy/10",
  },
];

export function StudyControls({ onRate, disabled = false }: StudyControlsProps) {
  return (
    <div className="flex items-stretch gap-3 w-full">
      {ratings.map((r) => (
        <button
          key={r.key}
          onClick={() => onRate(r.key)}
          disabled={disabled}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-3 transition-all duration-150",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            r.colorClass
          )}
        >
          <span className="text-sm font-semibold">{r.label}</span>
          <span className="text-[10px] text-muted-foreground hidden sm:block">{r.description}</span>
        </button>
      ))}
    </div>
  );
}

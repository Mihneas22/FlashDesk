"use client";

import { useState, useCallback, useEffect } from "react";

export interface User {
  userId: string;
  username: string | null;
  email: string | null;
  elo: number | null;
  createdAt: string | null;
  roles: string[] | null;
  plan: string[] | null;
  
  streak?: Streak | null;
  userDecks?: Deck[] | null;
  userSubmissions?: any[] | null;
  userDailyStats?: DailyStats[] | null;
}

export interface DailyStats {
  dailyStatsId?: string;
  date: string;
  cardsReview: number;
  cardsMastered: number;
  minSpent: number;
}

export interface Streak {
  streakId: string;
  currentStreak: number;
  maxStreak: number;
  lastActivity: string;
  lastActivityDate: string;
  userId: string;
  user: User;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tips: string[];
  viewConfig: ViewConfig | null;
  matrixConfig: MatrixConfig | null;
}

export interface MatrixConfig {
  type: "2d_transform";
  matrix: [[number, number], [number, number]];
  description?: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  topic: string;
  cards: Flashcard[];
  status: boolean;
  color: string; // tailwind bg class for accent
}

export interface GraphFunction {
  expr: string;
  color?: string;
  latexLabel?: string;
}

export interface GraphLine {
  axis: string;
  value: number;
  color?: string;
  latexLabel?: string;
}

export interface ShadedRegion {
  between: { lowerExpr: string; upperExpr: string };
  bounds: number[];
  color?: string;
}

export interface GraphPoint {
  coords: number[];
  latexLabel?: string;
  color?: string;
}

export interface ViewBoxConfig {
  x: [number, number];  // ← era number[]
  y: [number, number];  // ← era number[]
}

export interface ViewConfig {
  mode: string;
  viewBox: ViewBoxConfig;
  functions: GraphFunction[];
  lines: GraphLine[];
  shadedRegion?: ShadedRegion | null;
  points: GraphPoint[];
}

export interface MappedTopic {
  name: string;
  cards: number;
  mastered: number;
  pct: number;
  color: string;
  ringColor: string;
}

// A simple global-state approach using React state lifted to a context-like hook.
// We store decks in module-level variable so it persists across component mounts
// within the same browser session (no backend needed per spec).
let _decks: Deck[] = [];
const listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((l) => l());
}

export function getDecks(): Deck[] {
  return _decks;
}

export function getDeckById(id: string): Deck | undefined {
  return _decks.find((d) => d.id === id);
}

export function addDeck(deck: Omit<Deck, "id" | "cards">): Deck {
  const newDeck: Deck = {
    ...deck,
    id: `deck-${Date.now()}`,
    cards: [],
  };
  _decks = [..._decks, newDeck];
  notify();
  return newDeck;
}

export function addCard(deckId: string, card: Omit<Flashcard, "id">): void {
  _decks = _decks.map((d) => {
    if (d.id !== deckId) return d;
    return {
      ...d,
      cards: [
        ...d.cards,
        { ...card, id: `card-${Date.now()}-${Math.random()}` },
      ],
    };
  });
  notify();
}

export function updateCard(
  deckId: string,
  cardId: string,
  updates: Partial<Omit<Flashcard, "id">>
): void {
  _decks = _decks.map((d) => {
    if (d.id !== deckId) return d;
    return {
      ...d,
      cards: d.cards.map((c) =>
        c.id === cardId ? { ...c, ...updates } : c
      ),
    };
  });
  notify();
}

export function deleteCard(deckId: string, cardId: string): void {
  _decks = _decks.map((d) => {
    if (d.id !== deckId) return d;
    return { ...d, cards: d.cards.filter((c) => c.id !== cardId) };
  });
  notify();
}

/** Subscribe to store changes. Returns an unsubscribe function. */
export function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function setDecks(decks: Deck[]): void {
  _decks = decks;
  notify();
}

/** React hook căruia îi adăugăm setDecks în obiectul returnat */
export function useStore() {
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    const unsub = subscribe(rerender);
    return unsub;
  }, [rerender]);

  return {
    decks: getDecks(),
    getDeckById,
    addDeck,
    setDecks, // <--- ADAUGĂ ACEASTA
    addCard,
    updateCard,
    deleteCard,
  };
}

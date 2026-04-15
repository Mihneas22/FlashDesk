"use client";

import { useState, useCallback, useEffect } from "react";

export interface Flashcard {
  id: string;
  front: string;
  back: string; // supports LaTeX
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  topic: string;
  cards: Flashcard[];
  color: string; // tailwind bg class for accent
}

const initialDecks: Deck[] = [
  {
    id: "signals-systems",
    title: "Signals & Systems",
    description: "Fourier, Laplace, Z-transforms and convolution",
    color: "bg-primary",
    topic: "Signals & Systems",
    cards: [
      {
        id: "ss-1",
        front: "Continuous-Time Fourier Transform",
        back: "$$X(j\\omega) = \\int_{-\\infty}^{\\infty} x(t)\\, e^{-j\\omega t}\\, dt$$",
      },
      {
        id: "ss-2",
        front: "Inverse CTFT",
        back: "$$x(t) = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} X(j\\omega)\\, e^{j\\omega t}\\, d\\omega$$",
      },
      {
        id: "ss-3",
        front: "Convolution Theorem",
        back: "$$y(t) = x(t) * h(t) \\;\\Longleftrightarrow\\; Y(j\\omega) = X(j\\omega)\\cdot H(j\\omega)$$",
      },
      {
        id: "ss-4",
        front: "Laplace Transform",
        back: "$$X(s) = \\int_{0}^{\\infty} x(t)\\, e^{-st}\\, dt, \\quad s \\in \\mathbb{C}$$",
      },
      {
        id: "ss-5",
        front: "Z-Transform",
        back: "$$X(z) = \\sum_{n=-\\infty}^{\\infty} x[n]\\, z^{-n}$$",
      },
    ],
  },
  {
    id: "thermodynamics",
    title: "Thermodynamics",
    description: "Laws of thermodynamics, entropy, and cycles",
    color: "bg-accent",
    topic: "Physics",
    cards: [
      {
        id: "thermo-1",
        front: "First Law of Thermodynamics",
        back: "$$\\Delta U = Q - W$$\n\nwhere $$Q$$ is heat added to the system and $$W$$ is work done by the system.",
      },
      {
        id: "thermo-2",
        front: "Entropy Change (Reversible Process)",
        back: "$$dS = \\frac{\\delta Q_{\\text{rev}}}{T}$$",
      },
      {
        id: "thermo-3",
        front: "Ideal Gas Law",
        back: "$$PV = nRT$$\n\nwhere $$R = 8.314\\,\\text{J mol}^{-1}\\text{K}^{-1}$$",
      },
      {
        id: "thermo-4",
        front: "Carnot Efficiency",
        back: "$$\\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H}$$",
      },
    ],
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra",
    description: "Eigenvalues, matrix decompositions, and vector spaces",
    color: "bg-good",
    topic: "Algebra",
    cards: [
      {
        id: "la-1",
        front: "Eigenvalue Equation",
        back: "$$A\\mathbf{v} = \\lambda \\mathbf{v}$$\n\nwhere $$\\lambda$$ is an eigenvalue and $$\\mathbf{v}$$ is the corresponding eigenvector.",
      },
      {
        id: "la-2",
        front: "Singular Value Decomposition",
        back: "$$A = U\\Sigma V^T$$\n\nwhere $$U, V$$ are orthogonal and $$\\Sigma$$ is diagonal with non-negative entries.",
      },
      {
        id: "la-3",
        front: "Determinant via Cofactor Expansion",
        back: "$$\\det(A) = \\sum_{j=1}^{n} a_{ij}\\, C_{ij} = \\sum_{j=1}^{n} a_{ij}(-1)^{i+j} M_{ij}$$",
      },
    ],
  },
];

// A simple global-state approach using React state lifted to a context-like hook.
// We store decks in module-level variable so it persists across component mounts
// within the same browser session (no backend needed per spec).
let _decks: Deck[] = initialDecks;
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

/** React hook that re-renders on store changes */
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
    addCard,
    updateCard,
    deleteCard,
  };
}

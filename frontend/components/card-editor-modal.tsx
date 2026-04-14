"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Flashcard } from "@/lib/store";

interface CardEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (front: string, back: string) => void;
  initialCard?: Partial<Flashcard>;
  title?: string;
}

export function CardEditorModal({
  open,
  onClose,
  onSave,
  initialCard,
  title = "Add Card",
}: CardEditorModalProps) {
  const [front, setFront] = useState(initialCard?.front ?? "");
  const [back, setBack] = useState(initialCard?.back ?? "");
  const [previewHtml, setPreviewHtml] = useState("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setFront(initialCard?.front ?? "");
      setBack(initialCard?.back ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Live LaTeX preview
  useEffect(() => {
    if (!back) {
      setPreviewHtml("");
      return;
    }
    import("katex").then((katex) => {
      const result = back
        .split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g)
        .map((part) => {
          if (part.startsWith("$$") && part.endsWith("$$")) {
            try {
              return katex.default.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false });
            } catch { return part; }
          }
          if (part.startsWith("$") && part.endsWith("$")) {
            try {
              return katex.default.renderToString(part.slice(1, -1), { displayMode: false, throwOnError: false });
            } catch { return part; }
          }
          return part.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        })
        .join("");
      setPreviewHtml(result);
    });
  }, [back]);

  if (!open) return null;

  function handleSave() {
    if (!front.trim() || !back.trim()) return;
    onSave(front.trim(), back.trim());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Front */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="card-front" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Front — Question
            </label>
            <textarea
              id="card-front"
              rows={2}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="e.g. Continuous-Time Fourier Transform"
              className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Back */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="card-back" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Back — Answer (LaTeX supported)
            </label>
            <textarea
              id="card-back"
              rows={3}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder={"$$X(j\\omega) = \\int_{-\\infty}^{\\infty} x(t) e^{-j\\omega t}\\, dt$$"}
              className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Preview */}
          {previewHtml && (
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Preview
              </p>
              <div
                className="katex-content text-sm text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!front.trim() || !back.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Card
          </button>
        </div>
      </div>
    </div>
  );
}

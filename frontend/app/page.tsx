"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";

/* ─── floating math symbols ─── */
const MATH_SYMBOLS = [
  "∫","∑","∂","∇","λ","ω","μ","σ","π","Φ",
  "α","β","γ","δ","ε","θ","ρ",
  "dx","dt","j²","e^x","∞","∈","⊂","≡",
  "H(s)","Z(ω)","F(t)","Re{·}",
];

interface MathSym {
  id: number; sym: string; left: string;
  duration: string; delay: string; fontSize: string;
}

/* ─── inline styles (Tailwind-compatible tokens) ─── */
const C = {
  bg0:    "#0F1419",
  bg1:    "#1A1F2E",
  bg2:    "#252D3D",
  amber:  "#FFB84D",
  amberD: "#E69B00",
  cyan:   "#00D9FF",
  cyanD:  "#00B8D4",
  text:   "#E8EAED",
  muted:  "#7A8394",
  border: "#2A3142",
  green:  "#4ADE80",
  red:    "#FF6B6B",
} as const;

const MONO = "'JetBrains Mono', monospace";
const SANS = "'Inter', sans-serif";

export default function LandingPage() {
  const [isAnnual, setIsAnnual]           = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [mathSymbols, setMathSymbols]     = useState<MathSym[]>([]);
  const [typedLines, setTypedLines]       = useState<string[]>([]);
  const [formData, setFormData]           = useState({
    firstName: "", lastName: "", email: "", role: "", topic: "", message: "",
  });

  /* generate floating math symbols on client only */
  useEffect(() => {
    setMathSymbols(
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        sym: MATH_SYMBOLS[i % MATH_SYMBOLS.length],
        left: `${Math.random() * 100}%`,
        duration: `${20 + Math.random() * 18}s`,
        delay: `${Math.random() * 18}s`,
        fontSize: `${13 + Math.random() * 22}px`,
      }))
    );
  }, []);

  /* terminal typewriter */
  const TERMINAL_LINES = [
    "❯ learnqhub --init",
    "// loading study environment...",
    "spaced_repetition : enabled ✓",
    "latex_rendering   : enabled ✓",
    "ai_extraction     : enabled ✓",
    "pre_built_decks   : 340+",
  ];
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        setTypedLines((prev) => [...prev, TERMINAL_LINES[i]]);
        i++;
      } else {
        clearInterval(id);
      }
    }, 420);
    return () => clearInterval(id);
  }, []);

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".lq-reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "translateY(0)";
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/send", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    if (res.ok) setIsFormSubmitted(true);
  };

  const revealStyle: React.CSSProperties = {
    opacity: 0,
    transform: "translateY(18px)",
    transition: "opacity 0.5s ease, transform 0.5s ease",
  };

  /* pricing amounts */
  const corePrice = isAnnual ? "3.33" : "4.99";
  const proPrice  = isAnnual ? "7.08" : "8.49";

  return (
    <>
      {/* ── global styles injected once ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
        body { background: ${C.bg0}; margin: 0; }

        /* floating math */
        .lq-math-sym {
          position: absolute;
          color: rgba(255,184,77,0.07);
          font-family: ${MONO};
          animation: lqFloat linear infinite;
          pointer-events: none;
          user-select: none;
        }
        @keyframes lqFloat {
          0%   { transform: translateY(0) rotate(-6deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(8deg); opacity: 0; }
        }

        /* cursor blink */
        .lq-cursor {
          display: inline-block; width: 7px; height: 13px;
          background: ${C.amber}; vertical-align: middle;
          animation: lqBlink 1s step-start infinite;
        }
        @keyframes lqBlink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* streak badge pulse */
        .lq-pulse { animation: lqPulse 2s infinite; }
        @keyframes lqPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* heatmap cells */
        .lq-hm0 { background: rgba(255,107,107,0.18); }
        .lq-hm1 { background: rgba(255,107,107,0.38); }
        .lq-hm2 { background: rgba(255,184,77,0.35); }
        .lq-hm3 { background: rgba(74,222,128,0.3); }
        .lq-hm4 { background: rgba(74,222,128,0.55); }

        /* toggle */
        .lq-toggle { width: 40px; height: 22px; border-radius: 11px; background: ${C.bg2};
          border: 1px solid ${C.border}; cursor: pointer; position: relative; transition: background 0.2s; }
        .lq-toggle.on { background: ${C.amber}; }
        .lq-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
          border-radius: 50%; background: ${C.muted}; transition: left 0.2s, background 0.2s; }
        .lq-toggle.on .lq-toggle-thumb { left: 20px; background: ${C.bg0}; }

        /* plan hover */
        .lq-plan { transition: border-color 0.2s, transform 0.15s; }
        .lq-plan:hover { transform: translateY(-2px); }
        .lq-feat-card { transition: border-color 0.2s; }
        .lq-feat-card:hover { border-color: rgba(255,184,77,0.25) !important; }

        /* form inputs */
        .lq-input, .lq-select, .lq-textarea {
          width: 100%; background: ${C.bg0}; border: 1px solid ${C.border};
          border-radius: 7px; color: ${C.text}; font-family: ${SANS}; font-size: 13px;
          padding: 9px 12px; outline: none; transition: border-color 0.15s;
          box-sizing: border-box; display: block;
        }
        .lq-input:focus, .lq-select:focus, .lq-textarea:focus {
          border-color: rgba(255,184,77,0.45);
        }
        .lq-select option { background: ${C.bg1}; }
        .lq-textarea { resize: vertical; min-height: 88px; }

        /* scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg0}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      <Navbar />

      <main style={{ background: C.bg0, color: C.text, fontFamily: SANS, position: "relative", overflowX: "hidden" }}>

        {/* ── floating math symbols ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {mathSymbols.map((s) => (
            <span
              key={s.id}
              className="lq-math-sym"
              style={{
                left: s.left, bottom: "-60px",
                fontSize: s.fontSize,
                animationDuration: s.duration,
                animationDelay: s.delay,
              }}
            >
              {s.sym}
            </span>
          ))}
        </div>

        {/* ════════════════════ HERO ════════════════════ */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px 88px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "center" }}>

            {/* left */}
            <div>
              {/* badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: C.amber,
                background: "rgba(255,184,77,0.08)", border: `1px solid rgba(255,184,77,0.2)`,
                borderRadius: 20, padding: "5px 14px", marginBottom: 24,
              }}>
                <span className="lq-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                Built for engineering students
              </div>

              <h1 style={{
                fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2.5px",
                marginBottom: 20, color: C.text,
              }}>
                Master every<br />
                <span style={{ color: C.amber }}>formula</span> before<br />
                the <span style={{ color: C.cyan }}>exam</span>.
              </h1>

              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, marginBottom: 36, maxWidth: 420 }}>
                AI-powered flashcards with LaTeX rendering, spaced repetition,
                and pre-built decks for every engineering course. Stop re-reading. Start remembering.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="#pricing"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontFamily: MONO, fontSize: 13, fontWeight: 700,
                    color: C.bg0, background: C.amber,
                    padding: "11px 22px", borderRadius: 7, textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.amberD)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.amber)}
                >
                  $ get_started --free →
                </a>
                <a
                  href="#features"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontFamily: MONO, fontSize: 13, fontWeight: 500,
                    color: C.muted, background: "transparent",
                    padding: "11px 22px", borderRadius: 7, textDecoration: "none",
                    border: `1px solid ${C.border}`, transition: "color 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = "#4A5568"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                >
                  ./how_it_works
                </a>
              </div>
            </div>

            {/* right — terminal */}
            <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              {/* title bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
                {["#FF5F57","#FFBD2E","#28CA41"].map((c, i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginLeft: 6 }}>learnqhub — bash</span>
              </div>

              {/* terminal body */}
              <div style={{ padding: 20, fontFamily: MONO, fontSize: 12.5, lineHeight: 2 }}>
                {typedLines.map((line, i) => {
                  let color = C.text;
                  if (line.startsWith("❯"))         color = C.cyan;
                  else if (line.startsWith("//"))    color = C.muted;
                  else if (line.includes("✓"))       color = C.green;
                  else if (line.includes(":")) {
                    const [k, v] = line.split(":");
                    return (
                      <div key={i}>
                        <span style={{ color: "#7EE787" }}>{k}</span>
                        <span style={{ color: C.muted }}>:</span>
                        <span style={{ color: line.includes("✓") ? C.green : C.cyan }}>{v}</span>
                      </div>
                    );
                  }
                  return <div key={i} style={{ color }}>{line}</div>;
                })}
                {typedLines.length < TERMINAL_LINES.length && (
                  <span className="lq-cursor" />
                )}

                {/* flashcard preview */}
                {typedLines.length >= TERMINAL_LINES.length && (
                  <div style={{
                    marginTop: 14, background: C.bg0,
                    border: `1px solid rgba(255,184,77,0.15)`, borderRadius: 8, padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.amber, marginBottom: 8 }}>
                      ▸ active card — Signals &amp; Systems
                    </div>
                    <div style={{ fontSize: 17, color: C.text, letterSpacing: 0.5, marginBottom: 10 }}>
                      X(ω) = ∫ x(t)e⁻ʲωᵗ dt
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["Fourier Transform", "Signals", "EE 3rd year"].map((t) => (
                        <span key={t} style={{
                          fontSize: 10, fontWeight: 600, color: C.cyan,
                          background: "rgba(0,217,255,0.08)", border: "1px solid rgba(0,217,255,0.15)",
                          borderRadius: 4, padding: "2px 8px",
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {typedLines.length >= TERMINAL_LINES.length && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: C.cyan }}>❯</span>
                    <span className="lq-cursor" />
                  </div>
                )}
              </div>

              {/* floating badges */}
              <div style={{ display: "flex", gap: 10, padding: "0 20px 20px", flexWrap: "wrap" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: "8px 12px", flex: 1,
                }}>
                  <span style={{ fontSize: 16 }}>🔥</span>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: "#F59E0B", lineHeight: 1 }}>14</div>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>day streak</div>
                  </div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: "8px 12px", flex: 1,
                }}>
                  <span style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>✓</span>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: C.green, fontWeight: 700, lineHeight: 1.2 }}>340 cards ready</div>
                    <div style={{ fontSize: 10, color: C.muted }}>Signals &amp; Systems</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════ STATS BAR ════════════════════ */}
        <div style={{ background: C.bg1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "32px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
            {[
              { val: "3.2h",  label: "saved per study session" },
              { val: "340+",  label: "cards per pre-built deck" },
              { val: "50+",   label: "engineering courses covered" },
              { val: "92%",   label: "pass on first attempt" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: C.amber, lineHeight: 1, marginBottom: 6 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════ FEATURES ════════════════════ */}
        <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 32px" }}>
          <div className="lq-reveal" style={revealStyle}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.amber, marginBottom: 10 }}>
              // why learnqhub
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 12, color: C.text }}>
              Everything Anki can't do.<br />
              <span style={{ color: C.amber }}>Built for engineers.</span>
            </h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, maxWidth: 520, marginBottom: 52 }}>
              Every feature designed around the specific way engineering students learn — and forget.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* large card */}
            <div className="lq-feat-card lq-reveal" style={{
              ...revealStyle,
              gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36,
              alignItems: "center", background: C.bg1, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: 28,
            }}>
              <div>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,184,77,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.amber, marginBottom: 14 }}>✦</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>AI card generation from your notes</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 14 }}>
                  Upload any lecture PDF. The AI reads it, extracts every key formula, theorem, and concept,
                  and builds a ready-to-study deck in under 30 seconds. No more manual card creation.
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["PDF upload","Auto-extraction","LaTeX parsing"].map((t) => (
                    <span key={t} style={{ fontSize: 11, fontWeight: 600, color: C.cyan, background: "rgba(0,217,255,0.08)", border: "1px solid rgba(0,217,255,0.15)", borderRadius: 4, padding: "3px 9px" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, fontFamily: MONO, fontSize: 12.5, lineHeight: 1.95 }}>
                <div style={{ color: C.muted }}>{"// uploading lecture_07.pdf..."}</div>
                <div><span style={{ color: "#7EE787" }}>status</span><span style={{ color: C.muted }}>: </span><span style={{ color: "#F97316" }}>"reading"</span></div>
                <div><span style={{ color: "#7EE787" }}>pages</span><span style={{ color: C.muted }}>: </span><span style={{ color: C.cyan }}>12</span></div>
                <div><span style={{ color: "#7EE787" }}>formulas</span><span style={{ color: C.muted }}>: </span><span style={{ color: C.cyan }}>38</span><span style={{ color: C.muted }}> detected</span></div>
                <div><span style={{ color: "#7EE787" }}>cards</span><span style={{ color: C.muted }}>: </span><span style={{ color: C.cyan }}>42</span><span style={{ color: C.muted }}> generated</span></div>
                <div><span style={{ color: "#7EE787" }}>time</span><span style={{ color: C.muted }}>: </span><span style={{ color: C.cyan }}>28s</span></div>
                <div><span style={{ color: "#7EE787" }}>ready</span><span style={{ color: C.muted }}>: </span><span style={{ color: C.green }}>true ✓</span> <span className="lq-cursor" /></div>
              </div>
            </div>

            {/* small cards */}
            {[
              { icon: "∑", iconBg: "rgba(0,217,255,0.08)", iconColor: C.cyan, title: "Perfect LaTeX rendering", desc: "Every formula renders pixel-perfectly in dark mode. Greek letters, integrals, matrices — all exactly right. Anki gets this wrong. We don't." },
              { icon: "⬡", iconBg: "rgba(74,222,128,0.08)", iconColor: C.green, title: "Mastery heatmap", desc: "A live visual of every topic colored by mastery level. Glance before an exam and know exactly where to spend your last hour." },
              { icon: "🔥", iconBg: "rgba(255,184,77,0.08)", iconColor: C.amber, title: "Streak & spaced repetition", desc: "Our algorithm schedules cards at the exact moment you're about to forget. Students who use it retain 3× more." },
              { icon: "⚡", iconBg: "rgba(0,217,255,0.06)", iconColor: C.cyan, title: "Exam simulation mode", desc: "Timed mock exams drawn from your weak cards. Get a predicted grade before the real thing." },
            ].map((f) => (
              <div key={f.title} className="lq-feat-card lq-reveal" style={{
                ...revealStyle,
                background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: f.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: f.iconColor, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════ HOW IT WORKS ════════════════════ */}
        <section id="how" style={{ background: C.bg1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "88px 32px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="lq-reveal" style={{ ...revealStyle, marginBottom: 52 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.amber, marginBottom: 10 }}>// how_it_works.sh</div>
              <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1.5px", color: C.text }}>Three commands.<br /><span style={{ color: C.cyan }}>One semester sorted.</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { step: "01", cmd: "upload --pdf lecture.pdf", title: "Upload your notes", desc: "Drop any lecture PDF or handout. Works with scanned images too." },
                { step: "02", cmd: "generate --cards --latex", title: "AI builds your deck", desc: "42 flashcards with full LaTeX in under 30 seconds. Every formula extracted automatically." },
                { step: "03", cmd: "study --spaced-repetition", title: "Study & track mastery", desc: "The algorithm serves cards at the exact moment you're about to forget. Watch your heatmap turn green." },
              ].map((s) => (
                <div key={s.step} className="lq-reveal" style={{
                  ...revealStyle,
                  background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24,
                }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 14, opacity: 0.6 }}>{s.step}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.green, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 6, padding: "6px 10px", marginBottom: 16 }}>
                    ❯ {s.cmd}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.title}</div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ TESTIMONIALS ════════════════════ */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 32px" }}>
          <div className="lq-reveal" style={{ ...revealStyle, marginBottom: 48 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.amber, marginBottom: 10 }}>// student_feedback.log</div>
            <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1.5px", color: C.text }}>Engineers who switched.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { initials: "AM", name: "Ana M.", role: "EE, 3rd year · TU Delft", text: "Passed Electromagnetics with a 9 after bombing the midterm. The spaced repetition + LaTeX combo is exactly what was missing from every other tool." },
              { initials: "MK", name: "Mihai K.", role: "CS / AI, MSc · Politehnica", text: "Uploaded my ML notes and had 40 cards in 30 seconds. The dark mode LaTeX actually works. Used Anki for years — switched immediately." },
              { initials: "TS", name: "Teodora S.", role: "Automation, MSc · ETH Zürich", text: "€4.99 for this is absurd value. Our whole study group shares decks now. Passed Linear Algebra with an 8 after failing it first time with Quizlet." },
            ].map((t) => (
              <div key={t.initials} className="lq-reveal" style={{
                ...revealStyle,
                background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24,
              }}>
                <div style={{ color: C.amber, fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>★★★★★</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 18, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,184,77,0.1)", border: "1px solid rgba(255,184,77,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.amber, flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════ PRICING ════════════════════ */}
        <section id="pricing" style={{ background: C.bg1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "88px 32px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="lq-reveal" style={{ ...revealStyle, textAlign: "center", maxWidth: 520, margin: "0 auto 48px" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.amber, marginBottom: 10 }}>// pricing.config</div>
              <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1.5px", color: C.text, marginBottom: 10 }}>
                Less than a coffee.<br /><span style={{ color: C.cyan }}>Worth a grade.</span>
              </h2>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7 }}>No tricks, no hidden fees. Cancel any time.</p>
            </div>

            {/* billing toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 36 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: isAnnual ? C.muted : C.text }}>Monthly</span>
              <div className={`lq-toggle ${isAnnual ? "on" : ""}`} onClick={() => setIsAnnual(!isAnnual)}>
                <div className="lq-toggle-thumb" />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 12, color: isAnnual ? C.text : C.muted }}>Annual</span>
              {isAnnual && (
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.bg0, background: C.green, borderRadius: 4, padding: "2px 8px" }}>2 months free</span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {/* FREE */}
              <div className="lq-plan" style={{ background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 6 }}>Free</div>
                <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 6 }}>€0<span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>/mo</span></div>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>The best free tier on the market. Genuinely useful, forever.</p>
                <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "0 0 20px" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    [true,"10 pre-built course decks"],
                    [true,"Up to 150 cards total"],
                    [true,"Full spaced repetition"],
                    [true,"1 PDF → cards per day"],
                    [false,"Mastery heatmap"],
                    [false,"Exam simulation"],
                  ].map(([yes, label]) => (
                    <li key={label as string} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: yes ? C.text : C.muted }}>
                      <span style={{ color: yes ? C.green : "#3A4152", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{yes ? "✓" : "—"}</span>
                      {label as string}
                    </li>
                  ))}
                </ul>
                <a href="/login" style={{ display: "block", textAlign: "center", fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.muted, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: 11, textDecoration: "none", transition: "color 0.15s, border-color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = "#4A5568"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                >$ get_started --free</a>
              </div>

              {/* CORE */}
              <div className="lq-plan" style={{ background: C.bg1, border: `2px solid rgba(255,184,77,0.45)`, borderRadius: 14, padding: 28, position: "relative" }}>
                <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.bg0, background: C.amber, borderRadius: 4, padding: "3px 8px", display: "inline-block", marginBottom: 14 }}>most popular</div>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 6 }}>Core</div>
                <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 4 }}>€{corePrice}<span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>/mo</span></div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginBottom: 14 }}>{isAnnual ? "€39.99 billed annually" : "\u00a0"}</div>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>Everything a student needs to dominate a full semester.</p>
                <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "0 0 20px" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    [true,"Unlimited pre-built decks"],
                    [true,"Unlimited cards"],
                    [true,"5 AI PDF → cards per day"],
                    [true,"Mastery heatmap"],
                    [false,"Unlimited AI generation"],
                    [false,"Exam simulation + insights"],
                  ].map(([yes, label]) => (
                    <li key={label as string} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: yes ? C.text : C.muted }}>
                      <span style={{ color: yes ? C.green : "#3A4152", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{yes ? "✓" : "—"}</span>
                      {label as string}
                    </li>
                  ))}
                </ul>
                <a href="/pricing" style={{ display: "block", textAlign: "center", fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.bg0, background: C.amber, borderRadius: 7, padding: 11, textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.amberD)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.amber)}
                >$ subscribe --core</a>
              </div>

              {/* PRO */}
              <div className="lq-plan" style={{ background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 6 }}>Pro</div>
                <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 4 }}>€{proPrice}<span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>/mo</span></div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginBottom: 14 }}>{isAnnual ? "€84.99 billed annually" : "\u00a0"}</div>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>For students who study seriously — and in groups.</p>
                <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "0 0 20px" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    "Everything in Core",
                    "Unlimited AI PDF → cards",
                    "Unlimited AI generation",
                    "Exam simulation mode",
                    "Weak formula clustering",
                    "Priority support",
                  ].map((label) => (
                    <li key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: C.text }}>
                      <span style={{ color: C.green, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {label}
                    </li>
                  ))}
                </ul>
                <a href="/pricing" style={{ display: "block", textAlign: "center", fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.muted, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: 11, textDecoration: "none", transition: "color 0.15s, border-color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = "#4A5568"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                >$ subscribe --pro</a>
              </div>
            </div>

            {/* comparison note */}
            <div style={{ marginTop: 24, padding: "16px 24px", background: "rgba(0,217,255,0.04)", border: "1px solid rgba(0,217,255,0.1)", borderRadius: 10, textAlign: "center" }}>
              <p style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>
                <span style={{ color: C.text }}>Quizlet</span> charges €7.99/mo with no engineering content.{" "}
                <span style={{ color: C.text }}>Anki</span> is free but has no LaTeX.{" "}
                <span style={{ color: C.amber }}>LearnQHub Core at €4.99/mo</span> is cheaper, better, purpose-built.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════ CONTACT ════════════════════ */}
        <section id="contact" style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "start" }}>
            {/* left */}
            <div className="lq-reveal" style={revealStyle}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.amber, marginBottom: 10 }}>// contact.reach()</div>
              <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1.5px", color: C.text, marginBottom: 16 }}>
                Questions?<br />We're <span style={{ color: C.amber }}>here</span>.
              </h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 32 }}>
                Whether you're a student, a professor, or just curious — we reply within 24 hours.
              </p>

              {[
                { icon: "✉", label: "Email", val: "contact@learnqhub.com" },
                { icon: "🏫", label: "Institutional", val: "Licensing available for departments. Contact us for a custom quote." },
                { icon: "⏱", label: "Response time", val: "Under 24h on weekdays" },
              ].map((ci) => (
                <div key={ci.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,184,77,0.07)", border: "1px solid rgba(255,184,77,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{ci.icon}</div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 2 }}>{ci.label}</div>
                    <div style={{ fontSize: 13, color: C.text }}>{ci.val}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 24, padding: 20, background: "rgba(255,184,77,0.05)", border: "1px solid rgba(255,184,77,0.15)", borderRadius: 10 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.amber, marginBottom: 8 }}>for professors &amp; departments</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
                  Give your whole class Pro access for a semester. Institutional licensing starts at €3,000/year for unlimited students.
                </p>
              </div>
            </div>

            {/* right — form */}
            <div className="lq-reveal" style={{ ...revealStyle, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
              {!isFormSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>send_message()</div>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 22 }}>We'll get back to you within 24 hours.</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
                    <div>
                      <label style={{ display: "block", fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 5 }}>first_name</label>
                      <input className="lq-input" type="text" placeholder="Ana" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 5 }}>last_name</label>
                      <input className="lq-input" type="text" placeholder="Popescu" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                  </div>

                  <label style={{ display: "block", fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 5, marginTop: 12 }}>email</label>
                  <input className="lq-input" type="email" placeholder="ana@university.eu" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />

                  <label style={{ display: "block", fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 5, marginTop: 12 }}>role</label>
                  <select className="lq-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="">Select role...</option>
                    <option>Engineering student</option>
                    <option>MSc / PhD student</option>
                    <option>Professor / Lecturer</option>
                    <option>Department coordinator</option>
                    <option>Just curious</option>
                  </select>

                  <label style={{ display: "block", fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 5, marginTop: 12 }}>topic</label>
                  <select className="lq-select" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })}>
                    <option value="">Select topic...</option>
                    <option>Free plan questions</option>
                    <option>Core plan — €4.99/mo</option>
                    <option>Pro plan — €8.49/mo</option>
                    <option>Institutional / department access</option>
                    <option>Feature request</option>
                    <option>Other</option>
                  </select>

                  <label style={{ display: "block", fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 5, marginTop: 12 }}>message</label>
                  <textarea className="lq-textarea" placeholder="Your message..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />

                  <button type="submit" style={{
                    display: "block", width: "100%", fontFamily: MONO, fontSize: 13, fontWeight: 700,
                    color: C.bg0, background: C.amber, padding: "12px", borderRadius: 7,
                    border: "none", cursor: "pointer", marginTop: 16, transition: "background 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.amberD)}
                    onMouseLeave={e => (e.currentTarget.style.background = C.amber)}
                  >
                    $ send_message →
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
                  <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Message sent!</div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 24 }}>We'll be in touch within 24 hours. In the meantime, why not try the free plan?</p>
                  <a href="#pricing" style={{
                    display: "inline-block", fontFamily: MONO, fontSize: 12, fontWeight: 700,
                    color: C.bg0, background: C.amber, padding: "11px 22px",
                    borderRadius: 7, textDecoration: "none",
                  }}>Explore plans →</a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════ FOOTER ════════════════════ */}
        <footer style={{ background: C.bg1, borderTop: `1px solid ${C.border}`, padding: "36px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: C.amber, marginBottom: 16 }}>LearnQHub.exit(0)</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap", marginBottom: 16 }}>
            {["features","pricing","contact","privacy","terms"].map((l) => (
              <a key={l} href={`#${l}`} style={{ fontSize: 13, color: C.muted, textDecoration: "none", fontFamily: MONO, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >{l}</a>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#3A4152" }}>© 2025 LearnQHub — built for engineers, by engineers.</div>
        </footer>

      </main>
    </>
  );
}
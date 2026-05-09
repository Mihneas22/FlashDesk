"use client";
import { useState, useEffect } from "react";
import './index.css';
import { Navbar } from "@/components/navbar";

const MATH_SYMBOLS_LIST = [
  '∫', '∑', '∂', '∇', 'λ', 'ω', 'μ', 'σ', 'π', 'Φ',
  'α', 'β', 'γ', 'δ', 'ε', 'θ', 'ρ',
  'dx', 'dt', 'j²', 'e^x', '∞', '∈', '⊂', '≡',
  'H(s)', 'Z(ω)', 'F(t)', 'Re{·}'
];

interface MathSymbol {
  id: number;
  sym: string;
  left: string;
  duration: string;
  delay: string;
  fontSize: string;
}

export default function App() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mathSymbols, setMathSymbols] = useState<MathSymbol[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      sym: MATH_SYMBOLS_LIST[i % MATH_SYMBOLS_LIST.length],
      left: `${Math.random() * 100}%`,
      duration: `${18 + Math.random() * 20}s`,
      delay: `${Math.random() * 20}s`,
      fontSize: `${14 + Math.random() * 32}px`
    }));
    setMathSymbols(generated);
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll<HTMLElement>(
      '.section-eyebrow, .section-title, .section-sub, .feat-card, .step, .testi, .plan, .stat-item, .reveal-item, .contact-info-item, .contact-form'
    );
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement; // Casting aici
          const delay = parseInt(target.dataset.delay || '0');
          
          setTimeout(() => {
            target.classList.add('revealed');
          }, 60 * delay);
          
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el, i) => {
      el.dataset.delay = (i % 6).toString();
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const animateCounter = (el: HTMLElement, target: number, suffix: string) => {
      let start = 0;
      const duration = 1500;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = (Number.isInteger(target) ? Math.floor(start) : start.toFixed(1)) + suffix;
        if (start >= target) clearInterval(timer);
      }, 16);
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll<HTMLElement>('.stat-item');
          const data = [
            { val: 3.2, suffix: 'h' },
            { val: 340, suffix: '+' },
            { val: 50, suffix: '+' },
            { val: 92, suffix: '%' }
          ];
          items.forEach((item, i) => {
            const valEl = item.querySelector<HTMLElement>('.stat-val');
            if (valEl) {
              setTimeout(() => animateCounter(valEl, data[i].val, data[i].suffix), i * 150);
            }
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    const statsBar = document.querySelector('.stats-bar-inner');
    if (statsBar) statsObserver.observe(statsBar);

    return () => statsObserver.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', role: '', topic: '', message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.ok) setIsFormSubmitted(true);
  };

  return (
    <>
      {/* Ambient lights */}
      <div className="ambient amb-1"></div>
      <div className="ambient amb-2"></div>
      <div className="ambient amb-3"></div>

      {/* Floating math symbols */}
      <div className="math-bg">
        {mathSymbols.map((symb) => (
          <span
            key={symb.id}
            className="math-sym"
            style={{
              left: symb.left,
              bottom: '-60px',
              animationDuration: symb.duration,
              animationDelay: symb.delay,
              fontSize: symb.fontSize,
              opacity: 0
            }}
          >
            {symb.sym}
          </span>
        ))}
      </div>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero">
        <div className="hero-inner">
          {/* Left: Copy */}
          <div className="hero-left">
            <div className="hero-badge">
              <span></span>
              Built for engineering students
            </div>
            <h1 className="hero-title">
              Master every<br />
              <span className="grad">formula</span> before<br />
              the <span className="acc">exam</span>.
            </h1>
            <p className="hero-sub">
              AI-powered flashcards with LaTeX rendering, spaced repetition, and pre-built decks for every engineering course. Stop re-reading textbooks. Start actually remembering.
            </p>
            <div className="hero-ctas">
              <a href="#pricing" className="btn-primary">
                Get started free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#how" className="btn-ghost">
                See how it works
              </a>
            </div>
          </div>

          {/* Right: Card demo */}
          <div className="hero-visual">
            {/* Background cards */}
            <div className="demo-card demo-card-bg1">
              <div className="card-formula" style={{ fontSize: '16px', color: 'rgba(167,139,250,0.6)' }}>
                ∇ × B = μ₀J + μ₀ε₀ ∂E/∂t
              </div>
            </div>
            <div className="demo-card demo-card-bg2">
              <div className="card-formula" style={{ fontSize: '16px', color: 'rgba(45,212,191,0.5)' }}>
                H(s) = Y(s)/X(s)
              </div>
            </div>

            {/* Main card */}
            <div className="demo-card demo-card-main">
              <div className="card-label">Signals &amp; Systems</div>
              <div className="card-formula">
                X(ω) = ∫<sub>-∞</sub><sup>∞</sup> x(t)e<sup>-jωt</sup>dt
              </div>
              <div className="card-intuition">
                💡 Decomposes a signal into its frequency components — like separating a chord into individual musical notes.
              </div>
              <div className="card-tags">
                <span className="card-tag">Fourier Transform</span>
                <span className="card-tag">Signals</span>
                <span className="card-tag">EE 3rd year</span>
              </div>
            </div>

            {/* Floating stat badges */}
            <div className="stat-float stat-float-1">
              <div className="sf-dot" style={{ background: 'rgba(245,158,11,0.2)' }}>🔥</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#f59e0b', lineHeight: 1 }}>14</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.06em' }}>Day streak</div>
              </div>
            </div>
            <div className="stat-float stat-float-2">
              <div className="sf-dot" style={{ background: 'rgba(45,212,191,0.15)' }}>✓</div>
              <div>
                <div style={{ fontSize: '13px', color: '#2dd4bf', fontWeight: '700', lineHeight: 1.3 }}>340 cards ready</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Signals &amp; Systems deck</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-bar-inner">
            <div className="stat-item" style={{ transitionDelay: '0ms' }}>
              <div className="stat-val">3.2h</div>
              <div className="stat-label">saved per study session</div>
            </div>
            <div className="stat-item" style={{ transitionDelay: '80ms' }}>
              <div className="stat-val">340+</div>
              <div className="stat-label">cards per pre-built deck</div>
            </div>
            <div className="stat-item" style={{ transitionDelay: '160ms' }}>
              <div className="stat-val">50+</div>
              <div className="stat-label">engineering courses covered</div>
            </div>
            <div className="stat-item" style={{ transitionDelay: '240ms' }}>
              <div className="stat-val">92%</div>
              <div className="stat-label">of users pass on first attempt</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-head">
            <p className="section-eyebrow">Why LearnQHub</p>
            <h2 className="section-title">Everything Anki can't do.<br /><span className="g-violet">Built for engineers.</span></h2>
            <p className="section-sub">Every feature is designed around the specific way engineering students learn — and forget.</p>
          </div>

          <div className="features-grid">
            {/* Large card: AI generation */}
            <div className="feat-card large" style={{ transitionDelay: '0ms' }}>
              <div>
                <div className="feat-icon">✦</div>
                <div className="feat-name">AI card generation from your notes</div>
                <div className="feat-desc" style={{ marginBottom: '16px' }}>Upload any lecture PDF or handout. The AI reads it, extracts every key formula, theorem, and concept, and builds a ready-to-study deck in under 30 seconds. No more manual card creation.</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="card-tag">PDF upload</span>
                  <span className="card-tag">Auto-extraction</span>
                  <span className="card-tag">LaTeX parsing</span>
                </div>
              </div>
              <div className="feat-visual">
                <div className="mono-line"><span className="mono-comment">// Uploading lecture_07.pdf...</span></div>
                <div className="mono-line"><span className="mono-key">status</span><span style={{ color: 'var(--text-muted)' }}>:</span> <span className="mono-val">"reading"</span></div>
                <div className="mono-line"><span className="mono-key">pages</span><span style={{ color: 'var(--text-muted)' }}>:</span> <span className="mono-val">12</span></div>
                <div className="mono-line"><span className="mono-key">formulas</span><span style={{ color: 'var(--text-muted)' }}>:</span> <span className="mono-val">38 detected</span></div>
                <div className="mono-line"><span className="mono-key">cards</span><span style={{ color: 'var(--text-muted)' }}>:</span> <span className="mono-val">42 generated</span></div>
                <div className="mono-line"><span className="mono-key">time</span><span style={{ color: 'var(--text-muted)' }}>:</span> <span className="mono-val">28s</span></div>
                <div className="mono-line" style={{ marginTop: '8px' }}>
                  <span className="mono-key">ready</span><span style={{ color: 'var(--text-muted)' }}>:</span> <span style={{ color: '#4ade80', fontWeight: '500' }}>true ✓</span> <span className="mono-cursor"></span>
                </div>
              </div>
            </div>

            {/* Perfect LaTeX */}
            <div className="feat-card" style={{ transitionDelay: '80ms' }}>
              <div className="feat-icon teal">∑</div>
              <div className="feat-name">Perfect LaTeX rendering</div>
              <div className="feat-desc">Every formula renders with pixel-perfect precision — in both light and dark mode. Anki gets this wrong. We don't. Greek letters, integrals, matrices — all exactly right.</div>
            </div>

            {/* Mastery heatmap */}
            <div className="feat-card" style={{ transitionDelay: '160ms' }}>
              <div className="feat-icon pink">⬡</div>
              <div className="feat-name">Mastery heatmap</div>
              <div className="feat-desc" style={{ marginBottom: '14px' }}>A live visual of every topic in your course, colored red → green by mastery level. Glance at it the night before an exam and know exactly where to spend your last hour.</div>
              <div className="heatmap-grid">
                <div className="hm-cell hm-4"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-3"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-2"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-3"></div><div className="hm-cell hm-4"></div>
                <div className="hm-cell hm-3"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-1"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-3"></div><div className="hm-cell hm-2"></div><div className="hm-cell hm-4"></div>
                <div className="hm-cell hm-4"></div><div className="hm-cell hm-2"></div><div className="hm-cell hm-3"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-0"></div><div className="hm-cell hm-1"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-3"></div>
                <div className="hm-cell hm-1"></div><div className="hm-cell hm-0"></div><div className="hm-cell hm-0"></div><div className="hm-cell hm-1"></div><div className="hm-cell hm-4"></div><div className="hm-cell hm-3"></div><div className="hm-cell hm-1"></div><div className="hm-cell hm-0"></div>
              </div>
            </div>

            {/* Streak */}
            <div className="feat-card" style={{ transitionDelay: '240ms' }}>
              <div className="feat-icon amber">🔥</div>
              <div className="feat-name">Streak system that actually works</div>
              <div className="feat-desc">Daily review sessions build a streak that becomes a genuine study habit. A 30-day streak is a switching cost. Once you've built it, you won't give it up.</div>
            </div>

            {/* Pre-built decks */}
            <div className="feat-card" style={{ transitionDelay: '320ms' }}>
              <div className="feat-icon green">📚</div>
              <div className="feat-name">Pre-built engineering decks</div>
              <div className="feat-desc">Ready-to-use decks for Signals & Systems, Linear Algebra, Electrodynamics, Numerical Methods, Data Structures, and 45+ more courses. Study from day one.</div>
            </div>

            {/* Exam simulation */}
            <div className="feat-card" style={{ transitionDelay: '400ms' }}>
              <div className="feat-icon blue">⏱</div>
              <div className="feat-name">Exam simulation mode</div>
              <div className="feat-desc">Timed mock exam. Set which formulas are allowed. Get a predicted score. Compare to previous simulations. Know exactly if you're ready — before the real thing.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="how-section" id="how">
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 70px' }}>
            <p className="section-eyebrow">The process</p>
            <h2 className="section-title">From lecture notes<br />to <span className="g-teal">exam ready</span>.</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Four steps. Thirty seconds to your first deck.</p>
          </div>

          <div className="steps-grid">
            <div className="step" style={{ transitionDelay: '0ms' }}>
              <div className="step-num">01</div>
              <div className="step-title">Upload or choose</div>
              <div className="step-desc">Pick a pre-built deck for your course, or upload your own lecture PDF to generate custom cards.</div>
            </div>
            <div className="step" style={{ transitionDelay: '100ms' }}>
              <div className="step-num">02</div>
              <div className="step-title">AI processes it</div>
              <div className="step-desc">The AI reads your notes, extracts every formula, and builds a deck with front, back, intuition, and examples.</div>
            </div>
            <div className="step" style={{ transitionDelay: '200ms' }}>
              <div className="step-num">03</div>
              <div className="step-title">Study daily</div>
              <div className="step-desc">Swipe-based mobile review. 5 minutes a day is enough. The algorithm surfaces what you're forgetting, not what you already know.</div>
            </div>
            <div className="step" style={{ transitionDelay: '300ms' }}>
              <div className="step-num">04</div>
              <div className="step-title">Pass the exam</div>
              <div className="step-desc">Your mastery heatmap turns green. Run the exam simulation. Walk in confident. Walk out with the grade.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="social-section">
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto 50px' }}>
            <p className="section-eyebrow">Student reviews</p>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px,3.5vw,44px)' }}>What students are saying</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testi" style={{ transitionDelay: '0ms' }}>
              <div className="stars">★★★★★</div>
              <div className="testi-text">"I used this for my Signals & Systems exam. The Fourier transform deck alone saved me. The intuition explanations on the card backs are something no textbook ever bothered to write."</div>
              <div className="testi-author">
                <div className="testi-avatar">AM</div>
                <div>
                  <div className="testi-name">Ana M.</div>
                  <div className="testi-role">EE, 3rd year · TU Delft</div>
                </div>
              </div>
            </div>
            <div className="testi" style={{ transitionDelay: '100ms' }}>
              <div className="stars">★★★★★</div>
              <div className="testi-text">"I uploaded my ML experiment notes and had 40 cards ready in 30 seconds. The LaTeX actually works perfectly in dark mode — I'd been using Anki for years and this made me switch immediately."</div>
              <div className="testi-author">
                <div className="testi-avatar">MK</div>
                <div>
                  <div className="testi-name">Mihai K.</div>
                  <div className="testi-role">CS / AI, MSc · Politehnica</div>
                </div>
              </div>
            </div>
            <div className="testi" style={{ transitionDelay: '200ms' }}>
              <div className="stars">★★★★★</div>
              <div className="testi-text">"€4.99 for this is absurd value. Our whole study group shares decks on it now. We each add cards and everyone benefits. Passed Linear Algebra with an 8 after failing it the first time with Quizlet."</div>
              <div className="testi-author">
                <div className="testi-avatar">TS</div>
                <div>
                  <div className="testi-name">Teodora S.</div>
                  <div className="testi-role">Automation, MSc · ETH Zürich</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 50px' }}>
            <p className="section-eyebrow">Pricing</p>
            <h2 className="section-title">Less than a coffee.<br /><span className="g-pink">Worth a grade.</span></h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>No tricks, no hidden fees. Cancel any time. Student-first pricing built to be fair.</p>
          </div>

          {/* Billing toggle */}
          <div className="billing-toggle">
            <span className="billing-label">Monthly</span>
            <div 
              className={`toggle-track ${isAnnual ? 'on' : ''}`} 
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <div className="toggle-thumb"></div>
            </div>
            <span className="billing-label">Annual</span>
            <span className={`save-pill ${isAnnual ? 'show' : ''}`}>2 months free</span>
          </div>

          <div className="plans-grid">
            {/* FREE */}
            <div className="plan" style={{ transitionDelay: '0ms' }}>
              <div className="plan-name">Free</div>
              <div className="plan-desc">The best free tier on the market. Genuinely useful, forever.</div>
              <div className="plan-price">
                <span className="plan-currency">€</span>
                <span className="plan-amount">0</span>
              </div>
              <div className="plan-annual-note">&nbsp;</div>

              <div className="plan-divider"></div>
              <ul className="plan-features">
                <li className="plan-feat"><div className="pf-check yes">✓</div>10 full pre-built course deck</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Up to 150 cards total</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Full spaced repetition algorithm</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>1 PDF → cards per day</li>
                <li className="plan-feat off"><div className="pf-check no">—</div>Mastery heatmap</li>
                <li className="plan-feat off"><div className="pf-check no">—</div>Exam simulation</li>
              </ul>
              <a href="/login" className="plan-cta ghost">Get started free</a>
            </div>

            {/* CORE (featured) */}
            <div className="plan featured" style={{ transitionDelay: '100ms' }}>
              <div className="plan-glow"></div>
              <div className="plan-badge">Most popular</div>
              <div className="plan-name">Core</div>
              <div className="plan-desc">Everything a student needs to dominate a full semester.</div>
              <div className="plan-price">
                <span className="plan-currency">€</span>
                <span className="plan-amount">{isAnnual ? '3.33' : '4.99'}</span>
                <span className="plan-period">/mo</span>
              </div>
              <div className="plan-annual-note">
                {isAnnual ? '€39.99 billed annually — 2 months free' : '\u00a0'}
              </div>

              <div className="plan-divider"></div>
              <ul className="plan-features">
                <li className="plan-feat"><div className="pf-check yes">✓</div>Unlimited pre-built course decks</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Unlimited cards</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>5 AI PDF → cards per day</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Mastery heatmap per course</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>5-minute daily mode</li>
                <li className="plan-feat off"><div className="pf-check no">—</div>Unlimited AI generation</li>
                <li className="plan-feat off"><div className="pf-check no">—</div>Exam simulation + insights</li>
                <li className="plan-feat off"><div className="pf-check no">—</div>Collaborative decks</li>
              </ul>
              <a href="/pricing" className="plan-cta primary">Get started</a>
            </div>

            {/* PRO */}
            <div className="plan" style={{ transitionDelay: '200ms' }}>
              <div className="plan-name">Pro</div>
              <div className="plan-desc">For students who study seriously — and in groups.</div>
              <div className="plan-price">
                <span className="plan-currency">€</span>
                <span className="plan-amount">{isAnnual ? '7.08' : '8.49'}</span>
                <span className="plan-period">/mo</span>
              </div>
              <div className="plan-annual-note">
                {isAnnual ? '€84.99 billed annually — 2 months free' : '\u00a0'}
              </div>

              <div className="plan-divider"></div>
              <ul className="plan-features">
                <li className="plan-feat"><div className="pf-check yes">✓</div>Everything in Core</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Unlimited AI PDF → cards</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Unlimited AI card generation</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Exam simulation mode</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Weak formula clustering insights</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Collaborative decks (4 people)</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Browser extension (highlight → card)</li>
                <li className="plan-feat"><div className="pf-check yes">✓</div>Priority support</li>
              </ul>
              <a href="/pricing" className="plan-cta ghost">Get started</a>
            </div>
          </div>

          {/* Comparison note */}
          <div style={{
            textAlign: 'center', marginTop: '40px', padding: '20px', 
            borderRadius: '14px', background: 'rgba(124,58,237,0.05)', 
            border: '1px solid rgba(124,58,237,0.12)'
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Quizlet charges <strong style={{ color: 'var(--text)' }}>€7.99/mo</strong> and has no engineering content. Anki is free but has terrible mobile UX and no LaTeX support. LearnQHub Core at <strong style={{ color: 'var(--violet-l)' }}>€4.99/mo</strong> is cheaper, better, and purpose-built for your degree.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section className="contact-section" id="contact">
        <div className="container">
          <div className="contact-grid">
            {/* Left: info */}
            <div>
              <p className="section-eyebrow reveal-item">Get in touch</p>
              <h2 className="section-title reveal-item" style={{ marginBottom: '20px' }}>Questions?<br />We're <span className="g-violet">here</span>.</h2>
              <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '40px' }} className="reveal-item">
                Whether you're a student with a question about a plan, a professor interested in department access, or just curious — we reply within 24 hours.
              </p>

              <div className="contact-info-item" style={{ transitionDelay: '0ms' }}>
                <div className="ci-icon">✉</div>
                <div>
                  <div className="ci-label">Email</div>
                  <div className="ci-val">contact@learnqhub.com</div>
                </div>
              </div>

        @      <div className="contact-info-item" style={{ transitionDelay: '100ms' }}>
                <div className="ci-icon">🏫</div>
                <div>
                  <div className="ci-label">University &amp; department access</div>
                  <div className="ci-val">Institutional licensing available. Contact us for a custom quote for your department.</div>
                </div>
              </div>

              <div className="contact-info-item" style={{ transitionDelay: '200ms' }}>
                <div className="ci-icon">⏱</div>
                <div>
                  <div className="ci-label">Response time</div>
                  <div className="ci-val">Under 24 hours on weekdays</div>
                </div>
              </div>

              {/* Mini pitch for departments */}
              <div style={{
                marginTop: '32px', padding: '24px', borderRadius: '16px', 
                background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)'
              }} className="reveal-item">
                <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--violet-l)', marginBottom: '10px' }}>For professors & departments</div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Give your whole class free Pro access for a semester. We handle the content, you see the results. Institutional licensing starts at €3,000/year for unlimited students.</p>
              </div>
            </div>

            {/* Right: form */}
            <div className="contact-form reveal-item">
              {!isFormSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.5px' }}>Send a message</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>We'll get back to you within 24 hours.</p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="form-input" 
                        placeholder="Ana" 
                        required
                        />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="form-input" 
                        placeholder="Ana" 
                        required
                        />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="form-input" 
                        placeholder="ana@university.eu" 
                        required
                        />
                  </div>

                  <div className="form-group">
                    <label className="form-label">I am a</label>
                      <select 
                        className="form-select"
                        name="role"
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                      >
                      <option value="">Select role...</option>
                      <option>Engineering student</option>
                      <option>MSc / PhD student</option>
                      <option>Professor / Lecturer</option>
                      <option>Department coordinator</option>
                      <option>Just curious</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Interested in</label>
                    <select 
                        className="form-select"
                        name="role"
                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      >
                      <option value="">Select topic...</option>
                      <option>Free plan questions</option>
                      <option>Core plan — €4.99/mo</option>
                      <option>Pro plan — €8.49/mo</option>
                      <option>Institutional / department access</option>
                      <option>Feature request</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea 
                        name="message"
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="form-textarea"
                        placeholder="Enter your ideas, proposals etc..."
                      ></textarea>
                  </div>

                  <button type="submit" className="form-submit">
                    Send message →
                  </button>
                </form>
              ) : (
                <div className="form-success show">
                  <div className="success-icon">✅</div>
                  <div className="success-title">Message sent!</div>
                  <div className="success-sub">We'll be in touch within 24 hours. In the meantime, why not try the free plan?</div>
                  <a href="#pricing" style={{
                    display: 'inline-block', marginTop: '24px', padding: '12px 24px', 
                    borderRadius: '12px', background: 'linear-gradient(135deg, var(--violet), var(--purple))', 
                    color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '14px'
                  }}>Explore plans →</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer>
        <div className="footer-logo">LearnQHub</div>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
        <div className="footer-copy">© 2025 LearnQHub. Built for engineers, by engineers.</div>
      </footer>
    </>
  );
}
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import LandingNav from "../src/LandingNav";
import { useRef, useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignUpButton,
} from "@clerk/clerk-react";
import usePaidStatus from "../src/usePaidStatus";
import useUpgrade from "../src/useUpgrade";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        "#020817",
  bgAlt:     "#0b1120",
  surface:   "#0d1b2a",
  primary:   "#1565C0",
  secondary: "#4FC3F7",
  gold:      "#c9a84c",
  onSurface: "#f8fafc",
  muted:     "#94a3b8",
};
const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

// ─── ScrollReveal ──────────────────────────────────────────────────────────────
function ScrollReveal({ children, direction = "up", startOffset = 0, className, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const yPx   = !visible && (direction === "up" || direction === "scale") ? 28 : 0;
  const xPx   = !visible && direction === "left" ? -48 : !visible && direction === "right" ? 48 : 0;
  const sc    = !visible && direction === "scale" ? 0.88 : 1;
  const delay = startOffset ? `${Math.round(startOffset * 120)}ms` : "0ms";
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: `translateY(${yPx}px) translateX(${xPx}px) scale(${sc})`,
      transition: `opacity 0.6s ease ${delay}, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}`,
      willChange: "opacity, transform",
      ...style,
    }}>{children}</div>
  );
}

// ─── SectionScan ──────────────────────────────────────────────────────────────
function SectionScan({ label, align = "left" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const centered = align === "center";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", flexDirection: centered ? "column" : "row", gap: centered ? 12 : 16, marginBottom: centered ? 32 : 56, paddingTop: 4 }}>
      <span style={{ opacity: visible ? 0.7 : 0, transform: visible ? "none" : centered ? "translateY(-8px)" : "translateX(-20px)", transition: "opacity 0.5s ease, transform 0.5s ease", fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "Inter, sans-serif", color: C.secondary, whiteSpace: "nowrap", display: "inline-block" }}>
        {label}
      </span>
      <div style={{ transform: visible ? "scaleX(1)" : "scaleX(0)", transformOrigin: centered ? "center" : "left", transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s", ...(centered ? { width: 64, height: 2, borderRadius: 2, background: cyberGrad } : { flex: 1, height: 1, background: `linear-gradient(to right, ${C.secondary}, rgba(79,195,247,0))` }), boxShadow: "0 0 8px rgba(79,195,247,0.35)" }} />
    </div>
  );
}

// ─── GlowCard — mouse-following neon glow ─────────────────────────────────────
function GlowCard({ children, className, style }) {
  const wrapRef = useRef(null);
  const glowRef = useRef(null);
  return (
    <div
      ref={wrapRef}
      className={`lp-glass-card ${className || ""}`}
      style={{ position: "relative", overflow: "hidden", ...style }}
      onMouseMove={(e) => {
        if (!wrapRef.current || !glowRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        glowRef.current.style.background = `radial-gradient(500px circle at ${x}px ${y}px, rgba(79,195,247,0.13), transparent 60%)`;
        glowRef.current.style.opacity = "1";
      }}
      onMouseLeave={() => {
        if (glowRef.current) glowRef.current.style.opacity = "0";
      }}
    >
      <div ref={glowRef} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", transition: "opacity 0.35s ease", zIndex: 0, borderRadius: "inherit" }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── ScrambleText ─────────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%*";
function ScrambleText({ text, active }) {
  const [revealedCount, setRevealedCount] = useState(text.length);
  const startedRef = useRef(false);
  const SCRAMBLE_WINDOW = 6;
  const DURATION_MS = 1650;

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;
    setRevealedCount(0);

    let rafId;
    let startTime;

    const tick = (now) => {
      if (startTime == null) startTime = now;
      const progress = Math.min((now - startTime) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 2.4);
      const nextRevealed = progress >= 1 ? text.length : Math.min(text.length - 1, Math.floor(eased * text.length));

      setRevealedCount(nextRevealed);

      if (progress >= 1) {
        setRevealedCount(text.length);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, text]);

  useEffect(() => {
    if (!active) {
      setRevealedCount(text.length);
      startedRef.current = false;
    }
  }, [active, text]);

  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {text.split("").map((ch, i) => {
        if (ch === " ") {
          return <span key={`${ch}-${i}`}> </span>;
        }

        const isRevealed = i < revealedCount;
        const shouldScramble = !isRevealed && i < revealedCount + SCRAMBLE_WINDOW;
        const overlayChar = shouldScramble
          ? CHARS[Math.floor(Math.random() * CHARS.length)]
          : ch;

        return (
          <span
            key={`${ch}-${i}`}
            style={{
              position: "relative",
              display: "inline-block",
              color: "transparent",
            }}
          >
            {ch}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                color: shouldScramble ? "rgba(248,250,252,0.88)" : "#f8fafc",
              }}
            >
              {overlayChar}
            </span>
          </span>
        );
      })}
    </span>
  );
}

// ─── CountUp ──────────────────────────────────────────────────────────────────
function CountUp({ target, suffix = "", prefix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// ─── AnimatedBar ──────────────────────────────────────────────────────────────
function AnimatedBar({ pct, color = cyberGrad, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      setTimeout(() => setWidth(pct), delay);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 999, transition: `width 1.2s cubic-bezier(0.22,1,0.36,1) ${delay}ms`, boxShadow: "0 0 10px rgba(79,195,247,0.4)" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
  const router = useRouter();
  const { isPaid } = usePaidStatus();
  const handleUpgrade = useUpgrade();
  const scrambleRef = useRef(null);
  const [scrambleTrigger, setScramble] = useState(false);
  // Scramble trigger via IntersectionObserver
  useEffect(() => {
    const el = scrambleRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setScramble(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Head>
        <title>Fite Finance | Features</title>
        <meta name="description" content="Explore Fite Finance — AI grading, mock interview mode, history tracking, and more. Built for IB, PE, and hedge fund candidates." />
      </Head>

      <LandingNav />

      {/* Back CTA — a softer inverse of the hero's primary CTA */}
      <div className="features-home-cta">
        <button
          onClick={() => router.push("/")}
          className="back-home-btn"
          style={{
            background: "rgba(2, 8, 23, 0.74)",
            color: "#e2eefc",
            border: "1px solid rgba(79,195,247,0.38)",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            padding: "10px 24px",
            borderRadius: 999,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            boxShadow: "0 14px 36px rgba(2,8,23,0.26), inset 0 0 0 1px rgba(79,195,247,0.06)",
            backdropFilter: "blur(16px)",
          }}
        >
          ← Home
        </button>
      </div>

      <div style={{ color: C.onSurface }}>

        {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
        <section id="features-section" style={{ position: "relative", zIndex: 2, background: C.bg }}>
          <div className="features-page-intro" style={{ padding: "clamp(152px, 18vw, 176px) 32px 96px", maxWidth: 1280, margin: "0 auto" }}>
            <SectionScan label="Premium Features" />
            <ScrollReveal direction="left" style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px 0", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
                Features
              </h2>
              <div style={{ height: 4, width: 96, background: cyberGrad, borderRadius: 2 }} />
            </ScrollReveal>

            {/* Stats strip */}
            <ScrollReveal style={{ marginBottom: 64 }}>
              <div style={{ display: "flex", flexWrap: "wrap", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(21,101,192,0.2)" }}>
                {[
                  { label: "Questions Generated",     val: 50000, suffix: "+",    prefix: ""  },
                  { label: "Categories",              val: 8,     suffix: "",     prefix: ""  },
                  { label: "Score Improvement",       val: 40,    suffix: "%",    prefix: ""  },
                  { label: "Price",                   val: 3,     suffix: "/mo",  prefix: "$" },
                ].map(({ label, val, suffix, prefix }, i) => (
                  <div key={label} style={{ flex: "1 1 160px", padding: "28px 24px", textAlign: "center", background: i % 2 === 0 ? "rgba(21,101,192,0.06)" : "rgba(79,195,247,0.04)", borderRight: i < 3 ? "1px solid rgba(21,101,192,0.15)" : "none" }}>
                    <div style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, fontFamily: "Inter, sans-serif", background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
                      <CountUp target={val} suffix={suffix} prefix={prefix} />
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Feature cards */}
            <div className="feat-grid">
              <ScrollReveal direction="left" startOffset={0.1} className="feat-large">
                <GlowCard>
                  <span className="material-symbols-outlined lp-icon-secondary">tune</span>
                  <h3 className="lp-card-title">Customized Practice</h3>
                  <p className="lp-card-body" style={{ maxWidth: 380, marginBottom: 24 }}>
                    Select category (IB, PE, HF), difficulty, and math preference.
                    Tailor your prep to the exact desk you&apos;re targeting.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                    {["Investment Banking", "LBO Modeling"].map(tag => (
                      <span key={tag} className="lp-tag">{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[{ label: "Investment Banking", pct: 92 }, { label: "Private Equity", pct: 85 }, { label: "Consulting", pct: 78 }].map(({ label, pct }, i) => (
                      <div key={label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>
                          <span>{label}</span><span style={{ color: C.secondary, fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <AnimatedBar pct={pct} delay={i * 150} />
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </ScrollReveal>

              <ScrollReveal direction="right" startOffset={0.2} className="feat-small">
                <GlowCard>
                  <span className="material-symbols-outlined lp-icon-secondary">psychology</span>
                  <h3 className="lp-card-title">AI Grading</h3>
                  <p className="lp-card-body" style={{ marginBottom: 24 }}>
                    Instant written feedback on every answer. Know exactly where you stand.
                  </p>
                  <AnimatedBar pct={96} color="linear-gradient(45deg, #4FC3F7, #1565C0)" />
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontFamily: "Manrope, sans-serif" }}>Accuracy rate</div>
                </GlowCard>
              </ScrollReveal>

              <ScrollReveal startOffset={0.15} className="feat-full">
                <GlowCard>
                  <div style={{ display: "flex", flexDirection: "row", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <span className="material-symbols-outlined lp-icon-primary">timeline</span>
                      <h3 className="lp-card-title">History &amp; Tracking</h3>
                      <p className="lp-card-body">
                        Track your progress over time with granular data. Visualize readiness across core competencies and technical hurdles.
                      </p>
                    </div>
                    <div style={{ flex: 1, minWidth: 180, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", padding: 24, borderRadius: 12, border: "1px solid rgba(21,101,192,0.2)", background: "rgba(2,8,23,0.5)" }}>
                      <div style={{ height: 140, display: "flex", alignItems: "flex-end", gap: 8 }}>
                        {[30, 45, 60, 85, 70].map((h, i) => (
                          <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", height: `${h}%`, background: i === 3 ? cyberGrad : `rgba(21,101,192,${0.2 + i * 0.12})`, boxShadow: i === 3 ? "0 0 20px rgba(21,101,192,0.4)" : "none" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </ScrollReveal>

              <ScrollReveal startOffset={0.1} className="feat-full">
                <GlowCard>
                  <span className="material-symbols-outlined lp-icon-secondary">record_voice_over</span>
                  <h3 className="lp-card-title">Mock Interview Mode</h3>
                  <p className="lp-card-body" style={{ maxWidth: 600 }}>
                    A full structured mock interview: realistic scenario, four sequential questions,
                    live AI interviewer responses, and a holistic debrief after you&apos;re done.
                    Premium experience, $3/mo.
                  </p>
                </GlowCard>
              </ScrollReveal>
            </div>

            {/* Scramble quote */}
            <div className="features-quote-block" ref={scrambleRef} style={{ marginTop: 96, textAlign: "center", padding: "64px 32px", borderRadius: 24, background: "linear-gradient(135deg, rgba(21,101,192,0.08), rgba(79,195,247,0.04))", border: "1px solid rgba(21,101,192,0.15)" }}>
              <p style={{ fontSize: "clamp(18px, 2.8vw, 30px)", fontWeight: 800, fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", color: C.onSurface, margin: 0, lineHeight: 1.45 }}>
                <ScrambleText
                  text="The edge between a good candidate and a great one is preparation."
                  active={scrambleTrigger}
                />
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
        <section style={{ position: "relative", zIndex: 2, background: C.bgAlt }}>
          <div style={{ padding: "96px 32px", maxWidth: 1280, margin: "0 auto" }}>
            <SectionScan label="How It Works" />
            <ScrollReveal direction="right" style={{ marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px 0", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
                How It Works
              </h2>
              <p style={{ color: C.muted, fontFamily: "Manrope, sans-serif", margin: "0 0 16px 0", fontSize: 16 }}>
                From signup to debrief in four steps.
              </p>
              <div style={{ height: 4, width: 96, background: cyberGrad, borderRadius: 2 }} />
            </ScrollReveal>

            <div className="how-grid">
              {[
                { step: "01", icon: "person_add",   title: "Create an Account",      body: "Sign up in seconds — no credit card required. Free tier gives you 5 questions per day.", tag: "Free" },
                { step: "02", icon: "tune",          title: "Configure Your Session", body: "Pick a category, difficulty, toggle math on/off, and add a custom descriptor.", tag: "Customizable" },
                { step: "03", icon: "rate_review",   title: "Answer & Get Graded",    body: "Tackle AI-generated questions, write your answer, then get instant AI feedback.", tag: "AI-Powered" },
                { step: "04", icon: "timeline",      title: "Track Your Progress",    body: "Every graded answer is logged. Search, filter, and watch your performance improve.", tag: "Premium" },
              ].map(({ step, icon, title, body, tag }, i) => (
                <ScrollReveal key={step} direction="scale" startOffset={0.05 + i * 0.1} className="lp-glass-card how-step-card">
                  <div style={{ fontSize: 52, fontWeight: 900, fontFamily: "Inter, sans-serif", background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 20, letterSpacing: "-0.04em" }}>
                    {step}
                  </div>
                  <span className="material-symbols-outlined lp-icon-secondary">{icon}</span>
                  <h3 className="lp-card-title" style={{ fontSize: 18 }}>{title}</h3>
                  <p className="lp-card-body">{body}</p>
                  <div style={{ marginTop: 20 }}>
                    <span className="lp-tag">{tag}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: "96px 32px", position: "relative", zIndex: 2, background: C.bg }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <SectionScan label="Pricing" />
          </div>
          <ScrollReveal style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px 0", fontFamily: "Inter, sans-serif" }}>
              Invest in Your Career
            </h2>
            <div style={{ height: 4, width: 64, background: cyberGrad, borderRadius: 2, margin: "0 auto 12px" }} />
            <p style={{ color: C.muted, fontFamily: "Manrope, sans-serif", margin: 0 }}>
              Predictable pricing for exponential returns.
            </p>
          </ScrollReveal>

          <div className="lp-pricing-grid">
            <ScrollReveal direction="left" startOffset={0.1} style={{ background: C.surface, border: "1px solid rgba(51,65,85,0.3)", padding: 40, borderRadius: 16, display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", fontFamily: "Inter, sans-serif" }}>Free Tier</h3>
                <p style={{ color: C.muted, fontSize: 14, margin: 0, fontFamily: "Manrope, sans-serif" }}>Essential Prep</p>
              </div>
              <div style={{ fontSize: 42, fontWeight: 900, margin: "0 0 32px 0", fontFamily: "Inter, sans-serif" }}>
                $0<span style={{ fontSize: 18, fontWeight: 400, color: C.muted }}>/mo</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", flex: 1 }}>
                {[
                  { t: "5 Questions / Day",    ok: true  },
                  { t: "Basic Logic Feedback", ok: true  },
                  { t: "Unlimited History",    ok: false },
                  { t: "Mock Interview Mode",  ok: false },
                ].map(({ t, ok }) => (
                  <li key={t} style={{ display: "flex", alignItems: "center", gap: 12, opacity: ok ? 1 : 0.35, color: C.muted, fontFamily: "Manrope, sans-serif", fontSize: 14, marginBottom: 16 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: ok ? C.primary : C.muted }}>{ok ? "check_circle" : "cancel"}</span>
                    {t}
                  </li>
                ))}
              </ul>
              <SignUpButton mode="modal">
                <button className="lp-btn-outline-block">Get Started Free</button>
              </SignUpButton>
            </ScrollReveal>

            <div style={{ transform: "scale(1.03)" }}>
              <ScrollReveal direction="right" startOffset={0.2} className="lp-glass-card-solid" style={{ padding: 40, borderRadius: 16, display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
                <div style={{ position: "absolute", top: 0, right: 40, transform: "translateY(-50%)", background: cyberGrad, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "Manrope, sans-serif", boxShadow: "0 4px 12px rgba(21,101,192,0.4)" }}>
                  Recommended
                </div>
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", fontFamily: "Inter, sans-serif" }}>Fite Premium</h3>
                  <p style={{ color: C.muted, fontSize: 14, margin: 0, fontFamily: "Manrope, sans-serif" }}>Advanced Mastery</p>
                </div>
                <div style={{ fontSize: 42, fontWeight: 900, margin: "0 0 32px 0", color: C.secondary, fontFamily: "Inter, sans-serif" }}>
                  $3<span style={{ fontSize: 18, fontWeight: 400, color: C.muted }}>/mo</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", flex: 1 }}>
                  {["Unlimited Questions", "Advanced AI Answer Grading", "Complete Question History", "Mock Interview Mode", "Priority 24/7 Support"].map(t => (
                    <li key={t} style={{ display: "flex", alignItems: "center", gap: 12, color: C.onSurface, fontFamily: "Manrope, sans-serif", fontSize: 14, marginBottom: 16 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.secondary }}>verified</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <SignUpButton mode="modal">
                  <button className="lp-btn-premium">Go Premium →</button>
                </SignUpButton>
                <p style={{ fontSize: 10, textAlign: "center", margin: "12px 0 0", color: C.muted, opacity: 0.6, fontFamily: "Manrope, sans-serif" }}>
                  Secure payment powered by Stripe
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────────── */}
        <section style={{ padding: "128px 32px", textAlign: "center", position: "relative", overflow: "hidden", zIndex: 2, background: C.bgAlt }}>
          {/* Ambient glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: isPaid ? "rgba(201,168,76,0.12)" : "rgba(21,101,192,0.15)", borderRadius: "50%", filter: "blur(90px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "50%", left: "38%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "rgba(79,195,247,0.08)", borderRadius: "50%", filter: "blur(65px)", pointerEvents: "none" }} />

          <SectionScan label={isPaid ? "Premium Access" : "Get Started"} align="center" />

          {isPaid ? (
            <>
              <ScrollReveal startOffset={0} style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.gold, margin: "0 0 16px 0", fontFamily: "Manrope, sans-serif", position: "relative", zIndex: 1 }}>
                Premium Member
              </ScrollReveal>
              <ScrollReveal startOffset={0.05} style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px 0", fontFamily: "Inter, sans-serif" }}>
                  Your edge is ready.
                </h2>
              </ScrollReveal>
              <ScrollReveal startOffset={0.1} style={{ color: C.muted, fontFamily: "Manrope, sans-serif", margin: "0 0 32px 0", fontSize: 17, position: "relative", zIndex: 1 }}>
                All premium features unlocked. Keep sharpening your technicals.
              </ScrollReveal>
              <ScrollReveal startOffset={0.18} style={{ position: "relative", zIndex: 1 }}>
                <button className="lp-btn-cta-gold" onClick={() => router.push("/dashboard")}>Go to Practice →</button>
              </ScrollReveal>
            </>
          ) : (
            <>
              <ScrollReveal startOffset={0} style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 32px 0", fontFamily: "Inter, sans-serif" }}>
                  Ready to secure the offer?
                </h2>
              </ScrollReveal>
              <ScrollReveal startOffset={0.15} style={{ position: "relative", zIndex: 1 }}>
                <SignUpButton mode="modal">
                  <button className="lp-btn-cta">Get Started for Free</button>
                </SignUpButton>
              </ScrollReveal>
            </>
          )}
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
        <footer style={{ background: C.bg, borderTop: "1px solid rgba(21,101,192,0.2)", position: "relative", zIndex: 2 }}>
          <div className="lp-footer-inner" style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: C.primary }}>Fite</span>{" "}
                <span style={{ color: C.secondary }}>Finance</span>
                {isPaid && <span style={{ color: C.gold, fontWeight: 900 }}>+</span>}
              </div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, margin: 0, fontFamily: "Manrope, sans-serif" }}>
                © 2025 Fite Finance. Precision in Preparation.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32 }}>
              <Link href="/privacy" className="lp-footer-link">Privacy</Link>
              <Link href="/terms"   className="lp-footer-link">Terms</Link>
              <Link href="/refunds" className="lp-footer-link">Refunds</Link>
            </div>
          </div>
        </footer>

      </div>

      <style>{`
        html, body { background: #020817; }
        @keyframes backHomePulse {
          0%, 100% { box-shadow: 0 14px 36px rgba(2,8,23,0.26), 0 0 0 rgba(79,195,247,0.2); }
          50%      { box-shadow: 0 18px 40px rgba(2,8,23,0.32), 0 0 22px rgba(79,195,247,0.18); }
        }
        .back-home-btn { animation: backHomePulse 2s ease-in-out infinite; }
        .back-home-btn:hover { background: rgba(8, 20, 38, 0.9) !important; border-color: rgba(79,195,247,0.6) !important; transform: translateY(-2px); }
        .features-home-cta {
          position: fixed;
          top: 74px;
          left: 24px;
          z-index: 140;
          text-align: left;
        }
        @media (max-width: 720px) {
          .features-home-cta {
            top: 132px;
            left: 16px;
          }
          .back-home-btn {
            padding: 8px 20px !important;
            font-size: 12px !important;
          }
          .features-page-intro {
            padding: 248px 20px 72px !important;
          }
          .features-quote-block {
            margin-top: 56px !important;
            padding: 40px 20px !important;
          }
        }
      `}</style>
    </>
  );
}

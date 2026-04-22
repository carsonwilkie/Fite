import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import LandingNav from "../src/LandingNav";
import { useRef, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAuthModal } from "../src/auth/AuthProvider";
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
const goldGrad  = "linear-gradient(45deg, #c9a84c, #e8c96d)";

// ─── ScrollReveal ──────────────────────────────────────────────────────────────
function ScrollReveal({ children, direction = "up", startOffset = 0, className, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const updateViewportMode = () => setIsNarrowViewport(window.innerWidth <= 720);
    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);
    return () => window.removeEventListener("resize", updateViewportMode);
  }, []);

  const useVerticalReveal = isNarrowViewport && (direction === "left" || direction === "right");
  const yPx   = !visible && (direction === "up" || direction === "scale" || useVerticalReveal) ? 28 : 0;
  const xPx   = !visible && !useVerticalReveal && direction === "left" ? -48 : !visible && !useVerticalReveal && direction === "right" ? 48 : 0;
  const sc    = !visible && direction === "scale" ? 0.88 : 1;
  const delay = startOffset ? `${Math.round(startOffset * 120)}ms` : "0ms";
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: `translateY(${yPx}px) translateX(${xPx}px) scale(${sc})`,
      transition: `opacity 0.6s ease ${delay}, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}, box-shadow 1.2s ease-out, border-color 1.2s ease-out, filter 1.2s ease-out`,
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

// ─── TiltCard — 3D parallax tilt on mouse move ────────────────────────────────
function TiltCard({ children, className, style, maxTilt = 8 }) {
  const ref = useRef(null);
  const glowRef = useRef(null);
  return (
    <div
      ref={ref}
      className={`lp-glass-card ${className || ""}`}
      style={{ position: "relative", overflow: "hidden", transformStyle: "preserve-3d", transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease", ...style }}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * maxTilt;
        const ry = (px - 0.5) * maxTilt;
        ref.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        if (glowRef.current) {
          glowRef.current.style.background = `radial-gradient(480px circle at ${px * 100}% ${py * 100}%, rgba(79,195,247,0.18), transparent 55%)`;
          glowRef.current.style.opacity = "1";
        }
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
        if (glowRef.current) glowRef.current.style.opacity = "0";
      }}
    >
      <div ref={glowRef} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", transition: "opacity 0.4s ease", zIndex: 0, borderRadius: "inherit" }} />
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
        if (ch === " ") return <span key={`${ch}-${i}`}> </span>;
        const isRevealed = i < revealedCount;
        const shouldScramble = !isRevealed && i < revealedCount + SCRAMBLE_WINDOW;
        const overlayChar = shouldScramble ? CHARS[Math.floor(Math.random() * CHARS.length)] : ch;
        return (
          <span key={`${ch}-${i}`} style={{ position: "relative", display: "inline-block", color: "transparent" }}>
            {ch}
            <span aria-hidden="true" style={{ position: "absolute", inset: 0, color: shouldScramble ? "rgba(248,250,252,0.88)" : "#f8fafc" }}>
              {overlayChar}
            </span>
          </span>
        );
      })}
    </span>
  );
}

// ─── TypewriterParagraph — paragraph with word-by-word reveal ─────────────────
function TypewriterParagraph({ text, active, wordDelayMs = 55, style }) {
  const words = text.split(/(\s+)/);
  const [revealed, setRevealed] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;
    let i = 0;
    const step = () => {
      i += 1;
      setRevealed(i);
      if (i < words.length) setTimeout(step, wordDelayMs);
    };
    step();
  }, [active, words.length, wordDelayMs]);

  return (
    <p style={style}>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < revealed ? 1 : 0, transform: i < revealed ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.35s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)", display: "inline-block" }}>
          {w === " " ? "\u00A0" : w}
        </span>
      ))}
    </p>
  );
}

// ─── CountUp ──────────────────────────────────────────────────────────────────
function CountUp({ target, suffix = "", prefix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isNumeric = typeof target === 'number';
  useEffect(() => {
    const el = ref.current;
    if (!el || !isNumeric) return;
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
  }, [target, duration, isNumeric]);
  return <span ref={ref}>{prefix}{isNumeric ? count : target}{suffix}</span>;
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

// ─── PricingCardWrapper — hover-tracking interactive card ────────────────────
function PricingCardWrapper({ children }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState("perspective(1200px) rotateX(0deg) rotateY(0deg)");
  const [insetShadow, setInsetShadow] = useState("none");
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    setIsHovering(true);
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 4;
    const rotateY = ((x - centerX) / centerX) * 4;
    setTransform(`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);

    // Calculate which corner is closest to mouse for press effect
    const corners = [
      { x: 0, y: 0, name: "top-left" },
      { x: rect.width, y: 0, name: "top-right" },
      { x: 0, y: rect.height, name: "bottom-left" },
      { x: rect.width, y: rect.height, name: "bottom-right" },
    ];
    const closest = corners.reduce((min, corner) => {
      const dist = Math.hypot(x - corner.x, y - corner.y);
      return dist < min.dist ? { ...corner, dist } : min;
    });

    // Create inset shadow based on closest corner for press-in effect
    const shadowSize = 60;
    const shadowBlur = 40;
    let shadowStr = "";
    if (closest.name === "top-left") {
      shadowStr = `inset ${shadowSize}px ${shadowSize}px ${shadowBlur}px rgba(0,0,0,0.35)`;
    } else if (closest.name === "top-right") {
      shadowStr = `inset -${shadowSize}px ${shadowSize}px ${shadowBlur}px rgba(0,0,0,0.35)`;
    } else if (closest.name === "bottom-left") {
      shadowStr = `inset ${shadowSize}px -${shadowSize}px ${shadowBlur}px rgba(0,0,0,0.35)`;
    } else if (closest.name === "bottom-right") {
      shadowStr = `inset -${shadowSize}px -${shadowSize}px ${shadowBlur}px rgba(0,0,0,0.35)`;
    }
    setInsetShadow(shadowStr);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTransform("perspective(1200px) rotateX(0deg) rotateY(0deg)");
    setInsetShadow("none");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={isHovering ? "pricing-card-hovering" : ""}
      style={{ transform, boxShadow: insetShadow, transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.15s ease-out", transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

// ─── Marquee — infinite horizontal scroll strip ───────────────────────────────
function Marquee({ items, speedSec = 38, reverse = false }) {
  const loop = [...items, ...items];
  return (
    <div className="ff-marquee" style={{ overflow: "hidden", position: "relative", maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
      <div className="ff-marquee-track" style={{ display: "flex", gap: 16, width: "max-content", animation: `${reverse ? "ffMarqueeRev" : "ffMarquee"} ${speedSec}s linear infinite` }}>
        {loop.map((item, i) => (
          <div key={i} style={{ flex: "0 0 auto", padding: "10px 18px", borderRadius: 999, border: "1px solid rgba(79,195,247,0.22)", background: "rgba(13,27,42,0.55)", fontFamily: "Manrope, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(219,226,248,0.85)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.secondary }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ComparisonRow — animated free vs premium row ─────────────────────────────
function ComparisonRow({ label, free, premium, delay = 0, highlight = false }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const renderCell = (val, isPremium) => {
    if (val === true)  return <span className="material-symbols-outlined" style={{ fontSize: 20, color: isPremium ? C.secondary : "rgba(255,255,255,0.5)" }}>check_circle</span>;
    if (val === false) return <span className="material-symbols-outlined" style={{ fontSize: 20, color: "rgba(148,163,184,0.45)" }}>cancel</span>;
    return <span style={{ fontSize: 13, fontFamily: "Manrope, sans-serif", fontWeight: 700, color: isPremium ? C.secondary : "rgba(219,226,248,0.8)" }}>{val}</span>;
  };
  return (
    <div
      ref={ref}
      className="ff-compare-row"
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 0.8fr 0.8fr",
        alignItems: "center",
        padding: "18px 24px",
        borderBottom: "1px solid rgba(21,101,192,0.14)",
        background: highlight ? "linear-gradient(90deg, rgba(79,195,247,0.05), rgba(21,101,192,0.02))" : "transparent",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-16px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: C.onSurface }}>{label}</div>
      <div style={{ textAlign: "center" }}>{renderCell(free, false)}</div>
      <div style={{ textAlign: "center" }}>{renderCell(premium, true)}</div>
    </div>
  );
}

// ─── Roadmap item data ─────────────────────────────────────────────────────────
const ROADMAP = [
  { icon: "route",              title: "Walk-Me-Through Mode",        body: "Break any question into guided micro-steps. Learn the reasoning path, not just the answer." },
  { icon: "bookmark",           title: "Bookmark & Favorite",         body: "Star questions you want to revisit. Build your own personal drill deck." },
  { icon: "ios_share",          title: "Export History",              body: "Download your full history as PDF or CSV — perfect for pre-interview review." },
  { icon: "restart_alt",        title: "Retake Questions",            body: "Re-attempt past questions with a clean slate. Watch your answers sharpen over time." },
  { icon: "verified",           title: "Next-Gen Grading",            body: "Multi-axis rubric: structure, logic, accuracy, polish — with line-by-line critique." },
  { icon: "hub",                title: "Massively Expanded Library",  body: "Firm-specific tracks (GS, MS, JPM, Evercore, PJT), product specificity (M&A, LevFin, DCM, ECM), and edge-case technicals." },
  { icon: "mic",                title: "Voice Interview Mode",        body: "Speak your answer out loud. AI transcribes, evaluates delivery, pacing, and filler words." },
  { icon: "emoji_events",       title: "Daily Challenge & Streaks",   body: "One hand-crafted question per day. Build a streak and climb an opt-in leaderboard." },
  { icon: "record_voice_over",  title: "Behavioral Mode",             body: "Dedicated STAR-framework coaching for 'tell me about a time' and fit questions." },
  { icon: "calculate",          title: "Modeling & Excel Drills",     body: "Timed 3-statement, DCF, and LBO micro-drills with downloadable templates." },
  { icon: "style",              title: "Concept Flashcards",          body: "Quick-hit flashcards for the core 400 technicals — spaced repetition built in." },
  { icon: "event",              title: "Interview Tracker",           body: "Log every round, notes, and outcome. A private CRM for your recruiting cycle." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
  const router = useRouter();
  const { isPaid } = usePaidStatus();
  const handleUpgrade = useUpgrade();
  const { isSignedIn } = useUser();
  const { openSignUp } = useAuthModal();
  const scrambleRef = useRef(null);
  const [scrambleTrigger, setScramble] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(null);
  const aboutRef = useRef(null);
  const [aboutActive, setAboutActive] = useState(false);

  useEffect(() => {
    fetch("/api/total-questions")
      .then((r) => r.json())
      .then((d) => setTotalQuestions(d.total))
      .catch(() => setTotalQuestions(null));
  }, []);

  useEffect(() => {
    const el = scrambleRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setScramble(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = aboutRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setAboutActive(true); obs.disconnect(); }
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Head>
        <title>Fite Finance | Features</title>
        <meta name="description" content="Explore every feature inside Fite Finance — AI grading, mock interview mode, timer, custom descriptors, history, and a roadmap of what's coming next. Built by a student, for students. $3/mo." />
      </Head>

      <LandingNav />

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

      <div style={{ color: C.onSurface, overflowX: "hidden" }}>

        {/* ── HERO ─────────────────────────────────────────────────────────────── */}
        <section id="features-section" style={{ position: "relative", zIndex: 2, background: C.bg }}>
          <div className="features-page-intro" style={{ padding: "clamp(152px, 18vw, 176px) 32px 64px", maxWidth: 1280, margin: "0 auto", position: "relative" }}>
            {/* Mobile-only blurred darkened background logo */}
            <img src="/logo-realistic.webp" alt="" aria-hidden className="features-hero-bg-logo" />
            {/* Ambient hero glow */}
            <div aria-hidden style={{ position: "absolute", top: -80, right: -120, width: 520, height: 520, background: "radial-gradient(circle, rgba(21,101,192,0.22), transparent 62%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />
            <div aria-hidden style={{ position: "absolute", top: 120, left: -140, width: 420, height: 420, background: "radial-gradient(circle, rgba(79,195,247,0.14), transparent 60%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <SectionScan label="Precise Preparation" />
              <ScrollReveal direction="left" style={{ marginBottom: 16 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.08)", marginBottom: 24 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, boxShadow: "0 0 8px rgba(201,168,76,0.8)" }} />
                  <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold }}>Brand New · Actively Shipping</span>
                </div>
                <div className="features-hero-heading-row" style={{ display: "flex", alignItems: "center" }}>
                  <h1 style={{ fontSize: "clamp(40px, 7.5vw, 96px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 12px 0", lineHeight: 0.95, textTransform: "uppercase", fontFamily: "Inter, sans-serif", flexShrink: 0 }}>
                    Built for<br />
                    <span style={{ background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Everyone</span><span style={{ marginLeft: "-1%", }}> .</span>
                  </h1>
                  <div className="features-hero-logo-slot" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", minWidth: 0, transform: "translateX(8%)" }}>
                    <img src="/logo-realistic.webp" alt="" aria-hidden className="features-hero-logo-inline" style={{ width: "clamp(140px, 20vw, 260px)", height: "auto", filter: "drop-shadow(0 12px 40px rgba(79,195,247,0.25))" }} />
                  </div>
                </div>
                <div style={{ height: 4, width: 128, background: cyberGrad, borderRadius: 2 }} />
              </ScrollReveal>

              <ScrollReveal direction="left" startOffset={0.08} style={{ marginTop: 24, marginBottom: 48, maxWidth: 680 }}>
                <p style={{ color: C.muted, fontFamily: "Manrope, sans-serif", fontSize: "clamp(14px, 1.4vw, 17px)", lineHeight: 1.65, margin: 0 }}>
                  A full look at what Fite Finance does today, what&apos;s unlocked with Premium, and a live roadmap of what&apos;s landing next. Built by students for all students. $3/month, forever.
                </p>
              </ScrollReveal>

              {/* <ScrollReveal style={{ marginBottom: 12 }}>
                <div className="lp-stats-strip" style={{ display: "flex", flexWrap: "wrap", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(21,101,192,0.2)" }}>
                  {[
                    { label: "Questions Generated",     val: totalQuestions ?? 50000, suffix: "+",    prefix: ""  },
                    { label: "Questions",              val: '∞',     suffix: "",     prefix: ""  },
                    { label: "Score Improvement",       val: 40,    suffix: "%",    prefix: ""  },
                    { label: "Price",                   val: 3,     suffix: "/mo",  prefix: "$" },
                  ].map(({ label, val, suffix, prefix }, i) => (
                    <div key={label} className="lp-stats-cell" style={{ flex: "1 1 160px", padding: "28px 24px", textAlign: "center", background: i % 2 === 0 ? "rgba(21,101,192,0.06)" : "rgba(79,195,247,0.04)", borderRight: i < 3 ? "1px solid rgba(21,101,192,0.15)" : "none" }}>
                      <div className="lp-stats-value" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, fontFamily: "Inter, sans-serif", background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
                        <CountUp target={val} suffix={suffix} prefix={prefix} />
                      </div>
                      <div className="lp-stats-label" style={{ fontSize: 11, color: C.muted, marginTop: 8, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </ScrollReveal> */}
            </div>
          </div>
        </section>

        {/* ── ABOUT FITE (Creator story) ───────────────────────────────────────── */}
        <section ref={aboutRef} className="ff-about-section" style={{ position: "relative", zIndex: 2, background: C.bgAlt, overflow: "hidden" }}>
          {/* Decorative constellation */}
          <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 10% 20%, rgba(79,195,247,0.10), transparent 40%), radial-gradient(circle at 90% 80%, rgba(21,101,192,0.12), transparent 45%)", pointerEvents: "none" }} />
          <div className="features-mobile-section" style={{ padding: "120px 32px", maxWidth: 1280, margin: "0 auto", position: "relative" }}>
            <SectionScan label="About Fite" />

            <div className="ff-about-grid">
              {/* Left column — narrative */}
              <ScrollReveal direction="left" startOffset={0}>
                <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: C.secondary, marginBottom: 12 }}>
                  A note from the founder
                </div>
                <h2 className="ff-about-headline" style={{ fontSize: "clamp(30px, 4.4vw, 56px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.02, textTransform: "uppercase", fontFamily: "Inter, sans-serif", margin: "0 0 28px 0" }}>
                  I built this because<br />
                  <span style={{ background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>I lived it</span>.
                </h2>

                <TypewriterParagraph
                  active={aboutActive}
                  text="I'm Carson — a 20-year-old at Colgate University. Last cycle I went through finance recruiting for the first time: endless networking calls, the stack of superdays, the technical question I choked on in an interview that I constantly replay in my head."
                  style={{ color: "rgba(219,226,248,0.88)", fontFamily: "Manrope, sans-serif", fontSize: 16, lineHeight: 1.7, margin: "0 0 20px 0", overflowWrap: "break-word", wordBreak: "break-word" }}
                />
                <TypewriterParagraph
                  active={aboutActive}
                  wordDelayMs={50}
                  text="The problem wasn't a shortage of prep material. It was the opposite. There were $500 prep courses, $200-an-hour tutors, Notion docs passed around in GroupMe chats with half-right answers, and a hundred-page PDF that somehow still didn't cover the one question you got asked. The good stuff sat behind a paywall most undergrads just can't stomach."
                  style={{ color: "rgba(219,226,248,0.85)", fontFamily: "Manrope, sans-serif", fontSize: 16, lineHeight: 1.7, margin: "0 0 20px 0", overflowWrap: "break-word", wordBreak: "break-word" }}
                />
                <TypewriterParagraph
                  active={aboutActive}
                  wordDelayMs={50}
                  text="So I built the tool I wish I had: AI-generated technicals at any difficulty, instant grading on my actual answer, a mock interview that pushes back, and history I can actually review. The whole thing runs for $3 a month — roughly what it costs to keep the servers and models online. No upsells, no tiered drip, no locking the good stuff behind Premium-Plus-Pro-Ultra. I hope this helps."
                  style={{ color: "rgba(219,226,248,0.85)", fontFamily: "Manrope, sans-serif", fontSize: 16, lineHeight: 1.7, margin: "0 0 28px 0", overflowWrap: "break-word", wordBreak: "break-word" }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 20, borderTop: "1px solid rgba(79,195,247,0.18)" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: cyberGrad, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 16, color: "#011838", letterSpacing: "-0.02em", boxShadow: "0 8px 22px rgba(21,101,192,0.45)" }}>CW</div>
                  <div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 15, color: C.onSurface }}>Carson Wilkie</div>
                    <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 12, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Founder · Colgate &apos;28</div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Right column — stat cards */}
              <div className="ff-about-stack">
                <ScrollReveal direction="right" startOffset={0.1}>
                  <TiltCard style={{ padding: 28, borderRadius: 18 }}>
                    <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>The Market</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 44, fontWeight: 900, fontFamily: "Inter, sans-serif", color: C.muted, textDecoration: "line-through", textDecorationColor: "rgba(244,63,94,0.6)", textDecorationThickness: 3 }}>$500</div>
                      <div style={{ fontSize: 52, fontWeight: 900, fontFamily: "Inter, sans-serif", background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.03em" }}>$3</div>
                    </div>
                    <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, color: "rgba(219,226,248,0.75)", lineHeight: 1.6 }}>
                      What the incumbents charge for a static PDF, versus what you pay for a live AI engine that grows every week.
                    </div>
                  </TiltCard>
                </ScrollReveal>

                <ScrollReveal direction="right" startOffset={0.2}>
                  <TiltCard style={{ padding: 28, borderRadius: 18, borderColor: "rgba(201,168,76,0.25)" }}>
                    <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Why It Exists</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { icon: "school",     text: "Built by a student currently inside the recruiting cycle." },
                        { icon: "savings",    text: "Priced to be affordable on a college meal plan." },
                        { icon: "update",     text: "New features ship constantly — not once a year." },
                        { icon: "favorite",   text: "No VC, no upsells, no dark patterns." },
                      ].map((row, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: C.secondary, marginTop: 1, flexShrink: 0 }}>{row.icon}</span>
                          <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 14, color: "rgba(219,226,248,0.85)", lineHeight: 1.55 }}>{row.text}</span>
                        </li>
                      ))}
                    </ul>
                  </TiltCard>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES SHOWCASE (expanded) ─────────────────────────────────────── */}
        <section style={{ position: "relative", zIndex: 2, background: C.bg }}>
          <div className="features-mobile-section" style={{ padding: "112px 32px", maxWidth: 1280, margin: "0 auto" }}>
            <SectionScan label="What's Inside" />
            <ScrollReveal direction="left" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px 0", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
                The Full Toolkit
              </h2>
              <p style={{ color: C.muted, fontFamily: "Manrope, sans-serif", fontSize: 15, margin: "0 0 16px 0", maxWidth: 620 }}>
                Every feature on the platform, explained. Free features are open to everyone. Premium features are marked, and all of them are included in one $3/month plan.
              </p>
              <div style={{ height: 4, width: 96, background: cyberGrad, borderRadius: 2 }} />
            </ScrollReveal>

            {/* Primary bento row */}
            <div className="ff-bento">
              <ScrollReveal direction="left" startOffset={0.1} className="ff-bento-hero">
                <TiltCard style={{ padding: 36, borderRadius: 18, height: "100%" }} maxTilt={5}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                    <span className="material-symbols-outlined lp-icon-secondary" style={{ marginBottom: 0 }}>tune</span>
                    <span className="ff-pill-free">Free &amp; Premium</span>
                  </div>
                  <h3 className="lp-card-title">Customized Practice Engine</h3>
                  <p className="lp-card-body" style={{ marginBottom: 20 }}>
                    Dial in the exact reps you need. Pick from 8 finance verticals, three difficulty tiers, optional math, and — for Premium — a free-text custom descriptor that reshapes the question on the fly.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
                    {["Investment Banking", "Private Equity", "Asset Mgmt", "S&T", "Valuation", "Accounting", "Consulting", "Hedge Funds"].map(tag => (
                      <span key={tag} className="lp-tag">{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[{ label: "Investment Banking", pct: 92 }, { label: "Private Equity", pct: 85 }, { label: "Valuation", pct: 78 }].map(({ label, pct }, i) => (
                      <div key={label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>
                          <span>{label}</span><span style={{ color: C.secondary, fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <AnimatedBar pct={pct} delay={i * 150} />
                      </div>
                    ))}
                  </div>
                </TiltCard>
              </ScrollReveal>

              <ScrollReveal direction="right" startOffset={0.15} className="ff-bento-side">
                <TiltCard style={{ padding: 28, borderRadius: 18, height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="material-symbols-outlined lp-icon-secondary">auto_awesome</span>
                    <span className="ff-pill-free">Free</span>
                  </div>
                  <h3 className="lp-card-title">AI Question Generation</h3>
                  <p className="lp-card-body">
                    Questions are generated live — no static bank. Each one is new, weighted to your chosen difficulty, and anti-repeat-filtered against your last 24 hours of history.
                  </p>
                  <div style={{ marginTop: 18, padding: 14, borderRadius: 10, border: "1px dashed rgba(79,195,247,0.25)", background: "rgba(79,195,247,0.04)", fontFamily: "Manrope, sans-serif", fontSize: 12, color: "rgba(219,226,248,0.75)", lineHeight: 1.55 }}>
                    <span style={{ color: C.secondary, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 10 }}>Live preview</span>
                    <div style={{ marginTop: 6 }}>&quot;Walk me through how a $10 increase in D&amp;A flows through all three statements, assuming a 25% tax rate.&quot;</div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            </div>

            {/* Secondary feature grid */}
            <div className="ff-feat-grid">
              {[
                { icon: "lightbulb",        title: "Model Answers",        body: "Reveal a full, markdown-formatted answer on any question. Use it as a study reference or a post-attempt check.", tag: "Free" },
                { icon: "psychology",       title: "AI Answer Grading",    body: "Write your answer, hit grade, and get written feedback plus a 0–10 score in seconds. No waiting for a tutor.", tag: "Premium" },
                { icon: "record_voice_over", title: "Mock Interview Mode", body: "A full 4-question structured mock: realistic scenario, sequential questions, live interviewer responses, final debrief.", tag: "Premium" },
                { icon: "timer",            title: "Focus Timer",          body: "60s, 2m, 3m, or 5m presets. Pause, resume, or reset. Build the ability to answer under actual superday pressure.", tag: "Premium" },
                { icon: "edit_note",        title: "Custom Descriptor",    body: "A free-text field that bends the question to your target: 'LBO with rollover equity,' 'tech M&A in SaaS,' 'restructuring DIP financing.'", tag: "Premium" },
                { icon: "history",          title: "Full History",         body: "Every graded question saved. Search by keyword, filter by category, difficulty, or math, and sort any way you want.", tag: "Premium" },
                { icon: "analytics",        title: "Stats Dashboard",      body: "Total reps, averages, best/worst scores, active streaks, category performance, and a running score trend.", tag: "Premium" },
                { icon: "shield",           title: "Anti-Repeat Guard",    body: "Questions from your last 24 hours are filtered out automatically so every session feels fresh.", tag: "Free" },
              ].map((f, i) => (
                <ScrollReveal key={f.title} direction="scale" startOffset={0.05 + (i % 4) * 0.08}>
                  <TiltCard style={{ padding: 24, borderRadius: 16, height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span className="material-symbols-outlined lp-icon-secondary" style={{ marginBottom: 0 }}>{f.icon}</span>
                      <span className={f.tag === "Premium" ? "ff-pill-premium" : "ff-pill-free"}>{f.tag}</span>
                    </div>
                    <h3 className="lp-card-title" style={{ fontSize: 17 }}>{f.title}</h3>
                    <p className="lp-card-body">{f.body}</p>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
            {/* Scramble quote */}
            <div className="features-quote-block" ref={scrambleRef} style={{ marginTop: 120, textAlign: "center", padding: "64px 32px", borderRadius: 24, background: "linear-gradient(135deg, rgba(21,101,192,0.08), rgba(79,195,247,0.04))", border: "1px solid rgba(21,101,192,0.15)" }}>
              <p style={{ fontSize: "clamp(18px, 2.8vw, 30px)", fontWeight: 800, fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", color: C.onSurface, margin: 0, lineHeight: 1.45 }}>
                <ScrambleText
                  text="The edge between a good candidate and a great one is preparation."
                  active={scrambleTrigger}
                />
              </p>
            </div>
          </div>
        </section>

        {/* ── FREE VS PREMIUM COMPARISON ───────────────────────────────────────── */}
        <section style={{ position: "relative", zIndex: 2, background: C.bgAlt }}>
          <div className="features-mobile-section" style={{ padding: "112px 32px", maxWidth: 1040, margin: "0 auto" }}>
            <SectionScan label="Free vs Premium" align="center" />
            <ScrollReveal style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 12px 0", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
                What Premium Unlocks
              </h2>
              <p style={{ color: C.muted, fontFamily: "Manrope, sans-serif", fontSize: 15, margin: 0, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
                Every limit removed, every tool turned on. One price, no hidden tiers.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="ff-compare-card">
                <div className="ff-compare-head">
                  <div />
                  <div>
                    <div className="ff-compare-head-title">Free</div>
                    <div className="ff-compare-head-sub">$0<span style={{ color: C.muted, fontWeight: 400 }}>/mo</span></div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <div className="ff-compare-head-title" style={{ background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Premium</div>
                    <div className="ff-compare-head-sub">$3<span style={{ color: C.muted, fontWeight: 400 }}>/mo</span></div>
                  </div>
                </div>

                <ComparisonRow label="Daily question generation"       free="5 / day"   premium="Unlimited"           delay={0}   highlight />
                <ComparisonRow label="Model answer reveal"             free={true}      premium={true}                delay={60} />
                <ComparisonRow label="AI answer grading"               free={false}     premium={true}                delay={120} highlight />
                <ComparisonRow label="Full question history (100 rep)" free={false}     premium={true}                delay={180} />
                <ComparisonRow label="Stats dashboard"                 free={false}     premium={true}                delay={240} highlight />
                <ComparisonRow label="Mock interview mode (4-Q)"       free={false}     premium={true}                delay={300} />
                <ComparisonRow label="Focus timer (60s / 2m / 3m / 5m)" free={false}    premium={true}                delay={360} highlight />
                <ComparisonRow label="Custom descriptor field"         free={false}     premium={true}                delay={420} />
                <ComparisonRow label="Anti-repeat filter (24hr)"        free={true}      premium={true}                delay={480} highlight />
                <ComparisonRow label="Priority support + feature votes" free={false}    premium={true}                delay={540} />

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.8fr", padding: "22px 24px", alignItems: "center" }}>
                  <div />
                  <div style={{ textAlign: "center" }}>
                    <button className="lp-btn-outline-block" onClick={() => openSignUp()} style={{ padding: "10px 18px", fontSize: 12 }}>Start Free</button>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <button
                      className="lp-btn-premium"
                      onClick={handleUpgrade}
                      style={{ padding: "10px 18px", fontSize: 12 }}
                    >
                      Go Premium →
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── PRICING (detailed) ───────────────────────────────────────────────── */}
        <section className="features-mobile-section" style={{ padding: "112px 32px", position: "relative", zIndex: 2, background: C.bg }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <SectionScan label="Pricing" />
          </div>
          <ScrollReveal style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 12px 0", fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>
              Less Than a Coffee.<br />Far More Useful.
            </h2>
            <div style={{ height: 4, width: 64, background: cyberGrad, borderRadius: 2, margin: "0 auto 16px" }} />
            <p style={{ color: C.muted, fontFamily: "Manrope, sans-serif", margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              One tier. One price. Cancel any time — no friction, no email chain, no &quot;retention specialist.&quot;
            </p>
          </ScrollReveal>

          <div className="lp-pricing-grid">
            <PricingCardWrapper>
            <ScrollReveal direction="left" startOffset={0.1} className="features-pricing-card" style={{ background: C.surface, border: "1px solid rgba(51,65,85,0.3)", padding: 40, borderRadius: 16, display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", fontFamily: "Inter, sans-serif" }}>Free Tier</h3>
                <p style={{ color: C.muted, fontSize: 13, margin: 0, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.12em" }}>Essential Prep</p>
              </div>
              <div className="features-pricing-price" style={{ fontSize: 42, fontWeight: 900, margin: "0 0 8px 0", fontFamily: "Inter, sans-serif" }}>
                $0<span style={{ fontSize: 18, fontWeight: 400, color: C.muted }}>/mo</span>
              </div>
              <p style={{ color: C.muted, fontSize: 12, fontFamily: "Manrope, sans-serif", margin: "0 0 28px 0" }}>
                No credit card. Genuinely free forever.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { t: "5 AI-generated questions / day",  ok: true  },
                  { t: "Model answer reveal",             ok: true  },
                  { t: "Anti-repeat filter",              ok: true  },
                  { t: "All 8 finance categories",        ok: true  },
                  { t: "AI answer grading",               ok: false },
                  { t: "Mock interview mode",             ok: false },
                  { t: "Full history + stats",            ok: false },
                  { t: "Focus timer",                     ok: false },
                ].map(({ t, ok }) => (
                  <li key={t} style={{ display: "flex", alignItems: "center", gap: 12, opacity: ok ? 1 : 0.4, color: ok ? C.onSurface : C.muted, fontFamily: "Manrope, sans-serif", fontSize: 14 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: ok ? C.primary : C.muted }}>{ok ? "check_circle" : "cancel"}</span>
                    {t}
                  </li>
                ))}
              </ul>
              <button className="lp-btn-outline-block" onClick={() => openSignUp()}>Get Started Free</button>
            </ScrollReveal>
            </PricingCardWrapper>

            <PricingCardWrapper>
            <div>
              <ScrollReveal direction="right" startOffset={0.2} className="lp-glass-card-solid features-pricing-card" style={{ padding: 40, borderRadius: 16, display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,195,247,0.18)", background: "linear-gradient(#0b1120, #0b1120) padding-box, linear-gradient(45deg, rgba(21,101,192,0.95), rgba(79,195,247,0.95)) border-box" }}>
                <div style={{ position: "absolute", top: 28, right: 40, transform: "translateY(-50%)", background: cyberGrad, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "Manrope, sans-serif", boxShadow: "0 4px 12px rgba(21,101,192,0.4)" }}>
                  Recommended
                </div>
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", fontFamily: "Inter, sans-serif" }}>Fite Premium</h3>
                  <p style={{ color: C.secondary, fontSize: 13, margin: 0, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.12em" }}>Full Access</p>
                </div>
                <div className="features-pricing-price" style={{ fontSize: 42, fontWeight: 900, margin: "0 0 8px 0", color: C.secondary, fontFamily: "Inter, sans-serif" }}>
                  $3<span style={{ fontSize: 18, fontWeight: 400, color: C.muted }}>/mo</span>
                </div>
                <p style={{ color: C.muted, fontSize: 12, fontFamily: "Manrope, sans-serif", margin: "0 0 28px 0" }}>
                  Cancel any time. All future features included.
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    "Everything in Free",
                    "Unlimited AI question generation",
                    "AI grading on every answer (0–10 + written feedback)",
                    "Mock interview mode — 4-question structured sessions",
                    "Full interview debrief from AI interviewer",
                    "Focus timer with 4 preset lengths",
                    "Custom descriptor field (free-text question shaping)",
                    "Full searchable + filterable history",
                    "Stats dashboard (streaks, averages, trends)",
                    "Every feature on the roadmap, included",
                    "Priority support + vote on what ships next",
                  ].map(t => (
                    <li key={t} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: C.onSurface, fontFamily: "Manrope, sans-serif", fontSize: 14, lineHeight: 1.5 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.secondary, marginTop: 1, flexShrink: 0 }}>verified</span>
                      {t}
                    </li>
                  ))}
                </ul>
                {isSignedIn ? (
                  isPaid ? (
                    <button className="lp-btn-premium" onClick={() => router.push("/dashboard")}>Go to Dashboard →</button>
                  ) : (
                    <button className="lp-btn-premium" onClick={handleUpgrade}>Go Premium →</button>
                  )
                ) : (
                  <button className="lp-btn-premium" onClick={() => openSignUp()}>Go Premium →</button>
                )}
                <p style={{ fontSize: 10, textAlign: "center", margin: "12px 0 0", color: C.muted, opacity: 0.6, fontFamily: "Manrope, sans-serif" }}>
                  Secure payment powered by Stripe
                </p>
              </ScrollReveal>
            </div>
            </PricingCardWrapper>
          </div>
        </section>

        {/* ── ROADMAP / COMING SOON ────────────────────────────────────────────── */}
        <section style={{ position: "relative", zIndex: 2, background: C.bgAlt, overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 700, height: 300, background: "radial-gradient(ellipse, rgba(201,168,76,0.12), transparent 60%)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div className="features-mobile-section" style={{ padding: "120px 32px", maxWidth: 1280, margin: "0 auto", position: "relative" }}>
            <SectionScan label="The Roadmap" />

            <ScrollReveal direction="left" style={{ marginBottom: 16 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(79,195,247,0.35)", background: "rgba(79,195,247,0.08)", marginBottom: 20 }}>
                <span className="ff-pulse-dot" />
                <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.secondary }}>Shipping Live</span>
              </div>
              <h2 style={{ fontSize: "clamp(28px, 3.8vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px 0", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
                This Is Just<br />
                <span style={{ background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>the beginning</span>.
              </h2>
              <p style={{ color: C.muted, fontFamily: "Manrope, sans-serif", fontSize: 15, margin: "0 0 16px 0", maxWidth: 620 }}>
                Fite Finance launched in 2026 and new features ship constantly. Premium users get them all, forever. Here are some potential features on deck.
              </p>
              <div style={{ height: 4, width: 96, background: cyberGrad, borderRadius: 2 }} />
            </ScrollReveal>

            {/* Marquee strip */}
            <ScrollReveal style={{ margin: "48px 0" }}>
              <Marquee
                speedSec={46}
                items={ROADMAP.map(r => ({ icon: r.icon, label: r.title }))}
              />
            </ScrollReveal>

            {/* Roadmap grid */}
            <div className="ff-roadmap-grid">
              {ROADMAP.map((item, i) => (
                <ScrollReveal key={item.title} direction="scale" startOffset={0.04 + (i % 3) * 0.06}>
                  <TiltCard style={{ padding: 24, borderRadius: 16, height: "100%", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "Manrope, sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.1)" }}>Coming</div>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: C.secondary, marginBottom: 14, display: "block" }}>{item.icon}</span>
                    <h3 className="lp-card-title" style={{ fontSize: 17, marginBottom: 8 }}>{item.title}</h3>
                    <p className="lp-card-body" style={{ margin: 0 }}>{item.body}</p>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal style={{ marginTop: 120, marginBottom: -30, textAlign: "center" }}>
              <div style={{ padding: "28px 32px", borderRadius: 16, border: "1px dashed rgba(79,195,247,0.3)", background: "rgba(79,195,247,0.04)", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 14, maxWidth: 620 }}>
                <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.secondary }}>Feature Requests</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: C.onSurface, lineHeight: 1.55 }}>
                  Have a feature in mind? Premium users can vote on what ships next.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isPaid) router.push("/feature-vote");
                    else handleUpgrade();
                  }}
                  disabled={!isPaid}
                  title={isPaid ? "" : "Upgrade to Premium to vote"}
                  style={{
                    marginTop: 4,
                    padding: "12px 22px",
                    borderRadius: 999,
                    border: "none",
                    cursor: isPaid ? "pointer" : "not-allowed",
                    background: isPaid ? cyberGrad : "rgba(79,195,247,0.14)",
                    color: isPaid ? "#fff" : "rgba(226,232,240,0.55)",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: isPaid ? "0 10px 26px rgba(21,101,192,0.4)" : "none",
                    opacity: isPaid ? 1 : 0.7,
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { if (isPaid) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {isPaid ? "how_to_vote" : "lock"}
                  </span>
                  {isPaid ? "Vote on next feature" : "Premium required"}
                </button>
                {!isPaid && (
                  <div style={{ fontFamily: "Manrope, sans-serif", fontSize: 11, color: C.muted, letterSpacing: "0.04em" }}>
                    Upgrade to unlock voting.
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────────── */}
        <section className="features-cta-section" style={{ padding: "128px 32px", textAlign: "center", position: "relative", overflow: "hidden", zIndex: 2, background: C.bg }}>
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
                  Secure your offer.
                </h2>
              </ScrollReveal>
              <ScrollReveal startOffset={0.15} style={{ position: "relative", zIndex: 1 }}>
                <button className="lp-btn-cta" onClick={() => openSignUp()}>Get Started for Free</button>
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
                © 2026 Fite Finance
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32 }}>
              <Link href="/privacy" className="lp-footer-link">Privacy</Link>
              <Link href="/terms"   className="lp-footer-link">Terms</Link>
              <Link href="/refunds" className="lp-footer-link">Refunds</Link>
              <a href="mailto:support@fitefinance.com" className="lp-footer-link">Support</a>
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

        /* Pills */
        .ff-pill-free,
        .ff-pill-premium {
          font-family: Manrope, sans-serif;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .ff-pill-free {
          color: rgba(219,226,248,0.75);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ff-pill-premium {
          color: #c9a84c;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.35);
        }

        /* About grid */
        .ff-about-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 56px;
          align-items: start;
        }
        .ff-about-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .ff-about-grid { grid-template-columns: 1fr; gap: 36px; }
        }

        /* Bento */
        .ff-bento {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        @media (max-width: 900px) {
          .ff-bento { grid-template-columns: 1fr; }
        }

        /* Pricing cards hover */
        .features-pricing-card {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 1.2s ease-out, border-color 1.2s ease-out, filter 1.2s ease-out;
          position: relative;
        }
        .features-pricing-card:hover,
        .pricing-card-hovering .features-pricing-card {
          transform: translateY(-6px);
          box-shadow: 0 28px 60px rgba(79, 195, 247, 0.2), 0 0 32px rgba(21, 101, 192, 0.18), 0 0 60px rgba(79, 195, 247, 0.12) !important;
          border-color: rgba(79, 195, 247, 0.45) !important;
          filter: drop-shadow(0 0 40px rgba(79, 195, 247, 0.18));
        }
        .lp-glass-card-solid.features-pricing-card {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 1.2s ease-out, border-color 1.2s ease-out, filter 1.2s ease-out;
        }
        .lp-glass-card-solid.features-pricing-card:hover,
        .pricing-card-hovering .lp-glass-card-solid.features-pricing-card {
          box-shadow: 0 32px 80px rgba(79, 195, 247, 0.25), 0 0 50px rgba(79, 195, 247, 0.3), inset 0 0 60px rgba(79, 195, 247, 0.08) !important;
          filter: drop-shadow(0 0 50px rgba(79, 195, 247, 0.22));
          border-color: rgba(79, 195, 247, 0.55) !important;
        }

        /* Feature grid */
        .ff-feat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 4px;
        }
        @media (max-width: 1100px) {
          .ff-feat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .ff-feat-grid { grid-template-columns: 1fr; }
        }

        /* Comparison card */
        .ff-compare-card {
          border: 1px solid rgba(21,101,192,0.22);
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(13,27,42,0.6), rgba(11,19,35,0.7));
          backdrop-filter: blur(12px);
        }
        .ff-compare-head {
          display: grid;
          grid-template-columns: 1.4fr 0.8fr 0.8fr;
          padding: 24px;
          border-bottom: 1px solid rgba(21,101,192,0.2);
          background: rgba(21,101,192,0.06);
          align-items: end;
        }
        .ff-compare-head-title {
          font-family: Inter, sans-serif;
          font-weight: 900;
          font-size: 18px;
          letter-spacing: -0.02em;
          color: #f8fafc;
          text-align: center;
          text-transform: uppercase;
        }
        .ff-compare-head-sub {
          font-family: Inter, sans-serif;
          font-weight: 900;
          font-size: 22px;
          text-align: center;
          color: #f8fafc;
          margin-top: 6px;
        }

        /* Roadmap */
        .ff-roadmap-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 1024px) {
          .ff-roadmap-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .ff-roadmap-grid { grid-template-columns: 1fr; }
        }

        /* Marquee */
        @keyframes ffMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ffMarqueeRev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }

        /* Pulse dot */
        .ff-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4FC3F7;
          box-shadow: 0 0 0 0 rgba(79,195,247,0.7);
          animation: ffPulse 1.8s ease-out infinite;
        }
        @keyframes ffPulse {
          0%   { box-shadow: 0 0 0 0 rgba(79,195,247,0.7); }
          70%  { box-shadow: 0 0 0 12px rgba(79,195,247,0); }
          100% { box-shadow: 0 0 0 0 rgba(79,195,247,0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ff-marquee-track { animation: none !important; }
          .back-home-btn { animation: none !important; }
          .ff-pulse-dot { animation: none !important; }
        }

        .features-hero-bg-logo { display: none; }

        @media (max-width: 720px) {
          .features-home-cta { top: 132px; left: 16px; }
          .back-home-btn { padding: 8px 20px !important; font-size: 12px !important; }

          .features-page-intro { padding: 224px 18px 48px !important; }
          .features-hero-logo-inline { display: none !important; }
          .features-hero-bg-logo {
            display: block;
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            filter: blur(28px) brightness(0.28) saturate(0.85);
            opacity: 0.55;
            pointer-events: none;
            z-index: 0;
          }
          .features-quote-block {
            margin-top: 40px !important;
            padding: 32px 20px !important;
            border-radius: 18px !important;
          }
          .features-quote-block p { font-size: 16px !important; line-height: 1.5 !important; }

          .features-mobile-section { padding: 72px 18px !important; }
          .features-mobile-section h2 { font-size: 26px !important; }

          .ff-about-headline { font-size: 30px !important; }

          .ff-compare-head { padding: 18px 14px !important; grid-template-columns: 1.3fr 0.85fr 0.85fr !important; }
          .ff-compare-head-title { font-size: 13px !important; }
          .ff-compare-head-sub { font-size: 18px !important; }
          .ff-compare-row {
            padding: 14px 14px !important;
            grid-template-columns: 1.3fr 0.85fr 0.85fr !important;
          }
          .ff-compare-row > div:first-child { font-size: 12px !important; }

          .features-pricing-card { padding: 26px 22px !important; border-radius: 14px !important; }
          .features-pricing-card h3 { font-size: 16px !important; }
          .features-pricing-price { font-size: 32px !important; margin-bottom: 16px !important; }

          .features-cta-section { padding: 80px 18px !important; }
          .features-cta-section h2 { font-size: 28px !important; }

          .ff-bento { gap: 14px; }
          .ff-feat-grid { gap: 14px; }
          .ff-roadmap-grid { gap: 14px; }
        }
      `}</style>
    </>
  );
}

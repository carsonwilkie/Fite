import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  SignedIn,
  SignedOut,
  SignUpButton,
  useUser,
} from "@clerk/clerk-react";
import usePaidStatus from "../src/usePaidStatus";
import useUpgrade from "../src/useUpgrade";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          "#020817",
  bgAlt:       "#0b1120",
  surface:     "#0d1b2a",
  primary:     "#1565C0",
  secondary:   "#4FC3F7",
  gold:        "#c9a84c",
  onSurface:   "#f8fafc",
  muted:       "#94a3b8",
};
const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

// ─── ScrollReveal — IntersectionObserver based ───────────────────────────────
function ScrollReveal({ children, direction = "up", startOffset = 0, className, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const yPx = !visible && (direction === "up" || direction === "scale") ? 28 : 0;
  const xPx = !visible && direction === "left" ? -48 : !visible && direction === "right" ? 48 : 0;
  const sc  = !visible && direction === "scale" ? 0.88 : 1;
  const delay = startOffset ? `${Math.round(startOffset * 120)}ms` : "0ms";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${yPx}px) translateX(${xPx}px) scale(${sc})`,
        transition: `opacity 0.6s ease ${delay}, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── SectionScan — IntersectionObserver based ────────────────────────────────
function SectionScan({ label, align = "left" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const centered = align === "center";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: "flex", alignItems: "center",
        flexDirection: centered ? "column" : "row",
        gap: centered ? 12 : 16,
        marginBottom: centered ? 32 : 56,
        paddingTop: 4,
      }}
    >
      <span style={{
        opacity: visible ? 0.7 : 0,
        transform: visible ? "none" : centered ? "translateY(-8px)" : "translateX(-20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        willChange: "opacity, transform",
        fontSize: 9, fontWeight: 800, letterSpacing: "0.22em",
        textTransform: "uppercase", fontFamily: "Inter, sans-serif",
        color: C.secondary, whiteSpace: "nowrap",
        display: "inline-block",
      }}>
        {label}
      </span>
      <div style={{
        transform: visible ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: centered ? "center" : "left",
        transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s",
        willChange: "transform",
        ...(centered
          ? { width: 64, height: 2, borderRadius: 2, background: cyberGrad }
          : { flex: 1, height: 1, background: `linear-gradient(to right, ${C.secondary}, rgba(79,195,247,0))` }),
        boxShadow: "0 0 8px rgba(79,195,247,0.35)",
      }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { isLoaded } = useUser();
  const { isPaid } = usePaidStatus();
  const handleUpgrade = useUpgrade();

  const { scrollY } = useScroll();
  const heroTextY   = useTransform(scrollY, [0, 600], [0, -90]);
  const heroCardY   = useTransform(scrollY, [0, 600], [0, -40]);
  // Clamp min 0 so brief initialization never hides hero content
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <>
      <Head>
        <title>Fite Finance | Precision in Preparation</title>
        <meta name="description" content="AI-powered finance interview prep. Practice real questions, get instant AI grading, and ace your IB, PE, or HF interview." />
      </Head>

      <div style={{ color: C.onSurface, minHeight: "100vh" }}>

        {/* ── FIXED HERO BACKGROUND ─────────────────────────────────────────── */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <Image src="/Hero_Image.webp" alt="Finance background" fill priority style={{ objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(2,8,23,0.97) 0%, rgba(2,8,23,0.75) 55%, rgba(2,8,23,0.40) 100%)",
          }} />
        </div>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section style={{ position: "relative", minHeight: 870, display: "flex", alignItems: "center", zIndex: 1 }}>

          {/* Logo — top-left */}
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "absolute", top: 28, left: 32, zIndex: 20,
              fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em",
              fontFamily: "Inter, sans-serif", cursor: "default",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ color: C.primary, textShadow: "0 0 12px rgba(21,101,192,0.7)" }}>Fite</span>{" "}
            <span style={{ color: C.secondary, textShadow: "0 0 12px rgba(79,195,247,0.7)" }}>Finance</span>
            {isPaid && (
              <span style={{ color: C.gold, textShadow: "0 0 10px rgba(201,168,76,0.7)", fontSize: 20, fontWeight: 900, lineHeight: 1 }}>+</span>
            )}
          </motion.div>

          <div className="hero-grid" style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "80px 32px", width: "100%", boxSizing: "border-box" }}>

            {/* Left: headline — parallax + fade on scroll */}
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }}>
              {/* No opacity-0 initial states here — elements are always visible, just spring up on mount */}
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 999,
                  background: "rgba(21,101,192,0.2)", border: "1px solid rgba(21,101,192,0.4)",
                  color: C.secondary, fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.15em",
                  marginBottom: 24, fontFamily: "Manrope, sans-serif",
                }}>
                  Next-Gen Interview Preparation
                </div>
              </motion.div>

              <motion.h1
                initial={{ y: 36 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                style={{
                  fontSize: "clamp(52px, 7.5vw, 84px)", fontWeight: 900,
                  lineHeight: 1.02, letterSpacing: "-0.04em",
                  color: C.onSurface, margin: "0 0 24px 0", fontFamily: "Inter, sans-serif",
                }}
              >
                Master Your Technicals
                <br />
                with{" "}
                <span style={{ color: C.secondary, fontStyle: "italic", textShadow: "0 0 30px rgba(79,195,247,0.35)" }}>
                  AI-Powered
                </span>{" "}
                Precision.
              </motion.h1>

              <motion.p
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
                style={{ fontSize: 18, color: C.muted, lineHeight: 1.7, maxWidth: 480, margin: "0 0 40px 0", fontFamily: "Manrope, sans-serif" }}
              >
                Generate custom finance questions, practice structured mock interviews,
                and get instant AI grading.
              </motion.p>

              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.26 }}
              >
                <button
                  className="lp-btn-outline"
                  onClick={() => document.getElementById("features-section").scrollIntoView({ behavior: "smooth" })}
                >
                  Explore Premium Features
                </button>
              </motion.div>
            </motion.div>

            {/* Right: sign-up card — slower parallax, no opacity-0 initial */}
            <motion.div
              initial={{ x: 40 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="lp-glass-card-solid"
              style={{
                y: heroCardY,
                padding: 32, borderRadius: 16,
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                alignSelf: "center",
                border: isPaid ? "1px solid rgba(201,168,76,0.35)" : undefined,
              }}
            >
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px 0", color: C.onSurface, fontFamily: "Inter, sans-serif" }}>
                {isPaid ? "Welcome Back" : "Start Preparing"}
              </h3>
              <p style={{ fontSize: 13, color: C.muted, margin: "0 0 28px 0", fontFamily: "Manrope, sans-serif" }}>
                {isPaid
                  ? "Your premium access is active. Keep sharpening your edge."
                  : "Built for candidates targeting IB, PE, and hedge fund roles."}
              </p>

              {isLoaded && (
                <>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="lp-btn-mission">Start Practicing</button>
                    </SignUpButton>
                    <SignUpButton mode="modal">
                      <button className="lp-btn-upgrade">Upgrade to Premium</button>
                    </SignUpButton>
                    <p style={{ fontSize: 11, textAlign: "center", color: C.muted, margin: "10px 0 0", fontFamily: "Manrope, sans-serif", opacity: 0.7 }}>
                      Unlock all features for $3/mo · no card required to start
                    </p>
                  </SignedOut>

                  <SignedIn>
                    {isPaid ? (
                      <button className="lp-btn-mission-gold" onClick={() => router.push("/practice")}>
                        Start Practicing
                      </button>
                    ) : (
                      <>
                        <button className="lp-btn-mission" onClick={() => router.push("/practice")}>
                          Start Practicing
                        </button>
                        <button className="lp-btn-upgrade" onClick={handleUpgrade}>
                          Upgrade to Premium
                        </button>
                        <p style={{ fontSize: 11, textAlign: "center", color: C.muted, margin: "10px 0 0", fontFamily: "Manrope, sans-serif", opacity: 0.7 }}>
                          Unlock all features for $3/mo
                        </p>
                      </>
                    )}
                  </SignedIn>
                </>
              )}

              <div style={{ marginTop: 28, paddingTop: 28, borderTop: "1px solid rgba(21,101,192,0.2)" }}>
                {isPaid ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.gold }}>verified</span>
                    <span style={{ fontSize: 12, color: C.gold, fontFamily: "Manrope, sans-serif", fontWeight: 600 }}>
                      Premium Active · All features unlocked
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {["IB", "PE", "HF", "Consulting", "AM"].map(cat => (
                      <span key={cat} style={{
                        fontSize: 10, fontWeight: 700, fontFamily: "Manrope, sans-serif",
                        color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em",
                        padding: "3px 8px", borderRadius: 4,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}>{cat}</span>
                    ))}
                    <span style={{ fontSize: 11, color: C.muted, fontFamily: "Manrope, sans-serif", opacity: 0.5 }}>& more</span>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────────────────── */}
        <section id="features-section" style={{ position: "relative", zIndex: 2, background: C.bg }}>
          <div style={{ padding: "96px 32px", maxWidth: 1280, margin: "0 auto" }}>
            <SectionScan label="Premium Features" />
            <ScrollReveal direction="left" style={{ marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px 0", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
                Precision Engineering{" "}
                <span style={{ color: C.secondary }}>for Financial Excellence</span>
              </h2>
              <div style={{ height: 4, width: 96, background: cyberGrad, borderRadius: 2 }} />
            </ScrollReveal>

            <div className="feat-grid">
              <ScrollReveal direction="left" startOffset={0.1} className="feat-large lp-glass-card">
                <span className="material-symbols-outlined lp-icon-secondary">tune</span>
                <h3 className="lp-card-title">Customized Practice</h3>
                <p className="lp-card-body" style={{ maxWidth: 380 }}>
                  Select category (IB, PE, HF), difficulty, and math preference.
                  Tailor your prep to the exact desk you&apos;re targeting.
                </p>
                <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["Investment Banking", "LBO Modeling"].map(tag => (
                    <span key={tag} className="lp-tag">{tag}</span>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" startOffset={0.2} className="feat-small lp-glass-card">
                <span className="material-symbols-outlined lp-icon-secondary">psychology</span>
                <h3 className="lp-card-title">AI Grading</h3>
                <p className="lp-card-body">
                  Instant written feedback on every answer. No more guessing if your
                  &quot;Value-Add&quot; story actually hit the mark.
                </p>
              </ScrollReveal>

              <ScrollReveal startOffset={0.15} className="feat-full lp-glass-card">
                <div style={{ display: "flex", flexDirection: "row", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <span className="material-symbols-outlined lp-icon-primary">timeline</span>
                    <h3 className="lp-card-title">History &amp; Tracking</h3>
                    <p className="lp-card-body">
                      Track your progress over time with granular data points. Visualize
                      your readiness across core competencies and technical hurdles.
                    </p>
                  </div>
                  <div style={{
                    flex: 1, minWidth: 180,
                    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                    padding: 24, borderRadius: 12,
                    border: "1px solid rgba(21,101,192,0.2)",
                    background: "rgba(2,8,23,0.5)",
                  }}>
                    <div style={{ height: 140, display: "flex", alignItems: "flex-end", gap: 8 }}>
                      {[30, 45, 60, 85, 70].map((h, i) => (
                        <div key={i} style={{
                          flex: 1, borderRadius: "4px 4px 0 0",
                          height: `${h}%`,
                          background: i === 3 ? cyberGrad : `rgba(21,101,192,${0.2 + i * 0.12})`,
                          boxShadow: i === 3 ? "0 0 20px rgba(21,101,192,0.4)" : "none",
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal startOffset={0.1} className="feat-full lp-glass-card">
                <span className="material-symbols-outlined lp-icon-secondary">record_voice_over</span>
                <h3 className="lp-card-title">Mock Interview Mode</h3>
                <p className="lp-card-body" style={{ maxWidth: 600 }}>
                  A full structured mock interview: realistic scenario, four sequential questions,
                  live AI interviewer responses, and a holistic debrief after you&apos;re done.
                  Premium experience, $3/mo.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
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
                { step: "01", icon: "person_add",   title: "Create an Account",       body: "Sign up in seconds — no credit card required. Free tier gives you 5 questions per day to start building your edge right away.", tag: "Free" },
                { step: "02", icon: "tune",          title: "Configure Your Session",  body: "Pick a category (IB, PE, HF, Consulting…), set difficulty, toggle math on or off, and optionally add a custom descriptor to zero in on exactly what you need.", tag: "Customizable" },
                { step: "03", icon: "rate_review",   title: "Answer & Get Graded",     body: "Tackle AI-generated questions drawn from real interview patterns. Write your answer, reveal the model answer, then get instant written AI feedback on accuracy and depth.", tag: "AI-Powered" },
                { step: "04", icon: "timeline",      title: "Track Your Progress",     body: "Every graded answer is logged in your history. Search by keyword, filter by category or difficulty, and watch your performance improve over time.", tag: "Premium" },
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

        {/* ── PRICING ───────────────────────────────────────────────────────── */}
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
            {/* Free tier */}
            <ScrollReveal
              direction="left"
              startOffset={0.1}
              style={{
                background: C.surface,
                border: "1px solid rgba(51,65,85,0.3)",
                padding: 40, borderRadius: 16,
                display: "flex", flexDirection: "column",
              }}
            >
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

            {/* Premium tier — outer div carries scale(1.03), ScrollReveal handles animation */}
            <div style={{ transform: "scale(1.03)" }}>
              <ScrollReveal
                direction="right"
                startOffset={0.2}
                className="lp-glass-card-solid"
                style={{
                  padding: 40, borderRadius: 16,
                  display: "flex", flexDirection: "column",
                  position: "relative",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ position: "absolute", top: 0, right: 40, transform: "translateY(-50%)", background: cyberGrad, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "Manrope, sans-serif", boxShadow: "0 4px 12px rgba(21,101,192,0.4)" }}>
                  Recommended
                </div>
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", fontFamily: "Inter, sans-serif" }}>Premium Tier</h3>
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

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: "128px 32px", textAlign: "center", position: "relative", overflow: "hidden", zIndex: 2, background: C.bgAlt }}>
          <div style={{
            position: "absolute", inset: 0,
            background: isPaid ? "rgba(201,168,76,0.07)" : "rgba(21,101,192,0.08)",
            filter: "blur(120px)", borderRadius: "50%",
            transform: "scale(0.5)", pointerEvents: "none",
          }} />

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
                All premium features are unlocked. Keep sharpening your technicals.
              </ScrollReveal>
              <ScrollReveal startOffset={0.18} style={{ position: "relative", zIndex: 1 }}>
                <button className="lp-btn-cta-gold" onClick={() => router.push("/practice")}>
                  Go to Practice →
                </button>
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

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer style={{ background: C.bg, borderTop: "1px solid rgba(21,101,192,0.2)", position: "relative", zIndex: 2 }}>
          <div className="lp-footer-inner" style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: C.primary }}>Fite</span>{" "}
                <span style={{ color: C.secondary }}>Finance</span>
                {isPaid && <span style={{ color: C.gold, textShadow: "0 0 8px rgba(201,168,76,0.6)", fontWeight: 900 }}>+</span>}
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
    </>
  );
}

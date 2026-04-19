import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import usePaidStatus from "./usePaidStatus";
import useStableViewport, { toViewportCssValue } from "./useStableViewport";

// ─── Design tokens (matches Dashboard.js) ────────────────────────────────────
const C = {
  bg:             "#020817",
  surface:        "#0d1b2a",
  surfaceHigh:    "#1b263b",
  surfaceLow:     "#0b1120",
  primary:        "#1565C0",
  secondary:      "#4FC3F7",
  gold:           "#c9a84c",
  goldLight:      "#f5d06a",
  goldDark:       "#a87c2a",
  text:           "#f8fafc",
  textMuted:      "#94a3b8",
  border:         "rgba(21, 101, 192, 0.18)",
  borderActive:   "rgba(79, 195, 247, 0.45)",
};

const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = [C.gold, C.secondary, C.primary, C.goldLight, C.goldDark, "#4FC3F7"];
const CONFETTI_COUNT = 22;

function ConfettiParticle({ delay, color, x, size, duration }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: 0,
        left: `${x}%`,
        width: size,
        height: size * 0.5,
        backgroundColor: color,
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 0,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: [null, 60, 140],
        opacity: [1, 1, 0],
        rotate: [0, 180, 360],
        scale: [1, 0.8, 0.4],
      }}
      transition={{ duration, delay, ease: "easeOut", times: [0, 0.6, 1] }}
    />
  );
}

const FEATURES = [
  { label: "Unlimited Questions", icon: "all_inclusive" },
  { label: "AI Answer Grading",   icon: "psychology" },
  { label: "Question History",    icon: "history" },
  { label: "Interview Mode",      icon: "record_voice_over" },
  { label: "Custom Descriptors",  icon: "tune" },
];

function Icon({ name, size = 18 }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, verticalAlign: "middle" }}
    >
      {name}
    </span>
  );
}

function Success() {
  const router = useRouter();
  const { isPaid, loading } = usePaidStatus();
  const viewport = useStableViewport();
  const fullHeight = toViewportCssValue(viewport.height);
  const [showConfetti, setShowConfetti] = useState(true);

  const [particles] = useState(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      delay: i * 0.05,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: (i * 4.3 + 2) % 96,
      size: 8 + (i % 3) * 4,
      duration: 1.0 + (i % 3) * 0.3,
    }))
  );

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return null;
  if (!isPaid) {
    router.push("/");
    return null;
  }

  return (
    <div style={{ ...styles.page, minHeight: fullHeight }}>
      {/* Confetti overlay */}
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
          {particles.map((p) => (
            <ConfettiParticle key={p.id} {...p} />
          ))}
        </div>
      )}

      {/* Ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(21,101,192,0.18) 0%, transparent 70%)",
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
        style={styles.card}
      >
        {/* Logo row */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          style={styles.logoRow}
        >
          <motion.img
            src="/Fite_Premium_NB.png"
            alt="Fite Finance logo"
            style={{ height: 52, width: 52, cursor: "pointer", borderRadius: 10, flexShrink: 0 }}
            onClick={() => router.push("/")}
            initial={{ rotate: -20, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.15 }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{ fontSize: 24, fontWeight: 800, color: C.text, cursor: "pointer", fontFamily: "Manrope, sans-serif" }}
                onClick={() => router.push("/")}
              >
                Fite Finance
              </span>
              {/* Inline premium badge */}
              <span style={{
                fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "2px 8px", borderRadius: 20,
                background: `linear-gradient(135deg, ${C.goldLight}, ${C.gold}, ${C.goldDark})`,
                color: "#1a0e00",
              }}>
                Premium
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0, fontFamily: "Inter, sans-serif" }}>
              The finance site sharpening your interview skills
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, margin: "20px 0" }} />

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
          style={{ textAlign: "center" }}
        >
          {/* Checkmark */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.42 }}
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.goldLight} 0%, ${C.gold} 50%, ${C.goldDark} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 36px rgba(201,168,76,0.45)`,
                position: "relative",
              }}
            >
              <motion.div
                style={{
                  position: "absolute", inset: -5, borderRadius: "50%",
                  border: `2px solid rgba(201,168,76,0.5)`,
                }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.52, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: "0 0 12px 0", fontFamily: "Manrope, sans-serif" }}>
            You're all set!
          </h2>
          <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.65, margin: 0, fontFamily: "Inter, sans-serif" }}>
            Welcome to{" "}
            <span style={{ color: C.gold, fontWeight: 700 }}>Fite Finance Premium</span>
            . You now have unlimited access to all finance interview questions and tools.
          </p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24, marginBottom: 8 }}
          >
            {FEATURES.map(({ label, icon }, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 + i * 0.07, type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 700,
                  padding: "5px 11px", borderRadius: 20,
                  background: C.surfaceHigh,
                  color: C.secondary,
                  border: `1px solid ${C.border}`,
                  letterSpacing: "0.3px",
                  fontFamily: "Manrope, sans-serif",
                }}
              >
                <Icon name={icon} size={13} />
                {label}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA button */}
          <motion.button
            style={{
              marginTop: 28,
              padding: "13px 36px",
              borderRadius: 10,
              border: "none",
              background: cyberGrad,
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "Manrope, sans-serif",
              letterSpacing: "0.04em",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(21,101,192,0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.03, boxShadow: "0 6px 28px rgba(21,101,192,0.55)" }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Icon name="bolt" size={17} />
            Start Practicing
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        style={{ textAlign: "center", zIndex: 1 }}
      >
        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 32, marginBottom: 10, fontStyle: "italic", fontFamily: "Inter, sans-serif" }}>
          For help, contact{" "}
          <a href="mailto:support@fitefinance.com" style={{ color: C.secondary, textDecoration: "none" }}>
            support@fitefinance.com
          </a>
        </p>
        <p style={{ fontSize: 11, color: C.textMuted, marginTop: 10, marginBottom: 10, fontFamily: "Inter, sans-serif" }}>
          <Link href="/privacy" style={{ color: C.textMuted, textDecoration: "none" }}>Privacy Policy</Link>
          <span style={{ fontSize: 22, verticalAlign: "middle", margin: "0 4px" }}> · </span>
          <Link href="/terms" style={{ color: C.textMuted, textDecoration: "none" }}>Terms of Service</Link>
          <span style={{ fontSize: 22, verticalAlign: "middle", margin: "0 4px" }}> · </span>
          <Link href="/refunds" style={{ color: C.textMuted, textDecoration: "none" }}>Refund Policy</Link>
        </p>
        <p className="byline-bottom" style={{ fontSize: 12, fontWeight: "bold", color: "#5a060d", fontFamily: "'Snell Roundhand', cursive", wordSpacing: "2px", marginTop: 4, marginBottom: 12, display: "none" }}>
          by Colgate's finest
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: C.bg,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "72px 20px 40px",
    fontFamily: "'Segoe UI', sans-serif",
    position: "relative",
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: "28px 32px",
    width: "100%",
    maxWidth: 640,
    boxSizing: "border-box",
    marginBottom: 16,
    border: `1px solid ${C.border}`,
    boxShadow: "0 8px 48px rgba(0,0,0,0.55)",
    position: "relative",
    zIndex: 1,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
};

export default Success;

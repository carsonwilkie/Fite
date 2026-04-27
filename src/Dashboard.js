import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useUser } from "@clerk/clerk-react";
import { useAuthModal } from "./auth/AuthProvider";
import UserMenu from "./auth/UserMenu";
import { motion, AnimatePresence } from "motion/react";
import usePaidStatus from "./usePaidStatus";
import usePrice from "./usePrice";
import useUpgrade from "./useUpgrade";
import LightsaberLoader from "./LightsaberLoader";
import { CATEGORIES, DIFFICULTIES, QUESTION_DIFFICULTIES } from "./constants";
import useStableViewport, { toViewportCssValue } from "./useStableViewport";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:             "#020817",
  surface:        "#0d1b2a",
  surfaceHigh:    "#1b263b",
  surfaceLow:     "#0b1120",
  surfaceHighest: "#1e293b",
  primary:        "#1565C0",
  secondary:      "#4FC3F7",
  gold:           "#c9a84c",
  text:           "#f8fafc",
  textMuted:      "#94a3b8",
  border:         "rgba(21, 101, 192, 0.18)",
  borderActive:   "rgba(79, 195, 247, 0.45)",
  success:        "#22c55e",
  warn:           "#f59e0b",
  danger:         "#ef4444",
};

const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

const INTERVIEW_QUESTIONS = 4;

const CATEGORY_LABELS = {
  "All":                "All",
  "Investment Banking":  "Inv. Banking",
  "Private Equity":      "Private Equity",
  "Asset Management":    "Asset Mgmt",
  "Accounting":          "Accounting",
  "Consulting":          "Consulting",
  "Valuation":           "Valuation",
  "Sales and Trading":   "Sales & Trading",
};

// ─── Small helpers ────────────────────────────────────────────────────────────
function Icon({ name, size = 20, style: s = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, verticalAlign: "middle", display: "inline-block", ...s }}
    >
      {name}
    </span>
  );
}

// ─── OTG info badge ───────────────────────────────────────────────────────────
// Small "?" icon shown in the corner of the OTG difficulty button. The tooltip
// only appears after a short hover delay (so brushing past it with the cursor
// doesn't trigger a flash) or on tap/click. Click on the badge is swallowed so
// it never accidentally selects the OTG button itself.
const OTG_HOVER_DELAY_MS = 450;
function OtgInfoBadge({ active }) {
  const [open, setOpen] = useState(false);
  const openTimerRef = useRef(null);
  const wrapperRef = useRef(null);

  const cancelOpenTimer = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    cancelOpenTimer();
    openTimerRef.current = setTimeout(() => setOpen(true), OTG_HOVER_DELAY_MS);
  };
  const handleMouseLeave = () => {
    cancelOpenTimer();
    setOpen(false);
  };

  // Tap/click: open immediately and don't let the parent OTG button activate.
  const handleActivate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    cancelOpenTimer();
    setOpen(v => !v);
  };

  // Tap-outside dismiss for mobile (no mouseleave on touch).
  useEffect(() => {
    if (!open) return undefined;
    const onDocPointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [open]);

  // Tear down any pending open timer on unmount.
  useEffect(() => () => cancelOpenTimer(), []);

  return (
    <span
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onPointerDown={(e) => { e.stopPropagation(); }}
      onTouchStart={(e) => { e.stopPropagation(); }}
      onClick={handleActivate}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleActivate(e); }}
      role="button"
      tabIndex={0}
      aria-label="What is OTG?"
      aria-expanded={open}
      style={{
        position: "absolute",
        // Larger transparent hit area (~26x26) for reliable mobile tap, while
        // the visible "?" pill stays tiny just inside the button's top-right.
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: 3,
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        zIndex: 2,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: active ? "rgba(255,255,255,0.22)" : "rgba(79,195,247,0.18)",
          color: active ? "#fff" : C.secondary,
          fontSize: 7,
          fontWeight: 900,
          lineHeight: 1.1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "-0.5px",
        }}
      >
        ?
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              right: 0,
              width: 220,
              padding: "10px 12px",
              background: C.surfaceHighest,
              border: `1px solid ${C.borderActive}`,
              borderRadius: 10,
              boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
              color: C.text,
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.5,
              letterSpacing: "0.01em",
              textTransform: "none",
              textAlign: "left",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <span style={{ display: "block", fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: C.secondary, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", marginBottom: 4 }}>
              OTG · On The Go
            </span>
            Quick one-line questions — short definitions, term comparisons, or finance brain-teasers. Built for fast reps, not deep dives.
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function ScoreRing({ score, color, size = 112 }) {
  const cx = size / 2;
  const r  = cx - 8;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={C.surfaceHigh} strokeWidth="8" />
      <motion.circle
        cx={cx} cy={cx} r={r}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - score / 10) }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
      />
    </svg>
  );
}

const TIMER_PRESETS = [60, 120, 180, 300];

function TimerDisplay({ timeLeft, timerDuration, paused, onPause, onResume, onStart, timerOn }) {
  // When timer is enabled but not yet started, show a Start button
  if (timerOn && timeLeft === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, marginBottom: 8 }}
      >
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="timer" size={24} style={{ color: C.textMuted }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 3 }}>Timer Ready</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, fontFamily: "Inter, sans-serif" }}>
            {Math.floor(timerDuration / 60)}m {timerDuration % 60 > 0 ? `${timerDuration % 60}s` : ""} — press start when ready
          </div>
        </div>
        <motion.button
          onClick={onStart}
          whileTap={{ scale: 0.9 }}
          style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid rgba(79,195,247,0.4)`, background: "rgba(79,195,247,0.1)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, color: C.secondary, fontSize: 11, fontWeight: 900, fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em" }}
        >
          <Icon name="play_arrow" size={18} style={{ color: C.secondary }} />
          Start
        </motion.button>
      </motion.div>
    );
  }
  if (timeLeft === null || typeof timeLeft !== "number" || isNaN(timeLeft)) return null;
  const pct   = timerDuration > 0 ? timeLeft / timerDuration : 0;
  const color = pct > 0.5 ? C.success : pct > 0.25 ? C.warn : C.danger;
  const mins  = Math.floor(timeLeft / 60);
  const secs  = timeLeft % 60;
  const str   = `${mins}:${secs.toString().padStart(2, "0")}`;
  const size  = 56; const cx = size / 2; const r = cx - 4; const circ = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderRadius: 12, background: C.surface, border: `1px solid ${color}40`, marginBottom: 8 }}
    >
      <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke={C.surfaceHigh} strokeWidth="4" />
          <motion.circle
            cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 0.8, ease: "linear" }}
          />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 900, color, position: "relative", zIndex: 1, fontFamily: "Manrope, sans-serif" }}>{str}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 3 }}>Timer</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: timeLeft === 0 ? C.danger : C.text, fontFamily: "Inter, sans-serif" }}>
          {timeLeft === 0 ? "Time's up!" : paused ? "Paused" : `${timeLeft}s remaining`}
        </div>
      </div>
      {timeLeft > 0 && (
        <motion.button
          onClick={paused ? onResume : onPause}
          whileTap={{ scale: 0.9 }}
          style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${color}50`, background: `${color}12`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <Icon name={paused ? "play_arrow" : "pause"} size={20} style={{ color }} />
        </motion.button>
      )}
    </motion.div>
  );
}

function NavItem({ icon, label, active, onClick, gold, muted }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 8, width: "100%",
        background: active ? "rgba(21,101,192,0.15)" : "transparent",
        border: "none",
        borderRight: active ? `3px solid ${C.secondary}` : "3px solid transparent",
        cursor: onClick ? "pointer" : "default",
        color: active ? C.secondary : gold ? C.gold : muted ? `${C.textMuted}55` : C.textMuted,
        fontSize: 13, fontWeight: 600, fontFamily: "Manrope, sans-serif",
        transition: "color 0.18s, background 0.18s",
        textAlign: "left",
      }}
    >
      <Icon name={icon} size={18} />
      {label}
    </motion.button>
  );
}

function ControlLabel({ children }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 10, opacity: 0.7 }}>
      {children}
    </div>
  );
}

const TOGGLE_TRACK_WIDTH = 44;
const TOGGLE_TRACK_HEIGHT = 24;
const TOGGLE_THUMB_SIZE = 20;
const TOGGLE_INSET = 2;
const TOGGLE_TRAVEL = TOGGLE_TRACK_WIDTH - TOGGLE_THUMB_SIZE - TOGGLE_INSET * 2;

function ToggleSwitch({ checked, onClick, disabled = false }) {
  return (
    <motion.button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.88 }}
      style={{
        width: TOGGLE_TRACK_WIDTH,
        height: TOGGLE_TRACK_HEIGHT,
        borderRadius: 999,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        backgroundColor: checked ? C.secondary : C.surfaceHigh,
        transition: "background-color 0.22s",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? TOGGLE_TRAVEL : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        style={{
          position: "absolute",
          top: TOGGLE_INSET,
          left: TOGGLE_INSET,
          width: TOGGLE_THUMB_SIZE,
          height: TOGGLE_THUMB_SIZE,
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        }}
      />
    </motion.button>
  );
}

function SessionIntel({ count, avgScore, readiness, compact = false }) {
  const color    = readiness >= 70 ? C.success : readiness >= 40 ? C.warn : C.secondary;
  const ringSize = compact ? 72 : 112;
  const sw       = compact ? 6 : 8;
  const cx       = ringSize / 2;
  const r        = cx - sw;
  const circ     = 2 * Math.PI * r;

  if (compact) {
    return (
      <div style={{ margin: "0 10px 8px", padding: "12px 14px", borderRadius: 12, background: "rgba(15,23,42,0.6)", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 60, height: 60, background: `radial-gradient(circle, ${C.primary}25, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
          Session Intel
          <span style={{ color: color, fontWeight: 700 }}>Live</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Compact ring */}
          <div style={{ width: ringSize, height: ringSize, position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
              <circle cx={cx} cy={cx} r={r} fill="none" stroke={C.surfaceHigh} strokeWidth={sw} />
              <motion.circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
                strokeDasharray={circ}
                animate={{ strokeDashoffset: circ * (1 - readiness / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.text, lineHeight: 1 }}>{readiness}</div>
              <div style={{ fontSize: 7, fontWeight: 900, color: color, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>Ready</div>
            </div>
          </div>
          {/* Stats */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>Questions</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.text, lineHeight: 1.1 }}>{count}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>Avg Score</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: avgScore !== null ? color : C.textMuted, lineHeight: 1.1 }}>
                {avgScore !== null ? avgScore : "—"}
                {avgScore !== null && <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 400 }}>/10</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 24px", borderTop: `1px solid ${C.border}`, backgroundColor: C.surfaceLow }}>
      <div style={{ padding: 20, borderRadius: 16, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(12px)", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, background: `radial-gradient(circle, ${C.primary}30, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: C.text, fontFamily: "Manrope, sans-serif", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Session Intel
          <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 400 }}>Live</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: ringSize, height: ringSize, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
              <circle cx={cx} cy={cx} r={r} fill="none" stroke={C.surfaceHigh} strokeWidth={sw} />
              <motion.circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
                strokeDasharray={circ}
                animate={{ strokeDashoffset: circ * (1 - readiness / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: C.text, lineHeight: 1 }}>{readiness}</span>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: color, marginTop: 2, fontFamily: "Manrope, sans-serif" }}>Readiness</span>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>Questions</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.text, marginTop: 2 }}>{count}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>Avg Score</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: avgScore !== null ? color : C.textMuted, marginTop: 2 }}>
              {avgScore !== null ? `${avgScore}` : "—"}
              {avgScore !== null && <span style={{ fontSize: 9, fontWeight: 400, color: C.textMuted }}> / 10</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Question Canvas (right panel, question mode) ─────────────────────────────
function QuestionCanvas({ question, answer, userAnswer, setUserAnswer, feedback, score, graded, answerRevealed, loadingQuestion, loadingAnswer, loadingFeedback, streamProgress, wordCount, isPaid, category, difficulty, math, onGetAnswer, onGrade, onNewQuestion, onUpgrade, price, questionsUsed, getScoreColor, getScoreBg, timeLeft, timerDuration, timerPaused, onPauseTimer, onResumeTimer, onStartTimer, timerOn, snapshotCategory, snapshotDifficulty, snapshotMath, snapshotCustomPrompt }) {
  const isLimitMsg = question?.includes("you've reached") || question?.includes("You've reached") || question?.includes("seen all recent");

  // Empty / loading state
  if (loadingQuestion) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 24 }}>
        <LightsaberLoader percent={streamProgress} />
        <p style={{ fontSize: 13, color: C.textMuted, fontFamily: "Manrope, sans-serif", letterSpacing: "0.05em" }}>Crafting your question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500, textAlign: "center", gap: 20 }}
      >
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `rgba(21,101,192,0.1)`, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="terminal" size={32} style={{ color: C.secondary }} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 8px 0", fontFamily: "Inter, sans-serif" }}>Ready to Begin</h2>
          <p style={{ fontSize: 14, color: C.textMuted, margin: 0, maxWidth: 360, lineHeight: 1.7 }}>Configure your session on the left panel and click <strong style={{ color: C.secondary }}>Generate Question</strong> to start practicing.</p>
        </div>
        {!isPaid && questionsUsed !== null && (
          <div style={{ padding: "10px 18px", borderRadius: 999, background: "rgba(21,101,192,0.1)", border: `1px solid ${C.border}`, fontSize: 12, color: C.textMuted }}>
            {questionsUsed} of 5 free questions used today
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question}
        className="qc-wrap"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Timer display */}
        <TimerDisplay timeLeft={timeLeft} timerDuration={timerDuration} paused={timerPaused} onPause={onPauseTimer} onResume={onResumeTimer} onStart={onStartTimer} timerOn={timerOn} />

        {/* Question header badges — locked to snapshot values at generation time */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ padding: "4px 12px", background: "rgba(79,195,247,0.1)", color: C.secondary, fontSize: 10, fontWeight: 900, fontFamily: "Manrope, sans-serif", borderRadius: 6, letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid rgba(79,195,247,0.2)` }}>
            {(snapshotCategory || category) === "All" ? "Finance" : (snapshotCategory || category)}
          </span>
          <span style={{ padding: "4px 12px", background: "rgba(21,101,192,0.08)", color: C.textMuted, fontSize: 10, fontWeight: 900, fontFamily: "Manrope, sans-serif", borderRadius: 6, letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid ${C.border}` }}>
            {snapshotDifficulty || difficulty}
          </span>
          <span style={{ padding: "4px 12px", background: "rgba(21,101,192,0.08)", color: C.textMuted, fontSize: 10, fontWeight: 900, fontFamily: "Manrope, sans-serif", borderRadius: 6, letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid ${C.border}` }}>
            {snapshotMath || math}
          </span>
          {snapshotCustomPrompt && (
            <span
              title={snapshotCustomPrompt}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "rgba(201,168,76,0.1)", color: C.gold, fontSize: 10, fontWeight: 900, fontFamily: "Manrope, sans-serif", borderRadius: 6, letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid rgba(201,168,76,0.3)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              <Icon name="bolt" size={12} />
              {snapshotCustomPrompt}
            </span>
          )}
        </div>

        {/* Question text */}
        {isLimitMsg ? (
          <div style={{ padding: "24px 28px", borderRadius: 16, background: "rgba(21,101,192,0.07)", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.7, margin: 0 }}>{question}</p>
            <motion.button
              onClick={onUpgrade}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: 20, padding: "14px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #f5d06a, #c9a84c)", color: "#fff", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", boxShadow: "0 8px 24px rgba(201,168,76,0.4)" }}
            >
              Upgrade for {price || "$3/month"}
            </motion.button>
          </div>
        ) : (
          <h1 className="qc-question" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, lineHeight: 1.15, color: C.text, margin: 0, fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>
            {question}
          </h1>
        )}

        {/* Answer terminal */}
        {!isLimitMsg && (
          <div style={{ borderRadius: 16, padding: 1, background: `linear-gradient(135deg, ${C.primary}50, ${C.secondary}30)`, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            <div className="qc-terminal" style={{ backgroundColor: C.surfaceLow, borderRadius: 15, padding: "28px 32px", minHeight: 320, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 10, fontWeight: 900, color: C.secondary, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                <Icon name="terminal" size={16} />
                INPUT TERMINAL
                {!isPaid && (
                  <span style={{ marginLeft: "auto", fontSize: 9, color: C.gold, letterSpacing: "0.1em", fontFamily: "Manrope, sans-serif" }}>PREMIUM</span>
                )}
              </div>

              <textarea
                className="qc-textarea"
                placeholder={isPaid ? "Type your detailed response here... Consider the mechanics, the math, and the strategic implications." : "Upgrade to Premium to type your answer and get AI feedback."}
                value={userAnswer}
                onChange={(e) => isPaid && !graded && setUserAnswer(e.target.value)}
                disabled={!isPaid || graded}
                style={{ flex: 1, width: "100%", minHeight: 260, backgroundColor: "transparent", border: "none", outline: "none", resize: "none", fontSize: 16, lineHeight: 1.75, color: isPaid ? C.text : `${C.textMuted}60`, fontFamily: "Inter, sans-serif", cursor: isPaid && !graded ? "text" : "not-allowed", padding: "4px 0 0 0" }}
              />

              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 10, color: `${C.textMuted}60`, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                  Words: {wordCount}
                </div>
                {!isPaid && questionsUsed !== null && (
                  <div style={{ fontSize: 10, color: questionsUsed >= 4 ? C.warn : C.textMuted, fontFamily: "Manrope, sans-serif" }}>
                    {questionsUsed}/5 free today
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feedback section */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: 24, borderRadius: 16, backgroundColor: C.surface, borderLeft: `4px solid ${score !== null ? getScoreColor(score) : C.primary}` }}
            >
              {score !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  style={{ marginBottom: 16 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 56, height: 56, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="56" height="56" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                        <circle cx="28" cy="28" r="22" fill="none" stroke={C.surfaceHigh} strokeWidth="4" />
                        <motion.circle
                          cx="28" cy="28" r="22" fill="none" stroke={getScoreColor(score)} strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={138.2}
                          initial={{ strokeDashoffset: 138.2 }}
                          animate={{ strokeDashoffset: 138.2 * (1 - score / 10) }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                        />
                      </svg>
                      <span style={{ fontSize: 16, fontWeight: 900, color: getScoreColor(score), position: "relative", zIndex: 1 }}>{score}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 2 }}>SCORE</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: getScoreColor(score), marginBottom: 8 }}>{score} <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 400 }}>/ 10</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 4, background: C.surfaceHigh, borderRadius: 2, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score * 10}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            style={{ height: "100%", background: `linear-gradient(to right, ${getScoreColor(score)}99, ${getScoreColor(score)})`, borderRadius: 2, boxShadow: `0 0 6px ${getScoreColor(score)}60` }}
                          />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(score), fontFamily: "Manrope, sans-serif", whiteSpace: "nowrap" }}>{score} / 10</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 10 }}>AI Feedback</div>
              <p style={{ fontSize: 15, color: C.text, lineHeight: 1.75, margin: 0 }}>{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer loading skeleton */}
        <AnimatePresence>
          {loadingAnswer && (
            <motion.div
              key="answer-skeleton"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ padding: 24, borderRadius: 16, backgroundColor: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.secondary, fontFamily: "Manrope, sans-serif", marginBottom: 14, opacity: 0.5 }}>Model Answer</div>
              <style>{`
                @keyframes fite-shimmer {
                  0% { background-position: -400px 0; }
                  100% { background-position: 400px 0; }
                }
                .fite-skel {
                  background: linear-gradient(90deg, ${C.border}55 25%, ${C.border}cc 50%, ${C.border}55 75%);
                  background-size: 800px 100%;
                  animation: fite-shimmer 1.4s infinite linear;
                  border-radius: 6px;
                }
              `}</style>
              <div className="fite-skel" style={{ height: 13, width: "92%", marginBottom: 10 }} />
              <div className="fite-skel" style={{ height: 13, width: "78%", marginBottom: 10 }} />
              <div className="fite-skel" style={{ height: 13, width: "85%", marginBottom: 10 }} />
              <div className="fite-skel" style={{ height: 13, width: "60%", marginBottom: 18 }} />
              <div className="fite-skel" style={{ height: 13, width: "88%", marginBottom: 10 }} />
              <div className="fite-skel" style={{ height: 13, width: "70%" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer reveal */}
        <AnimatePresence>
          {answerRevealed && answer && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: 24, borderRadius: 16, backgroundColor: C.surface, border: `1px solid ${C.border}` }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.secondary, fontFamily: "Manrope, sans-serif", marginBottom: 14 }}>Model Answer</div>
              <div className="dashboard-markdown">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {!isLimitMsg && (
          <div className="qc-actions" style={{ display: "flex", gap: 14, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {!answerRevealed && (
              <motion.button
                onClick={onGetAnswer}
                disabled={loadingAnswer || answerRevealed}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 28px", borderRadius: 10, border: `2px solid ${loadingAnswer ? C.secondary + "55" : C.border}`, background: "transparent", color: loadingAnswer ? C.secondary : C.text, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: loadingAnswer ? "default" : "pointer", fontFamily: "Manrope, sans-serif", transition: "border-color 0.2s, color 0.2s", display: "flex", alignItems: "center", gap: 8 }}
              >
                {loadingAnswer && (
                  <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "fite-spin 0.8s linear infinite", flexShrink: 0 }}>
                    <style>{`@keyframes fite-spin { to { transform: rotate(360deg); } }`}</style>
                    <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="22 8" />
                  </svg>
                )}
                {loadingAnswer ? "Loading..." : "Show Answer"}
              </motion.button>
            )}
            {isPaid && !graded && userAnswer.trim() && (
              <motion.button
                onClick={onGrade}
                disabled={loadingFeedback}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(21,101,192,0.45)" }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: cyberGrad, color: "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: loadingFeedback ? "not-allowed" : "pointer", fontFamily: "Manrope, sans-serif", boxShadow: "0 8px 24px rgba(21,101,192,0.35)", opacity: loadingFeedback ? 0.6 : 1 }}
              >
                {loadingFeedback ? "Grading..." : graded ? "Graded ✓" : "Submit Answer"}
              </motion.button>
            )}
            {isPaid && graded && (
              <motion.button
                onClick={onNewQuestion}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(21,101,192,0.45)" }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: cyberGrad, color: "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", fontFamily: "Manrope, sans-serif", boxShadow: "0 8px 24px rgba(21,101,192,0.35)" }}
              >
                Next Question
              </motion.button>
            )}
            <motion.button
              onClick={onNewQuestion}
              disabled={loadingQuestion}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: "14px 28px", borderRadius: 10, border: `2px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}
            >
              Skip
            </motion.button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Interview Canvas ─────────────────────────────────────────────────────────
function InterviewCanvas({ loadingInterviewGenerate, interviewProgress, interviewSession, interviewStep, interviewUserAnswers, interviewResponses, interviewCurrentAnswer, setInterviewCurrentAnswer, interviewComplete, interviewDebrief, loadingDebrief, loadingInterviewRespond, interviewAnswersRevealed, setInterviewAnswersRevealed, interviewOverallScore, interviewWordCount, isPaid, onSubmit, onDebrief, onNewInterview, onUpgrade, getScoreColor, getScoreBg }) {

  if (loadingInterviewGenerate) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 24 }}>
        <LightsaberLoader percent={interviewProgress} />
        <p style={{ fontSize: 13, color: C.textMuted, fontFamily: "Manrope, sans-serif", letterSpacing: "0.05em" }}>Building your interview scenario...</p>
      </div>
    );
  }

  if (!interviewSession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500, textAlign: "center", gap: 20 }}
      >
        {!isPaid && (
          <div style={{ padding: "14px 24px", borderRadius: 12, background: "rgba(201,168,76,0.08)", border: `1px solid rgba(201,168,76,0.25)`, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.gold, fontFamily: "Manrope, sans-serif", fontWeight: 700 }}>Premium Feature</span>
            <p style={{ fontSize: 13, color: C.textMuted, margin: "6px 0 0 0" }}>Interview Mode requires a Premium subscription.</p>
            <motion.button onClick={onUpgrade} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ marginTop: 14, padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #f5d06a, #c9a84c)", color: "#fff", fontSize: 12, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
              Upgrade to Premium
            </motion.button>
          </div>
        )}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `rgba(21,101,192,0.1)`, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="groups" size={32} style={{ color: C.secondary }} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 8px 0", fontFamily: "Inter, sans-serif" }}>Mock Interview Mode</h2>
          <p style={{ fontSize: 14, color: C.textMuted, margin: 0, maxWidth: 400, lineHeight: 1.7 }}>A full 4-question interview with a live scenario, real-time feedback, and a holistic debrief at the end.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="ic-wrap"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", gap: 28 }}
    >
      {/* Scenario */}
      <div className="ic-scenario" style={{ padding: "20px 24px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: C.secondary, fontFamily: "Manrope, sans-serif", marginBottom: 10 }}>Interview Scenario</div>
        <p className="ic-scenario-text" style={{ fontSize: 15, color: C.text, lineHeight: 1.75, margin: 0 }}>{interviewSession.scenario}</p>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {interviewSession.questions.map((_, i) => {
          const done = i < interviewStep || interviewComplete;
          const curr = i === interviewStep && !interviewComplete;
          return (
            <motion.div
              key={i}
              style={{ flex: 1, height: 4, borderRadius: 2 }}
              animate={{ backgroundColor: done ? C.secondary : curr ? `${C.primary}88` : `${C.surfaceHigh}` }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
        <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, flexShrink: 0, marginLeft: 6, fontFamily: "Manrope, sans-serif" }}>
          {interviewComplete ? "Complete" : `Q${interviewStep + 1} of ${INTERVIEW_QUESTIONS}`}
        </span>
      </div>

      {/* Completed Q&As */}
      {interviewUserAnswers.map((ans, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          style={{ borderTop: i > 0 ? `1px solid ${C.border}` : "none", paddingTop: i > 0 ? 20 : 0 }}
        >
          <div style={{ borderLeft: `3px solid ${C.primary}`, paddingLeft: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>Question {i + 1}</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.6, margin: 0 }}>{interviewSession.questions[i].question}</p>
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: C.surface, border: `1px solid ${C.border}`, marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>Your Answer</div>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, margin: 0 }}>{ans}</p>
          </div>
          {interviewResponses[i] && (
            <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: interviewResponses[i].onTrack ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.06)", borderLeft: `3px solid ${interviewResponses[i].onTrack ? C.success : C.warn}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", backgroundColor: getScoreBg(interviewResponses[i].score), border: `2px solid ${getScoreColor(interviewResponses[i].score)}`, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <span style={{ fontSize: 13, fontWeight: 900, color: getScoreColor(interviewResponses[i].score) }}>{interviewResponses[i].score}</span>
              </motion.div>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0 }}>{interviewResponses[i].response}</p>
            </div>
          )}
          {interviewAnswersRevealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ marginTop: 10, padding: "12px 16px", borderRadius: 10, backgroundColor: "rgba(21,101,192,0.07)", border: `1px solid ${C.border}` }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, color: C.primary, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>Ideal Answer</div>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, margin: 0 }}>{interviewSession.questions[i].idealAnswer}</p>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Current question */}
      {!interviewComplete && (
        <div style={{ borderTop: interviewUserAnswers.length > 0 ? `1px solid ${C.border}` : "none", paddingTop: interviewUserAnswers.length > 0 ? 20 : 0 }}>
          <div style={{ borderLeft: `3px solid ${C.secondary}`, paddingLeft: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.secondary, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>Question {interviewStep + 1}</div>
            <h2 className="ic-question" style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, margin: 0, fontFamily: "Inter, sans-serif" }}>{interviewSession.questions[interviewStep].question}</h2>
          </div>

          <div style={{ borderRadius: 16, padding: 1, background: `linear-gradient(135deg, ${C.primary}50, ${C.secondary}30)`, boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
            <div className="ic-terminal" style={{ backgroundColor: C.surfaceLow, borderRadius: 15, padding: 24, minHeight: 200, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: C.secondary, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 14 }}>
                INPUT TERMINAL
              </div>
              <textarea
                className="ic-textarea"
                placeholder="Type your response here..."
                value={interviewCurrentAnswer}
                onChange={(e) => setInterviewCurrentAnswer(e.target.value)}
                disabled={loadingInterviewRespond}
                style={{ flex: 1, minHeight: 160, width: "100%", backgroundColor: "transparent", border: "none", outline: "none", resize: "none", fontSize: 16, lineHeight: 1.75, color: C.text, fontFamily: "Inter, sans-serif" }}
              />
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12, fontSize: 10, color: `${C.textMuted}60`, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                Words: {interviewWordCount}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <motion.button
              onClick={onSubmit}
              disabled={loadingInterviewRespond || !interviewCurrentAnswer.trim()}
              whileHover={(!loadingInterviewRespond && interviewCurrentAnswer.trim()) ? { scale: 1.02, boxShadow: "0 10px 30px rgba(21,101,192,0.45)" } : {}}
              whileTap={(!loadingInterviewRespond && interviewCurrentAnswer.trim()) ? { scale: 0.97 } : {}}
              style={{ padding: "14px 36px", borderRadius: 10, border: "none", background: cyberGrad, color: "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: (loadingInterviewRespond || !interviewCurrentAnswer.trim()) ? "not-allowed" : "pointer", fontFamily: "Manrope, sans-serif", boxShadow: "0 8px 24px rgba(21,101,192,0.35)", opacity: (loadingInterviewRespond || !interviewCurrentAnswer.trim()) ? 0.5 : 1 }}
            >
              {loadingInterviewRespond ? "Evaluating..." : interviewStep === INTERVIEW_QUESTIONS - 1 ? "Finish Interview" : "Submit Answer"}
            </motion.button>
          </div>
        </div>
      )}

      {/* Completed state */}
      {interviewComplete && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}
        >
          {interviewOverallScore !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                style={{ width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle, ${getScoreBg(interviewOverallScore)}, transparent)`, border: `2px solid ${getScoreColor(interviewOverallScore)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <span style={{ fontSize: 20, fontWeight: 900, color: getScoreColor(interviewOverallScore) }}>{interviewOverallScore}</span>
              </motion.div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 4 }}>Overall Score</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: getScoreColor(interviewOverallScore) }}>{interviewOverallScore} <span style={{ fontSize: 14, color: C.textMuted, fontWeight: 400 }}>/ 10</span></div>
              </div>
            </div>
          )}

          {interviewDebrief && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ padding: "20px 24px", borderRadius: 14, backgroundColor: C.surface, borderLeft: `4px solid ${C.primary}` }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.secondary, fontFamily: "Manrope, sans-serif", marginBottom: 12 }}>Full Debrief</div>
              <p style={{ fontSize: 15, color: C.text, lineHeight: 1.75, margin: 0 }}>{interviewDebrief}</p>
            </motion.div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {!interviewDebrief && !loadingDebrief && (
              <motion.button onClick={onDebrief} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: cyberGrad, color: "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "Manrope, sans-serif", boxShadow: "0 6px 20px rgba(21,101,192,0.3)" }}>
                Get Full Debrief
              </motion.button>
            )}
            {loadingDebrief && <p style={{ fontSize: 13, color: C.textMuted, alignSelf: "center", margin: 0 }}>Generating debrief...</p>}
            <motion.button onClick={() => setInterviewAnswersRevealed(v => !v)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "12px 24px", borderRadius: 10, border: `2px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}>
              {interviewAnswersRevealed ? "Hide Ideal Answers" : "Show Ideal Answers"}
            </motion.button>
            <motion.button onClick={onNewInterview} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "12px 24px", borderRadius: 10, border: `2px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}>
              New Interview
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function MiniAvatar({ user, size = 22 }) {
  const initials = (user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "?").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      background: cyberGrad, display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 8px rgba(21,101,192,0.3)",
    }}>
      {user?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ color: "#fff", fontSize: size * 0.48, fontWeight: 800, fontFamily: "Inter, sans-serif" }}>{initials}</span>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const router    = useRouter();
  const { user, isSignedIn } = useUser();
  const { openSignIn, openSignUp } = useAuthModal();
  const { isPaid } = usePaidStatus();
  const price      = usePrice();
  const handleUpgrade = useUpgrade();
  const viewport = useStableViewport();
  const fullHeight = toViewportCssValue(viewport.height);

  // Mobile state
  const [isMobile,    setIsMobile]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [navOpen,     setNavOpen]     = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Config state
  const [mode,         setMode]         = useState("question");
  const [difficulty,   setDifficulty]   = useState("Medium");
  const [category,     setCategory]     = useState("All");
  const [mathOn,       setMathOn]       = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  // OTG is question-mode-only — don't surface it for interview mode.
  const availableDifficulties = mode === "question" ? QUESTION_DIFFICULTIES : DIFFICULTIES;
  // Switching into interview mode while OTG is selected would send an invalid
  // difficulty to the interview API, so silently bump it back to Medium.
  const handleModeChange = (next) => {
    setMode(next);
    if (next === "interview" && difficulty === "OTG") setDifficulty("Medium");
  };

  // Question state
  const [question,        setQuestion]        = useState("");
  const [answer,          setAnswer]          = useState("");
  const [userAnswer,      setUserAnswer]      = useState("");
  const [feedback,        setFeedback]        = useState("");
  const [score,           setScore]           = useState(null);
  const [graded,          setGraded]          = useState(false);
  const [answerRevealed,  setAnswerRevealed]  = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingAnswer,   setLoadingAnswer]   = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [streamProgress,  setStreamProgress]  = useState(0);
  const [questionsUsed,   setQuestionsUsed]   = useState(null);
  const answerRef = useRef(answer);
  const profileCardRef = useRef(null);
  useEffect(() => { answerRef.current = answer; }, [answer]);

  // Interview state
  const [interviewProgress,        setInterviewProgress]        = useState(0);
  const [interviewSession,         setInterviewSession]         = useState(null);
  const [interviewStep,            setInterviewStep]            = useState(0);
  const [interviewUserAnswers,     setInterviewUserAnswers]     = useState([]);
  const [interviewResponses,       setInterviewResponses]       = useState([]);
  const [interviewCurrentAnswer,   setInterviewCurrentAnswer]   = useState("");
  const [loadingInterviewGenerate, setLoadingInterviewGenerate] = useState(false);
  const [loadingInterviewRespond,  setLoadingInterviewRespond]  = useState(false);
  const [interviewComplete,        setInterviewComplete]        = useState(false);
  const [interviewDebrief,         setInterviewDebrief]         = useState(null);
  const [loadingDebrief,           setLoadingDebrief]           = useState(false);
  const [interviewAnswersRevealed, setInterviewAnswersRevealed] = useState(false);

  // Snapshot of settings at question generation time (so toggling controls doesn't affect displayed badges)
  const [snapshotCategory,     setSnapshotCategory]     = useState(null);
  const [snapshotDifficulty,   setSnapshotDifficulty]   = useState(null);
  const [snapshotMath,         setSnapshotMath]         = useState(null);
  const [snapshotCustomPrompt, setSnapshotCustomPrompt] = useState(null);

  // Timer state
  const [timerOn,       setTimerOn]       = useState(false);
  const [timerDuration, setTimerDuration] = useState(120);
  const [runningDuration, setRunningDuration] = useState(null);
  const [timeLeft,      setTimeLeft]      = useState(null);
  const [timerPaused,   setTimerPaused]   = useState(false);
  const timerIntervalRef  = useRef(null);
  const timerDurationRef  = useRef(120);
  useEffect(() => { timerDurationRef.current = timerDuration; }, [timerDuration]);

  const runInterval = () => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || isNaN(prev) || prev <= 1) { clearInterval(timerIntervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };
  const startTimer = (dur) => {
    // resolve duration: explicit arg → ref → state → hardcoded fallback
    const raw = (typeof dur === "number" && !isNaN(dur) && dur > 0) ? dur
              : (typeof timerDurationRef.current === "number" && !isNaN(timerDurationRef.current) && timerDurationRef.current > 0) ? timerDurationRef.current
              : timerDuration;
    const d = (typeof raw === "number" && !isNaN(raw) && raw > 0) ? raw : 120;
    setTimerPaused(false);
    setTimeLeft(d);
    setRunningDuration(d);
    runInterval();
  };
  const pauseTimer  = () => { clearInterval(timerIntervalRef.current); setTimerPaused(true); };
  const resumeTimer = () => { setTimerPaused(false); runInterval(); };
  const stopTimer   = () => { clearInterval(timerIntervalRef.current); setTimeLeft(null); setRunningDuration(null); setTimerPaused(false); };
  useEffect(() => () => clearInterval(timerIntervalRef.current), []);

  // Session stats
  const [sessionScores, setSessionScores] = useState([]);
  const [sessionCount,  setSessionCount]  = useState(0);

  const wordCount          = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;
  const interviewWordCount = interviewCurrentAnswer.trim() ? interviewCurrentAnswer.trim().split(/\s+/).length : 0;
  const mathParam          = mathOn ? "With Math" : "No Math";

  const getScoreColor = (s) => s >= 8 ? C.success : s >= 5 ? C.warn : C.danger;
  const getScoreBg    = (s) => s >= 8 ? "rgba(34,197,94,0.1)" : s >= 5 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";

  const sessionAvgScore = sessionScores.length > 0 ? Math.round((sessionScores.reduce((a,b) => a+b, 0) / sessionScores.length) * 10) / 10 : null;
  const readiness       = sessionAvgScore !== null ? Math.round((sessionAvgScore / 10) * 100) : 0;

  const saveQuestion      = (q) => { const h = JSON.parse(localStorage.getItem("questionHistory") || "[]"); h.push({ question: q, timestamp: Date.now() }); localStorage.setItem("questionHistory", JSON.stringify(h)); };
  const wasRecentlyAsked  = (q) => { const h = JSON.parse(localStorage.getItem("questionHistory") || "[]"); const ago = Date.now() - 864e5; return h.some(x => x.question === q && x.timestamp > ago); };

  const resetQuestion = () => { stopTimer(); setTimerPaused(false); setQuestion(""); setAnswer(""); setUserAnswer(""); setFeedback(""); setScore(null); setGraded(false); setAnswerRevealed(false); setStreamProgress(0); };

  // ─── Question handlers ───────────────────────────────────────────────────
  const getQuestion = async () => {
    resetQuestion();
    // Snapshot current settings so badge display is frozen for this question
    setSnapshotCategory(category);
    setSnapshotDifficulty(difficulty);
    setSnapshotMath(mathOn ? "With Math" : "No Math");
    setSnapshotCustomPrompt(difficulty === "OTG" ? null : (customPrompt.trim() || null));
    setLoadingQuestion(true);
    const EST = difficulty === "OTG" ? 80 : difficulty === "Easy" ? 150 : difficulty === "Hard" ? 350 : 250;
    try {
      const res = await fetch("/api/question", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "question", category, difficulty, math: mathParam, customPrompt: customPrompt || undefined, userId: user?.id, stream: true }) });
      if (res.status === 403) { const d = await res.json(); if (d.limitReached) { setQuestion("You've reached your 5 free questions for today. Upgrade to Premium for unlimited questions."); setLoadingQuestion(false); return; } }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let txt = ""; let used = null;
      while (true) { const { done, value } = await reader.read(); if (done) break; for (const line of dec.decode(value, { stream: true }).split("\n")) { if (!line.startsWith("data:")) continue; try { const d = JSON.parse(line.slice(5)); if (d.questionsUsed !== undefined) used = d.questionsUsed; if (d.text) { txt = d.text; setStreamProgress(Math.min(txt.length / EST, 0.95)); } } catch {} } }
      if (used !== null) setQuestionsUsed(used);
      let newQ = wasRecentlyAsked(txt) ? null : txt; let attempts = 1;
      while (!newQ && attempts < 5) { const r = await fetch("/api/question", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "question", category, difficulty, math: mathParam, customPrompt: customPrompt || undefined, userId: user?.id }) }); const d = await r.json(); if (d.limitReached) { setQuestion("You've reached your 5 free questions for today. Upgrade to Premium for unlimited questions."); setLoadingQuestion(false); return; } if (d.questionsUsed !== undefined) setQuestionsUsed(d.questionsUsed); if (!wasRecentlyAsked(d.result)) newQ = d.result; attempts++; }
      if (newQ) { saveQuestion(newQ); fetch("/api/question", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "answer", question: newQ, category, difficulty, math: mathParam, customPrompt: customPrompt || undefined, userId: user?.id }) }).then(r => r.json()).then(d => setAnswer(d.result)); }
      await new Promise(r => setTimeout(r, 600));
      setQuestion(newQ || "You've seen all recent questions in this category! Try a different one.");
    } catch (e) { console.error(e); }
    setLoadingQuestion(false);
    setSessionCount(c => c + 1);
  };

  const getAnswer = async () => { setAnswerRevealed(true); if (answer) return; setLoadingAnswer(true); try { const r = await fetch("/api/question", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "answer", question, category, difficulty, math: mathParam, customPrompt: customPrompt || undefined, userId: user?.id }) }); const d = await r.json(); setAnswer(curr => curr || d.result); } catch (e) { console.error(e); } setLoadingAnswer(false); };

  const handleGrade = async () => { setLoadingFeedback(true); try { const r = await fetch("/api/grade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, userAnswer, userId: user?.id }) }); const d = await r.json(); setFeedback(d.feedback); setScore(d.score ?? null); setGraded(true); if (d.score !== null) setSessionScores(p => [...p, d.score]); if (user?.id) await fetch("/api/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, entry: { question, answer: answerRef.current, userAnswer: userAnswer.trim() || "No answer submitted.", feedback: d.feedback, score: d.score ?? null, category, difficulty, math: mathParam, customPrompt: customPrompt || null, timeTaken: (timerOn && timeLeft !== null && runningDuration !== null) ? runningDuration - timeLeft : null, timestamp: Date.now() } }) }); } catch (e) { console.error(e); } setLoadingFeedback(false); };

  // ─── Interview handlers ──────────────────────────────────────────────────
  const resetInterview = () => { setInterviewSession(null); setInterviewStep(0); setInterviewUserAnswers([]); setInterviewResponses([]); setInterviewCurrentAnswer(""); setInterviewComplete(false); setInterviewDebrief(null); setInterviewAnswersRevealed(false); setInterviewProgress(0); };

  const generateInterview = async () => { if (!isPaid) { handleUpgrade(); return; } resetInterview(); resetQuestion(); setLoadingInterviewGenerate(true); const t0 = Date.now(); const pi = setInterval(() => setInterviewProgress(Math.min((Date.now()-t0)/8000, 0.9)), 50); try { const r = await fetch("/api/interview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate", category, difficulty, math: mathParam, customPrompt: customPrompt || null }) }); const d = await r.json(); clearInterval(pi); setInterviewProgress(1); await new Promise(r => setTimeout(r, 600)); setInterviewSession(d); } catch (e) { console.error(e); clearInterval(pi); } setLoadingInterviewGenerate(false); setSessionCount(c => c + 1); };

  const handleInterviewSubmit = async () => { if (!interviewSession) return; setLoadingInterviewRespond(true); const si = interviewStep; const q = interviewSession.questions[si]; const isLast = si === INTERVIEW_QUESTIONS - 1; const submitted = interviewCurrentAnswer; try { const r = await fetch("/api/interview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "respond", scenario: interviewSession.scenario, questionIndex: si, question: q.question, idealAnswer: q.idealAnswer, userAnswer: submitted, isLast }) }); const d = await r.json(); const newA = [...interviewUserAnswers, submitted.trim() || "No answer submitted."]; const newR = [...interviewResponses, d]; setInterviewUserAnswers(newA); setInterviewResponses(newR); setInterviewCurrentAnswer(""); if (d.score !== null) setSessionScores(p => [...p, d.score]); if (isLast) { setInterviewComplete(true); if (user?.id) { const qh = interviewSession.questions.map((q,i) => ({ question: q.question, idealAnswer: q.idealAnswer, userAnswer: newA[i] || "No answer submitted.", score: newR[i]?.score ?? null, feedback: newR[i]?.response || "" })); const scores = qh.map(q => q.score).filter(s => s !== null); const overall = scores.length > 0 ? Math.round((scores.reduce((a,b)=>a+b,0)/scores.length)*10)/10 : null; await fetch("/api/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, entry: { type: "interview", scenario: interviewSession.scenario, questions: qh, score: overall, category: interviewSession.resolvedCategory || category, difficulty, math: mathParam, customPrompt: customPrompt || null, timestamp: Date.now() } }) }); } } else { setInterviewStep(si + 1); } } catch (e) { console.error(e); } setLoadingInterviewRespond(false); };

  const handleInterviewDebrief = async () => { if (!interviewSession) return; setLoadingDebrief(true); try { const r = await fetch("/api/interview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "debrief", scenario: interviewSession.scenario, questions: interviewSession.questions.map((q,i) => ({ question: q.question, idealAnswer: q.idealAnswer, userAnswer: interviewUserAnswers[i] || "No answer submitted.", score: interviewResponses[i]?.score ?? null })), category, difficulty }) }); const d = await r.json(); setInterviewDebrief(d.feedback); } catch (e) { console.error(e); } setLoadingDebrief(false); };

  const handleManageSub = async () => { if (!user?.id) return; const r = await fetch("/api/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, returnPath: router.asPath }) }); const d = await r.json(); if (d.url) window.location.href = d.url; };
  const toggleProfilePanel = () => {
    if (isSignedIn) {
      router.push("/account");
      return;
    }
    openSignIn({ redirectTo: "/account" });
  };

  const isLoading = loadingQuestion || loadingInterviewGenerate;
  const interviewOverallScore = interviewResponses.length > 0 ? Math.round((interviewResponses.reduce((a,r) => a+(r.score??0),0)/interviewResponses.length)*10)/10 : null;

  return (
    <div style={{ display: "flex", height: fullHeight, overflow: "hidden", backgroundColor: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}>

      {/* ── Sidebar (desktop only) ── */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 220, flexShrink: 0, height: fullHeight, backgroundColor: C.surfaceLow, borderRight: `1px solid ${C.border}`, display: isMobile ? "none" : "flex", flexDirection: "column", zIndex: 50, overflowY: "auto" }}
      >
        {/* Brand */}
        <div style={{ padding: "28px 24px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.img
              src={isPaid ? "/Fite_Premium_NB.png" : "/favicon.png"}
              alt="logo"
              onClick={() => router.push("/")}
              whileTap={{ scale: 0.95 }}
              style={{ height: 36, width: 36, cursor: "pointer", borderRadius: 6 }}
            />
            <div>
              <motion.div
                onClick={() => router.push("/")}
                whileTap={{ scale: 0.95 }}
                style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, cursor: "pointer", display: "inline-block" }}
              >
                <span style={{ color: C.primary }}>Fite</span>{" "}
                <span style={{ color: C.secondary }}>Finance</span>
                {isPaid && <span style={{ color: C.gold, fontWeight: 900, marginLeft: 2 }}>+</span>}
              </motion.div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: C.textMuted, marginTop: 3, opacity: 0.55, fontFamily: "Manrope, sans-serif" }}>
                Practice Studio
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "0 10px" }}>
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", padding: "0 14px", marginBottom: 6, opacity: 0.4 }}>Main Navigation</div>
            <NavItem icon="home" label="Home" onClick={() => router.push("/")} />
            <NavItem icon="featured_play_list" label="Features" onClick={() => router.push("/features")} />
            <NavItem icon="dashboard" label="Dashboard" active />
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid rgba(21,101,192,0.06)` }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", padding: "0 14px", marginBottom: 6, opacity: 0.4 }}>Account</div>
            <NavItem icon="history" label="History" onClick={() => isPaid ? router.push("/history") : null} muted={!isPaid} />
            <NavItem icon="bar_chart" label="Stats" onClick={() => isPaid ? router.push("/stats") : null} muted={!isPaid} />
            {isPaid
              ? <NavItem icon="credit_card" label="Manage Plan" onClick={handleManageSub} />
              : <NavItem icon="workspace_premium" label="Upgrade" onClick={handleUpgrade} gold />
            }
            <NavItem icon="forum" label="Submit Feedback" onClick={() => isSignedIn ? router.push("/feedback") : null} muted={!isSignedIn} />
            <NavItem icon="how_to_vote" label="Vote" onClick={() => isPaid ? router.push("/feature-vote") : null} muted={!isPaid} />
          </div>
        </nav>

        {/* Session Intel */}
        <SessionIntel compact count={sessionCount} avgScore={sessionAvgScore} readiness={readiness} />

        {/* User section */}
        <div style={{ padding: "14px 14px 20px" }}>
          <motion.div
            ref={profileCardRef}
            role="button"
            tabIndex={0}
            onClick={toggleProfilePanel}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleProfilePanel();
              }
            }}
            whileHover={{ background: "rgba(21,101,192,0.14)", borderColor: `rgba(79,195,247,0.3)` }}
            style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(21,101,192,0.06)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s, border-color 0.15s", cursor: "pointer", userSelect: "none" }}
          >
            {isSignedIn ? (
              <div
                aria-hidden
                style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", background: cyberGrad, boxShadow: "0 2px 10px rgba(21,101,192,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "Inter, sans-serif" }}>
                    {(user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "?").toUpperCase()}
                  </span>
                )}
              </div>
            ) : (
              <div onClick={(e) => e.stopPropagation()}>
                <UserMenu size={32} />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.text }}>
                {user?.firstName || "User"}
              </div>
              <div style={{ fontSize: 10, color: C.gold, marginTop: 1, fontWeight: 600 }}>
                {isPaid ? "Premium" : "Free Plan"}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.aside>

      {/* ── Right side ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: fullHeight, overflow: "hidden" }}>

        {/* Top bar */}
        <motion.header
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ flexShrink: 0, height: isMobile ? 56 : 72, display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 16px" : "0 36px", backgroundColor: `${C.bg}dd`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, zIndex: 40 }}
        >
          {/* Left: brand (mobile) or live indicator (desktop) */}
          {isMobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.img
                src={isPaid ? "/Fite_Premium_NB.png" : "/favicon.png"}
                alt="logo"
                onClick={() => router.push("/")}
                whileTap={{ scale: 0.95 }}
                style={{ height: 30, width: 30, cursor: "pointer", borderRadius: 5 }}
              />
              <motion.div
                onClick={() => router.push("/")}
                whileTap={{ scale: 0.95 }}
                style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, cursor: "pointer" }}
              >
                <span style={{ color: C.primary }}>Fite</span>{" "}
                <span style={{ color: C.secondary }}>Finance</span>
                {isPaid && <span style={{ color: C.gold, fontWeight: 900, marginLeft: 2 }}>+</span>}
              </motion.div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textMuted, opacity: 0.55, fontFamily: "Manrope, sans-serif" }}>
                {mode === "interview" ? "Interview" : "Practice"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(21,101,192,0.1)", borderRadius: 999, border: `1px solid rgba(21,101,192,0.2)` }}>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.secondary, display: "inline-block" }}
              />
              <span style={{ fontSize: 10, fontWeight: 900, color: C.secondary, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                Live: FITE_GPT_V2
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isPaid && !isMobile && (
              <motion.button onClick={handleUpgrade} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ padding: "8px 18px", borderRadius: 999, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #f5d06a, #c9a84c)", color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", boxShadow: "0 4px 16px rgba(201,168,76,0.4)" }}>
                Upgrade
              </motion.button>
            )}
            {!isSignedIn && !isMobile && (
              <>
                <motion.button onClick={() => openSignIn()} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid rgba(79,195,247,0.4)`, background: "rgba(79,195,247,0.08)", color: C.secondary, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "Manrope, sans-serif", cursor: "pointer" }}>
                  Sign In
                </motion.button>
                <motion.button onClick={() => openSignUp()} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: "8px 16px", borderRadius: 999, border: "none", background: cyberGrad, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "Manrope, sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(21,101,192,0.4)" }}>
                  Sign Up
                </motion.button>
              </>
            )}
            {/* Mobile: nav + config buttons */}
            {isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                {/* Config button */}
                <motion.button
                  onClick={() => setDrawerOpen(true)}
                  whileTap={{ scale: 0.92 }}
                  style={{ height: 36, padding: "0 10px", borderRadius: 9, border: `1px solid ${C.border}`, background: "rgba(21,101,192,0.12)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Icon name="tune" size={16} style={{ color: C.secondary }} />
                  <span className="db-config-label" style={{ fontSize: 10, fontWeight: 900, color: C.secondary, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>Config</span>
                </motion.button>
                {/* Home nav dropdown */}
                <div style={{ position: "relative" }}>
                  <motion.button
                    onClick={() => setNavOpen(v => !v)}
                    whileTap={{ scale: 0.92 }}
                    style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${C.border}`, background: navOpen ? "rgba(21,101,192,0.18)" : "rgba(21,101,192,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Icon name="home" size={18} style={{ color: navOpen ? C.secondary : C.textMuted }} />
                  </motion.button>
                  <AnimatePresence>
                    {navOpen && (
                      <>
                        <motion.div
                          key="nav-backdrop"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setNavOpen(false)}
                          style={{ position: "fixed", inset: 0, zIndex: 500 }}
                        />
                        <motion.div
                          key="nav-dropdown"
                          initial={{ opacity: 0, y: -6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 600, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px", minWidth: 150, boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}
                        >
                          {[["home", "Home", "/"], ["info", "Features", "/features"]].map(([icon, label, href]) => (
                            <motion.button
                              key={href}
                              onClick={() => { setNavOpen(false); router.push(href); }}
                              whileTap={{ scale: 0.96 }}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: C.text, fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif", textAlign: "left" }}
                            >
                              <Icon name={icon} size={16} style={{ color: C.secondary }} />
                              {label}
                            </motion.button>
                          ))}
                          {isPaid && (
                            <>
                              <div style={{ height: 1, background: C.border, margin: "4px 6px" }} />
                              <motion.button
                                onClick={() => { setNavOpen(false); handleManageSub(); }}
                                whileTap={{ scale: 0.96 }}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: C.text, fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif", textAlign: "left" }}
                              >
                                <Icon name="credit_card" size={16} style={{ color: C.gold }} />
                                Manage Plan
                              </motion.button>
                            </>
                          )}
                          <div style={{ height: 1, background: C.border, margin: "4px 6px" }} />
                          <motion.button
                            onClick={() => { if (!isSignedIn) return; setNavOpen(false); router.push("/feedback"); }}
                            whileTap={isSignedIn ? { scale: 0.96 } : undefined}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", cursor: isSignedIn ? "pointer" : "default", color: isSignedIn ? C.text : `${C.textMuted}55`, fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif", textAlign: "left" }}
                          >
                            <Icon name="forum" size={16} style={{ color: isSignedIn ? C.secondary : `${C.textMuted}55` }} />
                            Submit Feedback
                          </motion.button>
                          <motion.button
                            onClick={() => { if (!isPaid) return; setNavOpen(false); router.push("/feature-vote"); }}
                            whileTap={isPaid ? { scale: 0.96 } : undefined}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", cursor: isPaid ? "pointer" : "default", color: isPaid ? C.text : `${C.textMuted}55`, fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif", textAlign: "left" }}
                          >
                            <Icon name="how_to_vote" size={16} style={{ color: isPaid ? C.secondary : `${C.textMuted}55` }} />
                            Vote
                          </motion.button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </motion.header>

        {/* Main body: control panel + canvas */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── Control Panel (desktop only; mobile uses drawer) ── */}
          <motion.section
            className="hide-scrollbar"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: 300, flexShrink: 0, display: isMobile ? "none" : "flex", flexDirection: "column", backgroundColor: C.surfaceLow, borderRight: `1px solid ${C.border}`, overflowY: "auto" }}
          >
            <div style={{ flex: 1, padding: "24px 18px", display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Mode toggle */}
              <div>
                <ControlLabel>Simulation Mode</ControlLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, padding: 4, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
                  {[["question","Question"],["interview","Interview"]].map(([m, lbl]) => (
                    <motion.button key={m} onClick={() => handleModeChange(m)} whileTap={{ scale: 0.96 }}
                      style={{ padding: "10px 0", fontSize: 11, fontWeight: 900, borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "Manrope, sans-serif", letterSpacing: "0.04em", transition: "all 0.2s", backgroundColor: mode === m ? C.primary : "transparent", color: mode === m ? "#fff" : C.textMuted, boxShadow: mode === m ? "0 4px 12px rgba(21,101,192,0.35)" : "none" }}>
                      {lbl}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <ControlLabel>Difficulty Level</ControlLabel>
                <div style={{ display: "flex", gap: 7 }}>
                  {availableDifficulties.map(d => {
                    const isOTG = d === "OTG";
                    const active = difficulty === d;
                    return (
                      <motion.button key={d} onClick={() => setDifficulty(d)} whileTap={{ scale: 0.92 }}
                        style={{ position: "relative", flex: 1, padding: "9px 0", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 8, cursor: "pointer", fontFamily: "Manrope, sans-serif", transition: "all 0.2s", background: active ? cyberGrad : "transparent", color: active ? "#fff" : C.textMuted, border: active ? "none" : `1px solid ${C.border}`, boxShadow: active ? "0 4px 14px rgba(21,101,192,0.35)" : "none" }}>
                        {d}
                        {isOTG && <OtgInfoBadge active={active} />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div>
                <ControlLabel>Focus Category</ControlLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {CATEGORIES.map(cat => (
                    <motion.button key={cat} onClick={() => setCategory(cat)} whileTap={{ scale: 0.94 }}
                      style={{ padding: "9px 8px", fontSize: 10, fontWeight: 800, textAlign: "left", borderRadius: 9, cursor: "pointer", fontFamily: "Manrope, sans-serif", letterSpacing: "0.02em", textTransform: "uppercase", transition: "all 0.18s", backgroundColor: category === cat ? "rgba(21,101,192,0.15)" : C.surface, color: category === cat ? C.secondary : C.textMuted, border: category === cat ? `1px solid ${C.borderActive}` : `1px solid ${C.border}`, lineHeight: 1.3 }}>
                      {CATEGORY_LABELS[cat] || cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Math toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Manrope, sans-serif" }}>Include Math</span>
                <ToggleSwitch checked={mathOn} onClick={() => setMathOn(v => !v)} />
              </div>

              {/* Timer toggle */}
              <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${isPaid ? C.border : "rgba(201,168,76,0.2)"}`, overflow: "hidden", opacity: isPaid ? 1 : 0.7 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Manrope, sans-serif" }}>
                    Timer{!isPaid && <span style={{ fontSize: 9, marginLeft: 6, color: C.gold }}> — Premium</span>}
                  </span>
                  <ToggleSwitch
                    checked={isPaid && timerOn}
                    onClick={() => { if (!isPaid) { handleUpgrade(); return; } const next = !timerOn; setTimerOn(next); if (!next) stopTimer(); }}
                    disabled={!isPaid}
                  />
                </div>
                {isPaid && timerOn && (
                  <div style={{ padding: "0 12px 12px", display: "flex", gap: 6 }}>
                    {TIMER_PRESETS.map(sec => (
                      <motion.button key={sec}
                        onClick={() => { setTimerDuration(sec); timerDurationRef.current = sec; }}
                        whileTap={{ scale: 0.93 }}
                        style={{ flex: 1, padding: "5px 0", borderRadius: 7, border: `1px solid ${timerDuration === sec ? C.secondary : C.border}`, background: timerDuration === sec ? "rgba(79,195,247,0.1)" : "transparent", color: timerDuration === sec ? C.secondary : C.textMuted, fontSize: 10, fontWeight: 700, fontFamily: "Manrope, sans-serif", cursor: "pointer" }}>
                        {sec === 60 ? "1m" : sec === 120 ? "2m" : sec === 180 ? "3m" : "5m"}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom descriptor */}
              <div>
                <ControlLabel>
                  Custom Descriptor
                  {!isPaid && <span style={{ marginLeft: 6, color: C.gold }}> — Premium</span>}
                  {isPaid && difficulty === "OTG" && <span style={{ marginLeft: 6, color: C.textMuted }}> — N/A for OTG</span>}
                </ControlLabel>
                <input
                  type="text"
                  placeholder={difficulty === "OTG" ? "Not available for OTG" : "e.g. focus on LBO Modeling..."}
                  value={difficulty === "OTG" ? "" : customPrompt}
                  onChange={e => isPaid && difficulty !== "OTG" && setCustomPrompt(e.target.value)}
                  disabled={!isPaid || difficulty === "OTG"}
                  style={{ width: "100%", padding: "13px 16px", backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, color: (isPaid && difficulty !== "OTG") ? C.text : `${C.textMuted}50`, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box", cursor: (isPaid && difficulty !== "OTG") ? "text" : "not-allowed", transition: "border-color 0.2s" }}
                />
              </div>

              {/* Generate button */}
              <motion.button
                onClick={mode === "question" ? getQuestion : generateInterview}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, boxShadow: "0 12px 28px rgba(21,101,192,0.5)" } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
                style={{ width: "100%", padding: "16px 0", borderRadius: 12, border: "none", cursor: isLoading ? "not-allowed" : "pointer", background: isLoading ? "rgba(21,101,192,0.25)" : cyberGrad, color: isLoading ? `${C.textMuted}` : "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "Manrope, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: isLoading ? "none" : "0 8px 24px rgba(21,101,192,0.4)", transition: "all 0.2s", opacity: isLoading ? 0.65 : 1 }}
              >
                <Icon name={mode === "interview" ? "groups" : "rocket_launch"} size={18} />
                {isLoading ? "Generating..." : mode === "interview" ? "Generate Interview" : "Generate Question"}
              </motion.button>
            </div>

          </motion.section>

          {/* ── Question Canvas ── */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ flex: 1, overflowY: "auto", backgroundColor: C.bg, position: "relative" }}
          >
            <div className="dashboard-canvas-inner" style={{ maxWidth: 840, margin: "0 auto", padding: isMobile ? "16px 14px 140px" : "40px 44px 120px" }}>
              {mode === "question" ? (
                <QuestionCanvas
                  question={question} answer={answer} userAnswer={userAnswer} setUserAnswer={setUserAnswer}
                  feedback={feedback} score={score} graded={graded} answerRevealed={answerRevealed}
                  loadingQuestion={loadingQuestion} loadingAnswer={loadingAnswer} loadingFeedback={loadingFeedback}
                  streamProgress={streamProgress} wordCount={wordCount} isPaid={isPaid}
                  category={category} difficulty={difficulty} math={mathParam}
                  onGetAnswer={getAnswer} onGrade={handleGrade} onNewQuestion={getQuestion}
                  onUpgrade={handleUpgrade} price={price} questionsUsed={questionsUsed}
                  getScoreColor={getScoreColor} getScoreBg={getScoreBg}
                  timeLeft={timerOn ? timeLeft : null}
                  timerDuration={runningDuration ?? timerDuration} timerPaused={timerPaused}
                  onPauseTimer={pauseTimer} onResumeTimer={resumeTimer}
                  onStartTimer={startTimer} timerOn={timerOn}
                  snapshotCategory={snapshotCategory} snapshotDifficulty={snapshotDifficulty} snapshotMath={snapshotMath}
                  snapshotCustomPrompt={snapshotCustomPrompt}
                />
              ) : (
                <InterviewCanvas
                  loadingInterviewGenerate={loadingInterviewGenerate} interviewProgress={interviewProgress}
                  interviewSession={interviewSession} interviewStep={interviewStep}
                  interviewUserAnswers={interviewUserAnswers} interviewResponses={interviewResponses}
                  interviewCurrentAnswer={interviewCurrentAnswer} setInterviewCurrentAnswer={setInterviewCurrentAnswer}
                  interviewComplete={interviewComplete} interviewDebrief={interviewDebrief}
                  loadingDebrief={loadingDebrief} loadingInterviewRespond={loadingInterviewRespond}
                  interviewAnswersRevealed={interviewAnswersRevealed} setInterviewAnswersRevealed={setInterviewAnswersRevealed}
                  interviewOverallScore={interviewOverallScore} interviewWordCount={interviewWordCount}
                  isPaid={isPaid} onSubmit={handleInterviewSubmit} onDebrief={handleInterviewDebrief}
                  onNewInterview={generateInterview} onUpgrade={handleUpgrade}
                  getScoreColor={getScoreColor} getScoreBg={getScoreBg}
                />
              )}
            </div>

            {/* Mobile footer — sits inside scroll area below content */}
            {isMobile && (
              <div style={{ padding: "24px 16px 90px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px 28px", borderTop: `1px solid ${C.border}`, marginTop: 32 }}>
                {[["Privacy","/privacy"],["Terms","/terms"],["Refunds","/refunds"],["Support","mailto:support@fitefinance.com"]].map(([lbl, href]) => (
                  <Link key={lbl} href={href} style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textMuted, textDecoration: "none", fontFamily: "Manrope, sans-serif" }}>
                    {lbl}
                  </Link>
                ))}
              </div>
            )}

            {/* Ambient glow */}
            <div style={{ position: "fixed", bottom: 0, right: 0, width: 500, height: 500, background: "rgba(21,101,192,0.07)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none", transform: "translate(30%, 30%)", zIndex: 0 }} />
          </motion.section>
        </div>

        {/* Footer — desktop only; mobile footer lives inside the scroll canvas */}
        <footer style={{ flexShrink: 0, padding: "10px 44px", backgroundColor: `${C.surfaceLow}ee`, backdropFilter: "blur(12px)", borderTop: `1px solid ${C.border}`, display: isMobile ? "none" : "flex", justifyContent: "center", gap: 36 }}>
          {[["Privacy","/privacy"],["Terms","/terms"],["Refunds","/refunds"],["Support","mailto:support@fitefinance.com"]].map(([lbl, href]) => (
            <Link key={lbl} href={href} style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textMuted, textDecoration: "none", fontFamily: "Manrope, sans-serif", transition: "color 0.18s" }}>
              {lbl}
            </Link>
          ))}
        </footer>
      </div>

      {/* ── Mobile Floating Generate FAB ── */}
      {isMobile && !drawerOpen && (
        <motion.button
          onClick={() => mode === "question" ? getQuestion() : generateInterview()}
          disabled={isLoading}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.3 }}
          whileTap={!isLoading ? { scale: 0.94 } : {}}
          style={{ position: "fixed", bottom: 80, right: 16, zIndex: 190, height: 52, padding: "0 20px", borderRadius: 26, border: "none", cursor: isLoading ? "not-allowed" : "pointer", background: isLoading ? "rgba(21,101,192,0.4)" : cyberGrad, color: "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "Manrope, sans-serif", display: "flex", alignItems: "center", gap: 8, boxShadow: isLoading ? "0 4px 14px rgba(21,101,192,0.25)" : "0 10px 30px rgba(21,101,192,0.55)", opacity: isLoading ? 0.75 : 1 }}
        >
          <Icon name={mode === "interview" ? "groups" : "rocket_launch"} size={18} />
          {isLoading ? "Generating..." : mode === "interview" ? "New Interview" : "Generate"}
        </motion.button>
      )}

      {/* ── Mobile Bottom Nav ── */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 64, backgroundColor: C.surfaceLow, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", zIndex: 200, backdropFilter: "blur(16px)" }}>

          {/* History */}
          <motion.button
            onClick={() => isPaid ? router.push("/history") : null}
            whileTap={{ scale: 0.88 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: isPaid ? "pointer" : "default", padding: "6px 12px", borderRadius: 10 }}
          >
            <Icon name="history" size={22} style={{ color: isPaid ? C.textMuted : `${C.textMuted}40` }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: isPaid ? C.textMuted : `${C.textMuted}40`, fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>History</span>
          </motion.button>

          {/* Stats */}
          <motion.button
            onClick={() => isPaid ? router.push("/stats") : null}
            whileTap={{ scale: 0.88 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: isPaid ? "pointer" : "default", padding: "6px 12px", borderRadius: 10 }}
          >
            <Icon name="bar_chart" size={22} style={{ color: isPaid ? C.textMuted : `${C.textMuted}40` }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: isPaid ? C.textMuted : `${C.textMuted}40`, fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Stats</span>
          </motion.button>

          {/* Upgrade — free signed-in users only */}
          {isSignedIn && !isPaid && (
            <motion.button
              onClick={handleUpgrade}
              whileTap={{ scale: 0.88 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 10 }}
            >
              <Icon name="workspace_premium" size={22} style={{ color: C.gold }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: C.gold, fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Upgrade</span>
            </motion.button>
          )}

          {/* Account / Sign In */}
          {!isSignedIn ? (
            <motion.button
              onClick={() => openSignIn()}
              whileTap={{ scale: 0.88 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 10 }}
            >
              <Icon name="login" size={22} style={{ color: C.secondary }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: C.secondary, fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sign In</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => { if (isSignedIn) router.push("/account"); }}
              whileTap={{ scale: 0.88 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 10 }}
            >
              <MiniAvatar user={user} size={22} />
              <span style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Account</span>
            </motion.button>
          )}

        </div>
      )}

      {/* ── Mobile Settings Drawer ── */}
      <AnimatePresence>
        {isMobile && drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 300 }}
            />
            {/* Drawer */}
            <motion.div
              key="drawer-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderRadius: "20px 20px 0 0", zIndex: 400, maxHeight: "88vh", display: "flex", flexDirection: "column" }}
            >
              {/* Sticky header — always visible, never scrolls away */}
              <div style={{ flexShrink: 0, borderRadius: "20px 20px 0 0", backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
                  <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: `${C.textMuted}40` }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 20px 14px" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>Session Config</span>
                  <motion.button onClick={() => setDrawerOpen(false)} whileTap={{ scale: 0.88 }}
                    style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surfaceHigh, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="close" size={20} style={{ color: C.text }} />
                  </motion.button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Mode toggle */}
                <div>
                  <ControlLabel>Simulation Mode</ControlLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, padding: 4, background: C.surfaceLow, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    {[["question","Question"],["interview","Interview"]].map(([m, lbl]) => (
                      <motion.button key={m} onClick={() => handleModeChange(m)} whileTap={{ scale: 0.96 }}
                        style={{ padding: "12px 0", fontSize: 12, fontWeight: 900, borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "Manrope, sans-serif", letterSpacing: "0.04em", transition: "all 0.2s", backgroundColor: mode === m ? C.primary : "transparent", color: mode === m ? "#fff" : C.textMuted, boxShadow: mode === m ? "0 4px 12px rgba(21,101,192,0.35)" : "none" }}>
                        {lbl}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <ControlLabel>Difficulty Level</ControlLabel>
                  <div style={{ display: "flex", gap: 8 }}>
                    {availableDifficulties.map(d => {
                      const isOTG = d === "OTG";
                      const active = difficulty === d;
                      return (
                        <motion.button key={d} onClick={() => setDifficulty(d)} whileTap={{ scale: 0.92 }}
                          style={{ position: "relative", flex: 1, padding: "11px 0", fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 8, cursor: "pointer", fontFamily: "Manrope, sans-serif", transition: "all 0.2s", background: active ? cyberGrad : "transparent", color: active ? "#fff" : C.textMuted, border: active ? "none" : `1px solid ${C.border}`, boxShadow: active ? "0 4px 14px rgba(21,101,192,0.35)" : "none" }}>
                          {d}
                          {isOTG && <OtgInfoBadge active={active} />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <ControlLabel>Focus Category</ControlLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    {CATEGORIES.map(cat => (
                      <motion.button key={cat} onClick={() => setCategory(cat)} whileTap={{ scale: 0.94 }}
                        style={{ padding: "11px 10px", fontSize: 11, fontWeight: 800, textAlign: "left", borderRadius: 9, cursor: "pointer", fontFamily: "Manrope, sans-serif", letterSpacing: "0.02em", textTransform: "uppercase", transition: "all 0.18s", backgroundColor: category === cat ? "rgba(21,101,192,0.15)" : C.surfaceLow, color: category === cat ? C.secondary : C.textMuted, border: category === cat ? `1px solid ${C.borderActive}` : `1px solid ${C.border}`, lineHeight: 1.3 }}>
                        {CATEGORY_LABELS[cat] || cat}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Math toggle */}
                <div>
                  <ControlLabel>Math</ControlLabel>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: C.surfaceLow, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Manrope, sans-serif" }}>Include Math</span>
                    <ToggleSwitch checked={mathOn} onClick={() => setMathOn(v => !v)} />
                  </div>
                </div>

                {/* Timer — wrapped with ControlLabel like other sections so it is unmistakable */}
                <div>
                  <ControlLabel>
                    Practice Timer
                    {!isPaid && <span style={{ marginLeft: 6, color: C.gold }}> — Premium</span>}
                  </ControlLabel>
                  <div style={{ background: isPaid ? C.surfaceLow : "rgba(201,168,76,0.08)", borderRadius: 12, border: `1px solid ${isPaid ? C.border : "rgba(201,168,76,0.45)"}`, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Manrope, sans-serif", color: C.text }}>
                          {isPaid ? (timerOn ? "Timer On" : "Timer Off") : "Locked"}
                        </div>
                        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Manrope, sans-serif", marginTop: 4 }}>
                          {isPaid && timerOn ? `Current: ${timerDuration === 60 ? "1 minute" : timerDuration === 120 ? "2 minutes" : timerDuration === 180 ? "3 minutes" : "5 minutes"}` : isPaid ? "" : "Upgrade to enable"}
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={isPaid && timerOn}
                        onClick={() => { if (!isPaid) { handleUpgrade(); return; } const next = !timerOn; setTimerOn(next); if (!next) stopTimer(); }}
                        disabled={!isPaid}
                      />
                    </div>
                  {isPaid && timerOn && (
                    <div style={{ padding: "0 12px 12px", display: "flex", gap: 6 }}>
                      {TIMER_PRESETS.map(sec => (
                        <motion.button key={sec}
                          onClick={() => { setTimerDuration(sec); timerDurationRef.current = sec; }}
                          whileTap={{ scale: 0.93 }}
                          style={{ flex: 1, padding: "6px 0", borderRadius: 7, border: `1px solid ${timerDuration === sec ? C.secondary : C.border}`, background: timerDuration === sec ? "rgba(79,195,247,0.1)" : "transparent", color: timerDuration === sec ? C.secondary : C.textMuted, fontSize: 11, fontWeight: 700, fontFamily: "Manrope, sans-serif", cursor: "pointer" }}>
                          {sec === 60 ? "1m" : sec === 120 ? "2m" : sec === 180 ? "3m" : "5m"}
                        </motion.button>
                      ))}
                    </div>
                  )}
                  </div>
                </div>

                {/* Custom descriptor */}
                <div>
                  <ControlLabel>
                    Custom Descriptor
                    {!isPaid && <span style={{ marginLeft: 6, color: C.gold }}> — Premium</span>}
                    {isPaid && difficulty === "OTG" && <span style={{ marginLeft: 6, color: C.textMuted }}> — N/A for OTG</span>}
                  </ControlLabel>
                  <input
                    type="text"
                    placeholder={difficulty === "OTG" ? "Not available in OTG mode" : isPaid ? "e.g. LBO Modeling focus..." : "Upgrade to unlock"}
                    value={difficulty === "OTG" ? "" : customPrompt}
                    onChange={e => isPaid && difficulty !== "OTG" && setCustomPrompt(e.target.value)}
                    disabled={!isPaid || difficulty === "OTG"}
                    style={{ width: "100%", padding: "14px 16px", backgroundColor: C.surfaceLow, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: (isPaid && difficulty !== "OTG") ? C.text : `${C.textMuted}50`, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box", cursor: (isPaid && difficulty !== "OTG") ? "text" : "not-allowed" }}
                  />
                </div>

                {/* Upgrade banner (free users) */}
                {!isPaid && (
                  <motion.button onClick={handleUpgrade} whileTap={{ scale: 0.97 }}
                    style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #f5d06a, #c9a84c)", color: "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "Manrope, sans-serif", boxShadow: "0 6px 20px rgba(201,168,76,0.4)" }}>
                    Upgrade to Premium
                  </motion.button>
                )}

                {/* Generate button */}
                <motion.button
                  onClick={() => { setDrawerOpen(false); setTimeout(() => mode === "question" ? getQuestion() : generateInterview(), 100); }}
                  disabled={isLoading}
                  whileTap={!isLoading ? { scale: 0.97 } : {}}
                  style={{ width: "100%", padding: "18px 0", borderRadius: 12, border: "none", cursor: isLoading ? "not-allowed" : "pointer", background: isLoading ? "rgba(21,101,192,0.25)" : cyberGrad, color: isLoading ? C.textMuted : "#fff", fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "Manrope, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: isLoading ? "none" : "0 8px 24px rgba(21,101,192,0.4)", opacity: isLoading ? 0.65 : 1 }}
                >
                  <Icon name={mode === "interview" ? "groups" : "rocket_launch"} size={18} />
                  {isLoading ? "Generating..." : mode === "interview" ? "Generate Interview" : "Generate Question"}
                </motion.button>

                {/* Session Intel */}
                <SessionIntel count={sessionCount} avgScore={sessionAvgScore} readiness={readiness} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dashboard markdown styles */}
      <style jsx global>{`
        .dashboard-markdown p  { font-size: 15px; color: ${C.text}; line-height: 1.75; margin: 4px 0; }
        .dashboard-markdown h1,.dashboard-markdown h2,.dashboard-markdown h3 { font-size: 15px; font-weight: 800; color: ${C.secondary}; margin: 10px 0 4px 0; }
        .dashboard-markdown ul,.dashboard-markdown ol { padding-left: 18px; margin: 4px 0; }
        .dashboard-markdown li { font-size: 14px; color: ${C.text}; line-height: 1.6; margin: 3px 0; }
        .dashboard-markdown strong { color: ${C.secondary}; font-weight: 700; }

        @media (max-width: 339px) {
          .db-config-label { display: none !important; }
        }
        @media (max-width: 767px) {
          /* Tighter question canvas spacing */
          .qc-wrap { gap: 18px !important; }
          .qc-question { font-size: 19px !important; line-height: 1.28 !important; letter-spacing: -0.01em !important; }
          .qc-terminal { padding: 16px 16px !important; min-height: 220px !important; border-radius: 12px !important; }
          .qc-textarea { min-height: 170px !important; font-size: 15px !important; line-height: 1.6 !important; }
          .qc-actions { gap: 8px !important; justify-content: stretch !important; }
          .qc-actions > button { flex: 1 1 auto !important; padding: 12px 14px !important; font-size: 11px !important; letter-spacing: 0.08em !important; }

          /* Interview canvas compactness */
          .ic-wrap { gap: 18px !important; }
          .ic-scenario { padding: 14px 16px !important; border-radius: 12px !important; }
          .ic-scenario-text { font-size: 13px !important; line-height: 1.65 !important; }
          .ic-question { font-size: 17px !important; line-height: 1.35 !important; }
          .ic-terminal { padding: 16px 16px !important; min-height: 170px !important; }
          .ic-textarea { min-height: 140px !important; font-size: 15px !important; }

          /* Dashboard markdown shrinks slightly on mobile */
          .dashboard-markdown p { font-size: 14px !important; line-height: 1.7 !important; }
          .dashboard-markdown li { font-size: 13px !important; }
        }
      `}</style>
    </div>
  );
}

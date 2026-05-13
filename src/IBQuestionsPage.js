import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import usePaidStatus from "./usePaidStatus";
import useUpgrade from "./useUpgrade";
import useStableViewport, { toViewportCssValue } from "./useStableViewport";

const C = {
  bg:             "#020817",
  surface:        "#0d1b2a",
  surfaceHigh:    "#1b263b",
  surfaceLow:     "#0b1120",
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

const DIFF_FILTERS = ["All", "Easy", "Medium", "Hard"];

function Icon({ name, size = 18, style: s = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, verticalAlign: "middle", display: "inline-block", ...s }}
    >
      {name}
    </span>
  );
}

function getScoreColor(score) {
  if (score === null || score === undefined) return C.textMuted;
  if (score >= 8) return C.success;
  if (score >= 5) return C.warn;
  return C.danger;
}

function difficultyColor(d) {
  if (d === "Easy") return C.success;
  if (d === "Medium") return C.secondary;
  if (d === "Hard") return C.danger;
  return C.textMuted;
}

export default function IBQuestionsPage({ initialQuestions = [] }) {
  const { isPaid } = usePaidStatus();
  const upgrade = useUpgrade();
  const viewport = useStableViewport();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);


  // ── Questions (passed from getServerSideProps so the bank never ships in the JS bundle) ──
  const [questions, setQuestions] = useState(initialQuestions);

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const categories = useMemo(() => {
    const set = new Set();
    questions.forEach(q => q.category && set.add(q.category));
    return ["All", ...Array.from(set)];
  }, [questions]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return questions.filter(q => {
      if (categoryFilter !== "All" && q.category !== categoryFilter) return false;
      if (difficultyFilter !== "All" && q.difficulty !== difficultyFilter) return false;
      if (s && !q.question.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [search, categoryFilter, difficultyFilter]);

  // ── Progress (Redis) ──
  const [progress, setProgress] = useState({});
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/history?scope=ib");
        if (!r.ok) return;
        const d = await r.json();
        if (!cancelled) setProgress(d.progress || {});
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setProgressLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveProgress = async (questionId, score) => {
    const timestamp = Date.now();
    const payload = { score: score === undefined ? null : score, timestamp };
    setProgress(prev => ({ ...prev, [questionId]: payload }));
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "ib", questionId, score: payload.score, timestamp }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const completedCount = Object.keys(progress).length;
  const totalCount = questions.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const resetInputRef = useRef(null);

  useEffect(() => {
    if (!resetModalOpen) { setResetConfirmText(""); return; }
    const onKey = (e) => { if (e.key === "Escape") setResetModalOpen(false); };
    window.addEventListener("keydown", onKey);
    setTimeout(() => resetInputRef.current?.focus(), 80);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetModalOpen]);

  const handleReset = async () => {
    if (resetConfirmText !== "CONFIRM") return;
    setResetting(true);
    try {
      await fetch("/api/history?scope=ib", { method: "DELETE" });
      setProgress({});
    } catch (e) {
      console.error(e);
    }
    setResetting(false);
    setResetModalOpen(false);
  };

  const handleShuffle = () => {
    const pool = filtered.filter(q => !progress[q.id]);
    const source = pool.length > 0 ? pool : filtered;
    if (source.length === 0) return;
    const pick = source[Math.floor(Math.random() * source.length)];
    handleSelect(pick.id);
  };

  const handleNext = () => {
    if (filtered.length === 0) return;
    const idx = filtered.findIndex(q => q.id === activeId);
    const next = filtered[(idx + 1) % filtered.length];
    handleSelect(next.id);
  };

  // ── Active question ──
  const [activeId, setActiveId] = useState(null);
  const active = useMemo(
    () => questions.find(q => q.id === activeId) || null,
    [activeId]
  );

  // Per-question local state
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [modelAnswer, setModelAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [graded, setGraded] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);

  const activeIdRef = useRef(null);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  const handleSelect = (id) => {
    if (id === activeId) return;
    setActiveId(id);
    setAnswerRevealed(false);
    setModelAnswer("");
    setUserAnswer("");
    setFeedback("");
    setGraded(false);
    setLoadingAnswer(false);
    setLoadingGrade(false);
    const saved = progress[id];
    setScore(saved && typeof saved.score === "number" ? saved.score : null);
  };

  const handleReveal = async () => {
    if (!active || answerRevealed) return;
    setAnswerRevealed(true);
    if (modelAnswer) return;
    setLoadingAnswer(true);
    const currentId = active.id;
    try {
      const r = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "answer",
          question: active.question,
          category: active.category,
          difficulty: active.difficulty || "Medium",
        }),
      });
      const d = await r.json();
      if (activeIdRef.current === currentId) {
        setModelAnswer(d.result || "");
      }
      if (!progress[currentId]) {
        saveProgress(currentId, null);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingAnswer(false);
  };

  const handleGrade = async () => {
    if (!active || !isPaid || !userAnswer.trim()) return;
    setLoadingGrade(true);
    const currentId = active.id;
    try {
      const r = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: active.question,
          userAnswer: userAnswer.trim(),
          idealAnswer: modelAnswer || null,
        }),
      });
      const d = await r.json();
      if (activeIdRef.current === currentId) {
        setFeedback(d.feedback || "");
        setScore(d.score ?? null);
        setGraded(true);
      }
      if (d.score !== undefined && d.score !== null) {
        saveProgress(currentId, d.score);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingGrade(false);
  };

  // ── Render: list item ──
  const renderListItem = (q) => {
    const saved = progress[q.id];
    const isActive = q.id === activeId;
    const numIdx = questions.findIndex(x => x.id === q.id) + 1;
    const numStr = `#${String(numIdx).padStart(3, "0")}`;
    const completed = !!saved;
    return (
      <motion.button
        key={q.id}
        onClick={() => handleSelect(q.id)}
        whileHover={{ x: 2 }}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "12px 14px",
          marginBottom: 8,
          borderRadius: 10,
          background: isActive ? "rgba(21,101,192,0.18)" : C.surface,
          border: `1px solid ${isActive ? C.borderActive : C.border}`,
          cursor: "pointer",
          color: C.text,
          display: "block",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: C.textMuted, fontFamily: "Manrope, sans-serif", letterSpacing: "0.1em" }}>{numStr}</span>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: "rgba(79,195,247,0.12)", color: C.secondary, fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{q.category}</span>
          {q.difficulty && (
            <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: `${difficultyColor(q.difficulty)}1f`, color: difficultyColor(q.difficulty), fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{q.difficulty}</span>
          )}
          {completed && (
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: getScoreColor(saved.score), fontFamily: "Manrope, sans-serif" }}>
              <Icon name="check_circle" size={14} style={{ color: C.success }} />
              {typeof saved.score === "number" ? `${saved.score}/10` : "✓"}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: isActive ? C.text : C.textMuted, lineHeight: 1.45, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", userSelect: "none", WebkitUserSelect: "none" }}>
          {q.question}
        </div>
      </motion.button>
    );
  };

  // ── Render: active question panel ──
  const renderActivePanel = () => {
    if (!active) {
      return (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 20, padding: 40, textAlign: "center" }}
        >
          <Icon name="quiz" size={40} style={{ color: C.border, display: "block" }} />
          <div style={{ color: C.textMuted, fontSize: 15, fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
            Select a question from the list,<br />or shuffle to a random one.
          </div>
          <motion.button
            onClick={handleShuffle}
            disabled={filtered.length === 0}
            whileHover={filtered.length > 0 ? { scale: 1.04 } : {}}
            whileTap={filtered.length > 0 ? { scale: 0.97 } : {}}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 26px",
              borderRadius: 10,
              border: "none",
              background: filtered.length === 0 ? "rgba(21,101,192,0.3)" : cyberGrad,
              color: "#fff",
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: filtered.length === 0 ? "not-allowed" : "pointer",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            <Icon name="shuffle" size={18} /> Shuffle Question
          </motion.button>
        </motion.div>
      );
    }
    return (
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        {/* Question */}
        <div style={{ padding: 22, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: C.textMuted, fontFamily: "Manrope, sans-serif", letterSpacing: "0.12em" }}>
              #{String(questions.findIndex(q => q.id === active.id) + 1).padStart(3, "0")}
            </span>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 6, background: "rgba(79,195,247,0.12)", color: C.secondary, fontFamily: "Manrope, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{active.category}</span>
            {active.difficulty && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 6, background: `${difficultyColor(active.difficulty)}1f`, color: difficultyColor(active.difficulty), fontFamily: "Manrope, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{active.difficulty}</span>
            )}
          </div>
          <div style={{ fontSize: 19, color: C.text, lineHeight: 1.55, fontFamily: "Inter, sans-serif", userSelect: "none", WebkitUserSelect: "none" }}>
            {active.question}
          </div>
        </div>

        {/* Your answer (always visible) */}
        <div style={{ padding: 22, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 10 }}>Your Answer</div>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={isPaid ? "Write your answer here before revealing the model answer…" : "Premium members can submit answers for AI grading."}
            disabled={!isPaid || graded}
            rows={6}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              background: C.surfaceLow,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: 15,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.55,
              resize: "vertical",
              outline: "none",
              opacity: isPaid && !graded ? 1 : 0.6,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Actions row: reveal + grade */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {!answerRevealed && (
            <motion.button
              onClick={handleReveal}
              disabled={loadingAnswer}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: "13px 26px", borderRadius: 10, border: `2px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: loadingAnswer ? "default" : "pointer", fontFamily: "Manrope, sans-serif" }}
            >
              {loadingAnswer ? "Loading…" : "Reveal Model Answer"}
            </motion.button>
          )}
          {isPaid ? (
            <motion.button
              onClick={handleGrade}
              disabled={loadingGrade || !userAnswer.trim() || graded}
              whileHover={!loadingGrade && !graded && userAnswer.trim() ? { scale: 1.02 } : {}}
              whileTap={!loadingGrade && !graded && userAnswer.trim() ? { scale: 0.97 } : {}}
              style={{
                padding: "13px 28px",
                borderRadius: 10,
                border: "none",
                background: (loadingGrade || !userAnswer.trim() || graded) ? "rgba(21,101,192,0.4)" : cyberGrad,
                color: "#fff",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                cursor: (loadingGrade || !userAnswer.trim() || graded) ? "not-allowed" : "pointer",
                fontFamily: "Manrope, sans-serif",
                opacity: (!userAnswer.trim() && !graded) ? 0.5 : 1,
              }}
            >
              {loadingGrade ? "Grading…" : graded ? "Graded ✓" : "Grade My Answer"}
            </motion.button>
          ) : (
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(201,168,76,0.08)", border: `1px solid rgba(201,168,76,0.3)`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Icon name="workspace_premium" size={18} style={{ color: C.gold }} />
              <span style={{ fontSize: 12, color: C.gold, fontFamily: "Manrope, sans-serif", fontWeight: 700 }}>AI grading is Premium-only.</span>
              <motion.button
                onClick={upgrade}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.gold, color: "#0b0b0b", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}
              >
                Upgrade
              </motion.button>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        <AnimatePresence>
          {loadingAnswer && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: 22, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}
            >
              <style>{`
                @keyframes ibq-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
                .ibq-skel { background: linear-gradient(90deg, ${C.border}55 25%, ${C.border}cc 50%, ${C.border}55 75%); background-size: 800px 100%; animation: ibq-shimmer 1.4s infinite linear; border-radius: 5px; }
              `}</style>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.secondary, fontFamily: "Manrope, sans-serif", marginBottom: 14, opacity: 0.5 }}>Model Answer</div>
              <div className="ibq-skel" style={{ height: 13, width: "92%", marginBottom: 10 }} />
              <div className="ibq-skel" style={{ height: 13, width: "78%", marginBottom: 10 }} />
              <div className="ibq-skel" style={{ height: 13, width: "85%", marginBottom: 10 }} />
              <div className="ibq-skel" style={{ height: 13, width: "62%" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Model Answer */}
        <AnimatePresence>
          {answerRevealed && modelAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: 22, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, userSelect: "none", WebkitUserSelect: "none" }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.secondary, fontFamily: "Manrope, sans-serif", marginBottom: 12 }}>Model Answer</div>
              <div className="dashboard-markdown">
                <ReactMarkdown>{modelAnswer}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {graded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ padding: 22, borderRadius: 14, background: C.surface, borderLeft: `4px solid ${score !== null ? getScoreColor(score) : C.primary}` }}
            >
              {score !== null && (
                <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${getScoreColor(score)}22`, border: `2px solid ${getScoreColor(score)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: getScoreColor(score) }}>{score}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>Score</div>
                    <div style={{ fontSize: 19, fontWeight: 900, color: getScoreColor(score) }}>
                      {score} <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 400 }}>/ 10</span>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 10 }}>AI Feedback</div>
              <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: 0, fontFamily: "Inter, sans-serif" }}>{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next / Shuffle — shown once answer is revealed */}
        <AnimatePresence>
          {answerRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", gap: 10, paddingTop: 4 }}
            >
              <motion.button
                onClick={handleShuffle}
                disabled={filtered.length === 0}
                whileHover={filtered.length > 0 ? { scale: 1.02 } : {}}
                whileTap={filtered.length > 0 ? { scale: 0.97 } : {}}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "13px 0",
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: "transparent",
                  color: C.textMuted,
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: filtered.length === 0 ? "not-allowed" : "pointer",
                  fontFamily: "Manrope, sans-serif",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderActive; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}
              >
                <Icon name="shuffle" size={16} /> Shuffle
              </motion.button>
              <motion.button
                onClick={handleNext}
                disabled={filtered.length <= 1}
                whileHover={filtered.length > 1 ? { scale: 1.02 } : {}}
                whileTap={filtered.length > 1 ? { scale: 0.97 } : {}}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "13px 0",
                  borderRadius: 10,
                  border: "none",
                  background: cyberGrad,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: filtered.length <= 1 ? "not-allowed" : "pointer",
                  fontFamily: "Manrope, sans-serif",
                  opacity: filtered.length <= 1 ? 0.45 : 1,
                }}
              >
                Next <Icon name="arrow_forward" size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // ── Filter bar ──
  const filterBar = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
      <div style={{ position: "relative" }}>
        <Icon name="search" size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          style={{ width: "100%", padding: "10px 14px 10px 34px", borderRadius: 9, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: `1px solid ${categoryFilter === cat ? C.borderActive : C.border}`,
              background: categoryFilter === cat ? "rgba(21,101,192,0.22)" : "transparent",
              color: categoryFilter === cat ? C.text : C.textMuted,
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "Manrope, sans-serif",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {DIFF_FILTERS.map(d => (
          <button
            key={d}
            onClick={() => setDifficultyFilter(d)}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: `1px solid ${difficultyFilter === d ? C.borderActive : C.border}`,
              background: difficultyFilter === d ? "rgba(21,101,192,0.22)" : "transparent",
              color: difficultyFilter === d ? C.text : C.textMuted,
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "Manrope, sans-serif",
              cursor: "pointer",
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );

  const progressSummary = (
    <div style={{ padding: "14px 14px 12px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: C.textMuted, fontFamily: "Manrope, sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Progress</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: C.text, fontFamily: "Manrope, sans-serif" }}>
            {progressLoaded ? `${completedCount} / ${totalCount}` : "…"}
          </span>
          {progressLoaded && completedCount > 0 && (
            <button
              onClick={() => setResetModalOpen(true)}
              title="Reset all progress"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", opacity: 0.6, transition: "opacity 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = 0.6; }}
            >
              <Icon name="restart_alt" size={16} style={{ color: C.danger }} />
            </button>
          )}
        </div>
      </div>
      <div style={{ height: 4, background: C.surfaceHigh, borderRadius: 2, overflow: "hidden" }}>
        <motion.div
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ height: "100%", background: cyberGrad }}
        />
      </div>
    </div>
  );

  const showListOnMobile = isMobile && !activeId;
  const showPanelOnMobile = isMobile && activeId;

  return (
    <div style={{ minHeight: toViewportCssValue(viewport.height), background: C.bg, color: C.text, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, background: `${C.bg}f2`, borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(8px)" }}>
        {showPanelOnMobile ? (
          <button
            onClick={() => setActiveId(null)}
            style={{ background: "none", border: "none", color: C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Manrope, sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            <Icon name="arrow_back" size={18} /> List
          </button>
        ) : (
          <Link href="/dashboard" style={{ color: C.text, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontFamily: "Manrope, sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <Icon name="arrow_back" size={18} /> Dashboard
          </Link>
        )}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="menu_book" size={20} style={{ color: C.secondary }} />
          <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>IB 400</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left: List */}
        {(!isMobile || showListOnMobile) && (
          <div style={{ width: isMobile ? "100%" : 380, flexShrink: 0, borderRight: isMobile ? "none" : `1px solid ${C.border}`, position: isMobile ? "static" : "sticky", top: 0, height: isMobile ? "auto" : toViewportCssValue(viewport.height), display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {progressSummary}
            <div style={{ padding: "12px 14px 0", flexShrink: 0 }}>
              {filterBar}
            </div>
            <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", padding: "0 14px 24px" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", color: C.textMuted, fontSize: 13 }}>
                  No questions match your filters.
                </div>
              ) : (
                filtered.map(renderListItem)
              )}
            </div>
          </div>
        )}

        {/* Right: Active question */}
        {(!isMobile || showPanelOnMobile) && (
          <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: isMobile ? "18px 16px 40px" : "26px 32px 60px" }}>
            <AnimatePresence mode="wait">
              {renderActivePanel()}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; }
        .ibq-confirm-input::placeholder { color: rgba(148,163,184,0.45); }
        .ibq-confirm-input:focus { border-color: rgba(79,195,247,0.45) !important; outline: none; }
      `}</style>

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {resetModalOpen && (
          <motion.div
            key="reset-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              overflowY: "auto",
              background: "rgba(2, 8, 23, 0.72)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setResetModalOpen(false); }}
          >
            <div
              style={{ display: "flex", minHeight: "100%", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}
              onMouseDown={(e) => { if (e.target === e.currentTarget) setResetModalOpen(false); }}
            >
              <motion.div
                key="reset-modal-card"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: "100%",
                  maxWidth: 420,
                  background: "linear-gradient(145deg, #0d1b2a 0%, #0b1120 100%)",
                  border: "1px solid rgba(21,101,192,0.28)",
                  borderRadius: 18,
                  boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,195,247,0.06)",
                  padding: "30px 28px 28px",
                  position: "relative",
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setResetModalOpen(false)}
                  style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center", padding: 4, borderRadius: 6, opacity: 0.7, transition: "opacity 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = 0.7; }}
                >
                  <Icon name="close" size={20} />
                </button>

                {/* Icon + title */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 22 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${C.danger}18`, border: `1.5px solid ${C.danger}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="restart_alt" size={24} style={{ color: C.danger }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: C.text, fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>Reset All Progress?</div>
                    <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "Inter, sans-serif", lineHeight: 1.55 }}>
                      This will permanently erase your completion status and scores for all {totalCount} questions. This cannot be undone.
                    </div>
                  </div>
                </div>

                {/* CONFIRM input */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 8 }}>
                    Type <span style={{ color: C.danger, letterSpacing: "0.18em" }}>CONFIRM</span> to continue
                  </div>
                  <input
                    ref={resetInputRef}
                    className="ibq-confirm-input"
                    type="text"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleReset(); }}
                    placeholder="CONFIRM"
                    autoComplete="off"
                    spellCheck={false}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: C.surfaceLow,
                      border: `1px solid ${C.border}`,
                      color: C.text,
                      fontSize: 15,
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                  <motion.button
                    onClick={() => setResetModalOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleReset}
                    disabled={resetConfirmText !== "CONFIRM" || resetting}
                    whileHover={resetConfirmText === "CONFIRM" && !resetting ? { scale: 1.02 } : {}}
                    whileTap={resetConfirmText === "CONFIRM" && !resetting ? { scale: 0.97 } : {}}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: 10,
                      border: "none",
                      background: resetConfirmText === "CONFIRM" && !resetting ? C.danger : `${C.danger}40`,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      cursor: resetConfirmText === "CONFIRM" && !resetting ? "pointer" : "not-allowed",
                      fontFamily: "Manrope, sans-serif",
                      transition: "background 0.15s",
                    }}
                  >
                    {resetting ? "Resetting…" : "Reset"}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
        <div key="empty" style={{ padding: 40, color: C.textMuted, textAlign: "center", fontSize: 14, fontFamily: "Inter, sans-serif" }}>
          Select a question from the list to get started.
        </div>
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

        {/* Reveal button */}
        {!answerRevealed && (
          <div>
            <motion.button
              onClick={handleReveal}
              disabled={loadingAnswer}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: "13px 26px", borderRadius: 10, border: `2px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: loadingAnswer ? "default" : "pointer", fontFamily: "Manrope, sans-serif" }}
            >
              {loadingAnswer ? "Loading…" : "Reveal Model Answer"}
            </motion.button>
          </div>
        )}

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

        {/* Your answer + grading */}
        {answerRevealed && (
          <div style={{ padding: 22, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 10 }}>Your Answer</div>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={isPaid ? "Type your answer here for AI grading…" : "Premium members can submit answers for AI grading."}
              disabled={!isPaid}
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
                opacity: isPaid ? 1 : 0.6,
                boxSizing: "border-box",
              }}
            />

            {isPaid ? (
              <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
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
              </div>
            ) : (
              <div style={{ marginTop: 14, padding: 16, borderRadius: 10, background: "rgba(201,168,76,0.08)", border: `1px solid rgba(201,168,76,0.3)`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Icon name="workspace_premium" size={22} style={{ color: C.gold }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: C.gold, fontFamily: "Manrope, sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>AI Grading Locked</div>
                  <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>Upgrade to Premium to submit your written answers and get instant AI feedback and scoring.</div>
                </div>
                <motion.button
                  onClick={upgrade}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{ padding: "11px 20px", borderRadius: 9, border: "none", background: C.gold, color: "#0b0b0b", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}
                >
                  Upgrade
                </motion.button>
              </div>
            )}
          </div>
        )}

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
        <span style={{ fontSize: 12, fontWeight: 900, color: C.text, fontFamily: "Manrope, sans-serif" }}>
          {progressLoaded ? `${completedCount} / ${totalCount}` : "…"}
        </span>
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
    <div style={{ height: toViewportCssValue(viewport), background: C.bg, color: C.text, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
          <div style={{ width: isMobile ? "100%" : 380, borderRight: isMobile ? "none" : `1px solid ${C.border}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {progressSummary}
            <div style={{ padding: "12px 14px 0" }}>
              {filterBar}
            </div>
            <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 14px 24px" }}>
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
      `}</style>
    </div>
  );
}

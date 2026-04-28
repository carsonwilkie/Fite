import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/clerk-react";
import { motion } from "motion/react";
import usePaidStatus from "./usePaidStatus";
import useStableViewport, { toViewportCssValue } from "./useStableViewport";

const C = {
  bg:          "#020817",
  surface:     "#0d1b2a",
  surfaceHigh: "#1b263b",
  surfaceLow:  "#0b1120",
  primary:     "#1565C0",
  secondary:   "#4FC3F7",
  gold:        "#c9a84c",
  text:        "#f8fafc",
  textMuted:   "#94a3b8",
  border:      "rgba(21, 101, 192, 0.18)",
  success:     "#22c55e",
  warn:        "#f59e0b",
  danger:      "#ef4444",
};

const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

function SectionHeader({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: C.text, fontFamily: "Manrope, sans-serif" }}>
        {text}
      </div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${C.border}, transparent)` }} />
    </div>
  );
}

// Keep `label` as alias for backward compat within file
const label = (text) => <SectionHeader text={text} />;

function StatCard({ value, sub, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: "20px 18px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, textAlign: "center" }}
    >
      <div style={{ fontSize: 30, fontWeight: 900, color: accent || C.text, fontFamily: "Inter, sans-serif", lineHeight: 1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, marginTop: 8, fontFamily: "Manrope, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{sub}</div>
    </motion.div>
  );
}

function DayBar({ avg, count, dateLabel, index, maxAvg }) {
  const color = avg >= 8 ? C.success : avg >= 5 ? C.warn : C.danger;
  const pct   = maxAvg > 0 ? (avg / maxAvg) * 100 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
      <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end" }}>
        <motion.div
          key={`${dateLabel}-${avg}`}
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.45, delay: index * 0.025, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", borderRadius: "3px 3px 0 0", background: `linear-gradient(to top, ${color}99, ${color})`, minHeight: 3 }}
        />
      </div>
      <span style={{ fontSize: 8, color: C.textMuted, fontFamily: "Manrope, sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>
        {avg.toFixed(1)}
      </span>
    </div>
  );
}

function CategoryBar({ cat, count, avg }) {
  // Bar represents avg score out of 10 (performance, not volume)
  const pct   = avg !== undefined ? (parseFloat(avg) / 10) * 100 : 0;
  const color = avg !== undefined ? (parseFloat(avg) >= 7 ? C.success : parseFloat(avg) >= 5 ? C.warn : C.danger) : C.textMuted;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 120, fontSize: 11, fontWeight: 700, color: C.textMuted, fontFamily: "Manrope, sans-serif", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat}</div>
      <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: C.surfaceHigh, overflow: "hidden" }}>
        {avg !== undefined ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4 }}
          />
        ) : (
          <div style={{ height: "100%", width: "10%", background: C.border, borderRadius: 4 }} />
        )}
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: avg !== undefined ? color : C.textMuted, width: 38, textAlign: "right", fontFamily: "Manrope, sans-serif" }}>
        {avg !== undefined ? `${avg}/10` : "—"}
      </span>
      <span style={{ fontSize: 10, color: C.textMuted, width: 22, textAlign: "right", fontFamily: "Manrope, sans-serif" }}>{count}q</span>
    </div>
  );
}

export default function StatsPage() {
  const router  = useRouter();
  const { user } = useUser();
  const { isPaid, loading } = usePaidStatus();
  const viewport = useStableViewport();
  const fullHeight = toViewportCssValue(viewport.height);
  const [entries, setEntries]             = useState([]);
  const [loadingData, setLoadingData]     = useState(true);
  const [windowN, setWindowN]             = useState(null); // null = "show all"
  const [hoveredBar, setHoveredBar]       = useState(null);
  const [lastHoveredBar, setLastHoveredBar] = useState(null);
  const [tappedBar, setTappedBar]         = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!isPaid) { router.push("/"); return; }
    if (!user?.id) return;
    fetch(`/api/history?userId=${user.id}`)
      .then(r => r.json())
      .then(d => { setEntries(d.entries || []); setLoadingData(false); });
  }, [user, isPaid, loading, router]);

  // ── Stat calculations ────────────────────────────────────────────────────────
  const totalQuestions  = entries.length;
  const gradedQuestions = entries.filter(e => e.feedback).length;
  const scoredEntries   = entries.filter(e => e.score !== null && e.score !== undefined);
  const averageScore    = scoredEntries.length > 0
    ? (scoredEntries.reduce((s, e) => s + e.score, 0) / scoredEntries.length).toFixed(1)
    : null;
  const bestScore  = scoredEntries.length > 0 ? Math.max(...scoredEntries.map(e => e.score)) : null;
  const worstScore = scoredEntries.length > 0 ? Math.min(...scoredEntries.map(e => e.score)) : null;

  // Streak
  const toKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const dateSet     = new Set(entries.map(e => toKey(new Date(e.timestamp))));
  const sortedDates = [...dateSet].sort();
  let longestStreak = sortedDates.length > 0 ? 1 : 0;
  let streakRun = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = Math.round((new Date(sortedDates[i]) - new Date(sortedDates[i-1])) / 86400000);
    if (diff === 1) { streakRun++; longestStreak = Math.max(longestStreak, streakRun); }
    else streakRun = 1;
  }
  const todayD     = new Date(); todayD.setHours(0,0,0,0);
  const yesterdayD = new Date(todayD); yesterdayD.setDate(yesterdayD.getDate() - 1);
  let currentStreak = 0;
  if (dateSet.has(toKey(todayD)) || dateSet.has(toKey(yesterdayD))) {
    const startD = dateSet.has(toKey(todayD)) ? new Date(todayD) : new Date(yesterdayD);
    for (let i = 0; ; i++) {
      const d = new Date(startD); d.setDate(d.getDate() - i);
      if (dateSet.has(toKey(d))) currentStreak++; else break;
    }
  }

  // Avg per day
  const sorted    = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const daySpan   = entries.length > 1 ? Math.max(1, Math.round((sorted[sorted.length-1].timestamp - sorted[0].timestamp) / 86400000) + 1) : 1;
  const avgPerDay = entries.length > 0 ? (entries.length / daySpan).toFixed(1) : 0;

  // Category breakdown
  const categoryCounts = {};
  entries.forEach(e => { if (e.category) categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1; });
  const maxCatCount = Math.max(...Object.values(categoryCounts), 1);

  // Avg score by category
  const scoreByCategory = {};
  scoredEntries.forEach(e => {
    if (e.category) { if (!scoreByCategory[e.category]) scoreByCategory[e.category] = []; scoreByCategory[e.category].push(e.score); }
  });
  const catRows = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({
      cat, count,
      avg: scoreByCategory[cat]?.length > 0
        ? (scoreByCategory[cat].reduce((s, v) => s + v, 0) / scoreByCategory[cat].length).toFixed(1)
        : undefined,
    }));

  // Difficulty breakdown
  const diffCounts = { Easy: 0, Medium: 0, Hard: 0, OTG: 0 };
  entries.forEach(e => { if (e.difficulty && diffCounts[e.difficulty] !== undefined) diffCounts[e.difficulty]++; });
  const maxDiff = Math.max(...Object.values(diffCounts), 1);

  // ── Chart + trend data ───────────────────────────────────────────────────
  const chartScored    = [...scoredEntries].sort((a, b) => a.timestamp - b.timestamp);
  const maxN           = chartScored.length;
  const effectiveN     = windowN === null ? maxN : windowN;
  const clampedN       = Math.min(effectiveN, maxN);
  const windowBars     = chartScored.slice(-clampedN);

  const windowAvg   = windowBars.length > 0
    ? (windowBars.reduce((s, e) => s + e.score, 0) / windowBars.length).toFixed(1)
    : null;

  // Score trend (fixed half-window comparison)
  const trendN    = Math.min(5, Math.floor(chartScored.length / 2));
  const trendOk   = trendN >= 1 && chartScored.length >= 4;
  const recentAvg = trendOk ? chartScored.slice(-trendN).reduce((s, e) => s + e.score, 0) / trendN : null;
  const priorAvg  = trendOk ? chartScored.slice(-trendN*2, -trendN).reduce((s, e) => s + e.score, 0) / trendN : null;
  const trendPct  = trendOk && priorAvg > 0 ? Math.round(((recentAvg - priorAvg) / priorAvg) * 100) : null;

  const scoreColor = v => v >= 8 ? C.success : v >= 5 ? C.warn : C.danger;

  if (loading || loadingData) {
    return (
      <div style={{ minHeight: fullHeight, backgroundColor: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>Loading stats...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: fullHeight, backgroundColor: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}>

      {/* Top bar */}
      <div className="page-topbar" style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: `${C.bg}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
        <div className="page-topbar-left" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
          <motion.img
            src={isPaid ? "/Fite_Premium_NB.png" : "/favicon.png"}
            alt="logo"
            onClick={() => router.push("/")}
            whileTap={{ scale: 0.95 }}
            style={{ height: 32, width: 32, cursor: "pointer", borderRadius: 6, flexShrink: 0 }}
          />
          <motion.button
            onClick={() => router.push("/dashboard")}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="page-topbar-back"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 13, fontFamily: "Manrope, sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexShrink: 0, padding: 0 }}
          >
            ← Dashboard
          </motion.button>
          <div className="page-topbar-divider" style={{ width: 1, height: 16, backgroundColor: C.border, flexShrink: 0 }} />
          <span className="page-topbar-title" style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: C.text, fontFamily: "Manrope, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Performance Stats</span>
        </div>
        <div className="page-topbar-right" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span className="page-topbar-count" style={{ fontSize: 11, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>{entries.length} entries</span>
          <motion.button
            onClick={() => router.push("/history")}
            whileTap={{ scale: 0.97 }}
            className="page-topbar-cta"
            style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 11, fontWeight: 700, fontFamily: "Manrope, sans-serif", cursor: "pointer", letterSpacing: "0.06em", whiteSpace: "nowrap" }}
          >
            History →
          </motion.button>
        </div>
      </div>

      <div className="stats-content" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>

        {entries.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 8px 0" }}>No data yet</h2>
            <p style={{ fontSize: 14, color: C.textMuted, margin: "0 0 24px 0" }}>Answer and grade some questions to see your performance stats.</p>
            <motion.button onClick={() => router.push("/dashboard")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: cyberGrad, color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "Manrope, sans-serif" }}>
              Go Practice
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* ── Overview cards ── */}
            {label("Overview")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 32 }}>
              <StatCard value={totalQuestions} sub="Total Questions" delay={0} />
              <StatCard value={gradedQuestions} sub="Graded" delay={0.05} />
              <StatCard value={averageScore ? `${averageScore}` : "—"} sub="Avg Score" accent={averageScore ? scoreColor(+averageScore) : undefined} delay={0.1} />
              <StatCard value={bestScore ?? "—"} sub="Best Score" accent={bestScore !== null ? scoreColor(bestScore) : undefined} delay={0.15} />
              <StatCard value={worstScore ?? "—"} sub="Worst Score" accent={worstScore !== null ? scoreColor(worstScore) : undefined} delay={0.2} />
            </div>

            {/* ── Activity ── */}
            {label("Activity")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 32 }}>
              <StatCard value={avgPerDay} sub="Avg / Day" accent={C.secondary} delay={0} />
              <StatCard value={currentStreak} sub="Current Streak" accent={currentStreak > 0 ? C.warn : undefined} delay={0.05} />
              <StatCard value={longestStreak} sub="Best Streak" accent={C.gold} delay={0.1} />
            </div>

            {/* ── Score chart (slider-controlled by # questions) ── */}
            {label("Score History")}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="stats-chart-card"
              style={{ padding: "20px 22px 18px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, marginBottom: 32 }}>

              {maxN < 2 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>
                    Grade at least 2 questions to see your score history.
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontFamily: "Manrope, sans-serif", opacity: 0.6 }}>
                    Answer questions and submit your response for grading.
                  </div>
                </div>
              ) : (
                <>
                  {/* Slider header row */}
                  <div className="stats-chart-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: windowAvg ? scoreColor(+windowAvg) : C.textMuted, lineHeight: 1 }}>
                        {windowAvg ?? "—"}
                        <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 600, marginLeft: 4 }}>/10</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Manrope, sans-serif", marginTop: 4 }}>
                        avg over last {clampedN} question{clampedN !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {/* Slider */}
                    <div className="stats-slider-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 160 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, fontFamily: "Manrope, sans-serif" }}>
                        {clampedN} question{clampedN !== 1 ? "s" : ""}
                      </div>
                      <input
                        className="stats-slider-input"
                        type="range"
                        min={2}
                        max={maxN}
                        step={1}
                        value={clampedN}
                        onChange={e => {
                          const v = +e.target.value;
                          setWindowN(v >= maxN ? null : v);
                        }}
                        style={{ width: 150, accentColor: C.secondary, cursor: "pointer" }}
                      />
                      <div className="stats-slider-ticks" style={{ display: "flex", justifyContent: "space-between", width: 150 }}>
                        <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>2</span>
                        <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>{maxN}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tooltip — collapses to 0 until first hover, then stays open showing last bar */}
                  {(() => {
                    const displayIdx  = hoveredBar !== null ? hoveredBar : lastHoveredBar;
                    const hasHovered  = lastHoveredBar !== null;
                    const he          = displayIdx !== null ? windowBars[displayIdx] : null;
                    const isActive    = hoveredBar !== null;
                    const hcol        = he ? scoreColor(he.score) : C.textMuted;
                    const isInterview = he?.type === "interview";
                    const fmtTime     = s => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${s % 60 > 0 ? ` ${s % 60}s` : ""}`;
                    const dateStr     = he ? new Date(he.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
                    const tags = he ? [
                      isInterview                         ? { label: "Interview",           color: C.gold      } : null,
                      he.category                         ? { label: he.category,          color: null        } : null,
                      he.difficulty                       ? { label: he.difficulty,         color: null        } : null,
                      he.math && he.math !== "No Math"    ? { label: "Math",                color: C.secondary } : null,
                      he.customPrompt                     ? { label: he.customPrompt,       color: C.secondary } : null,
                      he.timeTaken != null                ? { label: fmtTime(he.timeTaken), color: C.textMuted } : null,
                      { label: dateStr, color: null },
                    ].filter(Boolean) : [];
                    return (
                      <motion.div
                        initial={{ height: 0, marginBottom: 0 }}
                        animate={{ height: hasHovered ? 58 : 0, marginBottom: hasHovered ? 12 : 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden", position: "relative", flexShrink: 0 }}
                      >
                        {he && (
                          <motion.div
                            onClick={() => router.push(`/history?highlight=${he.timestamp}`)}
                            style={{ position: "absolute", inset: 0, padding: "10px 12px", borderRadius: 10, backgroundColor: C.surfaceHigh, border: `1px solid ${isActive ? C.borderActive : C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, overflow: "hidden", userSelect: "none", WebkitUserSelect: "none", boxShadow: "none" }}
                            whileHover={{
                              backgroundColor: "#1e2d42",
                              boxShadow: `0 0 0 1px ${C.borderActive}, 0 0 18px rgba(79,195,247,0.18)`,
                            }}
                            whileTap={{ opacity: 0.8 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                          >
                            <div style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${hcol}`, background: `${hcol}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: 11, fontWeight: 900, color: hcol }}>{he.score}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: "0 0 3px 0", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {he.question || ""}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", overflow: "hidden", flexWrap: "nowrap" }}>
                                {tags.map((tag, ti) => (
                                  <span key={ti} style={{ fontSize: 9, fontWeight: 700, color: tag.color || C.textMuted, fontFamily: "Manrope, sans-serif", whiteSpace: "nowrap", flexShrink: ti >= tags.length - 2 ? 1 : 0, overflow: "hidden", textOverflow: "ellipsis", marginRight: 4 }}>
                                    {ti > 0 ? "· " : ""}{tag.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <motion.span
                              style={{ fontSize: 10, color: C.secondary, fontFamily: "Manrope, sans-serif", fontWeight: 700, letterSpacing: "0.04em", flexShrink: 0 }}
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.15 }}
                            >View →</motion.span>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })()}

                  {/* Y-axis + chart bars */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                    {/* Y-axis labels — height matches bar area only */}
                    <div style={{ width: 22, height: 80, position: "relative", flexShrink: 0, marginRight: 4 }}>
                      {[10, 8, 6, 4, 2].map(tick => (
                        <div key={tick} style={{ position: "absolute", right: 0, bottom: `${(tick / 10) * 100}%`, transform: "translateY(50%)", fontSize: 8, color: C.textMuted, fontFamily: "Manrope, sans-serif", fontWeight: 700, lineHeight: 1, userSelect: "none", textAlign: "right" }}>
                          {tick}
                        </div>
                      ))}
                    </div>

                    {/* Bars + gridlines + Q-number labels */}
                    <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
                      <div style={{ position: "relative" }} onMouseLeave={() => { setHoveredBar(null); setTappedBar(null); }}>
                        {/* Gridlines — behind bars, span full content width */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, pointerEvents: "none", zIndex: 0 }}>
                          {[10, 8, 6, 4, 2].map(tick => (
                            <div key={tick} style={{ position: "absolute", left: 0, right: 0, top: `${(1 - tick / 10) * 80}px`, height: 1, background: C.border }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 3, position: "relative", zIndex: 1 }}>
                        {windowBars.map((e, i) => {
                          const qNum  = maxN - clampedN + 1 + i;
                          const pct   = (e.score / 10) * 100;
                          const color = scoreColor(e.score);
                          const isHov = hoveredBar === i;
                          return (
                            <div key={i} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 4 }}>
                              {/* Bar */}
                              <div style={{ height: 80, display: "flex", alignItems: "flex-end" }}>
                                <motion.div
                                  key={`${clampedN}-${i}`}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${pct}%` }}
                                  transition={{ duration: 0.4, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
                                  onMouseEnter={() => { setHoveredBar(i); setLastHoveredBar(i); }}
                                  onClick={() => {
                                    if (tappedBar === i) {
                                      router.push(`/history?highlight=${e.timestamp}`);
                                    } else {
                                      setTappedBar(i);
                                      setHoveredBar(i);
                                      setLastHoveredBar(i);
                                    }
                                  }}
                                  style={{ width: "100%", borderRadius: "2px 2px 0 0", background: isHov ? `linear-gradient(to top, ${color}, ${color}ee)` : `linear-gradient(to top, ${color}88, ${color}cc)`, minHeight: 2, boxShadow: isHov ? `0 0 8px ${color}70` : "none", transition: "background 0.18s, box-shadow 0.18s", cursor: "pointer" }}
                                />
                              </div>
                              {/* Q number */}
                              <div style={{ textAlign: "center", paddingTop: 3 }}>
                                <span style={{ fontSize: 7, color: isHov ? C.secondary : C.textMuted, fontFamily: "Manrope, sans-serif", fontWeight: 700, lineHeight: 1 }}>
                                  {qNum}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* X-axis */}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}`, marginTop: 4, marginLeft: 26 }}>
                    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>
                      Q{maxN - clampedN + 1}
                    </span>
                    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>
                      Q{maxN} (latest)
                    </span>
                  </div>

                  {/* Trend vs prior window */}
                  {trendPct !== null && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 12 }}>
                        Recent Trend
                      </div>
                      <div className="stats-trend-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Prior window */}
                        <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: C.surfaceLow, border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 8, fontWeight: 800, color: C.textMuted, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>
                            Prior · Q{maxN - trendN * 2 + 1}–Q{maxN - trendN}
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(priorAvg), lineHeight: 1 }}>
                            {priorAvg?.toFixed(1)}<span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginLeft: 3 }}>/10</span>
                          </div>
                          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, fontFamily: "Manrope, sans-serif" }}>{trendN} graded questions</div>
                        </div>

                        {/* Arrow */}
                        <div className="stats-trend-arrow" style={{ textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: trendPct >= 0 ? C.success : C.danger, lineHeight: 1 }}>
                            {trendPct >= 0 ? "↑" : "↓"}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: trendPct >= 0 ? C.success : C.danger }}>
                            {Math.abs(trendPct)}%
                          </div>
                        </div>

                        {/* Recent window */}
                        <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: C.surfaceLow, border: `1px solid ${(trendPct >= 0 ? C.success : C.danger)}40` }}>
                          <div style={{ fontSize: 8, fontWeight: 800, color: C.textMuted, fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>
                            Recent · Q{maxN - trendN + 1}–Q{maxN}
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(recentAvg), lineHeight: 1 }}>
                            {recentAvg?.toFixed(1)}<span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginLeft: 3 }}>/10</span>
                          </div>
                          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, fontFamily: "Manrope, sans-serif" }}>{trendN} graded questions</div>
                        </div>
                      </div>

                      <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Manrope, sans-serif", marginTop: 10, lineHeight: 1.55 }}>
                        {trendPct >= 0
                          ? `Your last ${trendN} graded questions averaged ${recentAvg?.toFixed(1)}/10 — up ${Math.abs(trendPct)}% from the ${trendN} before them (avg ${priorAvg?.toFixed(1)}).`
                          : `Your last ${trendN} graded questions averaged ${recentAvg?.toFixed(1)}/10 — down ${Math.abs(trendPct)}% from the ${trendN} before them (avg ${priorAvg?.toFixed(1)}).`
                        }
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* ── Category breakdown ── */}
            {catRows.length > 0 && (
              <>
                {label("By Category")}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  style={{ padding: "20px 22px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {catRows.map((row, i) => (
                    <CategoryBar key={row.cat} cat={row.cat} count={row.count} max={maxCatCount} avg={row.avg} />
                  ))}
                </motion.div>
              </>
            )}

            {/* ── Difficulty breakdown ── */}
            {label("By Difficulty")}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
              {["Easy", "Medium", "Hard", "OTG"].map((d, i) => {
                const scoreRows = scoredEntries.filter(e => e.difficulty === d);
                const avg = scoreRows.length > 0 ? (scoreRows.reduce((s, e) => s + e.score, 0) / scoreRows.length).toFixed(1) : null;
                return (
                  <div key={d} style={{ padding: "20px 14px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: C.text }}>{diffCounts[d]}</div>
                    <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginTop: 6 }}>{d}</div>
                    {avg && <div style={{ fontSize: 13, color: scoreColor(+avg), fontWeight: 800, marginTop: 6, fontFamily: "Manrope, sans-serif" }}>avg {avg}</div>}
                  </div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>

      <style jsx global>{`
        html, body { background: ${C.bg}; }
        .page-topbar { height: 60px; padding: 0 28px; }
        @media (max-width: 720px) {
          .page-topbar {
            height: auto;
            min-height: 54px;
            padding: 10px 14px;
          }
          .page-topbar-left { gap: 10px !important; }
          .page-topbar-back { font-size: 11px !important; }
          .page-topbar-divider { display: none !important; }
          .page-topbar-title {
            font-size: 11px !important;
            letter-spacing: 0.06em !important;
          }
          .page-topbar-count { display: none !important; }
          .page-topbar-cta { padding: 6px 10px !important; font-size: 10px !important; }
          .stats-content { padding: 20px 14px 80px !important; }
          .stats-chart-card { padding: 16px 14px !important; }
          .stats-chart-header { gap: 10px; }
          .stats-slider-wrap { min-width: 110px !important; align-items: flex-end !important; }
          .stats-slider-input { width: 100px !important; }
          .stats-slider-ticks { width: 100px !important; }
          .stats-trend-row { flex-wrap: wrap; gap: 10px !important; }
          .stats-trend-row > div:not(.stats-trend-arrow) { min-width: calc(50% - 26px); }
          .stats-trend-arrow { order: 2; }
        }
      `}</style>
    </div>
  );
}

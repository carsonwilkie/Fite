import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/clerk-react";
import { motion } from "motion/react";
import usePaidStatus from "./usePaidStatus";

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

function label(text) {
  return (
    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 10, opacity: 0.7 }}>
      {text}
    </div>
  );
}

function StatCard({ value, sub, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: "20px 18px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, textAlign: "center" }}
    >
      <div style={{ fontSize: 28, fontWeight: 900, color: accent || C.text, fontFamily: "Inter, sans-serif", lineHeight: 1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, marginTop: 6, fontFamily: "Manrope, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{sub}</div>
    </motion.div>
  );
}

function ScoreBar({ score, index, total }) {
  const color = score >= 8 ? C.success : score >= 5 ? C.warn : C.danger;
  const pct   = (score / 10) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, maxWidth: 28 }}>
      <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end", position: "relative" }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.6, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", borderRadius: "3px 3px 0 0", background: `linear-gradient(to top, ${color}cc, ${color})`, minHeight: 3 }}
        />
      </div>
      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Manrope, sans-serif", fontWeight: 600 }}>{score}</span>
    </div>
  );
}

function CategoryBar({ cat, count, max, avg }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 110, fontSize: 11, fontWeight: 700, color: C.textMuted, fontFamily: "Manrope, sans-serif", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat}</div>
      <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: C.surfaceHigh, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", background: cyberGrad, borderRadius: 4 }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 900, color: C.text, width: 24, textAlign: "right", fontFamily: "Manrope, sans-serif" }}>{count}</span>
      {avg !== undefined && (
        <span style={{ fontSize: 10, color: avg >= 7 ? C.success : avg >= 5 ? C.warn : C.danger, width: 36, textAlign: "right", fontFamily: "Manrope, sans-serif", fontWeight: 700 }}>{avg}/10</span>
      )}
    </div>
  );
}

export default function StatsPage() {
  const router  = useRouter();
  const { user } = useUser();
  const { isPaid, loading } = usePaidStatus();
  const [entries, setEntries]             = useState([]);
  const [loadingData, setLoadingData]     = useState(true);

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
  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  entries.forEach(e => { if (e.difficulty && diffCounts[e.difficulty] !== undefined) diffCounts[e.difficulty]++; });
  const maxDiff = Math.max(...Object.values(diffCounts), 1);

  // Score trend
  const chartScored = [...scoredEntries].sort((a, b) => a.timestamp - b.timestamp);
  const recentChart = chartScored.slice(-20);
  const trendN = Math.min(5, Math.floor(chartScored.length / 2));
  const trendOk = trendN >= 1 && chartScored.length >= 4;
  const recentAvg = trendOk ? chartScored.slice(-trendN).reduce((s, e) => s + e.score, 0) / trendN : null;
  const priorAvg  = trendOk ? chartScored.slice(-trendN*2, -trendN).reduce((s, e) => s + e.score, 0) / trendN : null;
  const trendPct  = trendOk && priorAvg > 0 ? Math.round(((recentAvg - priorAvg) / priorAvg) * 100) : null;

  const scoreColor = v => v >= 8 ? C.success : v >= 5 ? C.warn : C.danger;

  if (loading || loadingData) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>Loading stats...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}>

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", backgroundColor: `${C.bg}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <motion.button
            onClick={() => router.push("/dashboard")}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 13, fontFamily: "Manrope, sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
          >
            ← Dashboard
          </motion.button>
          <div style={{ width: 1, height: 16, backgroundColor: C.border }} />
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: C.secondary, fontFamily: "Manrope, sans-serif" }}>Performance Stats</span>
        </div>
        <motion.button
          onClick={() => router.push("/history")}
          whileTap={{ scale: 0.97 }}
          style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 11, fontWeight: 700, fontFamily: "Manrope, sans-serif", cursor: "pointer", letterSpacing: "0.06em" }}
        >
          View History →
        </motion.button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>

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
            <div style={{ marginBottom: 28 }}>{label("Overview")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 32 }}>
              <StatCard value={totalQuestions} sub="Total Questions" delay={0} />
              <StatCard value={gradedQuestions} sub="Graded" delay={0.05} />
              <StatCard value={averageScore ? `${averageScore}` : "—"} sub="Avg Score" accent={averageScore ? scoreColor(+averageScore) : undefined} delay={0.1} />
              <StatCard value={bestScore ?? "—"} sub="Best Score" accent={bestScore !== null ? scoreColor(bestScore) : undefined} delay={0.15} />
              <StatCard value={worstScore ?? "—"} sub="Worst Score" accent={worstScore !== null ? scoreColor(worstScore) : undefined} delay={0.2} />
            </div>

            {/* ── Activity ── */}
            <div style={{ marginBottom: 28 }}>{label("Activity")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 32 }}>
              <StatCard value={avgPerDay} sub="Avg / Day" accent={C.secondary} delay={0} />
              <StatCard value={currentStreak} sub="Current Streak" accent={currentStreak > 0 ? C.warn : undefined} delay={0.05} />
              <StatCard value={longestStreak} sub="Best Streak" accent={C.gold} delay={0.1} />
            </div>

            {/* ── Score trend ── */}
            {trendPct !== null && (
              <>
                <div style={{ marginBottom: 12 }}>{label("Score Trend")}</div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ padding: "18px 22px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: trendPct >= 0 ? C.success : C.danger }}>
                    {trendPct >= 0 ? "↑" : "↓"} {Math.abs(trendPct)}%
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      {trendPct >= 0 ? "Improving" : "Declining"} over last {trendN} questions
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3, fontFamily: "Manrope, sans-serif" }}>
                      Recent avg: {recentAvg?.toFixed(1)} vs prior avg: {priorAvg?.toFixed(1)}
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {/* ── Score chart ── */}
            {recentChart.length > 1 && (
              <>
                <div style={{ marginBottom: 12 }}>{label(`Score History (last ${recentChart.length})`)}</div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  style={{ padding: "20px 18px 12px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, paddingBottom: 8 }}>
                    {recentChart.map((e, i) => <ScoreBar key={i} score={e.score} index={i} total={recentChart.length} />)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                    {[0, 2, 4, 6, 8, 10].map(v => (
                      <span key={v} style={{ fontSize: 9, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>{v}</span>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {/* ── Category breakdown ── */}
            {catRows.length > 0 && (
              <>
                <div style={{ marginBottom: 12 }}>{label("By Category")}</div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  style={{ padding: "20px 22px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {catRows.map((row, i) => (
                    <CategoryBar key={row.cat} cat={row.cat} count={row.count} max={maxCatCount} avg={row.avg} />
                  ))}
                </motion.div>
              </>
            )}

            {/* ── Difficulty breakdown ── */}
            <div style={{ marginBottom: 12 }}>{label("By Difficulty")}</div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
              {["Easy", "Medium", "Hard"].map((d, i) => {
                const scoreRows = scoredEntries.filter(e => e.difficulty === d);
                const avg = scoreRows.length > 0 ? (scoreRows.reduce((s, e) => s + e.score, 0) / scoreRows.length).toFixed(1) : null;
                return (
                  <div key={d} style={{ padding: "18px 14px", borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: C.text }}>{diffCounts[d]}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted, fontFamily: "Manrope, sans-serif", marginTop: 4 }}>{d}</div>
                    {avg && <div style={{ fontSize: 12, color: scoreColor(+avg), fontWeight: 700, marginTop: 6 }}>avg {avg}</div>}
                  </div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>

      <style jsx global>{`
        html, body { background: ${C.bg}; }
      `}</style>
    </div>
  );
}

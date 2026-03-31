import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { useUser } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown";
import usePaidStatus from "./usePaidStatus";
import { CATEGORIES } from "./constants";
import "./App.css";
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function History() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isPaid, loading } = usePaidStatus();
  const [entries, setEntries] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedMath, setSelectedMath] = useState("");
  const [statsOpen, setStatsOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [scoreRange, setScoreRange] = useState(null);
  const [sliderPos, setSliderPos] = useState(null);
  const [openDates, setOpenDates] = useState({});
  const [barTooltip, setBarTooltip] = useState(null); // { i, entry, leftPx, barHeightPx }
  const tooltipTimerRef = useRef(null);
  const chartAreaRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!isPaid) {
      navigate("/");
      return;
    }
    if (!user?.id) return;

    fetch(`/api/history?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setLoadingHistory(false);
      });
  }, [user, isPaid, loading, navigate]);

  const getDateStr = (timestamp) => new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  useEffect(() => {
    if (search || selectedCategory || selectedDifficulty || selectedMath) {
      const dates = {};
      entries
        .filter(entry => {
          const searchText = entry.type === "interview" ? (entry.scenario || "") : (entry.question || "");
          const matchesSearch = search === "" || searchText.toLowerCase().includes(search.toLowerCase());
          const matchesCategory = selectedCategory === "" || selectedCategory === "All" || entry.category === selectedCategory;
          const matchesDifficulty = selectedDifficulty === "" || entry.difficulty === selectedDifficulty;
          const matchesMath = selectedMath === "" ||
            (selectedMath === "No Math" && (!entry.math || entry.math === "No Math")) ||
            (selectedMath === "With Math" && entry.math === "With Math");
          return matchesSearch && matchesCategory && matchesDifficulty && matchesMath;
        })
        .forEach(entry => { dates[getDateStr(entry.timestamp)] = true; });
      setOpenDates(dates);
    } else {
      setOpenDates({});
    }
  }, [search, selectedCategory, selectedDifficulty, selectedMath, entries]);

  useEffect(() => {
    if (!questionsOpen) {
      setOpenDates({});
      setExpandedIndex(null);
    }
  }, [questionsOpen]);

  const filteredEntries = entries
    .filter((entry) => {
      const searchText = entry.type === "interview" ? (entry.scenario || "") : (entry.question || "");
      const matchesSearch = search === "" || searchText.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "" || selectedCategory === "All" || entry.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "" || entry.difficulty === selectedDifficulty;
      const matchesMath = selectedMath === "" ||
        (selectedMath === "No Math" && (!entry.math || entry.math === "No Math")) ||
        (selectedMath === "With Math" && entry.math === "With Math");
      return matchesSearch && matchesCategory && matchesDifficulty && matchesMath;
    })
    .sort((a, b) => sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);

  const groupByDate = (entries) => {
    const groups = {};
    entries.forEach((entry) => {
      const date = getDateStr(entry.timestamp);
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return groups;
  };

  const grouped = groupByDate(filteredEntries);

  const filterLabelStyle = { fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: 0 };

  const selectStyle = (active) => ({
    padding: "6px 10px",
    borderRadius: "8px",
    border: "2px solid #e8edf5",
    fontSize: "10px",
    fontWeight: "600",
    color: active ? "#0a2463" : "#4a6fa5",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    outline: "none",
    width: "100%",
  });

  // Stats calculations
  const totalQuestions = entries.length;
  const gradedQuestions = entries.filter(e => e.feedback).length;
  const categoryCounts = {};
  entries.forEach(e => {
    if (e.category) categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });
  const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
  entries.forEach(e => {
    if (e.difficulty && difficultyCounts[e.difficulty] !== undefined) {
      difficultyCounts[e.difficulty]++;
    }
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const scoredEntries = entries.filter(e => e.score !== null && e.score !== undefined);
  const averageScore = scoredEntries.length > 0
    ? (scoredEntries.reduce((sum, e) => sum + e.score, 0) / scoredEntries.length).toFixed(1)
    : null;
  const chartScoredEntries = [...scoredEntries].sort((a, b) => a.timestamp - b.timestamp);
  const chartEntries = scoreRange === null ? chartScoredEntries : chartScoredEntries.slice(-scoreRange);
  const rangeAvg = chartEntries.length > 0
    ? (chartEntries.reduce((sum, e) => sum + e.score, 0) / chartEntries.length).toFixed(1)
    : null;

  // Avg per day
  const sortedByTime = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const daySpan = entries.length > 1
    ? Math.max(1, Math.round((sortedByTime[sortedByTime.length - 1].timestamp - sortedByTime[0].timestamp) / (1000 * 60 * 60 * 24)) + 1)
    : 1;
  const avgPerDay = entries.length > 0 ? (entries.length / daySpan).toFixed(1) : 0;

  // Streak calculations
  const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const dateSet = new Set(entries.map(e => toKey(new Date(e.timestamp))));
  const sortedDates = [...dateSet].sort();
  let longestStreak = sortedDates.length > 0 ? 1 : 0;
  let streakRun = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = Math.round((new Date(sortedDates[i]) - new Date(sortedDates[i-1])) / 86400000);
    if (diff === 1) { streakRun++; longestStreak = Math.max(longestStreak, streakRun); }
    else { streakRun = 1; }
  }
  const todayD = new Date(); todayD.setHours(0,0,0,0);
  const yesterdayD = new Date(todayD); yesterdayD.setDate(yesterdayD.getDate() - 1);
  let currentStreak = 0;
  if (dateSet.has(toKey(todayD)) || dateSet.has(toKey(yesterdayD))) {
    const startD = dateSet.has(toKey(todayD)) ? new Date(todayD) : new Date(yesterdayD);
    for (let i = 0; ; i++) {
      const d = new Date(startD); d.setDate(d.getDate() - i);
      if (dateSet.has(toKey(d))) { currentStreak++; } else { break; }
    }
  }

  // Top difficulty (for highlight)
  const topDifficulty = Object.entries(difficultyCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Best / worst score
  const bestScore = scoredEntries.length > 0 ? Math.max(...scoredEntries.map(e => e.score)) : null;
  const worstScore = scoredEntries.length > 0 ? Math.min(...scoredEntries.map(e => e.score)) : null;

  // Score trend (last N vs prior N, N = min(5, floor(total/2)))
  const trendN = Math.min(5, Math.floor(chartScoredEntries.length / 2));
  const trendAvailable = trendN >= 1 && chartScoredEntries.length >= 4;
  const recentForTrend = chartScoredEntries.slice(-trendN);
  const priorForTrend = chartScoredEntries.slice(-trendN * 2, -trendN);
  const recentTrendAvg = trendAvailable ? recentForTrend.reduce((s, e) => s + e.score, 0) / recentForTrend.length : null;
  const priorTrendAvg = trendAvailable ? priorForTrend.reduce((s, e) => s + e.score, 0) / priorForTrend.length : null;
  const trendPct = trendAvailable && priorTrendAvg > 0
    ? Math.round(((recentTrendAvg - priorTrendAvg) / priorTrendAvg) * 100)
    : null;

  // Personal best score streak (≥7)
  let personalBestStreak = 0;
  let pbRun = 0;
  chartScoredEntries.forEach(e => {
    if (e.score >= 7) { pbRun++; personalBestStreak = Math.max(personalBestStreak, pbRun); }
    else { pbRun = 0; }
  });

  // Avg score by category
  const scoreByCategory = {};
  scoredEntries.forEach(e => {
    if (e.category) {
      if (!scoreByCategory[e.category]) scoreByCategory[e.category] = [];
      scoreByCategory[e.category].push(e.score);
    }
  });
  const avgScoreByCategory = Object.entries(scoreByCategory)
    .map(([cat, scores]) => ({ cat, avg: (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1) }))
    .sort((a, b) => b.avg - a.avg);

  // Avg score by difficulty
  const scoreByDiff = { Easy: [], Medium: [], Hard: [] };
  scoredEntries.forEach(e => { if (e.difficulty && scoreByDiff[e.difficulty]) scoreByDiff[e.difficulty].push(e.score); });
  const avgScoreByDiff = ["Easy", "Medium", "Hard"]
    .filter(d => scoreByDiff[d].length > 0)
    .map(d => ({ diff: d, avg: (scoreByDiff[d].reduce((s, v) => s + v, 0) / scoreByDiff[d].length).toFixed(1) }));

  const getScoreColor = (score) => {
    const s = Math.max(0, Math.min(10, Number(score)));
    if (s <= 5) {
      const t = s / 5;
      return `rgb(${Math.round(220 + 14 * t)},${Math.round(38 + 141 * t)},${Math.round(38 - 30 * t)})`;
    } else {
      const t = (s - 5) / 5;
      return `rgb(${Math.round(234 - 212 * t)},${Math.round(179 - 16 * t)},${Math.round(8 + 66 * t)})`;
    }
  };

  const getScoreBg = (score) => {
    const s = Math.max(0, Math.min(10, Number(score)));
    if (s <= 5) {
      const t = s / 5;
      return `rgb(254,${Math.round(226 + 23 * t)},${Math.round(226 - 31 * t)})`;
    } else {
      const t = (s - 5) / 5;
      return `rgb(${Math.round(254 - 34 * t)},${Math.round(249 + 3 * t)},${Math.round(195 + 36 * t)})`;
    }
  };

  const handleBarClick = (entry, globalIndex) => {
    const dateStr = getDateStr(entry.timestamp);
    setQuestionsOpen(true);
    setOpenDates(prev => ({ ...prev, [dateStr]: true }));
    setExpandedIndex(globalIndex);
    setStatsOpen(false);
    setScoreOpen(false);
    clearTimeout(tooltipTimerRef.current);
    setBarTooltip(null);
    setTimeout(() => {
      document.getElementById(`entry-${globalIndex}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div style={styles.page} className="page-bg page-wrapper">
      <div style={{
        backgroundColor: "#f0f4f8",
        borderRadius: "16px",
        padding: "24px",
        width: "100%",
        maxWidth: "728px",
        boxSizing: "border-box",
        marginBottom: "16px",
        boxShadow: "0 0 40px 10px rgba(0, 0, 0, 0.4)",
      }} className="wrapper-mobile">
        <div style={styles.container}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }} className="header-mobile">
            <img
              src="/Fite_Logo_Premium.png"
              alt="logo"
              style={{ height: "64px", width: "64px", cursor: "pointer" }}
              className="logo-img-mobile"
              onClick={() => navigate("/")}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ ...styles.logo, cursor: "pointer" }} className="logo-mobile" onClick={() => navigate("/")}>Fite Finance</h1>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.8px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  backgroundColor: "#c9a84c",
                  color: "#ffffff",
                }}>
                  PREMIUM
                </span>
              </div>
              <p style={styles.tagline} className="tagline-mobile">The finance site sharpening your interview skills</p>
            </div>
          </div>

          <div style={styles.card} className="card-mobile">
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <button onClick={() => navigate("/")} className="back-btn">← Back</button>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0a2463", margin: 0 }}>Question History</h2>
            </div>

            {!loadingHistory && (
              <>
                {/* Stats — collapsible */}
                <div style={{ borderRadius: "10px", marginBottom: "12px", overflow: "hidden", border: statsOpen ? "1px solid #9db8d9" : "1px solid #e8edf5", boxShadow: statsOpen ? "0 6px 32px rgba(10,36,99,0.33)" : "none", transition: "box-shadow 0.2s, border-color 0.2s" }}>
                  <button
                    onClick={() => setStatsOpen(!statsOpen)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", backgroundColor: "#0a2463", border: "none", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#ffffff", letterSpacing: "1.2px" }}>YOUR STATS</span>
                    <span style={{ fontSize: "11px", color: "#ffffff" }}>{statsOpen ? "▲" : "▼"}</span>
                  </button>
                  <div style={{ display: "grid", gridTemplateRows: statsOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
                    <div style={{ overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#f0f4f8", padding: "16px" }}>
                      {entries.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#4a6fa5", margin: 0, fontStyle: "italic" }}>No history yet — answer some questions to see your stats.</p>
                      ) : (
                        <>
                          <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center", border: "2px solid #c8d4e8" }}>
                              <p style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{totalQuestions}</p>
                              <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Total Questions</p>
                            </div>
                            <div style={{ flex: 1, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center", border: "2px solid #c8d4e8" }}>
                              <p style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{gradedQuestions}</p>
                              <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Graded</p>
                            </div>
                            {topCategory && (
                              <div style={{ flex: 2, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center", border: "2px solid #c8d4e8" }}>
                                <p style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{topCategory[0]}</p>
                                <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Top Category ({topCategory[1]})</p>
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                            {Object.entries(difficultyCounts).map(([diff, count]) => (
                              <div key={diff} style={{ flex: 1, minWidth: "60px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px", textAlign: "center", border: diff === topDifficulty && count > 0 ? "2px solid #c9a84c" : "2px solid #c8d4e8" }}>
                                <p style={{ fontSize: "20px", fontWeight: "700", color: diff === topDifficulty && count > 0 ? "#c9a84c" : "#0a2463", margin: 0 }}>{count}</p>
                                <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>{diff}</p>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                            <div style={{ flex: 1, minWidth: "60px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px", textAlign: "center", border: "2px solid #c8d4e8" }}>
                              <p style={{ fontSize: "20px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{avgPerDay}</p>
                              <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Avg / Day</p>
                            </div>
                            <div style={{ flex: 1, minWidth: "60px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px", textAlign: "center", border: "2px solid #c8d4e8" }}>
                              <p style={{ fontSize: "20px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{currentStreak}</p>
                              <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Current Streak 🔥</p>
                            </div>
                            <div style={{ flex: 1, minWidth: "60px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px", textAlign: "center", border: "2px solid #c8d4e8" }}>
                              <p style={{ fontSize: "20px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{longestStreak}</p>
                              <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Best Streak</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                              <div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <p style={{ fontSize: "12px", color: "#4a6fa5", margin: 0, flexShrink: 0 }}>{cat}</p>
                                <div style={{ flex: 1, borderBottom: "2px dotted #b0bcc8" }} />
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#e8edf5", color: "#0a2463", flexShrink: 0 }}>{count}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    </div>
                  </div>
                </div>

                {/* Score Analysis — collapsible */}
                <div style={{ borderRadius: "10px", marginBottom: "12px", border: scoreOpen ? "1px solid #9db8d9" : "1px solid #e8edf5", boxShadow: scoreOpen ? "0 6px 32px rgba(10,36,99,0.33)" : "none", transition: "box-shadow 0.2s, border-color 0.2s", overflow: "hidden" }}>
                  <button
                    onClick={() => setScoreOpen(!scoreOpen)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", backgroundColor: "#0a2463", border: "none", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#ffffff", letterSpacing: "1.2px" }}>SCORE ANALYSIS</span>
                    <span style={{ fontSize: "11px", color: "#ffffff" }}>{scoreOpen ? "▲" : "▼"}</span>
                  </button>
                  <div style={{ display: "grid", gridTemplateRows: scoreOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
                    <div style={{ overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#f0f4f8", padding: "16px" }}>
                      {scoredEntries.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#4a6fa5", margin: 0, fontStyle: "italic" }}>No graded answers yet — grade some questions to see your score analysis.</p>
                      ) : (
                        <>
                          {/* Overall average */}
                          <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px 16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", border: "2px solid #c8d4e8" }}>
                            <p style={{ fontSize: "13px", fontWeight: "600", color: "#4a6fa5", margin: 0, flexShrink: 0 }}>Overall Average</p>
                            <div style={{ flex: 1, borderBottom: "2px dotted #b0bcc8" }} />
                            <p style={{ fontSize: "22px", fontWeight: "700", color: getScoreColor(averageScore), margin: 0, fontFamily: "monospace", flexShrink: 0 }}>{averageScore} <span style={{ fontSize: "13px", color: "#4a6fa5", fontFamily: "'Segoe UI', sans-serif" }}>/ 10</span></p>
                          </div>

                          {/* Best / Worst score */}
                          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px 16px", border: "2px solid #c8d4e8", textAlign: "center" }}>
                              <p style={{ fontSize: "20px", fontWeight: "700", color: getScoreColor(bestScore), margin: 0, fontFamily: "monospace" }}>{bestScore}</p>
                              <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Best Score</p>
                            </div>
                            <div style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px 16px", border: "2px solid #c8d4e8", textAlign: "center" }}>
                              <p style={{ fontSize: "20px", fontWeight: "700", color: getScoreColor(worstScore), margin: 0, fontFamily: "monospace" }}>{worstScore}</p>
                              <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Worst Score</p>
                            </div>
                          </div>

                          {/* Prompt to grade more when only 1 scored entry */}
                          {chartScoredEntries.length === 1 && (
                            <p style={{ fontSize: "12px", color: "#4a6fa5", margin: "0 0 8px 0", fontStyle: "italic" }}>
                              Grade more questions to unlock score analysis.
                            </p>
                          )}

                          {/* Range section — only shown when 2+ scored entries */}
                          {chartScoredEntries.length > 1 && (() => {
                            const sliderMax = chartScoredEntries.length;
                            const visualVal = sliderPos ?? sliderMax;
                            const fillPct = ((visualVal - 2) / (sliderMax - 2)) * 100;
                            return (
                              <>
                                <div style={{ borderTop: "2.5px solid #b0bcc8", margin: "0 0 16px 0" }} />

                                {/* Range average */}
                                {rangeAvg !== null && (
                                  <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px 16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", border: "2px solid #c8d4e8" }}>
                                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#4a6fa5", margin: 0, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {(() => { const n = scoreRange === null ? chartEntries.length : Math.min(scoreRange, chartEntries.length); return scoreRange === null ? `Average → All ${n} Question${n === 1 ? "" : "s"}` : `Average → Last ${n} Question${n === 1 ? "" : "s"}`; })()}
                                    </p>
                                    <div style={{ flex: 1, minWidth: "8px", borderBottom: "2px dotted #b0bcc8" }} />
                                    <p style={{ fontSize: "22px", fontWeight: "700", color: getScoreColor(rangeAvg), margin: 0, fontFamily: "monospace", flexShrink: 0 }}>{rangeAvg} <span style={{ fontSize: "13px", color: "#4a6fa5", fontFamily: "'Segoe UI', sans-serif" }}>/ 10</span></p>
                                  </div>
                                )}

                                {/* Slider */}
                                <p style={{ fontSize: "11px", fontWeight: "600", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 10px 0", padding: "0 16px" }}>Toggle Average</p>
                                <div style={{ padding: "0 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "14px", fontWeight: "900", color: "#4a6fa5", flexShrink: 0 }}>2</span>
                                  <input
                                    type="range"
                                    min={2}
                                    max={sliderMax}
                                    step={0.01}
                                    value={visualVal}
                                    onChange={(e) => {
                                      const raw = Number(e.target.value);
                                      setSliderPos(raw);
                                      const rounded = Math.round(raw);
                                      setScoreRange(rounded >= sliderMax ? null : rounded);
                                    }}
                                    className="score-range-slider"
                                    style={{ background: `linear-gradient(to right, #0a2463 0%, #0a2463 ${fillPct}%, #e8edf5 ${fillPct}%, #e8edf5 100%)` }}
                                  />
                                  <span style={{ fontSize: "14px", fontWeight: "900", color: "#4a6fa5", flexShrink: 0 }}>{sliderMax}</span>
                                </div>
                                <p style={{ fontSize: "12px", color: "#4a6fa5", margin: "0 0 16px 0", fontStyle: "italic" }}>
                                  {scoreRange === null || scoreRange >= sliderMax
                                    ? `Showing all ${sliderMax} scored questions`
                                    : `Showing last ${scoreRange} of ${sliderMax} scored questions`}
                                </p>
                                </div>
                              </>
                            );
                          })()}

                          {/* Bar chart */}
                          <p style={{ fontSize: "12px", fontWeight: "800", color: "#0a2463", letterSpacing: "1px", margin: "0 0 8px 0" }}>SCORE HISTORY</p>
                          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "2px", flexShrink: 0 }}>
                              {["10", "5", "0"].map(l => <span key={l} style={{ fontSize: "10px", color: "#4a6fa5" }}>{l}</span>)}
                            </div>
                            <div style={{ flex: 1, position: "relative" }}>
                              <div ref={chartAreaRef} style={{ height: "120px", position: "relative", borderBottom: "2px solid #d0d9e8", borderLeft: "2px solid #d0d9e8" }}>
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, borderTop: "1px dashed #e8edf5" }} />
                                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px dashed #e8edf5" }} />
                                <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: "2px", padding: "0 4px" }}>
                                  {chartEntries.map((entry, i) => {
                                    const globalIndex = entries.indexOf(entry);
                                    const isHovered = barTooltip?.i === i;
                                    return (
                                      <div
                                        key={i}
                                        style={{ flex: 1, minWidth: "4px", height: `${(entry.score / 10) * 100}%`, backgroundColor: getScoreColor(entry.score), borderRadius: "2px 2px 0 0", cursor: "pointer", transition: "opacity 0.15s", opacity: isHovered ? 0.75 : 1 }}
                                        onClick={() => handleBarClick(entry, globalIndex)}
                                        onMouseEnter={(e) => {
                                          const barRect = e.currentTarget.getBoundingClientRect();
                                          const areaRect = chartAreaRef.current?.getBoundingClientRect();
                                          const leftPx = barRect.left + barRect.width / 2 - (areaRect?.left ?? 0);
                                          const barHeightPx = (entry.score / 10) * 120;
                                          tooltipTimerRef.current = setTimeout(() => setBarTooltip({ i, entry, leftPx, barHeightPx }), 600);
                                        }}
                                        onMouseLeave={() => {
                                          clearTimeout(tooltipTimerRef.current);
                                          setBarTooltip(null);
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                                {/* Tooltip rendered outside bars so it's never behind a sibling bar */}
                                {barTooltip && (
                                  <div style={{
                                    position: "absolute",
                                    bottom: barTooltip.barHeightPx + 8,
                                    left: barTooltip.leftPx,
                                    transform: "translateX(-50%)",
                                    backgroundColor: "#0a2463",
                                    color: "#ffffff",
                                    borderRadius: "6px",
                                    padding: "8px 10px",
                                    fontSize: "11px",
                                    lineHeight: "1.5",
                                    zIndex: 100,
                                    pointerEvents: "none",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
                                    minWidth: "140px",
                                    maxWidth: "280px",
                                  }}>
                                    <p style={{ margin: "0 0 2px 0", fontWeight: "700", fontSize: "12px" }}>{barTooltip.entry.score}/10</p>
                                    <p style={{ margin: "0 0 4px 0" }}>{barTooltip.entry.category} · {barTooltip.entry.difficulty}{barTooltip.entry.math ? ` · ${barTooltip.entry.math}` : ""}</p>
                                    <p style={{ margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical" }}>{barTooltip.entry.question}</p>
                                  </div>
                                )}
                              </div>
                              {/* X-axis label */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                                <span style={{ fontSize: "10px", color: "#4a6fa5" }}>Oldest</span>
                                <span style={{ fontSize: "11px", color: "#4a6fa5", fontStyle: "italic", textAlign: "center" }}>
                                  {scoreRange === null || scoreRange >= chartScoredEntries.length
                                    ? `All ${chartScoredEntries.length} scored questions`
                                    : `Last ${scoreRange} of ${chartScoredEntries.length} scored questions`}
                                </span>
                                <span style={{ fontSize: "10px", color: "#4a6fa5" }}>Newest</span>
                              </div>
                            </div>
                          </div>

                          {/* Trend + personal best streak */}
                          <div style={{ borderTop: "2.5px solid #b0bcc8", margin: "16px 0 12px 0" }} />
                          {trendPct !== null && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                              <p style={{ fontSize: "12px", color: "#4a6fa5", margin: 0, flexShrink: 0 }}>Current Score Trend</p>
                              <div style={{ flex: 1, borderBottom: "2px dotted #b0bcc8" }} />
                              <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", flexShrink: 0,
                                backgroundColor: trendPct > 0 ? "#dcfce7" : trendPct < 0 ? "#fee2e2" : "#e8edf5",
                                color: trendPct > 0 ? "#16a34a" : trendPct < 0 ? "#dc2626" : "#4a6fa5" }}>
                                {trendPct > 0 ? `↑ +${trendPct}%` : trendPct < 0 ? `↓ ${trendPct}%` : "→ steady"} vs prev {trendN}
                              </span>
                            </div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                            <p style={{ fontSize: "12px", color: "#4a6fa5", margin: 0, flexShrink: 0 }}>Best Streak (≥7)</p>
                            <div style={{ flex: 1, borderBottom: "2px dotted #b0bcc8" }} />
                            <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#e8edf5", color: "#0a2463", flexShrink: 0 }}>
                              {personalBestStreak} in a row
                            </span>
                          </div>

                          {/* By Category */}
                          {avgScoreByCategory.length > 0 && (
                            <>
                              <div style={{ borderTop: "2.5px solid #b0bcc8", margin: "0 0 12px 0" }} />
                              <p style={{ fontSize: "12px", fontWeight: "800", color: "#0a2463", letterSpacing: "1px", margin: "0 0 8px 0" }}>AVERAGES BY CATEGORY</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                                {avgScoreByCategory.map(({ cat, avg }) => (
                                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <p style={{ fontSize: "12px", color: "#4a6fa5", margin: 0, flexShrink: 0 }}>{cat}</p>
                                    <div style={{ flex: 1, borderBottom: "2px dotted #b0bcc8" }} />
                                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: getScoreBg(avg), color: getScoreColor(avg), flexShrink: 0 }}>{avg} / 10</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {/* By Difficulty */}
                          {avgScoreByDiff.length > 0 && (
                            <>
                              <div style={{ borderTop: "2.5px solid #b0bcc8", margin: "0 0 12px 0" }} />
                              <p style={{ fontSize: "12px", fontWeight: "800", color: "#0a2463", letterSpacing: "1px", margin: "0 0 8px 0" }}>AVERAGES BY DIFFICULTY</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {avgScoreByDiff.map(({ diff, avg }) => (
                                  <div key={diff} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <p style={{ fontSize: "12px", color: "#4a6fa5", margin: 0, flexShrink: 0 }}>{diff}</p>
                                    <div style={{ flex: 1, borderBottom: "2px dotted #b0bcc8" }} />
                                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: getScoreBg(avg), color: getScoreColor(avg), flexShrink: 0 }}>{avg} / 10</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Browse Questions — collapsible */}
            <div style={{ borderRadius: "10px", marginBottom: "12px", overflow: "hidden", border: questionsOpen ? "1px solid #9db8d9" : "1px solid #e8edf5", boxShadow: questionsOpen ? "0 6px 32px rgba(10,36,99,0.33)" : "none", transition: "box-shadow 0.2s, border-color 0.2s" }}>
              <button
                onClick={() => setQuestionsOpen(!questionsOpen)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", backgroundColor: "#0a2463", border: "none", cursor: "pointer" }}
              >
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#ffffff", letterSpacing: "1.2px" }}>BROWSE QUESTIONS</span>
                <span style={{ fontSize: "11px", color: "#ffffff" }}>{questionsOpen ? "▲" : "▼"}</span>
              </button>
              <div style={{ display: "grid", gridTemplateRows: questionsOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
                <div style={{ overflow: "hidden" }}>
                <div style={{ backgroundColor: "#f0f4f8", padding: "16px" }}>
                  {loadingHistory ? (
                    <p style={{ color: "#4a6fa5", fontSize: "14px", margin: 0 }}>Loading history...</p>
                  ) : entries.length === 0 ? (
                    <p style={{ color: "#4a6fa5", fontSize: "14px", margin: 0 }}>No history yet — go answer some questions!</p>
                  ) : (
                    <>
                      {/* Search & filter sub-section */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <p style={filterLabelStyle}>SEARCH QUESTIONS</p>
                          <input
                            type="text"
                            placeholder="e.g. walk me through a DCF..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "7px 10px",
                              borderRadius: "8px",
                              border: "2px solid #e8edf5",
                              fontSize: "10px",
                              color: "#1a1a2e",
                              fontFamily: "'Segoe UI', sans-serif",
                              boxSizing: "border-box",
                              outline: "none",
                              backgroundColor: "#ffffff",
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 2, minWidth: "130px" }}>
                            <p style={filterLabelStyle}>CATEGORY</p>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={selectStyle(!!selectedCategory)}>
                              <option value="">All</option>
                              {CATEGORIES.filter(c => c !== "All").map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: "100px" }}>
                            <p style={filterLabelStyle}>DIFFICULTY</p>
                            <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} style={selectStyle(!!selectedDifficulty)}>
                              <option value="">Any</option>
                              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: "100px" }}>
                            <p style={filterLabelStyle}>MATH</p>
                            <select value={selectedMath} onChange={(e) => setSelectedMath(e.target.value)} style={selectStyle(!!selectedMath)}>
                              <option value="">Any</option>
                              <option value="With Math">With Math</option>
                              <option value="No Math">No Math</option>
                            </select>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <p style={filterLabelStyle}>SORT</p>
                            <button
                              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                              style={{ fontSize: "10px", fontWeight: "600", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", border: "2px solid #e8edf5", backgroundColor: "#ffffff", color: "#4a6fa5", fontFamily: "'Segoe UI', sans-serif", whiteSpace: "nowrap", minWidth: "80px" }}
                            >
                              {sortOrder === "newest" ? "Newest ↓" : "Oldest ↑"}
                            </button>
                          </div>
                        </div>
                        {(search || selectedCategory || selectedDifficulty || selectedMath) && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <p style={{ fontSize: "12px", color: "#4a6fa5", margin: 0 }}>
                              {filteredEntries.length} result{filteredEntries.length !== 1 ? "s" : ""}
                            </p>
                            <button
                              onClick={() => { setSearch(""); setSelectedCategory(""); setSelectedDifficulty(""); setSelectedMath(""); }}
                              style={{ fontSize: "11px", color: "#4a6fa5", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                            >
                              Clear filters
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: "2.5px solid #b0bcc8", margin: "0 0 16px 0" }} />
                      {filteredEntries.length === 0 ? (
                        <p style={{ color: "#4a6fa5", fontSize: "14px", margin: 0 }}>No questions match your filters.</p>
                      ) : (
                        Object.entries(grouped).map(([date, dayEntries]) => {
                          const dateOpen = !!openDates[date];
                          return (
                            <div key={date} style={{ marginBottom: "12px" }}>
                              {/* Date header — collapsible */}
                              <button
                                onClick={() => setOpenDates(prev => ({ ...prev, [date]: !prev[date] }))}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  background: "none",
                                  border: "none",
                                  borderBottom: "1.5px solid #d0d9e8",
                                  paddingBottom: "8px",
                                  marginBottom: dateOpen ? "12px" : "0",
                                  cursor: "pointer",
                                  padding: "0 0 8px 0",
                                }}
                              >
                                <span style={{
                                  fontSize: "12px",
                                  fontWeight: "800",
                                  color: "#0a2463",
                                  letterSpacing: "1.2px",
                                }}>
                                  {date.toUpperCase()}
                                </span>
                                <span style={{ fontSize: "11px", color: "#4a6fa5", flexShrink: 0, marginLeft: "8px" }}>
                                  {dayEntries.length} question{dayEntries.length !== 1 ? "s" : ""} {dateOpen ? "▲" : "▼"}
                                </span>
                              </button>

                              {dateOpen && dayEntries.map((entry, i) => {
                                const globalIndex = entries.indexOf(entry);
                                const isExpanded = expandedIndex === globalIndex;
                                const isInterview = entry.type === "interview";
                                return (
                                  <div key={i} id={`entry-${globalIndex}`} style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    marginBottom: "16px",
                                    boxShadow: isExpanded ? "0 4px 20px rgba(10,36,99,0.25)" : "0 2px 8px rgba(10,36,99,0.10)",
                                    border: isExpanded ? "1px solid #4a6fa5" : "1px solid #e8edf5",
                                    cursor: "pointer",
                                  }}
                                    onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                                  >
                                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                                      {isInterview && (
                                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#0a2463", color: "#ffffff" }}>INTERVIEW</span>
                                      )}
                                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5" }}>{entry.category}</span>
                                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5" }}>{entry.difficulty}</span>
                                      {entry.math && (
                                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5" }}>{entry.math}</span>
                                      )}
                                      {entry.customPrompt && (
                                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#c9a84c", color: "#ffffff" }}>"{entry.customPrompt}"</span>
                                      )}
                                      {entry.score !== null && entry.score !== undefined && (
                                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: getScoreBg(entry.score), color: getScoreColor(entry.score) }}>{entry.score}/10</span>
                                      )}
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                                      <p style={{ fontSize: "14px", color: "#1a1a2e", lineHeight: "1.6", margin: 0, fontWeight: "500", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: isExpanded ? "unset" : 2, WebkitBoxOrient: "vertical" }}>
                                        {isInterview ? entry.scenario : entry.question}
                                      </p>
                                      <span style={{ fontSize: "12px", color: "#4a6fa5", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
                                    </div>

                                    {isExpanded && (
                                      <div style={{ marginTop: "16px", borderTop: "1px solid #e8edf5", paddingTop: "16px" }} onClick={(e) => e.stopPropagation()}>
                                        {isInterview ? (
                                          /* Interview entry expanded view */
                                          <>
                                            {entry.questions && entry.questions.map((q, qi) => (
                                              <div key={qi} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: qi < entry.questions.length - 1 ? "1px solid #e8edf5" : "none" }}>
                                                <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 4px 0" }}>
                                                  Q{qi + 1}
                                                  {q.score !== null && q.score !== undefined && (
                                                    <span style={{ marginLeft: "8px", padding: "1px 6px", borderRadius: "10px", backgroundColor: getScoreBg(q.score), color: getScoreColor(q.score) }}>{q.score}/10</span>
                                                  )}
                                                </p>
                                                <p style={{ fontSize: "13px", color: "#1a1a2e", fontWeight: "500", margin: "0 0 8px 0", lineHeight: "1.5" }}>{q.question}</p>
                                                <div className="history-answer" style={{ backgroundColor: "#f7f9fc", borderRadius: "6px", padding: "8px 10px", marginBottom: "6px", border: "1px solid #e8edf5" }}>
                                                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 3px 0" }}>YOUR ANSWER</p>
                                                  <p style={{ fontSize: "11px", color: "#1a1a2e", lineHeight: "1.4", margin: 0 }}>{q.userAnswer || "No answer was submitted."}</p>
                                                </div>
                                                {q.idealAnswer && (
                                                  <div style={{ backgroundColor: "#e8edf5", borderRadius: "6px", padding: "8px 10px", marginBottom: "6px", border: "1px solid #c8d4e8" }}>
                                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#0a2463", letterSpacing: "1px", margin: "0 0 3px 0" }}>IDEAL ANSWER</p>
                                                    <p style={{ fontSize: "11px", color: "#1a1a2e", lineHeight: "1.4", margin: 0 }}>{q.idealAnswer}</p>
                                                  </div>
                                                )}
                                                {q.feedback && (
                                                  <div style={{ backgroundColor: "#f0f4f8", borderRadius: "6px", padding: "8px 10px", borderLeft: "3px solid #0a2463" }}>
                                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#0a2463", letterSpacing: "1px", margin: "0 0 3px 0" }}>INTERVIEWER</p>
                                                    <p style={{ fontSize: "11px", color: "#1a1a2e", lineHeight: "1.4", margin: 0 }}>{q.feedback}</p>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </>
                                        ) : (
                                          /* Regular entry expanded view */
                                          <>
                                            {entry.answer && (
                                              <>
                                                <p style={{ fontSize: "11px", fontWeight: "700", color: "#0a2463", letterSpacing: "1.2px", margin: "0 0 8px 0", borderBottom: "1px solid #e8edf5", paddingBottom: "6px" }}>ANSWER</p>
                                                <div className="history-answer">
                                                  <ReactMarkdown className="markdown">{entry.answer}</ReactMarkdown>
                                                </div>
                                              </>
                                            )}
                                            {entry.userAnswer && (
                                              <div style={{ marginTop: "16px" }}>
                                                <p style={{ fontSize: "11px", fontWeight: "700", color: "#0a2463", letterSpacing: "1.2px", margin: "0 0 8px 0", borderBottom: "1px solid #e8edf5", paddingBottom: "6px" }}>YOUR ANSWER</p>
                                                <p style={{ fontSize: "13px", color: "#1a1a2e", lineHeight: "1.6", margin: 0 }}>{entry.userAnswer}</p>
                                              </div>
                                            )}
                                            {entry.feedback && (
                                              <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "#f0f4f8", borderRadius: "8px", borderLeft: "4px solid #0a2463" }}>
                                                <p style={{ fontSize: "11px", fontWeight: "700", color: "#0a2463", letterSpacing: "1.2px", margin: "0 0 8px 0" }}>FEEDBACK</p>
                                                <p style={{ fontSize: "14px", color: "#1a1a2e", lineHeight: "1.6", margin: 0 }}>{entry.feedback}</p>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })
                      )}
                    </>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", fontSize: "12px", color: "#4a6fa5", marginTop: "12px", marginBottom: "12px", fontStyle: "italic" }}>
        For help, contact <a href="mailto:support@fitefinance.com" style={{ color: "#4a6fa5" }}>support@fitefinance.com</a>
      </p>
      <p className="byline-bottom" style={{ textAlign: "center", fontSize: "10px", color: "#5a060d", fontStyle: "italic", marginTop: "4px", marginBottom: "12px", display: "none" }}>
        by Colgate's finest
      </p>
      <Analytics />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "20px 20px 40px 20px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: { width: "100%" },
  logo: {
    fontSize: "32px", 
    fontWeight: "700", 
    color: "#0a2463",
    margin: "0 0 6px 0", 
    cursor: "default",
  },
  tagline: { 
    fontSize: "15px", 
    color: "#4a6fa5", 
    margin: 0, 
    cursor: "default" },
  card: {
    backgroundColor: "#ffffff", 
    borderRadius: "12px",
    padding: "36px", 
    boxShadow: "0 2px 16px rgba(10, 36, 99, 0.08)",
  },
};

export default History;

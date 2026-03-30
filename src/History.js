import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { useUser } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown";
import usePaidStatus from "./usePaidStatus";
import "./App.css";

const CATEGORIES = ["All", "Investment Banking", "Private Equity", "Asset Management", "Accounting", "Financial Modeling", "Valuation", "Sales and Trading"];
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
  const [questionsOpen, setQuestionsOpen] = useState(true);
  const [scoreRange, setScoreRange] = useState(null);
  const [sliderPos, setSliderPos] = useState(null);

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

  const filteredEntries = entries
    .filter((entry) => {
      const matchesSearch = search === "" || entry.question.toLowerCase().includes(search.toLowerCase());
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
      const date = new Date(entry.timestamp).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return groups;
  };

  const grouped = groupByDate(filteredEntries);

  const filterLabelStyle = { fontSize: "10px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: 0 };

  const selectStyle = (active) => ({
    padding: "6px 10px",
    borderRadius: "8px",
    border: "2px solid #e8edf5",
    fontSize: "12px",
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

            {!loadingHistory && entries.length > 0 && (
              <>
                {/* Stats — collapsible */}
                <div style={{ borderRadius: "10px", marginBottom: "12px", overflow: "hidden", border: "1px solid #e8edf5" }}>
                  <button
                    onClick={() => setStatsOpen(!statsOpen)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", backgroundColor: "#0a2463", border: "none", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#ffffff", letterSpacing: "1.2px" }}>YOUR STATS</span>
                    <span style={{ fontSize: "11px", color: "#ffffff" }}>{statsOpen ? "▲" : "▼"}</span>
                  </button>
                  {statsOpen && (
                    <div style={{ backgroundColor: "#f0f4f8", padding: "16px" }}>
                      <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                          <p style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{totalQuestions}</p>
                          <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Total Questions</p>
                        </div>
                        <div style={{ flex: 1, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                          <p style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{gradedQuestions}</p>
                          <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Graded</p>
                        </div>
                        {topCategory && (
                          <div style={{ flex: 2, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{topCategory[0]}</p>
                            <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Top Category ({topCategory[1]})</p>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                        {Object.entries(difficultyCounts).map(([diff, count]) => (
                          <div key={diff} style={{ flex: 1, minWidth: "60px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                            <p style={{ fontSize: "20px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{count}</p>
                            <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>{diff}</p>
                          </div>
                        ))}
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
                    </div>
                  )}
                </div>

                {/* Score Analysis — collapsible */}
                <div style={{ borderRadius: "10px", marginBottom: "12px", overflow: "hidden", border: "1px solid #e8edf5" }}>
                  <button
                    onClick={() => setScoreOpen(!scoreOpen)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", backgroundColor: "#0a2463", border: "none", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#ffffff", letterSpacing: "1.2px" }}>SCORE ANALYSIS</span>
                    <span style={{ fontSize: "11px", color: "#ffffff" }}>{scoreOpen ? "▲" : "▼"}</span>
                  </button>
                  {scoreOpen && (
                    <div style={{ backgroundColor: "#f0f4f8", padding: "16px" }}>
                      {scoredEntries.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#4a6fa5", margin: 0, fontStyle: "italic" }}>No graded answers yet — grade some questions to see your score analysis.</p>
                      ) : (
                        <>
                          {/* Overall average */}
                          <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <p style={{ fontSize: "13px", fontWeight: "600", color: "#4a6fa5", margin: 0, flexShrink: 0 }}>Overall Average</p>
                            <div style={{ flex: 1, borderBottom: "2px dotted #b0bcc8" }} />
                            <p style={{ fontSize: "22px", fontWeight: "700", color: averageScore >= 8 ? "#16a34a" : averageScore >= 5 ? "#d97706" : "#dc2626", margin: 0, fontFamily: "monospace", flexShrink: 0 }}>{averageScore} <span style={{ fontSize: "13px", color: "#4a6fa5", fontFamily: "'Segoe UI', sans-serif" }}>/ 10</span></p>
                          </div>

                          {/* Range selector — only shown when 2+ scored entries */}
                          {chartScoredEntries.length > 1 && (() => {
                            const sliderMax = chartScoredEntries.length;
                            const visualVal = sliderPos ?? sliderMax;
                            const fillPct = ((visualVal - 1) / (sliderMax - 1)) * 100;
                            return (
                              <>
                                <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 10px 0" }}>RANGE</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#4a6fa5", flexShrink: 0 }}>1</span>
                                  <input
                                    type="range"
                                    min={1}
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
                                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#4a6fa5", flexShrink: 0 }}>{sliderMax}</span>
                                </div>
                                <p style={{ fontSize: "12px", color: "#4a6fa5", margin: "0 0 16px 0", fontStyle: "italic" }}>
                                  {scoreRange === null || scoreRange >= sliderMax
                                    ? `Showing all ${sliderMax} scored questions`
                                    : `Showing last ${scoreRange} of ${sliderMax} scored questions`}
                                </p>
                              </>
                            );
                          })()}

                          {/* Range average — only shown when slider moved away from max */}
                          {rangeAvg !== null && scoreRange !== null && (
                            <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#4a6fa5", margin: 0, flexShrink: 0 }}>
                                {(() => { const n = scoreRange === null ? chartEntries.length : Math.min(scoreRange, chartEntries.length); return scoreRange === null ? `Average Across All ${n} Question${n === 1 ? "" : "s"}` : `Average Across Last ${n} Question${n === 1 ? "" : "s"}`; })()}
                              </p>
                              <div style={{ flex: 1, borderBottom: "2px dotted #b0bcc8" }} />
                              <p style={{ fontSize: "22px", fontWeight: "700", color: rangeAvg >= 8 ? "#16a34a" : rangeAvg >= 5 ? "#d97706" : "#dc2626", margin: 0, fontFamily: "monospace", flexShrink: 0 }}>{rangeAvg} <span style={{ fontSize: "13px", color: "#4a6fa5", fontFamily: "'Segoe UI', sans-serif" }}>/ 10</span></p>
                            </div>
                          )}

                          {/* Bar chart */}
                          <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 8px 0" }}>SCORE HISTORY</p>
                          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "2px", flexShrink: 0 }}>
                              {["10", "5", "0"].map(l => <span key={l} style={{ fontSize: "10px", color: "#4a6fa5" }}>{l}</span>)}
                            </div>
                            <div style={{ flex: 1, height: "120px", position: "relative", borderBottom: "2px solid #d0d9e8", borderLeft: "2px solid #d0d9e8" }}>
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, borderTop: "1px dashed #e8edf5" }} />
                              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px dashed #e8edf5" }} />
                              <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: "2px", padding: "0 4px" }}>
                                {chartEntries.map((entry, i) => {
                                  const globalIndex = entries.indexOf(entry);
                                  return (
                                    <div
                                      key={i}
                                      title={`${entry.score}/10 — click to view`}
                                      onClick={() => {
                                        setExpandedIndex(globalIndex);
                                        setStatsOpen(false);
                                        setScoreOpen(false);
                                        setTimeout(() => {
                                          document.getElementById(`entry-${globalIndex}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                                        }, 50);
                                      }}
                                      style={{ flex: 1, minWidth: "4px", height: `${(entry.score / 10) * 100}%`, backgroundColor: entry.score >= 8 ? "#16a34a" : entry.score >= 5 ? "#d97706" : "#dc2626", borderRadius: "2px 2px 0 0", cursor: "pointer", transition: "opacity 0.15s", }}
                                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Browse Questions — collapsible */}
            <div style={{ borderRadius: "10px", marginBottom: "12px", overflow: "hidden", border: "1px solid #e8edf5" }}>
              <button
                onClick={() => setQuestionsOpen(!questionsOpen)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", backgroundColor: "#0a2463", border: "none", cursor: "pointer" }}
              >
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#ffffff", letterSpacing: "1.2px" }}>BROWSE QUESTIONS</span>
                <span style={{ fontSize: "11px", color: "#ffffff" }}>{questionsOpen ? "▲" : "▼"}</span>
              </button>
              {questionsOpen && (
                <div style={{ backgroundColor: "#f0f4f8", padding: "16px" }}>
                  {loadingHistory ? (
                    <p style={{ color: "#4a6fa5", fontSize: "14px", margin: 0 }}>Loading history...</p>
                  ) : entries.length === 0 ? (
                    <p style={{ color: "#4a6fa5", fontSize: "14px", margin: 0 }}>No history yet — go answer some questions!</p>
                  ) : (
                    <>
                      {/* Search & filter sub-section */}
                      <p style={{ fontSize: "12px", fontWeight: "800", color: "#0a2463", letterSpacing: "1.2px", margin: "0 0 10px 0", paddingBottom: "8px", borderBottom: "2.5px solid #d0d9e8" }}>SEARCH & FILTER</p>
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
                              fontSize: "12px",
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
                              style={{ fontSize: "12px", fontWeight: "600", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", border: "2px solid #e8edf5", backgroundColor: "#ffffff", color: "#4a6fa5", fontFamily: "'Segoe UI', sans-serif", whiteSpace: "nowrap", minWidth: "80px" }}
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

                      {/* Question history sub-section */}
                      <p style={{ fontSize: "12px", fontWeight: "800", color: "#0a2463", letterSpacing: "1.2px", margin: "0 0 12px 0", paddingBottom: "8px", borderBottom: "2.5px solid #d0d9e8" }}>QUESTION HISTORY</p>
                      {filteredEntries.length === 0 ? (
                        <p style={{ color: "#4a6fa5", fontSize: "14px", margin: 0 }}>No questions match your filters.</p>
                      ) : (
                        Object.entries(grouped).map(([date, dayEntries]) => (
                          <div key={date} style={{ marginBottom: "32px" }}>
                            <p style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#4a6fa5",
                              letterSpacing: "1.2px",
                              margin: "0 0 12px 0",
                              borderBottom: "1px solid #d0d9e8",
                              paddingBottom: "8px",
                            }}>
                              {date.toUpperCase()}
                            </p>
                  {dayEntries.map((entry, i) => {
                    const globalIndex = entries.indexOf(entry);
                    const isExpanded = expandedIndex === globalIndex;
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
                          <span style={{
                            fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                            borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5"
                          }}>{entry.category}</span>
                          <span style={{
                            fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                            borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5"
                          }}>{entry.difficulty}</span>
                          {entry.math && (
                            <span style={{
                              fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                              borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5"
                            }}>{entry.math}</span>
                          )}
                          {entry.customPrompt && (
                            <span style={{
                              fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                              borderRadius: "20px", backgroundColor: "#c9a84c", color: "#ffffff"
                            }}>"{entry.customPrompt}"</span>
                          )}
                          {entry.score !== null && entry.score !== undefined && (
                            <span style={{
                              fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                              borderRadius: "20px",
                              backgroundColor: entry.score >= 8 ? "#dcfce7" : entry.score >= 5 ? "#fff7ed" : "#fee2e2",
                              color: entry.score >= 8 ? "#16a34a" : entry.score >= 5 ? "#d97706" : "#dc2626",
                            }}>{entry.score}/10</span>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                          <p style={{
                            fontSize: "14px",
                            color: "#1a1a2e",
                            lineHeight: "1.6",
                            margin: 0,
                            fontWeight: "500",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: isExpanded ? "unset" : 2,
                            WebkitBoxOrient: "vertical",
                          }}>
                            {entry.question}
                          </p>
                          <span style={{ fontSize: "12px", color: "#4a6fa5", flexShrink: 0 }}>
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>

                        {isExpanded && (
                          <div style={{ marginTop: "16px", borderTop: "1px solid #e8edf5", paddingTop: "16px" }}
                            onClick={(e) => e.stopPropagation()}>
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
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              )}
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
    fontSize: "32px", fontWeight: "700", color: "#0a2463",
    margin: "0 0 6px 0", cursor: "default",
  },
  tagline: { fontSize: "15px", color: "#4a6fa5", margin: 0, cursor: "default" },
  card: {
    backgroundColor: "#ffffff", borderRadius: "12px",
    padding: "36px", boxShadow: "0 2px 16px rgba(10, 36, 99, 0.08)",
  },
};

export default History;
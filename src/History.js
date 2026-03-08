import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { useUser } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown";
import usePaidStatus from "./usePaidStatus";
import "./App.css";

const CATEGORIES = ["All", "Investment Banking", "Private Equity", "Asset Management", "Accounting", "Financial Modeling", "Valuation", "Sales and Trading", "Asset Finance"];
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

  const filterPillStyle = (active) => ({
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "20px",
    cursor: "pointer",
    border: "none",
    backgroundColor: active ? "#0a2463" : "#e8edf5",
    color: active ? "#ffffff" : "#4a6fa5",
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
              style={{ height: "64px", width: "64px" }}
              className="logo-img-mobile"
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={styles.logo} className="logo-mobile">Fite Finance</h1>
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
                {/* Stats Dashboard */}
                <div style={{
                  backgroundColor: "#f0f4f8",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "24px",
                }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1.2px", margin: "0 0 12px 0" }}>YOUR STATS</p>
                  
                  {/* Top row */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <p style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{totalQuestions}</p>
                      <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Total Questions</p>
                    </div>
                    <div style={{ flex: 1, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <p style={{ fontSize: "24px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{gradedQuestions}</p>
                      <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Graded</p>
                    </div>
                    {topCategory && (
                      <div style={{ flex: 2, minWidth: "80px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "12px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <p style={{ fontSize: "16px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{topCategory[0]}</p>
                        <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>Top Category ({topCategory[1]})</p>
                      </div>
                    )}
                  </div>

                  {/* Difficulty row */}
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {Object.entries(difficultyCounts).map(([diff, count]) => (
                      <div key={diff} style={{ flex: 1, minWidth: "60px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                        <p style={{ fontSize: "20px", fontWeight: "700", color: "#0a2463", margin: 0 }}>{count}</p>
                        <p style={{ fontSize: "11px", color: "#4a6fa5", margin: "4px 0 0 0" }}>{diff}</p>
                      </div>
                    ))}
                  </div>

                  {/* Category breakdown */}
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "12px", color: "#4a6fa5", margin: 0 }}>{cat}</p>
                        <span style={{
                          fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                          borderRadius: "20px", backgroundColor: "#e8edf5", color: "#0a2463"
                        }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search and filters */}
                <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "2px solid #e8edf5",
                      fontSize: "14px",
                      color: "#1a1a2e",
                      fontFamily: "'Segoe UI', sans-serif",
                      boxSizing: "border-box",
                      outline: "none",
                      backgroundColor: "#ffffff",
                    }}
                  />

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                        style={filterPillStyle(selectedCategory === cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === d ? "" : d)}
                        style={filterPillStyle(selectedDifficulty === d)}
                      >
                        {d}
                      </button>
                    ))}
                    <div style={{ marginLeft: "auto" }}>
                      <button
                        onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          cursor: "pointer",
                          border: "none",
                          backgroundColor: "#e8edf5",
                          color: "#4a6fa5",
                        }}
                      >
                        {sortOrder === "newest" ? "Newest ↓" : "Oldest ↑"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {["With Math", "No Math"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMath(selectedMath === m ? "" : m)}
                        style={filterPillStyle(selectedMath === m)}
                      >
                        {m}
                      </button>
                    ))}
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
              </>
            )}

            {loadingHistory ? (
              <p style={{ color: "#4a6fa5", fontSize: "14px" }}>Loading history...</p>
            ) : entries.length === 0 ? (
              <p style={{ color: "#4a6fa5", fontSize: "14px" }}>No history yet — go answer some questions!</p>
            ) : filteredEntries.length === 0 ? (
              <p style={{ color: "#4a6fa5", fontSize: "14px" }}>No questions match your filters.</p>
            ) : (
              Object.entries(grouped).map(([date, dayEntries]) => (
                <div key={date} style={{ marginBottom: "32px" }}>
                  <p style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#4a6fa5",
                    letterSpacing: "1.2px",
                    margin: "0 0 12px 0",
                    borderBottom: "1px solid #e8edf5",
                    paddingBottom: "8px",
                  }}>
                    {date.toUpperCase()}
                  </p>
                  {dayEntries.map((entry, i) => {
                    const globalIndex = entries.indexOf(entry);
                    const isExpanded = expandedIndex === globalIndex;
                    return (
                      <div key={i} style={{
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
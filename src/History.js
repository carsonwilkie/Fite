import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { useUser } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown";
import usePaidStatus from "./usePaidStatus";
import "./App.css";

function History() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isPaid, loading } = usePaidStatus();
  const [entries, setEntries] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

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

  const grouped = groupByDate(entries);

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

            {loadingHistory ? (
              <p style={{ color: "#4a6fa5", fontSize: "14px" }}>Loading history...</p>
            ) : entries.length === 0 ? (
              <p style={{ color: "#4a6fa5", fontSize: "14px" }}>No history yet — go answer some questions!</p>
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
                        boxShadow: "0 2px 8px rgba(10,36,99,0.10)",
                        border: "1px solid #e8edf5",
                        cursor: "pointer",
                      }}
                        onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                          <p style={{ fontSize: "14px", color: "#1a1a2e", lineHeight: "1.6", margin: 0, fontWeight: "500" }}>
                            {entry.question}
                          </p>
                          <span style={{ fontSize: "12px", color: "#4a6fa5", flexShrink: 0 }}>
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                            borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5"
                          }}>{entry.category}</span>
                          <span style={{
                            fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                            borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5"
                          }}>{entry.difficulty}</span>
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
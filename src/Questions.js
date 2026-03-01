import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

function Questions() {
  const { category, difficulty, math } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const getQuestion = async () => {
    setLoadingQuestion(true);
    setAnswer("");
    setAnswerRevealed(false);
    setQuestion("");
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "question", category, difficulty, math }),
      });
      const data = await res.json();
      setQuestion(data.result);
      fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "answer", question: data.result, category, difficulty, math }),
      })
        .then((res) => res.json())
        .then((data) => setAnswer(data.result));
    } catch (error) {
      console.log("Error:", error);
    }
    setLoadingQuestion(false);
  };

  const getAnswer = async () => {
    setAnswerRevealed(true);
    if (answer) return;
    setLoadingAnswer(true);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "answer", question, category, difficulty, math }),
      });
      const data = await res.json();
      setAnswer((current) => current || data.result);
    } catch (error) {
      console.log("Error:", error);
    }
    setLoadingAnswer(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <img src="/favicon.png" alt="logo" style={{ height: "36px", width: "36px" }} />
      </div>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src="/favicon.png" alt="logo" style={{ height: "64px", width: "64px" }} />
            <div>
              <h1 style={styles.logo}>Fite Finance</h1>
              <p style={styles.tagline}>The finance site sharpening your interview skills</p>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.categoryHeader}>
            <button onClick={() => navigate("/")} className="back-btn">← Back</button>
            <p style={styles.categoryLabel}>{decodeURIComponent(category)}</p>
            <span style={{
                ...styles.mathBadge,
                backgroundColor: decodeURIComponent(math) === "With Math" ? "#0a2463" : "#e8edf5",
                color: decodeURIComponent(math) === "With Math" ? "#ffffff" : "#4a6fa5",
            }}>
                {decodeURIComponent(math)}
            </span>
          </div>

          <button onClick={getQuestion} disabled={loadingQuestion || loadingAnswer} className="primary-btn">
            {loadingQuestion ? "Loading..." : "Get Question"}
          </button>

          {question && (
            <div style={styles.section}>
              <p style={styles.label}>QUESTION</p>
              <p style={styles.text}>{question}</p>
              <button onClick={getAnswer} disabled={loadingQuestion || loadingAnswer || answerRevealed} className="secondary-btn">
                {loadingAnswer ? "Loading..." : "Show Answer"}
              </button>
            </div>
          )}

          {answerRevealed && answer && (
            <div style={styles.section}>
              <p style={styles.label}>ANSWER</p>
              <ReactMarkdown className="markdown">{answer}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
      <Analytics />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "60px 20px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "680px",
  },
  header: {
    marginBottom: "32px",
  },
  logo: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0a2463",
    margin: "0 0 6px 0",
  },
  tagline: {
    fontSize: "15px",
    color: "#4a6fa5",
    margin: 0,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "36px",
    boxShadow: "0 2px 16px rgba(10, 36, 99, 0.08)",
  },
  categoryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  categoryLabel: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0a2463",
    margin: 0,
  },
  section: {
    marginTop: "28px",
    borderTop: "1px solid #e8edf5",
    paddingTop: "24px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#4a6fa5",
    letterSpacing: "1.2px",
    margin: "0 0 10px 0",
  },
  text: {
    fontSize: "16px",
    color: "#1a1a2e",
    lineHeight: "1.7",
    margin: 0,
  },
  navbar: {
    position: "fixed",
    top: "0",
    right: "0",
    padding: "16px 24px",
  },
  mathBadge: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    padding: "4px 10px",
    borderRadius: "20px",
  },
};

export default Questions;
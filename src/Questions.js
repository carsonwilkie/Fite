import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Analytics } from "@vercel/analytics/react";
import { useUser } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import usePrice from "./usePrice";
import "./App.css";

function Questions() {
  const { category, difficulty, math, customPrompt } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const { user } = useUser();
  const { isPaid } = usePaidStatus();
  const price = usePrice();
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [graded, setGraded] = useState(false);

  useEffect(() => {
    if (feedback && answer && question && user?.id) {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          entry: {
            question,
            answer,
            userAnswer,
            feedback,
            category: decodeURIComponent(category),
            difficulty: decodeURIComponent(difficulty),
            timestamp: Date.now(),
          }
        }),
      });
    }
  }, [feedback]);

  const saveQuestion = (q) => {
    const history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
    history.push({ question: q, timestamp: Date.now() });
    localStorage.setItem("questionHistory", JSON.stringify(history));
  };

  const wasRecentlyAsked = (q) => {
    const history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return history.some(
      (item) => item.question === q && item.timestamp > oneDayAgo
    );
  };

  const handleUpgrade = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, email: user?.primaryEmailAddress?.emailAddress }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const handleGrade = async () => {
    setLoadingFeedback(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userAnswer }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      setGraded(true);
    } catch (error) {
      console.log("Error:", error);
    }
    setLoadingFeedback(false);
  };

  const getQuestion = async () => {
    setLoadingQuestion(true);
    setAnswer("");
    setAnswerRevealed(false);
    setQuestion("");
    setUserAnswer("");
    setFeedback("");
    setGraded(false);
    try {
      let newQuestion = null;
      let attempts = 0;
      while (!newQuestion && attempts < 5) {
        const res = await fetch("/api/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "question", category, difficulty, math, customPrompt, userId: user?.id }),
        });
        const data = await res.json();
        if (data.limitReached) {
          setQuestion("You've reached your 5 free questions for today. Come back tomorrow, or upgrade to premium for unlimited questions!");
          setLoadingQuestion(false);
          return;
        }
        if (!wasRecentlyAsked(data.result)) {
          newQuestion = data.result;
        }
        attempts++;
      }
      if (newQuestion) {
        saveQuestion(newQuestion);
        setQuestion(newQuestion);
        fetch("/api/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "answer", question: newQuestion, category, difficulty, math, customPrompt, userId: user?.id }),
        })
          .then((res) => res.json())
          .then((data) => { setAnswer(data.result); });
      } else {
        setQuestion("You've seen all recent questions in this category! Try a different category or check back tomorrow.");
      }
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
        body: JSON.stringify({ type: "answer", question, category, difficulty, math, customPrompt, userId: user?.id }),
      });
      const data = await res.json();
      setAnswer((current) => current || data.result);
    } catch (error) {
      console.log("Error:", error);
    }
    setLoadingAnswer(false);
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
              src={isPaid ? "/Fite_Logo_Premium.png" : "/favicon.png"}
              alt="logo"
              style={{ height: "64px", width: "64px" }}
              className="logo-img-mobile"
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={styles.logo} className="logo-mobile">Fite Finance</h1>
                {isPaid && (
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
                )}
              </div>
              <p style={styles.tagline} className="tagline-mobile">The finance site sharpening your interview skills</p>
            </div>
          </div>

          <div style={styles.card} className="card-mobile">
            <div style={styles.categoryHeader} className="category-header-mobile">
              <button onClick={() => navigate("/")} className="back-btn">← Back</button>
              <p style={styles.categoryLabel}>{decodeURIComponent(category)}</p>
              <span style={{
                ...styles.mathBadge,
                backgroundColor: "#e8edf5",
                color: "#4a6fa5",
              }}>
                {decodeURIComponent(difficulty)}
              </span>
              <span style={{
                ...styles.mathBadge,
                backgroundColor: decodeURIComponent(math) === "With Math" ? "#0a2463" : "#e8edf5",
                color: decodeURIComponent(math) === "With Math" ? "#ffffff" : "#4a6fa5",
              }}>
                {decodeURIComponent(math)}
              </span>
              {customPrompt && decodeURIComponent(customPrompt) !== "" && decodeURIComponent(customPrompt) !== "undefined" && (
                <span style={{
                  ...styles.mathBadge,
                  backgroundColor: "#c9a84c",
                  color: "#ffffff",
                }}>
                  "{decodeURIComponent(customPrompt)}"
                </span>
              )}
            </div>

            <button onClick={getQuestion} disabled={loadingQuestion || loadingAnswer} className="primary-btn">
              {loadingQuestion ? "Loading..." : "Get Question"}
            </button>

            {question && (
              <div style={styles.section}>
                <p style={styles.label}>QUESTION</p>
                <p style={styles.text}>{question}</p>

                {!question.includes("Come back tomorrow") && (
                  <div style={{ marginTop: "20px" }}>
                    <p style={{ ...styles.label, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      YOUR ANSWER
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.8px",
                        padding: "3px 8px",
                        borderRadius: "20px",
                        backgroundColor: isPaid ? "#c9a84c" : "#e8edf5",
                        color: isPaid ? "#ffffff" : "#4a6fa5",
                      }}>PREMIUM</span>
                    </p>
                    <textarea
                      placeholder={isPaid ? "Type your answer here to get AI feedback..." : "Upgrade to Premium to get AI feedback on your answers"}
                      value={userAnswer}
                      onChange={(e) => isPaid && setUserAnswer(e.target.value)}
                      disabled={!isPaid}
                      style={{
                        width: "100%",
                        minHeight: "120px",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "2px solid #e8edf5",
                        fontSize: "14px",
                        color: isPaid ? "#1a1a2e" : "#a0aec0",
                        fontFamily: "'Segoe UI', sans-serif",
                        boxSizing: "border-box",
                        outline: "none",
                        backgroundColor: isPaid ? "#ffffff" : "#f7f9fc",
                        cursor: isPaid ? "text" : "not-allowed",
                        resize: "vertical",
                      }}
                    />
                    {isPaid && (
                      <button
                        onClick={handleGrade}
                        disabled={loadingFeedback || !userAnswer.trim() || graded}
                        className="secondary-btn"
                        style={{ marginTop: "12px" }}
                      >
                        {loadingFeedback ? "Grading..." : graded ? "Graded ✓" : "Grade My Answer"}
                      </button>
                    )}
                  </div>
                )}

                {feedback && (
                  <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#f0f4f8", borderRadius: "8px", borderLeft: "4px solid #0a2463" }}>
                    <p style={{ ...styles.label, marginBottom: "8px" }}>FEEDBACK</p>
                    <p style={{ fontSize: "14px", color: "#1a1a2e", lineHeight: "1.6", margin: 0 }}>{feedback}</p>
                  </div>
                )}

                {question.includes("Come back tomorrow") ? (
                  <button className="upgrade-btn" onClick={handleUpgrade} style={{ width: "100%", display: "block", marginTop: "16px" }}>
                    ⭐ Upgrade for {price || "$3/month"}
                  </button>
                ) : (
                  <button onClick={getAnswer} disabled={loadingQuestion || loadingAnswer || answerRevealed} className="secondary-btn">
                    {loadingAnswer ? "Loading..." : "Show Answer"}
                  </button>
                )}
              </div>
            )}

            {!question.includes("Come back tomorrow") && answerRevealed && answer && (
              <div style={styles.section}>
                <p style={styles.label}>ANSWER</p>
                <ReactMarkdown className="markdown">{answer}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", fontSize: "12px", color: "#4a6fa5", marginTop: "12px", marginBottom: "12px", fontStyle: "italic" }}>
        For help, contact <a href="mailto:support@fitefinance.com" style={{ color: "#4a6fa5" }}>support@fitefinance.com</a>
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
  container: {
    width: "100%",
  },
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
    cursor: "default",
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
  mathBadge: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    padding: "4px 10px",
    borderRadius: "20px",
  },
};

export default Questions;
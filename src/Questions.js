import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Analytics } from "@vercel/analytics/react";
import { useUser } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import usePrice from "./usePrice";
import { useClerk } from "@clerk/clerk-react";
import "./App.css";

const INTERVIEW_TIME = 120;

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
  const answerRef = React.useRef(answer);
  const { openSignIn } = useClerk();
  const [questionsUsed, setQuestionsUsed] = useState(null);
  const [interviewMode, setInterviewMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (interviewMode && timeLeft === 0 && userAnswer.trim() && !graded) {
      handleGrade();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(INTERVIEW_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimeLeft(null);
  };

  const freezeTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    // intentionally does not null out timeLeft — preserves the remaining time for display
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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
    if (!user?.id) {
      openSignIn();
      return;
    }
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
    if (interviewMode && timeLeft !== null && timeLeft > 0) freezeTimer();
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

      if (user?.id) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            entry: {
              question,
              answer: answerRef.current,
              userAnswer,
              feedback: data.feedback,
              category: decodeURIComponent(category),
              difficulty: decodeURIComponent(difficulty),
              math: decodeURIComponent(math),
              customPrompt: customPrompt && decodeURIComponent(customPrompt) !== "undefined" ? decodeURIComponent(customPrompt) : null,
              timestamp: Date.now(),
            }
          }),
        });
      }
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
    stopTimer();
    setTimerStarted(false);
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
        if (data.questionsUsed !== undefined) setQuestionsUsed(data.questionsUsed);
        if (!wasRecentlyAsked(data.result)) {
          newQuestion = data.result;
        }
        attempts++;
      }
      if (newQuestion) {
        saveQuestion(newQuestion);
        setQuestion(newQuestion);
        setTimerStarted(false);
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

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <button
                onClick={() => { if (isPaid) { setInterviewMode(!interviewMode); stopTimer(); setTimerStarted(false); } }}
                disabled={!isPaid}
                title={!isPaid ? "Upgrade to Premium to use Interview Mode" : undefined}
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.6px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  cursor: isPaid ? "pointer" : "not-allowed",
                  border: "2px solid",
                  borderColor: !isPaid ? "#e8edf5" : interviewMode ? "#0a2463" : "#e8edf5",
                  backgroundColor: !isPaid ? "#f7f9fc" : interviewMode ? "#0a2463" : "#ffffff",
                  color: !isPaid ? "#c0cad8" : interviewMode ? "#ffffff" : "#4a6fa5",
                  transition: "all 0.2s",
                  opacity: isPaid ? 1 : 0.6,
                }}
              >
                Interview Mode {interviewMode ? "ON" : "OFF"}
              </button>
            </div>

            <button onClick={getQuestion} disabled={loadingQuestion || loadingAnswer} className="primary-btn">
              {loadingQuestion ? "Loading..." : "Get Question"}
            </button>

            {!isPaid && questionsUsed !== null && (
              <p style={{
                fontSize: "12px",
                color: questionsUsed >= 4 ? "#d97706" : "#4a6fa5",
                margin: "8px 0 0 0",
                textAlign: "center",
                fontStyle: "italic",
              }}>
                {questionsUsed} of 5 free questions used today
              </p>
            )}

            {interviewMode && question && !question.includes("Come back tomorrow") && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                backgroundColor: !timerStarted ? "#e8edf5" : graded && timeLeft > 0 ? "#f0fdf4" : timeLeft === 0 ? "#fee2e2" : timeLeft < 30 ? "#fff7ed" : "#e8edf5",
                borderRadius: "8px",
                marginTop: "16px",
                border: `1px solid ${!timerStarted ? "#d0d9e8" : graded && timeLeft > 0 ? "#86efac" : timeLeft === 0 ? "#fca5a5" : timeLeft < 30 ? "#fed7aa" : "#d0d9e8"}`,
              }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px" }}>
                  INTERVIEW MODE
                </span>
                {!timerStarted ? (
                  <button
                    onClick={() => { setTimerStarted(true); startTimer(); }}
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "5px 14px",
                      borderRadius: "20px",
                      border: "none",
                      backgroundColor: "#0a2463",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Start Answering
                  </button>
                ) : (
                  <span style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    fontFamily: "monospace",
                    color: graded && timeLeft > 0 ? "#16a34a" : timeLeft === 0 ? "#dc2626" : timeLeft < 30 ? "#d97706" : "#0a2463",
                  }}>
                    {graded && timeLeft > 0
                      ? `${formatTime(timeLeft)} remaining`
                      : timeLeft === 0
                      ? "Time's up!"
                      : formatTime(timeLeft)}
                  </span>
                )}
              </div>
            )}

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
                      onChange={(e) => isPaid && !(interviewMode && (!timerStarted || timeLeft === 0 || graded)) && setUserAnswer(e.target.value)}
                      disabled={!isPaid || (interviewMode && (!timerStarted || timeLeft === 0 || graded))}
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
                  <button onClick={getAnswer} disabled={loadingQuestion || loadingAnswer || answerRevealed || (interviewMode && timeLeft !== null && timeLeft > 0 && !graded)} className="secondary-btn">
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
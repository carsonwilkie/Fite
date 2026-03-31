import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Analytics } from "@vercel/analytics/react";
import { useUser } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import usePrice from "./usePrice";
import { useClerk } from "@clerk/clerk-react";
import "./App.css";

const TIMER_TIME = 120;
const INTERVIEW_QUESTIONS = 4;

function Questions() {
  const { category, difficulty, math, customPrompt } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isPaid } = usePaidStatus();
  const price = usePrice();
  const { openSignIn } = useClerk();

  // Normal question state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [graded, setGraded] = useState(false);
  const answerRef = React.useRef(answer);
  const [questionsUsed, setQuestionsUsed] = useState(null);

  // Timer (formerly "Interview Mode")
  const [timerOn, setTimerOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customTimeSec, setCustomTimeSec] = useState(TIMER_TIME);
  const [showTimerTooltip, setShowTimerTooltip] = useState(false);
  const timerRef = useRef(null);

  // Interview Mode state
  const [interviewModeOn, setInterviewModeOn] = useState(false);
  const [showInterviewTooltip, setShowInterviewTooltip] = useState(false);
  const [interviewSession, setInterviewSession] = useState(null); // { scenario, questions: [{question, idealAnswer}] }
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewUserAnswers, setInterviewUserAnswers] = useState([]); // string per step
  const [interviewResponses, setInterviewResponses] = useState([]); // { score, onTrack, response } per step
  const [interviewCurrentAnswer, setInterviewCurrentAnswer] = useState("");
  const [loadingInterviewGenerate, setLoadingInterviewGenerate] = useState(false);
  const [loadingInterviewRespond, setLoadingInterviewRespond] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [interviewDebrief, setInterviewDebrief] = useState(null);
  const [loadingDebrief, setLoadingDebrief] = useState(false);
  const [interviewAnswersRevealed, setInterviewAnswersRevealed] = useState(false);
  // Per-question timer in interview mode
  const [interviewTimerStarted, setInterviewTimerStarted] = useState(false);
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(null);
  const [interviewTimerPaused, setInterviewTimerPaused] = useState(false);
  const [interviewCustomTime, setInterviewCustomTime] = useState(TIMER_TIME);
  const interviewTimerRef = useRef(null);

  useEffect(() => { answerRef.current = answer; }, [answer]);
  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);
  useEffect(() => { return () => { if (interviewTimerRef.current) clearInterval(interviewTimerRef.current); }; }, []);

  // Auto-grade when normal timer hits 0
  useEffect(() => {
    if (timerOn && timeLeft === 0 && !graded) handleGrade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Auto-submit when interview question timer hits 0
  useEffect(() => {
    if (interviewModeOn && interviewTimerStarted && interviewTimeLeft === 0 && !loadingInterviewRespond) {
      handleInterviewSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewTimeLeft]);

  // --- Normal timer helpers ---
  const runInterval = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };
  const startTimer = () => { if (timerRef.current) clearInterval(timerRef.current); setTimeLeft(customTimeSec); runInterval(); };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } setTimeLeft(null); setIsPaused(false); };
  const pauseTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } setIsPaused(true); };
  const resumeTimer = () => { setIsPaused(false); runInterval(); };

  const freezeTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  // --- Interview question timer helpers ---
  const runInterviewInterval = () => {
    interviewTimerRef.current = setInterval(() => {
      setInterviewTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interviewTimerRef.current); interviewTimerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };
  const startInterviewTimer = () => {
    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
    setInterviewTimeLeft(interviewCustomTime);
    setInterviewTimerStarted(true);
    setInterviewTimerPaused(false);
    runInterviewInterval();
  };
  const stopInterviewTimer = () => {
    if (interviewTimerRef.current) { clearInterval(interviewTimerRef.current); interviewTimerRef.current = null; }
    setInterviewTimeLeft(null);
    setInterviewTimerStarted(false);
    setInterviewTimerPaused(false);
  };
  const pauseInterviewTimer = () => {
    if (interviewTimerRef.current) { clearInterval(interviewTimerRef.current); interviewTimerRef.current = null; }
    setInterviewTimerPaused(true);
  };
  const resumeInterviewTimer = () => { setInterviewTimerPaused(false); runInterviewInterval(); };
  const freezeInterviewTimer = () => { if (interviewTimerRef.current) { clearInterval(interviewTimerRef.current); interviewTimerRef.current = null; } };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const saveQuestion = (q) => {
    const history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
    history.push({ question: q, timestamp: Date.now() });
    localStorage.setItem("questionHistory", JSON.stringify(history));
  };

  const wasRecentlyAsked = (q) => {
    const history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return history.some(item => item.question === q && item.timestamp > oneDayAgo);
  };

  const handleUpgrade = async () => {
    if (!user?.id) { openSignIn(); return; }
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, email: user?.primaryEmailAddress?.emailAddress }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  // --- Normal question grade ---
  const handleGrade = async () => {
    if (timerOn && timeLeft !== null && timeLeft > 0) freezeTimer();
    setLoadingFeedback(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userAnswer }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      setScore(data.score ?? null);
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
              userAnswer: userAnswer.trim() || "No answer was submitted.",
              feedback: data.feedback,
              score: data.score ?? null,
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

  // --- Normal question fetch ---
  const getQuestion = async () => {
    setLoadingQuestion(true);
    setAnswer(""); setAnswerRevealed(false); setQuestion(""); setUserAnswer("");
    setFeedback(""); setScore(null); setGraded(false);
    stopTimer(); setTimerStarted(false); setIsPaused(false);
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
        if (!wasRecentlyAsked(data.result)) newQuestion = data.result;
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
        }).then(r => r.json()).then(data => { setAnswer(data.result); });
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
      setAnswer(current => current || data.result);
    } catch (error) {
      console.log("Error:", error);
    }
    setLoadingAnswer(false);
  };

  // --- Interview Mode: generate ---
  const generateInterview = async () => {
    setLoadingInterviewGenerate(true);
    setInterviewSession(null);
    setInterviewStep(0);
    setInterviewUserAnswers([]);
    setInterviewResponses([]);
    setInterviewCurrentAnswer("");
    setInterviewComplete(false);
    setInterviewDebrief(null);
    setInterviewAnswersRevealed(false);
    stopInterviewTimer();
    try {
      const res = await fetch("/api/interview-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: decodeURIComponent(category),
          difficulty: decodeURIComponent(difficulty),
          math: decodeURIComponent(math),
          customPrompt: customPrompt && decodeURIComponent(customPrompt) !== "undefined" ? decodeURIComponent(customPrompt) : null,
        }),
      });
      const data = await res.json();
      setInterviewSession(data); // data includes resolvedCategory if category was "All"
    } catch (error) {
      console.log("Error:", error);
    }
    setLoadingInterviewGenerate(false);
  };

  // --- Interview Mode: submit answer for current step ---
  const handleInterviewSubmit = async () => {
    if (!interviewSession) return;
    if (interviewTimeLeft !== null && interviewTimeLeft > 0) freezeInterviewTimer();
    setLoadingInterviewRespond(true);
    const stepIndex = interviewStep;
    const q = interviewSession.questions[stepIndex];
    const isLast = stepIndex === INTERVIEW_QUESTIONS - 1;
    const submittedAnswer = interviewCurrentAnswer;

    try {
      const res = await fetch("/api/interview-respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: interviewSession.scenario,
          questionIndex: stepIndex,
          question: q.question,
          idealAnswer: q.idealAnswer,
          userAnswer: submittedAnswer,
          isLast,
        }),
      });
      const data = await res.json();

      const newAnswers = [...interviewUserAnswers, submittedAnswer.trim() || "No answer was submitted."];
      const newResponses = [...interviewResponses, data];
      setInterviewUserAnswers(newAnswers);
      setInterviewResponses(newResponses);
      setInterviewCurrentAnswer("");
      stopInterviewTimer();

      if (isLast) {
        setInterviewComplete(true);
        // Save to history
        if (user?.id) {
          const questionsForHistory = interviewSession.questions.map((q, i) => ({
            question: q.question,
            idealAnswer: q.idealAnswer,
            userAnswer: newAnswers[i] || "No answer was submitted.",
            score: newResponses[i]?.score ?? null,
            feedback: newResponses[i]?.response || "",
          }));
          const scores = questionsForHistory.map(q => q.score).filter(s => s !== null);
          const overallScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;

          await fetch("/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              entry: {
                type: "interview",
                scenario: interviewSession.scenario,
                questions: questionsForHistory,
                score: overallScore,
                category: interviewSession.resolvedCategory || decodeURIComponent(category),
                difficulty: decodeURIComponent(difficulty),
                math: decodeURIComponent(math),
                customPrompt: customPrompt && decodeURIComponent(customPrompt) !== "undefined" ? decodeURIComponent(customPrompt) : null,
                timestamp: Date.now(),
              }
            }),
          });
        }
      } else {
        setInterviewStep(stepIndex + 1);
      }
    } catch (error) {
      console.log("Error:", error);
    }
    setLoadingInterviewRespond(false);
  };

  // --- Interview Mode: fetch debrief ---
  const handleInterviewDebrief = async () => {
    if (!interviewSession) return;
    setLoadingDebrief(true);
    const questionsForDebrief = interviewSession.questions.map((q, i) => ({
      question: q.question,
      idealAnswer: q.idealAnswer,
      userAnswer: interviewUserAnswers[i] || "No answer was submitted.",
      score: interviewResponses[i]?.score ?? null,
    }));
    try {
      const res = await fetch("/api/interview-debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: interviewSession.scenario,
          questions: questionsForDebrief,
          category: decodeURIComponent(category),
          difficulty: decodeURIComponent(difficulty),
        }),
      });
      const data = await res.json();
      setInterviewDebrief(data.feedback);
    } catch (error) {
      console.log("Error:", error);
    }
    setLoadingDebrief(false);
  };

  const interviewOverallScore = interviewResponses.length > 0
    ? Math.round((interviewResponses.reduce((a, r) => a + (r.score ?? 0), 0) / interviewResponses.length) * 10) / 10
    : null;

  const getScoreColor = (s) => s >= 8 ? "#16a34a" : s >= 5 ? "#d97706" : "#dc2626";
  const getScoreBg = (s) => s >= 8 ? "#dcfce7" : s >= 5 ? "#fff7ed" : "#fee2e2";

  const isPolling = loadingQuestion || loadingInterviewGenerate;
  const canToggleInterviewMode = !interviewSession && !isPolling;

  return (
    <div style={styles.page} className="page-bg page-wrapper">
      <div style={{
        backgroundColor: "#f0f4f8", borderRadius: "16px", padding: "24px",
        width: "100%", maxWidth: "728px", boxSizing: "border-box",
        marginBottom: "16px", boxShadow: "0 0 40px 10px rgba(0, 0, 0, 0.4)",
      }} className="wrapper-mobile">
        <div style={styles.container}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }} className="header-mobile">
            <img
              src={isPaid ? "/Fite_Logo_Premium.png" : "/favicon.png"}
              alt="logo"
              style={{ height: "64px", width: "64px", cursor: "pointer" }}
              className="logo-img-mobile"
              onClick={() => navigate("/")}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ ...styles.logo, cursor: "pointer" }} className="logo-mobile" onClick={() => navigate("/")}>Fite Finance</h1>
                {isPaid && (
                  <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px", padding: "4px 10px", borderRadius: "20px", backgroundColor: "#c9a84c", color: "#ffffff" }}>
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
              <span style={{ ...styles.mathBadge, backgroundColor: "#e8edf5", color: "#4a6fa5" }}>{decodeURIComponent(difficulty)}</span>
              <span style={{ ...styles.mathBadge, backgroundColor: decodeURIComponent(math) === "With Math" ? "#0a2463" : "#e8edf5", color: decodeURIComponent(math) === "With Math" ? "#ffffff" : "#4a6fa5" }}>
                {decodeURIComponent(math)}
              </span>
              {customPrompt && decodeURIComponent(customPrompt) !== "" && decodeURIComponent(customPrompt) !== "undefined" && (
                <span style={{ ...styles.mathBadge, backgroundColor: "#c9a84c", color: "#ffffff" }}>"{decodeURIComponent(customPrompt)}"</span>
              )}
            </div>

            {/* Mode buttons row */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              {/* Timer button */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    if (!isPaid) { setShowTimerTooltip(true); setTimeout(() => setShowTimerTooltip(false), 2500); return; }
                    if (isPolling || timerStarted || (interviewSession && interviewTimerStarted)) return;
                    if (timerOn) { setTimerOn(false); stopTimer(); setTimerStarted(false); }
                    else { setTimerOn(true); }
                  }}
                  className={`timer-mode-btn${!isPaid ? " timer-mode-btn-free" : timerOn ? " timer-mode-btn-on" : ""}`}
                  style={{ cursor: (isPolling || timerStarted || (interviewSession && interviewTimerStarted)) ? "not-allowed" : undefined, opacity: (isPolling || timerStarted || (interviewSession && interviewTimerStarted)) ? 0.5 : 1 }}
                >
                  Timer {timerOn ? "ON" : "OFF"}
                </button>
                {showTimerTooltip && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1a1a2e", color: "#ffffff", fontSize: "12px", fontWeight: "600", padding: "6px 12px", borderRadius: "8px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                    Premium feature — upgrade to unlock
                    <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", backgroundColor: "#1a1a2e" }} />
                  </div>
                )}
              </div>

              {/* Interview Mode button */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    if (!canToggleInterviewMode && !interviewModeOn) return;
                    if (!isPaid) { setShowInterviewTooltip(true); setTimeout(() => setShowInterviewTooltip(false), 2500); return; }
                    if (interviewModeOn) {
                      setInterviewModeOn(false);
                      setInterviewSession(null);
                      setInterviewStep(0);
                      setInterviewUserAnswers([]);
                      setInterviewResponses([]);
                      setInterviewCurrentAnswer("");
                      setInterviewComplete(false);
                      setInterviewDebrief(null);
                      setInterviewAnswersRevealed(false);
                      stopInterviewTimer();
                    } else { setInterviewModeOn(true); }
                  }}
                  className={`interview-mode-btn${!isPaid ? " interview-mode-btn-free" : interviewModeOn ? " interview-mode-btn-on" : ""}`}
                  style={{ cursor: (!canToggleInterviewMode && !interviewModeOn) ? "not-allowed" : undefined, opacity: (!canToggleInterviewMode && !interviewModeOn) ? 0.5 : 1 }}
                >
                  Interview Mode {interviewModeOn ? "ON" : "OFF"}
                </button>
                {showInterviewTooltip && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1a1a2e", color: "#ffffff", fontSize: "12px", fontWeight: "600", padding: "6px 12px", borderRadius: "8px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                    Premium feature — upgrade to unlock
                    <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", backgroundColor: "#1a1a2e" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Get Question / Generate Interview button */}
            {!interviewModeOn ? (
              <button onClick={getQuestion} disabled={loadingQuestion || loadingAnswer} className="primary-btn">
                {loadingQuestion ? "Loading..." : "Get Question"}
              </button>
            ) : (
              <button onClick={generateInterview} disabled={loadingInterviewGenerate} className="primary-btn">
                {loadingInterviewGenerate ? "Generating..." : interviewSession ? "Generate New Interview" : "Generate Interview"}
              </button>
            )}

            {!isPaid && questionsUsed !== null && (
              <p style={{ fontSize: "12px", color: questionsUsed >= 4 ? "#d97706" : "#4a6fa5", margin: "8px 0 0 0", textAlign: "center", fontStyle: "italic" }}>
                {questionsUsed} of 5 free questions used today
              </p>
            )}

            {/* ── NORMAL QUESTION FLOW ── */}
            {!interviewModeOn && (
              <>
                {/* Timer bar */}
                {timerOn && question && !question.includes("Come back tomorrow") && (
                  <div
                    className={timerStarted && !isPaused && !graded && timeLeft > 0 ? (timeLeft < 30 ? "timer-bar-urgent" : "timer-bar-pulsing") : ""}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px",
                      padding: "10px 16px", borderRadius: "8px", marginTop: "16px",
                      backgroundColor: !timerStarted ? "#e8f4f8" : graded && timeLeft > 0 ? "#f0fdf4" : timeLeft === 0 ? "#fee2e2" : timeLeft < 30 ? "#fff7ed" : "#e8f4f8",
                      border: `1px solid ${!timerStarted ? "#a8d4e0" : graded && timeLeft > 0 ? "#86efac" : timeLeft === 0 ? "#fca5a5" : timeLeft < 30 ? "#fed7aa" : "#a8d4e0"}`,
                    }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#0e7490", letterSpacing: "1px" }}>TIMER</span>
                    {!timerStarted ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button onClick={() => setCustomTimeSec(prev => Math.max(30, prev - 30))} className="timer-step-btn">−</button>
                          <span style={{ fontSize: "15px", fontWeight: "700", fontFamily: "monospace", color: "#0e7490", minWidth: "38px", textAlign: "center" }}>{formatTime(customTimeSec)}</span>
                          <button onClick={() => setCustomTimeSec(prev => Math.min(600, prev + 30))} className="timer-step-btn">+</button>
                        </div>
                        <button onClick={() => { setTimerStarted(true); startTimer(); }} className="start-answering-btn">Start Answering</button>
                      </div>
                    ) : timeLeft === 0 ? (
                      <span style={{ fontSize: "16px", fontWeight: "700", fontFamily: "monospace", color: "#dc2626" }}>Time's up!</span>
                    ) : graded ? (
                      <span style={{ fontSize: "16px", fontWeight: "700", fontFamily: "monospace", color: "#0e7490" }}>{formatTime(timeLeft)} remaining</span>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button onClick={isPaused ? resumeTimer : pauseTimer} className={isPaused ? "timer-resume-btn" : "timer-pause-btn"}>{isPaused ? "Resume" : "Pause"}</button>
                        <span style={{ fontSize: "16px", fontWeight: "700", fontFamily: "monospace", color: timeLeft < 30 ? "#d97706" : "#0e7490", opacity: isPaused ? 0.5 : 1 }}>{formatTime(timeLeft)}</span>
                      </div>
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
                          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px", padding: "3px 8px", borderRadius: "20px", backgroundColor: isPaid ? "#c9a84c" : "#e8edf5", color: isPaid ? "#ffffff" : "#4a6fa5" }}>PREMIUM</span>
                        </p>
                        <textarea
                          placeholder={isPaid ? "Type your answer here to get AI feedback..." : "Upgrade to Premium to get AI feedback on your answers"}
                          value={userAnswer}
                          onChange={(e) => isPaid && !(timerOn && (!timerStarted || timeLeft === 0 || graded)) && setUserAnswer(e.target.value)}
                          disabled={!isPaid || (timerOn && (!timerStarted || timeLeft === 0 || graded))}
                          style={{
                            width: "100%", minHeight: "120px", padding: "12px 16px", borderRadius: "8px",
                            border: "2px solid #e8edf5", fontSize: "14px", color: isPaid ? "#1a1a2e" : "#a0aec0",
                            fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", outline: "none",
                            backgroundColor: isPaid ? "#ffffff" : "#f7f9fc", cursor: isPaid ? "text" : "not-allowed", resize: "vertical",
                          }}
                        />
                        {isPaid && (
                          <button onClick={handleGrade} disabled={loadingFeedback || !userAnswer.trim() || graded || (timerOn && !timerStarted)} className="secondary-btn" style={{ marginTop: "12px" }}>
                            {loadingFeedback ? "Grading..." : graded ? "Graded ✓" : "Grade My Answer"}
                          </button>
                        )}
                      </div>
                    )}

                    {feedback && (
                      <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#f0f4f8", borderRadius: "8px", borderLeft: `4px solid ${score !== null ? getScoreColor(score) : "#0a2463"}` }}>
                        {score !== null && (
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: getScoreBg(score), border: `2px solid ${getScoreColor(score)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: "18px", fontWeight: "700", color: getScoreColor(score) }}>{score}</span>
                            </div>
                            <div>
                              <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 2px 0" }}>SCORE</p>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e", margin: 0 }}>{score} / 10</p>
                            </div>
                          </div>
                        )}
                        <p style={{ ...styles.label, marginBottom: "8px" }}>FEEDBACK</p>
                        <p style={{ fontSize: "14px", color: "#1a1a2e", lineHeight: "1.6", margin: 0 }}>{feedback}</p>
                      </div>
                    )}

                    {question.includes("Come back tomorrow") ? (
                      <button className="upgrade-btn" onClick={handleUpgrade} style={{ width: "100%", display: "block", marginTop: "16px" }}>⭐ Upgrade for {price || "$3/month"}</button>
                    ) : (
                      <button onClick={getAnswer} disabled={loadingQuestion || loadingAnswer || answerRevealed || (timerOn && !graded)} className="secondary-btn">
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
              </>
            )}

            {/* ── INTERVIEW MODE FLOW ── */}
            {interviewModeOn && interviewSession && (
              <div style={styles.section}>
                {/* Scenario */}
                <div style={{ backgroundColor: "#0a2463", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#a8c4e8", letterSpacing: "1.2px", margin: "0 0 8px 0" }}>SCENARIO</p>
                  <p style={{ fontSize: "14px", color: "#ffffff", lineHeight: "1.7", margin: 0 }}>{interviewSession.scenario}</p>
                </div>

                {/* Progress indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
                  {interviewSession.questions.map((_, i) => {
                    const done = i < interviewStep || interviewComplete;
                    const current = i === interviewStep && !interviewComplete;
                    return (
                      <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: done ? "#0a2463" : current ? "#4a6fa5" : "#e8edf5", transition: "background-color 0.3s" }} />
                    );
                  })}
                  <span style={{ fontSize: "11px", color: "#4a6fa5", fontWeight: "700", flexShrink: 0, marginLeft: "4px" }}>
                    {interviewComplete ? "Complete" : `Q${interviewStep + 1} of ${INTERVIEW_QUESTIONS}`}
                  </span>
                </div>

                {/* Completed steps (read-only) */}
                {interviewUserAnswers.map((ans, i) => (
                  <div key={i} style={{ marginBottom: "20px", borderTop: i > 0 ? "1px solid #e8edf5" : "none", paddingTop: i > 0 ? "20px" : "0" }}>
                    <div style={{ borderLeft: "3px solid #0a2463", paddingLeft: "14px", marginBottom: "10px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 6px 0" }}>QUESTION {i + 1}</p>
                      <p style={{ fontSize: "14px", color: "#1a1a2e", lineHeight: "1.6", margin: 0, fontWeight: "500" }}>{interviewSession.questions[i].question}</p>
                    </div>
                    <div style={{ backgroundColor: "#f7f9fc", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px", border: "1px solid #e8edf5" }}>
                      <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 4px 0" }}>YOUR ANSWER</p>
                      <p style={{ fontSize: "13px", color: "#1a1a2e", lineHeight: "1.5", margin: 0 }}>{ans}</p>
                    </div>
                    {interviewResponses[i] && (
                      <div style={{ backgroundColor: interviewResponses[i].onTrack ? "#f0fdf4" : "#fff7ed", borderRadius: "8px", padding: "12px 14px", borderLeft: `3px solid ${interviewResponses[i].onTrack ? "#16a34a" : "#d97706"}`, display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <div style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "50%", backgroundColor: getScoreBg(interviewResponses[i].score), border: `2px solid ${getScoreColor(interviewResponses[i].score)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: getScoreColor(interviewResponses[i].score) }}>{interviewResponses[i].score}</span>
                        </div>
                        <p style={{ fontSize: "13px", color: "#1a1a2e", lineHeight: "1.6", margin: 0 }}>{interviewResponses[i].response}</p>
                      </div>
                    )}
                    {/* Ideal answer revealed */}
                    {interviewAnswersRevealed && (
                      <div style={{ marginTop: "8px", backgroundColor: "#e8edf5", borderRadius: "8px", padding: "12px 14px", border: "1px solid #c8d4e8" }}>
                        <p style={{ fontSize: "11px", fontWeight: "700", color: "#0a2463", letterSpacing: "1px", margin: "0 0 4px 0" }}>IDEAL ANSWER</p>
                        <p style={{ fontSize: "13px", color: "#1a1a2e", lineHeight: "1.6", margin: 0 }}>{interviewSession.questions[i].idealAnswer}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Current question input */}
                {!interviewComplete && (
                  <div>
                    <div style={{ borderLeft: "3px solid #4a6fa5", paddingLeft: "14px", marginBottom: "14px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 6px 0" }}>QUESTION {interviewStep + 1}</p>
                      <p style={{ fontSize: "15px", color: "#1a1a2e", lineHeight: "1.6", margin: 0, fontWeight: "500" }}>{interviewSession.questions[interviewStep].question}</p>
                    </div>

                    {/* Per-question timer bar */}
                    {timerOn && (
                    <div
                      className={interviewTimerStarted && !interviewTimerPaused && interviewTimeLeft > 0 ? (interviewTimeLeft < 30 ? "timer-bar-urgent" : "timer-bar-pulsing") : ""}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px",
                        padding: "10px 16px", borderRadius: "8px", marginBottom: "12px",
                        backgroundColor: !interviewTimerStarted ? "#e8f4f8" : interviewTimeLeft === 0 ? "#fee2e2" : interviewTimeLeft < 30 ? "#fff7ed" : "#e8f4f8",
                        border: `1px solid ${!interviewTimerStarted ? "#a8d4e0" : interviewTimeLeft === 0 ? "#fca5a5" : interviewTimeLeft < 30 ? "#fed7aa" : "#a8d4e0"}`,
                      }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#0e7490", letterSpacing: "1px" }}>
                        TIMER — Q{interviewStep + 1} of {INTERVIEW_QUESTIONS}
                      </span>
                      {!interviewTimerStarted ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button onClick={() => setInterviewCustomTime(prev => Math.max(30, prev - 30))} className="timer-step-btn">−</button>
                            <span style={{ fontSize: "15px", fontWeight: "700", fontFamily: "monospace", color: "#0e7490", minWidth: "38px", textAlign: "center" }}>{formatTime(interviewCustomTime)}</span>
                            <button onClick={() => setInterviewCustomTime(prev => Math.min(600, prev + 30))} className="timer-step-btn">+</button>
                          </div>
                          <button onClick={startInterviewTimer} className="start-answering-btn">Start Answering</button>
                        </div>
                      ) : interviewTimeLeft === 0 ? (
                        <span style={{ fontSize: "16px", fontWeight: "700", fontFamily: "monospace", color: "#dc2626" }}>Time's up!</span>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button onClick={interviewTimerPaused ? resumeInterviewTimer : pauseInterviewTimer} className={interviewTimerPaused ? "timer-resume-btn" : "timer-pause-btn"}>{interviewTimerPaused ? "Resume" : "Pause"}</button>
                          <span style={{ fontSize: "16px", fontWeight: "700", fontFamily: "monospace", color: interviewTimeLeft < 30 ? "#d97706" : "#0e7490", opacity: interviewTimerPaused ? 0.5 : 1 }}>{formatTime(interviewTimeLeft)}</span>
                        </div>
                      )}
                    </div>
                    )}

                    <textarea
                      placeholder="Type your response..."
                      value={interviewCurrentAnswer}
                      onChange={(e) => !loadingInterviewRespond && setInterviewCurrentAnswer(e.target.value)}
                      disabled={loadingInterviewRespond || interviewTimeLeft === 0 || (timerOn && !interviewTimerStarted)}
                      style={{
                        width: "100%", minHeight: "120px", padding: "12px 16px", borderRadius: "8px",
                        border: "2px solid #e8edf5", fontSize: "14px", color: "#1a1a2e",
                        fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", outline: "none",
                        backgroundColor: "#ffffff", resize: "vertical",
                      }}
                    />
                    <button
                      onClick={handleInterviewSubmit}
                      disabled={loadingInterviewRespond}
                      className="primary-btn"
                      style={{ marginTop: "12px" }}
                    >
                      {loadingInterviewRespond ? "Analyzing..." : interviewStep === INTERVIEW_QUESTIONS - 1 ? "Submit Final Answer" : "Submit Answer"}
                    </button>
                  </div>
                )}

                {/* Interview complete — debrief + show answers */}
                {interviewComplete && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ borderTop: "2px solid #e8edf5", paddingTop: "20px", marginTop: "8px" }}>
                      {/* Overall score */}
                      {interviewOverallScore !== null && (
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", backgroundColor: "#f0f4f8", borderRadius: "10px", padding: "16px" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: getScoreBg(interviewOverallScore), border: `2px solid ${getScoreColor(interviewOverallScore)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: "20px", fontWeight: "700", color: getScoreColor(interviewOverallScore) }}>{interviewOverallScore}</span>
                          </div>
                          <div>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: "#4a6fa5", letterSpacing: "1px", margin: "0 0 2px 0" }}>OVERALL SCORE</p>
                            <p style={{ fontSize: "11px", fontWeight: "600", color: "#1a1a2e", margin: 0 }}>{interviewOverallScore} / 10 — average across {INTERVIEW_QUESTIONS} questions</p>
                          </div>
                        </div>
                      )}

                      {/* Debrief */}
                      {!interviewDebrief && !loadingDebrief && (
                        <button onClick={handleInterviewDebrief} className="secondary-btn" style={{ marginBottom: "12px" }}>
                          Get Full Debrief
                        </button>
                      )}
                      {loadingDebrief && <p style={{ fontSize: "14px", color: "#4a6fa5", margin: "0 0 12px 0" }}>Generating debrief...</p>}
                      {interviewDebrief && (
                        <div style={{ backgroundColor: "#f0f4f8", borderRadius: "8px", padding: "16px", borderLeft: "4px solid #0a2463", marginBottom: "16px" }}>
                          <p style={{ ...styles.label, marginBottom: "8px" }}>DEBRIEF</p>
                          <p style={{ fontSize: "14px", color: "#1a1a2e", lineHeight: "1.6", margin: 0 }}>{interviewDebrief}</p>
                        </div>
                      )}

                      {/* Show ideal answers */}
                      <button
                        onClick={() => setInterviewAnswersRevealed(!interviewAnswersRevealed)}
                        className="secondary-btn"
                      >
                        {interviewAnswersRevealed ? "Hide Ideal Answers" : "Show Ideal Answers"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {interviewModeOn && !interviewSession && !loadingInterviewGenerate && (
              <p style={{ fontSize: "13px", color: "#4a6fa5", margin: "16px 0 0 0", textAlign: "center", fontStyle: "italic" }}>
                Interview Mode generates a realistic scenario with {INTERVIEW_QUESTIONS} structured follow-up questions.
              </p>
            )}
            {loadingInterviewGenerate && (
              <p style={{ fontSize: "13px", color: "#4a6fa5", margin: "16px 0 0 0", textAlign: "center", fontStyle: "italic" }}>
                Building your one off interview scenario...
              </p>
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
    fontFamily: "'Segoe UI', sans-serif" 
  },
  container: { width: "100%" },
  logo: { 
    fontSize: "32px", 
    fontWeight: "700", 
    color: "#0a2463", 
    margin: "0 0 6px 0", 
    cursor: "default" 
  },
  tagline: { 
    fontSize: "15px", 
    color: "#4a6fa5", 
    margin: 0, 
    cursor: "default" 
  },
  card: { 
    backgroundColor: "#ffffff", 
    borderRadius: "12px", 
    padding: "36px", 
    boxShadow: "0 2px 16px rgba(10, 36, 99, 0.08)" 
  },
  categoryHeader: { 
    display: "flex", 
    alignItems: "center", 
    gap: "16px", 
    marginBottom: "24px" 
  },
  categoryLabel: { 
    fontSize: "18px", 
    fontWeight: "700", 
    color: "#0a2463", 
    margin: 0 
  },
  section: { 
    marginTop: "28px", 
    borderTop: "1px solid #e8edf5", 
    paddingTop: "24px" },
  label: { 
    fontSize: "11px", 
    fontWeight: "700", 
    color: "#4a6fa5", 
    letterSpacing: "1.2px", 
    margin: "0 0 10px 0" 
  },
  text: { 
    fontSize: "16px", 
    color: "#1a1a2e", 
    lineHeight: "1.7", 
    margin: 0 
  },
  mathBadge: { 
    fontSize: "11px", 
    fontWeight: "700", 
    letterSpacing: "0.8px", 
    padding: "4px 10px", 
    borderRadius: "20px" 
  },
};

export default Questions;

import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const getQuestion = async () => {
    setLoading(true);
    setAnswer("");
    setQuestion("");
    const res = await fetch("/api/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "question" }),
    });
    const data = await res.json();
    setQuestion(data.result);
    setLoading(false);
  };

  const getAnswer = async () => {
    setLoading(true);
    const res = await fetch("/api/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "answer", question }),
    });
    const data = await res.json();
    setAnswer(data.result);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "60px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>Fite — Finance Interview Practice</h1>
      <button onClick={getQuestion} disabled={loading}>
        {loading ? "Loading..." : "Get Question"}
      </button>

      {question && (
        <div style={{ marginTop: "30px" }}>
          <h3>Question:</h3>
          <p>{question}</p>
          <button onClick={getAnswer} disabled={loading}>
            {loading ? "Loading..." : "Show Answer"}
          </button>
        </div>
      )}

      {answer && (
        <div style={{ marginTop: "30px" }}>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
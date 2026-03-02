import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import { useUser } from "@clerk/clerk-react";
import "./App.css";

const categories = [
  "All",
  "Investment Banking",
  "Private Equity",
  "Asset Management",
  "Accounting",
  "Financial Modeling",
  "Valuation",
  "Sales and Trading",
];

const difficulties = ["Easy", "Medium", "Hard"];

function Home() {
  const navigate = useNavigate();
  const { isPaid } = usePaidStatus();
  const { user } = useUser();
  const [difficulty, setDifficulty] = useState("Medium");
  const [math, setMath] = useState("No Math");

  const handleManageSubscription = async () => {
    const res = await fetch("/api/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        {isPaid && (
          <button
            onClick={handleManageSubscription}
            style={{ fontSize: "13px", color: "#4a6fa5", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Manage Subscription
          </button>
        )}
        <div style={styles.byline}>
          by Colgate's finest
        </div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="primary-btn" style={{ width: "auto", padding: "10px 20px" }}>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      <div style={styles.container}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img
              src={isPaid ? "/Fite_Logo_Premium.png" : "/favicon.png"}
              alt="logo"
              style={{ height: "64px", width: "64px" }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={styles.logo}>Fite Finance</h1>
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
                    ⭐ PREMIUM
                  </span>
                )}
              </div>
              <p style={styles.tagline}>The finance site sharpening your interview skills</p>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <p style={styles.prompt}>Select a difficulty:</p>
          <div style={styles.difficultyRow}>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`difficulty-btn ${difficulty === d ? "difficulty-btn-active" : ""}`}
              >
                {d}
              </button>
            ))}
          </div>

          <p style={{ ...styles.prompt, marginTop: "24px" }}>Math or no math:</p>
          <div style={styles.difficultyRow}>
            {["With Math", "No Math"].map((m) => (
              <button
                key={m}
                onClick={() => setMath(m)}
                className={`difficulty-btn ${math === m ? "difficulty-btn-active" : ""}`}
              >
                {m}
              </button>
            ))}
          </div>

          <p style={{ ...styles.prompt, marginTop: "24px" }}>Select a category to get started:</p>
          <div style={styles.grid}>
            {categories.map((cat) => (
              <button
                key={cat}
                className="category-btn"
                onClick={() => navigate(`/questions/${encodeURIComponent(cat)}/${encodeURIComponent(difficulty)}/${encodeURIComponent(math)}`)}
              >
                {cat}
              </button>
            ))}
          </div>
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
  prompt: {
    fontSize: "15px",
    color: "#0a2463",
    fontWeight: "600",
    margin: "0 0 12px 0",
  },
  difficultyRow: {
    display: "flex",
    gap: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  navbar: {
    position: "fixed",
    top: "0",
    right: "0",
    padding: "16px 24px",
  },
  byline: {
    position: "fixed",
    top: "0",
    left: "0",
    padding: "16px 24px",
    fontSize: "13px",
    color: "#5a060d",
    fontStyle: "italic",
  },
};

export default Home;
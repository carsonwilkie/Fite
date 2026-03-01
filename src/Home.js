import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
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
  const isPaid = usePaidStatus();
  const [difficulty, setDifficulty] = useState("Medium");
  const [math, setMath] = useState("No Math");

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
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
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img
              src={isPaid ? "/Fite_Logo_Premium.png" : "/favicon.png"}
              alt="logo"
              style={{ height: "64px", width: "64px" }}
            />
            <div>
              <h1 style={{ ...styles.logo, color: isPaid ? "#c9a84c" : "#0a2463" }}>
                Fite Finance {isPaid && <span style={{ fontSize: "14px", fontWeight: "600" }}>⭐ Premium</span>}
              </h1>
              <p style={{ ...styles.tagline, color: isPaid ? "#c9a84c" : "#4a6fa5" }}>
                The finance site sharpening your interview skills
              </p>
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
    backgroundColor: isPaid ? "#1a1400" : "#f0f4f8",
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
};

export default Home;
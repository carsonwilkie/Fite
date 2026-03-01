import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
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

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
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
          <p style={styles.prompt}>Select a category to get started:</p>
          {categories.map((cat) => (
            <button
              key={cat}
              className="category-btn"
              onClick={() => navigate(`/questions/${encodeURIComponent(cat)}`)}
            >
              {cat}
            </button>
          ))}
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
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  prompt: {
    fontSize: "15px",
    color: "#0a2463",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
};

export default Home;
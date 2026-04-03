import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import usePaidStatus from "./usePaidStatus";
import { CATEGORIES as categories } from "./constants";
import ElectricBorder from "./ElectricBorder";
import PremiumBadge from "./PremiumBadge";
import "./App.css";

const difficulties = ["Easy", "Medium", "Hard"];

function Home() {
  const navigate = useNavigate();
  const { isPaid } = usePaidStatus();
  const [difficulty, setDifficulty] = useState(() => sessionStorage.getItem("difficulty") || "");
  const [math, setMath] = useState(() => sessionStorage.getItem("math") || "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showCustomTooltip, setShowCustomTooltip] = useState(false);

  return (
    <div style={styles.page} className="page-bg page-wrapper">
      <ElectricBorder active={isPaid}>
      <div style={{
        backgroundColor: "#f0f4f8",
        borderRadius: "16px",
        padding: "24px",
        width: "100%",
        maxWidth: "728px",
        boxSizing: "border-box",
        boxShadow: "0 0 40px 10px rgba(0, 0, 0, 0.4)",
      }} className="wrapper-mobile">
        <div style={styles.container}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "26px" }} className="header-mobile">
            <img
              src={isPaid ? "/Fite_Logo_Premium.png" : "/favicon.png"}
              alt="logo"
              style={{ height: "64px", width: "64px" }}
              className="logo-img-mobile"
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={styles.logo} className="logo-mobile">Fite Finance</h1>
                {isPaid && <PremiumBadge />}
              </div>
              <p style={styles.tagline} className="tagline-mobile">The finance site sharpening your interview skills</p>
            </div>
          </div>

          <div style={styles.card} className="card-mobile">
            <p style={styles.prompt}>Select a difficulty:</p>
            <div style={styles.difficultyRow}>
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => { setDifficulty(d); sessionStorage.setItem("difficulty", d); }}
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
                  onClick={() => { setMath(m); sessionStorage.setItem("math", m); }}
                  className={`difficulty-btn ${math === m ? "difficulty-btn-active" : ""}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <p style={{ ...styles.prompt, marginTop: "24px" }}>Select a category to get started:</p>
            <div style={styles.grid} className="grid-mobile">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className="category-btn"
                  onClick={() => navigate(`/questions/${encodeURIComponent(cat)}/${encodeURIComponent(difficulty || "Medium")}/${encodeURIComponent(math || "No Math")}/${encodeURIComponent(customPrompt)}`)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ marginTop: "24px", borderTop: "1px solid #e8edf5", paddingTop: "24px" }}>
              <p style={{ ...styles.prompt, display: "flex", alignItems: "center", gap: "8px" }}>
                {isPaid ? <PremiumBadge small /> : (
                <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px", padding: "3px 8px", borderRadius: "20px", backgroundColor: "#e8edf5", color: "#4a6fa5" }}>PREMIUM</span>
              )}
                Custom question descriptor (optional):
              </p>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder={isPaid ? 'e.g. "LBO modeling" or "merger consequences"' : "Upgrade to Premium to use this feature"}
                  value={customPrompt}
                  onChange={(e) => { if (isPaid) { setCustomPrompt(e.target.value); }}}
                  disabled={!isPaid}
                  style={{
                    width: "100%",
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
                  }}
                />
                {!isPaid && (
                  <div
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, cursor: "not-allowed" }}
                    onClick={() => { setShowCustomTooltip(true); setTimeout(() => setShowCustomTooltip(false), 2500); }}
                  />
                )}
                {showCustomTooltip && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#1a1a2e",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}>
                    Premium feature — upgrade to unlock
                    <div style={{
                      position: "absolute",
                      top: "-5px",
                      left: "50%",
                      transform: "translateX(-50%) rotate(45deg)",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#1a1a2e",
                    }} />
                  </div>
                )}
              </div>
              <p style={{ fontSize: "12px", fontStyle: "italic", color: "#4a6fa5", margin: "6px 0 0 0" }}>
                Tailor your questions to your specific needs. Add a descriptor, then select a category.
              </p>
            </div>
          </div>
        </div>
      </div>
      </ElectricBorder>
      <p style={{ textAlign: "center", fontSize: "12px", color: "#4a6fa5", marginTop: "12px", marginBottom: "4px", fontStyle: "italic" }}>
        For help, contact <a href="mailto:support@fitefinance.com" style={{ color: "#4a6fa5" }}>support@fitefinance.com</a>
      </p>
      <p style={{ textAlign: "center", fontSize: "11px", color: "#4a6fa5", marginTop: "4px", marginBottom: "12px" }}>
        <Link to="/privacy" style={{ color: "#4a6fa5" }}>Privacy Policy</Link>
        {" · "}
        <Link to="/terms" style={{ color: "#4a6fa5" }}>Terms of Service</Link>
        {" · "}
        <Link to="/refunds" style={{ color: "#4a6fa5" }}>Refund Policy</Link>
      </p>
      <p className="byline-bottom" style={{ textAlign: "center", fontSize: "10px", color: "#5a060d", fontStyle: "italic", marginTop: "4px", marginBottom: "12px", display: "none" }}>
        by Colgate's finest
      </p>
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
    padding: "80px 20px 40px 20px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: {
    width: "100%",
  },
  header: {
    marginBottom: "32px",
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
};

export default Home;
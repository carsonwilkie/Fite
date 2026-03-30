import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import usePaidStatus from "./usePaidStatus";
import "./App.css";

function Success() {
  const navigate = useNavigate();
  const { isPaid, loading } = usePaidStatus();

  if (loading) return null;
  if (!isPaid) {
    navigate("/");
    return null;
  }

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
              style={{ height: "64px", width: "64px", cursor: "pointer" }}
              className="logo-img-mobile"
              onClick={() => navigate("/")}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ ...styles.logo, cursor: "pointer" }} className="logo-mobile" onClick={() => navigate("/")}>Fite Finance</h1>
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

          <div style={styles.card}>
            <h2 style={styles.title}>You're all set! 🎉</h2>
            <p style={styles.text}>Welcome to <span style={{ color: "#c9a84c", fontWeight: "700" }}>Fite Finance Premium</span>. You now have unlimited access to all finance interview questions.</p>
            <button
              className="primary-btn"
              style={{ marginTop: "24px" }}
              onClick={() => navigate("/")}
            >
              Start Practicing
            </button>
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
    maxWidth: "680px",
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
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0a2463",
    margin: "0 0 16px 0",
  },
  text: {
    fontSize: "16px",
    color: "#4a6fa5",
    lineHeight: "1.6",
    margin: 0,
  },
};

export default Success;
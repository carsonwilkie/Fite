import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import "./App.css";

function Success() {
  const navigate = useNavigate();
  const { isPaid, loading } = usePaidStatus();

  if (loading) return null;

  return (
    <div style={{ ...styles.page, backgroundColor: isPaid ? "#1a1400" : "#f0f4f8" }}>
      <div style={styles.navbar}>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="primary-btn" style={{ width: "auto", padding: "10px 20px" }}>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
      <div style={styles.container}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
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

        <div style={styles.card}>
          <h2 style={styles.title}>You're all set! 🎉</h2>
          <p style={styles.text}>Welcome to Fite Finance Premium. You now have unlimited access to all finance interview questions.</p>
          <button
            className="primary-btn"
            style={{ marginTop: "24px" }}
            onClick={() => navigate("/")}
          >
            Start Practicing
          </button>
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
  navbar: {
    position: "fixed",
    top: "0",
    right: "0",
    padding: "16px 24px",
  },
};

export default Success;
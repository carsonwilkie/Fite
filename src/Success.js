import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import usePaidStatus from "./usePaidStatus";
import PremiumBadge from "./PremiumBadge";

// Confetti particle shapes
const CONFETTI_COLORS = ["#c9a84c", "#0a2463", "#4a6fa5", "#f5d06a", "#a87c2a", "#4FC3F7"];
const CONFETTI_COUNT = 18;

function ConfettiParticle({ delay, color, x, size, duration }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: 0,
        left: `${x}%`,
        width: size,
        height: size * 0.5,
        backgroundColor: color,
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 0,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: [null, 60, 120],
        opacity: [1, 1, 0],
        rotate: [0, 180, 360],
        scale: [1, 0.8, 0.4],
      }}
      transition={{ duration, delay, ease: "easeOut", times: [0, 0.6, 1] }}
    />
  );
}

function Success() {
  const router = useRouter();
  const { isPaid, loading } = usePaidStatus();
  const [showConfetti, setShowConfetti] = useState(true);

  // Confetti particles seeded
  const [particles] = useState(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      delay: i * 0.06,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: (i * 5.3 + 2) % 96,
      size: 8 + (i % 3) * 4,
      duration: 1.0 + (i % 3) * 0.3,
    }))
  );

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (loading) return null;
  if (!isPaid) {
    router.push("/");
    return null;
  }

  return (
    <div style={styles.page} className="page-bg page-wrapper">
      {/* Confetti overlay */}
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
          {particles.map((p) => (
            <ConfettiParticle key={p.id} {...p} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
        style={{
          backgroundColor: "#f0f4f8",
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "728px",
          boxSizing: "border-box",
          marginBottom: "16px",
          boxShadow: "0 0 40px 10px rgba(0, 0, 0, 0.4)",
          position: "relative",
          zIndex: 1,
        }}
        className="wrapper-mobile success-wrapper"
      >
        <div style={styles.container}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}
            className="header-mobile"
          >
            <motion.img
              src={isPaid ? "/Fite_Logo_Premium.png" : "/favicon.png"}
              alt="logo"
              style={{ height: "64px", width: "64px", cursor: "pointer" }}
              className="logo-img-mobile"
              onClick={() => router.push("/")}
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.15 }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ ...styles.logo, cursor: "pointer" }} className="logo-mobile" onClick={() => router.push("/")}>Fite Finance</h1>
                {isPaid && <PremiumBadge />}
              </div>
              <p style={styles.tagline} className="tagline-mobile">The finance site sharpening your interview skills</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={styles.card}
          >
            {/* Gold ring pulse behind checkmark */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.45 }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f5d06a 0%, #c9a84c 50%, #a87c2a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 32px rgba(201,168,76,0.5)",
                  position: "relative",
                }}
              >
                {/* Animated ring */}
                <motion.div
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    border: "2px solid rgba(201,168,76,0.6)",
                  }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M5 13l4 4L19 7"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
                  />
                </svg>
              </motion.div>
            </div>

            <h2 style={styles.title}>You're all set!</h2>
            <p style={styles.text}>
              Welcome to{" "}
              <span style={{ color: "#c9a84c", fontWeight: "700", position: "relative" }}>
                Fite Finance Premium
              </span>
              . You now have unlimited access to all finance interview questions.
            </p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "20px", marginBottom: "4px" }}
            >
              {["Unlimited Questions", "AI Answer Grading", "Question History", "Interview Mode", "Custom Descriptors"].map((feat, i) => (
                <motion.span
                  key={feat}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.07, type: "spring", stiffness: 300, damping: 22 }}
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    backgroundColor: "#e8edf5",
                    color: "#0a2463",
                    letterSpacing: "0.3px",
                  }}
                >
                  {feat}
                </motion.span>
              ))}
            </motion.div>

            <motion.button
              className="primary-btn"
              style={{ marginTop: "24px" }}
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(10,36,99,0.25)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              Start Practicing
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <p style={{ textAlign: "center", fontSize: "12px", color: "#4a6fa5", marginTop: "40px", marginBottom: "12px", fontStyle: "italic" }}>
          For help, contact <a href="mailto:support@fitefinance.com" style={{ color: "#4a6fa5" }}>support@fitefinance.com</a>
        </p>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#4a6fa5", marginTop: "12px", marginBottom: "12px" }}>
          <Link href="/privacy" style={{ color: "#4a6fa5" }}>Privacy Policy</Link>
          <span style={{ fontSize: "25px", verticalAlign: "middle" }}> · </span>
          <Link href="/terms" style={{ color: "#4a6fa5" }}>Terms of Service</Link>
          <span style={{ fontSize: "25px", verticalAlign: "middle" }}> · </span>
          <Link href="/refunds" style={{ color: "#4a6fa5" }}>Refund Policy</Link>
        </p>
        <p className="byline-bottom" style={{ textAlign: "center", fontSize: "12px", fontWeight: "bold", color: "#5a060d", fontFamily: "'Snell Roundhand', cursive", wordSpacing: "2px", marginTop: "4px", marginBottom: "12px", display: "none" }}>
          by Colgate's finest
        </p>
      </motion.div>
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

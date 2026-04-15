import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import usePaidStatus from "./usePaidStatus";
import { CATEGORIES as categories, DIFFICULTIES } from "./constants";
import ElectricBorder from "./ElectricBorder";
import PremiumBadge from "./PremiumBadge";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
};

function Home() {
  const router = useRouter();
  const { isPaid } = usePaidStatus();
  const [difficulty, setDifficulty] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("difficulty") || "" : "");
  const [math, setMath] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("math") || "" : "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showCustomTooltip, setShowCustomTooltip] = useState(false);

  return (
    <div style={styles.page} className="page-bg page-wrapper">
      <ElectricBorder active={isPaid}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backgroundColor: "#f0f4f8",
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "728px",
          boxSizing: "border-box",
          boxShadow: "0 0 40px 10px rgba(0, 0, 0, 0.4)",
        }}
        className="wrapper-mobile"
      >
        <div style={styles.container}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "26px" }}
            className="header-mobile"
          >
            <motion.img
              src={isPaid ? "/Fite_Logo_Premium.png" : "/Fite_Logo.png"}
              alt="logo"
              style={{ height: "64px", width: "64px" }}
              className="logo-img-mobile"
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={styles.logo} className="logo-mobile">Fite Finance</h1>
                {isPaid && <PremiumBadge />}
              </div>
              <p style={styles.tagline} className="tagline-mobile">The <strong>f</strong>inance s<strong>ite</strong> sharpening your interview skills</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            style={styles.card}
            className="card-mobile"
          >
            {/* Difficulty */}
            <p style={styles.prompt}>Select a difficulty:</p>
            <div style={styles.difficultyRow}>
              {DIFFICULTIES.map((d) => (
                <motion.button
                  key={d}
                  onClick={() => { setDifficulty(d); sessionStorage.setItem("difficulty", d); }}
                  className={`difficulty-btn ${difficulty === d ? "difficulty-btn-active" : ""}`}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ y: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {d}
                </motion.button>
              ))}
            </div>

            {/* Math */}
            <p style={{ ...styles.prompt, marginTop: "24px" }}>Math or no math:</p>
            <div style={styles.difficultyRow}>
              {["With Math", "No Math"].map((m) => (
                <motion.button
                  key={m}
                  onClick={() => { setMath(m); sessionStorage.setItem("math", m); }}
                  className={`difficulty-btn ${math === m ? "difficulty-btn-active" : ""}`}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ y: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {m}
                </motion.button>
              ))}
            </div>

            {/* Category grid with stagger */}
            <p style={{ ...styles.prompt, marginTop: "24px" }}>Select a category to get started:</p>
            <motion.div
              style={styles.grid}
              className="grid-mobile"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  variants={staggerItem}
                  className="category-btn"
                  onClick={() => router.push(`/questions/${encodeURIComponent(cat)}/${encodeURIComponent(difficulty || "Medium")}/${encodeURIComponent(math || "No Math")}/${encodeURIComponent(customPrompt)}`)}
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 16px rgba(10, 36, 99, 0.18)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                >
                  {cat}
                </motion.button>
              ))}
            </motion.div>

            {/* Custom prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              style={{ marginTop: "24px", borderTop: "1px solid #e8edf5", paddingTop: "24px" }}
            >
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
                <AnimatePresence>
                  {showCustomTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      style={{
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
                      }}
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p style={{ fontSize: "12px", fontStyle: "italic", color: "#4a6fa5", margin: "6px 0 0 0" }}>
                Tailor your questions to your specific needs. Add a descriptor, then select a category.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      </ElectricBorder>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <p style={{ textAlign: "center", fontSize: "12px", color: "#4a6fa5", marginTop: "40px", marginBottom: "4px", fontStyle: "italic" }}>
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

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import useUpgrade from "./useUpgrade";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

function Navbar() {
  const { user } = useUser();
  const { isPaid } = usePaidStatus();
  const router = useRouter();
  const handleUpgrade = useUpgrade();
  const [showHistoryTooltip, setShowHistoryTooltip] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef    = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (y > lastScrollY.current && y > 80) {
        el.style.transform = "translateY(-100%)";
      } else {
        el.style.transform = "translateY(0)";
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showTooltip = () => { setShowHistoryTooltip(true); setTimeout(() => setShowHistoryTooltip(false), 2500); };

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
    <div
      ref={navRef}
      style={{
        ...styles.navbar,
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), background-color 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease",
        backgroundColor: scrolled ? "rgba(10, 36, 99, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "none",
      }}
      className="navbar-fixed navbar-transparent"
    >
      <div className="byline-fixed" style={{ ...styles.byline, pointerEvents: "auto" }}>
        by Colgate's finest
      </div>
      <div style={{ pointerEvents: "auto" }}>
        <SignedOut>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <motion.button
              onClick={handleUpgrade}
              className="upgrade-btn manage-sub-btn"
              style={{ width: "auto", padding: "10px 20px" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ⭐ Upgrade to Premium
            </motion.button>
            <div style={{ position: "relative" }}>
              <button onClick={showTooltip} className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px", opacity: 0.5, cursor: "not-allowed" }}>
                History
              </button>
              <AnimatePresence>
                {showHistoryTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1a1a2e", color: "#ffffff", fontSize: "12px", fontWeight: "600", padding: "6px 12px", borderRadius: "8px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                  >
                    Premium feature — upgrade to unlock
                    <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", backgroundColor: "#1a1a2e" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <SignInButton mode="modal">
              <motion.button
                className="primary-btn manage-sub-btn"
                style={{ width: "auto", padding: "10px 20px" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isPaid ? (
              <>
                <motion.button
                  onClick={() => router.push("/history")}
                  className="primary-btn manage-sub-btn"
                  style={{ width: "auto", padding: "10px 20px" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  History
                </motion.button>
                <motion.button
                  onClick={handleManageSubscription}
                  className="primary-btn manage-sub-btn"
                  style={{ width: "auto", padding: "10px 20px" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Manage Subscription
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={handleUpgrade}
                  className="upgrade-btn manage-sub-btn"
                  style={{ width: "auto", padding: "10px 20px" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  ⭐ Upgrade to Premium
                </motion.button>
                <div style={{ position: "relative" }}>
                  <button onClick={showTooltip} className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px", opacity: 0.5, cursor: "not-allowed" }}>
                    History
                  </button>
                  <AnimatePresence>
                    {showHistoryTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1a1a2e", color: "#ffffff", fontSize: "12px", fontWeight: "600", padding: "6px 12px", borderRadius: "8px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                      >
                        Premium feature — upgrade to unlock
                        <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", backgroundColor: "#1a1a2e" }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "60px",
    backgroundColor: "transparent",
    zIndex: 100,
  },
  byline: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#5a060d",
    fontFamily: "'Snell Roundhand', cursive",
    wordSpacing: "2px",
    cursor: "default",
  },
};

export default Navbar;

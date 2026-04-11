import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import useUpgrade from "./useUpgrade";
import { useRouter } from "next/router";
import { useState } from "react";

function Navbar() {
  const { user } = useUser();
  const { isPaid } = usePaidStatus();
  const router = useRouter();
  const handleUpgrade = useUpgrade();
  const [showHistoryTooltip, setShowHistoryTooltip] = useState(false);

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
    <div style={styles.navbar} className="navbar-fixed navbar-transparent">
      <div className="byline-fixed" style={{ ...styles.byline, pointerEvents: "auto" }}>
        by Colgate's finest
      </div>
      <div style={{ pointerEvents: "auto" }}>
        <SignedOut>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={handleUpgrade} className="upgrade-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
              ⭐ Upgrade to Premium
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={showTooltip} className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px", opacity: 0.5, cursor: "not-allowed" }}>
                History
              </button>
              {showHistoryTooltip && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1a1a2e", color: "#ffffff", fontSize: "12px", fontWeight: "600", padding: "6px 12px", borderRadius: "8px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                  Premium feature — upgrade to unlock
                  <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", backgroundColor: "#1a1a2e" }} />
                </div>
              )}
            </div>
            <SignInButton mode="modal">
              <button className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isPaid ? (
              <>
                <button onClick={() => router.push("/history")} className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
                  History
                </button>
                <button onClick={handleManageSubscription} className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
                  Manage Subscription
                </button>
              </>
            ) : (
              <>
                <button onClick={handleUpgrade} className="upgrade-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
                  ⭐ Upgrade to Premium
                </button>
                <div style={{ position: "relative" }}>
                  <button onClick={showTooltip} className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px", opacity: 0.5, cursor: "not-allowed" }}>
                    History
                  </button>
                  {showHistoryTooltip && (
                    <div style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1a1a2e", color: "#ffffff", fontSize: "12px", fontWeight: "600", padding: "6px 12px", borderRadius: "8px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                      Premium feature — upgrade to unlock
                      <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", backgroundColor: "#1a1a2e" }} />
                    </div>
                  )}
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
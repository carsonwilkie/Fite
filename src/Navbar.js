import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import { useNavigate } from "react-router-dom"

function Navbar() {
  const { user } = useUser();
  const { isPaid } = usePaidStatus();
  const navigate = useNavigate();

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

  const handleUpgrade = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, email: user?.primaryEmailAddress?.emailAddress }),
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
          <SignInButton mode="modal">
            <button className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isPaid ? (
              <>
                <button onClick={() => navigate("/history")} className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
                  History
                </button>
                <button onClick={handleManageSubscription} className="primary-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
                  Manage Subscription
                </button>
              </>
            ) : (
              <>
                <button disabled className="upgrade-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px", opacity: 0.5, cursor: "not-allowed" }}>
                  History
                </button>
                <button onClick={handleUpgrade} className="upgrade-btn manage-sub-btn" style={{ width: "auto", padding: "10px 20px" }}>
                  ⭐ Upgrade to Premium
                </button>
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
    fontSize: "13px",
    color: "#5a060d",
    fontStyle: "italic",
    cursor: "default",
  },
};

export default Navbar;
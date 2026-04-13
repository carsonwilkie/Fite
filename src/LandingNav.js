import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useRouter } from "next/router";
import usePaidStatus from "./usePaidStatus";

const C_PRIMARY   = "#1565C0";
const C_SECONDARY = "#4FC3F7";
const C_GOLD      = "#c9a84c";
const C_MUTED     = "#94a3b8";

export default function LandingNav() {
  const router   = useRouter();
  const { isPaid } = usePaidStatus();
  const onHero   = router.pathname === "/";

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 150,
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Inter, sans-serif",
        background: "transparent",
      }}
    >
      {/* Brand */}
      <button
        onClick={() => router.push("/")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0,
          fontSize: 20, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}
      >
        <span style={{ color: C_PRIMARY,   textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 24px rgba(21,101,192,0.9)"  }}>Fite</span>
        {" "}
        <span style={{ color: C_SECONDARY, textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 24px rgba(79,195,247,0.9)"  }}>Finance</span>
        {isPaid && (
          <span style={{ color: C_GOLD, textShadow: "0 0 16px rgba(201,168,76,0.8)",
            fontSize: 18, fontWeight: 900, marginLeft: 2 }}>+</span>
        )}
      </button>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <NavLink active={onHero}   onClick={() => router.push("/")}>Home</NavLink>
        <NavLink active={!onHero}  onClick={() => router.push("/features")}>Features</NavLink>
      </div>

      {/* Auth */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <SignedOut>
          <SignInButton mode="modal">
            <button style={ghostBtn}>Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button style={primaryBtn}>Sign Up</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <button
            onClick={() => router.push("/practice")}
            style={primaryBtn}
          >
            Practice
          </button>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}

function NavLink({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "4px 0",
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? C_SECONDARY : C_MUTED,
        borderBottom: active ? `1px solid ${C_SECONDARY}` : "1px solid transparent",
        transition: "color 0.2s, border-color 0.2s",
        letterSpacing: "0.01em",
        textShadow: "0 1px 4px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.8)",
      }}
    >
      {children}
    </button>
  );
}

const ghostBtn = {
  background: "none",
  border: "1px solid rgba(79,195,247,0.55)",
  color: "#f8fafc",
  borderRadius: 8,
  padding: "7px 16px",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  fontWeight: 600,
  transition: "border-color 0.2s",
};

const primaryBtn = {
  background: "linear-gradient(45deg, #1565C0, #4FC3F7)",
  border: "none",
  color: "#fff",
  borderRadius: 8,
  padding: "7px 16px",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  fontWeight: 700,
  boxShadow: "0 0 14px rgba(21,101,192,0.4)",
};

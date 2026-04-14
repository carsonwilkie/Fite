import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useRouter } from "next/router";
import usePaidStatus from "./usePaidStatus";

const C_PRIMARY   = "#1565C0";
const C_SECONDARY = "#4FC3F7";
const C_GOLD      = "#c9a84c";
const C_MUTED     = "#94a3b8";

export default function LandingNav() {
  const router = useRouter();
  const { isPaid } = usePaidStatus();
  const onHero      = router.pathname === "/";
  const onDashboard = router.pathname === "/dashboard";

  return (
    <>
      <nav aria-label="Main navigation" className="landing-nav">
        <div className="landing-nav__brand-wrap">
          <button onClick={() => { if (router.pathname !== "/") router.push("/"); }} className="landing-nav__brand">
            <span style={{ color: C_PRIMARY, textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 24px rgba(21,101,192,0.9)" }}>Fite</span>
            {" "}
            <span style={{ color: C_SECONDARY, textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 24px rgba(79,195,247,0.9)" }}>Finance</span>
            {isPaid && (
              <span style={{ color: C_GOLD, textShadow: "0 0 16px rgba(201,168,76,0.8)", fontSize: 18, fontWeight: 900, marginLeft: 2 }}>+</span>
            )}
          </button>
        </div>

        <div className="landing-nav__center">
          <NavLink active={onHero} onClick={() => router.push("/")}>Home</NavLink>
          <NavLink active={router.pathname === "/features"} onClick={() => router.push("/features")}>Features</NavLink>
          <NavLink active={onDashboard} onClick={() => router.push("/dashboard")}>Dashboard</NavLink>
        </div>

        <div className="landing-nav__actions">
          <SignedOut>
            <>
              <SignInButton mode="modal">
                <button style={ghostBtn}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button style={primaryBtn}>
                  Sign Up
                </button>
              </SignUpButton>
            </>
          </SignedOut>
          <SignedIn>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => router.push("/dashboard")} style={primaryBtn}>
                Practice
              </button>
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </nav>

      <style jsx>{`
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 150;
          padding: 14px 32px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 16px;
          font-family: Inter, sans-serif;
          background: transparent;
        }

        .landing-nav__brand-wrap {
          justify-self: start;
          min-width: 0;
        }

        .landing-nav__brand {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          white-space: nowrap;
        }

        .landing-nav__center {
          justify-self: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
        }

        .landing-nav__actions {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 720px) {
          .landing-nav {
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-areas:
              "brand actions"
              "center center";
            row-gap: 12px;
            padding: 14px 16px 10px;
          }

          .landing-nav__brand-wrap {
            grid-area: brand;
          }

          .landing-nav__center {
            grid-area: center;
            gap: 22px;
          }

          .landing-nav__actions {
            grid-area: actions;
          }

          .landing-nav__brand {
            font-size: 17px;
          }
        }
      `}</style>
    </>
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
  background: "rgba(13, 27, 42, 0.42)",
  border: "1px solid rgba(79,195,247,0.55)",
  color: "#f8fafc",
  borderRadius: 999,
  padding: "7px 16px",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  fontWeight: 600,
  transition: "border-color 0.2s, background-color 0.2s",
  backdropFilter: "blur(16px)",
};

const primaryBtn = {
  background: "linear-gradient(45deg, #1565C0, #4FC3F7)",
  border: "none",
  color: "#fff",
  borderRadius: 999,
  padding: "7px 16px",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  fontWeight: 700,
  boxShadow: "0 0 14px rgba(21,101,192,0.4)",
};

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/router";
import { useClerk, useUser } from "@clerk/nextjs";
import { AUTH_COLORS, cyberGrad } from "./AuthPrimitives";
import usePaidStatus from "../usePaidStatus";

export default function UserMenu({ size = 32, align = "right" }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { isPaid } = usePaidStatus();
  const [open, setOpen] = useState(false);
  const [managingSub, setManagingSub] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const anchorRef = useRef(null);

  const handleManageSub = async () => {
    if (!user?.id || managingSub) return;
    setManagingSub(true);
    try {
      const r = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: router.asPath }),
      });
      const d = await r.json();
      if (d.url) {
        window.location.href = d.url;
      } else {
        console.error("[UserMenu] portal error:", d.error, "status:", r.status);
        alert(`Could not open billing portal: ${d.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error("[UserMenu] portal error:", e);
      alert(`Could not open billing portal: ${e.message}`);
    } finally {
      setManagingSub(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!user) return null;

  const initials = (user.firstName?.[0] || user.primaryEmailAddress?.emailAddress?.[0] || "?").toUpperCase();

  return (
    <div ref={anchorRef} style={{ position: "relative", display: "inline-block" }}>
      <motion.button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.94 }}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "none",
          padding: 0,
          cursor: "pointer",
          overflow: "hidden",
          background: cyberGrad,
          boxShadow: open
            ? "0 0 0 2px rgba(79,195,247,0.55), 0 4px 18px rgba(21,101,192,0.45)"
            : "0 2px 10px rgba(21,101,192,0.35)",
          transition: "box-shadow 0.2s",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "#fff", fontSize: size * 0.42, fontWeight: 800, fontFamily: "Inter, sans-serif" }}>
            {initials}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              [align]: 0,
              zIndex: 600,
              minWidth: 240,
              background: "linear-gradient(180deg, rgba(13,27,42,0.98) 0%, rgba(8,18,32,0.99) 100%)",
              border: `1px solid ${AUTH_COLORS.borderSoft}`,
              borderRadius: 14,
              padding: 6,
              boxShadow: "0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(79,195,247,0.06)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div style={{
              padding: "10px 12px 12px",
              borderBottom: `1px solid ${AUTH_COLORS.borderSoft}`,
              marginBottom: 6,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: AUTH_COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.fullName || user.firstName || "User"}
              </div>
              <div style={{ fontSize: 11, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                {user.primaryEmailAddress?.emailAddress}
              </div>
            </div>

            <MenuItem
              icon="manage_accounts"
              label="Manage account"
              onClick={() => { setOpen(false); router.push("/account"); }}
            />
            {isPaid && (
              <MenuItem
                icon="credit_card"
                label={managingSub ? "Opening…" : "Manage subscription"}
                onClick={() => { setOpen(false); handleManageSub(); }}
              />
            )}
            <MenuItem
              icon="dashboard"
              label="Dashboard"
              onClick={() => { setOpen(false); router.push("/dashboard"); }}
            />
            <div style={{ height: 1, background: AUTH_COLORS.borderSoft, margin: "6px 8px" }} />
            <MenuItem
              icon="logout"
              label={signingOut ? "Signing out..." : "Sign out"}
              onClick={async () => {
                if (signingOut) return;
                setOpen(false);
                setSigningOut(true);
                // Tell AuthProvider we own the navigation for this sign-out.
                // Stamp BEFORE the route push so the cover overlay starts to
                // close before Clerk has fully torn down the session — that
                // way the user never sees the dashboard flash unauthenticated.
                window.__fiteSignOutAt = Date.now();
                const goingHome = router.asPath !== "/";
                // Pass a no-op callback to signOut. This is the documented way
                // to suppress Clerk's built-in afterSignOutUrl redirect, which
                // would otherwise race with our own router.replace and cancel
                // one of the two — sometimes leaving the page-transition cover
                // stranded mid-animation.
                let navP;
                if (goingHome) {
                  navP = router.replace("/");
                } else {
                  // Same-page sign-out (already on /). Fire a cover-flash so
                  // the user gets visual confirmation and the home page's
                  // GSAP canvas pauses while the auth state flips. Without
                  // this, the home page felt sluggish vs. /features (which
                  // gets a real transition cover).
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("fite:cover-flash"));
                  }
                  navP = Promise.resolve();
                }
                try {
                  await Promise.all([signOut(() => {}), navP]);
                } catch (err) {
                  if (process.env.NODE_ENV !== "production") {
                    // eslint-disable-next-line no-console
                    console.warn("[UserMenu] sign-out error", err);
                  }
                } finally {
                  setSigningOut(false);
                }
              }}
              danger
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: danger ? "#fca5a5" : AUTH_COLORS.text,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "rgba(239,68,68,0.08)" : "rgba(79,195,247,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: danger ? "#fca5a5" : AUTH_COLORS.secondary }}>
        {icon}
      </span>
      {label}
    </motion.button>
  );
}

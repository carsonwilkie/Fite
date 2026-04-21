import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/router";
import { useClerk, useUser } from "@clerk/clerk-react";
import { AUTH_COLORS, cyberGrad } from "./AuthPrimitives";

export default function UserMenu({ size = 32, align = "right" }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

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
            <MenuItem
              icon="dashboard"
              label="Dashboard"
              onClick={() => { setOpen(false); router.push("/dashboard"); }}
            />
            <div style={{ height: 1, background: AUTH_COLORS.borderSoft, margin: "6px 8px" }} />
            <MenuItem
              icon="logout"
              label="Sign out"
              onClick={() => { setOpen(false); signOut(() => router.push("/")); }}
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

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/router";
import AuthCard from "./AuthCard";

const AuthModalContext = createContext(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }) {
  const [state, setState] = useState({ open: false, view: "sign-in", redirectTo: null });
  const { isSignedIn } = useUser();
  const router = useRouter();
  const wasSignedInRef = useRef(null);

  const openAuth = useCallback((view = "sign-in", opts = {}) => {
    setState({ open: true, view, redirectTo: opts.redirectTo || null });
  }, []);

  const closeAuth = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  // When user signs out, use Next.js router to avoid a hard-redirect white flash.
  useEffect(() => {
    if (isSignedIn === undefined) return;
    if (wasSignedInRef.current === true && isSignedIn === false) {
      router.push("/");
    }
    wasSignedInRef.current = isSignedIn;
  }, [isSignedIn, router]);

  // Auto-close if user becomes signed in while modal is open.
  useEffect(() => {
    if (state.open && isSignedIn) {
      const t = setTimeout(() => {
        closeAuth();
        if (state.redirectTo && typeof window !== "undefined") {
          window.location.href = state.redirectTo;
        }
      }, 350);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isSignedIn, state.open, state.redirectTo, closeAuth]);

  // Lock body scroll when open without moving the page.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (!state.open) return undefined;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, [state.open]);

  // ESC closes.
  useEffect(() => {
    if (!state.open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") closeAuth(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open, closeAuth]);

  const value = useMemo(() => ({
    openAuth,
    closeAuth,
    openSignIn: (opts) => openAuth("sign-in", opts),
    openSignUp: (opts) => openAuth("sign-up", opts),
  }), [openAuth, closeAuth]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {state.open && (
          <motion.div
            key="auth-modal-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              overflowY: "auto",
              background: "rgba(2, 8, 23, 0.72)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            <div
              style={{
                display: "flex",
                minHeight: "100%",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 16px",
              }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeAuth();
              }}
            >
              <motion.div
                key="auth-modal-card"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: "100%", maxWidth: 460 }}
              >
                <AuthCard
                  initialView={state.view}
                  onClose={closeAuth}
                  variant="modal"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthModalContext.Provider>
  );
}

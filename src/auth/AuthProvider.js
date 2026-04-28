import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useUser } from "@clerk/nextjs";
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

  // Lock scroll without moving the page. Two key ideas:
  // 1. Keep the <html> scrollbar visible (overflow: scroll) if the page
  //    originally had one, so the initial containing block that every
  //    position:fixed descendant (modal backdrop, nav, etc.) resolves against
  //    keeps the exact same geometry. This prevents the horizontal twitch.
  // 2. Pin <body> using its measured getBoundingClientRect values so body
  //    stays pixel-exact — no reliance on scrollbar math or ambient margins.
  // On close, revert styles and instantly scrollTo the saved position.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (!state.open) return undefined;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const bodyRect = body.getBoundingClientRect();
    const hadScrollbar = (window.innerWidth - html.clientWidth) > 0;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };
    html.style.overflow = hadScrollbar ? "scroll" : "hidden";
    body.style.position = "fixed";
    body.style.top = `${bodyRect.top}px`;
    body.style.left = `${bodyRect.left}px`;
    body.style.right = "auto";
    body.style.width = `${bodyRect.width}px`;
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevScrollBehavior;
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
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "clamp(24px, calc((100vh - 640px) / 2), 96px) 16px 24px",
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
                  afterAuthRedirect={state.redirectTo || "/dashboard"}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthModalContext.Provider>
  );
}

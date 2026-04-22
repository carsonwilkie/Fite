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

  // Lock scroll without moving the page. We pin <body> in place with
  // position:fixed + a negative top offset equal to the current scrollY, which
  // visually anchors the page content (including the blurred background behind
  // the modal) exactly where it was. The scrollbar gutter is reserved on <html>
  // via padding-right so the content never shifts horizontally when the
  // scrollbar disappears. On close we restore styles and instantly scrollTo
  // the saved position (scroll-behavior forced to auto to avoid smooth-scroll).
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (!state.open) return undefined;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlPaddingRight: html.style.paddingRight,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };
    html.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      html.style.paddingRight = `${scrollbarWidth}px`;
    }
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = scrollbarWidth > 0
      ? `calc(100% - ${scrollbarWidth}px)`
      : "100%";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.paddingRight = prev.htmlPaddingRight;
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
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthModalContext.Provider>
  );
}

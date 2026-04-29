import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import AuthCard from "./AuthCard";
import { sanitizeRedirectPath } from "./redirects";

const AuthModalContext = createContext(null);

// Window-scoped helpers used to coordinate sign-out across components without
// a custom-event race. UserMenu / AccountPanel set `__fiteSignOutAt = Date.now()`
// *before* awaiting Clerk.signOut(), and the AuthProvider treats any
// isSignedIn=true→false transition that lands within MANUAL_SIGNOUT_WINDOW_MS
// of that timestamp as "already being navigated by the caller, do not push".
const MANUAL_SIGNOUT_WINDOW_MS = 4000;

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
    setState({
      open: true,
      view,
      redirectTo: opts.redirectTo ? sanitizeRedirectPath(opts.redirectTo, "/dashboard") : null,
    });
  }, []);

  const closeAuth = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  // Sign-out side effect: when the user transitions from signed-in to
  // signed-out, navigate home — UNLESS the transition was triggered by
  // UserMenu/AccountPanel, which handle navigation themselves. The
  // `__fiteSignOutAt` timestamp is the contract for "I am the caller and I
  // will route." We use a timestamp instead of a boolean ref so we are not
  // sensitive to event ordering or stale flags.
  useEffect(() => {
    if (isSignedIn === undefined) return;
    if (wasSignedInRef.current === true && isSignedIn === false) {
      const t = typeof window !== "undefined" ? (window.__fiteSignOutAt || 0) : 0;
      const fresh = Date.now() - t < MANUAL_SIGNOUT_WINDOW_MS;
      if (!fresh) {
        // Defer to the next tick so any concurrent route change (e.g. Clerk
        // tearing down session listeners that themselves may trigger renders)
        // settles before we issue navigation.
        const id = setTimeout(() => {
          if (router.asPath !== "/") router.push("/");
        }, 0);
        return () => clearTimeout(id);
      }
    }
    wasSignedInRef.current = isSignedIn;
    return undefined;
  }, [isSignedIn, router]);

  // Auto-close the modal once Clerk reports the user as signed in. The redirect
  // target is determined in this priority order:
  //   1. window.__fitePendingAuthRedirect — set by AuthCard.onAuthenticated()
  //   2. state.redirectTo                  — set when openAuth was called
  //   3. fallback: do not navigate         — they're staying on the current page
  useEffect(() => {
    if (!state.open) return;
    if (isSignedIn !== true) return;

    const pending = typeof window !== "undefined" ? window.__fitePendingAuthRedirect : null;
    const target = pending || state.redirectTo || null;
    if (typeof window !== "undefined") window.__fitePendingAuthRedirect = null;

    closeAuth();

    if (target && target !== router.asPath) {
      // Wait one frame so the modal exit animation can begin before the
      // page-cover overlay slides down, otherwise the user briefly sees the
      // modal stack on top of the cover starting.
      requestAnimationFrame(() => {
        router.replace(target);
      });
    }
  }, [isSignedIn, state.open, state.redirectTo, closeAuth, router]);

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
                  afterAuthRedirect={state.redirectTo || "/"}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthModalContext.Provider>
  );
}

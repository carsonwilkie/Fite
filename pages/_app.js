import { useState, useEffect, useRef, useCallback } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PaidStatusProvider } from "../src/PaidStatusContext";
import AuthProvider from "../src/auth/AuthProvider";
import { useRouter } from "next/router";
import "../src/index.css";
import "../src/App.css";
import "../src/LandingPage.css";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

// ─── Page-transition timing ─────────────────────────────────────────────────
// COVER_MS: time the navy panel takes to slide DOWN over the current page.
// REVEAL_MS / HERO_REVEAL_MS: time the navy panel takes to slide UP off the
//   destination page.
// COVER_HOLD_MS: opaque hold between cover-down completing and reveal start.
//   Kept at 0 — the single rAF in startReveal() is sufficient to ensure the
//   destination has been committed before the reveal animation begins.
// STUCK_MS: failsafe — if a navigation hasn't completed within this window,
//   we lift the cover unconditionally so the user is never trapped on navy.
//
// IMPORTANT: AuthProvider.js times its modal-close to MODAL_CLOSE_AFTER_MS
// (set to ~COVER_MS) so the modal exits *under* the cover rather than before
// it. If you change COVER_MS, update that constant too.
const COVER_MS         = 340;
const REVEAL_MS        = 380;
// HERO_REVEAL_MS used to be longer to feel "cinematic" on the landing page,
// but the GSAP-pinned hero keeps animating behind the cover and competes with
// the reveal for GPU time, making the lift feel sluggish vs. simpler routes.
// Match REVEAL_MS so /, /features, and /dashboard all feel uniformly fast.
const HERO_REVEAL_MS   = 380;
const COVER_HOLD_MS    = 0;
const STUCK_MS         = 1600;
// Cover-flash is the same-page sign-in/out cover-up→cover-down cycle. There
// is nothing to hide behind it (no view swap), so we use shorter durations
// than a real navigation. The user just needs a brief visual confirmation
// that the auth state changed.
const FLASH_COVER_MS   = 260;
const FLASH_REVEAL_MS  = 320;

function isHeroRoute(route) {
  return route === "/" || route.startsWith("/?") || route.startsWith("/#");
}

function getRevealMs(route) {
  return isHeroRoute(route) ? HERO_REVEAL_MS : REVEAL_MS;
}

function resetWindowScroll() {
  if (typeof window === "undefined") return;
  const opts = { top: 0, left: 0, behavior: "instant" };
  try { window.scrollTo(opts); } catch { window.scrollTo(0, 0); }
  try { document.documentElement.scrollTo(opts); } catch (_) {}
  try { document.body.scrollTo(opts); } catch (_) {}
}

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // ─── overlay state ────────────────────────────────────────────────────────
  // y === "0%"    → covering (panel is fully over the page)
  // y === "-100%" → revealed (panel is parked above the viewport)
  const [y, setY]                 = useState("0%");
  const [anim, setAnim]           = useState(false);
  const [transitionMs, setTransitionMs] = useState(REVEAL_MS);
  const [frozenScrollY, setFrozenScrollY] = useState(0);
  const [isCovering, setIsCovering] = useState(false);
  const [displayedView, setDisplayedView] = useState(() => ({
    Component,
    pageProps,
    route: router.asPath,
  }));

  // Phase machine: idle | covering | covered | revealing
  const phaseRef          = useRef("idle");
  const pendingViewRef    = useRef(null);
  const coverDoneRef      = useRef(false);
  const routeReadyRef     = useRef(false);

  const coverDoneTimerRef = useRef(null);
  const stuckTimerRef     = useRef(null);
  const revealHoldTimerRef = useRef(null);
  const revealEndTimerRef = useRef(null);

  const clearAllTimers = useCallback(() => {
    clearTimeout(coverDoneTimerRef.current); coverDoneTimerRef.current = null;
    clearTimeout(stuckTimerRef.current);     stuckTimerRef.current = null;
    clearTimeout(revealHoldTimerRef.current); revealHoldTimerRef.current = null;
    clearTimeout(revealEndTimerRef.current); revealEndTimerRef.current = null;
  }, []);

  // Force the overlay back to idle/revealed without animating into a stuck
  // state. Used by the failsafe and routeChangeError handler.
  const goIdle = useCallback(() => {
    clearAllTimers();
    phaseRef.current      = "idle";
    pendingViewRef.current = null;
    coverDoneRef.current  = false;
    routeReadyRef.current = false;
    setIsCovering(false);
    setTransitionMs(REVEAL_MS);
    setAnim(true);
    setY("-100%");
  }, [clearAllTimers]);

  // Slide the cover off and return to idle. Called once both the cover and
  // the next view are confirmed ready.
  const startReveal = useCallback((route) => {
    phaseRef.current = "revealing";
    setIsCovering(false);

    clearTimeout(revealHoldTimerRef.current);
    const begin = () => {
      // One rAF gives the new view a frame to be committed and painted before
      // we lift the cover. Two RAFs proved unnecessary in practice and just
      // added a perceptible navy hold.
      requestAnimationFrame(() => {
        const ms = getRevealMs(route);
        setTransitionMs(ms);
        setAnim(true);
        setY("-100%");
        revealHoldTimerRef.current = null;

        clearTimeout(revealEndTimerRef.current);
        revealEndTimerRef.current = setTimeout(() => {
          phaseRef.current = "idle";
          revealEndTimerRef.current = null;
          // Cancel the stuck failsafe — we made it.
          clearTimeout(stuckTimerRef.current);
          stuckTimerRef.current = null;
        }, ms + 80);
      });
    };
    if (COVER_HOLD_MS > 0) {
      revealHoldTimerRef.current = setTimeout(begin, COVER_HOLD_MS);
    } else {
      begin();
    }
  }, []);

  // The single coordination point. Called any time one of the gating signals
  // (coverDone, routeReady, pendingView) flips. Only proceeds when all three
  // are satisfied.
  const tryAdvanceToReveal = useCallback(() => {
    if (phaseRef.current !== "covering" && phaseRef.current !== "covered") return;
    if (!coverDoneRef.current)  return;
    if (!routeReadyRef.current) return;
    if (!pendingViewRef.current) return;

    const next = pendingViewRef.current;
    pendingViewRef.current = null;
    coverDoneRef.current   = false;
    routeReadyRef.current  = false;
    phaseRef.current       = "covered";

    resetWindowScroll();
    setDisplayedView(next);
    startReveal(next.route);
  }, [startReveal]);

  // ─── Initial mount: lift the cover after the first paint ──────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setTransitionMs(REVEAL_MS);
      setAnim(true);
      setY("-100%");
    }, 60);
    const t2 = setTimeout(() => {
      phaseRef.current = "idle";
    }, 60 + REVEAL_MS + 80);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  // ─── Route-change wiring ──────────────────────────────────────────────────
  useEffect(() => {
    const handleStart = (_url, opts) => {
      // Shallow navigations don't replace the page — skip the cover.
      if (opts && opts.shallow) return;

      clearAllTimers();
      coverDoneRef.current   = false;
      routeReadyRef.current  = false;
      pendingViewRef.current = null;
      phaseRef.current       = "covering";

      setFrozenScrollY(window.scrollY || window.pageYOffset || 0);
      setIsCovering(true);
      setTransitionMs(COVER_MS);
      setAnim(true);
      setY("0%");

      // Mark the cover as visually complete after COVER_MS. setTimeout in
      // browsers fires no earlier than the requested delay, so the panel is
      // guaranteed to be fully down when this resolves.
      coverDoneTimerRef.current = setTimeout(() => {
        coverDoneRef.current = true;
        if (phaseRef.current === "covering") phaseRef.current = "covered";
        coverDoneTimerRef.current = null;
        tryAdvanceToReveal();
      }, COVER_MS);

      // Failsafe: if we've been mid-transition past STUCK_MS, force a
      // resolution. Either advance with whatever we have, or lift the cover.
      stuckTimerRef.current = setTimeout(() => {
        if (phaseRef.current === "idle") return;
        coverDoneRef.current  = true;
        routeReadyRef.current = true;
        if (pendingViewRef.current) {
          tryAdvanceToReveal();
        } else {
          goIdle();
        }
      }, STUCK_MS);
    };

    const handleComplete = () => {
      routeReadyRef.current = true;
      tryAdvanceToReveal();
    };

    const handleError = (err) => {
      // err.cancelled means another navigation has already started and will
      // re-arm everything via its own routeChangeStart, so just bail.
      if (err && err.cancelled) return;
      // Real failure: do not strand the user on the navy panel.
      goIdle();
    };

    router.events.on("routeChangeStart",    handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError",    handleError);
    return () => {
      router.events.off("routeChangeStart",    handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError",    handleError);
      clearAllTimers();
    };
  }, [router.events, clearAllTimers, goIdle, tryAdvanceToReveal]);

  // ─── Track incoming Component/pageProps ───────────────────────────────────
  useEffect(() => {
    const incoming = { Component, pageProps, route: router.asPath };

    // Same logical route — just keep props in sync. No transition.
    if (displayedView.route === incoming.route) {
      if (
        displayedView.Component !== incoming.Component ||
        displayedView.pageProps !== incoming.pageProps
      ) {
        setDisplayedView(incoming);
      }
      return;
    }

    if (phaseRef.current === "idle") {
      // Route changed without us hearing routeChangeStart (very rare — e.g.
      // first hydration after SSR). Silently sync rather than animate, so we
      // never strand the user with no overlay state at all.
      resetWindowScroll();
      setDisplayedView(incoming);
      return;
    }

    pendingViewRef.current = incoming;
    tryAdvanceToReveal();
  }, [Component, pageProps, router.asPath, displayedView.route, displayedView.Component, displayedView.pageProps, tryAdvanceToReveal]);

  // ─── Misc browser plumbing ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    if (isCovering) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCovering]);

  // Pause any costly per-tab animations while the tab is hidden — when the
  // user returns we re-arm the failsafe so we never wake up to a stuck cover.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (phaseRef.current === "idle") return;
      // Re-arm a short stuck timer so we can recover quickly.
      clearTimeout(stuckTimerRef.current);
      stuckTimerRef.current = setTimeout(() => {
        if (phaseRef.current === "idle") return;
        coverDoneRef.current  = true;
        routeReadyRef.current = true;
        if (pendingViewRef.current) {
          tryAdvanceToReveal();
        } else {
          goIdle();
        }
      }, 600);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [goIdle, tryAdvanceToReveal]);

  // ─── External cover-flash trigger ─────────────────────────────────────────
  // Some flows (most notably "sign-in succeeded but the user is already on
  // the destination page") need the cover to play a full down→up cycle
  // *without* an underlying navigation, so the modal can tuck under the
  // navy panel instead of fading out over the live page. AuthProvider fires
  // window.dispatchEvent(new CustomEvent("fite:cover-flash")) for that case;
  // we run a self-contained transition that swaps no view.
  //
  // Critically, cover-flash does NOT toggle isCovering — there is no view
  // swap to protect, so freezing the underlying page would only force a
  // layout reflow (expensive on the GSAP+canvas-heavy landing page) and
  // cause the visible "pause" the user reported.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onFlash = () => {
      // Don't interfere with an in-flight real navigation.
      if (phaseRef.current !== "idle") return;

      clearAllTimers();
      coverDoneRef.current   = false;
      routeReadyRef.current  = false;
      pendingViewRef.current = null;
      phaseRef.current       = "covering";

      setTransitionMs(FLASH_COVER_MS);
      setAnim(true);
      setY("0%");

      coverDoneTimerRef.current = setTimeout(() => {
        coverDoneTimerRef.current = null;
        // No view to swap. Go straight from covered → revealing.
        phaseRef.current = "revealing";

        requestAnimationFrame(() => {
          setTransitionMs(FLASH_REVEAL_MS);
          setAnim(true);
          setY("-100%");

          clearTimeout(revealEndTimerRef.current);
          revealEndTimerRef.current = setTimeout(() => {
            phaseRef.current = "idle";
            revealEndTimerRef.current = null;
            clearTimeout(stuckTimerRef.current);
            stuckTimerRef.current = null;
          }, FLASH_REVEAL_MS + 80);
        });
      }, FLASH_COVER_MS);

      // Mirror the routeChangeStart failsafe so a flash can never strand us.
      stuckTimerRef.current = setTimeout(() => {
        if (phaseRef.current === "idle") return;
        goIdle();
      }, STUCK_MS);
    };
    window.addEventListener("fite:cover-flash", onFlash);
    return () => window.removeEventListener("fite:cover-flash", onFlash);
  }, [clearAllTimers, goIdle, router.asPath]);

  if (!PUBLISHABLE_KEY) {
    return <displayedView.Component {...displayedView.pageProps} />;
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      {...pageProps}
    >
      <PaidStatusProvider>
        <AuthProvider>
        <Analytics />
        <SpeedInsights />
        <div
          style={isCovering ? {
            position: "fixed",
            top: -frozenScrollY,
            left: 0,
            right: 0,
            width: "100%",
          } : undefined}
        >
          <displayedView.Component {...displayedView.pageProps} />
        </div>

        {/* ── Global page-transition overlay ─────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            background: "#020817",
            transform: `translateY(${y})`,
            transition: anim
              ? `transform ${transitionMs}ms cubic-bezier(0.76, 0, 0.24, 1)`
              : "none",
            pointerEvents: y === "0%" ? "all" : "none",
            willChange: "transform",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Glowing sweep line — leads the cover edge on both entry and exit */}
          <div style={{
            position: "absolute",
            bottom: -2, left: 0, right: 0,
            height: 3,
            background: cyberGrad,
            boxShadow: "0 0 18px rgba(79,195,247,0.95), 0 0 48px rgba(21,101,192,0.65), 0 0 90px rgba(21,101,192,0.3)",
            transition: "none",
          }} />
        </div>
        </AuthProvider>
      </PaidStatusProvider>
    </ClerkProvider>
  );
}

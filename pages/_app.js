import { useState, useEffect, useRef } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PaidStatusProvider } from "../src/PaidStatusContext";
import ScrollToTop from "../src/ScrollToTop";
import { useRouter } from "next/router";
import "../src/index.css";
import "../src/App.css";
import "../src/LandingPage.css";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

// Durations (ms)
const ENTRY_MS = 500;   // close current page / default reveal
const HERO_REVEAL_MS = 520;
const COVER_PAUSE_MS = 80;
const HERO_COVER_PAUSE_MS = 0;

function isHeroRoute(route) {
  return route === "/" || route.startsWith("/?") || route.startsWith("/#");
}

function getCoverPauseMs(route) {
  return isHeroRoute(route) ? HERO_COVER_PAUSE_MS : COVER_PAUSE_MS;
}

export default function App({ Component, pageProps }) {
  const router  = useRouter();
  const coverStartedAtRef = useRef(0);
  const phaseRef = useRef("idle");
  const routeReadyRef = useRef(false);
  const coverDoneRef = useRef(false);
  const pendingViewRef = useRef(null);
  const revealPauseTimerRef = useRef(null);

  // ─── Page transition overlay ────────────────────────────────────────────────
  // y: CSS translateY value for the overlay
  // anim: whether a CSS transition should run
  const [y, setY]       = useState("0%");    // start covering
  const [anim, setAnim] = useState(false);   // no transition on first paint
  const [transitionMs, setTransitionMs] = useState(ENTRY_MS);
  const [displayedView, setDisplayedView] = useState(() => ({
    Component,
    pageProps,
    route: router.asPath,
  }));

  const revealPendingView = () => {
    if (!coverDoneRef.current || !routeReadyRef.current || !pendingViewRef.current) {
      return;
    }

    const nextView = pendingViewRef.current;
    pendingViewRef.current = null;
    routeReadyRef.current = false;
    phaseRef.current = "revealing";
    setDisplayedView(nextView);

    clearTimeout(revealPauseTimerRef.current);
    revealPauseTimerRef.current = setTimeout(() => {
      setTransitionMs(isHeroRoute(nextView.route) ? HERO_REVEAL_MS : ENTRY_MS);
      setAnim(true);
      setY("-100%");
      phaseRef.current = "idle";
      revealPauseTimerRef.current = null;
    }, getCoverPauseMs(nextView.route));
  };

  // Initial entry: reveal bottom-up after 60 ms
  useEffect(() => {
    const t = setTimeout(() => {
      setAnim(true);
      setY("-100%");
    }, 60);
    return () => clearTimeout(t);
  }, []);

  // Route-change transitions
  useEffect(() => {
    let coverTimer;
    let revealTimer;

    const handleStart = () => {
      clearTimeout(coverTimer);
      clearTimeout(revealTimer);
      clearTimeout(revealPauseTimerRef.current);
      coverStartedAtRef.current = Date.now();
      routeReadyRef.current = false;
      coverDoneRef.current = false;
      phaseRef.current = "covering";
      // Sweep the current page closed before we reverse the cover to reveal the next one.
      setTransitionMs(ENTRY_MS);
      setAnim(true);
      setY("0%");
      coverTimer = setTimeout(() => {
        coverDoneRef.current = true;
        revealPendingView();
      }, ENTRY_MS);
    };

    const handleComplete = () => {
      routeReadyRef.current = true;
      const elapsed = Date.now() - coverStartedAtRef.current;
      if (elapsed >= ENTRY_MS) {
        coverDoneRef.current = true;
      }
      revealTimer = setTimeout(() => {
        revealPendingView();
      }, 0);
    };

    const handleError = () => {
      // Navigation cancelled — remove cover
      clearTimeout(coverTimer);
      clearTimeout(revealTimer);
      clearTimeout(revealPauseTimerRef.current);
      routeReadyRef.current = false;
      coverDoneRef.current = false;
      pendingViewRef.current = null;
      phaseRef.current = "idle";
      setAnim(true);
      setY("-100%");
    };

    router.events.on("routeChangeStart",    handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError",    handleError);
    return () => {
      router.events.off("routeChangeStart",    handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError",    handleError);
      clearTimeout(coverTimer);
      clearTimeout(revealTimer);
      clearTimeout(revealPauseTimerRef.current);
    };
  }, [router.events]);

  useEffect(() => {
    const incomingView = {
      Component,
      pageProps,
      route: router.asPath,
    };

    if (displayedView.route === incomingView.route) {
      if (
        displayedView.Component !== incomingView.Component ||
        displayedView.pageProps !== incomingView.pageProps
      ) {
        setDisplayedView(incomingView);
      }
      return;
    }

    pendingViewRef.current = incomingView;

    if (phaseRef.current === "idle") {
      setDisplayedView(incomingView);
      pendingViewRef.current = null;
      routeReadyRef.current = false;
      coverDoneRef.current = false;
      return;
    }

    revealPendingView();
  }, [Component, pageProps, router.asPath, displayedView.route, displayedView.Component, displayedView.pageProps]);

  if (!PUBLISHABLE_KEY) {
    return <displayedView.Component {...displayedView.pageProps} />;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} {...pageProps}>
      <PaidStatusProvider>
        <Analytics />
        <SpeedInsights />
        <ScrollToTop />
        <displayedView.Component {...displayedView.pageProps} />

        {/* ── Global page-transition overlay ─────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#020817",
            transform: `translateY(${y})`,
            transition: anim
              ? `transform ${transitionMs}ms cubic-bezier(0.76, 0, 0.24, 1)`
              : "none",
            pointerEvents: y === "0%" ? "all" : "none",
            willChange: "transform",
          }}
        >
          {/* Glowing sweep line — leads the cover edge on both entry and exit */}
          <div style={{
            position: "absolute",
            bottom: -2, left: 0, right: 0,
            height: 3,
            background: cyberGrad,
            boxShadow: "0 0 18px rgba(79,195,247,0.95), 0 0 48px rgba(21,101,192,0.65), 0 0 90px rgba(21,101,192,0.3)",
          }} />
          {/* Brand watermark */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            fontFamily: "Inter, sans-serif",
            opacity: 0.13,
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
          }}>
            <span style={{ color: "#1565C0" }}>Fite</span>{" "}
            <span style={{ color: "#4FC3F7" }}>Finance</span>
          </div>
        </div>
      </PaidStatusProvider>
    </ClerkProvider>
  );
}

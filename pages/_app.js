import { useState, useEffect, useRef } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PaidStatusProvider } from "../src/PaidStatusContext";
import Navbar from "../src/Navbar";
import ScrollToTop from "../src/ScrollToTop";
import { useRouter } from "next/router";
import "../src/index.css";
import "../src/App.css";
import "../src/LandingPage.css";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

// Durations (ms)
const ENTRY_MS = 500;   // bottom-up reveal

export default function App({ Component, pageProps }) {
  const router  = useRouter();
  const isLanding = router.pathname === "/" || router.pathname === "/features";

  // ─── Page transition overlay ────────────────────────────────────────────────
  // y: CSS translateY value for the overlay
  // anim: whether a CSS transition should run
  const [y, setY]       = useState("0%");    // start covering
  const [anim, setAnim] = useState(false);   // no transition on first paint

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
    let revealTimer;

    const handleStart = () => {
      clearTimeout(revealTimer);
      // Snap cover instantly — prevents new-page content flashing through a
      // partially-descended overlay on fast (pre-cached) navigations.
      setAnim(false);
      setY("0%");
    };

    const handleComplete = () => {
      // New page is in the DOM (hidden under cover); reveal after a short beat.
      revealTimer = setTimeout(() => {
        setAnim(true);
        setY("-100%");
      }, 80);
    };

    const handleError = () => {
      // Navigation cancelled — remove cover
      clearTimeout(revealTimer);
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
      clearTimeout(revealTimer);
    };
  }, [router.events]);

  if (!PUBLISHABLE_KEY) {
    return <Component {...pageProps} />;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} {...pageProps}>
      <PaidStatusProvider>
        <Analytics />
        <SpeedInsights />
        <ScrollToTop />
        {!isLanding && <Navbar />}
        <Component {...pageProps} />

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
              ? `transform ${ENTRY_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`
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

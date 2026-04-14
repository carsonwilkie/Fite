import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useEffect, useState, useCallback } from "react";
import LandingNav from "../src/LandingNav";
import {
  SignedIn,
  SignedOut,
  SignUpButton,
  useUser,
} from "@clerk/clerk-react";
import usePaidStatus from "../src/usePaidStatus";
import useUpgrade from "../src/useUpgrade";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        "#020817",
  bgAlt:     "#0b1120",
  surface:   "#0d1b2a",
  primary:   "#1565C0",
  secondary: "#4FC3F7",
  gold:      "#c9a84c",
  onSurface: "#f8fafc",
  muted:     "#94a3b8",
};
const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

const TOTAL_FRAMES = 111;
const MOBILE_FRAME_STEP = 2;
const DESKTOP_FRAME_NUMBERS = Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1);
const MOBILE_FRAME_NUMBERS = DESKTOP_FRAME_NUMBERS.filter((frameNumber, index) =>
  index % MOBILE_FRAME_STEP === 0 || frameNumber === TOTAL_FRAMES
);
const frameSrc = (i) => `/frames/frame-${String(i).padStart(4, "0")}.jpg`;
const heroFrameCache = new Map();

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { isLoaded } = useUser();
  const { isPaid } = usePaidStatus();
  const handleUpgrade = useUpgrade();
  const [heroViewport, setHeroViewport] = useState({ width: 0, height: 0 });

  // Canvas / hero refs
  const heroSectionRef = useRef(null);
  const canvasRef      = useRef(null);
  const ctxRef         = useRef(null);
  const framesRef      = useRef([]);

  // DOM refs for GSAP-driven overlay animations (no React state re-renders on scroll)
  const heroOverlayRef  = useRef(null);
  const line1Ref        = useRef(null);
  const line2Ref        = useRef(null);
  const line3Ref        = useRef(null);
  const scrollHintRef   = useRef(null);
  const midTagRef       = useRef(null);
  const midTagInnerRef  = useRef(null);
  const midTagSpawnRef  = useRef(false);
  const endDetailsRef   = useRef(null);
  const endInnerRef     = useRef(null);
  const endBrandRef     = useRef(null);
  const endSpawnRef     = useRef(false);
  const progressBarRef  = useRef(null);
  const pendingFrameRef = useRef(null); // RAF handle for batched canvas draws

  // Mount-only state
  const [heroTextIn, setHeroTextIn] = useState(false);
  const heroViewportHeight = heroViewport.height || null;
  const heroSceneHeight = heroViewportHeight ? `${heroViewportHeight}px` : "100vh";
  const heroScrollHeight = heroViewportHeight ? `${heroViewportHeight * 6}px` : "600vh";
  const isMobileHeroLayout = heroViewport.width > 0 && heroViewport.width <= 900;
  const heroFrameNumbers = isMobileHeroLayout ? MOBILE_FRAME_NUMBERS : DESKTOP_FRAME_NUMBERS;
  const heroFrameTotal = heroFrameNumbers.length;

  // Hero text entrance — delayed so the global transition cover has partially lifted first
  useEffect(() => {
    const t = setTimeout(() => setHeroTextIn(true), 540);
    return () => clearTimeout(t);
  }, []);

  // Lock the hero viewport size on touch devices so mobile browser chrome
  // doesn't keep resizing the pinned scene while the user scrolls.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const isTouchViewport = () =>
      window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches || window.innerWidth <= 900;

    const updateHeroViewport = () => {
      const width = Math.round(window.innerWidth);
      const height = Math.round(window.innerHeight);

      setHeroViewport((prev) => {
        if (!isTouchViewport()) {
          return { width, height };
        }

        // On mobile, ignore height-only resizes caused by collapsing browser UI.
        if (!prev.width || Math.abs(width - prev.width) > 24) {
          return { width, height };
        }

        return prev;
      });
    };

    updateHeroViewport();
    window.addEventListener("resize", updateHeroViewport);
    window.addEventListener("orientationchange", updateHeroViewport);

    return () => {
      window.removeEventListener("resize", updateHeroViewport);
      window.removeEventListener("orientationchange", updateHeroViewport);
    };
  }, []);

  // "Explore" click — navigate to features/supplemental page
  const handleExplore = useCallback(() => {
    router.push("/features");
  }, [router]);

  // Canvas resize — keep it matched to viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = heroViewport.width || window.innerWidth;
    const height = heroViewport.height || window.innerHeight;
    if (!width || !height) return;

    // Cap DPR at 1.5 — Retina at 2× means 4× pixels per drawImage call.
    // CSS scaling handles display; canvas doesn't need full DPR precision for video frames.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width  = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctxRef.current = null;
    const f = framesRef.current[0];
    if (f) drawFrame(f); // ImageBitmap has no .complete — check truthiness
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroViewport.width, heroViewport.height]);

  // Frame preload — convert to ImageBitmap so drawImage pulls from GPU memory
  // instead of re-decoding the JPEG every frame. On mobile, sample fewer frames
  // and load them progressively to avoid Safari memory/decode failures.
  useEffect(() => {
    if (!heroViewport.width) return undefined;

    let cancelled = false;
    const arr = heroFrameNumbers.map((frameNumber) => heroFrameCache.get(frameNumber) ?? null);
    framesRef.current = arr;

    if (arr[0]) {
      drawFrame(arr[0]);
    }

    const maxConcurrentLoads = isMobileHeroLayout ? 2 : 6;
    let nextIndex = 0;
    let activeLoads = 0;

    const commitFrame = (index, asset) => {
      if (cancelled) return;
      arr[index] = asset;
      if (index === 0) drawFrame(asset);
    };

    const loadFrameAtIndex = (index) => {
      const frameNumber = heroFrameNumbers[index];
      const cachedAsset = heroFrameCache.get(frameNumber);

      if (cachedAsset) {
        commitFrame(index, cachedAsset);
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => {
          const finalize = (asset) => {
            heroFrameCache.set(frameNumber, asset);
            commitFrame(index, asset);
            resolve();
          };

          if (!isMobileHeroLayout && window.createImageBitmap) {
            window.createImageBitmap(img).then(finalize).catch(() => finalize(img));
          } else {
            finalize(img);
          }
        };
        img.onerror = () => resolve();
        img.src = frameSrc(frameNumber);
      });
    };

    const pumpQueue = () => {
      if (cancelled) return;

      while (activeLoads < maxConcurrentLoads && nextIndex < heroFrameNumbers.length) {
        const index = nextIndex++;
        if (arr[index]) continue;

        activeLoads += 1;
        loadFrameAtIndex(index).finally(() => {
          activeLoads -= 1;
          pumpQueue();
        });
      }
    };

    pumpQueue();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroViewport.width, isMobileHeroLayout, heroFrameNumbers]);

  function drawFrame(img) {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    if (!ctxRef.current) ctxRef.current = canvas.getContext("2d");
    const ctx = ctxRef.current;
    const cw = canvas.width, ch = canvas.height;
    // ImageBitmap uses .width/.height; HTMLImageElement uses .naturalWidth/.naturalHeight
    const iw = img.naturalWidth  ?? img.width;
    const ih = img.naturalHeight ?? img.height;
    if (!iw || !ih) return;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale, sh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  }

  function getClosestLoadedFrame(index) {
    const frames = framesRef.current;
    if (!frames.length) return null;
    if (frames[index]) return frames[index];

    for (let offset = 1; offset < frames.length; offset += 1) {
      const left = index - offset;
      const right = index + offset;
      if (left >= 0 && frames[left]) return frames[left];
      if (right < frames.length && frames[right]) return frames[right];
    }

    return null;
  }

  // GSAP ScrollTrigger — drives canvas frame scrub + all overlay animations via direct DOM
  useEffect(() => {
    let st;
    async function init() {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      st = ScrollTrigger.create({
        trigger: heroSectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate(self) {
          const p = self.progress;

          // — Canvas frame — batched to one draw per animation frame.
          // Skip when the end overlay fully covers the canvas (p ≥ 0.94) so the
          // browser isn't compositing canvas draws that are invisible anyway.
          const idx = Math.min(Math.floor(p * (heroFrameTotal - 1)), heroFrameTotal - 1);
          const img = getClosestLoadedFrame(idx);
          if (img && p < 0.94) {
            if (pendingFrameRef.current) cancelAnimationFrame(pendingFrameRef.current);
            pendingFrameRef.current = requestAnimationFrame(() => {
              pendingFrameRef.current = null;
              drawFrame(img);
            });
          }

          // — Progress bar —
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${p * 100}%`;
          }

          // — Hero text exit (p: 0.18 → 0.28) —
          const textT = Math.max(0, Math.min((p - 0.18) / 0.1, 1));
          if (heroOverlayRef.current) {
            heroOverlayRef.current.style.opacity = `${1 - textT}`;
            heroOverlayRef.current.style.pointerEvents = textT > 0.5 ? "none" : "auto";
          }
          if (line1Ref.current) line1Ref.current.style.transform = `translateX(${-textT * 120}px)`;
          if (line2Ref.current) line2Ref.current.style.transform = `scale(${1 - textT * 0.3})`;
          if (line3Ref.current) line3Ref.current.style.transform = `translateX(${textT * 120}px)`;

          // — Scroll hint (fades out after first tiny scroll) —
          if (scrollHintRef.current) {
            scrollHintRef.current.style.opacity = `${Math.max(0, 1 - p / 0.04)}`;
          }

          // — Mid-scroll tagline (p: 0.3 → 0.72) —
          const midOp = p < 0.30 ? 0
            : p < 0.45 ? (p - 0.30) / 0.15
            : p < 0.60 ? 1
            : p < 0.72 ? 1 - (p - 0.60) / 0.12
            : 0;
          if (midTagRef.current) midTagRef.current.style.opacity = `${midOp}`;
          if (midOp > 0.05 && !midTagSpawnRef.current) {
            midTagSpawnRef.current = true;
            const inner = midTagInnerRef.current;
            if (inner) {
              // Split remove/add across frames — no forced layout reflow needed.
              inner.classList.remove("mid-tag-spawn");
              requestAnimationFrame(() => inner.classList.add("mid-tag-spawn"));
            }
          } else if (midOp < 0.01) {
            midTagSpawnRef.current = false;
          }

          // — End-of-scroll overlay (p: 0.82 → 0.94) —
          const endOp = Math.max(0, Math.min((p - 0.82) / 0.12, 1));
          if (endDetailsRef.current) {
            endDetailsRef.current.style.opacity      = `${endOp}`;
            endDetailsRef.current.style.pointerEvents = endOp > 0.5 ? "auto" : "none";
          }
          if (endBrandRef.current) {
            endBrandRef.current.style.transform = `translateX(${(1 - endOp) * -120}px)`;
          }
          if (endOp > 0.05 && !endSpawnRef.current) {
            endSpawnRef.current = true;
            const inner = endInnerRef.current;
            if (inner) {
              // Split remove/add across frames — no forced layout reflow needed.
              inner.classList.remove("end-details-spawn");
              requestAnimationFrame(() => inner.classList.add("end-details-spawn"));
            }
          } else if (endOp < 0.01) {
            endSpawnRef.current = false;
          }
        },
      });

      ScrollTrigger.refresh();
    }
    init();
    return () => st?.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroViewport.height, heroFrameTotal]);

  return (
    <>
      <Head>
        <title>Fite Finance | Precision in Preparation</title>
        <meta name="description" content="AI-powered finance interview prep. Practice real questions, get instant AI grading, and ace your IB, PE, or HF interview." />
      </Head>

      <LandingNav />

      <div style={{ color: C.onSurface }}>

        {/* ── HERO — scroll-pinned canvas ────────────────────────────────────── */}
        <section ref={heroSectionRef} style={{ position: "relative", height: heroScrollHeight }}>
          <div style={{ position: "sticky", top: 0, height: heroSceneHeight, overflow: "hidden" }}>

            {/* Canvas */}
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#020817" }} />

            {/* Gradient vignette */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(2,8,23,0.5) 0%, rgba(2,8,23,0.15) 45%, rgba(2,8,23,0.65) 100%)", pointerEvents: "none" }} />


            {/* Corner HUD — bottom left */}
            <div style={{ position: "absolute", bottom: 28, left: 32, fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: C.secondary, opacity: 0.4, textTransform: "uppercase", pointerEvents: "none" }}>
              FITE FINANCE
            </div>

            {/* Corner HUD — bottom right */}
            <div style={{ position: "absolute", bottom: 28, right: 32, fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: C.secondary, opacity: 0.4, textTransform: "uppercase", pointerEvents: "none" }}>
              PRECISION IN PREPARATION
            </div>

            {/* Hero text overlay */}
            <div ref={heroOverlayRef} style={{ position: "absolute", bottom: "18%", left: "7%", zIndex: 10 }}>
              <div style={{
                display: "inline-block", padding: "4px 12px", borderRadius: 999,
                background: "rgba(21,101,192,0.2)", border: "1px solid rgba(21,101,192,0.4)",
                color: C.secondary, fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20,
                fontFamily: "Manrope, sans-serif",
                opacity: heroTextIn ? 1 : 0,
                transform: heroTextIn ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
              }}>
                Next-Gen Interview Preparation
              </div>

              <div style={{ fontSize: "clamp(38px, 6vw, 70px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", color: C.onSurface, fontFamily: "Inter, sans-serif", maxWidth: 600 }}>
                <div
                  ref={line1Ref}
                  style={{
                    willChange: "transform",
                    opacity: heroTextIn ? 1 : 0,
                    transition: heroTextIn ? "opacity 0.6s ease 0.15s" : "opacity 0.6s ease 0.15s",
                    textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 12px rgba(0,0,0,0.85), 0 6px 40px rgba(0,0,0,0.55)",
                  }}
                >
                  Master Your
                </div>
                <div
                  ref={line2Ref}
                  style={{ willChange: "transform", transformOrigin: "left center", opacity: heroTextIn ? 1 : 0, transition: heroTextIn ? "opacity 0.6s ease 0.22s" : "opacity 0.6s ease 0.22s" }}
                >
                  <span style={{
                    color: C.secondary, fontStyle: "italic",
                    textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 12px rgba(0,0,0,0.8), 0 0 40px rgba(79,195,247,0.45)",
                  }}>Technicals</span>
                </div>
                <div
                  ref={line3Ref}
                  style={{
                    willChange: "transform",
                    opacity: heroTextIn ? 1 : 0,
                    transition: heroTextIn ? "opacity 0.6s ease 0.3s" : "opacity 0.6s ease 0.3s",
                    textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 12px rgba(0,0,0,0.85), 0 6px 40px rgba(0,0,0,0.55)",
                  }}
                >
                </div>
              </div>

              {/* Scroll hint */}
              <div ref={scrollHintRef} style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 10, opacity: 1, transition: "opacity 0.5s ease 0.6s", pointerEvents: "none" }}
                className="hero-scroll-hint"
              >
                <div style={{ width: 26, height: 42, border: `2px solid rgba(79,195,247,0.9)`, borderRadius: 13, display: "flex", justifyContent: "center", padding: "5px 0", boxShadow: "0 0 16px rgba(79,195,247,0.5), 0 0 4px rgba(79,195,247,0.25), inset 0 0 8px rgba(79,195,247,0.1)" }}>
                  <div style={{ width: 4, height: 9, background: C.secondary, borderRadius: 2, boxShadow: "0 0 6px rgba(79,195,247,0.8)" }} className="scroll-dot" />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Inter, sans-serif", color: "rgba(248,250,252,0.95)", textShadow: "0 1px 4px rgba(0,0,0,0.8), 0 0 12px rgba(79,195,247,0.25)" }}>Scroll to explore</span>
              </div>
            </div>

            {/* Mid-scroll tagline */}
            <div
              ref={midTagRef}
              style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", opacity: 0, pointerEvents: "none", width: "88%", maxWidth: 640, zIndex: 10 }}
            >
              <div ref={midTagInnerRef}>
                {/* Overline */}
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.28em",
                  color: C.secondary, textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif", marginBottom: 20, opacity: 0.65,
                  textShadow: "0 0 12px rgba(79,195,247,0.4)",
                }}>
                </div>

                {/* Main headline */}
                <p style={{
                  fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900,
                  color: C.onSurface, fontFamily: "Inter, sans-serif",
                  letterSpacing: "-0.04em", lineHeight: 1.1,
                  margin: "0 0 28px 0",
                  textShadow: "0 1px 0 rgba(0,0,0,1), 0 3px 20px rgba(0,0,0,0.9), 0 8px 50px rgba(0,0,0,0.6)",
                }}>
                  Built for every skill level<br />
                  <span style={{
                    color: C.secondary,
                    fontStyle: "italic",
                    fontWeight: 800,
                    textShadow: "0 1px 0 rgba(0,0,0,1), 0 3px 20px rgba(0,0,0,0.9), 0 0 35px rgba(79,195,247,0.35)",
                  }}>
                    don&apos;t leave it to chance.
                  </span>
                </p>
              </div>
            </div>

            {/* End-of-scroll: product details + sign-up card */}
            <div
              ref={endDetailsRef}
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobileHeroLayout ? "96px 20px 28px" : "0 7%", opacity: 0, pointerEvents: "none", willChange: "opacity", transform: "translateZ(0)" }}
            >
              <div
                ref={endInnerRef}
                style={{
                  display: "flex",
                  width: "100%",
                  maxWidth: isMobileHeroLayout ? 420 : "none",
                  flexDirection: isMobileHeroLayout ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobileHeroLayout ? "stretch" : "center",
                  gap: isMobileHeroLayout ? 16 : 0,
                  willChange: "transform",
                }}
              >
              {/* Left: product details */}
              <div style={{ textShadow: "0 1px 0 rgba(0,0,0,1), 0 3px 16px rgba(0,0,0,0.85)", width: isMobileHeroLayout ? "100%" : "auto" }}>
                {/* <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", color: C.secondary, textTransform: "uppercase", marginBottom: 14, fontFamily: "Inter, sans-serif" }}>
                  Product Details
                </div> */}
                <div
                  ref={endBrandRef}
                  style={{
                  fontSize: "clamp(38px, 6vw, 70px)", fontWeight: 900, letterSpacing: "-0.04em",
                  fontFamily: "Inter, sans-serif", marginBottom: 4,
                  filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.72))",
                  willChange: "transform",
                  textAlign: isMobileHeroLayout ? "center" : "left",
                }}
                >
                  <span style={{ color: C.primary, textShadow: "0 1px 0 rgba(0,0,0,0.98), 0 4px 18px rgba(0,0,0,0.88), 0 0 24px rgba(21,101,192,0.8), 0 0 52px rgba(21,101,192,0.62)" }}>Fite</span>{" "}
                  <span style={{ color: C.secondary, textShadow: "0 1px 0 rgba(0,0,0,0.98), 0 4px 18px rgba(0,0,0,0.88), 0 0 24px rgba(79,195,247,0.9), 0 0 56px rgba(79,195,247,0.72)" }}>Finance</span>
                </div>
                <div className="lp-glass-card-solid" style={{
                  padding: isMobileHeroLayout ? 18 : 24,
                  marginTop: 14,
                  borderRadius: 16,
                  minWidth: 0,
                  width: "100%",
                  maxWidth: isMobileHeroLayout ? "100%" : 340,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.65)",
                  border: isPaid ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(21,101,192,0.3)",
                }}>
                  <div style={{ color: C.secondary, fontSize: isMobileHeroLayout ? 14 : 15, fontFamily: "Manrope, sans-serif", marginBottom: 12, fontWeight: 600, textAlign: isMobileHeroLayout ? "center" : "left" }}>
                    Practice, don&apos;t guess.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, lineHeight: 1.6, fontSize: isMobileHeroLayout ? 14 : 16, textAlign: isMobileHeroLayout ? "center" : "left" }}>
                    Train with custom questions, structured mock interviews, and instant feedback so you&apos;re never caught off guard.
                  </div>
                </div>
              </div>

              {/* Right: sign-up card */}
              <div className="lp-glass-card-solid" style={{
                padding: isMobileHeroLayout ? 22 : 32,
                borderRadius: 16,
                minWidth: 0,
                width: "100%",
                maxWidth: isMobileHeroLayout ? "100%" : 340,
                boxShadow: "0 4px 24px rgba(0,0,0,0.65)",
                border: isPaid ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(21,101,192,0.3)",
              }}>
                <h3 style={{ fontSize: isMobileHeroLayout ? 18 : 20, fontWeight: 700, margin: "0 0 8px 0", color: C.onSurface, fontFamily: "Inter, sans-serif", textAlign: isMobileHeroLayout ? "center" : "left" }}>
                  {isPaid ? "Welcome Back" : "Start Preparing"}
                </h3>
                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px 0", fontFamily: "Manrope, sans-serif", textAlign: isMobileHeroLayout ? "center" : "left" }}>
                  {isPaid ? "Your premium access is active." : "Built for IB, PE, and hedge fund candidates."}
                </p>
                {isLoaded && (
                  <>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <button className="lp-btn-mission">Start Practicing</button>
                      </SignUpButton>
                      <SignUpButton mode="modal">
                        <button className="lp-btn-upgrade">Upgrade to Premium</button>
                      </SignUpButton>
                      <p style={{ fontSize: 11, textAlign: "center", color: C.muted, margin: "10px 0 0", fontFamily: "Manrope, sans-serif", opacity: 0.7 }}>
                        Unlock all for $3/mo · no card to start
                      </p>
                    </SignedOut>
                    <SignedIn>
                      {isPaid ? (
                        <button className="lp-btn-mission-gold" onClick={() => router.push("/practice")}>Start Practicing</button>
                      ) : (
                        <>
                          <button className="lp-btn-mission" onClick={() => router.push("/practice")}>Start Practicing</button>
                          <button className="lp-btn-upgrade" onClick={handleUpgrade}>Upgrade to Premium</button>
                        </>
                      )}
                    </SignedIn>
                  </>
                )}
              </div>
              </div>{/* end endInnerRef */}
            </div>

            {/* Explore CTA — always visible */}
            <div
              style={{ position: "absolute", bottom: "6%", left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 30 }}
            >
              <button
                onClick={handleExplore}
                style={{ background: cyberGrad, color: "#fff", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 999, boxShadow: "0 0 32px rgba(21,101,192,0.55), 0 0 8px rgba(79,195,247,0.3)", letterSpacing: "0.04em" }}
                className="explore-btn"
              >
                Explore Features
              </button>
            </div>

            {/* Scroll progress bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }}>
              <div ref={progressBarRef} style={{ height: "100%", width: "0%", background: cyberGrad, boxShadow: "0 0 8px rgba(79,195,247,0.6)" }} />
            </div>
          </div>
        </section>

      </div>

      <style>{`
        html, body { background: #020817; overscroll-behavior-y: none; }
        @keyframes scrollDot {
          0%   { transform: translateY(0);   opacity: 1; }
          100% { transform: translateY(14px); opacity: 0; }
        }
        .scroll-dot { animation: scrollDot 1.6s ease-in-out infinite; }
        .hero-scroll-hint { opacity: 0; animation: fadeIn 0.5s ease 0.7s forwards; }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes explorePulse {
          0%, 100% { box-shadow: 0 0 32px rgba(21,101,192,0.55), 0 0 8px rgba(79,195,247,0.3); }
          50%       { box-shadow: 0 0 48px rgba(21,101,192,0.8), 0 0 24px rgba(79,195,247,0.5); }
        }
        .explore-btn { animation: explorePulse 2s ease-in-out infinite; }
        .explore-btn:hover { filter: brightness(1.15); transform: translateY(-2px) !important; }
      `}</style>
    </>
  );
}

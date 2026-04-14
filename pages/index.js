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
const frameSrc = (i) => `/frames/frame-${String(i).padStart(4, "0")}.jpg`;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { isLoaded } = useUser();
  const { isPaid } = usePaidStatus();
  const handleUpgrade = useUpgrade();

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

  // Hero text entrance — delayed so the global transition cover has partially lifted first
  useEffect(() => {
    const t = setTimeout(() => setHeroTextIn(true), 540);
    return () => clearTimeout(t);
  }, []);

  // "Explore" click — navigate to features/supplemental page
  const handleExplore = useCallback(() => {
    router.push("/features");
  }, [router]);

  // Canvas resize — keep it matched to viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      // Cap DPR at 1.5 — Retina at 2× means 4× pixels per drawImage call.
      // CSS scaling handles display; canvas doesn't need full DPR precision for video frames.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width  = Math.round(window.innerWidth  * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctxRef.current = null;
      const f = framesRef.current[0];
      if (f) drawFrame(f); // ImageBitmap has no .complete — check truthiness
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Frame preload — convert to ImageBitmap so drawImage pulls from GPU memory
  // instead of re-decoding the JPEG every frame.
  useEffect(() => {
    const arr = new Array(TOTAL_FRAMES).fill(null);
    framesRef.current = arr;
    Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new window.Image();
      img.onload = () => {
        const toBitmap = window.createImageBitmap
          ? window.createImageBitmap(img)
          : Promise.resolve(img);
        toBitmap
          .then(bmp => { arr[i] = bmp; if (i === 0) drawFrame(bmp); })
          .catch(()  => { arr[i] = img; if (i === 0) drawFrame(img); });
      };
      img.src = frameSrc(i + 1);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          const idx = Math.min(Math.floor(p * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1);
          const img = framesRef.current[idx];
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
    }
    init();
    return () => st?.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Fite Finance | Precision in Preparation</title>
        <meta name="description" content="AI-powered finance interview prep. Practice real questions, get instant AI grading, and ace your IB, PE, or HF interview." />
      </Head>

      <LandingNav />

      <div style={{ color: C.onSurface }}>

        {/* ── HERO — scroll-pinned canvas ────────────────────────────────────── */}
        <section ref={heroSectionRef} style={{ position: "relative", height: "600vh" }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

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
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 7%", opacity: 0, pointerEvents: "none", willChange: "opacity", transform: "translateZ(0)" }}
            >
              <div ref={endInnerRef} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", willChange: "transform" }}>
              {/* Left: product details */}
              <div style={{ textShadow: "0 1px 0 rgba(0,0,0,1), 0 3px 16px rgba(0,0,0,0.85)" }}>
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
                }}
                >
                  <span style={{ color: C.primary, textShadow: "0 1px 0 rgba(0,0,0,0.98), 0 4px 18px rgba(0,0,0,0.88), 0 0 24px rgba(21,101,192,0.8), 0 0 52px rgba(21,101,192,0.62)" }}>Fite</span>{" "}
                  <span style={{ color: C.secondary, textShadow: "0 1px 0 rgba(0,0,0,0.98), 0 4px 18px rgba(0,0,0,0.88), 0 0 24px rgba(79,195,247,0.9), 0 0 56px rgba(79,195,247,0.72)" }}>Finance</span>
                </div>
                <div className="lp-glass-card-solid" style={{
                  padding: 24, marginTop: 14, borderRadius: 16, minWidth: 270, maxWidth: 340,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.65)",
                  border: isPaid ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(21,101,192,0.3)",
                }}>
                  <div style={{ color: C.secondary, fontSize: 15, fontFamily: "Manrope, sans-serif", marginBottom: 12, fontWeight: 600 }}>
                    Practice, don&apos;t guess.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, lineHeight: 1.6 }}>
                    Train with custom questions, structured mock interviews, and instant feedback so you&apos;re never caught off guard.
                  </div>
                </div>
              </div>

              {/* Right: sign-up card */}
              <div className="lp-glass-card-solid" style={{
                padding: 32, borderRadius: 16, minWidth: 270, maxWidth: 340,
                boxShadow: "0 4px 24px rgba(0,0,0,0.65)",
                border: isPaid ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(21,101,192,0.3)",
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px 0", color: C.onSurface, fontFamily: "Inter, sans-serif" }}>
                  {isPaid ? "Welcome Back" : "Start Preparing"}
                </h3>
                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px 0", fontFamily: "Manrope, sans-serif" }}>
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

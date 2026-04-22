import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useEffect, useState, useCallback } from "react";
import LandingNav from "../src/LandingNav";
import { useUser } from "@clerk/clerk-react";
import { useAuthModal } from "../src/auth/AuthProvider";
import usePaidStatus from "../src/usePaidStatus";
import useUpgrade from "../src/useUpgrade";
import useStableViewport, { toViewportCssValue } from "../src/useStableViewport";

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

const TOTAL_FRAMES = 169;
const DESKTOP_FRAME_NUMBERS = Array.from({ length: TOTAL_FRAMES - 1 }, (_, i) => i + 2);
const MOBILE_FRAME_NUMBERS = DESKTOP_FRAME_NUMBERS.filter((n) => n % 2 === 1);
const frameSrc = (i, mobile = false) =>
  mobile
    ? `/frames/mobile/frame-${String(i).padStart(4, "0")}.webp`
    : `/frames/frame-${String(i).padStart(4, "0")}.webp`;
const heroFrameCache = new Map();

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { openSignUp } = useAuthModal();
  const { isPaid } = usePaidStatus();
  const handleUpgrade = useUpgrade();
  const heroViewport = useStableViewport();

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
  const endPracticeRef  = useRef(null); // left feature card
  const endSignupRef    = useRef(null); // right sign-up card
  const progressBarRef  = useRef(null);
  const pendingFrameRef = useRef(null); // RAF handle for batched canvas draws
  const frozenRef       = useRef(false); // set on routeChangeStart to stop canvas updates during cover
  const heroBlurRef     = useRef(null); // blur layer tied to hero text
  const midBlurRef      = useRef(null); // blur layer tied to mid-scroll text
  const endBlurRef      = useRef(null); // blur layer tied to end overlay
  const introColRef     = useRef(null); // desktop intro panel
  const cmpRef          = useRef(null); // pricing comparison container
  const cmpLeftRef      = useRef(null); // left stat block
  const cmpRightRef     = useRef(null); // right descriptive block
  const cmpNumRef       = useRef(null); // giant stat number (for subtle scale)
  const cmpBlurRef      = useRef(null); // blur layer for comparison section

  // Mount-only state
  const [heroTextIn, setHeroTextIn] = useState(false);
  const heroViewportHeight = heroViewport.height || null;
  const heroSceneHeight = toViewportCssValue(heroViewportHeight);
  const heroScrollHeight = heroViewportHeight ? `${heroViewportHeight * 10}px` : "1000vh";
  const isMobileHeroLayout = heroViewport.width > 0 && heroViewport.width <= 900;
  const heroFrameNumbers = isMobileHeroLayout ? MOBILE_FRAME_NUMBERS : DESKTOP_FRAME_NUMBERS;
  const heroFrameTotal = heroFrameNumbers.length;

  // Freeze canvas updates as soon as navigation starts so the ScrollTrigger scrub
  // doesn't rewind frames while the cover overlay is still sliding over the page.
  useEffect(() => {
    const freeze = () => { frozenRef.current = true; };
    const unfreeze = () => { frozenRef.current = false; };
    router.events.on("routeChangeStart", freeze);
    router.events.on("routeChangeError", unfreeze);
    return () => {
      router.events.off("routeChangeStart", freeze);
      router.events.off("routeChangeError", unfreeze);
    };
  }, [router.events]);

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

  // Set initial canvas offset on desktop so the bull logo is visible beside the intro column
  useEffect(() => {
    if (!canvasRef.current || !heroViewport.width) return;
    canvasRef.current.style.transform = isMobileHeroLayout
      ? "translateX(0) translateZ(0)"
      : "translateX(24%) translateZ(0)";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileHeroLayout, heroViewport.width]);

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

    const maxConcurrentLoads = isMobileHeroLayout ? 2 : 3;
    let nextIndex = 0;
    let activeLoads = 0;

    const commitFrame = (index, asset) => {
      if (cancelled) return;
      arr[index] = asset;
      if (index === 0) drawFrame(asset);
    };

    const isKeyFrameIndex = (index) => index === 0 || index === heroFrameNumbers.length - 1;

    const loadFrameAtIndex = (index) => {
      const frameNumber = heroFrameNumbers[index];
      // Key frames (first + last) always load the full-res desktop image for quality.
      const useHQ = isMobileHeroLayout && isKeyFrameIndex(index);
      const cacheKey = useHQ ? `hq:${frameNumber}` : frameNumber;
      const cachedAsset = heroFrameCache.get(cacheKey);

      if (cachedAsset) {
        commitFrame(index, cachedAsset);
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => {
          const finalize = (asset) => {
            heroFrameCache.set(cacheKey, asset);
            commitFrame(index, asset);
            resolve();
          };

          if ((useHQ || !isMobileHeroLayout) && window.createImageBitmap) {
            window.createImageBitmap(img).then(finalize).catch(() => finalize(img));
          } else {
            finalize(img);
          }
        };
        img.onerror = () => resolve();
        img.src = frameSrc(frameNumber, useHQ ? false : isMobileHeroLayout);
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
    if (!heroViewport.width || !heroViewport.height || !heroSectionRef.current) {
      return undefined;
    }

    let st;

    const resetHeroScene = () => {
      if (canvasRef.current) {
        canvasRef.current.style.transform = isMobileHeroLayout
          ? "translateX(0) translateZ(0)"
          : "translateX(24%) translateZ(0)";
      }

      if (introColRef.current) {
        introColRef.current.style.transform = "translateX(0) translateZ(0)";
        introColRef.current.style.opacity = "1";
      }

      if (heroOverlayRef.current) {
        heroOverlayRef.current.style.opacity = "1";
        heroOverlayRef.current.style.pointerEvents = "auto";
      }

      if (heroBlurRef.current) heroBlurRef.current.style.opacity = "1";
      if (midBlurRef.current) midBlurRef.current.style.opacity = "0";
      if (midTagRef.current) midTagRef.current.style.opacity = "0";

      if (line1Ref.current) line1Ref.current.style.transform = "translateX(0)";
      if (line2Ref.current) line2Ref.current.style.transform = "scale(1)";
      if (line3Ref.current) line3Ref.current.style.transform = "translateX(0)";
      if (scrollHintRef.current) scrollHintRef.current.style.opacity = "1";

      if (cmpRef.current) {
        cmpRef.current.style.opacity = "0";
        cmpRef.current.style.visibility = "hidden";
        cmpRef.current.style.transform = "translate3d(0,22px,0)";
      }
      if (cmpBlurRef.current) {
        cmpBlurRef.current.style.opacity = "0";
        cmpBlurRef.current.style.visibility = "hidden";
      }
      if (cmpLeftRef.current) {
        cmpLeftRef.current.style.transform = isMobileHeroLayout
          ? "translate3d(-50%,18px,0)"
          : "translate3d(-44px,-50%,0)";
      }
      if (cmpRightRef.current) {
        cmpRightRef.current.style.transform = isMobileHeroLayout
          ? "translate3d(-50%,22px,0)"
          : "translate3d(44px,-50%,0)";
      }
      if (cmpNumRef.current) cmpNumRef.current.style.transform = "scale(1) translateZ(0)";

      if (endDetailsRef.current) {
        endDetailsRef.current.style.opacity = "0";
        endDetailsRef.current.style.pointerEvents = "none";
      }
      if (endBlurRef.current) endBlurRef.current.style.opacity = "0";
      if (endBrandRef.current) endBrandRef.current.style.transform = "translateX(-120px)";

      endSpawnRef.current = false;
      midTagSpawnRef.current = false;
      endPracticeRef.current?.classList.remove("practice-panel-in");
      endSignupRef.current?.classList.remove("signup-panel-in");
    };

    resetHeroScene();

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
          if (frozenRef.current) return;
          const p = self.progress;

          // — Desktop intro phase (p: INTRO_DELAY → INTRO) —
          // Column slides out left, canvas translates back to center.
          const INTRO_DELAY = 0.04;
          const INTRO = 0.16;
          if (!isMobileHeroLayout) {
            const introT = Math.min(Math.max((p - INTRO_DELAY) / (INTRO - INTRO_DELAY), 0), 1);
            if (introColRef.current) {
              introColRef.current.style.transform = `translateX(${-introT * 105}%) translateZ(0)`;
              introColRef.current.style.opacity   = "1";
            }
            if (canvasRef.current) {
              canvasRef.current.style.transform = `translateX(${(1 - introT) * 24}%) translateZ(0)`;
            }
          }

          // Remap progress: on desktop the existing animation runs over p: INTRO → 1.0
          const np = isMobileHeroLayout ? p : Math.max(0, (p - INTRO) / (1 - INTRO));

          // — Canvas frame — batched to one draw per animation frame.
          // Skip when the end overlay fully covers the canvas (np ≥ 0.94) so the
          // browser isn't compositing canvas draws that are invisible anyway.
          const idx = Math.min(Math.floor(np * (heroFrameTotal - 1)), heroFrameTotal - 1);
          const img = getClosestLoadedFrame(idx);
          if (img && np < 0.94) {
            if (pendingFrameRef.current) cancelAnimationFrame(pendingFrameRef.current);
            pendingFrameRef.current = requestAnimationFrame(() => {
              pendingFrameRef.current = null;
              drawFrame(img);
            });
          }

          // — Progress bar —
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${np * 100}%`;
          }

          // — Hero text exit (mobile only; desktop uses intro column) —
          if (isMobileHeroLayout) {
            const textT = Math.max(0, Math.min((np - 0.18) / 0.1, 1));
            if (heroOverlayRef.current) {
              heroOverlayRef.current.style.opacity = `${1 - textT}`;
              heroOverlayRef.current.style.pointerEvents = textT > 0.5 ? "none" : "auto";
            }
            if (heroBlurRef.current) heroBlurRef.current.style.opacity = `${1 - textT}`;
            if (line1Ref.current) line1Ref.current.style.transform = `translateX(${-textT * 120}px)`;
            if (line2Ref.current) line2Ref.current.style.transform = `scale(${1 - textT * 0.3})`;
            if (line3Ref.current) line3Ref.current.style.transform = `translateX(${textT * 120}px)`;
            if (scrollHintRef.current) {
              scrollHintRef.current.style.opacity = `${Math.max(0, 1 - np / 0.04)}`;
            }
          }

          // — Pricing comparison —
          // Desktop: enter 0.04→0.15, hold 0.15→0.29, exit 0.29→0.36.
          // Mobile: enter 0.28→0.38 (after hero text exits), hold 0.38→0.48, exit 0.48→0.56.
          const cmpEnterStart = isMobileHeroLayout ? 0.28 : 0.04;
          const cmpEnterEnd   = isMobileHeroLayout ? 0.38 : 0.15;
          const cmpExitStart  = isMobileHeroLayout ? 0.48 : 0.29;
          const cmpExitEnd    = isMobileHeroLayout ? 0.56 : 0.36;
          const cmpEnter = Math.max(0, Math.min((np - cmpEnterStart) / (cmpEnterEnd - cmpEnterStart), 1));
          const cmpExit  = Math.max(0, Math.min((np - cmpExitStart)  / (cmpExitEnd  - cmpExitStart),  1));
          const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
          const cmpEnterE = easeInOut(cmpEnter);
          const cmpExitE  = easeInOut(cmpExit);
          const cmpOp = cmpEnterE * (1 - cmpExitE);

          // Visibility gate — skip compositor work entirely when offstage.
          const cmpActive = cmpOp > 0.005;
          if (cmpRef.current) {
            cmpRef.current.style.visibility = cmpActive ? "visible" : "hidden";
            if (cmpActive) {
              cmpRef.current.style.opacity = `${cmpOp}`;
              const ty = (1 - cmpEnterE) * 22 - cmpExitE * 18;
              cmpRef.current.style.transform = `translate3d(0,${ty}px,0)`;
            }
          }
          if (cmpBlurRef.current) {
            cmpBlurRef.current.style.visibility = cmpActive ? "visible" : "hidden";
            if (cmpActive) cmpBlurRef.current.style.opacity = `${cmpOp * 0.95}`;
          }
          if (cmpActive) {
            if (cmpLeftRef.current) {
              const txDesk = (1 - cmpEnterE) * -44 + cmpExitE * -14;
              const tyMob  = (1 - cmpEnterE) * 18 - cmpExitE * 14;
              cmpLeftRef.current.style.transform = isMobileHeroLayout
                ? `translate3d(-50%,${tyMob}px,0)`
                : `translate3d(${txDesk}px,-50%,0)`;
            }
            if (cmpRightRef.current) {
              const txDesk = (1 - cmpEnterE) * 44 + cmpExitE * 14;
              const tyMob  = (1 - cmpEnterE) * 22 - cmpExitE * 14;
              cmpRightRef.current.style.transform = isMobileHeroLayout
                ? `translate3d(-50%,${tyMob}px,0)`
                : `translate3d(${txDesk}px,-50%,0)`;
            }
            if (cmpNumRef.current) {
              const s = 0.88 + cmpEnterE * 0.12 - cmpExitE * 0.04;
              cmpNumRef.current.style.transform = `scale(${s}) translateZ(0)`;
            }
          }

          // — Mid-scroll tagline —
          // Desktop: 0.40→0.72; Mobile delayed so it doesn't collide with pricing exit.
          const midIn0  = isMobileHeroLayout ? 0.60 : 0.40;
          const midIn1  = isMobileHeroLayout ? 0.68 : 0.50;
          const midOut0 = isMobileHeroLayout ? 0.74 : 0.62;
          const midOut1 = isMobileHeroLayout ? 0.82 : 0.72;
          const midOp = np < midIn0 ? 0
            : np < midIn1 ? (np - midIn0) / (midIn1 - midIn0)
            : np < midOut0 ? 1
            : np < midOut1 ? 1 - (np - midOut0) / (midOut1 - midOut0)
            : 0;
          if (midTagRef.current) midTagRef.current.style.opacity = `${midOp}`;
          if (midBlurRef.current) midBlurRef.current.style.opacity = `${midOp}`;
          if (midOp > 0.05 && !midTagSpawnRef.current) {
            midTagSpawnRef.current = true;
          } else if (midOp < 0.01) {
            midTagSpawnRef.current = false;
          }

          // — End-of-scroll overlay (np: 0.82 → 0.94) —
          const endOp = Math.max(0, Math.min((np - 0.82) / 0.12, 1));
          if (endDetailsRef.current) {
            endDetailsRef.current.style.opacity      = `${endOp}`;
            endDetailsRef.current.style.pointerEvents = endOp > 0.5 ? "auto" : "none";
          }
          if (endBlurRef.current) endBlurRef.current.style.opacity = `${endOp}`;
          if (endBrandRef.current) {
            endBrandRef.current.style.transform = `translateX(${(1 - endOp) * -120}px)`;
          }
          if (endOp > 0.05 && !endSpawnRef.current) {
            endSpawnRef.current = true;
            const practice = endPracticeRef.current;
            const signup   = endSignupRef.current;
            if (practice) {
              practice.classList.remove("practice-panel-in");
              requestAnimationFrame(() => practice.classList.add("practice-panel-in"));
            }
            if (signup) {
              signup.classList.remove("signup-panel-in");
              requestAnimationFrame(() => signup.classList.add("signup-panel-in"));
            }
          } else if (endOp < 0.01) {
            endSpawnRef.current = false;
            endPracticeRef.current?.classList.remove("practice-panel-in");
            endSignupRef.current?.classList.remove("signup-panel-in");
          }
        },
      });

      ScrollTrigger.refresh();
    }
    init();
    return () => {
      st?.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroViewport.width, heroViewport.height, heroFrameTotal, isMobileHeroLayout]);

  return (
    <>
      <Head>
        <title>Fite Finance</title>
        <meta name="description" content="Free, AI-powered finance interview prep. Practice real questions, get instant AI grading, and ace your finance interview." />
        <link rel="canonical" href="https://fitefinance.com/" />

        {/* Open Graph (Facebook, LinkedIn, iMessage) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Fite Finance" />
        <meta property="og:url" content="https://fitefinance.com/" />
        <meta property="og:title" content="Fite Finance | Precise Preparation" />
        <meta property="og:description" content="AI-powered finance interview prep. Practice real questions, get instant AI grading, and ace your finance interview." />
        <meta property="og:image" content="https://fitefinance.com/logo-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="669" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fite Finance | Precise Preparation" />
        <meta name="twitter:description" content="AI-powered finance interview prep. Practice real questions, get instant AI grading, and ace your finance interview." />
        <meta name="twitter:image" content="https://fitefinance.com/logo-og.jpg" />
      </Head>

      <LandingNav />

      <div style={{ color: C.onSurface }}>

        {/* ── HERO — scroll-pinned canvas ────────────────────────────────────── */}
        <section ref={heroSectionRef} style={{ position: "relative", height: heroScrollHeight }}>
          <div style={{ position: "sticky", top: 0, height: heroSceneHeight, overflow: "hidden" }}>

            {/* Canvas */}
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#020817" }} />

            {/* Gradient vignette — full-width layers, no lateral edges ever visible */}
            {/* Bottom layer: darkens top + heavy bottom (hero text zone) */}
            {/* <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(2,8,23,0.1) 0%, rgba(2,8,23,0.1) 36%, rgba(2,8,23,0.1) 56%, rgba(2,8,23,0.1) 76%, rgba(2,8,23,0.4) 92%, rgba(2,8,23,0.8) 100%)", pointerEvents: "none" }} /> */}
            {/* Center layer: subtle ambient darkening for mid-scroll text legibility */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 55% at 50% 42%, rgba(2,8,23,0.0) 0%, transparent 65%)", pointerEvents: "none" }} />

            {/* Blur zone — bottom (hero text): starts visible, fades out with hero text */}
            <div ref={heroBlurRef} style={{
              position: "absolute", inset: 0,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              maskImage: "radial-gradient(ellipse 110% 58% at 50% 105%, black 0%, black 22%, rgba(0,0,0,0.55) 42%, transparent 60%)",
              WebkitMaskImage: "radial-gradient(ellipse 110% 58% at 50% 105%, black 0%, black 22%, rgba(0,0,0,0.55) 42%, transparent 60%)",
              pointerEvents: "none",
              willChange: "opacity",
              transform: "translateZ(0)",
            }} />
            {/* Blur zone — center (mid-scroll text): hidden until mid-scroll, fades with text */}
            <div ref={midBlurRef} style={{
              position: "absolute", inset: 0,
              backdropFilter: isMobileHeroLayout ? "none" : "blur(16px)",
              WebkitBackdropFilter: isMobileHeroLayout ? "none" : "blur(16px)",
              maskImage: "radial-gradient(ellipse 55% 48% at 50% 42%, black 0%, black 18%, rgba(0,0,0,0.7) 40%, transparent 60%)",
              WebkitMaskImage: "radial-gradient(ellipse 55% 48% at 50% 42%, black 0%, black 18%, rgba(0,0,0,0.7) 40%, transparent 60%)",
              pointerEvents: "none",
              opacity: 0,
              willChange: "opacity",
              transform: "translateZ(0)",
            }} />


            {/* Desktop intro column */}
            {!isMobileHeroLayout && (
              <div
                ref={introColRef}
                style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: "40%",
                  background: "linear-gradient(to right, rgba(2,8,23,0.97) 0%, rgba(2,8,23,0.96) 65%, rgba(2,8,23,0.7) 82%, rgba(2,8,23,0.15) 93%, transparent 100%)",
                  zIndex: 20,
                  display: "flex", flexDirection: "column", justifyContent: "flex-start",
                  overflow: "hidden",
                  paddingTop: "clamp(72px, 13vh, 130px)",
                  paddingBottom: "clamp(24px, 3.5vh, 48px)",
                  paddingLeft: "clamp(32px, 4vw, 64px)",
                  paddingRight: "6%",
                  willChange: "transform, opacity",
                  transform: "translateZ(0)",
                  pointerEvents: "auto",
                }}
              >
                {/* Badge */}
                <div style={{
                  display: "inline-block", alignSelf: "flex-start",
                  padding: "4px 12px", borderRadius: 999,
                  background: "rgba(21,101,192,0.18)",
                  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(21,101,192,0.38)",
                  color: C.secondary, fontSize: "clamp(9px, 0.7vw, 11px)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.15em",
                  marginBottom: "clamp(12px, 1.2vw, 20px)",
                  fontFamily: "Manrope, sans-serif",
                  textShadow: "0 0 12px rgba(79,195,247,0.5)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}>
                  Next-Gen Interview Preparation
                </div>

                {/* Heading */}
                <div style={{
                  fontSize: "clamp(32px, 4.2vw, 58px)", fontWeight: 900, lineHeight: 1.05,
                  letterSpacing: "-0.04em", color: C.onSurface, fontFamily: "Inter, sans-serif",
                  marginBottom: "clamp(24px, 3.5vh, 48px)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}>
                  <div style={{ textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,0.95), 0 8px 50px rgba(0,0,0,0.75)" }}>
                    Master Your
                  </div>
                  <div>
                    <span style={{
                      color: C.secondary, fontStyle: "italic",
                      textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,0.95), 0 0 40px rgba(79,195,247,0.7), 0 0 90px rgba(79,195,247,0.35)",
                    }}>Technicals</span>
                  </div>
                </div>

                {/* Mock question card */}
                <div style={{
                  borderRadius: 12,
                  background: "rgba(13,27,42,0.85)",
                  border: "1px solid rgba(79,195,247,0.14)",
                  borderLeft: "3px solid rgba(79,195,247,0.65)",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(79,195,247,0.06)",
                  padding: "clamp(14px, 1.4vw, 22px) clamp(14px, 1.4vw, 22px) clamp(12px, 1.2vw, 18px)",
                  maxWidth: "75%",
                  userSelect: "none",
                  pointerEvents: "none",
                }}>
                  {/* Card header: tags */}
                  <div style={{ display: "flex", gap: 6, marginBottom: "clamp(10px, 1vw, 16px)", alignItems: "center" }}>
                    <span style={{
                      fontSize: "clamp(8px, 0.6vw, 10px)", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: "rgba(21,101,192,0.22)", color: C.secondary,
                      fontFamily: "Manrope, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>Private Equity</span>
                    <span style={{
                      fontSize: "clamp(8px, 0.6vw, 10px)", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: "rgba(201,168,76,0.18)", color: C.gold,
                      fontFamily: "Manrope, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>Medium</span>
                  </div>

                  {/* Question text */}
                  <div style={{
                    fontSize: "clamp(11px, 0.9vw, 14px)", fontWeight: 600, color: C.onSurface,
                    fontFamily: "Inter, sans-serif", lineHeight: 1.55,
                    marginBottom: "clamp(10px, 1vw, 16px)",
                  }}>
                    A PE firm is acquiring a software company at 12× EBITDA. Post-close, EBITDA drops 20% due to customer churn. How does this affect the returns math, and what levers does the sponsor have?
                  </div>

                  {/* Mock answer area */}
                  <div style={{
                    borderRadius: 7, padding: "clamp(8px, 0.8vw, 12px) clamp(10px, 1vw, 14px)",
                    background: "rgba(2,8,23,0.55)", border: "1px solid rgba(79,195,247,0.1)",
                    marginBottom: "clamp(8px, 0.8vw, 12px)",
                  }}>
                    <div style={{
                      fontSize: "clamp(9px, 0.75vw, 12px)", color: C.muted,
                      fontFamily: "Manrope, sans-serif", lineHeight: 1.6, opacity: 0.55,
                    }}>
                      The entry equity value stays fixed but the EBITDA base shrinks, so effective entry multiple re-rates to ~15×. IRR erodes on both the numerator and denominator…
                    </div>
                  </div>

                </div>

                {/* Mock feedback card — mirrors the real dashboard feedback UI */}
                <div style={{
                  marginTop: "clamp(8px, 0.8vw, 12px)",
                  padding: "clamp(12px, 1.2vw, 18px) clamp(14px, 1.4vw, 20px)",
                  borderRadius: 12,
                  background: "rgba(13,27,42,0.7)",
                  borderLeft: "4px solid #4FC3F7",
                  maxWidth: "75%",
                  userSelect: "none",
                  pointerEvents: "none",
                }}>
                  {/* Score row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(8px, 0.8vw, 12px)" }}>
                    <div style={{ width: 36, height: 36, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="36" height="36" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(79,195,247,0.15)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#4FC3F7" strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={87.96} strokeDashoffset={87.96 * (1 - 0.78)} />
                      </svg>
                      <span style={{ fontSize: "clamp(9px, 0.75vw, 12px)", fontWeight: 900, color: "#4FC3F7", position: "relative", zIndex: 1 }}>7.8</span>
                    </div>
                    <div>
                      <div style={{ fontSize: "clamp(7px, 0.55vw, 9px)", fontWeight: 900, color: C.muted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 2 }}>SCORE</div>
                      <div style={{ fontSize: "clamp(11px, 0.95vw, 15px)", fontWeight: 900, color: "#4FC3F7" }}>7.8 <span style={{ fontSize: "clamp(9px, 0.7vw, 11px)", color: C.muted, fontWeight: 400 }}>/ 10</span></div>
                    </div>
                    <div style={{ flex: 1, marginLeft: 4 }}>
                      <div style={{ height: 3, background: "rgba(79,195,247,0.12)", borderRadius: 2 }}>
                        <div style={{ width: "78%", height: "100%", background: "linear-gradient(to right, #1565C099, #4FC3F7)", borderRadius: 2, boxShadow: "0 0 5px rgba(79,195,247,0.35)" }} />
                      </div>
                    </div>
                  </div>
                  {/* Feedback label + text */}
                  <div style={{ fontSize: "clamp(7px, 0.55vw, 9px)", fontWeight: 900, color: C.muted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: "clamp(4px, 0.4vw, 6px)" }}>AI Feedback</div>
                  <p style={{ fontSize: "clamp(9px, 0.75vw, 12px)", color: C.onSurface, lineHeight: 1.65, margin: 0, opacity: 0.8, fontFamily: "Inter, sans-serif" }}>
                    Good instinct on the multiple re-rate — flagging ~15× effective entry is the right anchor. Your IRR erosion logic is directionally correct but the levers section needs more structure...
                  </p>
                </div>

                {/* Scroll hint */}
                <div style={{
                  marginTop: "auto",
                  display: "flex", alignItems: "center", gap: 10, pointerEvents: "none",
                }}>
                  <div style={{
                    width: 22, height: 36, border: "2px solid rgba(79,195,247,0.85)", borderRadius: 11,
                    display: "flex", justifyContent: "center", padding: "4px 0",
                    boxShadow: "0 0 12px rgba(79,195,247,0.4), inset 0 0 6px rgba(79,195,247,0.08)",
                    flexShrink: 0,
                  }}>
                    <div style={{ width: 3, height: 7, background: C.secondary, borderRadius: 2, boxShadow: "0 0 6px rgba(79,195,247,0.8)" }} className="scroll-dot" />
                  </div>
                  <span style={{
                    fontSize: "clamp(9px, 0.7vw, 11px)", fontWeight: 700, letterSpacing: "0.15em",
                    textTransform: "uppercase", fontFamily: "Inter, sans-serif",
                    color: "rgba(248,250,252,0.9)",
                    textShadow: "0 1px 4px rgba(0,0,0,0.8), 0 0 10px rgba(79,195,247,0.2)",
                  }}>Scroll to explore</span>
                </div>
              </div>
            )}

            {/* Corner HUD — bottom left */}
            <div style={{ position: "absolute", bottom: 28, left: 32, fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: C.secondary, opacity: 0.4, textTransform: "uppercase", pointerEvents: "none" }}>
              FITE FINANCE
            </div>

            {/* Corner HUD — bottom right */}
            <div style={{ position: "absolute", bottom: 28, right: 32, fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: C.secondary, opacity: 0.4, textTransform: "uppercase", pointerEvents: "none" }}>
              PRECISE IN PREPARATION
            </div>

            {/* Hero text overlay — mobile only (desktop uses intro column) */}
            <div ref={heroOverlayRef} style={{ position: "absolute", bottom: "18%", left: "7%", zIndex: 10, display: isMobileHeroLayout ? undefined : "none" }}>
              <div style={{ padding: "22px 28px 26px" }}>
                <div style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 999,
                  background: "rgba(21,101,192,0.18)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(21,101,192,0.38)",
                  color: C.secondary, fontSize: isMobileHeroLayout ? 10 : "clamp(9px, 0.7vw, 11px)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: isMobileHeroLayout ? 20 : "clamp(12px, 1.2vw, 20px)",
                  fontFamily: "Manrope, sans-serif",
                  opacity: heroTextIn ? 1 : 0,
                  transform: heroTextIn ? "translateY(0)" : "translateY(14px)",
                  transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
                  textShadow: "0 0 12px rgba(79,195,247,0.5)",
                }}>
                  Next-Gen Interview Preparation
                </div>

                <div style={{ fontSize: isMobileHeroLayout ? "clamp(38px, 6vw, 70px)" : "clamp(32px, 4.2vw, 58px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", color: C.onSurface, fontFamily: "Inter, sans-serif", maxWidth: isMobileHeroLayout ? 600 : "38vw" }}>
                  <div
                    ref={line1Ref}
                    style={{
                      willChange: "transform",
                      opacity: heroTextIn ? 1 : 0,
                      transition: heroTextIn ? "opacity 0.6s ease 0.15s" : "opacity 0.6s ease 0.15s",
                      textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,0.95), 0 8px 50px rgba(0,0,0,0.75)",
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
                      textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,0.95), 0 0 40px rgba(79,195,247,0.7), 0 0 90px rgba(79,195,247,0.35)",
                    }}>Technicals</span>
                  </div>
                  <div
                    ref={line3Ref}
                    style={{
                      willChange: "transform",
                      opacity: heroTextIn ? 1 : 0,
                      transition: heroTextIn ? "opacity 0.6s ease 0.3s" : "opacity 0.6s ease 0.3s",
                      textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,0.95), 0 8px 50px rgba(0,0,0,0.75)",
                    }}
                  >
                  </div>
                </div>

                {/* Scroll hint */}
                <div ref={scrollHintRef} style={{ marginTop: 32, marginLeft: isMobileHeroLayout ? 0 : "clamp(4px, 0.5vw, 10px)", display: "flex", alignItems: "center", gap: 10, opacity: 1, transition: "opacity 0.5s ease 0.6s", pointerEvents: "none" }}
                  className="hero-scroll-hint"
                >
                  <div style={{ width: 26, height: 42, border: `2px solid rgba(79,195,247,0.9)`, borderRadius: 13, display: "flex", justifyContent: "center", padding: "5px 0", boxShadow: "0 0 16px rgba(79,195,247,0.5), 0 0 4px rgba(79,195,247,0.25), inset 0 0 8px rgba(79,195,247,0.1)" }}>
                    <div style={{ width: 4, height: 9, background: C.secondary, borderRadius: 2, boxShadow: "0 0 6px rgba(79,195,247,0.8)" }} className="scroll-dot" />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Inter, sans-serif", color: "rgba(248,250,252,0.95)", textShadow: "0 1px 4px rgba(0,0,0,0.8), 0 0 12px rgba(79,195,247,0.25)" }}>Scroll to explore</span>
                </div>
              </div>
            </div>

            {/* Pricing comparison — sits between intro exit and "Built for..." */}
            <div
              ref={cmpRef}
              className="cmp-section"
              style={{
                position: "absolute", inset: 0,
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                zIndex: 9,
                willChange: "opacity, transform",
                transform: "translate3d(0,22px,0)",
                contain: "layout paint style",
              }}
            >
              {/* Natural backdrop — deeper blur + soft radial dim halos behind each block */}
              <div
                ref={cmpBlurRef}
                style={{
                  position: "absolute", inset: 0,
                  backdropFilter: isMobileHeroLayout ? "blur(10px)" : "blur(28px)",
                  WebkitBackdropFilter: isMobileHeroLayout ? "blur(10px)" : "blur(28px)",
                  maskImage: isMobileHeroLayout
                    ? "radial-gradient(ellipse 98% 34% at 50% 38%, black 0%, black 68%, rgba(0,0,0,0.3) 88%, transparent 100%)"
                    : "radial-gradient(ellipse 34% 30% at 18% 50%, black 0%, black 62%, rgba(0,0,0,0.28) 85%, transparent 100%), radial-gradient(ellipse 34% 22% at 82% 50%, black 0%, black 62%, rgba(0,0,0,0.28) 85%, transparent 100%)",
                  WebkitMaskImage: isMobileHeroLayout
                    ? "radial-gradient(ellipse 98% 34% at 50% 38%, black 0%, black 68%, rgba(0,0,0,0.3) 88%, transparent 100%)"
                    : "radial-gradient(ellipse 34% 30% at 18% 50%, black 0%, black 62%, rgba(0,0,0,0.28) 85%, transparent 100%), radial-gradient(ellipse 34% 22% at 82% 50%, black 0%, black 62%, rgba(0,0,0,0.28) 85%, transparent 100%)",
                  opacity: 0,
                  visibility: "hidden",
                  pointerEvents: "none",
                  willChange: "opacity",
                  transform: "translateZ(0)",
                  contain: "layout paint style",
                }}
              />

              {/* Soft dim halo — pure gradient, no edges, sits under the copy */}
              <div
                aria-hidden
                style={{
                  position: "absolute", inset: 0,
                  background: isMobileHeroLayout
                    ? "radial-gradient(ellipse 92% 32% at 50% 38%, rgba(2,8,23,0.82) 0%, rgba(2,8,23,0.76) 18%, rgba(2,8,23,0.64) 36%, rgba(2,8,23,0.48) 52%, rgba(2,8,23,0.32) 68%, rgba(2,8,23,0.18) 80%, rgba(2,8,23,0.08) 90%, rgba(2,8,23,0.03) 96%, rgba(2,8,23,0) 100%)"
                    : "radial-gradient(ellipse 30% 26% at 14% 50%, rgba(2,8,23,0.9) 0%, rgba(2,8,23,0.84) 16%, rgba(2,8,23,0.74) 32%, rgba(2,8,23,0.6) 48%, rgba(2,8,23,0.43) 62%, rgba(2,8,23,0.27) 74%, rgba(2,8,23,0.14) 84%, rgba(2,8,23,0.06) 92%, rgba(2,8,23,0.02) 97%, rgba(2,8,23,0) 100%), radial-gradient(ellipse 27% 21% at 78.5% 51%, rgba(2,8,23,0.75) 0%, rgba(2,8,23,0.72) 22%, rgba(2,8,23,0.66) 38%, rgba(2,8,23,0.55) 52%, rgba(2,8,23,0.4) 64%, rgba(2,8,23,0.25) 76%, rgba(2,8,23,0.13) 85%, rgba(2,8,23,0.05) 93%, rgba(2,8,23,0.02) 97%, rgba(2,8,23,0) 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* Left block — giant stat */}
              <div
                ref={cmpLeftRef}
                className="cmp-left"
                style={{
                  position: "absolute",
                  left: isMobileHeroLayout ? "50%" : "5.5%",
                  top: isMobileHeroLayout ? "22%" : "50%",
                  transform: isMobileHeroLayout ? "translate(-50%, 0)" : "translateY(-50%)",
                  width: isMobileHeroLayout ? "86%" : "26%",
                  maxWidth: isMobileHeroLayout ? 440 : "none",
                  textAlign: isMobileHeroLayout ? "center" : "left",
                  willChange: "transform, filter",
                }}
              >
                {/* Mobile: gold eyebrow label (merges right block hook). Desktop: muted "The Premium Price" */}
                {isMobileHeroLayout ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    justifyContent: "center",
                    marginBottom: 14,
                  }}>
                    <div style={{
                      width: 22, height: 1,
                      background: C.gold,
                      boxShadow: "0 0 10px rgba(201,168,76,0.65)",
                    }} />
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800, letterSpacing: "0.22em",
                      textTransform: "uppercase", fontFamily: "Manrope, sans-serif",
                      color: C.gold,
                      textShadow: "0 0 14px rgba(201,168,76,0.4), 0 1px 3px rgba(0,0,0,0.95)",
                    }}>
                      Powered by Premium AI
                    </span>
                    <div style={{
                      width: 22, height: 1,
                      background: C.gold,
                      boxShadow: "0 0 10px rgba(201,168,76,0.65)",
                    }} />
                  </div>
                ) : (
                  <div style={{
                    fontSize: "clamp(10px, 0.75vw, 12px)",
                    fontWeight: 800, letterSpacing: "0.24em",
                    textTransform: "uppercase", fontFamily: "Manrope, sans-serif",
                    color: C.muted,
                    marginBottom: "clamp(8px, 0.8vw, 12px)",
                    opacity: 0.85,
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                  }}>
                    The Premium Price
                  </div>
                )}

                {/* Desktop only: price comparison above the giant number */}
                {!isMobileHeroLayout && (
                  <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "clamp(8px, 0.7vw, 12px)",
                    justifyContent: "flex-start",
                    flexWrap: "nowrap",
                    marginBottom: "clamp(2px, 0.3vw, 6px)",
                  }}>
                    <span style={{
                      fontSize: "clamp(15px, 1.2vw, 20px)",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      color: "rgba(203,213,225,0.95)",
                      letterSpacing: "-0.01em",
                      textDecoration: "line-through",
                      textDecorationColor: "rgba(231,120,120,0.85)",
                      textDecorationThickness: "2px",
                      textShadow: "0 1px 3px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.75)",
                    }}>
                      $20 / month
                    </span>
                    <span
                      aria-hidden
                      style={{
                        fontSize: "clamp(15px, 1.2vw, 20px)",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 800,
                        color: "rgba(201,168,76,0.9)",
                        lineHeight: 1,
                        textShadow: "0 0 10px rgba(201,168,76,0.55), 0 1px 3px rgba(0,0,0,0.9)",
                        transform: "translateY(-1px)",
                      }}
                    >
                      →
                    </span>
                    <span style={{
                      fontSize: "clamp(16px, 1.3vw, 22px)",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 800,
                      color: C.gold,
                      letterSpacing: "-0.01em",
                      textShadow: "0 0 14px rgba(201,168,76,0.5), 0 0 30px rgba(201,168,76,0.28), 0 1px 3px rgba(0,0,0,0.9)",
                    }}>
                      $3 / month
                    </span>
                  </div>
                )}

                {/* Giant hero number */}
                <div
                  ref={cmpNumRef}
                  className="cmp-num"
                  style={{
                    fontSize: isMobileHeroLayout
                      ? "clamp(72px, 22vw, 128px)"
                      : "clamp(96px, 11vw, 172px)",
                    fontWeight: 900, fontStyle: "italic",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 0.9,
                    letterSpacing: "-0.055em",
                    color: C.secondary,
                    transformOrigin: isMobileHeroLayout ? "center top" : "left center",
                    textShadow: "0 1px 0 rgba(0,0,0,1), 0 4px 18px rgba(0,0,0,0.95), 0 0 36px rgba(79,195,247,0.55), 0 0 82px rgba(79,195,247,0.28)",
                    margin: isMobileHeroLayout ? "0 0 2px" : "2px 0 clamp(8px, 0.9vw, 14px)",
                  }}
                >
                  15%
                </div>

                <div style={{
                  fontSize: isMobileHeroLayout ? 18 : "clamp(14px, 1.1vw, 20px)",
                  fontWeight: 800,
                  fontFamily: "Inter, sans-serif",
                  color: C.onSurface,
                  lineHeight: 1.2,
                  letterSpacing: "-0.015em",
                  marginBottom: isMobileHeroLayout ? 14 : "clamp(10px, 1vw, 16px)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.8)",
                }}>
                  of the cost.
                </div>

                {/* Accent rule */}
                <div style={{
                  height: 2,
                  width: isMobileHeroLayout ? 64 : "42%",
                  background: "linear-gradient(to right, rgba(79,195,247,0.95), rgba(79,195,247,0))",
                  marginBottom: isMobileHeroLayout ? 14 : "clamp(10px, 1vw, 16px)",
                  marginLeft: isMobileHeroLayout ? "auto" : 0,
                  marginRight: isMobileHeroLayout ? "auto" : 0,
                  boxShadow: "0 0 12px rgba(79,195,247,0.4)",
                  borderRadius: 2,
                }} />

                {/* Mobile only: compact price row + closing line (merged from right block) */}
                {isMobileHeroLayout && (
                  <>
                    <div style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      justifyContent: "center",
                      flexWrap: "nowrap",
                      marginBottom: 12,
                    }}>
                      <span style={{
                        fontSize: 14,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        color: "rgba(203,213,225,0.95)",
                        letterSpacing: "-0.01em",
                        textDecoration: "line-through",
                        textDecorationColor: "rgba(231,120,120,0.85)",
                        textDecorationThickness: "2px",
                        textShadow: "0 1px 3px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.75)",
                      }}>
                        $20 / mo
                      </span>
                      <span
                        aria-hidden
                        style={{
                          fontSize: 14,
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 800,
                          color: "rgba(201,168,76,0.9)",
                          lineHeight: 1,
                          textShadow: "0 0 10px rgba(201,168,76,0.55), 0 1px 3px rgba(0,0,0,0.9)",
                          transform: "translateY(-1px)",
                        }}
                      >
                        →
                      </span>
                      <span style={{
                        fontSize: 15,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 800,
                        color: C.gold,
                        letterSpacing: "-0.01em",
                        textShadow: "0 0 14px rgba(201,168,76,0.5), 0 0 30px rgba(201,168,76,0.28), 0 1px 3px rgba(0,0,0,0.9)",
                      }}>
                        $3 / mo
                      </span>
                    </div>

                    <p style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      color: "rgba(241,245,249,0.96)",
                      lineHeight: 1.45,
                      letterSpacing: "-0.005em",
                      margin: 0,
                      textShadow: "0 1px 4px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.8), 0 4px 26px rgba(0,0,0,0.55)",
                    }}>
                      Same frontier AI.{" "}
                      <span style={{
                        color: C.secondary,
                        fontWeight: 800,
                        fontStyle: "italic",
                        letterSpacing: "-0.01em",
                        textShadow: "0 0 16px rgba(79,195,247,0.55), 0 0 34px rgba(79,195,247,0.28), 0 1px 3px rgba(0,0,0,0.9)",
                      }}>We absorb the cost.</span>
                    </p>
                  </>
                )}
              </div>

              {/* Right block — descriptive (desktop only; merged into left block on mobile) */}
              <div
                ref={cmpRightRef}
                className="cmp-right"
                style={{
                  position: "absolute",
                  right: "5.5%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "26%",
                  textAlign: "left",
                  willChange: "transform, filter",
                  display: isMobileHeroLayout ? "none" : undefined,
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  justifyContent: isMobileHeroLayout ? "center" : "flex-start",
                  marginBottom: isMobileHeroLayout ? 10 : "clamp(10px, 1vw, 14px)",
                }}>
                  <div style={{
                    width: isMobileHeroLayout ? 22 : "clamp(22px, 2.2vw, 34px)",
                    height: 1,
                    background: C.gold,
                    boxShadow: "0 0 10px rgba(201,168,76,0.65)",
                  }} />
                  <span style={{
                    fontSize: isMobileHeroLayout ? 10 : "clamp(10px, 0.78vw, 12px)",
                    fontWeight: 800, letterSpacing: "0.22em",
                    textTransform: "uppercase", fontFamily: "Manrope, sans-serif",
                    color: C.gold,
                    textShadow: "0 0 14px rgba(201,168,76,0.4), 0 1px 3px rgba(0,0,0,0.95)",
                  }}>
                    Powered by Premium AI
                  </span>
                </div>

                <p style={{
                  fontSize: isMobileHeroLayout ? 13.5 : "clamp(13px, 1vw, 17px)",
                  fontWeight: 500,
                  fontFamily: "Inter, sans-serif",
                  color: C.onSurface,
                  lineHeight: 1.55,
                  letterSpacing: "-0.005em",
                  margin: 0,
                  textShadow: "0 1px 4px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.8), 0 4px 26px rgba(0,0,0,0.55)",
                }}>
                  Fite runs on the same frontier models behind{" "}
                  <span style={{ color: C.secondary, fontWeight: 800, textShadow: "0 0 18px rgba(79,195,247,0.55)" }}>$20/month</span>{" "}
                  tools — a{" "}
                  <span style={{ color: C.secondary, fontWeight: 800, fontStyle: "italic", textShadow: "0 0 18px rgba(79,195,247,0.55)" }}>6.5×</span>{" "}
                  premium on intelligence.
                </p>
                <p style={{
                  fontSize: isMobileHeroLayout ? 13.5 : "clamp(13px, 1vw, 17px)",
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  color: "rgba(241,245,249,0.96)",
                  lineHeight: 1.5,
                  letterSpacing: "-0.005em",
                  margin: isMobileHeroLayout ? "10px 0 0" : "clamp(10px, 1vw, 16px) 0 0",
                  textShadow: "0 1px 4px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.8), 0 4px 26px rgba(0,0,0,0.55)",
                }}>
                  You get the answers.{" "}
                  <span style={{
                    color: C.secondary,
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "-0.01em",
                    textShadow: "0 0 16px rgba(79,195,247,0.55), 0 0 34px rgba(79,195,247,0.28), 0 1px 3px rgba(0,0,0,0.9)",
                  }}>We absorb the cost.</span>
                </p>
              </div>
            </div>

            {/* Mid-scroll tagline */}
            <div
              ref={midTagRef}
              style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%) translateZ(0)", textAlign: "center", opacity: 0, pointerEvents: "none", width: isMobileHeroLayout ? "88%" : "auto", maxWidth: isMobileHeroLayout ? 640 : "none", zIndex: 10, willChange: "opacity" }}
            >
              <div ref={midTagInnerRef} style={{ padding: "32px 26px",}}>
                {/* Main headline */}
                <p style={{
                  fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900,
                  color: C.onSurface, fontFamily: "Inter, sans-serif",
                  letterSpacing: "-0.04em", lineHeight: 1.4,
                  margin: 0,
                  textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.98), 0 8px 44px rgba(0,0,0,0.85), 0 16px 72px rgba(0,0,0,0.6)",
                }}>
                  <span style={{ display: "block", whiteSpace: isMobileHeroLayout ? "normal" : "nowrap", textAlign: "center" }}>Built for every student at any skill level.</span>
                </p>
                <p style={{
                  paddingTop: isMobileHeroLayout ? "6%" : "3%",
                  fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900,
                  color: C.onSurface, fontFamily: "Inter, sans-serif",
                  letterSpacing: "-0.04em", lineHeight: 1.4,
                  margin: 0,
                  textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.98), 0 8px 44px rgba(0,0,0,0.85), 0 16px 72px rgba(0,0,0,0.6)",
                }}>
                  <span style={{
                    color: C.secondary,
                    fontStyle: "italic",
                    fontWeight: 800,
                    textShadow: "0 1px 0 rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.98), 0 0 36px rgba(79,195,247,0.65), 0 0 80px rgba(79,195,247,0.3)",
                  }}>
                    Don&apos;t leave it to chance.
                  </span>
                </p>
              </div>
            </div>

            {/* End-of-scroll: product details + sign-up card */}
            <div
              ref={endDetailsRef}
              className="end-details-outer"
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: isMobileHeroLayout ? "center" : "flex-start", justifyContent: "center", padding: isMobileHeroLayout ? "0 7%" : "10.8% 3.3% 0", opacity: 0, pointerEvents: "none", willChange: "opacity", transform: "translateZ(0)" }}
            >
              <div
                ref={endInnerRef}
                className="end-panels-inner"
                style={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: isMobileHeroLayout ? "stretch" : "flex-start",
                  willChange: "transform",
                }}
              >
              {/* Left: product details */}
              <div className="end-panel-left" style={{ padding: isMobileHeroLayout ? "28px 30px" : 0, width: isMobileHeroLayout ? undefined : "28%" }}>
                <div>
                <div
                  ref={endPracticeRef}
                  style={{
                    marginTop: isMobileHeroLayout ? 8 : "clamp(-80px, -4vw, -40px)",
                    borderRadius: 14,
                    padding: isMobileHeroLayout ? "14px 14px 14px 16px" : "clamp(18px, 1.8vw, 32px) clamp(18px, 1.8vw, 32px) clamp(18px, 1.8vw, 32px) clamp(16px, 1.6vw, 28px)",
                    background: "rgba(4,10,28,0.78)",
                    backdropFilter: isMobileHeroLayout ? "none" : "blur(16px)",
                    willChange: "opacity, transform",
                    borderTop: "1px solid rgba(79,195,247,0.1)",
                    borderRight: "1px solid rgba(79,195,247,0.1)",
                    borderBottom: "1px solid rgba(79,195,247,0.1)",
                    borderLeft: "3px solid rgba(79,195,247,0.7)",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(79,195,247,0.07)",
                    minWidth: 0,
                    width: "100%",
                    maxWidth: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{
                    color: C.secondary,
                    fontSize: isMobileHeroLayout ? 12 : "clamp(13px, 1.1vw, 20px)",
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                    marginBottom: isMobileHeroLayout ? 10 : "clamp(14px, 1.4vw, 26px)",
                    textShadow: "0 0 18px rgba(79,195,247,0.45)",
                  }}>
                    Practice, don&apos;t guess.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: isMobileHeroLayout ? 8 : "clamp(12px, 1.2vw, 22px)" }}>
                    {[
                      ["8 Interview Categories", "IB, PE, AM, Consulting & more"],
                      ["AI-Powered Grading",     "Instant feedback on every answer"],
                      ["Mock Interview Mode",    "Structured scenarios with scoring"],
                    ].map(([title, sub]) => (
                      <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "rgba(79,195,247,0.65)", fontSize: isMobileHeroLayout ? 9 : "clamp(8px, 0.6vw, 12px)", marginTop: isMobileHeroLayout ? 3 : 4, flexShrink: 0, lineHeight: 1 }}>▸</span>
                        <div>
                          <div style={{ fontSize: isMobileHeroLayout ? 11 : "clamp(12px, 1.0vw, 18px)", fontWeight: 700, color: C.onSurface, fontFamily: "Inter, sans-serif", lineHeight: 1.3 }}>{title}</div>
                          <div style={{ fontSize: isMobileHeroLayout ? 10 : "clamp(10px, 0.85vw, 15px)", color: C.muted, fontFamily: "Manrope, sans-serif", marginTop: 2, lineHeight: 1.3, opacity: 0.8 }}>{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </div>{/* end zIndex wrapper */}
              </div>

              {/* Right: sign-up card */}
              <div ref={endSignupRef} className="lp-glass-card-solid" style={{
                padding: isMobileHeroLayout ? 18 : "2.5%",
                borderRadius: 16,
                minWidth: 0,
                width: isMobileHeroLayout ? "calc(100% - 60px)" : "28%",
                maxWidth: "none",
                marginTop: isMobileHeroLayout ? undefined : "clamp(-80px, -4vw, -40px)",
                marginLeft: isMobileHeroLayout ? 30 : undefined,
                marginRight: isMobileHeroLayout ? 30 : undefined,
                boxSizing: "border-box",
                boxShadow: isPaid
                  ? "0 4px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,168,76,0.15), 0 0 40px rgba(201,168,76,0.08)"
                  : "0 4px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(21,101,192,0.15), 0 0 40px rgba(21,101,192,0.1)",
                border: isPaid ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(21,101,192,0.35)",
              }}>
                <h3 style={{ fontSize: isMobileHeroLayout ? 16 : "clamp(18px, 1.6vw, 26px)", fontWeight: 700, margin: "0 0 6px 0", color: C.onSurface, fontFamily: "Inter, sans-serif", textAlign: isMobileHeroLayout ? "center" : "left" }}>
                  {isPaid ? "Welcome Back" : "Start Preparing"}
                </h3>
                <p style={{ fontSize: isMobileHeroLayout ? 11 : "clamp(11px, 0.9vw, 15px)", color: C.muted, margin: isMobileHeroLayout ? "0 0 14px 0" : "0 0 1.8vw 0", fontFamily: "Manrope, sans-serif", textAlign: isMobileHeroLayout ? "center" : "left" }}>
                  {isPaid ? "Your premium access is active." : "Built for every student at any skill level."}
                </p>
                {isLoaded && (
                  <>
                    {!isSignedIn && (
                      <>
                        <button className="lp-btn-mission" onClick={() => openSignUp()} style={isMobileHeroLayout ? { padding: "11px 20px", fontSize: 14 } : undefined}>Start For Free</button>
                        <button className="lp-btn-upgrade" onClick={() => openSignUp()} style={isMobileHeroLayout ? { padding: "11px 20px", fontSize: 14 } : undefined}>Upgrade to Premium</button>
                      </>
                    )}
                    {isSignedIn && (
                      isPaid ? (
                        <button className="lp-btn-mission-gold" onClick={() => router.push("/dashboard")} style={isMobileHeroLayout ? { padding: "11px 20px", fontSize: 14 } : undefined}>Start Practicing</button>
                      ) : (
                        <>
                          <button className="lp-btn-mission" onClick={() => router.push("/dashboard")} style={isMobileHeroLayout ? { padding: "11px 20px", fontSize: 14 } : undefined}>Start Practicing</button>
                          <button className="lp-btn-upgrade" onClick={handleUpgrade} style={isMobileHeroLayout ? { padding: "11px 20px", fontSize: 14 } : undefined}>Upgrade to Premium</button>
                        </>
                      )
                    )}
                    {!isPaid && !isMobileHeroLayout && (
                      <p style={{ fontSize: 11, textAlign: "center", color: C.muted, margin: "10px 0 0", fontFamily: "Manrope, sans-serif", opacity: 0.7 }}>
                        Unlock all features for $3 / month
                      </p>
                    )}
                  </>
                )}
              </div>
              </div>{/* end endInnerRef */}
            </div>

            {/* Explore CTA — always visible */}
            <div
              style={{ position: "absolute", bottom: isMobileHeroLayout ? "4%" : "6%", left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 30, width: isMobileHeroLayout ? "calc(100% - 52px)" : "auto", maxWidth: isMobileHeroLayout ? 320 : "none" }}
            >
              <button
                onClick={handleExplore}
                style={{ background: cyberGrad, color: "#fff", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: isMobileHeroLayout ? 13 : 15, fontWeight: 700, padding: isMobileHeroLayout ? "11px 24px" : "14px 36px", borderRadius: 999, boxShadow: "0 0 32px rgba(21,101,192,0.55), 0 0 8px rgba(79,195,247,0.3)", letterSpacing: "0.04em", width: isMobileHeroLayout ? "100%" : "auto" }}
                className="explore-btn"
              >
                Explore Fite
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
          0%, 100% { filter: brightness(1);    }
          50%       { filter: brightness(1.25); }
        }
        .explore-btn { animation: explorePulse 2s ease-in-out infinite; will-change: filter; }
        .explore-btn:hover { filter: brightness(1.3) !important; transform: translateY(-2px) !important; }

        /* — Left feature card: sweeps in from the left — */
        @keyframes practiceIn {
          from { opacity: 0; transform: translateX(-56px) skewX(-3deg); }
          to   { opacity: 1; transform: translateX(0)     skewX(0deg); }
        }
        .practice-panel-in {
          animation: practiceIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* — Right sign-up card: lifts up from below with a slight scale — */
        @keyframes signupIn {
          from { opacity: 0; transform: translateY(52px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .signup-panel-in {
          opacity: 0;
          animation: signupIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards;
        }

        /* — Mobile layout — */
        @media (max-width: 900px) {
          .end-details-outer {
            align-items: flex-start !important;
            padding: 110px 12px 80px !important;
            overflow: hidden !important;
          }
          .end-panels-inner {
            flex-direction: column !important;
            width: 100% !important;
            max-width: 100% !important;
            align-items: stretch !important;
            gap: 10px !important;
            box-sizing: border-box !important;
          }
          .end-panel-left {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .end-brand {
            font-size: clamp(28px, 7vw, 46px) !important;
            text-align: center !important;
          }
          .end-panels-inner .lp-glass-card-solid {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </>
  );
}

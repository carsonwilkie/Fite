import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import { useUser } from "@clerk/nextjs";
import AuthCard from "./AuthCard";
import { AUTH_COLORS, cyberGrad } from "./AuthPrimitives";
import { sanitizeRedirectPath } from "./redirects";

export default function AuthFullPage({ view = "sign-in", title, description }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  // ?redirect_url=... wins; otherwise default home — the modal flow defaults
  // to /dashboard when a feature gate triggers it, but the standalone /sign-in
  // and /sign-up routes are usually entered from marketing surfaces, so / is
  // the safer fallback for that flow.
  // Guard on router.isReady: sign-in is a static page so router.query is
  // empty on the first render and only populated after client-side hydration.
  // Without this guard the effect can fire with redirectTo="/" before the
  // redirect_url param becomes available, sending the user to home instead
  // of the page they were trying to reach.
  const redirectTo = router.isReady
    ? sanitizeRedirectPath(router.query.redirect_url, "/")
    : null;

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !router.isReady || redirectTo === null) return;
    // AuthCard also stamps window.__fitePendingAuthRedirect on a successful
    // sign-in. Consume it (and prefer it if set) so the same value isn't
    // applied again the next time the modal opens. If a query-string redirect
    // is provided, that wins because it was an explicit caller intent.
    if (typeof window !== "undefined") {
      const pending = window.__fitePendingAuthRedirect;
      window.__fitePendingAuthRedirect = null;
      const target = router.query.redirect_url
        ? redirectTo
        : sanitizeRedirectPath(pending, redirectTo);
      router.replace(target || "/");
      return;
    }
    router.replace(redirectTo);
  }, [isLoaded, isSignedIn, redirectTo, router, router.isReady]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <div style={{
        minHeight: "100vh",
        background: AUTH_COLORS.bg,
        color: AUTH_COLORS.text,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "clamp(80px, calc((100vh - 640px) / 2), 128px) 20px 40px",
        position: "relative",
        overflowX: "clip",
      }}>
        {/* Ambient background */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 900,
            background: "radial-gradient(circle, rgba(21,101,192,0.18), transparent 60%)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          aria-hidden
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          style={{
            position: "absolute",
            bottom: "-25%",
            right: "-10%",
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(79,195,247,0.14), transparent 60%)",
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />

        {/* Floating back-to-home pill */}
        <Link
          href="/"
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            background: "rgba(13,27,42,0.6)",
            border: `1px solid ${AUTH_COLORS.borderSoft}`,
            borderRadius: 999,
            color: AUTH_COLORS.textMuted,
            fontFamily: "Manrope, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
            backdropFilter: "blur(10px)",
            transition: "color 0.2s, border-color 0.2s",
            zIndex: 3,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 2 }}
        >
          <AuthCard initialView={view} variant="page" afterAuthRedirect={redirectTo ?? "/"} />
        </motion.div>
      </div>
    </>
  );
}

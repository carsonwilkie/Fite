import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useUser } from "@clerk/clerk-react";
import usePaidStatus from "./usePaidStatus";
import useStableViewport, { toViewportCssValue } from "./useStableViewport";

const C = {
  bg: "#020817",
  surface: "#0d1b2a",
  surfaceHigh: "#132033",
  primary: "#1565C0",
  secondary: "#4FC3F7",
  gold: "#c9a84c",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  border: "rgba(79,195,247,0.12)",
  borderSoft: "rgba(79,195,247,0.08)",
  success: "#22c55e",
  danger: "#ef4444",
};

const cyberGrad = `linear-gradient(135deg, ${C.primary}, ${C.secondary})`;

const MAX_LEN = 4000;

export default function SubmissionPage({
  type,               // "feedback" | "vote"
  title,
  metaDescription,
  eyebrow,
  heading,
  subheading,
  icon = "campaign",
  placeholder,
  submitLabel,
  successHeading,
  successBody,
  roadmap,            // optional array of { icon, title, description }
  paidOnly = false,
}) {
  const router = useRouter();
  const viewport = useStableViewport();
  const { user, isLoaded } = useUser();
  const { isPaid, loading: paidLoading } = usePaidStatus();

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Paid-gate enforcement
  useEffect(() => {
    if (!paidOnly) return;
    if (!isLoaded || paidLoading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!isPaid) router.replace("/features");
  }, [paidOnly, isLoaded, paidLoading, user, isPaid, router]);

  const canSubmit = message.trim().length > 0 && !submitting && !submitted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          userId: user?.id || null,
          email: user?.primaryEmailAddress?.emailAddress || null,
          name: user?.fullName || user?.firstName || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const minH = toViewportCssValue(viewport, 100);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
      </Head>

      <div style={{
        position: "relative",
        minHeight: minH,
        background: C.bg,
        color: C.text,
        padding: "96px 20px 64px",
        overflowX: "hidden",
      }}>
        {/* Ambient background glows */}
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
            background: "radial-gradient(circle, rgba(21,101,192,0.16), transparent 60%)",
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
            background: "radial-gradient(circle, rgba(79,195,247,0.12), transparent 60%)",
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />

        {/* Back pill */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -1, borderColor: C.secondary }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.back()}
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            zIndex: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 999,
            border: `1px solid ${C.borderSoft}`,
            background: "rgba(13,27,42,0.6)",
            backdropFilter: "blur(10px)",
            color: C.text,
            fontFamily: "Manrope, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </motion.button>

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: "center", marginBottom: 36 }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(79,195,247,0.1)",
              border: `1px solid ${C.border}`,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.secondary,
              fontFamily: "Manrope, sans-serif",
              marginBottom: 18,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
              {eyebrow}
            </div>
            <h1 style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900,
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 12px",
              color: "#fff",
            }}>
              {heading}
            </h1>
            <p style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: C.textMuted,
              fontFamily: "Manrope, sans-serif",
              margin: "0 auto",
              maxWidth: 540,
            }}>
              {subheading}
            </p>
          </motion.div>

          {/* Roadmap list (vote page) */}
          {roadmap && roadmap.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "rgba(13,27,42,0.6)",
                border: `1px solid ${C.borderSoft}`,
                borderRadius: 18,
                padding: "20px 22px",
                marginBottom: 24,
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: C.secondary,
                fontFamily: "Manrope, sans-serif",
                marginBottom: 14,
              }}>
                Ideas on the board
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {roadmap.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.05 }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(8,18,32,0.5)",
                      border: `1px solid ${C.borderSoft}`,
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(79,195,247,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.secondary,
                      flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Inter, sans-serif", marginBottom: 2 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.55, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>
                        {item.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Form card / success card */}
          <AnimatePresence mode="wait" initial={false}>
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: "linear-gradient(180deg, rgba(13,27,42,0.95) 0%, rgba(8,18,32,0.98) 100%)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: "24px 24px 22px",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(79,195,247,0.08)",
                }}
              >
                <label
                  htmlFor="submission-message"
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: C.textMuted,
                    fontFamily: "Manrope, sans-serif",
                    marginBottom: 10,
                  }}
                >
                  Your message
                </label>
                <div style={{
                  borderRadius: 14,
                  padding: 1,
                  background: `linear-gradient(135deg, ${C.primary}40, ${C.secondary}25)`,
                }}>
                  <textarea
                    id="submission-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
                    placeholder={placeholder}
                    rows={8}
                    style={{
                      width: "100%",
                      minHeight: 180,
                      resize: "vertical",
                      background: C.surface,
                      border: "none",
                      outline: "none",
                      borderRadius: 13,
                      padding: "16px 18px",
                      fontSize: 15,
                      lineHeight: 1.65,
                      color: C.text,
                      fontFamily: "Inter, sans-serif",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 11, color: C.textDim, fontFamily: "Manrope, sans-serif" }}>
                  <span>Goes straight to support@fitefinance.com</span>
                  <span>{message.length} / {MAX_LEN}</span>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{
                        marginTop: 14,
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#fca5a5",
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>error</span>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={!canSubmit}
                  whileHover={canSubmit ? { y: -1 } : {}}
                  whileTap={canSubmit ? { scale: 0.98 } : {}}
                  style={{
                    marginTop: 18,
                    width: "100%",
                    padding: "14px 22px",
                    borderRadius: 12,
                    border: "none",
                    background: canSubmit ? cyberGrad : "rgba(21,101,192,0.2)",
                    color: canSubmit ? "#fff" : C.textMuted,
                    fontSize: 12,
                    fontWeight: 900,
                    fontFamily: "Manrope, sans-serif",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    boxShadow: canSubmit ? "0 12px 28px rgba(21,101,192,0.35)" : "none",
                    transition: "background 0.2s, box-shadow 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {submitting ? "autorenew" : "send"}
                  </span>
                  {submitting ? "Sending..." : submitLabel}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: "linear-gradient(180deg, rgba(13,27,42,0.95) 0%, rgba(8,18,32,0.98) 100%)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: "32px 28px",
                  backdropFilter: "blur(14px)",
                  textAlign: "center",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,197,94,0.18)",
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -60 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    color: C.success,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 32 }}>check_circle</span>
                </motion.div>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", color: "#fff", marginBottom: 8 }}>
                  {successHeading}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: C.textMuted, fontFamily: "Manrope, sans-serif", maxWidth: 460, margin: "0 auto 22px" }}>
                  {successBody}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/dashboard" style={{
                    padding: "12px 22px",
                    borderRadius: 12,
                    background: cyberGrad,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 900,
                    fontFamily: "Manrope, sans-serif",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 8px 24px rgba(21,101,192,0.35)",
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
                    Back to dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setMessage(""); setSubmitted(false); setError(null); }}
                    style={{
                      padding: "12px 22px",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      background: "rgba(13,27,42,0.6)",
                      color: C.text,
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: "Manrope, sans-serif",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Send another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

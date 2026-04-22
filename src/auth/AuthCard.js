import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSignIn, useSignUp, useClerk } from "@clerk/clerk-react";
import {
  AUTH_COLORS,
  CodeInput,
  Divider,
  FloatingInput,
  GhostButton,
  GoogleButton,
  PasswordStrength,
  PrimaryButton,
  ShakeWrapper,
  cyberGrad,
} from "./AuthPrimitives";

const RESEND_SECONDS = 30;

// Maps Clerk error codes to friendly messages.
function friendlyError(err) {
  if (!err) return "Something went wrong. Please try again.";
  const first = err?.errors?.[0];
  if (first?.longMessage) return first.longMessage;
  if (first?.message) return first.message;
  if (err?.message) return err.message;
  return "Something went wrong. Please try again.";
}

export default function AuthCard({
  initialView = "sign-in",
  onClose,
  variant = "modal", // "modal" | "page"
  afterAuthRedirect = "/dashboard",
}) {
  const [view, setView] = useState(initialView); // sign-in | sign-up | verify | forgot | reset
  const [dir, setDir] = useState(1);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef(null);

  useEffect(() => { setView(initialView); }, [initialView]);

  const go = useCallback((next, direction = 1) => {
    setDir(direction);
    setView(next);
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setMouse({
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    });
  };

  const showTabs = view === "sign-in" || view === "sign-up";

  return (
    <div
      className="auth-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        background: "linear-gradient(180deg, rgba(13,27,42,0.95) 0%, rgba(8,18,32,0.98) 100%)",
        border: `1px solid ${AUTH_COLORS.border}`,
        borderRadius: 20,
        padding: "32px 28px 28px",
        overflow: "hidden",
        boxShadow: variant === "modal"
          ? "0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(79,195,247,0.12), 0 0 80px rgba(21,101,192,0.18)"
          : "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(79,195,247,0.12)",
      }}
    >
      {/* Cursor-reactive glow layer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(420px circle at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(79,195,247,0.14), transparent 55%)`,
          transition: "background 0.12s linear",
        }}
      />
      {/* Corner gradient accents */}
      <div aria-hidden style={{
        position: "absolute", top: -60, right: -60, width: 180, height: 180,
        background: "radial-gradient(circle, rgba(79,195,247,0.18), transparent 70%)",
        filter: "blur(14px)", pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: -80, left: -40, width: 220, height: 220,
        background: "radial-gradient(circle, rgba(21,101,192,0.15), transparent 70%)",
        filter: "blur(18px)", pointerEvents: "none",
      }} />

      {/* Close (modal only) */}
      {variant === "modal" && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 3,
            width: 32, height: 32, borderRadius: 8,
            border: "none", background: "rgba(255,255,255,0.04)",
            cursor: "pointer", color: AUTH_COLORS.textMuted,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = AUTH_COLORS.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = AUTH_COLORS.textMuted; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
      )}

      {/* Header */}
      <div style={{ position: "relative", zIndex: 2, marginBottom: showTabs ? 18 : 20, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <img src="/favicon.png" alt="" width={26} height={26} style={{ borderRadius: 6 }} />
          <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
            <span style={{ color: AUTH_COLORS.primary }}>Fite</span>{" "}
            <span style={{ color: AUTH_COLORS.secondary }}>Finance</span>
          </div>
        </div>
        <CardTitle view={view} />
      </div>

      {/* Tabs (sign-in / sign-up only) */}
      {showTabs && (
        <div style={{ position: "relative", zIndex: 2, display: "flex", marginBottom: 22, background: "rgba(13,27,42,0.6)", border: `1px solid ${AUTH_COLORS.borderSoft}`, borderRadius: 12, padding: 4 }}>
          {[["sign-in", "Sign In"], ["sign-up", "Sign Up"]].map(([key, label], i) => {
            const active = view === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => go(key, i === 0 ? -1 : 1)}
                style={{
                  position: "relative",
                  flex: 1,
                  height: 36,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: active ? "#fff" : AUTH_COLORS.textMuted,
                  transition: "color 0.2s",
                  zIndex: 1,
                }}
              >
                {active && (
                  <motion.span
                    layoutId="auth-tab-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 9,
                      background: cyberGrad,
                      boxShadow: "0 4px 14px rgba(21,101,192,0.4)",
                      zIndex: -1,
                    }}
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Body views */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {view === "sign-in" && (
            <ViewWrap key="sign-in" dir={dir}>
              <SignInView onSwitch={(v, d) => go(v, d)} afterAuthRedirect={afterAuthRedirect} />
            </ViewWrap>
          )}
          {view === "sign-up" && (
            <ViewWrap key="sign-up" dir={dir}>
              <SignUpView onSwitch={(v, d) => go(v, d)} afterAuthRedirect={afterAuthRedirect} />
            </ViewWrap>
          )}
          {view === "verify" && (
            <ViewWrap key="verify" dir={dir}>
              <VerifyView onSwitch={(v, d) => go(v, d)} afterAuthRedirect={afterAuthRedirect} />
            </ViewWrap>
          )}
          {view === "forgot" && (
            <ViewWrap key="forgot" dir={dir}>
              <ForgotView onSwitch={(v, d) => go(v, d)} />
            </ViewWrap>
          )}
          {view === "reset" && (
            <ViewWrap key="reset" dir={dir}>
              <ResetView onSwitch={(v, d) => go(v, d)} afterAuthRedirect={afterAuthRedirect} />
            </ViewWrap>
          )}
        </AnimatePresence>
      </div>

      {/* Footer legal (sign-up) */}
      {view === "sign-up" && (
        <div style={{ position: "relative", zIndex: 2, marginTop: 14, textAlign: "center", fontSize: 11, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif", lineHeight: 1.55 }}>
          By creating an account, you agree to our{" "}
          <Link href="/terms" style={{ color: AUTH_COLORS.secondary, textDecoration: "none" }} onClick={onClose}>Terms</Link>{" "}
          &{" "}
          <Link href="/privacy" style={{ color: AUTH_COLORS.secondary, textDecoration: "none" }} onClick={onClose}>Privacy Policy</Link>.
        </div>
      )}
    </div>
  );
}

function CardTitle({ view }) {
  const titles = {
    "sign-in": { t: "Welcome back", s: "Sign in to continue your prep." },
    "sign-up": { t: "Create your account", s: "Join Fite Finance and start practicing." },
    "verify":  { t: "Verify your email", s: "We sent a 6-digit code to your inbox." },
    "forgot":  { t: "Reset your password", s: "Enter your email and we'll send a code." },
    "reset":   { t: "Choose a new password", s: "Enter the code we sent, then set a new password." },
  };
  const { t, s } = titles[view] || titles["sign-in"];
  return (
    <>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", color: "#fff", margin: "4px 0 4px" }}>
        {t}
      </div>
      <div style={{ fontSize: 13, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif" }}>
        {s}
      </div>
    </>
  );
}

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -20 : 20, opacity: 0 }),
};

function ViewWrap({ children, dir }) {
  return (
    <motion.div
      custom={dir}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── SIGN IN VIEW ────────────────────────────────────────────────────────── */
function SignInView({ onSwitch, afterAuthRedirect }) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const handleGoogle = async () => {
    if (!isLoaded) return;
    setErr(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: afterAuthRedirect,
      });
    } catch (e) {
      setErr(friendlyError(e));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setErr(null);
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        setErr("Additional verification required. Please use the Clerk hosted page.");
      }
    } catch (e) {
      setErr(friendlyError(e));
      setShake((s) => s + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <GoogleButton onClick={handleGoogle} disabled={loading || !isLoaded} />
      <Divider label="or" />
      <ShakeWrapper trigger={shake}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FloatingInput
            id="signin-email"
            type="email"
            label="Email address"
            icon="mail"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            autoFocus
          />
          <FloatingInput
            id="signin-password"
            type="password"
            label="Password"
            icon="lock"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </div>
      </ShakeWrapper>

      <div style={{ textAlign: "right", marginTop: -4 }}>
        <button
          type="button"
          onClick={() => onSwitch("forgot", 1)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: AUTH_COLORS.secondary, fontSize: 12, fontWeight: 600,
            fontFamily: "Manrope, sans-serif", padding: 0,
          }}
        >
          Forgot password?
        </button>
      </div>

      <ErrorBanner error={err} />

      <PrimaryButton type="submit" loading={loading} disabled={!email || !password}>
        Sign In
      </PrimaryButton>

      <div style={{ textAlign: "center", marginTop: 2, fontSize: 12, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif" }}>
        New here?{" "}
        <button
          type="button"
          onClick={() => onSwitch("sign-up", 1)}
          style={{ background: "none", border: "none", cursor: "pointer", color: AUTH_COLORS.secondary, fontWeight: 700, fontSize: 12, padding: 0 }}
        >
          Create an account
        </button>
      </div>
    </form>
  );
}

/* ─── SIGN UP VIEW ────────────────────────────────────────────────────────── */
function SignUpView({ onSwitch, afterAuthRedirect }) {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const handleGoogle = async () => {
    if (!isLoaded) return;
    setErr(null);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: afterAuthRedirect,
      });
    } catch (e) {
      setErr(friendlyError(e));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setErr(null);
    setLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        onSwitch("verify", 1);
      }
    } catch (e) {
      setErr(friendlyError(e));
      setShake((s) => s + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <GoogleButton onClick={handleGoogle} disabled={loading || !isLoaded} label="Sign up with Google" />
      <Divider label="or" />
      <ShakeWrapper trigger={shake}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FloatingInput
              id="signup-first"
              label="First name *"
              value={firstName}
              onChange={setFirstName}
              autoComplete="given-name"
              autoFocus
            />
            <FloatingInput
              id="signup-last"
              label="Last name *"
              value={lastName}
              onChange={setLastName}
              autoComplete="family-name"
            />
          </div>
          <FloatingInput
            id="signup-email"
            type="email"
            label="Email address"
            icon="mail"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <div>
            <FloatingInput
              id="signup-password"
              type="password"
              label="Password"
              icon="lock"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>
          {/* Clerk CAPTCHA mount point */}
          <div id="clerk-captcha" />
        </div>
      </ShakeWrapper>

      <ErrorBanner error={err} />

      <PrimaryButton type="submit" loading={loading} disabled={!firstName.trim() || !lastName.trim() || !email || password.length < 8}>
        Create Account
      </PrimaryButton>

      <div style={{ textAlign: "center", marginTop: 2, fontSize: 12, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif" }}>
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("sign-in", -1)}
          style={{ background: "none", border: "none", cursor: "pointer", color: AUTH_COLORS.secondary, fontWeight: 700, fontSize: 12, padding: 0 }}
        >
          Sign in
        </button>
      </div>
    </form>
  );
}

/* ─── VERIFY EMAIL ────────────────────────────────────────────────────────── */
function VerifyView({ onSwitch, afterAuthRedirect }) {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = useCallback(async (value) => {
    if (!isLoaded || loading) return;
    const codeStr = (value ?? code).trim();
    if (codeStr.length !== 6) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code: codeStr });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
      } else {
        setErr("Verification is pending. Please try again.");
      }
    } catch (e) {
      setErr(friendlyError(e));
      setShake((s) => s + 1);
    } finally {
      setLoading(false);
    }
  }, [code, isLoaded, loading, setActive, signUp]);

  const handleResend = async () => {
    if (!isLoaded || resending || cooldown > 0) return;
    setResending(true);
    setErr(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ShakeWrapper trigger={shake}>
        <CodeInput
          value={code}
          onChange={setCode}
          onComplete={(v) => submit(v)}
          autoFocus
        />
      </ShakeWrapper>

      <ErrorBanner error={err} />

      <PrimaryButton onClick={() => submit()} loading={loading} disabled={code.length !== 6}>
        Verify Email
      </PrimaryButton>

      <div style={{ textAlign: "center", fontSize: 12, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif" }}>
        Didn&apos;t get the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          style={{
            background: "none", border: "none",
            cursor: (cooldown > 0 || resending) ? "not-allowed" : "pointer",
            color: cooldown > 0 ? AUTH_COLORS.textDim : AUTH_COLORS.secondary,
            fontWeight: 700, fontSize: 12, padding: 0,
          }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : (resending ? "Sending..." : "Resend code")}
        </button>
      </div>

      <GhostButton onClick={() => onSwitch("sign-up", -1)}>
        Back
      </GhostButton>
    </div>
  );
}

/* ─── FORGOT PASSWORD (request code) ──────────────────────────────────────── */
function ForgotView({ onSwitch }) {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setErr(null);
    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      // Stash email for the reset step via SignIn singleton state.
      onSwitch("reset", 1);
    } catch (e) {
      setErr(friendlyError(e));
      setShake((s) => s + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ShakeWrapper trigger={shake}>
        <FloatingInput
          id="forgot-email"
          type="email"
          label="Email address"
          icon="mail"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          autoFocus
        />
      </ShakeWrapper>
      <ErrorBanner error={err} />
      <PrimaryButton type="submit" loading={loading} disabled={!email}>
        Send reset code
      </PrimaryButton>
      <GhostButton onClick={() => onSwitch("sign-in", -1)}>
        Back to sign in
      </GhostButton>
    </form>
  );
}

/* ─── RESET PASSWORD ──────────────────────────────────────────────────────── */
function ResetView({ onSwitch, afterAuthRedirect }) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    if (code.length !== 6) { setErr("Enter the 6-digit code."); return; }
    if (password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setErr(null);
    setLoading(true);
    try {
      const res = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
      } else if (res.status === "needs_second_factor") {
        setErr("Two-factor authentication is required for this account.");
      }
    } catch (e) {
      setErr(friendlyError(e));
      setShake((s) => s + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ShakeWrapper trigger={shake}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeInput value={code} onChange={setCode} autoFocus />
          <div>
            <FloatingInput
              id="reset-pw"
              type="password"
              label="New password"
              icon="lock"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>
        </div>
      </ShakeWrapper>
      <ErrorBanner error={err} />
      <PrimaryButton type="submit" loading={loading} disabled={code.length !== 6 || password.length < 8}>
        Reset password
      </PrimaryButton>
      <GhostButton onClick={() => onSwitch("sign-in", -1)}>
        Back to sign in
      </GhostButton>
    </form>
  );
}

/* ─── shared error banner ─────────────────────────────────────────────────── */
function ErrorBanner({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12,
            color: "#fca5a5",
            fontFamily: "Manrope, sans-serif",
            fontWeight: 600,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            lineHeight: 1.45,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>error</span>
          <span>{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useRouter } from "next/router";
import {
  AUTH_COLORS,
  FloatingInput,
  GhostButton,
  PasswordStrength,
  PrimaryButton,
  ShakeWrapper,
  cyberGrad,
} from "./AuthPrimitives";

const TABS = [
  { key: "profile",  label: "Profile",  icon: "person" },
  { key: "security", label: "Security", icon: "shield_lock" },
  { key: "sessions", label: "Sessions", icon: "devices" },
  { key: "danger",   label: "Danger",   icon: "warning" },
];

function friendlyError(err) {
  const first = err?.errors?.[0];
  if (first?.longMessage) return first.longMessage;
  if (first?.message) return first.message;
  if (err?.message) return err.message;
  return "Something went wrong.";
}

export default function AccountPanel() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [tabDir, setTabDir] = useState(1);

  useEffect(() => {
    if (isLoaded && !user) router.replace("/");
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }

  const handleTab = (next) => {
    const currentIdx = TABS.findIndex((t) => t.key === tab);
    const nextIdx = TABS.findIndex((t) => t.key === next);
    setTabDir(nextIdx > currentIdx ? 1 : -1);
    setTab(next);
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="account-page" style={{ position: "relative", minHeight: "100vh", background: AUTH_COLORS.bg, color: AUTH_COLORS.text, padding: "96px 20px 64px" }}>
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -1, borderColor: AUTH_COLORS.secondary }}
        whileTap={{ scale: 0.97 }}
        onClick={handleBack}
        className="account-back-btn"
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 999,
          border: `1px solid ${AUTH_COLORS.borderSoft}`,
          background: "rgba(13,27,42,0.6)",
          backdropFilter: "blur(10px)",
          color: AUTH_COLORS.text,
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
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, flexWrap: "wrap" }}
        >
          <AvatarRing user={user} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: "Manrope, sans-serif", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: AUTH_COLORS.secondary, marginBottom: 4 }}>
              Account
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {user.fullName || user.firstName || "Your Account"}
            </div>
            <div style={{ fontSize: 13, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif", marginTop: 4 }}>
              {user.primaryEmailAddress?.emailAddress}
            </div>
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signOut(() => router.push("/"))}
            style={{
              padding: "10px 18px", borderRadius: 12,
              border: `1px solid ${AUTH_COLORS.border}`,
              background: "rgba(13,27,42,0.6)",
              color: AUTH_COLORS.text,
              fontFamily: "Manrope, sans-serif",
              fontWeight: 700, fontSize: 12, letterSpacing: "0.12em",
              textTransform: "uppercase", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Sign out
          </motion.button>
        </motion.div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 220px) 1fr", gap: 24 }} className="account-layout">
          {/* Sidebar tabs */}
          <aside style={{
            position: "sticky", top: 96, alignSelf: "start",
            background: "rgba(13,27,42,0.55)",
            border: `1px solid ${AUTH_COLORS.borderSoft}`,
            borderRadius: 16, padding: 8,
            backdropFilter: "blur(10px)",
          }}>
            {TABS.map((t) => {
              const active = tab === t.key;
              const isDanger = t.key === "danger";
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTab(t.key)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 12px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background: active ? (isDanger ? "rgba(239,68,68,0.12)" : "rgba(79,195,247,0.12)") : "transparent",
                    color: active ? (isDanger ? "#fca5a5" : AUTH_COLORS.secondary) : AUTH_COLORS.textMuted,
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </aside>

          {/* Content */}
          <section style={{ minWidth: 0 }}>
            <AnimatePresence mode="wait" custom={tabDir}>
              <motion.div
                key={tab}
                custom={tabDir}
                initial={{ opacity: 0, x: tabDir > 0 ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tabDir > 0 ? -24 : 24 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {tab === "profile"  && <ProfilePane user={user} />}
                {tab === "security" && <SecurityPane user={user} />}
                {tab === "sessions" && <SessionsPane user={user} />}
                {tab === "danger"   && <DangerPane user={user} />}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          :global(.account-layout) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Avatar ──────────────────────────────────────────────────────────────── */
function AvatarRing({ user }) {
  const initials = (user.firstName?.[0] || user.primaryEmailAddress?.emailAddress?.[0] || "?").toUpperCase();
  return (
    <div style={{ position: "relative", width: 72, height: 72 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, ${AUTH_COLORS.secondary}, ${AUTH_COLORS.primary}, ${AUTH_COLORS.secondary})`,
          filter: "blur(2px)",
          opacity: 0.7,
        }}
      />
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        overflow: "hidden",
        background: AUTH_COLORS.surface,
        border: `2px solid ${AUTH_COLORS.bg}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "Inter, sans-serif", background: cyberGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Card wrapper ────────────────────────────────────────────────────────── */
function Card({ title, description, children, footer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "rgba(13,27,42,0.6)",
        border: `1px solid ${AUTH_COLORS.borderSoft}`,
        borderRadius: 18,
        padding: "24px 24px 20px",
        backdropFilter: "blur(10px)",
        marginBottom: 18,
      }}
    >
      {title && (
        <div style={{ marginBottom: description ? 4 : 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}>{title}</div>
        </div>
      )}
      {description && (
        <div style={{ fontSize: 13, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 18 }}>
          {description}
        </div>
      )}
      {children}
      {footer && <div style={{ marginTop: 18 }}>{footer}</div>}
    </motion.div>
  );
}

/* ─── Profile pane ────────────────────────────────────────────────────────── */
function ProfilePane({ user }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const dirty = firstName !== (user.firstName || "") || lastName !== (user.lastName || "");

  const save = async () => {
    if (!dirty || loading) return;
    setLoading(true); setErr(null); setMsg(null);
    try {
      await user.update({ firstName: firstName || "", lastName: lastName || "" });
      setMsg("Profile updated.");
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card title="Personal information" description="Update your name as it appears across Fite Finance.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FloatingInput id="profile-first" label="First name" value={firstName} onChange={setFirstName} />
          <FloatingInput id="profile-last" label="Last name" value={lastName} onChange={setLastName} />
        </div>
        <StatusLine error={err} message={msg} />
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <PrimaryButton onClick={save} loading={loading} disabled={!dirty} style={{ width: "auto", paddingLeft: 22, paddingRight: 22 }}>
            Save changes
          </PrimaryButton>
        </div>
      </Card>

      <EmailCard user={user} />
    </>
  );
}

function EmailCard({ user }) {
  const primary = user.primaryEmailAddress?.emailAddress;
  return (
    <Card title="Email address" description="Your email is used for sign-in and account notifications.">
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid ${AUTH_COLORS.borderSoft}`,
        background: "rgba(8,18,32,0.6)",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span className="material-symbols-outlined" style={{ color: AUTH_COLORS.secondary, fontSize: 20 }}>mail</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: AUTH_COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{primary}</div>
            <div style={{ fontSize: 11, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
              Primary · Verified
            </div>
          </div>
        </div>
        <span style={{
          fontSize: 10, fontFamily: "Manrope, sans-serif", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 999,
          background: "rgba(34,197,94,0.1)", color: AUTH_COLORS.success, border: "1px solid rgba(34,197,94,0.3)",
        }}>
          Active
        </span>
      </div>
      <div style={{ fontSize: 11, color: AUTH_COLORS.textDim, marginTop: 10, fontFamily: "Manrope, sans-serif" }}>
        To change your email, contact support@fitefinance.com.
      </div>
    </Card>
  );
}

/* ─── Security pane ───────────────────────────────────────────────────────── */
function SecurityPane({ user }) {
  const [verify, setVerify] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const passwordEnabled = !!user.passwordEnabled;

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (next.length < 8) { setErr("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setErr("Passwords don't match."); setShake((s) => s + 1); return; }
    if (passwordEnabled && !verify) { setErr("Enter your current password to confirm."); setShake((s) => s + 1); return; }
    setLoading(true); setErr(null); setMsg(null);
    try {
      await user.updatePassword({
        currentPassword: passwordEnabled ? verify : undefined,
        newPassword: next,
        signOutOfOtherSessions: true,
      });
      setMsg("Password updated. Other sessions have been signed out.");
      setVerify(""); setNext(""); setConfirm("");
    } catch (e) {
      setErr(friendlyError(e));
      setShake((s) => s + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={passwordEnabled ? "Change password" : "Set a password"}
      description={passwordEnabled
        ? "Use a strong password unique to Fite Finance. Other active sessions will be signed out."
        : "You signed in with Google. Set a password to also enable email + password sign-in."}
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ShakeWrapper trigger={shake}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {passwordEnabled && (
              <FloatingInput
                id="sec-current"
                type="password"
                label="Current password"
                icon="lock"
                value="••••••••••"
                onChange={() => {}}
                disabled
                autoComplete="off"
              />
            )}
            <div>
              <FloatingInput
                id="sec-next"
                type="password"
                label="New password"
                icon="key"
                value={next}
                onChange={setNext}
                autoComplete="new-password"
              />
              <PasswordStrength password={next} />
            </div>
            <FloatingInput
              id="sec-confirm"
              type="password"
              label="Confirm new password"
              icon="key"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
            {passwordEnabled && (
              <div>
                <FloatingInput
                  id="sec-verify"
                  type="password"
                  label="Verify with current password"
                  icon="verified_user"
                  value={verify}
                  onChange={setVerify}
                  autoComplete="current-password"
                />
                <div style={{ fontSize: 11, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif", marginTop: 6, letterSpacing: "0.02em" }}>
                  Confirms it's you before saving your new password.
                </div>
              </div>
            )}
          </div>
        </ShakeWrapper>
        <StatusLine error={err} message={msg} />
        <div>
          <PrimaryButton type="submit" loading={loading} disabled={(passwordEnabled && !verify) || !next || !confirm} style={{ width: "auto", paddingLeft: 22, paddingRight: 22 }}>
            {passwordEnabled ? "Update password" : "Set password"}
          </PrimaryButton>
        </div>
      </form>
    </Card>
  );
}

/* ─── Sessions pane ───────────────────────────────────────────────────────── */
function SessionsPane({ user }) {
  const { session: currentSession } = useClerk();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const list = await user.getSessions();
      setSessions(list);
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const revoke = async (id) => {
    if (busy) return;
    setBusy(id);
    try {
      const s = sessions.find((x) => x.id === id);
      if (s?.revoke) await s.revoke();
      await load();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card title="Active sessions" description="Devices currently signed in to your account.">
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}><Spinner /></div>
      ) : err ? (
        <StatusLine error={err} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map((s) => {
            const isCurrent = currentSession?.id === s.id;
            const device = s.latestActivity?.deviceType || "Device";
            const browser = s.latestActivity?.browserName || "Browser";
            const city = [s.latestActivity?.city, s.latestActivity?.country].filter(Boolean).join(", ");
            const ip = s.latestActivity?.ipAddress;
            return (
              <div key={s.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${isCurrent ? "rgba(79,195,247,0.35)" : AUTH_COLORS.borderSoft}`,
                background: isCurrent ? "rgba(79,195,247,0.05)" : "rgba(8,18,32,0.6)",
                flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(79,195,247,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: AUTH_COLORS.secondary,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {device.toLowerCase().includes("mobile") ? "smartphone" : "computer"}
                    </span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: AUTH_COLORS.text, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {browser} · {device}
                      {isCurrent && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                          padding: "2px 8px", borderRadius: 999,
                          background: "rgba(79,195,247,0.14)", color: AUTH_COLORS.secondary,
                          border: "1px solid rgba(79,195,247,0.3)",
                        }}>This device</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif", marginTop: 2 }}>
                      {city || ip || "Unknown location"}
                    </div>
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => revoke(s.id)}
                    disabled={busy === s.id}
                    style={{
                      border: "1px solid rgba(239,68,68,0.35)",
                      background: "rgba(239,68,68,0.08)",
                      color: "#fca5a5",
                      borderRadius: 10,
                      padding: "7px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "Manrope, sans-serif",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: busy === s.id ? "not-allowed" : "pointer",
                      opacity: busy === s.id ? 0.6 : 1,
                    }}
                  >
                    {busy === s.id ? "Revoking..." : "Revoke"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/* ─── Danger pane ─────────────────────────────────────────────────────────── */
function DangerPane({ user }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signOut } = useClerk();

  const canDelete = confirm.trim().toUpperCase() === "DELETE";

  const remove = async () => {
    if (!canDelete || loading) return;
    setLoading(true); setErr(null);
    try {
      await user.delete();
      await signOut();
      router.push("/");
    } catch (e) {
      setErr(friendlyError(e));
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "rgba(239,68,68,0.04)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 18,
        padding: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span className="material-symbols-outlined" style={{ color: "#fca5a5", fontSize: 22 }}>warning</span>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fca5a5", fontFamily: "Inter, sans-serif" }}>Delete account</div>
      </div>
      <div style={{ fontSize: 13, color: AUTH_COLORS.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 16, lineHeight: 1.55 }}>
        This permanently removes your Fite Finance account, history, and stats. Active subscriptions must be canceled from the billing portal first. This action cannot be undone.
      </div>

      <AnimatePresence initial={false}>
        {!open ? (
          <motion.div key="closed" exit={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen(true)}
              style={{
                border: "1px solid rgba(239,68,68,0.45)",
                background: "rgba(239,68,68,0.08)",
                color: "#fca5a5",
                borderRadius: 12,
                padding: "10px 18px",
                fontSize: 12,
                fontWeight: 800,
                fontFamily: "Manrope, sans-serif",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Delete my account
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ fontSize: 12, color: AUTH_COLORS.text, fontFamily: "Manrope, sans-serif", marginBottom: 10 }}>
              Type <b style={{ color: "#fca5a5" }}>DELETE</b> to confirm.
            </div>
            <FloatingInput
              id="delete-confirm"
              label="Type DELETE to confirm"
              value={confirm}
              onChange={setConfirm}
              autoFocus
            />
            <StatusLine error={err} />
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <PrimaryButton
                variant="danger"
                loading={loading}
                disabled={!canDelete}
                onClick={remove}
                style={{ width: "auto", paddingLeft: 22, paddingRight: 22 }}
              >
                Permanently delete
              </PrimaryButton>
              <GhostButton onClick={() => { setOpen(false); setConfirm(""); setErr(null); }} style={{ width: "auto", paddingLeft: 22, paddingRight: 22 }}>
                Cancel
              </GhostButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatusLine({ error, message }) {
  if (!error && !message) return null;
  return (
    <div style={{
      marginTop: 10,
      fontSize: 12,
      fontFamily: "Manrope, sans-serif",
      fontWeight: 600,
      color: error ? "#fca5a5" : AUTH_COLORS.success,
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
        {error ? "error" : "check_circle"}
      </span>
      {error || message}
    </div>
  );
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, ease: "linear", repeat: Infinity }}
      style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `2px solid ${AUTH_COLORS.borderSoft}`,
        borderTopColor: AUTH_COLORS.secondary,
      }}
    />
  );
}

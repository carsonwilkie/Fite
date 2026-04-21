import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export const AUTH_COLORS = {
  bg: "#020817",
  surface: "#0d1b2a",
  surfaceAlt: "#0b1526",
  primary: "#1565C0",
  secondary: "#4FC3F7",
  gold: "#c9a84c",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  border: "rgba(79,195,247,0.22)",
  borderSoft: "rgba(79,195,247,0.12)",
  danger: "#ef4444",
  success: "#22c55e",
};

export const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

export function FloatingInput({
  id,
  type = "text",
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  autoComplete,
  autoFocus,
  disabled,
  icon,
  rightAdornment,
  inputMode,
  maxLength,
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && showPw ? "text" : type;
  const filled = value !== undefined && value !== null && String(value).length > 0;
  const floating = focused || filled;

  return (
    <div style={{ position: "relative", width: "100%", padding: 4, margin: -4 }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: focused ? "rgba(79,195,247,0.06)" : "rgba(13,27,42,0.6)",
          border: `1px solid ${error ? AUTH_COLORS.danger : (focused ? AUTH_COLORS.secondary : AUTH_COLORS.border)}`,
          borderRadius: 12,
          transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
          boxShadow: focused
            ? `0 0 0 2px rgba(79,195,247,0.14), 0 4px 14px rgba(21,101,192,0.14)`
            : "0 1px 2px rgba(0,0,0,0.2)",
          paddingLeft: icon ? 44 : 16,
          paddingRight: (isPassword || rightAdornment) ? 44 : 16,
          height: 56,
        }}
      >
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 20,
              color: focused ? AUTH_COLORS.secondary : AUTH_COLORS.textMuted,
              transition: "color 0.2s",
              pointerEvents: "none",
            }}
          >
            {icon}
          </span>
        )}
        <label
          htmlFor={id}
          style={{
            position: "absolute",
            left: icon ? 44 : 16,
            top: floating ? 8 : "50%",
            transform: floating ? "translateY(0)" : "translateY(-50%)",
            fontSize: floating ? 10 : 14,
            fontFamily: "Manrope, sans-serif",
            fontWeight: floating ? 700 : 500,
            letterSpacing: floating ? "0.12em" : "0.01em",
            textTransform: floating ? "uppercase" : "none",
            color: error ? AUTH_COLORS.danger : (floating ? AUTH_COLORS.secondary : AUTH_COLORS.textMuted),
            pointerEvents: "none",
            transition: "all 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
            background: "transparent",
          }}
        >
          {label}
        </label>
        <input
          className="auth-floating-input"
          id={id}
          type={effectiveType}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value, e)}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          inputMode={inputMode}
          maxLength={maxLength}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            background: "transparent",
            outline: "none",
            color: AUTH_COLORS.text,
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            fontWeight: 500,
            paddingTop: floating ? 16 : 0,
            paddingBottom: floating ? 0 : 0,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              borderRadius: 8,
              cursor: "pointer",
              color: AUTH_COLORS.textMuted,
              transition: "color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = AUTH_COLORS.secondary; e.currentTarget.style.background = "rgba(79,195,247,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = AUTH_COLORS.textMuted; e.currentTarget.style.background = "transparent"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {showPw ? "visibility_off" : "visibility"}
            </span>
          </button>
        )}
        {rightAdornment && !isPassword && (
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
            {rightAdornment}
          </div>
        )}
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          style={{
            marginTop: 6,
            fontSize: 11,
            fontWeight: 600,
            color: AUTH_COLORS.danger,
            fontFamily: "Manrope, sans-serif",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
          {error}
        </motion.div>
      )}
    </div>
  );
}

export function PasswordStrength({ password }) {
  const { score, label, color } = evaluatePassword(password);
  const segments = 4;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: segments }).map((_, i) => {
          const active = i < score;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                background: active ? color : "rgba(255,255,255,0.08)",
                boxShadow: active ? `0 0 8px ${color}66` : "none",
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ flex: 1, height: 4, borderRadius: 4 }}
            />
          );
        })}
      </div>
      <div style={{
        marginTop: 5,
        fontSize: 10,
        fontFamily: "Manrope, sans-serif",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontWeight: 700,
        color: password ? color : AUTH_COLORS.textDim,
        transition: "color 0.2s",
      }}>
        {password ? label : "Minimum 8 characters"}
      </div>
    </div>
  );
}

function evaluatePassword(pw) {
  if (!pw) return { score: 0, label: "", color: AUTH_COLORS.textDim };
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s += 1;
  const map = [
    { label: "Very weak", color: "#ef4444" },
    { label: "Weak", color: "#f97316" },
    { label: "Okay", color: "#eab308" },
    { label: "Strong", color: "#22c55e" },
    { label: "Excellent", color: "#4FC3F7" },
  ];
  return { score: s, ...map[s] };
}

export function CodeInput({ length = 6, value, onChange, onComplete, autoFocus }) {
  const refs = useRef([]);
  const digits = value.padEnd(length, " ").split("").slice(0, length);

  const focusAt = (i) => {
    const el = refs.current[i];
    if (el) { el.focus(); el.select?.(); }
  };

  useEffect(() => {
    if (autoFocus) focusAt(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (i, v) => {
    const clean = v.replace(/\D/g, "");
    if (!clean) {
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next.slice(0, length));
      return;
    }
    if (clean.length > 1) {
      // Paste handling
      const merged = (value.slice(0, i) + clean).slice(0, length);
      onChange(merged);
      focusAt(Math.min(merged.length, length - 1));
      return;
    }
    const next = (value.slice(0, i) + clean + value.slice(i + 1)).slice(0, length);
    onChange(next);
    if (i < length - 1) focusAt(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        const next = value.slice(0, i) + value.slice(i + 1);
        onChange(next);
      } else if (i > 0) {
        focusAt(i - 1);
        const next = value.slice(0, i - 1) + value.slice(i);
        onChange(next);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < length - 1) {
      focusAt(i + 1);
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData("text");
    const clean = text.replace(/\D/g, "").slice(0, length);
    if (clean) {
      onChange(clean);
      focusAt(Math.min(clean.length, length - 1));
      e.preventDefault();
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => {
        const char = d === " " ? "" : d;
        const filled = char.length > 0;
        return (
          <motion.div
            key={i}
            animate={filled ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", flex: "0 0 auto" }}
          >
            <input
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              style={{
                width: 44,
                height: 54,
                borderRadius: 11,
                border: `1px solid ${filled ? AUTH_COLORS.secondary : AUTH_COLORS.border}`,
                background: filled ? "rgba(79,195,247,0.1)" : "rgba(13,27,42,0.6)",
                textAlign: "center",
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "Inter, sans-serif",
                color: AUTH_COLORS.text,
                outline: "none",
                transition: "all 0.2s",
                boxShadow: filled ? "0 0 14px rgba(79,195,247,0.25)" : "none",
                caretColor: AUTH_COLORS.secondary,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export function GoogleButton({ onClick, disabled, label = "Continue with Google" }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      style={{
        width: "100%",
        height: 48,
        border: `1px solid ${AUTH_COLORS.border}`,
        background: "rgba(255,255,255,0.04)",
        color: AUTH_COLORS.text,
        borderRadius: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transition: "border-color 0.2s, background 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = AUTH_COLORS.secondary;
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = AUTH_COLORS.border;
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
    >
      <GoogleIcon />
      {label}
    </motion.button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.2 3.62l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export function PrimaryButton({ children, loading, disabled, type = "button", onClick, variant = "primary", style }) {
  const bg = variant === "danger"
    ? "linear-gradient(135deg, #ef4444, #b91c1c)"
    : cyberGrad;
  const shadow = variant === "danger"
    ? "0 8px 24px rgba(239,68,68,0.35)"
    : "0 8px 24px rgba(21,101,192,0.35)";
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={(disabled || loading) ? undefined : { y: -1 }}
      whileTap={(disabled || loading) ? undefined : { scale: 0.98 }}
      style={{
        width: "100%",
        height: 48,
        border: "none",
        background: bg,
        color: "#fff",
        borderRadius: 12,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.02em",
        boxShadow: shadow,
        opacity: disabled ? 0.55 : 1,
        position: "relative",
        overflow: "hidden",
        transition: "opacity 0.2s, box-shadow 0.2s",
        ...style,
      }}
    >
      {loading ? <ButtonSpinner /> : children}
    </motion.button>
  );
}

export function GhostButton({ children, onClick, disabled, style }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      style={{
        width: "100%",
        height: 44,
        border: `1px solid ${AUTH_COLORS.border}`,
        background: "rgba(13,27,42,0.4)",
        color: AUTH_COLORS.text,
        borderRadius: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        transition: "border-color 0.2s, background 0.2s",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.borderColor = AUTH_COLORS.secondary; e.currentTarget.style.background = "rgba(79,195,247,0.08)"; } }}
      onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.borderColor = AUTH_COLORS.border; e.currentTarget.style.background = "rgba(13,27,42,0.4)"; } }}
    >
      {children}
    </motion.button>
  );
}

function ButtonSpinner() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }}
        />
      ))}
    </span>
  );
}

export function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.2), transparent)" }} />
      {label && (
        <span style={{
          fontSize: 10,
          fontFamily: "Manrope, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: AUTH_COLORS.textMuted,
        }}>{label}</span>
      )}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.2), transparent)" }} />
    </div>
  );
}

export function ShakeWrapper({ trigger, children }) {
  return (
    <motion.div
      animate={trigger ? { x: [0, -8, 8, -6, 6, -3, 0] } : { x: 0 }}
      transition={{ duration: 0.42, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

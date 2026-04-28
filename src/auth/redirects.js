export function sanitizeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "https://fitefinance.local");
    if (parsed.origin !== "https://fitefinance.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (_) {
    return fallback;
  }
}

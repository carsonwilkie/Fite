const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

const SUPPORT_EMAIL = "support@fitefinance.com";
const FROM_EMAIL = process.env.FEEDBACK_FROM_EMAIL || "feedback@fitefinance.com";

async function sendViaResend({ subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "missing-api-key" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Fite Finance <${FROM_EMAIL}>`,
        to: [SUPPORT_EMAIL],
        reply_to: replyTo || undefined,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { sent: false, reason: `resend-${res.status}`, detail: text };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: "resend-exception", detail: String(e?.message || e) };
  }
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, message, userId, email, name } = req.body || {};
  const kind = type === "vote" ? "vote" : "feedback";
  const text = typeof message === "string" ? message.trim() : "";

  if (!text) return res.status(400).json({ error: "Message is required." });
  if (text.length > 4000) return res.status(400).json({ error: "Message is too long." });

  const timestamp = Date.now();
  const record = { type: kind, message: text, userId: userId || null, email: email || null, name: name || null, timestamp };

  try {
    await redis.lpush(`${kind}:submissions`, JSON.stringify(record));
    await redis.ltrim(`${kind}:submissions`, 0, 499);
  } catch {
    // Non-fatal: still try to email.
  }

  const subject = kind === "vote" ? "Fite Finance — Feature Vote" : "Fite Finance — Feedback";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
      <h2 style="color:#1565C0; margin:0 0 12px;">${subject}</h2>
      <p style="color:#475569; font-size:13px; margin:0 0 16px;">
        Submitted ${new Date(timestamp).toISOString()}
      </p>
      <table style="width:100%; font-size:13px; color:#0F172A; border-collapse:collapse;">
        <tr><td style="padding:6px 0; color:#64748b;">Type</td><td style="padding:6px 0;">${escapeHtml(kind)}</td></tr>
        <tr><td style="padding:6px 0; color:#64748b;">User ID</td><td style="padding:6px 0;">${escapeHtml(userId || "(anonymous)")}</td></tr>
        <tr><td style="padding:6px 0; color:#64748b;">Name</td><td style="padding:6px 0;">${escapeHtml(name || "—")}</td></tr>
        <tr><td style="padding:6px 0; color:#64748b;">Email</td><td style="padding:6px 0;">${escapeHtml(email || "—")}</td></tr>
      </table>
      <div style="margin-top:16px; padding:16px; background:#F1F5F9; border-radius:12px; white-space:pre-wrap; font-size:14px; line-height:1.6; color:#0F172A;">
${escapeHtml(text)}
      </div>
    </div>
  `;

  const mail = await sendViaResend({ subject, html, replyTo: email });

  return res.status(200).json({ success: true, stored: true, emailed: mail.sent, emailReason: mail.sent ? null : mail.reason });
};

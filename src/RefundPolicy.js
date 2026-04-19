import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";
import useStableViewport, { toViewportCssValue } from "./useStableViewport";

const C = {
  bg: "#020817",
  surface: "#0d1b2e",
  surfaceHigh: "#132033",
  primary: "#1565C0",
  secondary: "#4FC3F7",
  text: "#e2e8f0",
  textMuted: "#64748b",
  border: "rgba(79,195,247,0.12)",
};

const content = `# Refund Policy

**Last updated: April 2026**

## Overview

Fite Finance offers a monthly subscription for Premium access at $3/month (or the current displayed price). This policy explains our approach to refunds and cancellations.

## Cancellations

You may cancel your Premium subscription at any time through the customer portal, accessible from the navbar when signed in. Upon cancellation:

- Your subscription will not renew at the next billing date
- You will retain access to all Premium features until the end of your current paid billing period
- No further charges will be made after cancellation

## Refunds

**All subscription payments are generally non-refundable.** We do not offer prorated refunds for unused time within a billing period.

### Exceptions

We will consider refund requests in the following circumstances:

- **Duplicate charges**: If you were charged more than once for the same billing period
- **Charges after cancellation**: If you were charged after successfully canceling your subscription
- **Technical issues**: If a significant technical failure on our end prevented you from accessing Premium features for an extended period during a paid billing period

### How to Request a Refund

To request a refund, contact us at support@fitefinance.com within **7 days** of the charge with:
- Your account email address
- The date and amount of the charge
- The reason for your refund request

We will respond within 3 business days and, if approved, process refunds within 5-10 business days to your original payment method.

## Free Tier

Fite Finance offers a free tier with up to 5 questions per day. We encourage users to explore the free tier before subscribing to Premium.

## Price Changes

If we increase the price of a Premium subscription, we will notify existing subscribers in advance. You will have the opportunity to cancel before the new price takes effect.

## Contact

For questions about billing or refunds, contact us at support@fitefinance.com.`;

function RefundPolicy() {
  const router = useRouter();
  const viewport = useStableViewport();
  const fullHeight = toViewportCssValue(viewport.height);
  return (
    <>
      <style jsx global>{`
        html, body { background: ${C.bg}; margin: 0; }
        .legal-content h1 { font-size: 26px; font-weight: 800; color: ${C.text}; margin: 0 0 6px; }
        .legal-content h2 { font-size: 16px; font-weight: 700; color: ${C.secondary}; margin: 28px 0 10px; text-transform: uppercase; letter-spacing: 0.06em; }
        .legal-content h3 { font-size: 14px; font-weight: 600; color: ${C.text}; margin: 20px 0 8px; }
        .legal-content p { font-size: 14px; color: ${C.textMuted}; line-height: 1.75; margin: 0 0 12px; }
        .legal-content ul { padding-left: 20px; margin: 0 0 12px; }
        .legal-content li { font-size: 14px; color: ${C.textMuted}; line-height: 1.75; margin-bottom: 4px; }
        .legal-content strong { color: ${C.text}; font-weight: 600; }
        .legal-content a { color: ${C.secondary}; text-decoration: none; }
        .legal-content a:hover { text-decoration: underline; }
      `}</style>
      <div style={{
        minHeight: fullHeight,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
      }}>
        {/* Top bar */}
        <div style={{
          width: "100%",
          maxWidth: 760,
          padding: "20px 24px 0",
          boxSizing: "border-box",
        }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: C.surfaceHigh,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.textMuted,
              fontSize: 13,
              fontWeight: 600,
              padding: "7px 14px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
          >
            ← Back
          </button>
        </div>

        {/* Content card */}
        <div style={{
          width: "100%",
          maxWidth: 760,
          margin: "24px 0 60px",
          padding: "0 24px",
          boxSizing: "border-box",
        }}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "40px 44px",
          }}>
            <div className="legal-content">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RefundPolicy;

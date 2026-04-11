import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";

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
  return (
    <div style={styles.page} className="page-bg page-wrapper">
      <div style={styles.wrapper} className="wrapper-mobile">
        <button onClick={() => router.push("/")} style={styles.back}>← Back to Home</button>
        <div style={styles.content}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "80px 20px 40px 20px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  wrapper: {
    backgroundColor: "#f0f4f8",
    borderRadius: "16px",
    padding: "24px",
    width: "100%",
    maxWidth: "728px",
    boxSizing: "border-box",
    marginBottom: "16px",
    boxShadow: "0 0 40px 10px rgba(0, 0, 0, 0.4)",
  },
  back: {
    display: "inline-block",
    marginBottom: "16px",
    padding: "8px 16px",
    backgroundColor: "#0a2463",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Segoe UI', sans-serif",
  },
  content: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "36px",
    boxShadow: "0 2px 16px rgba(10, 36, 99, 0.08)",
    color: "#1a1a2e",
    lineHeight: "1.7",
    fontSize: "15px",
  },
};

export default RefundPolicy;

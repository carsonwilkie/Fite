import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";

const content = `# Privacy Policy

**Last updated: April 2026**

## 1. Introduction

Fite Finance ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use fitefinance.com ("the Service").

By using the Service, you agree to the collection and use of information as described in this policy.

## 2. Information We Collect

### Information You Provide
- **Account information**: Your name and email address when you sign up via Clerk
- **Payment information**: Billing details when you subscribe to Premium. Payment data is processed and stored by Stripe — we do not store your full payment card details
- **User-generated content**: Questions you practice, answers you submit, and AI feedback received

### Information Collected Automatically
- **Usage data**: Pages visited, features used, questions requested, and interactions with the Service
- **Device and browser information**: Browser type, operating system, and IP address
- **Analytics data**: Collected via Vercel Analytics to understand how users interact with the Service

### Information from Third Parties
- **Authentication data**: When you sign in with Google via Clerk, we receive your name and email address
- **Payment status**: Stripe provides us with your subscription status and billing history

## 3. How We Use Your Information

We use the information we collect to:
- Provide and operate the Service
- Process payments and manage subscriptions
- Store and display your question history (Premium users)
- Send transactional emails (e.g., payment receipts, account notifications)
- Improve and optimize the Service
- Enforce our Terms of Service
- Comply with legal obligations

## 4. How We Share Your Information

We do not sell your personal information. We share your information only in the following circumstances:

### Service Providers
We share data with third-party providers who help us operate the Service:
- **Clerk** — manages authentication and user accounts
- **Stripe** — processes payments and manages subscriptions
- **OpenAI** — processes your questions and answers to generate AI responses. Note: content you submit may be used by OpenAI in accordance with their usage policies
- **Vercel** — hosts the Service and collects analytics
- **Upstash** — stores your question history

### Legal Requirements
We may disclose your information if required by law, court order, or government authority, or if we believe disclosure is necessary to protect our rights or the safety of others.

### Business Transfers
If Fite Finance is acquired or merged with another company, your information may be transferred as part of that transaction.

## 5. Data Retention

We retain your account and usage data for as long as your account is active. Question history is stored in our database and retained until you delete your account or request deletion. Payment records are retained as required by law and Stripe's data retention policies.

## 6. Your Rights

Depending on your location, you may have the following rights regarding your personal data:

- **Access**: Request a copy of the data we hold about you
- **Correction**: Request correction of inaccurate data
- **Deletion**: Request deletion of your account and associated data
- **Portability**: Request your data in a portable format
- **Opt-out**: Opt out of non-essential data collection

To exercise any of these rights, contact us at support@fitefinance.com.

### California Residents (CCPA)
If you are a California resident, you have the right to know what personal information we collect, the right to delete your personal information, and the right to opt out of the sale of your personal information. We do not sell personal information.

### European Residents (GDPR)
If you are located in the European Economic Area, you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, and data portability. Our legal basis for processing your data is contractual necessity (to provide the Service) and legitimate interests.

## 7. Cookies and Tracking

We use cookies and similar technologies to:
- Keep you logged in to your account
- Remember your preferences
- Analyze usage patterns via Vercel Analytics

You can control cookies through your browser settings. Disabling cookies may affect your ability to use certain features of the Service.

## 8. Data Security

We implement reasonable technical and organizational measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.

## 9. Children's Privacy

The Service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child under 18 has provided us with personal information, we will delete it promptly.

## 10. Third-Party Links

The Service may contain links to third-party websites. We are not responsible for the privacy practices of those websites and encourage you to review their privacy policies.

## 11. OpenAI and Your Content

When you submit questions or answers for grading, that content is sent to OpenAI's API for processing. Please be aware that OpenAI has its own privacy policy and data usage terms. We recommend not including any sensitive personal information in your practice answers.

## 12. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify users of material changes by updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.

## 13. Contact

For privacy-related questions or to exercise your rights, contact us at:
support@fitefinance.com`;

function PrivacyPolicy() {
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

export default PrivacyPolicy;

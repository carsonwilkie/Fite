import SubmissionPage from "../src/SubmissionPage";

export default function FeedbackPageRoute() {
  return (
    <SubmissionPage
      type="feedback"
      title="Submit Feedback · Fite Finance"
      metaDescription="Share your thoughts on Fite Finance. Your feedback shapes what we build next."
      eyebrow="Submit feedback"
      heading="Tell us what's on your mind"
      subheading="Good, bad, or in between — we read every message. Your note goes straight to the Fite Finance team."
      icon="forum"
      placeholder="What's working, what's broken, or what could be better? The more detail, the better."
      submitLabel="Send feedback"
      successHeading="Thanks — we got it"
      successBody="Your feedback is in our inbox. If we have a follow-up question, we'll reply to the email on your account."
    />
  );
}

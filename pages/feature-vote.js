import SubmissionPage from "../src/SubmissionPage";

const ROADMAP = [
  { icon: "auto_graph", title: "Adaptive difficulty", description: "Questions that automatically adjust based on your recent scores and weak areas." },
  { icon: "videocam", title: "Live mock interviews", description: "Real-time video practice with an AI interviewer that reacts to your delivery." },
  { icon: "insights", title: "Deep analytics", description: "Per-category trend lines, time-to-answer metrics, and peer benchmarks." },
  { icon: "school", title: "Guided study plans", description: "Structured multi-week tracks for IB, PE, AM, and consulting prep." },
  { icon: "calculate", title: "Modeling practice", description: "Step-by-step LBO, DCF, and M&A modeling drills with auto-graded outputs." },
  { icon: "group", title: "Peer leaderboards", description: "Opt-in anonymous ranking against other Premium users by category." },
];

export default function FeatureVotePageRoute() {
  return (
    <SubmissionPage
      type="vote"
      title="Feature Vote · Fite Finance"
      metaDescription="Vote on what ships next in Fite Finance. Premium users only."
      eyebrow="Feature vote"
      heading="Help pick what ships next"
      subheading="Pitch a new idea or back one on the list below. Premium votes shape our roadmap directly."
      icon="how_to_vote"
      placeholder="Which feature do you want most? Tell us why it would change how you prep."
      submitLabel="Submit vote"
      successHeading="Vote recorded"
      successBody="Thanks for steering the roadmap. We review every vote when planning the next release."
      roadmap={ROADMAP}
      paidOnly
    />
  );
}

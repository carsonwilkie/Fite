import SubmissionPage from "../src/SubmissionPage";

const ROADMAP = [
  { icon: "hub", title: "Massively Expanded Library", description: "Firm-specific tracks (GS, MS, JPM, Evercore, PJT), product specificity (M&A, LevFin, DCM, ECM), and edge-case technicals." },
  { icon: "shuffle", title: "Greater Question Diversity", description: "Broaden question diversity range to cover more nuances that are currently being missed. Make question language less repetitive." },
  { icon: "bookmark", title: "Bookmark & Favorite", description: "Star questions you want to revisit. Build your own personal drill deck." },
  { icon: "videocam", title: "Walk-Me-Through Mode", description: "Break any question into guided micro-steps. Learn the reasoning path, not just the answer." },
  { icon: "auto_graph", title: "Adaptive Difficulty", description: "Questions that automatically adjust based on your recent scores and weak areas." },
  { icon: "restart_alt", title: "Retake Questions", description: "Re-attempt past questions with a clean slate. Question is rewritten to match previous." },
  { icon: "verified", title: "Next-Gen Grading", description: "Just better, more specific and informative grading. Multi-axis rubric: structure, logic, accuracy, polish — with line-by-line critique." },
  { icon: "insights", title: "Deeper Analytics", description: "Per-category trend lines, time-to-answer metrics, and specific area statistics." },
  { icon: "calculate", title: "Modeling Practice", description: "Step-by-step LBO, DCF, and M&A modeling drills with auto-graded outputs." },
  { icon: "style", title: "Concept Flashcards", description: "Quick-hit flashcards for the core 400 technicals — spaced repetition built in." },
  { icon: "group", title: "Peer Leaderboards", description: "Opt-in anonymous ranking against other Premium users by category." },
  { icon: "school", title: "Voice Interview Mode", description: "Speak your answer out loud. AI transcribes, evaluates delivery, pacing, and filler words." },
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

import SubmissionPage from "../src/SubmissionPage";

const ROADMAP_GROUPS = [
  {
    label: "Content & breadth",
    accent: "#4FC3F7",
    items: [
      { icon: "hub", title: "Massively Expanded Library", description: "Firm-specific tracks (GS, MS, JPM, Evercore, PJT), product specificity (M&A, LevFin, DCM, ECM), and edge-case technicals." },
      { icon: "shuffle", title: "Greater Question Diversity", description: "Broaden the question range to cover nuances we currently miss and make wording far less repetitive." },
      { icon: "style", title: "Concept Flashcards", description: "Quick-hit flashcards for the core 400 technicals — spaced repetition built in." },
    ],
  },
  {
    label: "Practice modes",
    accent: "#1565C0",
    items: [
      { icon: "videocam", title: "Walk-Me-Through Mode", description: "Break any question into guided micro-steps. Learn the reasoning path, not just the answer." },
      { icon: "restart_alt", title: "Retake Questions", description: "Re-attempt past questions with a clean slate — questions are rewritten to match the original." },
      { icon: "calculate", title: "Modeling Practice", description: "Step-by-step LBO, DCF, and M&A modeling drills with auto-graded outputs." },
      { icon: "school", title: "Voice Interview Mode", description: "Speak your answer out loud. AI transcribes, evaluates delivery, pacing, and filler words." },
    ],
  },
  {
    label: "Grading & analytics",
    accent: "#c9a84c",
    items: [
      { icon: "verified", title: "Next-Gen Grading", description: "Multi-axis rubric — structure, logic, accuracy, polish — with line-by-line critique." },
      { icon: "insights", title: "Deeper Analytics", description: "Per-category trend lines, time-to-answer metrics, and focused area statistics." },
      { icon: "auto_graph", title: "Adaptive Difficulty", description: "Questions automatically adjust based on your recent scores and weakest areas." },
    ],
  },
  {
    label: "Personal & social",
    accent: "#22c55e",
    items: [
      { icon: "bookmark", title: "Bookmark & Favorite", description: "Star questions you want to revisit. Build your own personal drill deck." },
      { icon: "group", title: "Peer Leaderboards", description: "Opt-in anonymous ranking against other Premium users by category." },
    ],
  },
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
      roadmapGroups={ROADMAP_GROUPS}
      paidOnly
    />
  );
}

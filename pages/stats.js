import Head from "next/head";
import StatsPage from "../src/StatsPage";

export default function StatsPageRoute() {
  return (
    <>
      <Head>
        <title>Stats · Fite Finance</title>
        <meta name="description" content="Track your progress — average scores, streaks, category breakdowns, and score trends over time." />
      </Head>
      <StatsPage />
    </>
  );
}

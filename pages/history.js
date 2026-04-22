import Head from "next/head";
import HistoryDark from "../src/HistoryDark";

export default function HistoryPage() {
  return (
    <>
      <Head>
        <title>History · Fite Finance</title>
        <meta name="description" content="Review your past practice sessions, graded answers, and mock interviews." />
      </Head>
      <HistoryDark />
    </>
  );
}

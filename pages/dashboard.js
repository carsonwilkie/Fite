import Head from "next/head";
import Dashboard from "../src/Dashboard";

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard · Fite Finance</title>
        <meta name="description" content="Practice finance interview questions, get AI grading, and run mock interviews — all in one place." />
      </Head>
      <Dashboard />
    </>
  );
}

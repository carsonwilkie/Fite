import Head from "next/head";
import RefundPolicy from "../src/RefundPolicy";

export default function RefundsPage() {
  return (
    <>
      <Head>
        <title>Refund Policy · Fite Finance</title>
        <meta name="description" content="Read the Fite Finance refund policy for Premium subscriptions." />
      </Head>
      <RefundPolicy />
    </>
  );
}

import Head from "next/head";
import Success from "../src/Success";

export default function SuccessPage() {
  return (
    <>
      <Head>
        <title>Welcome to Premium · Fite Finance</title>
        <meta name="description" content="You're now a Fite Finance Premium member. Unlimited questions, AI grading, mock interviews, and more." />
      </Head>
      <Success />
    </>
  );
}

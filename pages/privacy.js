import Head from "next/head";
import PrivacyPolicy from "../src/PrivacyPolicy";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy · Fite Finance</title>
        <meta name="description" content="Read the Fite Finance privacy policy to learn how we collect and use your data." />
      </Head>
      <PrivacyPolicy />
    </>
  );
}

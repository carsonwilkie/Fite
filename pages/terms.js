import Head from "next/head";
import TermsOfService from "../src/TermsOfService";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service · Fite Finance</title>
        <meta name="description" content="Read the Fite Finance terms of service before using the platform." />
      </Head>
      <TermsOfService />
    </>
  );
}

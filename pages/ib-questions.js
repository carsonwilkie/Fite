import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import IBQuestions from "../src/IBQuestionsPage";

export default function IBQuestionsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/ib-questions");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <>
      <Head>
        <title>IB 400 · Fite Finance</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {isLoaded && isSignedIn ? <IBQuestions /> : null}
    </>
  );
}

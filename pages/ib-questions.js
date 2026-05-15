import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { Redis } from "@upstash/redis";
import IBQuestions from "../src/IBQuestionsPage";

export async function getServerSideProps(ctx) {
  const { userId } = getAuth(ctx.req);
  if (!userId) {
    return { redirect: { destination: "/sign-in?redirect_url=/ib-questions", permanent: false } };
  }
  const redis = Redis.fromEnv();
  const isPaid = await redis.get(`paid:${userId}`);
  if (!isPaid) {
    return { redirect: { destination: "/", permanent: false } };
  }
  const { IB_QUESTIONS } = require("./api/_ibQuestions");
  return { props: { questions: IB_QUESTIONS } };
}

export default function IBQuestionsPage({ questions }) {
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
      {isLoaded && isSignedIn ? <IBQuestions initialQuestions={questions} /> : null}
    </>
  );
}

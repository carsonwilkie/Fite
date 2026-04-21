import Head from "next/head";
import AccountPanel from "../src/auth/AccountPanel";

export default function AccountPage() {
  return (
    <>
      <Head>
        <title>Account · Fite Finance</title>
        <meta name="description" content="Manage your Fite Finance account: profile, security, active sessions, and account deletion." />
        <meta name="robots" content="noindex" />
      </Head>
      <AccountPanel />
    </>
  );
}

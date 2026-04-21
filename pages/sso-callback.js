import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import Head from "next/head";
import { motion } from "motion/react";

export default function SSOCallback() {
  return (
    <>
      <Head>
        <title>Signing in · Fite Finance</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{
        minHeight: "100vh",
        background: "#020817",
        color: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 18,
        fontFamily: "Inter, sans-serif",
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "2px solid rgba(79,195,247,0.18)",
            borderTopColor: "#4FC3F7",
            boxShadow: "0 0 24px rgba(79,195,247,0.35)",
          }}
        />
        <div style={{
          fontSize: 12,
          fontFamily: "Manrope, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#94a3b8",
        }}>
          Finalizing sign-in…
        </div>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        />
      </div>
    </>
  );
}

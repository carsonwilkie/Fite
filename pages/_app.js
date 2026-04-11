import { ClerkProvider } from "@clerk/clerk-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PaidStatusProvider } from "../src/PaidStatusContext";
import Navbar from "../src/Navbar";
import ScrollToTop from "../src/ScrollToTop";
import "../src/index.css";
import "../src/App.css";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function App({ Component, pageProps }) {
  if (!PUBLISHABLE_KEY) {
    return <Component {...pageProps} />;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} {...pageProps}>
      <PaidStatusProvider>
        <Analytics />
        <SpeedInsights />
        <ScrollToTop />
        <Navbar />
        <Component {...pageProps} />
      </PaidStatusProvider>
    </ClerkProvider>
  );
}

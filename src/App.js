import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Questions from "./Questions";
import Success from "./Success";
import Navbar from "./Navbar";
import ScrollToTop from "./ScrollToTop";
import History from "./History";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import RefundPolicy from "./RefundPolicy";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { PaidStatusProvider } from "./PaidStatusContext";

function App() {
  return (
    <BrowserRouter>
      <PaidStatusProvider>
<Analytics />
      <SpeedInsights />
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions/:category/:difficulty/:math/:customPrompt" element={<Questions />} />
        <Route path="/questions/:category/:difficulty/:math" element={<Questions />} />
        <Route path="/success" element={<Success />} />
        <Route path="/history" element={<History />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/refunds" element={<RefundPolicy />} />
      </Routes>
      </PaidStatusProvider>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Questions from "./Questions";
import Success from "./Success";
import Navbar from "./Navbar";
import ScrollToTop from "./ScrollToTop";
import History from "./History";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions/:category/:difficulty/:math/:customPrompt" element={<Questions />} />
        <Route path="/questions/:category/:difficulty/:math" element={<Questions />} />
        <Route path="/success" element={<Success />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Questions from "./Questions";
import Success from "./Success";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions/:category/:difficulty/:math" element={<Questions />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
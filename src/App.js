import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Questions from "./Questions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions/:category" element={<Questions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
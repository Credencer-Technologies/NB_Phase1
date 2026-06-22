import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Footer from "./Components/Footer";
import Home from "./Pages/Home";
import Explore from "./Pages/Explore";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
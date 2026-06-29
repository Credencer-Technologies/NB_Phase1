import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";

import Home from "./Pages/Home";
import Explore from "./Pages/Explore";
import UserDashboard from "./Pages/UserDashboard";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Explore from "./Pages/Explore";
import About from "./Components/About";
import Contact from "./Components/Contact";
import Register from "./Pages/Register";
import PageIntro from "./Components/PageIntro";
import ProviderProfile from "./Pages/ProviderProfile";

import UserDashboard from "./Pages/UserDashboard";

import ProviderDashboard from "./Pages/ProviderDashboard";
function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register";       

  return (
    <>
      <PageIntro />

      {!hideLayout && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/about" element={<About />} />
        
        <Route path="/provider/:id" element={<ProviderProfile />} />
  
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
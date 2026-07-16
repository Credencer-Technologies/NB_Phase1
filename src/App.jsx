import { useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ScrollToTop from "./Components/ScrollToTop";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Explore from "./Pages/Explore";

import About from "./Components/About";
import Contact from "./Components/Contact";

import PageIntro from "./Components/PageIntro";

import ProviderProfile from "./Pages/ProviderProfile";
import ProviderDashboard from "./Pages/ProviderDashboard";
import UserDashboard from "./Pages/UserDashboard";

import ChatBot from "./ChatBot/ChatBot";


function App() {

  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register";


  return (
    <>
      <ScrollToTop />
      <PageIntro />

      {!hideLayout && <Header />}


      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        <Route path="/explore" element={<Explore />} />

        <Route path="/provider-profile/:id" element={<ProviderProfile />} />


        <Route 
          path="/provider-dashboard" 
          element={<ProviderDashboard />} 
        />


        <Route 
          path="/user-dashboard" 
          element={<UserDashboard />} 
        />


        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />


      </Routes>


      {!hideLayout && <Footer />}

      {!hideLayout && <ChatBot />}

    </>
  );
}


export default App;
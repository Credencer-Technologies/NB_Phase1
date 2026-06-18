import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Components/Header";
import Footer from "./Components/Footer";


import Register from "./Pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
       
        <Route path="/register" element={<Register />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Layout = ({ children }) => {
  const location = useLocation();

  // pages where header/footer should NOT show
  const hideLayoutRoutes = ["/login", "/register"];

  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}

      {children}

      {!hideLayout && <Footer />}
    </>
  );
};

export default Layout;
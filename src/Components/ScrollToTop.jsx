import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // change to "auto" if you don't want animation
    });
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
import { useEffect, useState } from "react";
import "./PageIntro.css";

const PageIntro = () => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (hide) return null;

  return (
    <div className="intro-overlay">
      <div className="intro-content">

        <div className="logo-text">
          <span className="nari">Nari</span>
          <span className="bazar">Bazar</span>
        </div>

        <div className="loading-bar">
          <div className="bar"></div>
        </div>

      </div>
    </div>
  );
};

export default PageIntro;
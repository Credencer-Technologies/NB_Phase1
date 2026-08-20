import "./Hero.css";
import { useMagnetic } from "../hooks/useMagnetic";
import ScrollRevealText from "../Components/ScrollRevealText";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const primary = useMagnetic();
  const secondary = useMagnetic();
  const navigate = useNavigate();

  return (
    <section className="hero">
      {/* BACKGROUND VIDEO */}
      <video autoPlay muted loop playsInline className="hero-video">
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="overlay"></div>

      {/* HERO CONTENT */}
      <div className="hero-content">

        <span className="hero-tagline">
          ✨ Curated • Trusted • Premium
        </span>

        <h1 className="hero-title">
          <ScrollRevealText text="Find Exceptional Local Professionals" />
        </h1>

        <p className="hero-description">
          Connect with trusted beauty, wellness, fashion, and lifestyle experts who transform everyday moments into extraordinary experiences.
        </p>

        <div className="hero-actions">
          <button
            ref={primary.ref}
            onMouseMove={primary.handleMove}
            onMouseLeave={primary.handleLeave}
            className="btn-glass primary"
            onClick={() => navigate("/explore")}
          >
            Explore Services
          </button>

          <button
            ref={secondary.ref}
            onMouseMove={secondary.handleMove}
            onMouseLeave={secondary.handleLeave}
            className="btn-glass secondary"
            onClick={() => navigate("/register?role=provider")}
          >
            Join as a Provider
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;
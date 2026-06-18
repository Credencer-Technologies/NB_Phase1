import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-left">
        <h1>
          Find Trusted Women Service Providers Near You
        </h1>

        <p>
          Discover verified women entrepreneurs and skilled professionals
          across beauty, fashion, catering, education, fitness, and more.
        </p>

        <div className="hero-search">
          <input
            type="text"
            placeholder="Search Service"
          />

          <input
            type="text"
            placeholder="Enter City"
          />

          <button>Search</button>
        </div>

        <div className="hero-buttons">
          <button className="explore-btn">
            Explore Services
          </button>

          <button className="provider-btn">
            Become a Provider
          </button>
        </div>
      </div>

      <div className="hero-right">
        <img
          src="/images/hero-banner.png"
          alt="Women entrepreneurs"
        />
      </div>
    </section>
  );
};

export default Hero;
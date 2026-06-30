import "./WhyChoose.css";

const WhyChoose = () => {
  return (
    <section className="why-section">
      <h2 className="why-title">
        Why Choose NariBazar?
      </h2>

      <p className="why-subtitle">
        Connecting customers with trusted women-led businesses through
        a premium discovery experience.
      </p>

      <div className="why-grid">
        <div className="why-card">
          <div className="why-icon">🛡️</div>
          <h3>Verified Providers</h3>
          <p>
            Every provider undergoes profile verification before
            appearing on the platform.
          </p>
        </div>

        <div className="why-card">
          <div className="why-icon">⭐</div>
          <h3>Trusted Reviews</h3>
          <p>
            Genuine ratings and customer feedback help you make
            confident decisions.
          </p>
        </div>

        <div className="why-card">
          <div className="why-icon">📍</div>
          <h3>Local Discovery</h3>
          <p>
            Discover talented women entrepreneurs and services
            near your location.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
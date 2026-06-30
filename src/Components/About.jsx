import "./About.css";

const About = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-container">

        {/* Left Content */}
        <div className="about-content">

          <h2 className="about-title">
            About <span>NariBazar</span>
          </h2>

          <h3 className="about-heading">
            Empowering Women Through Digital Opportunities
          </h3>

          <p>
            <strong>NariBazar</strong> is a women-focused digital marketplace
            dedicated to empowering women entrepreneurs, skilled professionals,
            and service providers across India by connecting them with customers
            through a trusted online platform.
          </p>

          <p>
            From beauty & wellness, Mehndi & bridal, tailoring & fashion,
            catering, education, yoga & fitness, home services, and arts &
            crafts, NariBazar enables women to showcase their expertise and
            expand their businesses digitally.
          </p>

          <p>
            Our vision is to build a secure, transparent, and inclusive
            ecosystem where every woman has the opportunity to become
            financially independent and reach customers across the country.
          </p>

          <div className="about-highlight">
            Together, we're building India's largest women-powered marketplace.
          </div>

        </div>

        {/* Right Cards */}

        <div className="about-cards">

          <div className="card">
            <h3>Empowerment</h3>
            <p>
              Helping women entrepreneurs transform their skills into
              successful businesses.
            </p>
          </div>

          <div className="card">
            <h3>Trust & Safety</h3>
            <p>
              A verified, secure, and reliable platform connecting customers
              with trusted women professionals.
            </p>
          </div>

          <div className="card">
            <h3>Growth</h3>
            <p>
              Expanding business visibility, increasing customer reach, and
              supporting long-term success.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default About;
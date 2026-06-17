import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-top">

        <div className="footer-brand">
          <h2>NaariBazar</h2>

          <p>
            Empowering Women.
            Connecting Services.
            Across India.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="/explore">Explore</a>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
        </div>

        <div className="footer-links">
          <h3>Categories</h3>

          <a href="/">Beauty</a>
          <a href="/">Mehndi</a>
          <a href="/">Tailoring</a>
          <a href="/">Tutoring</a>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 NaariBazar. All Rights Reserved.
      </div>

    </footer>
  );
};

export default Footer;
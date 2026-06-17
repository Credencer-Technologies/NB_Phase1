import "./Footer.css";

import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">

        <div className="footer-brand">
          <h2>NaariBazar</h2>

          <p>
            Empowering Women. Connecting Services.
            Across India.
          </p>

          <div className="social-icons">
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>

            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>

            <a href="#" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>

            <a href="#" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>

            <a
              href="mailto:support@naaribazar.com"
              aria-label="Email"
            >
              <FaEnvelope />
            </a>
          </div>
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

          <a href="/">Beauty & Wellness</a>
          <a href="/">Mehandi & Bridal</a>
          <a href="/">Tailoring & Fashion</a>
          <a href="/">Food & Catering</a>
          <a href="/">Education & Tutoring</a>
          <a href="/">Yoga & Fitness</a>
          <a href="/">Home Services</a>
          <a href="/">Arts & Crafts</a>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 NaariBazar. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
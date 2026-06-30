import "./Footer.css";
import logo from "../assets/Logo.jpeg";
import { Link } from "react-router-dom";

import {
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { MdEmail } from "react-icons/md";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ================= BRAND ================= */}

        <div className="footer-brand">

          <div className="footer-logo">
            <img src={logo} alt="NariBazar Logo" />

            <div className="footer-logo-content">
              <h2 className="footer-logo-text">
                <span className="nari">Nari</span>
                <span className="bazar">Bazar</span>
              </h2>

              <p className="footer-tagline">
                Empowering Women Entrepreneurs
              </p>
            </div>
          </div>

          <p className="footer-description">
            NariBazar is a trusted women-centric marketplace connecting skilled
            women entrepreneurs and professionals with customers across India.
            Discover services, grow businesses, and empower communities through
            one digital platform.
          </p>

        </div>

        {/* ================= QUICK LINKS ================= */}

        <div className="footer-column">

          <h3>Quick Links</h3>

          <Link to="/">Home</Link>

          <Link to="/explore">Explore</Link>

          <Link to="/about">About</Link>

          <Link to="/contact">Contact</Link>

        </div>

        {/* ================= BROWSE CATEGORIES ================= */}

        <div className="footer-column">

          <h3>Browse Categories</h3>

          <Link to="/explore?category=beauty-wellness">
            Beauty & Wellness
          </Link>

          <Link to="/explore?category=mehndi-bridal">
            Mehndi & Bridal
          </Link>

          <Link to="/explore?category=tailoring-fashion">
            Tailoring & Fashion
          </Link>

          <Link to="/explore?category=food-catering">
            Food & Catering
          </Link>

          <Link to="/explore?category=education">
            Education & Tutoring
          </Link>

          <Link to="/explore?category=yoga-fitness">
            Yoga & Fitness
          </Link>

          <Link to="/explore?category=home-services">
            Home Services
          </Link>

          <Link to="/explore?category=arts-crafts">
            Arts & Crafts
          </Link>

        </div>

        {/* ================= CONTACT ================= */}

        <div className="footer-column">

          <h3>Contact</h3>

          <div className="footer-contact">

            <div className="contact-row">
              <FaPhoneAlt />
              <span>+91 9490594867</span>
            </div>

            <div className="contact-row">
              <MdEmail />
              <span>info@naribazar.in</span>
            </div>

            <div className="contact-row">
              <FaMapMarkerAlt />
              <span>
                Gachibowli,
                <br />
                Hyderabad,
                Telangana
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ================= DIVIDER ================= */}

      <div className="footer-divider"></div>

      {/* ================= BOTTOM ================= */}

      <div className="footer-bottom">

        <p>
          © 2026 Nari Bazar. All rights reserved. Developed by{" "}
          <a
            href="https://credencer.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="developer-link"
          >
            Credencer Technologies
          </a>
        </p>

        <div className="footer-socials">

          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaMapMarkerAlt />
          </a>

          <a href="tel:+919490594867">
            <FaPhoneAlt />
          </a>

          <a href="mailto:info@naribazar.in">
            <MdEmail />
          </a>

          <a
            href="https://wa.me/919490594867"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedinIn />
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
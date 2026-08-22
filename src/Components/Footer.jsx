import "./Footer.css";
import logo from "../assets/Logo.jpeg";
import { Link } from "react-router-dom";

import {

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
                Empowering Women Entrepreneurs.              
              </p>
              <p className="footer-subtagline">
                Discover • Connect • Thrive
              </p>
            </div>
          </div>
          <p className="footer-description">
  NariBazar connects skilled women entrepreneurs with customers across
  India, helping them showcase their services, grow their businesses,
  and build a brighter future.
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

          <Link to="/explore?category=hospitality">
            Hospitality
          </Link>

          <Link to="/explore?category=others">
            Others
          </Link>

        </div>

        {/* ================= CONTACT ================= */}

        <div className="footer-column">
          <h3>Contact</h3>

          <div className="footer-contact">

            {/* Phone */}
            <div className="contact-row">
              <FaPhoneAlt />
              <a href="tel:+919490594867" className="contact-link">
                +91 9490594867
              </a>
            </div>

            {/* Email */}
            <div className="contact-row">
              <MdEmail />
              <a href="mailto:info@naribazar.in" className="contact-link">
                info@naribazar.in
              </a>
            </div>

            {/* Location */}
            <div className="contact-row">
              <FaMapMarkerAlt />
              <a
                href="https://www.google.com/maps/place/Credencer+Technologies/@17.4366455,78.3642267,17z/data=!3m2!4b1!5s0x3bcb93ca67b0a531:0x5e9995f09d025bda!4m6!3m5!1s0x3bcb97c1def849f9:0xc19cbff77a08d69b!8m2!3d17.4366404!4d78.3668016!16s%2Fg%2F11flf5lpzz?entry=ttu&g_ep=EgoyMDI2MDcxMy4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                Gachibowli,
                <br />
                Hyderabad,
                Telangana
              </a>
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
            href="https://www.google.com/maps/place/Credencer+Technologies/@17.4366455,78.3642267,17z/data=!3m2!4b1!5s0x3bcb93ca67b0a531:0x5e9995f09d025bda!4m6!3m5!1s0x3bcb97c1def849f9:0xc19cbff77a08d69b!8m2!3d17.4366404!4d78.3668016!16s%2Fg%2F11flf5lpzz?entry=ttu&g_ep=EgoyMDI2MDcxMy4wIKXMDSoASAFQAw%3D%3D"
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
        </div>

      </div>

    </footer>
  );
}
export default Footer;
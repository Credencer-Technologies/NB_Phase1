import "./Footer.css";
import logo from "../assets/Logo.jpeg";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiMinus } from "react-icons/fi";

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

  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const faqs = [
  {
    question: "What is Nari Bazar?",
    answer:
      "Nari Bazar is a trusted digital marketplace connecting customers with verified women entrepreneurs offering services across multiple categories.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "You can browse providers without registering. However, you'll need an account to save favourites, send enquiries, and manage bookings.",
  },
  {
    question: "Are all service providers verified?",
    answer:
      "Yes. Every service provider is verified before being listed on the platform.",
  },
  {
    question: "How do I contact a service provider?",
    answer:
      "Visit the provider's profile and click the enquiry button to connect directly.",
  },
  {
    question: "How can I become a service provider?",
    answer:
      "Register as a service provider, complete your profile, upload the required documents, and submit them for verification.",
  },

  {
    question: "Is Nari Bazar free to use?",
    answer:
      "Yes. Customers can browse and explore services without any registration fee.",
  },
  {
    question: "Can I update my profile later?",
    answer:
      "Yes. You can edit your profile details anytime after logging into your account.",
  },
  {
    question: "How do I search for services?",
    answer:
      "Use the search bar or browse categories to quickly find the services you need.",
  },
  {
    question: "Can I save my favourite service providers?",
    answer:
      "Yes. Logged-in users can bookmark providers and access them later from their profile.",
  },
  {
    question: "How long does verification take?",
    answer:
      "Verification usually takes 24–48 working hours after all required documents are submitted.",
  },
  {
    question: "Can I contact multiple providers?",
    answer:
      "Yes. You may send enquiries to multiple verified providers before making a decision.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Click the 'Forgot Password' option on the login page and follow the instructions sent to your email.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Yes. You can request account deletion through your profile settings or by contacting support.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes. Your information is protected using secure authentication and privacy measures.",
  },
  {
    question: "Can service providers edit their listings?",
    answer:
      "Yes. Providers can update their services, pricing, and availability anytime.",
  },
  {
    question: "How will I know if my enquiry is received?",
    answer:
      "You will receive a confirmation once your enquiry has been successfully submitted.",
  },
  {
    question: "Can I report inappropriate content?",
    answer:
      "Yes. Users can report suspicious or inappropriate listings through the report option.",
  },
  {
    question: "What categories are available on Nari Bazar?",
    answer:
      "The platform offers services across beauty, tailoring, food, education, home services, and many more.",
  },
  {
    question: "Does Nari Bazar provide customer support?",
    answer:
      "Yes. Our support team is available to assist users with platform-related queries.",
  },
  {
    question: "Can I access Nari Bazar on mobile devices?",
    answer:
      "Yes. Nari Bazar is fully responsive and works smoothly on desktops, tablets, and mobile devices.",
  },
];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <footer className="footer">
      {/* ================= FAQ SECTION ================= */}

<section className="footer-faq">

  <div className="faq-container">

    <h2>Frequently Asked Questions</h2>

    <p className="faq-subtitle">
      Everything you need to know about using Nari Bazar.
    </p>

    {(showAll ? faqs : faqs.slice(0, 5)).map((faq, index) => (
      <div
        key={index}
        className={`faq-item ${openIndex === index ? "active" : ""}`}
      >
        <button
          className="faq-question"
          onClick={() => toggleFAQ(index)}
        >
          <span>{faq.question}</span>

          {openIndex === index ? <FiMinus /> : <FiPlus />}
        </button>

        <div
          className={`faq-answer ${
            openIndex === index ? "show" : ""
          }`}
        >
          <p>{faq.answer}</p>
        </div>
      </div>
    ))}

    <div className="view-all-container">
  <div className="view-all-container">
  <button
    className="view-all-faqs"
    onClick={() => setShowAll(!showAll)}
  >
    {showAll ? "Show Less FAQs" : "View All FAQs"}
  </button>
</div>
</div>

  </div>

</section>

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
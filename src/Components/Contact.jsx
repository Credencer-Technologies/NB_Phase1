import { useState } from "react";
import "./Contact.css";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMessage = `*New Contact Request - NariBazar*

👤 Name: ${form.name}

📧 Email: ${form.email}

💬 Message:
${form.message}`;

    const phoneNumber = "919490594867";

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`,
      "_blank"
    );

    setForm({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      <h1 className="contact-title">Contact Us</h1>

      <p className="contact-subtitle">
        We'd love to hear from you. Reach out to us anytime.
      </p>

      <div className="contact-container">

        {/* Contact Info */}

        <div className="contact-card">

          <h2>Get in Touch</h2>

          <div className="contact-item">
            <FaEnvelope />
            <div>
              <p>Support Email</p>
              <span>support@naribazar.in</span>
            </div>
          </div>

          <div className="contact-item">
            <FaEnvelope />
            <div>
              <p>Info Email</p>
              <span>info@naribazar.in</span>
            </div>
          </div>

          <div className="contact-item">
            <FaPhoneAlt />
            <div>
              <p>Phone</p>
              <span>+91 9490594867</span>
            </div>
          </div>

          <div className="contact-item">
            <FaMapMarkerAlt />
            <div>
              <p>Address</p>
              <span>
                8th Floor, Vaishnavi's Cynosure,
                <br />
                Gachibowli Road,
                <br />
                Hyderabad, Telangana – 500032
              </span>
            </div>
          </div>

          <div className="social-icons-section">
            <h3>Connect With Us</h3>

            <div className="social-icons">

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="icon"
              >
                <FaMapMarkerAlt />
              </a>

              <a
                href="mailto:support@naribazar.in"
                className="icon"
              >
                <FaEnvelope />
              </a>

              <a
                href="https://wa.me/919490594867"
                target="_blank"
                rel="noreferrer"
                className="icon whatsapp"
              >
                <FaWhatsapp />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="icon instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="icon facebook"
              >
                <FaFacebookF />
              </a>

            </div>
          </div>

        </div>

        {/* Contact Form */}

        <div className="contact-form">

          <h2>Send a Message</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit">
              Send via WhatsApp
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default Contact;
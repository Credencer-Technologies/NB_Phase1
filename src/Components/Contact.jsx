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
                href="https://www.google.com/maps/place/Credencer+Technologies/@17.4366455,78.3642267,17z/data=!3m2!4b1!5s0x3bcb93ca67b0a531:0x5e9995f09d025bda!4m6!3m5!1s0x3bcb97c1def849f9:0xc19cbff77a08d69b!8m2!3d17.4366404!4d78.3668016!16s%2Fg%2F11flf5lpzz?entry=ttu&g_ep=EgoyMDI2MDcxMy4wIKXMDSoASAFQAw%3D%3D"
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
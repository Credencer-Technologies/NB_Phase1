import "./About.css";
import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

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

const About = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
                className={`faq-answer ${openIndex === index ? "show" : ""
                  }`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}

          <div className="view-all-container">

            <button
              className="view-all-faqs"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less FAQs" : "View All FAQs"}
            </button>
          </div>

        </div>

      </section>

    </section>
  );
};

export default About;
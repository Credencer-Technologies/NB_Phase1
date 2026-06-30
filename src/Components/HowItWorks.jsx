import { useState } from "react";
import "./HowItWorks.css";

const steps = [
  {
    id: "01",
    title: "Discover",
    desc: "Explore curated, verified service providers across categories tailored to your needs.",
  },
  {
    id: "02",
    title: "Compare",
    desc: "Check ratings, reviews, portfolios, and trust scores to make confident decisions.",
  },
  {
    id: "03",
    title: "Connect",
    desc: "Send requests or chat directly with selected providers instantly.",
  },
  {
    id: "04",
    title: "Experience",
    desc: "Enjoy seamless, premium service delivery with reliability and trust.",
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(null);

  const toggle = (id) => {
    setActive(active === id ? null : id);
  };

  return (
    <section className="how-wrapper">
      <div className="how-header">
        <h2>How It Works</h2>
        <p>Simple steps to find trusted providers</p>
      </div>

      <div className="how-grid">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`how-card ${active === step.id ? "active" : ""}`}
            onClick={() => toggle(step.id)}
          >
            <div className="card-top">
              <span className="step-id">{step.id}</span>
              <h3>{step.title}</h3>
              <span className="toggle-icon">
                {active === step.id ? "−" : "+"}
              </span>
            </div>

            <div
              className={`desc ${active === step.id ? "open" : ""}`}
            >
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
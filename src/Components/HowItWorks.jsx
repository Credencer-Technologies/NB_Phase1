import { useEffect, useState } from "react";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore curated, verified service providers across categories tailored to your needs.",
  },
  {
    number: "02",
    title: "Compare",
    description:
      "Review provider profiles, client ratings, and detailed service offerings side-by-side.",
  },
  {
    number: "03",
    title: "Connect",
    description:
      "Directly message and communicate with potential providers.",
  },
  {
    number: "04",
    title: "Experience",
    description:
      "Receive quality services and share your feedback.",
  },
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="how-wrapper">

      <div className="how-header">
        <h2>How It Works</h2>
        <p>Simple steps to find trusted, verified providers.</p>
      </div>

      <div className="how-process">

        <div className="how-connection">
          <span
            className="how-connection-progress"
            style={{
              width: `${(activeStep / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`how-step ${
              activeStep === index ? "is-active" : ""
            }`}
          >
            <div className="how-number">
              {step.number}
            </div>

            <div className="how-info">
              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
};

export default HowItWorks;
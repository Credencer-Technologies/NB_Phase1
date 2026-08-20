import React, { useEffect, useRef, useState } from "react";
import "./ProviderNetwork.css";

/* =========================================================
   COUNT-UP HOOK
   - Splits "500+" into number (500) + suffix ("+")
   - Animates 0 -> number once the stat scrolls into view
   - Respects prefers-reduced-motion
========================================================= */

const useCountUp = (value, { duration = 1400 } = {}) => {
  const match = String(value).match(/^([\d,]+)(.*)$/);
  const target = match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
  const suffix = match ? match[2] : "";

  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDisplay(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun.current) {
            hasRun.current = true;

            const start = performance.now();

            const step = (now) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);

              // ease-out for a natural "settle" at the end
              const eased = 1 - Math.pow(1 - progress, 3);

              setDisplay(Math.round(eased * target));

              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                setDisplay(target);
              }
            };

            requestAnimationFrame(step);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, text: `${display.toLocaleString("en-IN")}${suffix}` };
};

/* =========================================================
   STAT — single animated number card
========================================================= */

const Stat = ({ value, label }) => {
  const { ref, text } = useCountUp(value);

  return (
    <div className="network-stat" ref={ref}>
      <strong>{text}</strong>
      <span>{label}</span>
    </div>
  );
};

/* =========================================================
   PROVIDER NETWORK SECTION
========================================================= */

const ProviderNetwork = () => {
  const stats = [
    { value: "10+", label: "States" },
    { value: "100+", label: "Cities" },
    { value: "500+", label: "users" },
  ];

  return (
    <section className="provider-network" id="provider-network">
      <div className="provider-network__container">
        {/* =====================================================
            LEFT — INDIA MAP CARD
        ===================================================== */}

        <div className="provider-network__visual">
  <div className="india-map-card">
    <img
      src="/image/indiamap2.png"
      alt="Women-led services across India"
      className="india-provider-image"
    />

    <div className="network-status">
      <span className="status-dot"></span>
      Connecting women across India
    </div>
  </div>
</div>

        {/* =====================================================
            RIGHT — CONTENT CARD
        ===================================================== */}

        <div className="provider-network__content-card">
          <div className="provider-network__content">
            {/* EYEBROW */}
            <span className="provider-network__eyebrow">
              OUR WOMEN-LED MARKETPLACE
            </span>

            {/* HEADING */}
            <h2>
              Women-Led
              <br />
              <span>Services Across India</span>
            </h2>

            {/* DESCRIPTION */}
            <p>
              NariBazar brings women entrepreneurs together to
              showcase their services, explore opportunities, and
              connect with skilled professionals across India.
            </p>

            {/* =================================================
                STATS (animated count-up)
            ================================================= */}

            <div className="provider-network__stats">
              {stats.map((stat) => (
                <Stat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>

            {/* =================================================
                BOTTOM MESSAGE
            ================================================= */}

            <div className="network-message"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderNetwork;
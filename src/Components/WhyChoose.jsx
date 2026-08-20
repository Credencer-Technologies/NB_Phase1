import "./WhyChoose.css";

const ShieldIcon = () => (
  <svg viewBox="0 0 64 64" width="52" height="52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ffe3f0" />
      </linearGradient>
      <filter id="shieldShadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#7a0033" floodOpacity="0.28" />
      </filter>
    </defs>
    <g filter="url(#shieldShadow)">
      <path
        d="M32 6 L52 14 V29 C52 43 44 52 32 58 C20 52 12 43 12 29 V14 Z"
        fill="url(#shieldFill)"
      />
      <path
        d="M32 6 L52 14 V29 C52 43 44 52 32 58 C20 52 12 43 12 29 V14 Z"
        fill="none"
        stroke="#ff2e88"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />
    </g>
    <path
      d="M23 31 L29 38 L42 23"
      fill="none"
      stroke="#ff007f"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ellipse cx="24" cy="17" rx="9" ry="4" fill="#ffffff" opacity="0.55" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
    <defs>
      <linearGradient id="starFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ffe3f0" />
      </linearGradient>

      <filter id="starShadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow
          dx="0"
          dy="3"
          stdDeviation="2.5"
          floodColor="#7a0033"
          floodOpacity="0.28"
        />
      </filter>
    </defs>

    <g filter="url(#starShadow)">
      <path
        d="M32 6 L39.5 22.5 L57 24.8 L44 37 L47.5 54.5 L32 45.8 L16.5 54.5 L20 37 L7 24.8 L24.5 22.5 Z"
        fill="url(#starFill)"
        stroke="#ff2e88"
        strokeWidth="1.5"
        strokeOpacity="0.35"
        strokeLinejoin="round"
      />
    </g>

    <path
      d="M32 6 L39.5 22.5 L57 24.8 L44 37 L47.5 54.5 L32 45.8 Z"
      fill="#ff007f"
      opacity="0.18"
    />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 64 64" width="52" height="52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pinFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ffe3f0" />
      </linearGradient>
      <filter id="pinShadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#7a0033" floodOpacity="0.28" />
      </filter>
    </defs>
    <ellipse cx="32" cy="56" rx="12" ry="3.5" fill="#ff007f" opacity="0.15" />
    <g filter="url(#pinShadow)">
      <path
        d="M32 6 C20.5 6 11 15.4 11 26.8 C11 40.5 27 53 32 57 C37 53 53 40.5 53 26.8 C53 15.4 43.5 6 32 6 Z"
        fill="url(#pinFill)"
        stroke="#ff2e88"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />
    </g>
    <circle cx="32" cy="27" r="9" fill="#ff007f" />
    <ellipse cx="28.5" cy="23.5" rx="3.2" ry="2" fill="#ffffff" opacity="0.6" />
  </svg>
);

const WhyChoose = () => {
  return (
    <section className="why-section">
      <h2 className="why-title">Why Choose NariBazar?</h2>
      <p className="why-subtitle">
        Connecting customers with trusted women-led businesses through a
        premium discovery experience.
      </p>
      <div className="why-grid">
        <div className="why-card">
          <div className="why-icon">
            <ShieldIcon />
          </div>
          <h3>Verified Providers</h3>
          <p>
            Every provider undergoes profile verification before appearing
            on the platform.
          </p>
        </div>

        <div className="why-card">
          <div className="why-icon">
            <StarIcon />
          </div>
          <h3>Trusted Reviews</h3>
          <p>
            Genuine ratings and customer feedback help you make confident
            decisions.
          </p>
        </div>

        <div className="why-card">
          <div className="why-icon">
            <PinIcon />
          </div>
          <h3>Local Discovery</h3>
          <p>
            Discover talented women entrepreneurs and services near your
            location.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
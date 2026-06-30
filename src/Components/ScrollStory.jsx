import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollStory.css";

gsap.registerPlugin(ScrollTrigger);

const ScrollStory = () => {
  const containerRef = useRef();

  useEffect(() => {
    const sections = gsap.utils.toArray(".story-section");

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        end: "+=3000",
      },
    });
  }, []);

  return (
    <div className="story-wrapper" ref={containerRef}>
      
      <section className="story-section s1">
        <h1>Discover Premium Services</h1>
        <p>Beauty, Wellness & Lifestyle experts at your fingertips</p>
      </section>

      <section className="story-section s2">
        <h1>Trusted Professionals</h1>
        <p>Verified providers with real reviews and ratings</p>
      </section>

      <section className="story-section s3">
        <h1>Book Instantly</h1>
        <p>Seamless booking experience in seconds</p>
      </section>

    </div>
  );
};

export default ScrollStory;
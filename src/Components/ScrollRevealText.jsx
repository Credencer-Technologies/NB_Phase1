import "./ScrollRevealText.css";
import { useEffect, useRef } from "react";

const ScrollRevealText = ({ text }) => {
  const ref = useRef();

  useEffect(() => {
    const words = ref.current.querySelectorAll(".word");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.3 }
    );

    words.forEach((word) => observer.observe(word));

    return () => observer.disconnect();
  }, []);

  return (
    <span className="reveal-text" ref={ref}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="word">
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
};

export default ScrollRevealText;
import { useEffect } from "react";

export const useParallax = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const speed = el.getAttribute("data-speed");

        const y = scrollY * speed;

        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
};
import { useRef } from "react";

export const useMagnetic = () => {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };

  const handleLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "translate(0,0)";
    }
  };

  return {
    ref,
    handleMove,
    handleLeave,
  };
};
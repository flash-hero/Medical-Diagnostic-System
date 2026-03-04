import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CrosshairCursor() {
  const [visible, setVisible] = useState(false);

  const springConfig = { stiffness: 250, damping: 28 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    const handleMouseMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [x, y, visible]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-multiply"
      style={{ x, y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="block -translate-x-1/2 -translate-y-1/2"
        fill="none"
      >
        {/* Crosshair lines */}
        <line
          x1="24"
          y1="2"
          x2="24"
          y2="16"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.4"
        />
        <line
          x1="24"
          y1="32"
          x2="24"
          y2="46"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.4"
        />
        <line
          x1="2"
          y1="24"
          x2="16"
          y2="24"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.4"
        />
        <line
          x1="32"
          y1="24"
          x2="46"
          y2="24"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.4"
        />

        {/* Center dot */}
        <circle
          cx="24"
          cy="24"
          r="1.5"
          fill="none"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Corner brackets */}
        <path
          d="M 14 10 L 10 10 L 10 14"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.25"
        />
        <path
          d="M 34 10 L 38 10 L 38 14"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.25"
        />
        <path
          d="M 14 38 L 10 38 L 10 34"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.25"
        />
        <path
          d="M 34 38 L 38 38 L 38 34"
          stroke="#8B0909"
          strokeWidth="0.5"
          opacity="0.25"
        />

        {/* Measurement ticks */}
        <line
          x1="20"
          y1="24"
          x2="20"
          y2="23"
          stroke="#8B0909"
          strokeWidth="0.3"
          opacity="0.2"
        />
        <line
          x1="28"
          y1="24"
          x2="28"
          y2="23"
          stroke="#8B0909"
          strokeWidth="0.3"
          opacity="0.2"
        />
        <line
          x1="24"
          y1="20"
          x2="23"
          y2="20"
          stroke="#8B0909"
          strokeWidth="0.3"
          opacity="0.2"
        />
        <line
          x1="24"
          y1="28"
          x2="23"
          y2="28"
          stroke="#8B0909"
          strokeWidth="0.3"
          opacity="0.2"
        />
      </svg>
    </motion.div>
  );
}

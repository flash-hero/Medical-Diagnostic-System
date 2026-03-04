import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  {
    label: "Active Users",
    value: 12400,
    suffix: "+",
    description: "Patients trust our platform daily",
    color: "#8B0909",
  },
  {
    label: "Verified Doctors",
    value: 850,
    suffix: "+",
    description: "Specialists across 40+ specialties",
    color: "#8B0909",
  },
  {
    label: "AI Predictions",
    value: 98500,
    suffix: "+",
    description: "Disease & cancer predictions completed",
    color: "#6B2D2D",
  },
  {
    label: "Detection Accuracy",
    value: 99.8,
    suffix: "%",
    description: "Deep learning model precision",
    color: "#A04040",
  },
];

function useAnimatedCounter(target, isInView, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    const isFloat = target % 1 !== 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  return count;
}

function StatCard({ stat, index, isInView }) {
  const count = useAnimatedCounter(stat.value, isInView, 2200 + index * 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative group"
    >
      {/* Card */}
      <div className="relative border border-[#C4A882]/40 bg-[#E5CDBB] p-8 sm:p-10 overflow-hidden">
        {/* Accent top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)`,
          }}
        />

        {/* Number */}
        <div className="font-mono">
          <span
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight tabular-nums"
            style={{ color: stat.color }}
          >
            {stat.prefix || ""}
            {typeof count === "number" && count % 1 !== 0
              ? count.toFixed(1)
              : count.toLocaleString()}
          </span>
          <span
            className="text-xl sm:text-2xl font-bold ml-1"
            style={{ color: `${stat.color}99` }}
          >
            {stat.suffix}
          </span>
        </div>

        {/* Label */}
        <div className="mt-3 text-[10px] sm:text-xs tracking-[0.3em] text-[#7A6350] font-mono uppercase">
          {stat.label}
        </div>

        {/* Description */}
        <p className="mt-2 text-[11px] sm:text-xs text-[#8B7560] leading-relaxed">
          {stat.description}
        </p>

        {/* Corner decoration */}
        <div
          className="absolute bottom-3 right-3 w-3 h-3 border-r border-b opacity-20"
          style={{ borderColor: stat.color }}
        />
      </div>
    </motion.div>
  );
}

export default function StatisticsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 sm:py-40 md:py-48 px-6">
      {/* Top fade-in line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[#C4A882]/30" />

      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Section header */}
        <motion.div
          className="text-center mb-16 sm:mb-20 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="text-[9px] sm:text-[10px] tracking-[0.5em] text-clinical-primary/40 font-mono uppercase mb-6">
            Platform Metrics
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.85]">
            Trusted by
            <br />
            <span className="text-[#C4A882]">Thousands</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} isInView={isInView} />
          ))}
        </div>
      </div>

      {/* Bottom fade-out line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent to-[#C4A882]/30" />
    </section>
  );
}

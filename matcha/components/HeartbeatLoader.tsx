"use client";

import { motion } from "framer-motion";

interface HeartbeatLoaderProps {
  progress: number;
  label?: string;
}

export default function HeartbeatLoader({
  progress,
  label = "INITIALIZING NEURAL NETWORKS",
}: HeartbeatLoaderProps) {
  // ECG-style heartbeat waveform
  const ecgPath =
    "M 0,50 L 18,50 L 22,50 L 26,18 L 30,82 L 34,32 L 38,62 L 42,50 " +
    "L 58,50 L 62,50 L 66,15 L 70,85 L 74,28 L 78,65 L 82,50 L 100,50";

  return (
    <div className="fixed inset-0 z-[60] bg-[#EDD9CC] flex flex-col items-center justify-center">
      {/* Heartbeat ECG line */}
      <div className="w-56 sm:w-64 h-16 mb-10">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <motion.path
            d={ecgPath}
            fill="none"
            stroke="#8B0909"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0.3 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0.2, 0.9, 0.2],
            }}
            transition={{
              pathLength: {
                duration: 1.6,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: {
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />

          {/* Faint trailing glow */}
          <motion.path
            d={ecgPath}
            fill="none"
            stroke="#8B0909"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.08}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>
      </div>

      {/* Label */}
      <motion.div
        className="text-[9px] sm:text-[10px] tracking-[0.5em] text-clinical-primary/80 font-mono mb-6 text-center px-4"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {label}...
      </motion.div>

      {/* Progress bar */}
      <div className="w-40 sm:w-48 h-px bg-[#C4A882]/30 relative overflow-hidden rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-clinical-primary/60 to-clinical-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </div>

      {/* Percentage */}
      <div className="text-[10px] text-[#A08870] font-mono mt-4 tabular-nums">
        {Math.round(progress * 100)}%
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-10 text-center">
        <div className="text-[9px] tracking-[0.4em] text-[#A08870] font-mono uppercase">
          MedCare AI v2.1.0
        </div>
      </div>
    </div>
  );
}

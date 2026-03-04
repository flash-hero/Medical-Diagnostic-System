import { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   MATH UTILITIES
   ═══════════════════════════════════════════════════════════════ */

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function remap(v, inMin, inMax, outMin = 0, outMax = 1) {
  return outMin + (outMax - outMin) * clamp((v - inMin) / (inMax - inMin));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* ═══════════════════════════════════════════════════════════════
   DOCTOR NETWORK DATA — Normalized positions (0–1)
   ═══════════════════════════════════════════════════════════════ */

const DOCTORS = [
  { x: 0.5, y: 0.35, radius: 22, label: "Dr. Amari", specialty: "Oncology", pulsePhase: 0 },
  { x: 0.25, y: 0.28, radius: 18, label: "Dr. Chen", specialty: "Pulmonology", pulsePhase: 1.2 },
  { x: 0.75, y: 0.3, radius: 18, label: "Dr. Moreau", specialty: "Cardiology", pulsePhase: 2.4 },
  { x: 0.15, y: 0.55, radius: 15, label: "Dr. Patel", specialty: "Radiology", pulsePhase: 0.6 },
  { x: 0.38, y: 0.6, radius: 16, label: "Dr. Okafor", specialty: "Neurology", pulsePhase: 1.8 },
  { x: 0.62, y: 0.58, radius: 16, label: "Dr. Silva", specialty: "Dermatology", pulsePhase: 3.0 },
  { x: 0.85, y: 0.52, radius: 15, label: "Dr. Kim", specialty: "Pediatrics", pulsePhase: 0.3 },
  { x: 0.3, y: 0.82, radius: 14, label: "Dr. Weber", specialty: "Orthopedics", pulsePhase: 2.1 },
  { x: 0.7, y: 0.8, radius: 14, label: "Dr. Tanaka", specialty: "Immunology", pulsePhase: 1.5 },
  { x: 0.5, y: 0.72, radius: 17, label: "Dr. Hassan", specialty: "Surgery", pulsePhase: 0.9 },
];

const CONNECTIONS = [
  { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 4 }, { from: 0, to: 5 },
  { from: 1, to: 3 }, { from: 1, to: 4 }, { from: 2, to: 5 }, { from: 2, to: 6 },
  { from: 3, to: 7 }, { from: 4, to: 9 }, { from: 5, to: 9 }, { from: 6, to: 8 },
  { from: 7, to: 9 }, { from: 8, to: 9 },
];

/* ═══════════════════════════════════════════════════════════════
   DRAW — CONNECTIONS
   ═══════════════════════════════════════════════════════════════ */

function drawConnections(ctx, w, h, intensity, time, dataFlowProgress) {
  for (const conn of CONNECTIONS) {
    const from = DOCTORS[conn.from];
    const to = DOCTORS[conn.to];

    const x1 = from.x * w;
    const y1 = from.y * h;
    const x2 = to.x * w;
    const y2 = to.y * h;

    // Static line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(139, 9, 9, ${0.06 * intensity})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Animated data pulse traveling along the line
    if (dataFlowProgress > 0) {
      const t = ((time * 0.3 + conn.from * 0.15) % 1);
      const px = lerp(x1, x2, t);
      const py = lerp(y1, y2, t);
      const glowR = 3;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, glowR * 3);
      grad.addColorStop(0, `rgba(139, 9, 9, ${0.6 * dataFlowProgress * intensity})`);
      grad.addColorStop(1, "rgba(139, 9, 9, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, glowR * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(139, 9, 9, ${0.9 * dataFlowProgress * intensity})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — DOCTOR NODES
   ═══════════════════════════════════════════════════════════════ */

function drawDoctorNodes(ctx, w, h, formationProgress, intensity, time, selectedIdx) {
  for (let i = 0; i < DOCTORS.length; i++) {
    const doc = DOCTORS[i];
    const nodeAppear = clamp(remap(formationProgress, i * 0.06, i * 0.06 + 0.3, 0, 1));
    if (nodeAppear < 0.01) continue;

    const nx = doc.x * w;
    const ny = doc.y * h;
    const r = doc.radius * nodeAppear;
    const pulse = Math.sin(time * 2 + doc.pulsePhase) * 0.15 + 0.85;
    const isSelected = i === selectedIdx;

    // Outer glow
    const outerR = r * 2.5;
    const outerGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, outerR);
    const glowAlpha = isSelected ? 0.12 : 0.04;
    outerGrad.addColorStop(0, `rgba(139, 9, 9, ${glowAlpha * intensity * pulse})`);
    outerGrad.addColorStop(1, "rgba(139, 9, 9, 0)");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(nx, ny, outerR, 0, Math.PI * 2);
    ctx.fill();

    // Ring
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    const ringAlpha = isSelected ? 0.5 : 0.2;
    ctx.strokeStyle = `rgba(139, 9, 9, ${ringAlpha * intensity * pulse})`;
    ctx.lineWidth = isSelected ? 1.5 : 0.8;
    ctx.stroke();

    // Inner fill
    const innerGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
    const fillAlpha = isSelected ? 0.1 : 0.03;
    innerGrad.addColorStop(0, `rgba(139, 9, 9, ${fillAlpha * intensity})`);
    innerGrad.addColorStop(1, `rgba(139, 9, 9, ${fillAlpha * 0.2 * intensity})`);
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    ctx.fill();

    // Cross icon (doctor symbol)
    const crossSize = r * 0.35;
    ctx.strokeStyle = `rgba(139, 9, 9, ${0.4 * intensity * nodeAppear})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(nx - crossSize, ny);
    ctx.lineTo(nx + crossSize, ny);
    ctx.moveTo(nx, ny - crossSize);
    ctx.lineTo(nx, ny + crossSize);
    ctx.stroke();

    // Label (below node)
    if (nodeAppear > 0.7) {
      const labelAlpha = (nodeAppear - 0.7) / 0.3;
      ctx.textAlign = "center";
      ctx.font = "600 9px system-ui, sans-serif";
      ctx.fillStyle = `rgba(42, 16, 16, ${0.55 * labelAlpha * intensity})`;
      ctx.fillText(doc.label, nx, ny + r + 14);

      ctx.font = "8px monospace";
      ctx.fillStyle = `rgba(139, 9, 9, ${0.35 * labelAlpha * intensity})`;
      ctx.fillText(doc.specialty, nx, ny + r + 25);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — APPOINTMENT CARD
   ═══════════════════════════════════════════════════════════════ */

function drawAppointmentCard(ctx, w, h, formProgress, time) {
  if (formProgress < 0.01) return;

  const doc = DOCTORS[0]; // Amari is the selected doctor
  const cx = doc.x * w;
  const cy = doc.y * h;

  // Card dimensions
  const cardW = 160 * formProgress;
  const cardH = 80 * formProgress;
  const cardX = cx + doc.radius + 20;
  const cardY = cy - cardH / 2;

  // Card background
  ctx.fillStyle = `rgba(222, 200, 178, ${0.88 * formProgress})`;
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.2 * formProgress})`;
  ctx.lineWidth = 0.5;

  // Rounded rect
  const cornerR = 4;
  ctx.beginPath();
  ctx.moveTo(cardX + cornerR, cardY);
  ctx.lineTo(cardX + cardW - cornerR, cardY);
  ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cornerR, cornerR);
  ctx.lineTo(cardX + cardW, cardY + cardH - cornerR);
  ctx.arcTo(cardX + cardW, cardY + cardH, cardX + cardW - cornerR, cardY + cardH, cornerR);
  ctx.lineTo(cardX + cornerR, cardY + cardH);
  ctx.arcTo(cardX, cardY + cardH, cardX, cardY + cardH - cornerR, cornerR);
  ctx.lineTo(cardX, cardY + cornerR);
  ctx.arcTo(cardX, cardY, cardX + cornerR, cardY, cornerR);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Connector line
  ctx.beginPath();
  ctx.moveTo(cx + doc.radius + 2, cy);
  ctx.lineTo(cardX, cy);
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.15 * formProgress})`;
  ctx.setLineDash([2, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  if (formProgress > 0.5) {
    const textAlpha = (formProgress - 0.5) * 2;

    ctx.textAlign = "left";
    ctx.font = "600 9px system-ui, sans-serif";
    ctx.fillStyle = `rgba(42, 16, 16, ${0.7 * textAlpha})`;
    ctx.fillText("Book Appointment", cardX + 10, cardY + 18);

    ctx.font = "8px monospace";
    ctx.fillStyle = `rgba(139, 9, 9, ${0.5 * textAlpha})`;
    ctx.fillText("Dr. Amari — Oncology", cardX + 10, cardY + 32);

    // Calendar mini grid
    const calX = cardX + 10;
    const calY = cardY + 42;
    const cellSize = 10;
    const days = ["M", "T", "W", "T", "F"];

    ctx.font = "6px monospace";
    for (let d = 0; d < 5; d++) {
      const dx = calX + d * (cellSize + 3);
      ctx.fillStyle = `rgba(139, 9, 9, ${0.25 * textAlpha})`;
      ctx.fillText(days[d], dx + 2, calY);

      // Time slot boxes
      for (let s = 0; s < 2; s++) {
        const sy = calY + 6 + s * (cellSize + 2);
        const available = (d + s) % 3 !== 0;
        const slotPulse = Math.sin(time * 2 + d + s) * 0.15 + 0.85;

        ctx.strokeStyle = `rgba(139, 9, 9, ${(available ? 0.25 : 0.06) * textAlpha * slotPulse})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(dx, sy, cellSize, cellSize);

        if (available) {
          ctx.fillStyle = `rgba(139, 9, 9, ${0.04 * textAlpha})`;
          ctx.fillRect(dx, sy, cellSize, cellSize);
        }

        // Highlight one slot
        if (d === 2 && s === 0) {
          ctx.fillStyle = `rgba(139, 9, 9, ${0.15 * textAlpha * slotPulse})`;
          ctx.fillRect(dx, sy, cellSize, cellSize);
          ctx.strokeStyle = `rgba(139, 9, 9, ${0.6 * textAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.strokeRect(dx, sy, cellSize, cellSize);
        }
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — VIGNETTE (shared pattern)
   ═══════════════════════════════════════════════════════════════ */

function drawVignette(ctx, w, h) {
  const gradient = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.2,
    w / 2, h / 2, Math.max(w, h) * 0.72,
  );
  gradient.addColorStop(0, "rgba(237, 217, 204, 0)");
  gradient.addColorStop(0.5, "rgba(237, 217, 204, 0.12)");
  gradient.addColorStop(0.8, "rgba(237, 217, 204, 0.6)");
  gradient.addColorStop(1, "rgba(237, 217, 204, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — HUD (corner brackets only)
   ═══════════════════════════════════════════════════════════════ */

function drawHUD(ctx, w, h) {
  const a = 0.08;
  const bSize = 18;
  ctx.strokeStyle = `rgba(139, 9, 9, ${a})`;
  ctx.lineWidth = 0.5;

  ctx.beginPath(); ctx.moveTo(14, 14 + bSize); ctx.lineTo(14, 14); ctx.lineTo(14 + bSize, 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 14 - bSize, 14); ctx.lineTo(w - 14, 14); ctx.lineTo(w - 14, 14 + bSize); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, h - 14 - bSize); ctx.lineTo(14, h - 14); ctx.lineTo(14 + bSize, h - 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 14 - bSize, h - 14); ctx.lineTo(w - 14, h - 14); ctx.lineTo(w - 14, h - 14 - bSize); ctx.stroke();
}

/* ═══════════════════════════════════════════════════════════════
   MAIN RENDER
   ═══════════════════════════════════════════════════════════════ */

function renderFrame(ctx, w, h, progress, time) {
  ctx.fillStyle = "#EDD9CC";
  ctx.fillRect(0, 0, w, h);

  // Phase timeline
  const nodesFormation = clamp(remap(progress, 0.0, 0.45, 0, 1));
  const connectionsI = clamp(remap(progress, 0.15, 0.4, 0, 1));
  const dataFlowI = clamp(remap(progress, 0.3, 0.55, 0, 1));
  const selectedDoc = remap(progress, 0.4, 0.5, 0, 1) > 0.5 ? 0 : -1;
  const appointmentCard = clamp(remap(progress, 0.55, 0.8, 0, 1));
  const fadeOut = clamp(remap(progress, 0.88, 1.0, 1, 0));

  ctx.globalAlpha = fadeOut;

  if (connectionsI > 0.005)
    drawConnections(ctx, w, h, connectionsI, time, dataFlowI);

  drawDoctorNodes(ctx, w, h, nodesFormation, 1, time, selectedDoc);

  drawAppointmentCard(ctx, w, h, appointmentCard, time);

  ctx.globalAlpha = 1;

  drawVignette(ctx, w, h);
  drawHUD(ctx, w, h);
}

/* ═══════════════════════════════════════════════════════════════
   REACT COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function DoctorNetworkCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const prevTimeRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Text overlay opacities
  const beatAOpacity = useTransform(smoothProgress, [0.0, 0.05, 0.18, 0.28], [0, 1, 1, 0]);
  const beatBOpacity = useTransform(smoothProgress, [0.35, 0.42, 0.65, 0.78], [0, 1, 1, 0]);
  const beatCOpacity = useTransform(smoothProgress, [0.6, 0.67, 0.82, 0.93], [0, 1, 1, 0]);

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      progressRef.current = v;
    });
    return unsubscribe;
  }, [smoothProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let rafId;

    const animate = (timestamp) => {
      const time = timestamp / 1000;
      prevTimeRef.current = time;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderFrame(ctx, rect.width, rect.height, progressRef.current, time);

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: "#EDD9CC" }}
        />

        {/* Text Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Beat A — Network Discovery */}
          <motion.div
            style={{ opacity: beatAOpacity }}
            className="absolute left-5 sm:left-8 md:left-16 lg:left-24
                       bottom-20 sm:bottom-24
                       md:bottom-auto md:top-[25%]"
          >
            <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
              01 — DOCTOR NETWORK
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
              FIND YOUR
              <br />
              <span className="text-clinical-primary">SPECIALIST</span>
            </h2>
            <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed">
              Browse our network of verified specialists across every medical domain.
            </p>
          </motion.div>

          {/* Beat B — Booking */}
          <motion.div
            style={{ opacity: beatBOpacity }}
            className="absolute right-5 sm:right-8 md:right-16 lg:right-24
                       bottom-20 sm:bottom-24
                       md:bottom-auto md:top-[25%]
                       text-right"
          >
            <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
              02 — APPOINTMENT
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
              BOOK WITH
              <br />
              <span className="text-clinical-primary">CONFIDENCE</span>
            </h2>
            <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed ml-auto">
              Instant scheduling with real-time availability from trusted physicians.
            </p>
          </motion.div>

          {/* Beat C — Trusted */}
          <motion.div
            style={{ opacity: beatCOpacity }}
            className="absolute left-5 sm:left-8 md:left-16 lg:left-24
                       bottom-20 sm:bottom-24
                       md:bottom-auto md:top-[25%]"
          >
            <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
              03 — VERIFIED
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
              TRUSTED
              <br />
              <span className="text-clinical-primary">NETWORK</span>
            </h2>
            <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed">
              Every physician is credential-verified and peer-reviewed for your safety.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

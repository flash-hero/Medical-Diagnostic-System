"use client";

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

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function remap(v: number, inMin: number, inMax: number, outMin = 0, outMax = 1): number {
  return outMin + (outMax - outMin) * clamp((v - inMin) / (inMax - inMin));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ═══════════════════════════════════════════════════════════════
   BODY SILHOUETTE — High-detail outline (120+ points, clockwise)
   Head drawn separately as ellipse; this path traces the full
   body perimeter: neck → right shoulder → arm → torso → leg →
   left leg → torso → arm → shoulder → neck (closed loop).
   ═══════════════════════════════════════════════════════════════ */

const BODY_OUTLINE: [number, number][] = [
  // — Top of head (right half arc) —
  [0, -0.93],
  [0.025, -0.928], [0.048, -0.915], [0.065, -0.895], [0.076, -0.87],
  [0.082, -0.84], [0.082, -0.81], [0.076, -0.785], [0.065, -0.765],
  [0.048, -0.75], [0.038, -0.74],
  // — Right neck —
  [0.038, -0.725], [0.04, -0.705], [0.042, -0.685], [0.044, -0.67],
  // — Right shoulder (smooth slope outward) —
  [0.055, -0.66], [0.075, -0.648], [0.10, -0.635], [0.13, -0.62],
  [0.165, -0.605], [0.20, -0.59], [0.23, -0.58], [0.255, -0.572],
  // — Right deltoid → upper arm —
  [0.275, -0.565], [0.29, -0.555], [0.30, -0.54], [0.305, -0.515],
  [0.308, -0.485], [0.306, -0.45], [0.30, -0.42], [0.295, -0.395],
  // — Right elbow —
  [0.288, -0.365], [0.28, -0.335], [0.275, -0.31],
  // — Right forearm —
  [0.27, -0.28], [0.265, -0.24], [0.26, -0.20], [0.256, -0.16],
  [0.252, -0.12], [0.249, -0.08],
  // — Right hand (rounded) —
  [0.247, -0.04], [0.244, -0.005], [0.238, 0.025], [0.228, 0.042],
  [0.215, 0.045], [0.205, 0.035], [0.20, 0.015], [0.198, -0.01],
  // — Right inner forearm (ascending) —
  [0.197, -0.05], [0.196, -0.09], [0.194, -0.13], [0.193, -0.17],
  [0.192, -0.21], [0.192, -0.25],
  // — Right inner upper arm (ascending) —
  [0.192, -0.29], [0.193, -0.33], [0.194, -0.37], [0.195, -0.41],
  // — Right armpit —
  [0.195, -0.46], [0.19, -0.50], [0.18, -0.535], [0.172, -0.55],
  // — Right torso (chest → waist) —
  [0.166, -0.52], [0.162, -0.48], [0.158, -0.44], [0.155, -0.40],
  [0.152, -0.35], [0.148, -0.30], [0.144, -0.24], [0.14, -0.18],
  [0.135, -0.12], [0.13, -0.06], [0.127, 0.00],
  // — Right hip —
  [0.128, 0.04], [0.132, 0.08], [0.14, 0.12], [0.152, 0.165],
  // — Right outer thigh —
  [0.16, 0.20], [0.165, 0.26], [0.165, 0.32], [0.162, 0.38],
  [0.156, 0.44], [0.15, 0.50],
  // — Right knee —
  [0.145, 0.54], [0.14, 0.57], [0.136, 0.60],
  // — Right calf —
  [0.133, 0.64], [0.13, 0.68], [0.127, 0.73], [0.125, 0.78],
  [0.124, 0.83],
  // — Right foot —
  [0.126, 0.865], [0.132, 0.90], [0.14, 0.93], [0.135, 0.955],
  [0.115, 0.965], [0.09, 0.96], [0.072, 0.945],
  // — Right inner ankle / calf (ascending) —
  [0.07, 0.92], [0.068, 0.88], [0.068, 0.84], [0.07, 0.79],
  [0.072, 0.74], [0.073, 0.69], [0.074, 0.64],
  // — Right inner knee / thigh —
  [0.074, 0.60], [0.073, 0.56], [0.072, 0.50], [0.07, 0.44],
  [0.066, 0.38], [0.06, 0.32], [0.052, 0.27],
  // — Crotch —
  [0.04, 0.23], [0.025, 0.24], [0, 0.245], [-0.025, 0.24], [-0.04, 0.23],
  // — Left inner thigh (mirror, descending in Y) —
  [-0.052, 0.27], [-0.06, 0.32], [-0.066, 0.38], [-0.07, 0.44],
  [-0.072, 0.50], [-0.073, 0.56], [-0.074, 0.60],
  // — Left inner knee / calf —
  [-0.074, 0.64], [-0.073, 0.69], [-0.072, 0.74], [-0.07, 0.79],
  [-0.068, 0.84], [-0.068, 0.88], [-0.07, 0.92],
  // — Left foot —
  [-0.072, 0.945], [-0.09, 0.96], [-0.115, 0.965], [-0.135, 0.955],
  [-0.14, 0.93], [-0.132, 0.90], [-0.126, 0.865],
  // — Left calf —
  [-0.124, 0.83], [-0.125, 0.78], [-0.127, 0.73], [-0.13, 0.68],
  [-0.133, 0.64],
  // — Left knee —
  [-0.136, 0.60], [-0.14, 0.57], [-0.145, 0.54],
  // — Left outer thigh —
  [-0.15, 0.50], [-0.156, 0.44], [-0.162, 0.38], [-0.165, 0.32],
  [-0.165, 0.26], [-0.16, 0.20],
  // — Left hip —
  [-0.152, 0.165], [-0.14, 0.12], [-0.132, 0.08], [-0.128, 0.04],
  // — Left torso (waist → chest) —
  [-0.127, 0.00], [-0.13, -0.06], [-0.135, -0.12], [-0.14, -0.18],
  [-0.144, -0.24], [-0.148, -0.30], [-0.152, -0.35], [-0.155, -0.40],
  [-0.158, -0.44], [-0.162, -0.48], [-0.166, -0.52],
  // — Left armpit —
  [-0.172, -0.55], [-0.18, -0.535], [-0.19, -0.50], [-0.195, -0.46],
  // — Left inner upper arm (descending) —
  [-0.195, -0.41], [-0.194, -0.37], [-0.193, -0.33], [-0.192, -0.29],
  // — Left inner forearm (descending) —
  [-0.192, -0.25], [-0.192, -0.21], [-0.193, -0.17], [-0.194, -0.13],
  [-0.196, -0.09], [-0.197, -0.05],
  // — Left hand (rounded) —
  [-0.198, -0.01], [-0.20, 0.015], [-0.205, 0.035], [-0.215, 0.045],
  [-0.228, 0.042], [-0.238, 0.025], [-0.244, -0.005], [-0.247, -0.04],
  // — Left forearm (ascending) —
  [-0.249, -0.08], [-0.252, -0.12], [-0.256, -0.16], [-0.26, -0.20],
  [-0.265, -0.24], [-0.27, -0.28],
  // — Left elbow —
  [-0.275, -0.31], [-0.28, -0.335], [-0.288, -0.365],
  // — Left upper arm (ascending) —
  [-0.295, -0.395], [-0.30, -0.42], [-0.306, -0.45], [-0.308, -0.485],
  [-0.305, -0.515], [-0.30, -0.54], [-0.29, -0.555], [-0.275, -0.565],
  // — Left shoulder —
  [-0.255, -0.572], [-0.23, -0.58], [-0.20, -0.59], [-0.165, -0.605],
  [-0.13, -0.62], [-0.10, -0.635], [-0.075, -0.648], [-0.055, -0.66],
  // — Left neck —
  [-0.044, -0.67], [-0.042, -0.685], [-0.04, -0.705], [-0.038, -0.725],
  // — Left side of head —
  [-0.038, -0.74], [-0.048, -0.75], [-0.065, -0.765], [-0.076, -0.785],
  [-0.082, -0.81], [-0.082, -0.84], [-0.076, -0.87], [-0.065, -0.895],
  [-0.048, -0.915], [-0.025, -0.928], [0, -0.93],
];

/* ═══════════════════════════════════════════════════════════════
   SYMPTOM POINTS
   ═══════════════════════════════════════════════════════════════ */

interface SymptomPoint {
  x: number;
  y: number;
  label: string;
  region: string;
  phase: number;
}

const SYMPTOMS: SymptomPoint[] = [
  { x: 0, y: -0.83, label: "Headache", region: "Head", phase: 0 },
  { x: -0.03, y: -0.66, label: "Sore Throat", region: "Throat", phase: 0.5 },
  { x: -0.1, y: -0.42, label: "Chest Pain", region: "Chest", phase: 1.0 },
  { x: 0.1, y: -0.38, label: "Cough", region: "Lungs", phase: 1.5 },
  { x: 0, y: -0.12, label: "Nausea", region: "Stomach", phase: 2.0 },
  { x: -0.08, y: 0.08, label: "Abdominal Pain", region: "Abdomen", phase: 2.5 },
  { x: 0.12, y: 0.45, label: "Joint Pain", region: "Knee", phase: 3.0 },
  { x: -0.26, y: -0.35, label: "Fatigue", region: "Arm", phase: 3.5 },
];

/* ═══════════════════════════════════════════════════════════════
   NEURAL NETWORK LAYOUT
   ═══════════════════════════════════════════════════════════════ */

interface NeuronLayer {
  count: number;
  x: number;
}

const NETWORK_LAYERS: NeuronLayer[] = [
  { count: 8, x: 0.6 },  // Input (symptoms)
  { count: 6, x: 0.7 },  // Hidden 1
  { count: 5, x: 0.78 }, // Hidden 2
  { count: 4, x: 0.86 }, // Hidden 3
  { count: 1, x: 0.94 }, // Output (diagnosis)
];

/* ═══════════════════════════════════════════════════════════════
   SMOOTH PATH HELPER — Quadratic midpoint technique for C1 curves
   ═══════════════════════════════════════════════════════════════ */

function drawSmoothClosedPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  cx: number,
  cy: number,
  s: number,
) {
  const pts = points.map((p) => [cx + p[0] * s, cy + p[1] * s] as [number, number]);
  const len = pts.length;
  if (len < 3) return;

  // Start at midpoint between last and first point
  ctx.beginPath();
  ctx.moveTo((pts[len - 1][0] + pts[0][0]) / 2, (pts[len - 1][1] + pts[0][1]) / 2);

  for (let i = 0; i < len; i++) {
    const next = (i + 1) % len;
    ctx.quadraticCurveTo(
      pts[i][0], pts[i][1],
      (pts[i][0] + pts[next][0]) / 2,
      (pts[i][1] + pts[next][1]) / 2,
    );
  }

  ctx.closePath();
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — BODY SILHOUETTE (medical illustration style)
   ═══════════════════════════════════════════════════════════════ */

function drawBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  intensity: number,
) {
  if (intensity < 0.005) return;

  // ── 3D BASE: Shadow layer (offset right-down for depth) ──
  ctx.save();
  drawSmoothClosedPath(ctx, BODY_OUTLINE, cx + scale * 0.012, cy + scale * 0.008, scale);
  const shadowGrad = ctx.createLinearGradient(
    cx - scale * 0.3, cy - scale * 0.5,
    cx + scale * 0.3, cy + scale * 0.5,
  );
  shadowGrad.addColorStop(0, `rgba(80, 5, 5, ${0.04 * intensity})`);
  shadowGrad.addColorStop(1, `rgba(80, 5, 5, ${0.12 * intensity})`);
  ctx.fillStyle = shadowGrad;
  ctx.fill();
  ctx.restore();

  // ── 3D FILL: Lateral gradient for volume (light from upper-left) ──
  drawSmoothClosedPath(ctx, BODY_OUTLINE, cx, cy, scale);
  const bodyFill3D = ctx.createLinearGradient(
    cx - scale * 0.25, cy - scale * 0.6,
    cx + scale * 0.25, cy + scale * 0.4,
  );
  bodyFill3D.addColorStop(0, `rgba(139, 9, 9, ${0.06 * intensity})`);
  bodyFill3D.addColorStop(0.35, `rgba(139, 9, 9, ${0.10 * intensity})`);
  bodyFill3D.addColorStop(0.65, `rgba(139, 9, 9, ${0.06 * intensity})`);
  bodyFill3D.addColorStop(1, `rgba(80, 5, 5, ${0.03 * intensity})`);
  ctx.fillStyle = bodyFill3D;
  ctx.fill();

  // ── 3D HIGHLIGHT: Left-side rim light ──
  drawSmoothClosedPath(ctx, BODY_OUTLINE, cx - scale * 0.006, cy, scale * 0.995);
  const highlightGrad = ctx.createLinearGradient(
    cx - scale * 0.32, cy, cx - scale * 0.05, cy,
  );
  highlightGrad.addColorStop(0, `rgba(200, 60, 60, ${0.12 * intensity})`);
  highlightGrad.addColorStop(0.5, `rgba(200, 60, 60, ${0.03 * intensity})`);
  highlightGrad.addColorStop(1, `rgba(200, 60, 60, 0)`);
  ctx.fillStyle = highlightGrad;
  ctx.fill();

  // ── 3D DEPTH: Right-side darker edge ──
  drawSmoothClosedPath(ctx, BODY_OUTLINE, cx + scale * 0.005, cy, scale * 0.997);
  const darkEdge = ctx.createLinearGradient(
    cx + scale * 0.05, cy, cx + scale * 0.32, cy,
  );
  darkEdge.addColorStop(0, `rgba(60, 2, 2, 0)`);
  darkEdge.addColorStop(0.6, `rgba(60, 2, 2, ${0.04 * intensity})`);
  darkEdge.addColorStop(1, `rgba(60, 2, 2, ${0.10 * intensity})`);
  ctx.fillStyle = darkEdge;
  ctx.fill();

  // ── Main outline stroke (thicker for clarity) ──
  drawSmoothClosedPath(ctx, BODY_OUTLINE, cx, cy, scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.35 * intensity})`;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // ── Secondary inner contour for 3D rim ──
  drawSmoothClosedPath(ctx, BODY_OUTLINE, cx, cy, scale * 0.985);
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.08 * intensity})`;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  // ── Anatomical details ──
  const a = 0.12 * intensity;

  // === MUSCLE DEFINITION LINES (3D depth cues) ===

  // Chest / Pectoral separation
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.52 * scale);
  ctx.quadraticCurveTo(cx + 0.04 * scale, cy - 0.48 * scale, cx + 0.12 * scale, cy - 0.44 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.2})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.52 * scale);
  ctx.quadraticCurveTo(cx - 0.04 * scale, cy - 0.48 * scale, cx - 0.12 * scale, cy - 0.44 * scale);
  ctx.stroke();

  // Abdominal lines (6-pack suggestion)
  for (let i = 0; i < 4; i++) {
    const lineY = cy + (-0.18 + i * 0.06) * scale;
    const halfW = (0.06 - i * 0.005) * scale;
    ctx.beginPath();
    ctx.moveTo(cx - halfW, lineY);
    ctx.lineTo(cx + halfW, lineY);
    ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.15})`;
    ctx.lineWidth = 0.3;
    ctx.stroke();
  }
  // Linea alba (center abdominal line)
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.24 * scale);
  ctx.lineTo(cx, cy + 0.1 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.2})`;
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // Deltoid curve (shoulder muscle)
  ctx.beginPath();
  ctx.moveTo(cx + 0.17 * scale, cy - 0.60 * scale);
  ctx.quadraticCurveTo(cx + 0.26 * scale, cy - 0.56 * scale, cx + 0.28 * scale, cy - 0.50 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.18})`;
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 0.17 * scale, cy - 0.60 * scale);
  ctx.quadraticCurveTo(cx - 0.26 * scale, cy - 0.56 * scale, cx - 0.28 * scale, cy - 0.50 * scale);
  ctx.stroke();

  // Bicep inner line
  ctx.beginPath();
  ctx.moveTo(cx + 0.20 * scale, cy - 0.46 * scale);
  ctx.quadraticCurveTo(cx + 0.21 * scale, cy - 0.40 * scale, cx + 0.20 * scale, cy - 0.34 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.15})`;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 0.20 * scale, cy - 0.46 * scale);
  ctx.quadraticCurveTo(cx - 0.21 * scale, cy - 0.40 * scale, cx - 0.20 * scale, cy - 0.34 * scale);
  ctx.stroke();

  // Quadricep separation lines
  ctx.beginPath();
  ctx.moveTo(cx + 0.10 * scale, cy + 0.22 * scale);
  ctx.quadraticCurveTo(cx + 0.12 * scale, cy + 0.35 * scale, cx + 0.11 * scale, cy + 0.48 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.12})`;
  ctx.lineWidth = 0.3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 0.10 * scale, cy + 0.22 * scale);
  ctx.quadraticCurveTo(cx - 0.12 * scale, cy + 0.35 * scale, cx - 0.11 * scale, cy + 0.48 * scale);
  ctx.stroke();

  // Calf muscle hint
  ctx.beginPath();
  ctx.moveTo(cx + 0.09 * scale, cy + 0.62 * scale);
  ctx.quadraticCurveTo(cx + 0.11 * scale, cy + 0.70 * scale, cx + 0.095 * scale, cy + 0.78 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.10})`;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 0.09 * scale, cy + 0.62 * scale);
  ctx.quadraticCurveTo(cx - 0.11 * scale, cy + 0.70 * scale, cx - 0.095 * scale, cy + 0.78 * scale);
  ctx.stroke();

  // === SPINE with vertebrae ===
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.66 * scale);
  ctx.bezierCurveTo(
    cx, cy - 0.44 * scale,
    cx, cy - 0.18 * scale,
    cx, cy + 0.14 * scale,
  );
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.55})`;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Vertebrae tick marks
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const vy = cy + (-0.62 + t * 0.72) * scale;
    const vw = (0.016 + Math.sin(t * Math.PI) * 0.010) * scale;
    ctx.beginPath();
    ctx.moveTo(cx - vw, vy);
    ctx.lineTo(cx + vw, vy);
    ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.4})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // === RIB CAGE — 6 pairs ===
  for (let i = 0; i < 6; i++) {
    const ribY = cy + (-0.52 + i * 0.05) * scale;
    const ribW = (0.10 - i * 0.004) * scale;
    const ribCurve = 0.02 * scale;

    ctx.beginPath();
    ctx.moveTo(cx + 0.008 * scale, ribY);
    ctx.quadraticCurveTo(cx + ribW * 0.6, ribY - ribCurve, cx + ribW, ribY + ribCurve * 1.4);
    ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.35})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 0.008 * scale, ribY);
    ctx.quadraticCurveTo(cx - ribW * 0.6, ribY - ribCurve, cx - ribW, ribY + ribCurve * 1.4);
    ctx.stroke();
  }

  // === HEART (3D with fill) ===
  ctx.beginPath();
  ctx.ellipse(
    cx + 0.018 * scale, cy - 0.37 * scale,
    0.028 * scale, 0.038 * scale,
    -0.3, 0, Math.PI * 2,
  );
  const heartGrad = ctx.createRadialGradient(
    cx + 0.015 * scale, cy - 0.38 * scale, 0,
    cx + 0.018 * scale, cy - 0.37 * scale, 0.038 * scale,
  );
  heartGrad.addColorStop(0, `rgba(180, 30, 30, ${0.15 * intensity})`);
  heartGrad.addColorStop(1, `rgba(139, 9, 9, ${0.03 * intensity})`);
  ctx.fillStyle = heartGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.55})`;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  // === LUNGS (3D with gradient fill) ===
  for (const side of [1, -1]) {
    ctx.beginPath();
    ctx.ellipse(cx + side * 0.058 * scale, cy - 0.41 * scale, 0.038 * scale, 0.08 * scale, 0, 0, Math.PI * 2);
    const lungGrad = ctx.createRadialGradient(
      cx + side * 0.05 * scale, cy - 0.43 * scale, 0,
      cx + side * 0.058 * scale, cy - 0.41 * scale, 0.08 * scale,
    );
    lungGrad.addColorStop(0, `rgba(160, 40, 40, ${0.10 * intensity})`);
    lungGrad.addColorStop(1, `rgba(139, 9, 9, ${0.02 * intensity})`);
    ctx.fillStyle = lungGrad;
    ctx.fill();
    ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.35})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // === BRAIN (3D with fill) ===
  ctx.beginPath();
  ctx.ellipse(cx, cy - 0.835 * scale, 0.052 * scale, 0.058 * scale, 0, 0, Math.PI * 2);
  const brainGrad = ctx.createRadialGradient(
    cx - 0.01 * scale, cy - 0.845 * scale, 0,
    cx, cy - 0.835 * scale, 0.058 * scale,
  );
  brainGrad.addColorStop(0, `rgba(170, 45, 45, ${0.10 * intensity})`);
  brainGrad.addColorStop(1, `rgba(139, 9, 9, ${0.02 * intensity})`);
  ctx.fillStyle = brainGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.40})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Brain hemisphere divider
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.89 * scale);
  ctx.lineTo(cx, cy - 0.78 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.25})`;
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // Brain folds (gyri hints)
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const foldY = cy + (-0.86 + i * 0.025) * scale;
      ctx.beginPath();
      ctx.arc(cx + side * 0.025 * scale, foldY, 0.018 * scale, side > 0 ? 0.2 : Math.PI + 0.2, side > 0 ? Math.PI - 0.2 : -0.2);
      ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.15})`;
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }
  }

  // === PELVIS (3D) ===
  ctx.beginPath();
  ctx.ellipse(cx, cy + 0.11 * scale, 0.09 * scale, 0.04 * scale, 0, 0, Math.PI);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.35})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();
  // Iliac wings
  ctx.beginPath();
  ctx.moveTo(cx - 0.09 * scale, cy + 0.11 * scale);
  ctx.quadraticCurveTo(cx - 0.12 * scale, cy + 0.08 * scale, cx - 0.11 * scale, cy + 0.04 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.2})`;
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 0.09 * scale, cy + 0.11 * scale);
  ctx.quadraticCurveTo(cx + 0.12 * scale, cy + 0.08 * scale, cx + 0.11 * scale, cy + 0.04 * scale);
  ctx.stroke();

  // === JOINTS (3D with filled circles + ring) ===
  const joints: [number, number][] = [
    [0.23, -0.575], [-0.23, -0.575],
    [0.28, -0.335], [-0.28, -0.335],
    [0.14, 0.12], [-0.14, 0.12],
    [0.14, 0.56], [-0.14, 0.56],
    [0.08, 0.92], [-0.08, 0.92],
  ];

  for (const [jx, jy] of joints) {
    const jcx = cx + jx * scale;
    const jcy = cy + jy * scale;
    const jr = 0.015 * scale;

    // Joint fill (3D sphere illusion)
    const jGrad = ctx.createRadialGradient(jcx - jr * 0.3, jcy - jr * 0.3, 0, jcx, jcy, jr);
    jGrad.addColorStop(0, `rgba(180, 50, 50, ${0.18 * intensity})`);
    jGrad.addColorStop(1, `rgba(139, 9, 9, ${0.04 * intensity})`);
    ctx.fillStyle = jGrad;
    ctx.beginPath();
    ctx.arc(jcx, jcy, jr, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.50})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // === COLLAR BONES ===
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.60 * scale);
  ctx.quadraticCurveTo(cx + 0.08 * scale, cy - 0.61 * scale, cx + 0.18 * scale, cy - 0.58 * scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${a * 0.25})`;
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.60 * scale);
  ctx.quadraticCurveTo(cx - 0.08 * scale, cy - 0.61 * scale, cx - 0.18 * scale, cy - 0.58 * scale);
  ctx.stroke();

  // === OVERALL AMBIENT GLOW ===
  const bodyGlow = ctx.createRadialGradient(cx - scale * 0.05, cy - scale * 0.15, 0, cx, cy, scale * 0.55);
  bodyGlow.addColorStop(0, `rgba(139, 9, 9, ${0.05 * intensity})`);
  bodyGlow.addColorStop(0.5, `rgba(139, 9, 9, ${0.02 * intensity})`);
  bodyGlow.addColorStop(1, "rgba(139, 9, 9, 0)");
  ctx.fillStyle = bodyGlow;
  ctx.beginPath();
  ctx.arc(cx, cy - scale * 0.1, scale * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — SYMPTOM HIGHLIGHTING
   ═══════════════════════════════════════════════════════════════ */

function drawSymptoms(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  activationProgress: number,
  intensity: number,
  time: number,
) {
  for (let i = 0; i < SYMPTOMS.length; i++) {
    const sym = SYMPTOMS[i];
    const appear = clamp(remap(activationProgress, i * 0.08, i * 0.08 + 0.3, 0, 1));
    if (appear < 0.01) continue;

    const sx = cx + sym.x * scale;
    const sy = cy + sym.y * scale;
    const pulse = Math.sin(time * 2.5 + sym.phase) * 0.2 + 0.8;
    const r = 4 * appear;

    // Outer glow
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 6);
    grad.addColorStop(0, `rgba(160, 50, 50, ${0.2 * appear * intensity * pulse})`);
    grad.addColorStop(0.5, `rgba(160, 50, 50, ${0.05 * appear * intensity})`);
    grad.addColorStop(1, "rgba(160, 50, 50, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 6, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = `rgba(180, 60, 60, ${0.85 * appear * intensity})`;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Ring
    ctx.strokeStyle = `rgba(160, 50, 50, ${0.3 * appear * intensity * pulse})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // Label
    if (appear > 0.6) {
      const la = (appear - 0.6) / 0.4;
      ctx.font = "8px monospace";
      ctx.fillStyle = `rgba(180, 60, 60, ${0.5 * la * intensity})`;
      ctx.textAlign = sym.x < 0 ? "right" : "left";
      const labelX = sx + (sym.x < 0 ? -12 : 12);
      ctx.fillText(sym.label, labelX, sy + 3);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — DATA FLOW LINES (Symptom → Network input)
   ═══════════════════════════════════════════════════════════════ */

function drawDataFlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  cy: number,
  scale: number,
  flowProgress: number,
  time: number,
) {
  if (flowProgress < 0.01) return;

  const netInputX = NETWORK_LAYERS[0].x * w;

  for (let i = 0; i < SYMPTOMS.length; i++) {
    const sym = SYMPTOMS[i];
    const sx = cx + sym.x * scale;
    const sy = cy + sym.y * scale;

    // Target Y on network input layer
    const layerH = h * 0.6;
    const startY = (h - layerH) / 2;
    const spacing = layerH / (NETWORK_LAYERS[0].count - 1);
    const ty = startY + i * spacing;

    // Curved connection
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    const cpx = lerp(sx, netInputX, 0.6);
    ctx.quadraticCurveTo(cpx, sy, netInputX, ty);
    ctx.strokeStyle = `rgba(160, 50, 50, ${0.06 * flowProgress})`;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Traveling data particle
    const t = ((time * 0.4 + i * 0.12) % 1);
    const lineT = t * flowProgress;
    // Simple lerp along the line
    const px = lerp(sx, netInputX, lineT);
    const py = lerp(sy, ty, lineT);

    const dotGrad = ctx.createRadialGradient(px, py, 0, px, py, 4);
    dotGrad.addColorStop(0, `rgba(160, 50, 50, ${0.7 * flowProgress})`);
    dotGrad.addColorStop(1, "rgba(160, 50, 50, 0)");
    ctx.fillStyle = dotGrad;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — NEURAL NETWORK
   ═══════════════════════════════════════════════════════════════ */

function drawNeuralNetwork(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  formProgress: number,
  activationProgress: number,
  intensity: number,
  time: number,
) {
  if (formProgress < 0.01) return;

  const layerH = h * 0.6;
  const startY = (h - layerH) / 2;

  // Get neuron positions
  const positions: { x: number; y: number }[][] = [];

  for (const layer of NETWORK_LAYERS) {
    const neurons: { x: number; y: number }[] = [];
    const spacing = layer.count > 1 ? layerH / (layer.count - 1) : 0;
    const offsetY = layer.count > 1 ? 0 : layerH / 2;

    for (let j = 0; j < layer.count; j++) {
      neurons.push({
        x: layer.x * w,
        y: startY + j * spacing + offsetY,
      });
    }
    positions.push(neurons);
  }

  // Draw connections between layers
  for (let l = 0; l < positions.length - 1; l++) {
    const layerAppear = clamp(remap(formProgress, l * 0.15, l * 0.15 + 0.4, 0, 1));
    if (layerAppear < 0.01) continue;

    for (const from of positions[l]) {
      for (const to of positions[l + 1]) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);

        const active = activationProgress > 0
          ? Math.sin(time * 1.5 + from.y * 0.01 + to.y * 0.01) * 0.15 + 0.85
          : 1;

        ctx.strokeStyle = `rgba(139, 9, 9, ${0.04 * layerAppear * intensity * active})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }
  }

  // Draw neurons
  for (let l = 0; l < positions.length; l++) {
    const layerAppear = clamp(remap(formProgress, l * 0.12, l * 0.12 + 0.35, 0, 1));
    if (layerAppear < 0.01) continue;

    for (let n = 0; n < positions[l].length; n++) {
      const neuron = positions[l][n];
      const pulse = Math.sin(time * 2 + l * 0.8 + n * 0.5) * 0.15 + 0.85;
      const r = (l === positions.length - 1 ? 8 : 4) * layerAppear;

      // Activation glow
      const activation = clamp(remap(activationProgress, l * 0.15, l * 0.15 + 0.5, 0, 1));

      const glowR = r * 3;
      const grad = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, glowR);
      const alpha = (l === positions.length - 1 ? 0.25 : 0.1) * activation * pulse;
      grad.addColorStop(0, `rgba(139, 9, 9, ${alpha * intensity})`);
      grad.addColorStop(1, "rgba(139, 9, 9, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(139, 9, 9, ${0.3 * layerAppear * intensity * pulse})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.fillStyle = `rgba(139, 9, 9, ${0.06 * layerAppear * intensity})`;
      ctx.fill();
    }
  }

  // Output label
  if (positions.length > 0 && activationProgress > 0.6) {
    const outputNode = positions[positions.length - 1][0];
    const la = clamp((activationProgress - 0.6) / 0.4);

    ctx.textAlign = "center";
    ctx.font = "700 10px monospace";
    ctx.fillStyle = `rgba(139, 9, 9, ${0.7 * la * intensity})`;
    ctx.fillText("DIAGNOSIS", outputNode.x, outputNode.y - 18);

    ctx.font = "8px monospace";
    ctx.fillStyle = `rgba(139, 9, 9, ${0.4 * la * intensity})`;
    ctx.fillText("PREDICTION OUTPUT", outputNode.x, outputNode.y + 22);
  }
}

/* ═══════════════════════════════════════════════════════════════
   DRAW — VIGNETTE & HUD
   ═══════════════════════════════════════════════════════════════ */

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
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

function drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const a = 0.08;
  const bSize = 18;
  ctx.strokeStyle = `rgba(160, 50, 50, ${a})`;
  ctx.lineWidth = 0.5;

  ctx.beginPath(); ctx.moveTo(14, 14 + bSize); ctx.lineTo(14, 14); ctx.lineTo(14 + bSize, 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 14 - bSize, 14); ctx.lineTo(w - 14, 14); ctx.lineTo(w - 14, 14 + bSize); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, h - 14 - bSize); ctx.lineTo(14, h - 14); ctx.lineTo(14 + bSize, h - 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 14 - bSize, h - 14); ctx.lineTo(w - 14, h - 14); ctx.lineTo(w - 14, h - 14 - bSize); ctx.stroke();
}

/* ═══════════════════════════════════════════════════════════════
   MAIN RENDER
   ═══════════════════════════════════════════════════════════════ */

function renderFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
  time: number,
) {
  ctx.fillStyle = "#EDD9CC";
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.3; // Body is on the left side
  const cy = h * 0.5;
  const scale = Math.min(w, h) * 0.4;

  // Phase timeline
  const bodyI = clamp(remap(progress, 0.0, 0.15, 0, 1));
  const symptomsP = clamp(remap(progress, 0.08, 0.45, 0, 1));
  const dataFlowP = clamp(remap(progress, 0.35, 0.6, 0, 1));
  const networkFormP = clamp(remap(progress, 0.25, 0.65, 0, 1));
  const networkActivP = clamp(remap(progress, 0.5, 0.85, 0, 1));
  const fadeOut = clamp(remap(progress, 0.9, 1.0, 1, 0));

  ctx.globalAlpha = fadeOut;

  drawBody(ctx, cx, cy, scale, bodyI);
  drawSymptoms(ctx, cx, cy, scale, symptomsP, 1, time);
  drawDataFlow(ctx, w, h, cx, cy, scale, dataFlowP, time);
  drawNeuralNetwork(ctx, w, h, networkFormP, networkActivP, 1, time);

  ctx.globalAlpha = 1;

  drawVignette(ctx, w, h);
  drawHUD(ctx, w, h);
}

/* ═══════════════════════════════════════════════════════════════
   REACT COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SymptomAnalysisCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const beatAOpacity = useTransform(smoothProgress, [0.0, 0.06, 0.2, 0.32], [0, 1, 1, 0]);
  const beatBOpacity = useTransform(smoothProgress, [0.3, 0.38, 0.55, 0.67], [0, 1, 1, 0]);
  const beatCOpacity = useTransform(smoothProgress, [0.62, 0.7, 0.82, 0.93], [0, 1, 1, 0]);

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

    let rafId: number;

    const animate = (timestamp: number) => {
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
          {/* Beat A — Symptom Input */}
          <motion.div
            style={{ opacity: beatAOpacity }}
            className="absolute right-5 sm:right-8 md:right-16 lg:right-24
                       bottom-20 sm:bottom-24
                       md:bottom-auto md:top-[18%]
                       text-right"
          >
            <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
              01 — SYMPTOMS
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
              DESCRIBE
              <br />
              YOUR <span className="text-clinical-primary">SYMPTOMS</span>
            </h2>
            <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed ml-auto">
              Input your symptoms and let our ML model map them across the body.
            </p>
          </motion.div>

          {/* Beat B — Analysis */}
          <motion.div
            style={{ opacity: beatBOpacity }}
            className="absolute right-5 sm:right-8 md:right-16 lg:right-24
                       bottom-20 sm:bottom-24
                       md:bottom-auto md:top-[18%]
                       text-right"
          >
            <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
              02 — NEURAL PROCESSING
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
              ML-POWERED
              <br />
              <span className="text-clinical-primary">ANALYSIS</span>
            </h2>
            <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed ml-auto">
              Data flows through our trained neural network for pattern matching.
            </p>
          </motion.div>

          {/* Beat C — Prediction */}
          <motion.div
            style={{ opacity: beatCOpacity }}
            className="absolute right-5 sm:right-8 md:right-16 lg:right-24
                       bottom-20 sm:bottom-24
                       md:bottom-auto md:top-[18%]
                       text-right"
          >
            <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
              03 — PREDICTION
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
              DISEASE
              <br />
              <span className="text-clinical-primary">PREDICTION</span>
            </h2>
            <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed ml-auto">
              Receive an AI-generated preliminary diagnosis to guide your next steps.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

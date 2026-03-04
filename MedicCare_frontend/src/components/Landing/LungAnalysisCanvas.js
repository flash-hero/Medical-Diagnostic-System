import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import HeartbeatLoader from "./HeartbeatLoader";

/* ═══════════════════════════════════════════════════════════════
   MATH UTILITIES
   ═══════════════════════════════════════════════════════════════ */

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function remap(
  v,
  inMin,
  inMax,
  outMin = 0,
  outMax = 1,
) {
  return outMin + (outMax - outMin) * clamp((v - inMin) / (inMax - inMin));
}

/* ═══════════════════════════════════════════════════════════════
   ANATOMY DATA — Normalized coordinates (-1 → 1)
   ═══════════════════════════════════════════════════════════════ */

const ANATOMY = {
  torso: [
    [0, -0.92],
    [-0.1, -0.86],
    [-0.22, -0.8],
    [-0.38, -0.72],
    [-0.46, -0.6],
    [-0.48, -0.45],
    [-0.45, -0.25],
    [-0.4, -0.05],
    [-0.36, 0.1],
    [-0.33, 0.22],
    [-0.35, 0.35],
    [-0.32, 0.46],
    [-0.25, 0.52],
    [0.25, 0.52],
    [0.32, 0.46],
    [0.35, 0.35],
    [0.33, 0.22],
    [0.36, 0.1],
    [0.4, -0.05],
    [0.45, -0.25],
    [0.48, -0.45],
    [0.46, -0.6],
    [0.38, -0.72],
    [0.22, -0.8],
    [0.1, -0.86],
    [0, -0.92],
  ],

  leftLung: [
    [-0.06, -0.6],
    [-0.12, -0.62],
    [-0.2, -0.58],
    [-0.27, -0.5],
    [-0.31, -0.38],
    [-0.33, -0.22],
    [-0.32, -0.06],
    [-0.28, 0.06],
    [-0.2, 0.12],
    [-0.12, 0.08],
    [-0.07, -0.0],
    [-0.06, -0.18],
    [-0.06, -0.38],
  ],

  rightLung: [
    [0.06, -0.6],
    [0.12, -0.62],
    [0.2, -0.58],
    [0.27, -0.5],
    [0.31, -0.38],
    [0.33, -0.22],
    [0.32, -0.06],
    [0.28, 0.06],
    [0.2, 0.12],
    [0.12, 0.08],
    [0.07, -0.0],
    [0.06, -0.18],
    [0.06, -0.38],
  ],

  ribs: [
    { y: -0.52, xL: -0.34, xR: 0.34, curve: 0.035 },
    { y: -0.44, xL: -0.37, xR: 0.37, curve: 0.045 },
    { y: -0.36, xL: -0.39, xR: 0.39, curve: 0.055 },
    { y: -0.28, xL: -0.38, xR: 0.38, curve: 0.06 },
    { y: -0.2, xL: -0.36, xR: 0.36, curve: 0.055 },
    { y: -0.12, xL: -0.33, xR: 0.33, curve: 0.05 },
    { y: -0.04, xL: -0.29, xR: 0.29, curve: 0.04 },
  ],

  nodule: [-0.2, -0.2],
};

/* ═══════════════════════════════════════════════════════════════
   DRAWING HELPERS
   ═══════════════════════════════════════════════════════════════ */

function drawSmoothPath(
  ctx,
  points,
  cx,
  cy,
  scale,
  close = true,
) {
  if (points.length < 3) return;
  ctx.beginPath();

  const sx = (p) => cx + p[0] * scale;
  const sy = (p) => cy + p[1] * scale;

  ctx.moveTo(sx(points[0]), sy(points[0]));

  for (let i = 0; i < points.length - 1; i++) {
    const cur = points[i];
    const nxt = points[i + 1];
    const mx = (sx(cur) + sx(nxt)) / 2;
    const my = (sy(cur) + sy(nxt)) / 2;
    ctx.quadraticCurveTo(sx(cur), sy(cur), mx, my);
  }

  if (close) {
    const last = points[points.length - 1];
    const first = points[0];
    const mx = (sx(last) + sx(first)) / 2;
    const my = (sy(last) + sy(first)) / 2;
    ctx.quadraticCurveTo(sx(last), sy(last), mx, my);
    ctx.closePath();
  }
}

/* ═══════════════════════════════════════════════════════════════
   PHASE A — GLASS ANATOMY
   ═══════════════════════════════════════════════════════════════ */

function drawGlassAnatomy(
  ctx,
  w,
  h,
  cx,
  cy,
  scale,
  intensity,
  time,
) {
  const breathe = Math.sin(time * 1.2) * 0.006 + 1;
  const s = scale * breathe;

  // Torso interior glow
  drawSmoothPath(ctx, ANATOMY.torso, cx, cy, s);
  const bodyGrad = ctx.createRadialGradient(
    cx,
    cy - s * 0.2,
    0,
    cx,
    cy,
    s * 0.75,
  );
  bodyGrad.addColorStop(0, `rgba(139, 9, 9, ${0.05 * intensity})`);
  bodyGrad.addColorStop(0.6, `rgba(139, 9, 9, ${0.02 * intensity})`);
  bodyGrad.addColorStop(1, `rgba(139, 9, 9, 0)`);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Torso outline
  drawSmoothPath(ctx, ANATOMY.torso, cx, cy, s);
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.22 * intensity})`;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Inner edge highlight (glass rim)
  drawSmoothPath(ctx, ANATOMY.torso, cx, cy, s * 0.97);
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.06 * intensity})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Ribs
  ctx.lineWidth = 0.7;
  for (const rib of ANATOMY.ribs) {
    const ry = cy + rib.y * s;
    const rxL = cx + rib.xL * s;
    const rxR = cx + rib.xR * s;
    const curveAmt = rib.curve * s;

    ctx.strokeStyle = `rgba(139, 9, 9, ${0.1 * intensity})`;
    ctx.beginPath();
    ctx.moveTo(rxL, ry);
    ctx.quadraticCurveTo(cx, ry + curveAmt, rxR, ry);
    ctx.stroke();
  }

  // Spine
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.65 * s);
  ctx.lineTo(cx, cy + 0.48 * s);
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.06 * intensity})`;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Lungs
  const lungGlow = ctx.createRadialGradient(
    cx,
    cy - s * 0.28,
    0,
    cx,
    cy - s * 0.1,
    s * 0.4,
  );
  lungGlow.addColorStop(0, `rgba(139, 9, 9, ${0.1 * intensity})`);
  lungGlow.addColorStop(1, `rgba(139, 9, 9, ${0.02 * intensity})`);

  for (const lung of [ANATOMY.leftLung, ANATOMY.rightLung]) {
    drawSmoothPath(ctx, lung, cx, cy, s);
    ctx.fillStyle = lungGlow;
    ctx.fill();
    ctx.strokeStyle = `rgba(139, 9, 9, ${0.28 * intensity})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Bronchial tree hint
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.08 * intensity})`;
  ctx.lineWidth = 0.6;

  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.6 * s);
  ctx.lineTo(cx - 0.04 * s, cy - 0.45 * s);
  ctx.lineTo(cx - 0.14 * s, cy - 0.3 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.6 * s);
  ctx.lineTo(cx + 0.04 * s, cy - 0.45 * s);
  ctx.lineTo(cx + 0.14 * s, cy - 0.3 * s);
  ctx.stroke();
}

/* ═══════════════════════════════════════════════════════════════
   PHASE B — WIREFRAME
   ═══════════════════════════════════════════════════════════════ */

function drawWireframe(
  ctx,
  w,
  h,
  cx,
  cy,
  scale,
  intensity,
  time,
) {
  const gridSpacing = 14;

  ctx.save();

  // Clip to torso shape
  drawSmoothPath(ctx, ANATOMY.torso, cx, cy, scale);
  ctx.clip();

  // Grid lines
  const linesH = Math.ceil((scale * 2) / gridSpacing);
  const linesV = Math.ceil((scale * 1.2) / gridSpacing);

  ctx.strokeStyle = `rgba(139, 9, 9, ${0.12 * intensity})`;
  ctx.lineWidth = 0.4;

  for (let i = -linesH; i <= linesH; i++) {
    const y = cy + i * gridSpacing;
    ctx.beginPath();
    ctx.moveTo(cx - scale * 0.6, y);
    ctx.lineTo(cx + scale * 0.6, y);
    ctx.stroke();
  }

  for (let i = -linesV; i <= linesV; i++) {
    const x = cx + i * gridSpacing;
    ctx.beginPath();
    ctx.moveTo(x, cy - scale);
    ctx.lineTo(x, cy + scale * 0.6);
    ctx.stroke();
  }

  // Sweeping scan line
  const scanY = cy + Math.sin(time * 1.8) * scale * 0.45;
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.5 * intensity})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - scale * 0.55, scanY);
  ctx.lineTo(cx + scale * 0.55, scanY);
  ctx.stroke();

  // Scan line glow band
  const scanGrad = ctx.createLinearGradient(cx, scanY - 25, cx, scanY + 25);
  scanGrad.addColorStop(0, "rgba(139, 9, 9, 0)");
  scanGrad.addColorStop(0.5, `rgba(139, 9, 9, ${0.06 * intensity})`);
  scanGrad.addColorStop(1, "rgba(139, 9, 9, 0)");
  ctx.fillStyle = scanGrad;
  ctx.fillRect(cx - scale * 0.55, scanY - 25, scale * 1.1, 50);

  ctx.restore();

  // Dashed outline
  drawSmoothPath(ctx, ANATOMY.torso, cx, cy, scale);
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.25 * intensity})`;
  ctx.lineWidth = 0.8;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Data nodes along outline
  ctx.fillStyle = `rgba(139, 9, 9, ${0.55 * intensity})`;
  for (let i = 0; i < ANATOMY.torso.length; i += 2) {
    const p = ANATOMY.torso[i];
    ctx.beginPath();
    ctx.arc(cx + p[0] * scale, cy + p[1] * scale, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lung wireframe outlines
  for (const lung of [ANATOMY.leftLung, ANATOMY.rightLung]) {
    drawSmoothPath(ctx, lung, cx, cy, scale);
    ctx.strokeStyle = `rgba(139, 9, 9, ${0.35 * intensity})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PHASE C — VOXEL DEEP SCAN
   ═══════════════════════════════════════════════════════════════ */

function drawVoxelLungs(
  ctx,
  cx,
  cy,
  scale,
  intensity,
  time,
) {
  const voxelSize = 4;
  const gap = 1.5;
  const step = voxelSize + gap;

  const lungs = [
    { data: ANATOMY.leftLung, center: [-0.19, -0.24] },
    { data: ANATOMY.rightLung, center: [0.19, -0.24] },
  ];

  for (const lung of lungs) {
    // Calculate bounding box
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of lung.data) {
      const px = cx + p[0] * scale;
      const py = cy + p[1] * scale;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }

    // Expand slightly
    minX -= 4;
    minY -= 4;
    maxX += 4;
    maxY += 4;

    const lcx = cx + lung.center[0] * scale;
    const lcy = cy + lung.center[1] * scale;
    const lungRadius = scale * 0.2;

    for (let x = minX; x < maxX; x += step) {
      for (let y = minY; y < maxY; y += step) {
        const dx = x - lcx;
        const dy = y - lcy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < lungRadius) {
          const edgeFade = 1 - dist / lungRadius;
          const noise =
            Math.sin(x * 0.08 + time * 0.5) *
              Math.cos(y * 0.1 + time * 0.3) *
              0.25 +
            0.75;
          const alpha = edgeFade * noise * intensity * 0.65;

          if (alpha < 0.02) continue;

          const r = Math.round(lerp(139, 180, edgeFade));
          const g = Math.round(lerp(9, 40, edgeFade * noise));
          const b = Math.round(lerp(9, 40, edgeFade));

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillRect(x, y, voxelSize, voxelSize);
        }
      }
    }

    // Lung outline glow
    drawSmoothPath(ctx, lung.data, cx, cy, scale);
    ctx.strokeStyle = `rgba(139, 9, 9, ${0.15 * intensity})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
}

/* ═══════════════════════════════════════════════════════════════
   PHASE C+ — NODULE DETECTION
   ═══════════════════════════════════════════════════════════════ */

function drawNoduleDetection(
  ctx,
  cx,
  cy,
  scale,
  intensity,
  time,
) {
  const nx = cx + ANATOMY.nodule[0] * scale;
  const ny = cy + ANATOMY.nodule[1] * scale;
  const pulse = (Math.sin(time * 3.5) + 1) / 2;
  const baseR = 6 + pulse * 3;

  // Outer warning glow
  const outerGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, baseR * 5);
  outerGlow.addColorStop(0, `rgba(255, 77, 77, ${0.25 * intensity})`);
  outerGlow.addColorStop(0.4, `rgba(255, 77, 77, ${0.08 * intensity})`);
  outerGlow.addColorStop(1, "rgba(255, 77, 77, 0)");
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(nx, ny, baseR * 5, 0, Math.PI * 2);
  ctx.fill();

  // Core nodule
  const coreGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, baseR);
  coreGrad.addColorStop(0, `rgba(255, 140, 140, ${0.95 * intensity})`);
  coreGrad.addColorStop(0.6, `rgba(255, 77, 77, ${0.7 * intensity})`);
  coreGrad.addColorStop(1, `rgba(255, 50, 50, ${0.15 * intensity})`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(nx, ny, baseR, 0, Math.PI * 2);
  ctx.fill();

  // Concentric detection rings
  for (let i = 1; i <= 3; i++) {
    const ringR = baseR + i * 18 + pulse * 4;
    const alpha = (1 - i / 4) * intensity * 0.25;
    ctx.strokeStyle = `rgba(255, 77, 77, ${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(nx, ny, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Targeting crosshair
  const armLen = 40 * intensity;
  ctx.strokeStyle = `rgba(255, 77, 77, ${0.45 * intensity})`;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([3, 4]);

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dx, dy] of dirs) {
    ctx.beginPath();
    ctx.moveTo(nx + dx * (baseR + 6), ny + dy * (baseR + 6));
    ctx.lineTo(nx + dx * armLen, ny + dy * armLen);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Label
  if (intensity > 0.5) {
    const labelAlpha = (intensity - 0.5) * 2;
    ctx.font = "700 9px monospace";
    ctx.fillStyle = `rgba(255, 77, 77, ${0.7 * labelAlpha})`;
    ctx.textAlign = "center";
    ctx.fillText("ANOMALY DETECTED", nx, ny - baseR * 5 - 8);

    ctx.font = "8px monospace";
    ctx.fillStyle = `rgba(255, 77, 77, ${0.4 * labelAlpha})`;
    ctx.fillText(`CONF: 99.8%`, nx, ny - baseR * 5 + 4);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PHASE D — SHIELD FORMATION
   ═══════════════════════════════════════════════════════════════ */

function drawShield(
  ctx,
  cx,
  cy,
  scale,
  formation,
  time,
) {
  const nx = cx + ANATOMY.nodule[0] * scale;
  const ny = cy + ANATOMY.nodule[1] * scale;
  const maxRadius = 55;
  const radius = maxRadius * formation;

  ctx.save();

  // Hex grid
  const hexSize = 7;
  const numRings = Math.ceil(radius / (hexSize * 1.6));

  for (let ring = 1; ring <= numRings; ring++) {
    const ringR = ring * hexSize * 1.6;
    if (ringR > radius) break;
    const count = Math.max(6, ring * 6);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + time * 0.15;
      const hx = nx + Math.cos(angle) * ringR;
      const hy = ny + Math.sin(angle) * ringR;
      const fade = clamp(1 - ringR / radius);

      ctx.strokeStyle = `rgba(139, 9, 9, ${fade * 0.3 * formation})`;
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      for (let j = 0; j <= 6; j++) {
        const a = (j / 6) * Math.PI * 2;
        const px = hx + Math.cos(a) * hexSize * 0.35;
        const py = hy + Math.sin(a) * hexSize * 0.35;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Shield perimeter
  ctx.strokeStyle = `rgba(139, 9, 9, ${0.25 * formation})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(nx, ny, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner shield glow
  const shieldGlow = ctx.createRadialGradient(
    nx,
    ny,
    radius * 0.3,
    nx,
    ny,
    radius,
  );
  shieldGlow.addColorStop(0, `rgba(139, 9, 9, ${0.03 * formation})`);
  shieldGlow.addColorStop(1, "rgba(139, 9, 9, 0)");
  ctx.fillStyle = shieldGlow;
  ctx.beginPath();
  ctx.arc(nx, ny, radius, 0, Math.PI * 2);
  ctx.fill();

  // Status label
  if (formation > 0.6) {
    const labelAlpha = clamp((formation - 0.6) * 2.5);
    ctx.font = "700 9px monospace";
    ctx.fillStyle = `rgba(139, 9, 9, ${0.65 * labelAlpha})`;
    ctx.textAlign = "center";
    ctx.fillText("PROTECTED", nx, ny + radius + 16);

    ctx.font = "8px monospace";
    ctx.fillStyle = `rgba(139, 9, 9, ${0.35 * labelAlpha})`;
    ctx.fillText("PATHWAY GENERATED", nx, ny + radius + 28);
  }

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════
   POST-PROCESSING — VIGNETTE & HUD
   ═══════════════════════════════════════════════════════════════ */

function drawVignette(ctx, w, h) {
  const gradient = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.18,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.72,
  );
  gradient.addColorStop(0, "rgba(237, 217, 204, 0)");
  gradient.addColorStop(0.55, "rgba(237, 217, 204, 0.15)");
  gradient.addColorStop(0.8, "rgba(237, 217, 204, 0.65)");
  gradient.addColorStop(1, "rgba(237, 217, 204, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function drawHUD(
  ctx,
  w,
  h,
) {
  const a = 0.08;
  const bSize = 18;
  ctx.strokeStyle = `rgba(139, 9, 9, ${a})`;
  ctx.lineWidth = 0.5;

  // Corner brackets only — clean medical aesthetic
  ctx.beginPath(); ctx.moveTo(14, 14 + bSize); ctx.lineTo(14, 14); ctx.lineTo(14 + bSize, 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 14 - bSize, 14); ctx.lineTo(w - 14, 14); ctx.lineTo(w - 14, 14 + bSize); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, h - 14 - bSize); ctx.lineTo(14, h - 14); ctx.lineTo(14 + bSize, h - 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 14 - bSize, h - 14); ctx.lineTo(w - 14, h - 14); ctx.lineTo(w - 14, h - 14 - bSize); ctx.stroke();
}

/* ═══════════════════════════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════════════════════════ */

function updateAndDrawParticles(
  ctx,
  particles,
  w,
  h,
  dt,
  progress,
) {
  // Increase particle visibility during wireframe phase
  const particleBoost = remap(progress, 0.15, 0.35, 0.3, 1) * remap(progress, 0.55, 0.7, 1, 0.3);

  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;

    if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.vx = (Math.random() - 0.5) * 12;
      p.vy = (Math.random() - 0.5) * 12;
      p.life = p.maxLife;
    }

    const alpha = (p.life / p.maxLife) * 0.25 * particleBoost;
    if (alpha < 0.01) continue;
    ctx.fillStyle = `rgba(139, 9, 9, ${alpha})`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
}

/* ═══════════════════════════════════════════════════════════════
   MAIN RENDER ORCHESTRATOR
   ═══════════════════════════════════════════════════════════════ */

function renderFrame(
  ctx,
  w,
  h,
  progress,
  time,
  particles,
  dt,
) {
  // Clear
  ctx.fillStyle = "#EDD9CC";
  ctx.fillRect(0, 0, w, h);

  // Phase intensities — smooth cross-fades
  const glassI =
    clamp(remap(progress, 0, 0.05, 0, 1)) *
    clamp(remap(progress, 0.18, 0.3, 1, 0));
  const wireI =
    clamp(remap(progress, 0.14, 0.27, 0, 1)) *
    clamp(remap(progress, 0.48, 0.56, 1, 0));
  const voxelI =
    clamp(remap(progress, 0.4, 0.54, 0, 1)) *
    clamp(remap(progress, 0.88, 0.96, 1, 0));
  const noduleI =
    clamp(remap(progress, 0.48, 0.58, 0, 1)) *
    clamp(remap(progress, 0.88, 0.96, 1, 0.2));
  const shieldF = clamp(remap(progress, 0.68, 0.84, 0, 1));

  // Camera
  const zoomIn = lerp(1, 2.1, clamp(remap(progress, 0.32, 0.58, 0, 1)));
  const zoomOut = clamp(remap(progress, 0.74, 0.92, 0, 1));
  const zoom = zoomIn - zoomOut * (zoomIn - 1.1);

  const panY =
    lerp(0, -0.13, clamp(remap(progress, 0.32, 0.58, 0, 1))) +
    lerp(0, 0.09, zoomOut);

  const baseScale = Math.min(w, h) * 0.42;
  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy + panY * h);

  // Render layers
  if (glassI > 0.005)
    drawGlassAnatomy(ctx, w, h, cx, cy, baseScale, glassI, time);
  if (wireI > 0.005)
    drawWireframe(ctx, w, h, cx, cy, baseScale, wireI, time);
  if (voxelI > 0.005) drawVoxelLungs(ctx, cx, cy, baseScale, voxelI, time);
  if (noduleI > 0.005)
    drawNoduleDetection(ctx, cx, cy, baseScale, noduleI, time);
  if (shieldF > 0.005) drawShield(ctx, cx, cy, baseScale, shieldF, time);

  ctx.restore();

  // Ambient particles
  updateAndDrawParticles(ctx, particles, w, h, dt, progress);

  // Post-processing
  drawVignette(ctx, w, h);
  drawHUD(ctx, w, h);
}

/* ═══════════════════════════════════════════════════════════════
   REACT COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LungAnalysisCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const progressRef = useRef(0);
  const prevTimeRef = useRef(0);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // ── Scroll tracking ────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // ── Text overlay opacities ─────────────────────────────────
  const beatAOpacity = useTransform(
    smoothProgress,
    [0.0, 0.04, 0.13, 0.21],
    [0, 1, 1, 0],
  );
  const beatBOpacity = useTransform(
    smoothProgress,
    [0.22, 0.27, 0.37, 0.46],
    [0, 1, 1, 0],
  );
  const beatCOpacity = useTransform(
    smoothProgress,
    [0.47, 0.52, 0.62, 0.71],
    [0, 1, 1, 0],
  );
  const beatDOpacity = useTransform(
    smoothProgress,
    [0.72, 0.77, 0.87, 0.96],
    [0, 1, 1, 0],
  );

  // ── Sync spring value to ref ───────────────────────────────
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      progressRef.current = v;
    });
    return unsubscribe;
  }, [smoothProgress]);

  // ── Initialize particles ───────────────────────────────────
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: Math.random() * 6 + 2,
        maxLife: Math.random() * 6 + 2,
        size: Math.random() * 1.5 + 0.5,
      });
    }
    particlesRef.current = particles;
  }, []);

  // ── Simulated loading ──────────────────────────────────────
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 0.06 + 0.02;
      if (progress >= 1) {
        progress = 1;
        setLoadProgress(1);
        setTimeout(() => setIsLoaded(true), 500);
        clearInterval(interval);
      } else {
        setLoadProgress(progress);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // ── Canvas render loop ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let rafId;

    const animate = (timestamp) => {
      const time = timestamp / 1000;
      const dt = prevTimeRef.current > 0 ? time - prevTimeRef.current : 0.016;
      prevTimeRef.current = time;

      // Handle DPR-aware sizing
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderFrame(
        ctx,
        rect.width,
        rect.height,
        progressRef.current,
        time,
        particlesRef.current,
        Math.min(dt, 0.05),
      );

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* Loading overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <HeartbeatLoader progress={loadProgress} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 400vh scroll container */}
      <div ref={containerRef} className="relative h-[400vh]">
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: "#EDD9CC" }}
          />

          {/* ── Text Overlays ─────────────────────── */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Beat A — Bio-Data Ingestion */}
            <motion.div
              style={{ opacity: beatAOpacity }}
              className="absolute left-5 sm:left-8 md:left-16 lg:left-24
                         bottom-20 sm:bottom-24
                         md:bottom-auto md:top-[28%]"
            >
              <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
                01 — INGESTION
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
                COMPLETE
                <br />
                BIO-DATA
                <br />
                <span className="text-clinical-primary">INGESTION</span>
              </h2>
              <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed">
                Creating a pixel-perfect digital twin for baseline analysis.
              </p>
            </motion.div>

            {/* Beat B — Pattern Recognition */}
            <motion.div
              style={{ opacity: beatBOpacity }}
              className="absolute right-5 sm:right-8 md:right-16 lg:right-24
                         bottom-20 sm:bottom-24
                         md:bottom-auto md:top-[28%]
                         text-right"
            >
              <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
                02 — PROCESSING
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
                PATTERN
                <br />
                <span className="text-clinical-primary">RECOGNITION</span>
              </h2>
              <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed ml-auto">
                Analyzing 50,000+ datapoints against global oncology datasets.
              </p>
            </motion.div>

            {/* Beat C — Anomaly Detection */}
            <motion.div
              style={{ opacity: beatCOpacity }}
              className="absolute left-5 sm:left-8 md:left-16 lg:left-24
                         bottom-20 sm:bottom-24
                         md:bottom-auto md:top-[28%]"
            >
              <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-red/60 font-mono mb-3">
                03 — DETECTION
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
                ANOMALY
                <br />
                <span className="text-clinical-red">DETECTION</span>
              </h2>
              <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed">
                Deep Learning identifies early-stage irregularities with 99.8%
                accuracy.
              </p>
            </motion.div>

            {/* Beat D — Predictive Pathway */}
            <motion.div
              style={{ opacity: beatDOpacity }}
              className="absolute right-5 sm:right-8 md:right-16 lg:right-24
                         bottom-20 sm:bottom-24
                         md:bottom-auto md:top-[28%]
                         text-right"
            >
              <div className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/60 font-mono mb-3">
                04 — RESOLUTION
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85]">
                PREDICTIVE
                <br />
                <span className="text-clinical-primary">PATHWAY</span>
              </h2>
              <p className="text-[#6B5040] mt-3 sm:mt-4 max-w-[260px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-sm leading-relaxed ml-auto">
                Automated treatment roadmap generation.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

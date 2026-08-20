import { useEffect, useRef, useCallback } from "react";
import "./LogoRevealOverlay.css";
const Logo = "/image/logo2.jpeg";
const NODE_COUNT = 20;
const PALETTE = ["#7F77DD", "#D4537E", "#E8B84B", "#F14FA0", "#AFA9EC"];
const NETWORK_END = 2000;
const CONVERGE_END = 3150;
const BURST_TIMES = [3150, 3450];
const AUTO_CLOSE_AFTER = 6200;
const CX = 320;
const CY = 320;

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const LogoRevealOverlay = ({ visible, onClose }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const particlesRef = useRef([]);
  const burstsFiredRef = useRef([]);
  const closeTimerRef = useRef(null);

  const makeNodes = useCallback(() => {
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      let x, y, dist;
      do {
        x = 60 + Math.random() * 520;
        y = 60 + Math.random() * 520;
        dist = Math.hypot(x - CX, y - CY);
      } while (dist < 110);
      nodes.push({
        hx: x,
        hy: y,
        x,
        y,
        size: 7 + Math.random() * 3,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        phase: Math.random() * Math.PI * 2,
      });
    }
    const edges = [];
    const seen = new Set();
    nodes.forEach((n, i) => {
      const dists = nodes
        .map((m, j) => ({ j, d: Math.hypot(n.hx - m.hx, n.hy - m.hy) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      dists.forEach((o) => {
        const key = [i, o.j].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([i, o.j]);
        }
      });
    });
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    startTimeRef.current = null;
    burstsFiredRef.current = [];
    particlesRef.current = [];
    makeNodes();

    const drawWoman = (x, y, size, color, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.55, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - size * 0.05, y - size * 0.28);
      ctx.lineTo(x + size * 0.05, y - size * 0.28);
      ctx.lineTo(x + size * 0.5, y + size * 0.55);
      ctx.lineTo(x - size * 0.5, y + size * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const spawnBurst = (cx, cy, count) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 2 + Math.random() * 4,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          life: 1,
          decay: 0.007 + Math.random() * 0.01,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const draw = (now) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      if (elapsed < NETWORK_END) {
        const fadeIn = Math.min(elapsed / 500, 1);
        ctx.strokeStyle = `rgba(232,184,75,${0.35 * fadeIn})`;
        ctx.lineWidth = 0.7;
        edges.forEach(([i, j]) => {
          const a = nodes[i];
          const b = nodes[j];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
        nodes.forEach((n) => {
          n.x = n.hx + Math.sin(elapsed / 600 + n.phase) * 4;
          n.y = n.hy + Math.cos(elapsed / 700 + n.phase) * 4;
          drawWoman(n.x, n.y, n.size, n.color, fadeIn);
        });
      } else if (elapsed < CONVERGE_END) {
        const t = easeInOutCubic(
          (elapsed - NETWORK_END) / (CONVERGE_END - NETWORK_END)
        );
        ctx.strokeStyle = `rgba(232,184,75,${0.35 * (1 - t)})`;
        ctx.lineWidth = 0.7;
        edges.forEach(([i, j]) => {
          const a = nodes[i];
          const b = nodes[j];
          const ax = a.hx + (CX - a.hx) * t;
          const ay = a.hy + (CY - a.hy) * t;
          const bx = b.hx + (CX - b.hx) * t;
          const by = b.hy + (CY - b.hy) * t;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        });
        nodes.forEach((n) => {
          n.x = n.hx + (CX - n.hx) * t;
          n.y = n.hy + (CY - n.hy) * t;
          const s = n.size * (1 - t * 0.75);
          drawWoman(n.x, n.y, Math.max(s, 1), n.color, 1 - t * 0.2);
        });
      }

      BURST_TIMES.forEach((t, idx) => {
        if (elapsed >= t && !burstsFiredRef.current[idx]) {
          burstsFiredRef.current[idx] = true;
          spawnBurst(CX, CY, idx === 0 ? 70 : 50);
        }
      });

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.985;
        p.life -= p.decay;
        p.spin += p.spinSpeed;
        if (p.life > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin);
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = p.color;
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.6, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      if (elapsed < CONVERGE_END + 3000 || particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    closeTimerRef.current = setTimeout(() => onClose(), AUTO_CLOSE_AFTER);

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, makeNodes, onClose]);

  if (!visible) return null;

  return (
    <div
      className="nb-logo-overlay nb-visible"
      onClick={onClose}
      role="dialog"
      aria-label="NariBazar logo animation"
    >
      <canvas ref={canvasRef} width={640} height={640} />
      <div className="nb-flash nb-play" />
      <div className="nb-logo-wrap nb-play">
<div className="nb-logo-wrap nb-play">
  <img src={Logo} alt="NariBazar Logo" />
</div>


      </div>
      <div className="nb-close-hint">Click anywhere to close</div>
    </div>
  );
};

export default LogoRevealOverlay;

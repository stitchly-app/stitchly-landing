import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

export function Particles({
  className,
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const circlesRef = useRef<Circle[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(false);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const [rgb] = useState(() => hexToRgb(color));

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    ctxRef.current = canvasRef.current.getContext("2d");
    initCanvas();

    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !wasVisible) {
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);

    window.addEventListener("resize", initCanvas);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", initCanvas);
      window.removeEventListener("mousemove", onMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  useEffect(() => {
    initCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const onMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      mouse.current = { x, y };
    }
  };

  const initCanvas = () => {
    if (!canvasRef.current || !containerRef.current || !ctxRef.current) return;
    circlesRef.current = [];
    canvasSize.current.w = containerRef.current.offsetWidth;
    canvasSize.current.h = containerRef.current.offsetHeight;
    canvasRef.current.width = canvasSize.current.w * dpr;
    canvasRef.current.height = canvasSize.current.h * dpr;
    canvasRef.current.style.width = `${canvasSize.current.w}px`;
    canvasRef.current.style.height = `${canvasSize.current.h}px`;
    ctxRef.current.scale(dpr, dpr);
    for (let i = 0; i < quantity; i++) {
      circlesRef.current.push(circleParams());
    }
  };

  const circleParams = (): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const pSize = Math.floor(Math.random() * 2) + size;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    return {
      x,
      y,
      translateX: 0,
      translateY: 0,
      size: pSize,
      alpha: 0,
      targetAlpha,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      magnetism: 0.1 + Math.random() * 4,
    };
  };

  const drawCircle = (c: Circle, update = false) => {
    if (!ctxRef.current) return;
    const { x, y, translateX, translateY, size: s, alpha } = c;
    ctxRef.current.translate(translateX, translateY);
    ctxRef.current.beginPath();
    ctxRef.current.arc(x, y, s, 0, 2 * Math.PI);
    ctxRef.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
    ctxRef.current.fill();
    ctxRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!update) circlesRef.current.push(c);
  };

  const clearCanvas = () => {
    ctxRef.current?.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
  };

  const remap = (v: number, a: number, b: number, c: number, d: number) =>
    ((v - a) * (d - c)) / (b - a) + c;

  const animate = () => {
    if (!isVisibleRef.current) return;
    clearCanvas();
    circlesRef.current.forEach((c, i) => {
      const edge = [
        c.x + c.translateX - c.size,
        canvasSize.current.w - c.x - c.translateX - c.size,
        c.y + c.translateY - c.size,
        canvasSize.current.h - c.y - c.translateY - c.size,
      ];
      const closest = Math.min(...edge);
      const remapped = parseFloat(remap(closest, 0, 20, 0, 1).toFixed(2));
      if (remapped > 1) {
        c.alpha += 0.02;
        if (c.alpha > c.targetAlpha) c.alpha = c.targetAlpha;
      } else {
        c.alpha = c.targetAlpha * remapped;
      }
      c.x += c.dx + vx;
      c.y += c.dy + vy;
      // Repulsion from mouse
      const mx = mouse.current.x - c.x;
      const my = mouse.current.y - c.y;
      const dist = Math.sqrt(mx * mx + my * my);
      const repulseRadius = 120;
      if (dist < repulseRadius && dist > 0) {
        const force = (repulseRadius - dist) / repulseRadius;
        c.translateX += (-mx / dist) * force * c.magnetism / ease * 4;
        c.translateY += (-my / dist) * force * c.magnetism / ease * 4;
      } else {
        c.translateX += (0 - c.translateX) / ease;
        c.translateY += (0 - c.translateY) / ease;
      }
      drawCircle(c, true);
      if (
        c.x < -c.size ||
        c.x > canvasSize.current.w + c.size ||
        c.y < -c.size ||
        c.y > canvasSize.current.h + c.size
      ) {
        circlesRef.current.splice(i, 1);
        circlesRef.current.push(circleParams());
      }
    });
    void staticity;
    rafRef.current = window.requestAnimationFrame(animate);
  };

  return (
    <div ref={containerRef} className={cn("pointer-events-none", className)} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Particles;
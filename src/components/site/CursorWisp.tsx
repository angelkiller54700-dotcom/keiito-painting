"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
}

const HIDE_CLASS = "kp-cursor-hidden";

/**
 * Curseur violet façon feu follet : un cœur lumineux qui suit la souris avec
 * une traînée de brume qui se dissipe. Cache le curseur natif du système.
 * Désactivé sur écrans tactiles et si l'utilisateur préfère moins d'animations
 * (dans ce cas le curseur natif reste visible).
 */
export function CursorWisp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    document.documentElement.classList.add(HIDE_CLASS);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const mouse = { x: -1000, y: -1000, active: false };
    let particles: Particle[] = [];
    let lastSpawn = 0;
    let raf = 0;
    let last = performance.now();

    function onMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }
    function onOut(e: MouseEvent) {
      if (!e.relatedTarget) mouse.active = false;
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("mouseout", onOut);

    function spawn(t: number) {
      if (!mouse.active || t - lastSpawn < 20) return;
      lastSpawn = t;
      particles.push({
        x: mouse.x + (Math.random() - 0.5) * 4,
        y: mouse.y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.12 - Math.random() * 0.22,
        r: 5 + Math.random() * 5,
        life: 0,
        maxLife: 600 + Math.random() * 350,
      });
      if (particles.length > 80) particles.splice(0, particles.length - 80);
    }

    function loop(t: number) {
      const dt = Math.min(40, t - last);
      last = t;
      spawn(t);

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.globalCompositeOperation = "lighter";

      particles = particles.filter((p) => p.life < p.maxLife);
      for (const p of particles) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += dt * 0.01;
        const k = Math.max(0, 1 - p.life / p.maxLife);
        const alpha = k * 0.45;
        const rad = p.r * 2.3;
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        grad.addColorStop(0, `rgba(221,190,255,${alpha})`);
        grad.addColorStop(0.5, `rgba(168,85,247,${alpha * 0.55})`);
        grad.addColorStop(1, "rgba(142,36,216,0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (mouse.active) {
        const grad = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 10);
        grad.addColorStop(0, "rgba(248,245,255,0.95)");
        grad.addColorStop(0.35, "rgba(202,153,255,0.75)");
        grad.addColorStop(1, "rgba(168,85,247,0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.classList.remove(HIDE_CLASS);
    };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70]" />
  );
}

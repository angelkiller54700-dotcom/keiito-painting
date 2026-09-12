"use client";

import { useEffect, useRef } from "react";

/**
 * Petit feu follet violet qui suit le curseur avec un léger retard.
 * Désactivé sur écrans tactiles et si l'utilisateur préfère moins d'animations.
 */
export function CursorWisp() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    const el = wrapRef.current;
    if (!el) return;

    const pos = { x: -100, y: -100 };
    const target = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    function onMove(e: MouseEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        pos.x = target.x;
        pos.y = target.y;
        visible = true;
        el!.style.opacity = "1";
      }
    }
    function onOut(e: MouseEvent) {
      if (!e.relatedTarget) {
        visible = false;
        el!.style.opacity = "0";
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);

    function loop() {
      pos.x += (target.x - pos.x) * 0.35;
      pos.y += (target.y - pos.y) * 0.35;
      el!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] opacity-0 transition-opacity duration-300 will-change-transform"
    >
      {/* halo diffus */}
      <div
        className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(142,36,216,0.22) 45%, transparent 72%)",
          filter: "blur(6px)",
          mixBlendMode: "screen",
        }}
      />
      {/* cœur lumineux */}
      <div
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fog"
        style={{
          boxShadow: "0 0 10px 3px rgba(168,85,247,0.85), 0 0 22px 8px rgba(142,36,216,0.35)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

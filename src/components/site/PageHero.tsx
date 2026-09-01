import type { CSSProperties, ReactNode } from "react";
import { heroBgFor } from "@/lib/heroes";

const SCRIM_DESKTOP =
  "linear-gradient(90deg,rgba(5,5,8,0.95) 0%,rgba(5,5,8,0.68) 40%,rgba(5,5,8,0.12) 74%,rgba(5,5,8,0) 100%)";
const SCRIM_MOBILE =
  "linear-gradient(90deg,rgba(5,5,8,0.96) 0%,rgba(5,5,8,0.84) 38%,rgba(5,5,8,0.5) 70%,rgba(5,5,8,0.38) 100%)";

/**
 * Bandeau plein largeur en tête des pages internes :
 * image de fond (figurine) + dégradé sombre à gauche + titre.
 */
export function PageHero({
  path,
  eyebrow,
  title,
  description,
  children,
}: {
  path: string;
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  const bg = heroBgFor(path);

  return (
    <>
      <link rel="preload" as="image" href={bg.image} />

      <section
        className="relative isolate overflow-hidden bg-ink bg-cover bg-[position:var(--bg-pos-m)] md:bg-[position:var(--bg-pos)]"
        style={
          {
            backgroundImage: `url(${bg.image})`,
            "--bg-pos": bg.position ?? "center",
            "--bg-pos-m": bg.positionMobile ?? "70% center",
          } as CSSProperties
        }
      >
        <div aria-hidden className="absolute inset-0 md:hidden" style={{ background: SCRIM_MOBILE }} />
        <div aria-hidden className="absolute inset-0 hidden md:block" style={{ background: SCRIM_DESKTOP }} />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent"
        />

        <div className="container-page relative z-10 flex min-h-[46vh] flex-col justify-center py-16 sm:py-20">
          <span className="eyebrow animate-slide-up" style={{ animationDelay: "0.05s" }}>
            {eyebrow}
          </span>
          <h1
            className="mt-3 max-w-2xl animate-slide-up font-display text-4xl uppercase leading-[0.95] text-fog drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] sm:text-5xl md:text-6xl"
            style={{ animationDelay: "0.1s" }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="mt-4 max-w-xl animate-slide-up text-[15px] leading-relaxed text-fog-muted"
              style={{ animationDelay: "0.18s" }}
            >
              {description}
            </p>
          )}
          {children && (
            <div className="mt-7 animate-slide-up" style={{ animationDelay: "0.26s" }}>
              {children}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

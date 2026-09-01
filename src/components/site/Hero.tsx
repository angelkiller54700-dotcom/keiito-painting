import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { heroBgFor } from "@/lib/heroes";
import type { HeroSettings } from "@/lib/types";

const SCRIM_DESKTOP =
  "linear-gradient(90deg,rgba(5,5,8,0.96) 0%,rgba(5,5,8,0.7) 38%,rgba(5,5,8,0.18) 72%,rgba(5,5,8,0) 100%)";
const SCRIM_MOBILE =
  "linear-gradient(90deg,rgba(5,5,8,0.97) 0%,rgba(5,5,8,0.86) 38%,rgba(5,5,8,0.5) 70%,rgba(5,5,8,0.4) 100%)";

export function Hero({ hero }: { hero: HeroSettings }) {
  const bg = heroBgFor("/");

  return (
    <>
      <link rel="preload" as="image" href={bg.image} />

      <section
        className="relative isolate flex items-center overflow-hidden bg-ink bg-cover bg-[position:var(--bg-pos-m)] md:min-h-[calc(100vh-5rem)] md:bg-[position:var(--bg-pos)]"
        style={
          {
            backgroundImage: `url(${bg.image})`,
            "--bg-pos": bg.position ?? "center",
            "--bg-pos-m": bg.positionMobile ?? "72% center",
          } as CSSProperties
        }
      >
        <div aria-hidden className="absolute inset-0 md:hidden" style={{ background: SCRIM_MOBILE }} />
        <div aria-hidden className="absolute inset-0 hidden md:block" style={{ background: SCRIM_DESKTOP }} />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent"
        />

        <div className="container-page relative z-10 py-16 sm:py-24 lg:py-28">
          <div className="max-w-xl">
            <p className="eyebrow animate-slide-up" style={{ animationDelay: "0.05s" }}>
              {hero.eyebrow}
            </p>

            <h1
              className="mt-3 animate-slide-up font-display text-[3.6rem] leading-[0.9] tracking-tight text-fog drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)] sm:text-7xl xl:text-8xl"
              style={{ animationDelay: "0.1s" }}
            >
              {hero.title}
            </h1>

            <p
              className="mt-1 animate-slide-up font-brush text-2xl text-violet-bright sm:text-4xl"
              style={{ animationDelay: "0.18s" }}
            >
              {hero.brush}
            </p>

            <p
              className="mt-6 max-w-md animate-slide-up text-[15px] leading-relaxed text-fog-muted"
              style={{ animationDelay: "0.26s" }}
            >
              {hero.description}
            </p>

            <div
              className="mt-8 flex animate-slide-up flex-wrap gap-3"
              style={{ animationDelay: "0.34s" }}
            >
              <Link href="/galerie" className="btn-primary">
                Voir la galerie
              </Link>
              <Link href="/contact" className="btn-outline">
                Demander un devis
              </Link>
            </div>

            {hero.perks?.length > 0 && (
              <ul
                className="mt-10 grid animate-slide-up grid-cols-1 gap-4 sm:grid-cols-3"
                style={{ animationDelay: "0.42s" }}
              >
                {hero.perks.map((perk) => (
                  <li key={perk.title} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-violet-bright/40 bg-violet/10 text-violet-bright">
                      <Icon name="Check" className="h-3.5 w-3.5" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-xs font-semibold text-fog">{perk.title}</span>
                      <span className="block text-xs text-fog-muted">{perk.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

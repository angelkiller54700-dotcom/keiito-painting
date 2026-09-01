import { BACKGROUNDS } from "@/lib/constants";

/** Couche d'ambiance fixe : texture grunge + vignettage + glow violet subtil. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
        style={{ backgroundImage: `url(${BACKGROUNDS.grunge})` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_35%,rgba(5,5,8,0.85)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-violet-radial" />
    </div>
  );
}

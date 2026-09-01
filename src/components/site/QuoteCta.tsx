import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "./Reveal";
import { BACKGROUNDS } from "@/lib/constants";

export function QuoteCta({
  title = "Vous aimez ce style ?",
  text = "Chaque projet est unique. Parlons de votre armée, de vos héros ou de votre pièce d'exposition.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <Reveal className="container-page">
      <div
        className="relative overflow-hidden rounded-2xl border border-ink-border px-6 py-14 text-center sm:px-12"
        style={{
          backgroundImage: `linear-gradient(rgba(5,5,8,0.78), rgba(5,5,8,0.92)), url(${BACKGROUNDS.cave})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h2 className="text-2xl uppercase text-fog sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-fog-muted">{text}</p>
        <Link href="/contact" className="btn-primary mt-7">
          Demander un devis
          <Icon name="ArrowRight" className="h-4 w-4" />
        </Link>
      </div>
    </Reveal>
  );
}

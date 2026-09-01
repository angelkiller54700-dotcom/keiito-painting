import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { QuoteCta } from "@/components/site/QuoteCta";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/ui/Icon";
import { SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Peinture de figurines à l'unité, peinture d'armées, personnages, pièces d'exposition, soclage, décors, retouches et projets personnalisés.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        path="/services"
        eyebrow="Services"
        title="Ce que je peux peindre pour vous"
        description="De la figurine de jeu à la pièce de vitrine, chaque prestation s'adapte à votre projet et à votre budget."
      />

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal
              key={s.slug}
              delay={i * 0.05}
              className="card-surface flex flex-col gap-4 p-6 transition-colors hover:border-violet-bright/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg border border-violet-bright/40 bg-violet/10 text-violet-bright">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg uppercase text-fog">{s.title}</h3>
              <p className="text-sm text-fog-muted">{s.text}</p>
              <p className="text-xs text-fog-muted/80">
                <span className="font-semibold text-fog-muted">Exemples :</span> {s.example}
              </p>
              <Link
                href="/contact"
                className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-bright hover:text-violet"
              >
                Demander un devis
                <Icon name="ArrowRight" className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="pb-24">
        <QuoteCta title="Un projet en tête ?" />
      </div>
    </>
  );
}

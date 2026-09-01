import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/ui/Icon";
import { getActivePricingTiers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Niveaux de finition pour la peinture de vos figurines Warhammer : Tabletop, Tabletop +, Premium et Display. Devis personnalisé selon le projet.",
  alternates: { canonical: "/tarifs" },
};

export const revalidate = 60;

export default async function TarifsPage() {
  const tiers = await getActivePricingTiers();

  return (
    <>
      <PageHero
        path="/tarifs"
        eyebrow="Tarifs"
        title="Niveaux de finition"
        description="Quatre niveaux pour situer votre projet. Le prix final dépend de la figurine, du niveau de finition et des options choisies."
      />

      <section className="container-page py-16 sm:py-20">
      {tiers.length === 0 ? (
        <p className="mt-12 text-center text-sm text-fog-muted">
          Les tarifs seront bientôt disponibles. Contactez-moi pour un devis.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier, i) => (
            <Reveal
              key={tier.id}
              delay={i * 0.06}
              className="card-surface flex flex-col p-6"
            >
              <h3 className="font-display text-xl uppercase text-fog">{tier.name}</h3>
              {tier.description && (
                <p className="mt-2 text-sm text-fog-muted">{tier.description}</p>
              )}
              {tier.price_label && (
                <p className="mt-4 text-lg font-semibold text-violet-bright">{tier.price_label}</p>
              )}
              {tier.features.length > 0 && (
                <ul className="mt-5 space-y-2 border-t border-ink-border pt-5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-fog-muted">
                      <Icon name="Check" className="mt-0.5 h-4 w-4 shrink-0 text-violet-bright" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/contact" className="btn-outline mt-6 w-full">
                Demander un devis
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      <Reveal className="mx-auto mt-14 max-w-2xl rounded-xl border border-ink-border bg-ink-soft/70 p-6 text-center">
        <p className="text-sm text-fog-muted">
          Chaque projet est unique. Le prix final dépend de la figurine, du niveau de finition et des
          options choisies (soclage, effets, conversions, urgence…).
        </p>
        <Link href="/contact" className="btn-primary mt-5">
          Demander mon devis
          <Icon name="ArrowRight" className="h-4 w-4" />
        </Link>
      </Reveal>
      </section>
    </>
  );
}

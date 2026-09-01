import type { Metadata } from "next";
import { AboutBlock } from "@/components/site/AboutBlock";
import { QuoteCta } from "@/components/site/QuoteCta";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/ui/Icon";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Keiito Painting — peintre passionné de figurines Warhammer. Techniques avancées, matériel professionnel, suivi personnalisé.",
  alternates: { canonical: "/a-propos" },
};

const PROCESS = [
  { title: "Échange", text: "On discute de votre projet, du niveau de finition et du schéma de couleurs." },
  { title: "Devis", text: "Vous recevez un devis clair et détaillé, sans surprise." },
  { title: "Peinture", text: "Je peins avec un suivi régulier en photos si vous le souhaitez." },
  { title: "Livraison", text: "Figurines protégées et emballées avec soin pour le transport." },
];

export default async function AProposPage() {
  const { about } = await getSiteSettings();

  return (
    <>
      <PageHero
        path="/a-propos"
        eyebrow="À propos"
        title="La passion du détail"
        description="Un travail artisanal, exigeant et à l'écoute de vos envies."
      />

      <div className="pt-16 sm:pt-20" />
      <AboutBlock about={about} showCta={false} showHeading={false} />

      <section className="container-page py-16">
        <Reveal>
          <h2 className="text-2xl uppercase text-fog sm:text-3xl">Comment ça se passe</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06} className="card-surface p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-violet-bright/40 bg-violet/10 font-display text-violet-bright">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-base uppercase text-fog">{step.title}</h3>
              <p className="mt-2 text-sm text-fog-muted">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="pb-24">
        <QuoteCta />
      </div>
    </>
  );
}

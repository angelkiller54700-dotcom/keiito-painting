import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CreationCard } from "@/components/site/CreationCard";
import { AboutBlock } from "@/components/site/AboutBlock";
import { StatsBar } from "@/components/site/StatsBar";
import { QuoteCta } from "@/components/site/QuoteCta";
import { EmptyState } from "@/components/site/EmptyState";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/ui/Icon";
import { getSiteSettings } from "@/lib/settings";
import { getFeaturedCreations } from "@/lib/queries";

export default async function HomePage() {
  const [{ hero, about, stats }, featured] = await Promise.all([
    getSiteSettings(),
    getFeaturedCreations(8),
  ]);

  return (
    <>
      <Hero hero={hero} />

      <StatsBar stats={stats} />

      <section className="container-page py-20 sm:py-24">
        <SectionHeading eyebrow="Galerie" title="Mes réalisations" />

        <div className="mt-12">
          {featured.length === 0 ? (
            <EmptyState hint="Les projets mis en avant apparaîtront ici dès qu'ils seront publiés depuis l'administration." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((creation, i) => (
                <Reveal key={creation.id} delay={i * 0.06}>
                  <CreationCard creation={creation} priority={i < 4} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Link href="/galerie" className="btn-outline">
            Voir toute la galerie
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <AboutBlock about={about} />

      <div className="py-20 sm:py-24">
        <QuoteCta />
      </div>
    </>
  );
}

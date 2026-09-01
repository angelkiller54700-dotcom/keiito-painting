import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { GalleryExplorer } from "@/components/site/GalleryExplorer";
import { QuoteCta } from "@/components/site/QuoteCta";
import { getPublishedCreations, getPublicCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Galerie complète des figurines Warhammer 40K et Age of Sigmar peintes par Keiito Painting : Space Marines, Xenos, Chaos, Orcs, décors et socles.",
  alternates: { canonical: "/galerie" },
};

export const revalidate = 60;

export default async function GaleriePage() {
  const [creations, categories] = await Promise.all([
    getPublishedCreations(),
    getPublicCategories(),
  ]);

  return (
    <>
      <PageHero
        path="/galerie"
        eyebrow="Galerie"
        title="Toutes mes réalisations"
        description="Filtrez par catégorie pour explorer les projets. Cliquez sur une carte pour voir le détail d'une création."
      />

      <section className="container-page py-16 sm:py-20">
        <GalleryExplorer creations={creations} categories={categories} />
      </section>

      <div className="pb-24">
        <QuoteCta />
      </div>
    </>
  );
}

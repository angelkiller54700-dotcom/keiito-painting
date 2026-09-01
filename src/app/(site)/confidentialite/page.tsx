import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment sont traitées les données transmises via le formulaire de contact.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: false, follow: true },
};

export default async function ConfidentialitePage() {
  const { contact } = await getSiteSettings();

  return (
    <section className="container-page max-w-3xl py-16 sm:py-20">
      <h1 className="text-3xl uppercase text-fog sm:text-4xl">Politique de confidentialité</h1>
      <div className="prose-creation mt-8 space-y-5 text-fog-muted">
        <p>
          Les informations recueillies via le formulaire de contact (nom, email, téléphone,
          description du projet et éventuelles photos) sont utilisées uniquement pour répondre à
          votre demande et établir un devis.
        </p>
        <p>
          Ces données ne sont ni revendues, ni transmises à des tiers. Elles sont conservées le temps
          nécessaire au traitement de votre demande et à la relation commerciale qui pourrait en
          découler.
        </p>
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
          suppression de vos données. Pour l&apos;exercer, contactez
          {contact.email ? ` ${contact.email}` : " le peintre via le formulaire ou les réseaux sociaux"}.
        </p>
        <p>
          Les photos jointes à une demande sont stockées de façon privée et ne sont consultables que
          par l&apos;administrateur du site.
        </p>
        <p className="text-xs text-fog-muted/70">
          Ce texte est un modèle générique à adapter à votre situation réelle.
        </p>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/site/ContactForm";
import { SocialLinks } from "@/components/site/SocialLinks";
import { Icon } from "@/components/ui/Icon";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact & devis",
  description:
    "Demandez un devis personnalisé pour la peinture de vos figurines Warhammer. Décrivez votre projet, je reviens vers vous rapidement.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { contact } = await getSiteSettings();

  return (
    <>
      <PageHero
        path="/contact"
        eyebrow="Contact"
        title="Demander un devis"
        description="Remplissez le formulaire ci-dessous. Plus votre description est précise, plus le devis sera juste."
      />

      <section className="container-page py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <ContactForm intro={contact.intro} />

        <aside className="space-y-6">
          <div className="card-surface p-6">
            <h2 className="font-display text-lg uppercase text-fog">Autres moyens</h2>
            <div className="mt-4 space-y-3 text-sm text-fog-muted">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 hover:text-fog"
                >
                  <Icon name="ChevronRight" className="h-4 w-4 text-violet-bright" />
                  {contact.email}
                </a>
              )}
              <div className="pt-1">
                <SocialLinks contact={contact} />
              </div>
            </div>
          </div>

          <div className="card-surface p-6 text-sm text-fog-muted">
            <h2 className="font-display text-lg uppercase text-fog">Bon à savoir</h2>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-2">
                <Icon name="Check" className="mt-0.5 h-4 w-4 shrink-0 text-violet-bright" />
                Devis gratuit et sans engagement.
              </li>
              <li className="flex gap-2">
                <Icon name="Check" className="mt-0.5 h-4 w-4 shrink-0 text-violet-bright" />
                Suivi photo pendant la réalisation.
              </li>
              <li className="flex gap-2">
                <Icon name="Check" className="mt-0.5 h-4 w-4 shrink-0 text-violet-bright" />
                Envoi soigné et protégé.
              </li>
            </ul>
          </div>
        </aside>
      </div>
      </section>
    </>
  );
}

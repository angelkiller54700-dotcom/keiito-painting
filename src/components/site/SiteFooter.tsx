import Link from "next/link";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { NAV_LINKS } from "@/lib/constants";
import type { ContactSettings } from "@/lib/types";

export function SiteFooter({ contact }: { contact: ContactSettings }) {
  return (
    <footer className="relative border-t border-ink-border bg-ink-soft/60">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-fog-muted">
            Peinture de figurines Warhammer 40K, Age of Sigmar et miniatures. Travail soigné,
            techniques avancées, sur devis.
          </p>
          <SocialLinks contact={contact} />
        </div>

        <nav aria-label="Navigation pied de page" className="space-y-3">
          <p className="eyebrow">Navigation</p>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-sm text-fog-muted transition-colors hover:text-fog"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3">
          <p className="eyebrow">Contact</p>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="block text-sm text-fog-muted transition-colors hover:text-fog"
            >
              {contact.email}
            </a>
          )}
          <Link
            href="/contact"
            className="block text-sm text-fog-muted transition-colors hover:text-fog"
          >
            Demander un devis
          </Link>
          <Link
            href="/confidentialite"
            className="block text-sm text-fog-muted transition-colors hover:text-fog"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>

      <div className="border-t border-ink-border/60">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-fog-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Keiito Painting. Tous droits réservés.</p>
          <p>
            Warhammer, Warhammer 40 000 et Age of Sigmar sont des marques de Games Workshop. Site non
            affilié.
          </p>
        </div>
      </div>
    </footer>
  );
}

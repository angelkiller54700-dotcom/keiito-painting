import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreationGallery } from "@/components/site/CreationGallery";
import { QuoteCta } from "@/components/site/QuoteCta";
import { Icon } from "@/components/ui/Icon";
import { getCreationBySlug, getAdjacentCreations, getPublishedCreations } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { publicImageUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { SITE_URL } from "@/lib/env";

export const revalidate = 60;

export async function generateStaticParams() {
  const creations = await getPublishedCreations();
  return creations.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const creation = await getCreationBySlug(params.slug);
  if (!creation) return { title: "Création introuvable" };

  const cover = creation.images.find((i) => i.is_cover) ?? creation.images[0];
  const image = cover ? publicImageUrl(cover.storage_path) : undefined;
  const description =
    creation.excerpt ||
    creation.body?.slice(0, 155) ||
    `Figurine ${creation.title} peinte par Keiito Painting.`;

  return {
    title: creation.title,
    description,
    alternates: { canonical: `/galerie/${creation.slug}` },
    openGraph: {
      title: `${creation.title} | Keiito Painting`,
      description,
      url: `${SITE_URL}/galerie/${creation.slug}`,
      type: "article",
      images: image ? [{ url: image, width: 1200, height: 900, alt: creation.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: creation.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

const META_ITEMS = (c: Awaited<ReturnType<typeof getCreationBySlug>>) =>
  !c
    ? []
    : [
        c.category && { label: "Catégorie", value: c.category.name },
        c.figure_type && { label: "Type de figurine", value: c.figure_type },
        c.realized_on && { label: "Réalisée le", value: formatDate(c.realized_on) },
        c.completion_time && { label: "Temps de réalisation", value: c.completion_time },
      ].filter(Boolean) as { label: string; value: string }[];

export default async function CreationPage({ params }: { params: { slug: string } }) {
  const creation = await getCreationBySlug(params.slug);
  if (!creation) notFound();

  const [{ contact }, adjacent] = await Promise.all([
    getSiteSettings(),
    getAdjacentCreations(params.slug),
  ]);

  const cover = creation.images.find((i) => i.is_cover) ?? creation.images[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: creation.title,
    artMedium: "Peinture sur figurine",
    artform: "Miniature painting",
    creator: { "@type": "Person", name: "Keiito Painting" },
    dateCreated: creation.realized_on ?? undefined,
    image: cover ? publicImageUrl(cover.storage_path) : undefined,
    description: creation.excerpt ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container-page py-12 sm:py-16">
        <Link
          href="/galerie"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-fog-muted transition-colors hover:text-fog"
        >
          <Icon name="ArrowLeft" className="h-4 w-4" />
          Retour à la galerie
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <CreationGallery images={creation.images} title={creation.title} />

          <div className="space-y-6">
            {creation.category && (
              <span className="eyebrow">{creation.category.name}</span>
            )}
            <h1 className="text-4xl uppercase text-fog sm:text-5xl">{creation.title}</h1>

            {creation.excerpt && (
              <p className="text-lg text-fog-muted">{creation.excerpt}</p>
            )}

            {creation.body && <div className="prose-creation">{creation.body}</div>}

            {META_ITEMS(creation).length > 0 && (
              <dl className="grid grid-cols-2 gap-4 border-t border-ink-border pt-6">
                {META_ITEMS(creation).map((m) => (
                  <div key={m.label}>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-fog-muted">
                      {m.label}
                    </dt>
                    <dd className="mt-1 text-sm text-fog">{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {creation.techniques.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-fog-muted">
                  Techniques utilisées
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {creation.techniques.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-ink-border bg-violet/10 px-3 py-1 text-xs text-fog"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-ink-border bg-ink-soft/70 p-5">
              <p className="font-display text-lg uppercase text-fog">Vous aimez ce style ?</p>
              <p className="mt-1 text-sm text-fog-muted">
                {contact.intro}
              </p>
              <Link href="/contact" className="btn-primary mt-4">
                Demander un devis
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {(adjacent.prev || adjacent.next) && (
          <nav className="mt-16 grid gap-4 border-t border-ink-border pt-8 sm:grid-cols-2">
            {adjacent.prev ? (
              <Link
                href={`/galerie/${adjacent.prev.slug}`}
                className="group flex items-center gap-3 rounded-lg border border-ink-border p-4 transition-colors hover:border-violet-bright/50"
              >
                <Icon name="ArrowLeft" className="h-4 w-4 text-violet-bright" />
                <span>
                  <span className="block text-[11px] uppercase tracking-widest text-fog-muted">
                    Création précédente
                  </span>
                  <span className="block text-sm text-fog">{adjacent.prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {adjacent.next && (
              <Link
                href={`/galerie/${adjacent.next.slug}`}
                className="group flex items-center justify-end gap-3 rounded-lg border border-ink-border p-4 text-right transition-colors hover:border-violet-bright/50 sm:col-start-2"
              >
                <span>
                  <span className="block text-[11px] uppercase tracking-widest text-fog-muted">
                    Création suivante
                  </span>
                  <span className="block text-sm text-fog">{adjacent.next.title}</span>
                </span>
                <Icon name="ArrowRight" className="h-4 w-4 text-violet-bright" />
              </Link>
            )}
          </nav>
        )}
      </article>

      <div className="pb-24">
        <QuoteCta />
      </div>
    </>
  );
}

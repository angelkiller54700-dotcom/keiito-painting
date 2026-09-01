import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "./Reveal";
import { publicImageUrl } from "@/lib/storage";
import { BACKGROUNDS } from "@/lib/constants";
import type { AboutSettings, CreationImage } from "@/lib/types";

export function AboutBlock({
  about,
  showCta = true,
  showHeading = true,
  featureImage,
}: {
  about: AboutSettings;
  showCta?: boolean;
  showHeading?: boolean;
  featureImage?: CreationImage | null;
}) {
  const imgSrc = featureImage ? publicImageUrl(featureImage.storage_path) : BACKGROUNDS.hero;

  return (
    <section className="container-page grid items-center gap-12 py-8 lg:grid-cols-2">
      <Reveal className="relative mx-auto w-full max-w-md">
        <div className="absolute inset-0 -z-10 rounded-full bg-violet-deep/40 blur-3xl" />
        <div className="overflow-hidden rounded-2xl border border-ink-border shadow-card">
          <Image
            src={imgSrc}
            alt={featureImage?.alt_text || "Figurine peinte par Keiito Painting"}
            width={640}
            height={800}
            className="h-full w-full object-cover"
          />
        </div>
      </Reveal>

      <Reveal delay={0.1} className="space-y-6">
        {showHeading && (
          <div>
            <span className="eyebrow">À propos</span>
            <h2 className="mt-2 text-3xl uppercase text-fog sm:text-4xl">{about.title}</h2>
          </div>
        )}
        <p className="prose-creation">{about.body}</p>

        <ul className="grid gap-5 sm:grid-cols-2">
          {about.points.map((p) => (
            <li key={p.title} className="flex gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-violet-bright/40 bg-violet/10 text-violet-bright">
                <Icon name="Sparkles" className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-fog">{p.title}</span>
                <span className="block text-xs text-fog-muted">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>

        {showCta && (
          <Link href="/a-propos" className="btn-outline">
            En savoir plus
          </Link>
        )}
      </Reveal>
    </section>
  );
}

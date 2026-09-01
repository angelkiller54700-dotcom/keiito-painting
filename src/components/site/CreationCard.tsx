import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { publicImageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { CreationWithRelations } from "@/lib/types";

export function CreationCard({
  creation,
  priority = false,
  className,
}: {
  creation: CreationWithRelations;
  priority?: boolean;
  className?: string;
}) {
  const cover =
    creation.images.find((i) => i.is_cover) ?? creation.images[0] ?? null;
  const src = publicImageUrl(cover?.storage_path ?? creation.cover_path);
  const alt = cover?.alt_text || `${creation.title} — figurine peinte par Keiito Painting`;

  return (
    <Link
      href={`/galerie/${creation.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-ink-border bg-ink-soft/80 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-violet-bright/50 hover:shadow-glow",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-ink-raised">
        {src ? (
          <>
            {/* fond flou : comble les bandes quand l'image n'est pas au format 16:9 */}
            <Image
              src={src}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 340px"
              className="scale-125 object-cover opacity-30 blur-2xl"
            />
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 340px"
              priority={priority}
              className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </>
        ) : (
          <div className="grid h-full place-items-center text-fog-muted">
            <Icon name="Images" className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-violet/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span className="btn-outline pointer-events-none border-white/30 bg-ink/70 !py-2 text-[10px]">
            Voir le projet
            <Icon name="ArrowRight" className="h-3.5 w-3.5" />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {creation.category && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-bright">
            {creation.category.name}
          </span>
        )}
        <h3 className="font-display text-base uppercase tracking-wide text-fog">{creation.title}</h3>
        {creation.excerpt && (
          <p className="line-clamp-2 text-xs text-fog-muted">{creation.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

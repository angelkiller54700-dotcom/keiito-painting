"use client";

import { useMemo, useState } from "react";
import { CreationCard } from "./CreationCard";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";
import type { Category, CreationWithRelations } from "@/lib/types";

export function GalleryExplorer({
  creations,
  categories,
}: {
  creations: CreationWithRelations[];
  categories: Category[];
}) {
  const [active, setActive] = useState<string>("tout");

  // On ne garde que les catégories qui ont au moins une création publiée.
  const usedSlugs = useMemo(
    () => new Set(creations.map((c) => c.category?.slug).filter(Boolean) as string[]),
    [creations],
  );
  const filters = useMemo(
    () => [
      { slug: "tout", name: "Tout" },
      ...categories.filter((c) => usedSlugs.has(c.slug)).map((c) => ({ slug: c.slug, name: c.name })),
    ],
    [categories, usedSlugs],
  );

  const visible = useMemo(
    () =>
      active === "tout"
        ? creations
        : creations.filter((c) => c.category?.slug === active),
    [active, creations],
  );

  if (creations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {filters.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.slug}
              type="button"
              onClick={() => setActive(f.slug)}
              aria-pressed={active === f.slug}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
                active === f.slug
                  ? "border-violet-bright bg-violet/15 text-fog"
                  : "border-ink-border text-fog-muted hover:border-violet-bright/50 hover:text-fog",
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c, i) => (
          <CreationCard key={c.id} creation={c} priority={i < 3} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-center text-sm text-fog-muted">
          Aucune création dans cette catégorie pour l&apos;instant.
        </p>
      )}
    </div>
  );
}

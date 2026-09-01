"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { publicImageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { CreationImage } from "@/lib/types";

export function CreationGallery({
  images,
  title,
}: {
  images: CreationImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const safe = images.length > 0 ? images : [];
  const current = safe[Math.min(index, safe.length - 1)];

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % safe.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + safe.length) % safe.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, safe.length]);

  if (!current) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-2xl border border-ink-border bg-ink-raised text-fog-muted">
        <Icon name="Images" className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-ink-border bg-ink-raised"
        aria-label="Agrandir l'image"
      >
        <Image
          src={publicImageUrl(current.storage_path)}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 1024px) 100vw, 720px"
          className="scale-125 object-cover opacity-25 blur-2xl"
        />
        <Image
          src={publicImageUrl(current.storage_path)}
          alt={current.alt_text || `${title} — vue ${index + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 720px"
          className="object-contain"
        />
        <span className="absolute bottom-3 right-3 rounded-md bg-ink/70 px-2 py-1 text-[10px] uppercase tracking-widest text-fog-muted opacity-0 transition-opacity group-hover:opacity-100">
          Agrandir
        </span>
      </button>

      {safe.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {safe.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir l'image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border transition-colors",
                i === index ? "border-violet-bright" : "border-ink-border hover:border-violet-bright/50",
              )}
            >
              <Image
                src={publicImageUrl(img.storage_path)}
                alt={img.alt_text || `${title} miniature ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — image ${index + 1}`}
          className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center bg-ink/95 p-4"
          onClick={() => setLightbox(false)}
        >
            <button
              type="button"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-ink-border text-fog"
              aria-label="Fermer"
            >
              <Icon name="X" className="h-5 w-5" />
            </button>
            {safe.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 grid h-11 w-11 place-items-center rounded-full border border-ink-border text-fog"
                  aria-label="Image précédente"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i - 1 + safe.length) % safe.length);
                  }}
                >
                  <Icon name="ArrowLeft" className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-4 grid h-11 w-11 place-items-center rounded-full border border-ink-border text-fog"
                  aria-label="Image suivante"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i + 1) % safe.length);
                  }}
                >
                  <Icon name="ArrowRight" className="h-5 w-5" />
                </button>
              </>
            )}
          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={publicImageUrl(current.storage_path)}
              alt={current.alt_text || `${title} — vue ${index + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

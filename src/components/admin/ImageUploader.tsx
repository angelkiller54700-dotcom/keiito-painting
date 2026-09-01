"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { prepareImage } from "@/lib/image";
import { CREATIONS_BUCKET, publicImageUrl } from "@/lib/storage";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface EditorImage {
  uid: string;
  storage_path: string;
  alt_text: string;
  is_cover: boolean;
  uploading?: boolean;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function ImageUploader({
  folder,
  images,
  onChange,
  onRemovePath,
}: {
  folder: string;
  images: EditorImage[];
  onChange: (next: EditorImage[]) => void;
  onRemovePath: (path: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  // Référence toujours à jour de la liste, pour les callbacks asynchrones.
  const currentRef = useRef(images);
  currentRef.current = images;

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      const supabase = createClient();
      for (const file of files) {
        const localUid = uid();
        onChange([
          ...currentRef.current,
          { uid: localUid, storage_path: "", alt_text: "", is_cover: false, uploading: true },
        ]);
        try {
          const prepared = await prepareImage(file);
          const path = `${folder}/${Date.now().toString(36)}-${uid()}.webp`;
          const { error: upErr } = await supabase.storage
            .from(CREATIONS_BUCKET)
            .upload(path, prepared.file, { contentType: "image/webp", upsert: false });
          if (upErr) throw new Error(upErr.message);

          onChange(
            currentRef.current.map((im) =>
              im.uid === localUid
                ? {
                    ...im,
                    storage_path: path,
                    uploading: false,
                    is_cover: currentRef.current.every((x) => !x.is_cover),
                  }
                : im,
            ),
          );
        } catch (e) {
          onChange(currentRef.current.filter((im) => im.uid !== localUid));
          setError(
            e instanceof Error
              ? e.message
              : "Échec de l'upload. Vérifie ta connexion et réessaie.",
          );
        }
      }
    },
    [folder, onChange],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) uploadFiles(files);
  }

  function removeImage(target: EditorImage) {
    if (target.storage_path) onRemovePath(target.storage_path);
    const next = images.filter((im) => im.uid !== target.uid);
    // Si on retire la couverture, on la réattribue à la première image.
    if (target.is_cover && next.length && !next.some((x) => x.is_cover)) {
      next[0] = { ...next[0], is_cover: true };
    }
    onChange(next);
  }

  function setCover(target: EditorImage) {
    onChange(images.map((im) => ({ ...im, is_cover: im.uid === target.uid })));
  }

  function updateAlt(target: EditorImage, value: string) {
    onChange(images.map((im) => (im.uid === target.uid ? { ...im, alt_text: value } : im)));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver
            ? "border-violet-bright bg-violet/10"
            : "border-ink-border bg-ink/40 hover:border-violet-bright/50",
        )}
      >
        <Icon name="Upload" className="h-6 w-6 text-violet-bright" />
        <p className="text-sm text-fog">Glisse tes photos ici ou clique pour choisir</p>
        <p className="text-xs text-fog-muted">
          JPG, PNG ou WebP — converties et compressées automatiquement en WebP.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) uploadFiles(files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {images.map((im, index) => (
            <li
              key={im.uid}
              draggable={!im.uploading}
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) reorder(dragIndex.current, index);
                dragIndex.current = null;
              }}
              className={cn(
                "flex gap-3 rounded-lg border border-ink-border bg-ink/50 p-3",
                im.is_cover && "border-violet-bright/60",
              )}
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-ink-raised">
                {im.uploading ? (
                  <span className="grid h-full place-items-center text-fog-muted">
                    <Icon name="Loader2" className="h-5 w-5 animate-spin" />
                  </span>
                ) : (
                  <Image
                    src={publicImageUrl(im.storage_path)}
                    alt={im.alt_text || "Aperçu"}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input
                  value={im.alt_text}
                  onChange={(e) => updateAlt(im, e.target.value)}
                  placeholder="Texte alternatif (accessibilité / SEO)"
                  className="field-input !py-1.5 text-xs"
                  disabled={im.uploading}
                />
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCover(im)}
                    disabled={im.uploading || im.is_cover}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-1",
                      im.is_cover
                        ? "border-violet-bright/60 bg-violet/15 text-violet-bright"
                        : "border-ink-border text-fog-muted hover:text-fog",
                    )}
                  >
                    <Icon name="Star" className="h-3 w-3" />
                    {im.is_cover ? "Photo principale" : "Définir principale"}
                  </button>
                  <span className="text-fog-muted/60">glisser pour réordonner</span>
                  <button
                    type="button"
                    onClick={() => removeImage(im)}
                    disabled={im.uploading}
                    className="ml-auto inline-flex items-center gap-1 rounded-md border border-ink-border px-2 py-1 text-fog-muted hover:border-red-500/50 hover:text-red-300"
                  >
                    <Icon name="Trash2" className="h-3 w-3" />
                    Retirer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

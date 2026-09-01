"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUploader, type EditorImage } from "./ImageUploader";
import { Icon } from "@/components/ui/Icon";
import { saveCreation, type CreationInput } from "@/lib/actions/creations";
import { slugify, parseList } from "@/lib/utils";
import type { Category, CreationWithRelations } from "@/lib/types";

function newUid() {
  return Math.random().toString(36).slice(2, 10);
}

export function CreationForm({
  categories,
  creation,
}: {
  categories: Category[];
  creation?: CreationWithRelations;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [title, setTitle] = useState(creation?.title ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(creation));
  const [slug, setSlug] = useState(creation?.slug ?? "");
  const [categoryId, setCategoryId] = useState(creation?.category_id ?? "");
  const [excerpt, setExcerpt] = useState(creation?.excerpt ?? "");
  const [body, setBody] = useState(creation?.body ?? "");
  const [techniques, setTechniques] = useState((creation?.techniques ?? []).join(", "));
  const [figureType, setFigureType] = useState(creation?.figure_type ?? "");
  const [completionTime, setCompletionTime] = useState(creation?.completion_time ?? "");
  const [realizedOn, setRealizedOn] = useState(creation?.realized_on ?? "");
  const [featured, setFeatured] = useState(creation?.featured ?? false);
  const [status, setStatus] = useState<"draft" | "published">(creation?.status ?? "draft");

  const [images, setImages] = useState<EditorImage[]>(
    (creation?.images ?? []).map((im) => ({
      uid: newUid(),
      storage_path: im.storage_path,
      alt_text: im.alt_text ?? "",
      is_cover: im.is_cover,
    })),
  );
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);

  // Dossier storage stable : réutilise celui des images existantes, sinon nouveau.
  const folder = useMemo(() => {
    const existing = creation?.images?.[0]?.storage_path;
    if (existing && existing.includes("/")) return existing.split("/").slice(0, -1).join("/");
    return `creations/${slugify(creation?.slug ?? title) || "projet"}-${newUid()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function submit(nextStatus?: "draft" | "published") {
    setMessage(null);
    if (!title.trim()) {
      setMessage({ type: "error", text: "Le titre est obligatoire." });
      return;
    }
    if (images.some((im) => im.uploading)) {
      setMessage({ type: "error", text: "Patiente : des images sont encore en cours d'envoi." });
      return;
    }

    const finalStatus = nextStatus ?? status;
    const payload: CreationInput = {
      id: creation?.id,
      title: title.trim(),
      slug: effectiveSlug,
      category_id: categoryId || null,
      excerpt,
      body,
      techniques: parseList(techniques),
      figure_type: figureType,
      completion_time: completionTime,
      realized_on: realizedOn || null,
      status: finalStatus,
      featured,
      images: images
        .filter((im) => im.storage_path)
        .map((im, idx) => ({
          storage_path: im.storage_path,
          alt_text: im.alt_text,
          position: idx,
          is_cover: im.is_cover,
        })),
      removed_storage_paths: removedPaths,
    };

    startTransition(async () => {
      const res = await saveCreation(payload);
      if (!res.ok) {
        setMessage({ type: "error", text: res.error ?? "Erreur lors de l'enregistrement." });
        return;
      }
      setStatus(finalStatus);
      setRemovedPaths([]);
      if (!creation) {
        router.push("/admin/creations");
        router.refresh();
      } else {
        setMessage({ type: "ok", text: "Modifications enregistrées." });
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/creations"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-fog-muted hover:text-fog"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Créations
          </Link>
          <h1 className="mt-2 font-display text-2xl uppercase text-fog">
            {creation ? "Modifier la création" : "Ajouter une création"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {creation && status === "published" && (
            <Link
              href={`/galerie/${creation.slug}`}
              target="_blank"
              className="btn-ghost !px-3 !py-2 text-[10px]"
            >
              <Icon name="Eye" className="h-3.5 w-3.5" />
              Voir en ligne
            </Link>
          )}
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={pending}
            className="btn-outline !py-2"
          >
            Enregistrer le brouillon
          </button>
          <button
            type="button"
            onClick={() => submit("published")}
            disabled={pending}
            className="btn-primary !py-2"
          >
            {pending ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : "Publier"}
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`rounded-md border px-4 py-3 text-sm ${
            message.type === "ok"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Colonne principale */}
        <div className="space-y-5">
          <div className="card-surface space-y-4 p-5">
            <div>
              <label htmlFor="title" className="field-label">
                Titre <span className="text-violet-bright">*</span>
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="field-input"
                placeholder="ex : Daemon Prince de Slaanesh"
              />
            </div>

            <div>
              <label htmlFor="slug" className="field-label">
                Slug (URL)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-fog-muted">/galerie/</span>
                <input
                  id="slug"
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="field-input"
                />
              </div>
              <p className="mt-1 text-xs text-fog-muted">Généré automatiquement depuis le titre.</p>
            </div>

            <div>
              <label htmlFor="excerpt" className="field-label">
                Description courte
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="field-input resize-y"
                placeholder="Une phrase d'accroche affichée sur les cartes."
              />
            </div>

            <div>
              <label htmlFor="body" className="field-label">
                Description complète
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="field-input resize-y"
                placeholder="Le contexte, les choix de peinture, les défis du projet…"
              />
            </div>
          </div>

          <div className="card-surface space-y-3 p-5">
            <h2 className="font-display text-sm uppercase tracking-wide text-fog">Photos</h2>
            <ImageUploader
              folder={folder}
              images={images}
              onChange={setImages}
              onRemovePath={(p) => setRemovedPaths((prev) => [...prev, p])}
            />
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          <div className="card-surface space-y-4 p-5">
            <div>
              <span className="field-label">Statut</span>
              <div className="flex gap-2">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                      status === s
                        ? "border-violet-bright bg-violet/15 text-fog"
                        : "border-ink-border text-fog-muted"
                    }`}
                  >
                    {s === "draft" ? "Brouillon" : "Publié"}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-fog">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-violet-bright"
              />
              Afficher sur la page d&apos;accueil
            </label>
          </div>

          <div className="card-surface space-y-4 p-5">
            <div>
              <label htmlFor="category" className="field-label">
                Catégorie
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="field-input"
              >
                <option value="">— Aucune —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-xs text-amber-300">
                  <Link href="/admin/categories" className="underline">
                    Crée d&apos;abord une catégorie
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="figureType" className="field-label">
                Type de figurine
              </label>
              <input
                id="figureType"
                value={figureType}
                onChange={(e) => setFigureType(e.target.value)}
                className="field-input"
                placeholder="ex : Personnage 32mm"
              />
            </div>

            <div>
              <label htmlFor="techniques" className="field-label">
                Techniques utilisées
              </label>
              <input
                id="techniques"
                value={techniques}
                onChange={(e) => setTechniques(e.target.value)}
                className="field-input"
                placeholder="NMM, OSL, dégradés…"
              />
              <p className="mt-1 text-xs text-fog-muted">Séparées par des virgules.</p>
            </div>

            <div>
              <label htmlFor="completionTime" className="field-label">
                Temps de réalisation
              </label>
              <input
                id="completionTime"
                value={completionTime}
                onChange={(e) => setCompletionTime(e.target.value)}
                className="field-input"
                placeholder="ex : 12 h"
              />
            </div>

            <div>
              <label htmlFor="realizedOn" className="field-label">
                Date de réalisation
              </label>
              <input
                id="realizedOn"
                type="date"
                value={realizedOn ?? ""}
                onChange={(e) => setRealizedOn(e.target.value)}
                className="field-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

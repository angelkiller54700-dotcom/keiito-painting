"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { prepareImage } from "@/lib/image";
import { QUOTE_BUCKET } from "@/lib/storage";
import { submitQuote, type QuoteFormState } from "@/lib/actions/quotes";
import { PROJECT_TYPES, PAINT_LEVELS, BUDGET_RANGES } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";

interface UploadedImage {
  path: string;
  previewUrl: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <Icon name="Loader2" className="h-4 w-4 animate-spin" />
          Envoi…
        </>
      ) : (
        "Envoyer ma demande"
      )}
    </button>
  );
}

export function ContactForm({ intro }: { intro: string }) {
  const [state, formAction] = useFormState<QuoteFormState, FormData>(submitQuote, {});
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    const supabase = createClient();
    try {
      for (const file of Array.from(files).slice(0, 6 - images.length)) {
        const prepared = await prepareImage(file);
        const path = `quotes/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.webp`;
        const { error } = await supabase.storage
          .from(QUOTE_BUCKET)
          .upload(path, prepared.file, { contentType: "image/webp" });
        if (error) throw new Error(error.message);
        setImages((prev) => [
          ...prev,
          { path, previewUrl: prepared.previewUrl, name: prepared.originalName },
        ]);
      }
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Échec de l'envoi d'une image. Réessayez.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (state.ok) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-violet-bright/40 bg-violet/10 text-violet-bright">
          <Icon name="Check" className="h-7 w-7" />
        </span>
        <h2 className="font-display text-2xl uppercase text-fog">Demande envoyée</h2>
        <p className="max-w-sm text-sm text-fog-muted">
          Merci ! Votre demande a bien été reçue. Je reviens vers vous rapidement par email avec un
          devis personnalisé.
        </p>
        <Link href="/galerie" className="btn-outline mt-2">
          Voir la galerie
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="card-surface space-y-6 p-6 sm:p-8">
      <p className="text-sm text-fog-muted">{intro}</p>

      {state.error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Nom <span className="text-violet-bright">*</span>
          </label>
          <input id="name" name="name" required className="field-input" autoComplete="name" />
          {fieldError("name") && <p className="mt-1 text-xs text-red-300">{fieldError("name")}</p>}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email <span className="text-violet-bright">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="field-input"
            autoComplete="email"
          />
          {fieldError("email") && <p className="mt-1 text-xs text-red-300">{fieldError("email")}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Téléphone (facultatif)
          </label>
          <input id="phone" name="phone" className="field-input" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="project_type" className="field-label">
            Type de projet
          </label>
          <select id="project_type" name="project_type" className="field-input" defaultValue="">
            <option value="" disabled>
              Choisir…
            </option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="figure_count" className="field-label">
            Nombre de figurines
          </label>
          <input
            id="figure_count"
            name="figure_count"
            className="field-input"
            placeholder="ex : 1, 10, une armée…"
          />
        </div>
        <div>
          <label htmlFor="figure_type" className="field-label">
            Type de figurines
          </label>
          <input
            id="figure_type"
            name="figure_type"
            className="field-input"
            placeholder="ex : Space Marines, Stormcast…"
          />
        </div>
        <div>
          <label htmlFor="paint_level" className="field-label">
            Niveau de peinture souhaité
          </label>
          <select id="paint_level" name="paint_level" className="field-input" defaultValue="">
            <option value="" disabled>
              Choisir…
            </option>
            {PAINT_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="field-label">
            Budget approximatif
          </label>
          <select id="budget" name="budget" className="field-input" defaultValue="">
            <option value="" disabled>
              Choisir…
            </option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="desired_date" className="field-label">
            Date souhaitée
          </label>
          <input
            id="desired_date"
            name="desired_date"
            className="field-input"
            placeholder="ex : avant Noël, pas de contrainte…"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Description du projet <span className="text-violet-bright">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="field-input resize-y"
          placeholder="Décrivez vos figurines, le schéma de couleurs souhaité, le niveau de détail, les références qui vous inspirent…"
        />
        {fieldError("message") && (
          <p className="mt-1 text-xs text-red-300">{fieldError("message")}</p>
        )}
      </div>

      {/* --- Upload d'images facultatif --- */}
      <div>
        <span className="field-label">Photos / références (facultatif)</span>
        <div className="rounded-lg border border-dashed border-ink-border bg-ink-soft/60 p-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="block w-full text-xs text-fog-muted file:mr-3 file:rounded-md file:border-0 file:bg-violet file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-white hover:file:bg-violet-bright"
            disabled={uploading || images.length >= 6}
          />
          {uploading && (
            <p className="mt-2 flex items-center gap-2 text-xs text-fog-muted">
              <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" />
              Optimisation et envoi…
            </p>
          )}
          {uploadError && <p className="mt-2 text-xs text-red-300">{uploadError}</p>}

          {images.length > 0 && (
            <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img) => (
                <li key={img.path} className="relative aspect-square overflow-hidden rounded-md border border-ink-border">
                  <Image src={img.previewUrl} alt={img.name} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((p) => p.path !== img.path))}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-fog"
                    aria-label={`Retirer ${img.name}`}
                  >
                    <Icon name="X" className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {images.map((img) => (
          <input key={img.path} type="hidden" name="image_paths" value={img.path} />
        ))}
      </div>

      <label className="flex items-start gap-3 text-sm text-fog-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 rounded border-ink-border bg-ink-soft text-violet accent-violet-bright"
        />
        <span>
          J&apos;ai lu et j&apos;accepte la{" "}
          <Link href="/confidentialite" className="text-violet-bright underline">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      {fieldError("consent") && <p className="text-xs text-red-300">{fieldError("consent")}</p>}

      <SubmitButton />
    </form>
  );
}

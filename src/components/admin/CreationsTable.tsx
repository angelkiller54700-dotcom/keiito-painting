"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "./ConfirmButton";
import { publicImageUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import {
  deleteCreation,
  duplicateCreation,
  setCreationStatus,
  toggleFeatured,
} from "@/lib/actions/creations";
import type { CreationWithRelations } from "@/lib/types";

export function CreationsTable({ creations }: { creations: CreationWithRelations[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function act(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id);
    startTransition(async () => {
      await fn();
      setBusyId(null);
      router.refresh();
    });
  }

  if (creations.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 p-12 text-center">
        <Icon name="Images" className="h-8 w-8 text-violet-bright" />
        <p className="text-fog">Aucune création pour l&apos;instant.</p>
        <Link href="/admin/creations/new" className="btn-primary mt-2">
          <Icon name="Plus" className="h-4 w-4" />
          Ajouter une création
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-fog-muted">
            <th className="px-3 py-2 font-medium">Création</th>
            <th className="px-3 py-2 font-medium">Catégorie</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Accueil</th>
            <th className="px-3 py-2 font-medium">Statut</th>
            <th className="px-3 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {creations.map((c) => {
            const cover = c.images.find((i) => i.is_cover) ?? c.images[0];
            const busy = busyId === c.id;
            return (
              <tr key={c.id} className="bg-ink/50">
                <td className="rounded-l-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-ink-raised">
                      {cover ? (
                        <Image
                          src={publicImageUrl(cover.storage_path)}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="grid h-full place-items-center text-fog-muted">
                          <Icon name="Images" className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-fog">{c.title}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-fog-muted">{c.category?.name ?? "—"}</td>
                <td className="px-3 py-2 text-fog-muted">
                  {formatDate(c.realized_on ?? c.created_at)}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => act(c.id, () => toggleFeatured(c.id, !c.featured))}
                    disabled={busy}
                    aria-pressed={c.featured}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${
                      c.featured
                        ? "border-violet-bright/60 bg-violet/15 text-violet-bright"
                        : "border-ink-border text-fog-muted"
                    }`}
                    title={c.featured ? "Retirer de l'accueil" : "Mettre en avant sur l'accueil"}
                  >
                    <Icon name="Star" className="h-3.5 w-3.5" />
                  </button>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] ${
                      c.status === "published"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/5 text-fog-muted"
                    }`}
                  >
                    {c.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="rounded-r-lg px-3 py-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/admin/creations/${c.id}/edit`}
                      className="rounded-md border border-ink-border px-2 py-1 text-xs text-fog-muted hover:text-fog"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => act(c.id, () => duplicateCreation(c.id))}
                      disabled={busy}
                      className="rounded-md border border-ink-border px-2 py-1 text-xs text-fog-muted hover:text-fog"
                    >
                      Dupliquer
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        act(c.id, () =>
                          setCreationStatus(c.id, c.status === "published" ? "draft" : "published"),
                        )
                      }
                      disabled={busy}
                      className="rounded-md border border-ink-border px-2 py-1 text-xs text-fog-muted hover:text-fog"
                    >
                      {c.status === "published" ? "Dépublier" : "Publier"}
                    </button>
                    <ConfirmButton
                      action={() => deleteCreation(c.id)}
                      confirmText={`Supprimer "${c.title}" ?`}
                    >
                      <Icon name="Trash2" className="h-3.5 w-3.5" />
                    </ConfirmButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

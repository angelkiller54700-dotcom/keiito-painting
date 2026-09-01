"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "./ConfirmButton";
import {
  createCategory,
  deleteCategory,
  reorderCategories,
  updateCategory,
} from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPublic, setNewPublic] = useState(true);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Erreur.");
      router.refresh();
    });
  }

  function add() {
    if (!newName.trim()) return;
    run(async () => {
      const res = await createCategory({
        name: newName,
        description: newDesc,
        is_public: newPublic,
      });
      if (res.ok) {
        setNewName("");
        setNewDesc("");
        setNewPublic(true);
      }
      return res;
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...categories];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    run(() => reorderCategories(next.map((c) => c.id)));
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="card-surface space-y-3 p-5">
        <h2 className="font-display text-sm uppercase tracking-wide text-fog">Nouvelle catégorie</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom (ex : Age of Sigmar)"
            className="field-input"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (facultatif)"
            className="field-input"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-fog-muted">
            <input
              type="checkbox"
              checked={newPublic}
              onChange={(e) => setNewPublic(e.target.checked)}
              className="h-4 w-4 accent-violet-bright"
            />
            Visible sur le site
          </label>
          <button type="button" onClick={add} disabled={pending || !newName.trim()} className="btn-primary !py-2">
            <Icon name="Plus" className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-fog-muted">Aucune catégorie. Ajoute-en une ci-dessus.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat, i) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              first={i === 0}
              last={i === categories.length - 1}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
              onSave={(data) => run(() => updateCategory({ id: cat.id, ...data }))}
              onDelete={() => deleteCategory(cat.id)}
              pending={pending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  first,
  last,
  onMoveUp,
  onMoveDown,
  onSave,
  onDelete,
  pending,
}: {
  category: Category;
  first: boolean;
  last: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSave: (data: { name: string; description: string; is_public: boolean }) => void;
  onDelete: () => Promise<{ ok: boolean; error?: string }>;
  pending: boolean;
}) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [isPublic, setIsPublic] = useState(category.is_public);

  const dirty =
    name !== category.name ||
    description !== (category.description ?? "") ||
    isPublic !== category.is_public;

  return (
    <li className="card-surface flex flex-wrap items-center gap-3 p-3">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={first || pending}
          className="text-fog-muted disabled:opacity-30"
          aria-label="Monter"
        >
          <Icon name="ChevronRight" className="h-4 w-4 -rotate-90" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={last || pending}
          className="text-fog-muted disabled:opacity-30"
          aria-label="Descendre"
        >
          <Icon name="ChevronRight" className="h-4 w-4 rotate-90" />
        </button>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="field-input !py-1.5 w-40 flex-shrink-0"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="field-input !py-1.5 min-w-[160px] flex-1"
      />
      <span className="text-xs text-fog-muted">/{category.slug}</span>

      <label className="flex items-center gap-2 text-xs text-fog-muted">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 accent-violet-bright"
        />
        Visible
      </label>

      <div className="ml-auto flex items-center gap-2">
        {dirty && (
          <button
            type="button"
            onClick={() => onSave({ name, description, is_public: isPublic })}
            disabled={pending}
            className="btn-primary !px-3 !py-1.5 text-[10px]"
          >
            Enregistrer
          </button>
        )}
        <ConfirmButton
          action={onDelete}
          confirmText={`Supprimer la catégorie "${category.name}" ? Les créations liées seront conservées mais sans catégorie.`}
        >
          <Icon name="Trash2" className="h-3.5 w-3.5" />
        </ConfirmButton>
      </div>
    </li>
  );
}

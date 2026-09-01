"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "./ConfirmButton";
import {
  deletePricingTier,
  reorderPricingTiers,
  savePricingTier,
} from "@/lib/actions/pricing";
import { parseLines } from "@/lib/utils";
import type { PricingTier } from "@/lib/types";

export function PricingManager({ tiers }: { tiers: PricingTier[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Erreur.");
      router.refresh();
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...tiers];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    run(() => reorderPricingTiers(next.map((x) => x.id)));
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={() => setAdding((v) => !v)} className="btn-outline !py-2">
          <Icon name="Plus" className="h-4 w-4" />
          {adding ? "Annuler" : "Nouveau niveau"}
        </button>
      </div>

      {adding && (
        <TierEditor
          onSubmit={(data) =>
            run(async () => {
              const res = await savePricingTier(data);
              if (res.ok) setAdding(false);
              return res;
            })
          }
          pending={pending}
        />
      )}

      {tiers.length === 0 && !adding ? (
        <p className="text-sm text-fog-muted">Aucun niveau de tarif. Ajoute-en un.</p>
      ) : (
        <ul className="space-y-3">
          {tiers.map((tier, i) => (
            <li key={tier.id} className="card-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || pending}
                    className="text-fog-muted disabled:opacity-30"
                    aria-label="Monter"
                  >
                    <Icon name="ChevronRight" className="h-4 w-4 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === tiers.length - 1 || pending}
                    className="text-fog-muted disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    <Icon name="ChevronRight" className="h-4 w-4 rotate-90" />
                  </button>
                </div>
                <span className="font-display text-fog">{tier.name}</span>
                {!tier.is_active && (
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-fog-muted">
                    désactivé
                  </span>
                )}
                <div className="ml-auto">
                  <ConfirmButton action={() => deletePricingTier(tier.id)}>
                    <Icon name="Trash2" className="h-3.5 w-3.5" />
                  </ConfirmButton>
                </div>
              </div>
              <TierEditor
                tier={tier}
                onSubmit={(data) => run(() => savePricingTier({ id: tier.id, ...data }))}
                pending={pending}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TierEditor({
  tier,
  onSubmit,
  pending,
}: {
  tier?: PricingTier;
  onSubmit: (data: {
    name: string;
    description: string;
    price_label: string;
    features: string[];
    is_active: boolean;
  }) => void;
  pending: boolean;
}) {
  const [name, setName] = useState(tier?.name ?? "");
  const [description, setDescription] = useState(tier?.description ?? "");
  const [priceLabel, setPriceLabel] = useState(tier?.price_label ?? "");
  const [features, setFeatures] = useState((tier?.features ?? []).join("\n"));
  const [isActive, setIsActive] = useState(tier?.is_active ?? true);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="field-label">Nom du niveau</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Prix indicatif</label>
          <input
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
            className="field-input"
            placeholder="ex : à partir de 15 € / figurine — ou « Sur devis »"
          />
        </div>
      </div>
      <div>
        <label className="field-label">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="field-input"
        />
      </div>
      <div>
        <label className="field-label">Prestations incluses (une par ligne)</label>
        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          rows={4}
          className="field-input resize-y"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-fog-muted">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-violet-bright"
          />
          Affiché sur le site
        </label>
        <button
          type="button"
          disabled={pending || !name.trim()}
          onClick={() =>
            onSubmit({
              name,
              description,
              price_label: priceLabel,
              features: parseLines(features),
              is_active: isActive,
            })
          }
          className="btn-primary !py-2"
        >
          {pending ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

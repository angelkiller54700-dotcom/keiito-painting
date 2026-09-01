"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export function ConfirmButton({
  action,
  confirmText = "Confirmer la suppression ?",
  children,
  className,
  danger = true,
}: {
  action: () => Promise<{ ok: boolean; error?: string }>;
  confirmText?: string;
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setError(res.error ?? "Erreur.");
        setArmed(false);
        return;
      }
      router.refresh();
    });
  }

  if (armed) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="rounded-md border border-red-500/50 bg-red-500/15 px-2 py-1 text-xs text-red-200"
        >
          {pending ? <Icon name="Loader2" className="h-3 w-3 animate-spin" /> : "Oui, supprimer"}
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="rounded-md border border-ink-border px-2 py-1 text-xs text-fog-muted"
        >
          Annuler
        </button>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setArmed(true);
        }}
        title={confirmText}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
          danger
            ? "border-ink-border text-fog-muted hover:border-red-500/50 hover:text-red-300"
            : "border-ink-border text-fog-muted hover:text-fog",
          className,
        )}
      >
        {children}
      </button>
      {error && <span className="ml-2 text-xs text-red-300">{error}</span>}
    </>
  );
}

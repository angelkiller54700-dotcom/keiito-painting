"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QUOTE_BUCKET } from "@/lib/storage";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "./ConfirmButton";
import { deleteQuote, updateQuoteStatus } from "@/lib/actions/quotes";
import { formatDate } from "@/lib/utils";
import { QUOTE_STATUS_LABELS, type QuoteRequest, type QuoteStatus } from "@/lib/types";

const STATUSES = Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[];

export function QuotesBoard({ quotes }: { quotes: QuoteRequest[] }) {
  const [filter, setFilter] = useState<QuoteStatus | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: quotes.length };
    for (const s of STATUSES) c[s] = quotes.filter((q) => q.status === s).length;
    return c;
  }, [quotes]);

  const visible = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Toutes ({counts.all})
        </FilterChip>
        {STATUSES.map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {QUOTE_STATUS_LABELS[s]} ({counts[s] ?? 0})
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-fog-muted">Aucune demande dans cette catégorie.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((q) => (
            <QuoteCard key={q.id} quote={q} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs ${
        active
          ? "border-violet-bright bg-violet/15 text-fog"
          : "border-ink-border text-fog-muted hover:text-fog"
      }`}
    >
      {children}
    </button>
  );
}

function QuoteCard({ quote }: { quote: QuoteRequest }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [signed, setSigned] = useState<string[]>([]);

  useEffect(() => {
    if (!open || quote.image_paths.length === 0 || signed.length > 0) return;
    const supabase = createClient();
    supabase.storage
      .from(QUOTE_BUCKET)
      .createSignedUrls(quote.image_paths, 3600)
      .then(({ data }) => {
        if (data) setSigned(data.map((d) => d.signedUrl).filter(Boolean) as string[]);
      });
  }, [open, quote.image_paths, signed.length]);

  function changeStatus(status: QuoteStatus) {
    startTransition(async () => {
      await updateQuoteStatus(quote.id, status);
      router.refresh();
    });
  }

  const rows: [string, string | null][] = [
    ["Email", quote.email],
    ["Téléphone", quote.phone],
    ["Type de projet", quote.project_type],
    ["Nombre de figurines", quote.figure_count],
    ["Type de figurines", quote.figure_type],
    ["Niveau souhaité", quote.paint_level],
    ["Budget", quote.budget],
    ["Date souhaitée", quote.desired_date],
  ];

  return (
    <li className="card-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-fog">
            {quote.name}
            <span className="ml-2 text-xs font-normal text-fog-muted">{quote.email}</span>
          </p>
          <p className="truncate text-xs text-fog-muted">
            {quote.project_type || "Projet"} · {formatDate(quote.created_at)}
            {quote.image_paths.length > 0 && ` · ${quote.image_paths.length} photo(s)`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-ink-border px-2.5 py-1 text-[11px] text-fog-muted">
            {QUOTE_STATUS_LABELS[quote.status]}
          </span>
          <Icon name="ChevronRight" className={`h-4 w-4 text-fog-muted transition ${open ? "rotate-90" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="space-y-4 border-t border-ink-border px-4 py-4">
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {rows
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="text-sm">
                  <dt className="text-[11px] uppercase tracking-wider text-fog-muted">{label}</dt>
                  <dd className="text-fog">
                    {label === "Email" ? (
                      <a href={`mailto:${value}`} className="text-violet-bright hover:underline">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
          </dl>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-fog-muted">Message</p>
            <p className="mt-1 whitespace-pre-line text-sm text-fog">{quote.message}</p>
          </div>

          {quote.image_paths.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-fog-muted">Photos jointes</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {signed.length === 0 ? (
                  <span className="text-xs text-fog-muted">Chargement des images…</span>
                ) : (
                  signed.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-20 w-20 overflow-hidden rounded-md border border-ink-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Pièce jointe" className="h-full w-full object-cover" />
                    </a>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-ink-border pt-3">
            <label className="text-xs text-fog-muted">Statut :</label>
            <select
              value={quote.status}
              onChange={(e) => changeStatus(e.target.value as QuoteStatus)}
              disabled={pending}
              className="field-input !w-auto !py-1.5 text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {QUOTE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            <a href={`mailto:${quote.email}`} className="btn-outline !py-1.5 text-[10px]">
              Répondre par email
            </a>

            <div className="ml-auto">
              <ConfirmButton
                action={() => deleteQuote(quote.id)}
                confirmText="Supprimer définitivement cette demande ?"
              >
                <Icon name="Trash2" className="h-3.5 w-3.5" />
                Supprimer
              </ConfirmButton>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

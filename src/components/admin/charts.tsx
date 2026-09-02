import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Colonnes (série temporelle)                                        */
/* ------------------------------------------------------------------ */
export function BarColumns({
  data,
  labelEvery = 5,
  valueKey = "views",
  className,
}: {
  data: { label: string; views: number; visitors?: number }[];
  labelEvery?: number;
  valueKey?: "views" | "visitors";
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d[valueKey] ?? 0));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex h-40 items-end gap-[3px]">
        {data.map((d, i) => {
          const v = d[valueKey] ?? 0;
          const h = Math.max(2, Math.round((v / max) * 100));
          return (
            <div
              key={i}
              className="group relative flex-1"
              title={`${d.label} · ${v} ${valueKey === "views" ? "vues" : "visiteurs"}`}
            >
              <div
                className="w-full rounded-t bg-violet/40 transition-colors group-hover:bg-violet-bright"
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-[3px] text-[10px] text-fog-muted">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            {i % labelEvery === 0 ? d.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Liste classée (barres horizontales)                                */
/* ------------------------------------------------------------------ */
export function BarList({
  items,
  emptyLabel = "Aucune donnée",
  unit = "",
}: {
  items: { key: string; label: string; value: number }[];
  emptyLabel?: string;
  unit?: string;
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-fog-muted">{emptyLabel}</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.key} className="relative">
          <div
            className="absolute inset-y-0 left-0 rounded bg-violet/15"
            style={{ width: `${Math.max(6, (it.value / max) * 100)}%` }}
          />
          <div className="relative flex items-center justify-between gap-3 px-2.5 py-1.5 text-sm">
            <span className="truncate text-fog">{it.label}</span>
            <span className="shrink-0 font-medium text-fog-muted">
              {it.value.toLocaleString("fr-FR")}
              {unit}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge de tendance                                                  */
/* ------------------------------------------------------------------ */
export function TrendPill({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-xs text-fog-muted">—</span>;
  }
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        up ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300",
      )}
    >
      {up ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

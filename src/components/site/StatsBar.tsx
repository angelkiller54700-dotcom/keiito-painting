import { Icon } from "@/components/ui/Icon";
import { Reveal } from "./Reveal";
import type { StatsSettings } from "@/lib/types";

export function StatsBar({ stats }: { stats: StatsSettings }) {
  const items = stats.items.filter((s) => s.value.trim() && s.label.trim());
  if (!stats.enabled || items.length === 0) return null;

  return (
    <Reveal
      as="section"
      className="border-y border-ink-border bg-ink-soft/60"
    >
      <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {items.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <Icon name="Star" className="h-5 w-5 text-violet-bright" />
            <div>
              <div className="font-display text-2xl text-fog">{s.value}</div>
              <div className="text-xs text-fog-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

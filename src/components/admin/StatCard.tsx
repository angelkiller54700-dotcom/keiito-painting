import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function StatCard({
  label,
  value,
  icon,
  href,
  accent = false,
}: {
  label: string;
  value: number | string;
  icon: string;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <div
      className={`card-surface flex items-center gap-4 p-5 transition-colors ${
        href ? "hover:border-violet-bright/50" : ""
      } ${accent ? "border-violet-bright/40" : ""}`}
    >
      <span className="grid h-11 w-11 place-items-center rounded-lg border border-ink-border bg-violet/10 text-violet-bright">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-2xl text-fog">{value}</div>
        <div className="text-xs text-fog-muted">{label}</div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

import { Icon } from "@/components/ui/Icon";

export function EmptyState({
  title = "Aucune création publiée pour le moment.",
  hint = "Reviens bientôt : la galerie se remplit au fil des projets.",
  icon = "Images",
}: {
  title?: string;
  hint?: string;
  icon?: string;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-ink-border bg-violet/10 text-violet-bright">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="text-lg font-semibold text-fog">{title}</p>
      <p className="max-w-sm text-sm text-fog-muted">{hint}</p>
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminGetStats, adminListQuotes } from "@/lib/admin-queries";
import { StatCard } from "@/components/admin/StatCard";
import { Icon } from "@/components/ui/Icon";
import { QUOTE_STATUS_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const [stats, quotes] = await Promise.all([adminGetStats(), adminListQuotes()]);
  const recent = quotes.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase text-fog">Bonjour {admin.displayName}</h1>
          <p className="text-sm text-fog-muted">Vue d&apos;ensemble de ton portfolio.</p>
        </div>
        <Link href="/admin/creations/new" className="btn-primary">
          <Icon name="Plus" className="h-4 w-4" />
          Ajouter une création
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Créations publiées" value={stats.published} icon="Images" href="/admin/creations" />
        <StatCard label="Créations en brouillon" value={stats.drafts} icon="EyeOff" href="/admin/creations" />
        <StatCard label="Catégories" value={stats.categories} icon="Tags" href="/admin/categories" />
        <StatCard
          label="Demandes de devis"
          value={stats.quotesTotal}
          icon="Inbox"
          href="/admin/demandes"
          accent={stats.quotesNew > 0}
        />
      </div>

      {stats.quotesNew > 0 && (
        <div className="rounded-lg border border-violet-bright/40 bg-violet/10 px-4 py-3 text-sm text-fog">
          {stats.quotesNew} nouvelle{stats.quotesNew > 1 ? "s" : ""} demande
          {stats.quotesNew > 1 ? "s" : ""} de devis à traiter.{" "}
          <Link href="/admin/demandes" className="font-semibold text-violet-bright underline">
            Voir
          </Link>
        </div>
      )}

      <div className="card-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg uppercase text-fog">Dernières demandes</h2>
          <Link href="/admin/demandes" className="text-xs text-violet-bright hover:underline">
            Tout voir
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-fog-muted">Aucune demande pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-ink-border/60">
            {recent.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-fog">{q.name}</p>
                  <p className="truncate text-xs text-fog-muted">
                    {q.project_type || "Projet"} · {formatDate(q.created_at)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-ink-border px-2.5 py-1 text-[11px] text-fog-muted">
                  {QUOTE_STATUS_LABELS[q.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

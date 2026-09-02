import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminGetTrafficAnalytics, adminGetActivityAnalytics } from "@/lib/admin-analytics";
import { BarColumns, BarList, TrendPill } from "@/components/admin/charts";
import { Icon } from "@/components/ui/Icon";

const RANGES = [7, 30, 90];

export const metadata = { title: "Statistiques" };

export default async function StatistiquesPage({
  searchParams,
}: {
  searchParams: { j?: string };
}) {
  await requireAdmin();
  const range = RANGES.includes(Number(searchParams.j)) ? Number(searchParams.j) : 30;

  const [traffic, activity] = await Promise.all([
    adminGetTrafficAnalytics(range),
    adminGetActivityAnalytics(6),
  ]);

  const totalVisitorsWindow = traffic.byDay.reduce((s, d) => s + d.visitors, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase text-fog">Statistiques</h1>
          <p className="text-sm text-fog-muted">
            Audience du site et activité — comparé aux {range} jours précédents.
          </p>
        </div>
        <div className="flex rounded-md border border-ink-border p-0.5 text-xs">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/statistiques?j=${r}`}
              className={`rounded px-3 py-1.5 font-medium ${
                r === range ? "bg-violet/20 text-fog" : "text-fog-muted hover:text-fog"
              }`}
            >
              {r} j
            </Link>
          ))}
        </div>
      </div>

      {/* ---------- Trafic ---------- */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-fog-muted">
          Audience
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Pages vues" value={traffic.totalViews} trend={traffic.trend.views} />
          <Kpi
            label="Visiteurs uniques"
            value={traffic.uniqueVisitors}
            trend={traffic.trend.visitors}
          />
          <Kpi label="Pages / visiteur" value={traffic.viewsPerVisitor} />
          <Kpi
            label="Demandes de devis"
            value={traffic.quoteRequests}
            trend={traffic.trend.quotes}
          />
        </div>

        <div className="card-surface p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="font-display text-sm uppercase tracking-wide text-fog">
              Pages vues par jour
            </h3>
            <span className="text-xs text-fog-muted">
              {totalVisitorsWindow.toLocaleString("fr-FR")} visiteurs cumulés
              {traffic.peakDay && traffic.peakDay.views > 0
                ? ` · pic le ${traffic.peakDay.label} (${traffic.peakDay.views})`
                : ""}
            </span>
          </div>
          {traffic.hasData ? (
            <BarColumns data={traffic.byDay} labelEvery={range <= 7 ? 1 : range <= 30 ? 3 : 10} />
          ) : (
            <EmptyTraffic />
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Pages les plus vues">
            <BarList items={traffic.topPages} emptyLabel="Aucune vue sur la période" />
          </Card>
          <Card title="Sources de trafic">
            <BarList items={traffic.sources} emptyLabel="Aucune source pour l'instant" />
          </Card>
          <Card title="Créations les plus consultées">
            <BarList
              items={traffic.topCreations}
              emptyLabel="Aucune création consultée sur la période"
            />
          </Card>
          <Card title="Appareils">
            <BarList items={traffic.devices} emptyLabel="Pas encore de données" />
          </Card>
        </div>
      </section>

      {/* ---------- Activité ---------- */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-fog-muted">
          Activité
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Créations publiées" value={activity.totalPublished} />
          <Kpi label="Brouillons" value={activity.totalDrafts} />
          <Kpi label="Demandes reçues (total)" value={activity.totalQuotes} />
          <Kpi
            label="Taux de conversion devis"
            value={activity.conversionRate === null ? "—" : `${activity.conversionRate}%`}
            hint="Devis acceptés ou terminés / devis tranchés"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Créations publiées par mois">
            <BarColumns data={activity.creationsByMonth.map((m) => ({ label: m.label, views: m.value }))} labelEvery={1} />
          </Card>
          <Card title="Demandes de devis par mois">
            <BarColumns data={activity.quotesByMonth.map((m) => ({ label: m.label, views: m.value }))} labelEvery={1} />
          </Card>
          <Card title="Demandes de devis par statut">
            <BarList items={activity.quotesByStatus} emptyLabel="Aucune demande" />
          </Card>
          <Card title="Créations publiées par catégorie">
            <BarList items={activity.creationsByCategory} emptyLabel="Aucune création publiée" />
          </Card>
        </div>
      </section>

      <p className="text-xs text-fog-muted">
        Mesure d&apos;audience intégrée, sans cookie ni donnée personnelle. Les visites des pages
        d&apos;administration ne sont pas comptées.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  trend,
  hint,
}: {
  label: string;
  value: number | string;
  trend?: number | null;
  hint?: string;
}) {
  return (
    <div className="card-surface p-5" title={hint}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-fog-muted">{label}</span>
        {trend !== undefined && <TrendPill value={trend} />}
      </div>
      <div className="mt-2 font-display text-2xl text-fog">
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-surface p-5">
      <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-fog">{title}</h3>
      {children}
    </div>
  );
}

function EmptyTraffic() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Icon name="BarChart3" className="h-7 w-7 text-violet-bright" />
      <p className="text-sm text-fog">La mesure d&apos;audience est active.</p>
      <p className="max-w-sm text-xs text-fog-muted">
        Les visites apparaîtront ici au fil du temps. Reviens dans quelques heures / jours.
      </p>
    </div>
  );
}

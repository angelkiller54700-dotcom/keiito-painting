import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForms } from "@/components/admin/SettingsForms";

export default async function AdminParametresPage() {
  const [admin, settings] = await Promise.all([requireAdmin(), getSiteSettings()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase text-fog">Paramètres</h1>
        <p className="text-sm text-fog-muted">
          Textes du site, réseaux sociaux, SEO et compte administrateur.
        </p>
      </div>
      <SettingsForms settings={settings} displayName={admin.displayName} />
    </div>
  );
}

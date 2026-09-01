import { adminListPricingTiers } from "@/lib/admin-queries";
import { PricingManager } from "@/components/admin/PricingManager";

export default async function AdminTarifsPage() {
  const tiers = await adminListPricingTiers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase text-fog">Tarifs</h1>
        <p className="text-sm text-fog-muted">
          Modifie les niveaux de finition, leurs prix indicatifs et les prestations affichées sur la
          page Tarifs.
        </p>
      </div>
      <PricingManager tiers={tiers} />
    </div>
  );
}

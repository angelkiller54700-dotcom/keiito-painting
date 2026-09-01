import Link from "next/link";
import { adminListCreations } from "@/lib/admin-queries";
import { CreationsTable } from "@/components/admin/CreationsTable";
import { Icon } from "@/components/ui/Icon";

export default async function AdminCreationsPage() {
  const creations = await adminListCreations();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase text-fog">Créations</h1>
          <p className="text-sm text-fog-muted">
            {creations.length} création{creations.length > 1 ? "s" : ""} · gère la galerie publique.
          </p>
        </div>
        <Link href="/admin/creations/new" className="btn-primary">
          <Icon name="Plus" className="h-4 w-4" />
          Ajouter une création
        </Link>
      </div>

      <CreationsTable creations={creations} />
    </div>
  );
}

import { adminListQuotes } from "@/lib/admin-queries";
import { QuotesBoard } from "@/components/admin/QuotesBoard";

export default async function AdminDemandesPage() {
  const quotes = await adminListQuotes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase text-fog">Demandes de devis</h1>
        <p className="text-sm text-fog-muted">
          {quotes.length} demande{quotes.length > 1 ? "s" : ""} reçue{quotes.length > 1 ? "s" : ""} via le formulaire de contact.
        </p>
      </div>
      <QuotesBoard quotes={quotes} />
    </div>
  );
}

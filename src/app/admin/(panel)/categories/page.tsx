import { adminListCategories } from "@/lib/admin-queries";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await adminListCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase text-fog">Catégories</h1>
        <p className="text-sm text-fog-muted">
          Elles alimentent les filtres de la galerie et le classement des créations.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}

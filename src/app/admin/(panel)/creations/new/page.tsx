import { adminListCategories } from "@/lib/admin-queries";
import { CreationForm } from "@/components/admin/CreationForm";

export default async function NewCreationPage() {
  const categories = await adminListCategories();
  return <CreationForm categories={categories} />;
}

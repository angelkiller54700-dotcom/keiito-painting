import { notFound } from "next/navigation";
import { adminGetCreation, adminListCategories } from "@/lib/admin-queries";
import { CreationForm } from "@/components/admin/CreationForm";

export default async function EditCreationPage({ params }: { params: { id: string } }) {
  const [creation, categories] = await Promise.all([
    adminGetCreation(params.id),
    adminListCategories(),
  ]);
  if (!creation) notFound();

  return <CreationForm categories={categories} creation={creation} />;
}

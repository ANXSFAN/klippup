import EntityManager from "@/components/admin/EntityManager";
import { getAdminCategories } from "@/lib/queries";
import { createCategory, deleteCategory, updateCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const rows = await getAdminCategories();
  return (
    <EntityManager
      entity="categories"
      hasGlyph={false}
      rows={rows}
      createAction={createCategory}
      updateAction={updateCategory}
      deleteAction={deleteCategory}
    />
  );
}

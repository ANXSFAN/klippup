import EntityManager from "@/components/admin/EntityManager";
import { getAdminPlatforms } from "@/lib/queries";
import { createPlatform, deletePlatform, updatePlatform } from "./actions";

export default async function AdminPlatformsPage() {
  const rows = await getAdminPlatforms();
  return (
    <EntityManager
      entity="platforms"
      hasGlyph
      rows={rows}
      createAction={createPlatform}
      updateAction={updatePlatform}
      deleteAction={deletePlatform}
    />
  );
}

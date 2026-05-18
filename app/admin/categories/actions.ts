"use server";
import { prisma } from "@/lib/db";
import { parseSortOrder, prismaErrorCode, revalidateAdmin } from "@/lib/admin-utils";
import { entityFormSchema, type EntityActionResult, type EntityFormValues } from "@/lib/validators";

export async function createCategory(values: EntityFormValues): Promise<EntityActionResult> {
  const parsed = entityFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;
  try {
    await prisma.category.create({
      data: { slug: v.slug.trim(), label: v.label.trim(), sortOrder: parseSortOrder(v.sortOrder) }
    });
    revalidateAdmin("/admin/categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: prismaErrorCode(e) };
  }
}

export async function updateCategory(
  id: string,
  values: EntityFormValues
): Promise<EntityActionResult> {
  const parsed = entityFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;
  try {
    await prisma.category.update({
      where: { id },
      data: { slug: v.slug.trim(), label: v.label.trim(), sortOrder: parseSortOrder(v.sortOrder) }
    });
    revalidateAdmin("/admin/categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: prismaErrorCode(e) };
  }
}

export async function deleteCategory(id: string): Promise<EntityActionResult> {
  try {
    const count = await prisma.campaign.count({ where: { categoryId: id } });
    if (count > 0) return { ok: false, error: `IN_USE:${count}` };
    await prisma.category.delete({ where: { id } });
    revalidateAdmin("/admin/categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: prismaErrorCode(e) };
  }
}

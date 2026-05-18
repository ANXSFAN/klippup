"use server";
import { prisma } from "@/lib/db";
import { parseSortOrder, prismaErrorCode, revalidateAdmin } from "@/lib/admin-utils";
import { entityFormSchema, type EntityActionResult, type EntityFormValues } from "@/lib/validators";

/** A platform always needs a short glyph; derive one from the slug if blank. */
function resolveGlyph(slug: string, glyph: string): string {
  const fromInput = glyph.trim();
  if (fromInput) return fromInput.slice(0, 4);
  const fromSlug = slug.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase();
  return fromSlug || "??";
}

export async function createPlatform(values: EntityFormValues): Promise<EntityActionResult> {
  const parsed = entityFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;
  try {
    await prisma.platform.create({
      data: {
        slug: v.slug.trim(),
        label: v.label.trim(),
        glyph: resolveGlyph(v.slug, v.glyph),
        sortOrder: parseSortOrder(v.sortOrder)
      }
    });
    revalidateAdmin("/admin/platforms");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: prismaErrorCode(e) };
  }
}

export async function updatePlatform(
  id: string,
  values: EntityFormValues
): Promise<EntityActionResult> {
  const parsed = entityFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;
  try {
    await prisma.platform.update({
      where: { id },
      data: {
        slug: v.slug.trim(),
        label: v.label.trim(),
        glyph: resolveGlyph(v.slug, v.glyph),
        sortOrder: parseSortOrder(v.sortOrder)
      }
    });
    revalidateAdmin("/admin/platforms");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: prismaErrorCode(e) };
  }
}

export async function deletePlatform(id: string): Promise<EntityActionResult> {
  try {
    const count = await prisma.campaignPlatform.count({ where: { platformId: id } });
    if (count > 0) return { ok: false, error: `IN_USE:${count}` };
    await prisma.platform.delete({ where: { id } });
    revalidateAdmin("/admin/platforms");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: prismaErrorCode(e) };
  }
}

"use server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { campaignFormSchema, type CampaignFormValues } from "@/lib/validators";
import type { PlacementSlot } from "@/lib/types";

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

function toInt(s: string): number {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function buildScalarData(v: CampaignFormValues) {
  const earnings: Record<string, { rate: string; min: string; max: string }> = {};
  for (const k of ["tiktok", "youtube", "instagram"] as const) {
    const r = v.earnings[k];
    if (r.rate.trim() || r.min.trim() || r.max.trim()) {
      earnings[k] = { rate: r.rate.trim(), min: r.min.trim(), max: r.max.trim() };
    }
  }
  const topEarners = v.topEarners
    .filter((t) => t.name.trim())
    .map((t) => ({ views: toInt(t.views), name: t.name.trim() }));
  const resources = v.resources
    .filter((r) => r.name.trim())
    .map((r) => ({
      name: r.name.trim(),
      subtitle: r.subtitle.trim(),
      kind: r.kind,
      ...(r.url.trim() ? { url: r.url.trim() } : {})
    }));
  const requirements = v.requirements.map((r) => r.value.trim()).filter(Boolean);
  const viewsSeries = v.viewsSeries
    .split(/[\s,]+/)
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n));

  return {
    brand: v.brand.trim(),
    brandVerified: v.brandVerified,
    title: v.title.trim(),
    artTitle: v.artTitle.trim() || null,
    description: v.description.trim(),
    coverUrl: v.coverUrl.trim(),
    categoryId: v.categoryId,
    categoryLabel: v.categoryLabel.trim() || null,
    raised: toInt(v.raised),
    budget: Math.max(1, toInt(v.budget)),
    participants: toInt(v.participants),
    rate: v.rate.trim(),
    launchedAt: v.launchedAt ? new Date(v.launchedAt) : new Date(),
    hot: v.hot,
    status: v.status,
    poweredBy: v.poweredBy.trim() || null,
    requirements,
    earnings: Object.keys(earnings).length ? earnings : Prisma.DbNull,
    topEarners: topEarners.length ? topEarners : Prisma.DbNull,
    resources: resources.length ? resources : Prisma.DbNull,
    totalViews: v.totalViews.trim() || null,
    viewsSeries
  } satisfies Prisma.CampaignUncheckedCreateInput;
}

async function placementCreateData(slots: PlacementSlot[], excludeCampaignId?: string) {
  const rows: { slot: PlacementSlot; sortOrder: number }[] = [];
  for (const slot of [...new Set(slots)]) {
    const agg = await prisma.campaignPlacement.aggregate({
      where: {
        slot,
        ...(excludeCampaignId ? { campaignId: { not: excludeCampaignId } } : {})
      },
      _max: { sortOrder: true }
    });
    rows.push({ slot, sortOrder: (agg._max.sortOrder ?? -1) + 1 });
  }
  return rows;
}

function platformCreateData(platformIds: string[]) {
  return [...new Set(platformIds)].map((platformId, order) => ({ platformId, order }));
}

function revalidate(id?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/campaigns");
  if (id) revalidatePath(`/admin/campaigns/${id}/edit`);
}

export async function createCampaign(values: CampaignFormValues): Promise<ActionResult> {
  const parsed = campaignFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Invalid form data" };
  const v = parsed.data;
  try {
    const placements = await placementCreateData(v.placements);
    const created = await prisma.campaign.create({
      data: {
        ...buildScalarData(v),
        platforms: { create: platformCreateData(v.platformIds) },
        placements: { create: placements }
      }
    });
    revalidate();
    return { ok: true, id: created.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateCampaign(
  id: string,
  values: CampaignFormValues
): Promise<ActionResult> {
  const parsed = campaignFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Invalid form data" };
  const v = parsed.data;
  try {
    const placements = await placementCreateData(v.placements, id);
    await prisma.campaign.update({
      where: { id },
      data: {
        ...buildScalarData(v),
        platforms: { deleteMany: {}, create: platformCreateData(v.platformIds) },
        placements: { deleteMany: {}, create: placements }
      }
    });
    revalidate(id);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  try {
    await prisma.campaign.delete({ where: { id } });
    revalidate();
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Inline "publish" button on /admin/campaigns — flips a DRAFT campaign to
 * PUBLISHED so brand-created campaigns can go live without opening the
 * full edit form.
 */
export async function publishCampaign(id: string): Promise<ActionResult> {
  try {
    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: "PUBLISHED" },
      select: { id: true, title: true, brandUserId: true }
    });
    if (updated.brandUserId) {
      await createNotification({
        userId: updated.brandUserId,
        type: "CAMPAIGN_PUBLISHED",
        payload: { campaignTitle: updated.title },
        link: `/brand/campaigns`
      });
    }
    revalidate();
    return { ok: true, id: updated.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

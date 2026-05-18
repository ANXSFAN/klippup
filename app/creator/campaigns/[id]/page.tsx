import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CampaignDetailClient from "./CampaignDetailClient";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth";
import { getCreatorCampaignDetail } from "@/lib/creator-queries";
import { formatMoney } from "@/lib/format";

export default async function CreatorCampaignDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const detail = await getCreatorCampaignDetail(profile.id, id);
  if (!detail) notFound();

  const t = await getTranslations("creator.campaignDetail");
  const progress =
    detail.budget > 0 ? Math.min(100, (detail.raised / detail.budget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={detail.cover} alt={detail.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <Badge variant="outline" className="border-white/40 text-white/90 bg-white/10 mb-2">
            {detail.categoryLabel}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{detail.title}</h1>
          <p className="text-sm text-white/85 mt-1">{detail.brand}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-semibold">{t("about")}</h2>
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
              {detail.description}
            </p>
          </section>

          {detail.requirements.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-base font-semibold">{t("requirements")}</h2>
              <ul className="text-sm text-foreground/80 list-disc pl-5 space-y-1">
                {detail.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          <CampaignDetailClient
            campaignId={detail.id}
            platforms={detail.platforms}
            mySubmissions={detail.mySubmissions}
          />
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">{t("progress")}</div>
              <div className="text-lg font-semibold tabular-nums">
                {formatMoney(detail.raised)}{" "}
                <span className="text-sm text-muted-foreground font-normal">
                  / {formatMoney(detail.budget)}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">{t("rate")}</div>
                <div className="font-semibold">{detail.rate}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("participants")}</div>
                <div className="font-semibold tabular-nums">{detail.participants}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t("platforms")}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {detail.platforms.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 text-xs bg-secondary rounded px-2 py-0.5"
                  >
                    <span className="font-semibold">{p.glyph}</span>
                    <span>{p.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import type { CreatorCampaignCard } from "@/lib/types";

export default async function CreatorCampaignGrid({
  campaigns
}: {
  campaigns: CreatorCampaignCard[];
}) {
  const t = await getTranslations("creator.campaignList");

  if (campaigns.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        {t("empty")}
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {campaigns.map((c) => {
        const progress = c.budget > 0 ? Math.min(100, (c.raised / c.budget) * 100) : 0;
        return (
          <Link
            key={c.id}
            href={`/creator/campaigns/${c.id}`}
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          >
            <Card className="overflow-hidden h-full flex flex-col transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
              <div className="relative w-full aspect-[16/10] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.cover}
                  alt={c.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {c.mySubmissionCount > 0 && (
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    {t("mySubmissions", { count: c.mySubmissionCount })}
                  </Badge>
                )}
                <Badge className="absolute top-2 left-2" variant="outline">
                  {c.categoryLabel}
                </Badge>
              </div>
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-medium truncate">{c.brand}</span>
                  {c.platformGlyphs.length > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      {c.platformGlyphs.slice(0, 4).map((g, i) => (
                        <span
                          key={i}
                          className="size-4 inline-flex items-center justify-center rounded bg-secondary text-[9px] font-semibold"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                  {c.title}
                </h3>
                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] tabular-nums">
                    <span>
                      <span className="font-semibold">{formatMoney(c.raised)}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {formatMoney(c.budget)}
                      </span>
                    </span>
                    <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-medium">
                      {c.rate}
                    </span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

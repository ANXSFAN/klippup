"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubmissionForm from "@/components/creator/SubmissionForm";
import SubmissionStatusBadge from "@/components/creator/SubmissionStatusBadge";
import type { CampaignPlatformOption, CreatorSubmissionRow } from "@/lib/types";

interface Props {
  campaignId: string;
  platforms: CampaignPlatformOption[];
  mySubmissions: CreatorSubmissionRow[];
}

export default function CampaignDetailClient({
  campaignId,
  platforms,
  mySubmissions
}: Props) {
  const t = useTranslations("creator.campaignDetail");
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("mySubmissions")}</h2>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4 mr-1" />
          {t("submitClip")}
        </Button>
      </div>

      {mySubmissions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center bg-secondary/40 rounded-md">
          {t("noSubmissionsYet")}
        </p>
      ) : (
        <div className="rounded-md border divide-y bg-card">
          {mySubmissions.map((s) => (
            <div key={s.id} className="p-3 flex items-center gap-3">
              <span className="size-7 inline-flex items-center justify-center rounded bg-secondary text-xs font-semibold shrink-0">
                {s.platformGlyph}
              </span>
              <a
                href={s.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline truncate flex-1 inline-flex items-center gap-1"
              >
                <span className="truncate">{s.videoUrl}</span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
              {s.viewsClaimed != null && (
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {t("viewsClaimed", { views: s.viewsClaimed.toLocaleString() })}
                </span>
              )}
              <SubmissionStatusBadge status={s.status} />
            </div>
          ))}
        </div>
      )}

      <SubmissionForm
        open={open}
        onOpenChange={setOpen}
        campaignId={campaignId}
        platforms={platforms}
      />
    </section>
  );
}

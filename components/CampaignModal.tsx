"use client";
import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { CampaignView } from "@/lib/types";
import { CloseIcon, ExternalLinkIcon } from "./Icons";
import CampaignDetail from "./CampaignDetail";

/**
 * Modal wrapper that hosts the shared <CampaignDetail/>. Owns backdrop, ESC
 * handler, body scroll lock, and the "open in own page" affordance.
 */
export default function CampaignModal({
  open,
  campaign,
  onClose
}: {
  open: boolean;
  campaign: CampaignView | null;
  onClose: () => void;
}) {
  const t = useTranslations();
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !campaign) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center backdrop-dim"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-[860px] sm:my-10 max-h-[100dvh] sm:max-h-[92vh] overflow-y-auto bg-bg sm:rounded-card shadow-card border border-line"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="sm:hidden absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white"
        >
          <CloseIcon size={16} />
        </button>
        <Link
          href={`/campaigns/${campaign.id}`}
          aria-label={t("common.openPage")}
          title={t("common.openPage")}
          className="hidden sm:flex absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/75 items-center justify-center text-white backdrop-blur transition"
        >
          <ExternalLinkIcon size={15} />
        </Link>
        <CampaignDetail c={campaign} />
      </div>
    </div>
  );
}

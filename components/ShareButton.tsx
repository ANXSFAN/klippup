"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShareIcon } from "./Icons";

/**
 * Share affordance for a campaign:
 *  - mobile / supported browsers → native share sheet via navigator.share
 *  - fallback → copies the /campaigns/[id] URL to clipboard and toasts
 *
 * Used inside the home modal and on hover-expanded cards; both wrappers are
 * clickable, so we stop event propagation to avoid triggering the wrapper.
 */
export default function ShareButton({
  campaignId,
  title,
  description,
  size = 15,
  className
}: {
  campaignId: string;
  title: string;
  description?: string;
  size?: number;
  className: string;
}) {
  const t = useTranslations("common");

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/campaigns/${campaignId}`
        : `/campaigns/${campaignId}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        // any other error falls through to clipboard fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("linkCopied"));
    } catch {
      toast.error(t("shareError"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t("share")}
      className={className}
    >
      <ShareIcon size={size} />
    </button>
  );
}

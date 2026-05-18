"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import type { CampaignView } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import {
  PeopleIcon,
  PlusIcon,
  VerifiedIcon,
  ShareIcon,
  platformGlyph
} from "./Icons";
import SmartImage from "./SmartImage";
import BrandAvatar from "./BrandAvatar";

/**
 * The card surface. Rendered twice per slot:
 * - once as an invisible "ghost" to hold the grid slot at the collapsed height
 * - once as the real, absolutely-positioned, hover-interactive card on top
 */
function CardSurface({
  c,
  onOpen,
  withExpand
}: {
  c: CampaignView;
  onOpen?: (c: CampaignView) => void;
  withExpand: boolean;
}) {
  const t = useTranslations();
  return (
    <div className="card-glass rounded-card overflow-hidden flex flex-col">
      {/* cover */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-black">
        <SmartImage
          src={c.cover}
          alt={c.title}
          fallbackSeed={c.id}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {c.artTitle && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="font-black uppercase text-white/95 text-center leading-[0.95]"
              style={{
                fontSize: "26px",
                fontFamily:
                  'Impact, "Arial Black", "Bebas Neue", system-ui, sans-serif',
                textShadow: "0 2px 16px rgba(0,0,0,0.5)"
              }}
            >
              {c.artTitle}
            </span>
          </div>
        )}
        {/* bottom darken — keeps the artTitle legible on bright photos */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-black/30" />
        {/* image → info-area soft fade — barely-there wash of the card surface
            (#F7F7F5) over the bottom ~10px so the seam with the info area softens
            without obscuring the image */}
        <div
          className="absolute inset-x-0 bottom-0 h-3 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(247,247,245,0) 0%, rgba(247,247,245,0.55) 100%)"
          }}
        />
      </div>

      {/* info */}
      <div className="px-3 pt-2 pb-2.5 flex flex-col">
        {/* brand row */}
        <div className="flex items-center gap-1.5 text-[11px] text-black/80">
          <BrandAvatar name={c.brand} size={16} />
          <span className="font-medium truncate max-w-[110px]">{c.brand}</span>
          {c.brandVerified && <VerifiedIcon size={11} />}
          <span className="ml-0.5 text-black/40">{t("common.daysShort", { days: c.ageDays })}</span>
          <PlusIcon size={10} className="ml-0.5 text-black/55" />
          <div className="flex items-center gap-0.5 ml-auto">
            {c.platforms.slice(0, 3).map((p) => (
              <span key={p} className="opacity-90">
                {platformGlyph(p, 11)}
              </span>
            ))}
          </div>
        </div>

        {/* title */}
        <h3 className="mt-1 text-[12.5px] font-semibold text-ink truncate leading-tight">
          {c.title}
        </h3>

        {/* expand-pane lives only in the real card, hidden by default, revealed on hover */}
        {withExpand && (
          <div className="expand-pane">
            <div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-black/65 line-clamp-3">
                {c.description}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen?.(c);
                  }}
                  className="btn-join flex-1 text-[12px] font-semibold rounded-full px-3 py-1.5 transition"
                >
                  {t("common.joinCampaign")}
                </button>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={t("common.share")}
                  className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] transition flex items-center justify-center text-black/70 shrink-0"
                >
                  <ShareIcon size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* payout */}
        <div className="mt-2 flex items-center gap-2">
          <div className="text-[11px] tabular-nums whitespace-nowrap">
            <span className="font-semibold text-ink">{formatMoney(c.raised)}</span>
            <span className="text-black/40"> / {formatMoney(c.budget)}</span>
          </div>
          <div className="flex-1 h-[2px] bg-black/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full progress-fill"
              style={{ width: `${Math.min(100, (c.raised / c.budget) * 100)}%` }}
            />
          </div>
        </div>

        {/* bottom row */}
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10.5px] text-black/55">
            <PeopleIcon size={11} />
            <span className="tabular-nums">{c.participants}</span>
          </div>
          <span className="text-[10px] font-medium text-ink bg-black/[0.05] rounded px-1.5 py-[2px] tabular-nums">
            {c.rate}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CampaignCard({
  c,
  onOpen
}: {
  c: CampaignView;
  onOpen: (c: CampaignView) => void;
}) {
  return (
    <div className="relative">
      {/* GHOST: holds the grid slot at the collapsed height — invisible, non-interactive */}
      <div aria-hidden className="invisible pointer-events-none">
        <CardSurface c={c} withExpand={false} />
      </div>
      {/* REAL: absolutely positioned over the ghost, expands on hover without affecting siblings */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(c)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(c);
          }
        }}
        className="absolute top-0 inset-x-0 group cursor-pointer origin-center transition-transform duration-[220ms] ease-out hover:-translate-y-[46px] hover:scale-[1.04] hover:z-30 focus-within:z-30 focus:outline-none [&:hover>div]:shadow-[0_18px_42px_rgba(15,15,15,0.16)]"
      >
        <CardSurface c={c} onOpen={onOpen} withExpand={true} />
      </div>
    </div>
  );
}

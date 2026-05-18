"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import type { CampaignView } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import SmartImage from "./SmartImage";

export default function HeroCampaign({
  campaigns,
  onOpen
}: {
  campaigns: CampaignView[];
  onOpen: (c: CampaignView) => void;
}) {
  const t = useTranslations();
  const [idx, setIdx] = React.useState(0);
  const total = campaigns.length;
  const c = campaigns[idx];

  const go = (dir: "prev" | "next") =>
    setIdx((i) => (dir === "next" ? (i + 1) % total : (i - 1 + total) % total));

  return (
    <section className="relative bg-bg">
      {/* full-bleed media — no card frame, edge to edge — height scales with viewport so it never feels squashed */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(520px, 72vh, 1080px)" }}
      >
        <SmartImage
          src={c.cover}
          alt={c.title}
          fallbackSeed={c.id}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* darken from left so left text stays legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
        {/* darken from top-right so the artTitle keeps contrast on bright photos */}
        <div className="absolute inset-0 bg-gradient-to-bl from-black/35 via-transparent to-transparent" />

        {/* art title in top-right (faint, behind primary text) */}
        {c.artTitle && (
          <div className="absolute top-6 right-6 lg:top-8 lg:right-10 hidden md:flex flex-col items-end text-right pointer-events-none">
            <h1
              className="font-black uppercase tracking-tight leading-[0.88] text-white whitespace-pre-line"
              style={{
                fontSize: "clamp(40px, 5.4vw, 96px)",
                fontFamily:
                  'Impact, "Arial Black", "Bebas Neue", system-ui, sans-serif',
                letterSpacing: "-0.01em",
                color: "rgba(255,255,255,0.92)",
                textShadow: "0 2px 24px rgba(0,0,0,0.55)"
              }}
            >
              {c.artTitle}
            </h1>
            {c.poweredBy && (
              <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-white/55">
                {t("hero.poweredBy")}{" "}
                <span className="font-semibold text-white/85">{c.poweredBy}</span>
              </div>
            )}
          </div>
        )}

        {/* primary label group — pulled UP and slightly RIGHT into the upper-mid
           portion of the photo, so it sits comfortably above the bottom
           fade-to-white (which would otherwise wash out the white text) */}
        <div className="absolute left-8 sm:left-14 lg:left-20 bottom-[18%] right-4 sm:right-6 lg:right-10 flex items-end justify-between gap-4 z-10">
          <div className="flex flex-col gap-2 max-w-[78%]">
            <h2
              className="text-white font-semibold leading-[1.05] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
              style={{ fontSize: "clamp(22px, 2.4vw, 32px)" }}
            >
              {c.title}
            </h2>
            <div className="flex items-center gap-2 text-[11.5px] sm:text-[12.5px] text-white/70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
              <span>{c.categoryLabel}</span>
              <span className="text-white/40">·</span>
              <span className="tabular-nums">{t("hero.rateViews", { rate: c.rate })}</span>
              <span className="text-white/40">·</span>
              <span className="tabular-nums">{formatMoney(c.budget)}</span>
            </div>
            <button
              type="button"
              onClick={() => onOpen(c)}
              className="btn-join mt-1 self-start text-[13px] font-semibold rounded-full px-5 py-2 transition"
            >
              {t("common.joinCampaign")}
            </button>
          </div>

          {/* carousel arrows — only when there's more than one slide */}
          {total > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 mb-1">
              <button
                type="button"
                onClick={() => go("prev")}
                aria-label={t("hero.prev")}
                className="w-7 h-7 rounded-full bg-white/[0.12] hover:bg-white/[0.22] backdrop-blur transition flex items-center justify-center text-white/85"
              >
                <ChevronLeftIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => go("next")}
                aria-label={t("hero.next")}
                className="w-7 h-7 rounded-full bg-white/[0.12] hover:bg-white/[0.22] backdrop-blur transition flex items-center justify-center text-white/85"
              >
                <ChevronRightIcon size={14} />
              </button>
            </div>
          )}
        </div>

        {/* dots — only when there's more than one slide. They sit on the white
           fade end, so use ink colour to stay visible against the page bg */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {campaigns.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={t("hero.slide", { n: i + 1 })}
                className={`h-[3px] rounded-full transition-all ${
                  i === idx ? "w-6 bg-ink/85" : "w-2.5 bg-ink/25"
                }`}
              />
            ))}
          </div>
        )}

        {/* SEAMLESS BOTTOM FADE — image dissolves into the page bg (#ffffff) over
           the lower ~32% so the join with the page below is invisible. Range is
           shorter than before (was 55%) so the text group at bottom-[42%] stays
           on the photo, not on the white wash. */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "32%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.85) 80%, rgba(255,255,255,1) 100%)"
          }}
        />
      </div>

      {/* trailer — a few px of #ffffff so the seam with the next section disappears */}
      <div className="h-2 bg-bg" />
    </section>
  );
}

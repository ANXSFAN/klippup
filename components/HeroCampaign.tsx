"use client";
import * as React from "react";
import type { Campaign } from "@/data/campaigns";
import { formatMoney } from "@/data/campaigns";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import SmartImage from "./SmartImage";

export default function HeroCampaign({
  campaigns,
  onOpen
}: {
  campaigns: Campaign[];
  onOpen: (c: Campaign) => void;
}) {
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

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
                powered by{" "}
                <span className="font-semibold text-white/85">{c.poweredBy}</span>
              </div>
            )}
          </div>
        )}

        {/* primary label group — bottom-left */}
        <div className="absolute left-4 sm:left-6 lg:left-8 bottom-10 sm:bottom-14 right-4 sm:right-6 lg:right-10 flex items-end justify-between gap-4 z-10">
          <div className="flex flex-col gap-2 max-w-[78%]">
            <h2
              className="text-white font-semibold leading-[1.05]"
              style={{ fontSize: "clamp(22px, 2.4vw, 32px)" }}
            >
              {c.title}
            </h2>
            <div className="flex items-center gap-2 text-[11.5px] sm:text-[12.5px] text-white/55">
              <span>{c.categoryLabel}</span>
              <span className="text-white/30">·</span>
              <span className="tabular-nums">{c.rate} views</span>
              <span className="text-white/30">·</span>
              <span className="tabular-nums">{formatMoney(c.budget)}</span>
            </div>
            <button
              type="button"
              onClick={() => onOpen(c)}
              className="btn-join mt-1 self-start text-[13px] font-semibold rounded-full px-5 py-2 transition"
            >
              Join Campaign
            </button>
          </div>

          {/* carousel arrows on right */}
          <div className="hidden sm:flex items-center gap-1.5 mb-1">
            <button
              type="button"
              onClick={() => go("prev")}
              aria-label="previous"
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.18] backdrop-blur transition flex items-center justify-center text-white/85"
            >
              <ChevronLeftIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => go("next")}
              aria-label="next"
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.18] backdrop-blur transition flex items-center justify-center text-white/85"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>

        {/* dots — sit just inside the fade so they read on dark gradient */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {campaigns.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`slide ${i + 1}`}
              className={`h-[3px] rounded-full transition-all ${
                i === idx ? "w-6 bg-white/85" : "w-2.5 bg-white/25"
              }`}
            />
          ))}
        </div>

        {/* SEAMLESS BOTTOM FADE — image dissolves into the page bg (#151515) over the lower ~55% so the page below feels continuous */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "55%",
            background:
              "linear-gradient(to bottom, rgba(21,21,21,0) 0%, rgba(21,21,21,0.35) 35%, rgba(21,21,21,0.78) 65%, rgba(21,21,21,1) 100%)"
          }}
        />
      </div>

      {/* trailer — a few pixels of #151515 under the image so the join with the next section is invisible */}
      <div className="h-2 bg-bg" />
    </section>
  );
}

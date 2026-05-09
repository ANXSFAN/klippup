"use client";
import * as React from "react";
import type { Campaign } from "@/data/campaigns";
import CampaignCard from "./CampaignCard";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

export default function FeaturedRow({
  items,
  onOpen
}: {
  items: Campaign[];
  onOpen: (c: Campaign) => void;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: (dir === "left" ? -1 : 1) * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="mt-5">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[13px] font-semibold text-ink/90">Featured</h3>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="scroll left"
              className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-black/70 transition"
            >
              <ChevronLeftIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="scroll right"
              className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-black/70 transition"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>

        {/* py-14 -my-10 → scroller 内部上下各留 56px 缓冲，对外仅占 16px 余白；
            这样 hover 浮层向上下展开 ~50px 都不会被 overflow-x 触发的 clip 切掉 */}
        <div
          ref={scrollerRef}
          className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-14 -my-10 overflow-x-auto no-scrollbar scroll-smooth"
        >
          <div className="flex gap-3 lg:gap-4 min-w-max">
            {items.map((c) => (
              <div
                key={c.id}
                className="w-[210px] sm:w-[230px] lg:w-[250px] xl:w-[270px] shrink-0"
              >
                <CampaignCard c={c} onOpen={onOpen} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

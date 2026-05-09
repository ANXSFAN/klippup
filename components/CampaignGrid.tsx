"use client";
import * as React from "react";
import type { Campaign } from "@/data/campaigns";
import CampaignCard from "./CampaignCard";

export default function CampaignGrid({
  items,
  onOpen
}: {
  items: Campaign[];
  onOpen: (c: Campaign) => void;
}) {
  return (
    <section className="mt-6 pb-24">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-[13px] font-semibold text-white/90 mb-3">All Campaigns</h3>
        {/* py-12 -my-8 同样给网格上下留 hover 浮层缓冲，避免相邻区块裁切 */}
        <div className="grid-cards py-12 -my-8">
          {items.map((c) => (
            <CampaignCard key={c.id} c={c} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

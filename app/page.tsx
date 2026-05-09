"use client";
import * as React from "react";
import HeroCampaign from "@/components/HeroCampaign";
import SearchBar from "@/components/SearchBar";
import FeaturedRow from "@/components/FeaturedRow";
import CampaignGrid from "@/components/CampaignGrid";
import CampaignModal from "@/components/CampaignModal";
import {
  campaigns,
  featured,
  heroCampaign,
  type Campaign
} from "@/data/campaigns";

export default function Page() {
  const [selected, setSelected] = React.useState<Campaign | null>(null);
  const open = (c: Campaign) => setSelected(c);
  const close = () => setSelected(null);

  // single-slide hero with a full-bleed, high-res nordic landscape that pairs
  // with the warm orange brand on the white page bg. Override .cover on the
  // slide so the featured row's thumbnail isn't affected.
  const heroSlides = [
    {
      ...heroCampaign,
      cover:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=85&auto=format&fit=crop"
    }
  ];

  return (
    <main className="min-h-screen bg-bg text-white">
      <HeroCampaign campaigns={heroSlides} onOpen={open} />
      <SearchBar />
      <FeaturedRow items={featured} onOpen={open} />
      <CampaignGrid items={campaigns} onOpen={open} />
      <CampaignModal open={selected !== null} campaign={selected} onClose={close} />
    </main>
  );
}

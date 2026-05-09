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

  // multi-slide hero: lead campaign + 2 from featured for carousel feel
  const heroSlides = [heroCampaign, featured[0], featured[1]];

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

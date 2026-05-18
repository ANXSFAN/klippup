"use client";
import * as React from "react";
import HeroCampaign from "./HeroCampaign";
import SearchBar from "./SearchBar";
import FeaturedRow from "./FeaturedRow";
import CampaignGrid from "./CampaignGrid";
import CampaignModal from "./CampaignModal";
import type { CampaignView, DiscoverPage } from "@/lib/types";

/**
 * Client shell for the home page: owns the "which campaign is open in the modal"
 * state. Receives already-loaded data from the Server Component (app/page.tsx).
 */
export default function DiscoverClient({ hero, featured, grid }: DiscoverPage) {
  const [selected, setSelected] = React.useState<CampaignView | null>(null);

  return (
    <main className="min-h-screen bg-bg text-white">
      <HeroCampaign campaigns={hero} onOpen={setSelected} />
      <SearchBar />
      <FeaturedRow items={featured} onOpen={setSelected} />
      <CampaignGrid items={grid} onOpen={setSelected} />
      <CampaignModal
        open={selected !== null}
        campaign={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}

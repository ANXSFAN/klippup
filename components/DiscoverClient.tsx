"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import HeroCampaign from "./HeroCampaign";
import SearchBar from "./SearchBar";
import FeaturedRow from "./FeaturedRow";
import CampaignGrid from "./CampaignGrid";
import CampaignCard from "./CampaignCard";
import CampaignModal from "./CampaignModal";
import type {
  CampaignView,
  DiscoverFacets,
  DiscoverPage,
  SearchCampaignsResult,
  SearchFilters
} from "@/lib/types";

/**
 * Client shell for the home page. Two layouts:
 *  - no filters → full Hero + Featured + Grid
 *  - any filter set → single "search results" section under SearchBar
 *
 * URL is the source of truth for filters; SearchBar writes to it, this shell
 * just reads `searchResult` from props (re-fetched server-side on URL change).
 */
export default function DiscoverClient({
  hero,
  featured,
  grid,
  facets,
  filters,
  searchResult,
  accountSlot
}: DiscoverPage & {
  facets: DiscoverFacets;
  filters: SearchFilters;
  searchResult: SearchCampaignsResult | null;
  accountSlot?: React.ReactNode;
}) {
  const [selected, setSelected] = React.useState<CampaignView | null>(null);
  const hasFilters = searchResult !== null;
  const resultCount = hasFilters ? searchResult!.total : facets.totalPublished;

  return (
    <main className="min-h-screen bg-bg text-white">
      {!hasFilters && <HeroCampaign campaigns={hero} />}
      <SearchBar
        facets={facets}
        filters={filters}
        resultCount={resultCount}
        accountSlot={accountSlot}
      />
      {hasFilters ? (
        <SearchResults
          items={searchResult!.items}
          total={searchResult!.total}
          filters={filters}
          onOpen={setSelected}
        />
      ) : (
        <>
          <FeaturedRow items={featured} onOpen={setSelected} />
          <CampaignGrid items={grid} onOpen={setSelected} />
        </>
      )}
      <CampaignModal
        open={selected !== null}
        campaign={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}

function SearchResults({
  items,
  total,
  filters,
  onOpen
}: {
  items: CampaignView[];
  total: number;
  filters: SearchFilters;
  onOpen: (c: CampaignView) => void;
}) {
  const t = useTranslations("search");
  const heading = filters.q
    ? t("resultsFor", { q: filters.q })
    : t("results", { count: total });

  return (
    <section className="mt-6 pb-24">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-[13px] font-semibold text-ink/90 mb-3">{heading}</h3>
        {items.length === 0 ? (
          <div className="card-glass rounded-card p-10 text-center text-[13px] text-black/55">
            {t("emptyResults")}
          </div>
        ) : (
          <div className="grid-cards py-12 -my-8">
            {items.map((c) => (
              <CampaignCard key={c.id} c={c} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

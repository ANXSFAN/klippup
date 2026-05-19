import AccountMenu from "@/components/AccountMenu";
import DiscoverClient from "@/components/DiscoverClient";
import { getCurrentProfile } from "@/lib/auth";
import {
  getDiscoverFacets,
  getDiscoverPage,
  searchCampaigns
} from "@/lib/queries";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    platform?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const categorySlug = sp.category?.trim() || undefined;
  const platformSlug = sp.platform?.trim() || undefined;
  const hasFilters = Boolean(q || categorySlug || platformSlug);

  const [base, facets, profile, search] = await Promise.all([
    hasFilters
      ? Promise.resolve({ hero: [], featured: [], grid: [] })
      : getDiscoverPage(),
    getDiscoverFacets(),
    getCurrentProfile(),
    hasFilters
      ? searchCampaigns({ q, categorySlug, platformSlug })
      : Promise.resolve(null)
  ]);

  return (
    <DiscoverClient
      hero={base.hero}
      featured={base.featured}
      grid={base.grid}
      facets={facets}
      filters={{
        q: q ?? "",
        categorySlug: categorySlug ?? "",
        platformSlug: platformSlug ?? ""
      }}
      searchResult={search}
      accountSlot={<AccountMenu profile={profile} />}
    />
  );
}

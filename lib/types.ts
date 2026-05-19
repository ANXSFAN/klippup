/**
 * View-model types for the public site. These are plain serialisable shapes the
 * Server Components hand down to the client components — never the raw Prisma
 * rows. See lib/queries.ts for the mapping.
 */

export type PlatformSlug = "tiktok" | "youtube" | "instagram" | "x" | "twitch";

/** Per-platform payout row shown in the campaign modal's "Earnings" block. */
export interface EarningsRow {
  rate: string;
  min: string;
  max: string;
}

/** Stored on Campaign.earnings (JSON). Keys are platform slugs. */
export interface CampaignEarnings {
  tiktok?: EarningsRow;
  youtube?: EarningsRow;
  instagram?: EarningsRow;
}

/** One row of the modal's "Top Earners" leaderboard. */
export interface TopEarner {
  views: number;
  name: string;
}

/** One row of the modal's "Resources" list. */
export interface CampaignResource {
  name: string;
  subtitle: string;
  kind: "drive" | "link";
  url?: string;
}

export interface CampaignView {
  id: string;
  brand: string;
  brandVerified: boolean;
  title: string;
  artTitle: string | null;
  cover: string;
  description: string;
  /** Category slug (e.g. "music"). */
  category: string;
  /** Resolved display label — the per-campaign override, else the category's. */
  categoryLabel: string;
  platforms: PlatformSlug[];
  raised: number;
  budget: number;
  participants: number;
  rate: string;
  /** Days since launch, derived from launchedAt. */
  ageDays: number;
  hot: boolean;
  poweredBy: string | null;
  requirementsSteps: number | null;
  /** Editable content-requirement bullets; empty → the localized defaults are shown. */
  requirements: string[];
  earnings: CampaignEarnings | null;
  topEarners: TopEarner[];
  resources: CampaignResource[];
  totalViews: string | null;
  /** Sparkline series for the analytics chart; empty → a demo curve is shown. */
  viewsSeries: number[];
}

/** What `getDiscoverPage()` returns — campaigns grouped by placement slot. */
export interface DiscoverPage {
  hero: CampaignView[];
  featured: CampaignView[];
  grid: CampaignView[];
}

/** Category chip for the Discover SearchBar's category dropdown. */
export interface DiscoverCategoryFacet {
  slug: string;
  label: string;
}

/** Platform chip for the Discover SearchBar's platform row. */
export interface DiscoverPlatformFacet {
  slug: string;
  label: string;
  glyph: string;
}

/**
 * Pre-loaded filter facets + total count, shipped from page.tsx to the
 * client SearchBar so it doesn't have to fetch.
 */
export interface DiscoverFacets {
  categories: DiscoverCategoryFacet[];
  platforms: DiscoverPlatformFacet[];
  totalPublished: number;
}

/** Filter shape `searchCampaigns()` accepts and `SearchBar` reads from URL. */
export interface SearchFilters {
  q?: string;
  categorySlug?: string;
  platformSlug?: string;
}

/** Return shape from `searchCampaigns()`. */
export interface SearchCampaignsResult {
  items: CampaignView[];
  total: number;
}

export type PlacementSlot = "HERO" | "FEATURED" | "GRID";
export type CampaignStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/** One row of the admin campaigns table. */
export interface AdminCampaignRow {
  id: string;
  title: string;
  brand: string;
  coverUrl: string;
  categoryLabel: string;
  platformGlyphs: string[];
  placements: PlacementSlot[];
  raised: number;
  budget: number;
  participants: number;
  status: CampaignStatus;
  /** Display name of the owning brand user, or null for platform campaigns. */
  brandOwnerName: string | null;
}

/** Aggregate counts for the admin dashboard. */
export interface DashboardStats {
  campaigns: number;
  published: number;
  drafts: number;
  archived: number;
  categories: number;
  platforms: number;
  totalBudget: number;
}

export interface CategoryOption {
  id: string;
  slug: string;
  label: string;
}

export interface PlatformOption {
  id: string;
  slug: string;
  label: string;
  glyph: string;
}

/** Categories + platforms for the campaign form's selectors. */
export interface FormOptions {
  categories: CategoryOption[];
  platforms: PlatformOption[];
}

/** One row of the admin categories table (with how many campaigns use it). */
export interface AdminCategoryRow {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  campaignCount: number;
}

/** One row of the admin platforms table (with how many campaigns use it). */
export interface AdminPlatformRow {
  id: string;
  slug: string;
  label: string;
  glyph: string;
  sortOrder: number;
  campaignCount: number;
}

/** Row shape accepted by the shared <EntityManager> (categories + platforms). */
export interface EntityRow {
  id: string;
  slug: string;
  label: string;
  glyph?: string;
  sortOrder: number;
  campaignCount: number;
}

/** One slice / bar in a dashboard chart. */
export interface ChartPoint {
  /** Display label (already localized for category/platform; "DRAFT" etc. for status). */
  label: string;
  /** Stable key for keys/colors (slug, status, or YYYY-MM). */
  key: string;
  value: number;
}

/** Pre-computed chart data shipped to the dashboard. */
export interface DashboardCharts {
  byCategory: ChartPoint[];
  byPlatform: ChartPoint[];
  byStatus: ChartPoint[];
  byMonth: ChartPoint[];
}

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

/**
 * Shape persisted in `Submission.apiData` (Prisma Json). Fetched at create
 * time and on demand from the platform's public API. `views: null` for
 * providers that don't expose play counts publicly (e.g. TikTok oEmbed).
 */
export interface SubmissionApiData {
  views: number | null;
  likes: number | null;
  title: string | null;
  thumbnailUrl: string | null;
  authorName: string | null;
  fetchedAt: string;
  source: "youtube_api" | "tiktok_oembed" | "mock";
}

/** One platform option in the creator submission form's dropdown. */
export interface CampaignPlatformOption {
  id: string;
  slug: string;
  label: string;
  glyph: string;
}

/** Card shown on /creator/campaigns. */
export interface CreatorCampaignCard {
  id: string;
  brand: string;
  title: string;
  cover: string;
  rate: string;
  raised: number;
  budget: number;
  categoryLabel: string;
  platformGlyphs: string[];
  mySubmissionCount: number;
}

/** Detail view shown on /creator/campaigns/[id]. */
export interface CreatorCampaignDetail {
  id: string;
  brand: string;
  title: string;
  artTitle: string | null;
  description: string;
  cover: string;
  categoryLabel: string;
  rate: string;
  raised: number;
  budget: number;
  participants: number;
  requirements: string[];
  earnings: CampaignEarnings | null;
  platforms: CampaignPlatformOption[];
  mySubmissions: CreatorSubmissionRow[];
}

/** One row of the creator's submission list. */
export interface CreatorSubmissionRow {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignCover: string;
  platformSlug: string;
  platformGlyph: string;
  platformLabel: string;
  videoUrl: string;
  videoId: string | null;
  status: SubmissionStatus;
  viewsClaimed: number | null;
  viewsVerified: number | null;
  earningsCents: number;
  rejectReason: string | null;
  createdAt: Date;
  screenshotUrl: string | null;
}

/** Numbers shown across the top of /creator/earnings. */
export interface CreatorEarningsSummary {
  totalEarnedCents: number; // PAID only
  approvedUnpaidCents: number; // APPROVED + earnings set, not yet PAID
  pendingCount: number; // PENDING submissions awaiting review
}

/** Snapshot of a creator's editable profile (with sub-profile JSON). */
export interface CreatorProfileData {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  socials: {
    tiktok: string;
    youtube: string;
    instagram: string;
    x: string;
    twitch: string;
  };
  payout: {
    method: "paypal" | "bank" | "other" | "";
    details: string;
  };
}

// ---------- brand portal ----------

/** Top-of-dashboard stats for /brand. */
export interface BrandDashboardStats {
  campaigns: number;
  drafts: number;
  published: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  totalSubmissions: number;
}

/** One row of the brand's "my campaigns" list. */
export interface BrandCampaignRow {
  id: string;
  title: string;
  cover: string;
  categoryLabel: string;
  status: CampaignStatus;
  raised: number;
  budget: number;
  pendingCount: number;
  submissionCount: number;
  createdAt: Date;
}

/** Shape the brand's CampaignForm consumes when editing. */
export interface BrandCampaignEditData {
  id: string;
  title: string;
  artTitle: string;
  description: string;
  coverUrl: string;
  categoryId: string;
  categoryLabel: string;
  platformIds: string[];
  budget: string;
  participants: string;
  rate: string;
  launchedAt: string;
  poweredBy: string;
  requirements: { value: string }[];
  earnings: {
    tiktok: { rate: string; min: string; max: string };
    youtube: { rate: string; min: string; max: string };
    instagram: { rate: string; min: string; max: string };
  };
  status: CampaignStatus;
}

/** One row in the brand's review queue. */
export interface BrandSubmissionRow {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignCover: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  platformSlug: string;
  platformGlyph: string;
  platformLabel: string;
  videoUrl: string;
  videoId: string | null;
  status: SubmissionStatus;
  viewsClaimed: number | null;
  viewsVerified: number | null;
  earningsCents: number;
  rejectReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  /** Optional creator-uploaded proof image of the view count. */
  screenshotUrl: string | null;
  /** Platform-API snapshot (null when fetch failed or platform unsupported). */
  apiData: SubmissionApiData | null;
}

/** Brand-side profile editable fields. `verified` is admin-set, exposed read-only. */
export interface BrandProfileData {
  id: string;
  email: string;
  brandName: string;
  website: string;
  description: string;
  verified: boolean;
}

// ---------- admin (Phase D) ----------

export type AdminRole = "CREATOR" | "BRAND" | "ADMIN";

/** One row in /admin/users. */
export interface AdminUserRow {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  createdAt: Date;
  /** Present only when role=BRAND. */
  brandName?: string;
  brandVerified?: boolean;
  /** Present only when role=CREATOR — cumulative PAID cents. */
  totalEarnedCents?: number;
  submissionCount?: number;
  campaignCount?: number;
}

/** One row of /admin/submissions; superset of BrandSubmissionRow with brand owner. */
export interface AdminSubmissionRow extends BrandSubmissionRow {
  brandOwner: string | null; // null = platform-owned campaign
}

/** A creator with unpaid APPROVED submissions — appears as a row in the
 *  "create payout" section of /admin/payouts. */
export interface PendingPayoutCreator {
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  payoutMethod: "paypal" | "bank" | "other" | "";
  payoutDetails: string;
  totalCents: number;
  submissions: {
    id: string;
    campaignTitle: string;
    platformLabel: string;
    videoUrl: string;
    viewsVerified: number | null;
    earningsCents: number;
    approvedAt: Date | null;
  }[];
}

/** One row in the past-payouts table. */
export interface AdminPayoutRow {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  amountCents: number;
  method: string;
  details: string | null;
  txnRef: string | null;
  notes: string | null;
  paidAt: Date;
  submissionCount: number;
}

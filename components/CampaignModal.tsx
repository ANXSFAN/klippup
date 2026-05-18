"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import type { CampaignView, CampaignResource } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import {
  CloseIcon,
  ExpandIcon,
  MusicIcon,
  PeopleIcon,
  ShareIcon,
  VerifiedIcon,
  TiktokIcon,
  YouTubeIcon,
  InstagramIcon,
  XIcon,
  EyeIcon,
  StarIcon,
  ExternalLinkIcon,
  DriveIcon,
  LinkIcon,
  ChevronDownSmallIcon
} from "./Icons";
import SmartImage from "./SmartImage";
import BrandAvatar from "./BrandAvatar";

const defaultTopEarners = [
  { views: 170_787, name: "Cipher" },
  { views: 30_050, name: "HA Maker" },
  { views: 8_811, name: "Vendra" }
];

// Display name + icon per platform slug, used to render Campaign.earnings rows.
const PLATFORM_META: Record<string, { name: string; icon: React.ReactNode }> = {
  youtube: { name: "YouTube", icon: <YouTubeIcon size={15} /> },
  instagram: { name: "Instagram", icon: <InstagramIcon size={15} /> },
  x: { name: "X", icon: <XIcon size={15} /> },
  tiktok: { name: "TikTok", icon: <TiktokIcon size={15} /> }
};

export default function CampaignModal({
  open,
  campaign,
  onClose
}: {
  open: boolean;
  campaign: CampaignView | null;
  onClose: () => void;
}) {
  const t = useTranslations();
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !campaign) return null;

  const c = campaign;
  const pct = Math.min(100, (c.raised / c.budget) * 100);

  // Localized fallbacks for sections whose Campaign fields are still empty.
  // (These fields are editable in the admin — see docs/admin-plan.md.)
  const minLabel = t("common.min");
  const maxLabel = t("common.max");
  const defaultRequirements = t.raw("modal.defaultRequirements") as string[];
  const defaultEarnings = [
    { name: "YouTube", icon: <YouTubeIcon size={15} />, rate: "$1.50", min: `$1.50 ${minLabel}`, max: `$500 ${maxLabel}` },
    { name: "Instagram", icon: <InstagramIcon size={15} />, rate: "$3", min: `$3 ${minLabel}`, max: `$500 ${maxLabel}` },
    { name: "X", icon: <XIcon size={15} />, rate: "$1.50", min: `$1.50 ${minLabel}`, max: `$500 ${maxLabel}` },
    { name: "TikTok", icon: <TiktokIcon size={15} />, rate: "$3", min: `$3 ${minLabel}`, max: `$500 ${maxLabel}` }
  ];
  const defaultResources: CampaignResource[] = [
    { name: "Google Drive", subtitle: t("modal.campaignGuide"), kind: "drive" },
    { name: t("modal.discordLink"), subtitle: t("modal.discordLink"), kind: "link" }
  ];

  // Real data when present, localized fallback otherwise.
  const requirements = c.requirements.length ? c.requirements : defaultRequirements;
  const dbEarnings = c.earnings
    ? Object.entries(c.earnings).flatMap(([slug, row]) =>
        row
          ? [{
              name: PLATFORM_META[slug]?.name ?? slug,
              icon: PLATFORM_META[slug]?.icon ?? null,
              rate: row.rate,
              min: row.min,
              max: row.max
            }]
          : []
      )
    : [];
  const earningsCards = dbEarnings.length ? dbEarnings : defaultEarnings;
  const topEarners = c.topEarners.length ? c.topEarners : defaultTopEarners;
  const resources: CampaignResource[] = c.resources.length ? c.resources : defaultResources;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center backdrop-dim"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-[860px] sm:my-10 max-h-[100dvh] sm:max-h-[92vh] overflow-y-auto bg-bg sm:rounded-card shadow-card border border-line"
      >
        {/* mobile close */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="sm:hidden absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white"
        >
          <CloseIcon size={16} />
        </button>

        {/* cover */}
        <div className="relative aspect-[16/8] overflow-hidden bg-black">
          <SmartImage
            src={c.cover}
            alt={c.title}
            fallbackSeed={c.id}
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {(c.artTitle || c.brand) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="font-black uppercase text-center leading-[0.95] italic"
                style={{
                  fontSize: "clamp(36px, 6vw, 72px)",
                  fontFamily:
                    '"Bungee", "Bebas Neue", Impact, "Arial Black", system-ui, sans-serif',
                  color: "#37e1ff",
                  WebkitTextStroke: "1px rgba(0,0,0,0.55)",
                  textShadow: "0 2px 0 #0c5b6b, 0 4px 18px rgba(0,0,0,0.5)"
                }}
              >
                {c.artTitle ?? c.title.split("|")[0]?.trim() ?? c.brand}
              </span>
            </div>
          )}
          <button
            type="button"
            aria-label={t("modal.expand")}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/75 flex items-center justify-center text-white backdrop-blur"
          >
            <ExpandIcon size={15} />
          </button>
        </div>

        {/* body */}
        <div className="px-5 sm:px-6 pt-4 pb-8">
          {/* brand */}
          <div className="flex items-center gap-2 text-[12.5px] text-black/80">
            <BrandAvatar name={c.brand} size={20} />
            <span className="font-medium">{c.brand}</span>
            {c.brandVerified && <VerifiedIcon size={13} />}
          </div>

          {/* title */}
          <h2 className="mt-2 text-[22px] sm:text-[26px] leading-[1.18] font-semibold text-ink">
            {c.title}
          </h2>

          {/* payout */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <div className="text-[14px] tabular-nums whitespace-nowrap">
              <span className="font-semibold text-ink">{formatMoney(c.raised)}</span>
              <span className="text-black/45"> / {formatMoney(c.budget)}</span>
            </div>
            <div className="flex-1 min-w-[140px] h-[3px] bg-black/[0.08] rounded-full overflow-hidden">
              <div className="h-full progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center gap-1.5">
              <Tag>
                <PeopleIcon size={12} />
                <span className="tabular-nums">{c.participants}</span>
              </Tag>
              <Tag>
                <MusicIcon size={11} />
                <span>{c.categoryLabel}</span>
              </Tag>
              <Tag>{c.rate}</Tag>
            </div>
          </div>

          {/* description */}
          <p className="mt-4 text-[13.5px] leading-relaxed text-black/65">
            {c.description}
          </p>

          {/* CTA */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="btn-join text-[13.5px] font-semibold rounded-full px-5 py-2 transition"
            >
              {t("common.joinCampaign")}
            </button>
            <button
              type="button"
              aria-label={t("common.share")}
              className="w-9 h-9 rounded-full bg-black/[0.05] hover:bg-black/[0.09] transition flex items-center justify-center text-black/70"
            >
              <ShareIcon size={15} />
            </button>
          </div>

          {/* divider */}
          <div className="mt-7 border-t border-line" />

          {/* requirements */}
          <Section title={t("modal.requirements")}>
            <div className="text-[11.5px] text-black/40 mb-3">{t("modal.contentRequirements")}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-3">
              {requirements.slice(0, 5).map((r, i) => (
                <p key={i} className="text-[12.5px] leading-relaxed text-ink">
                  {r}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-[12px] text-black/55 hover:text-ink transition"
            >
              <span>{t("common.showMore")}</span>
              <ChevronDownSmallIcon size={12} />
            </button>
          </Section>

          {/* Earnings + Analytics — side-by-side on lg, stacked on mobile */}
          <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-7">
            <div>
              <h4 className="text-[14px] font-semibold text-ink mb-3">{t("modal.earnings")}</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {earningsCards.map((p) => (
                  <PlatformCard key={p.name} {...p} />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-ink mb-3">{t("modal.analytics")}</h4>
              <div className="pill-glass rounded-2xl p-4 h-full flex flex-col">
                <div className="flex items-center gap-1.5">
                  <button className="px-3 py-1 rounded-full bg-brand text-[12px] font-medium text-white shadow-[0_2px_6px_rgba(255,122,26,0.32)]">
                    {t("modal.viewsTab")}
                  </button>
                  <button className="px-3 py-1 rounded-full text-[12px] text-black/55 hover:text-ink transition">
                    {t("modal.submissionsTab")}
                  </button>
                </div>
                <div className="mt-3">
                  <div className="text-[26px] font-semibold tabular-nums text-ink leading-none">
                    {c.totalViews ?? t("modal.totalViewsFallback")}
                  </div>
                  <div className="text-[11px] text-black/55 mt-1.5">{t("modal.totalViews")}</div>
                </div>
                <div className="mt-3 flex-1 min-h-[80px]">
                  <ViewsChart series={c.viewsSeries} />
                </div>
              </div>
            </div>
          </div>

          {/* top earners */}
          <Section title={t("modal.topEarners")}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topEarners.map((e, i) => (
                <EarnerCard key={i} views={e.views} name={e.name} rank={i + 1} />
              ))}
            </div>
          </Section>

          {/* resources */}
          <Section title={t("modal.resources")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resources.map((r, i) => (
                <div
                  key={i}
                  className="pill-glass rounded-2xl p-3.5 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-black/[0.05] flex items-center justify-center shrink-0 text-black/75">
                    {r.kind === "drive" ? <DriveIcon size={20} /> : <LinkIcon size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-ink truncate">
                      {r.name}
                    </div>
                    <div className="text-[11.5px] text-black/55 truncate">
                      {r.subtitle}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={t("common.open")}
                    className="w-8 h-8 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-black/55 hover:text-ink transition shrink-0"
                  >
                    <ExternalLinkIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink bg-black/[0.05] rounded-md px-1.5 py-[3px]">
      {children}
    </span>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-7">
      <h4 className="text-[14px] font-semibold text-ink mb-3">{title}</h4>
      {children}
    </div>
  );
}

function PlatformCard({
  name,
  rate,
  min,
  max,
  icon
}: {
  name: string;
  rate: string;
  min: string;
  max: string;
  icon: React.ReactNode;
}) {
  const t = useTranslations("modal");
  return (
    <div className="pill-glass rounded-xl p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink">{name}</span>
        <span className="w-9 h-9 rounded-lg bg-white border border-line flex items-center justify-center text-ink">
          {icon}
        </span>
      </div>
      <div className="text-[15px] font-bold tabular-nums leading-none">
        <span className="text-ink">{rate}</span>
        <span className="text-black/50 text-[11px] font-medium ml-0.5">{t("perThousandViews")}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Pill>{min}</Pill>
        <Pill>{max}</Pill>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  // bold first token, dim suffix label (e.g. "$0.75" + "Min")
  const text = String(children);
  const parts = text.split(" ");
  const value = parts[0] ?? text;
  const label = parts.slice(1).join(" ");
  return (
    <span className="inline-flex items-baseline gap-1 text-[11px] bg-white border border-line rounded-full px-2 py-[3px]">
      <span className="font-semibold text-ink">{value}</span>
      {label && <span className="text-black/55">{label}</span>}
    </span>
  );
}

function EarnerCard({
  views,
  name,
  rank
}: {
  views: number;
  name: string;
  rank: number;
}) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  const starColor =
    rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#b45309" : "#9ca3af";

  return (
    <div className="pill-glass rounded-2xl p-3.5 flex items-center justify-between gap-2">
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-1.5">
          <EyeIcon size={13} className="text-black/55" />
          <span className="text-[14.5px] font-bold tabular-nums text-ink">{fmt(views)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BrandAvatar name={name} size={20} />
          <span className="text-[12.5px] text-ink truncate">{name}</span>
        </div>
      </div>
      <StarCluster color={starColor} />
    </div>
  );
}

function StarCluster({ color }: { color: string }) {
  // 3 stars: middle slightly larger and lifted, side stars tilted outward → trophy/crown look
  return (
    <div className="relative w-[58px] h-[40px] shrink-0">
      <span className="absolute left-0 top-2" style={{ transform: "rotate(-18deg)" }}>
        <StarIcon size={18} color={color} />
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 top-0">
        <StarIcon size={22} color={color} />
      </span>
      <span className="absolute right-0 top-2" style={{ transform: "rotate(18deg)" }}>
        <StarIcon size={18} color={color} />
      </span>
    </div>
  );
}

function ViewsChart({ series }: { series: number[] }) {
  const w = 320;
  const h = 90;
  const hasData = series.length > 1;
  const points = hasData ? series : [10, 14, 12, 22, 30, 28, 38, 52, 48, 64, 70, 80];
  const max = (hasData ? Math.max(...points) : 100) || 1;
  const stepX = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * stepX;
      const y = h - (p / max) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="viewsFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,122,26,0.32)" />
          <stop offset="100%" stopColor="rgba(255,122,26,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#viewsFill)" />
      <path d={path} fill="none" stroke="#FF7A1A" strokeWidth="1.8" />
    </svg>
  );
}

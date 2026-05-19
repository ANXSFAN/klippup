import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import AccountMenu from "@/components/AccountMenu";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import BrandAvatar from "@/components/BrandAvatar";
import { ChevronLeftIcon } from "@/components/Icons";
import SubmissionStatusBadge from "@/components/creator/SubmissionStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { formatDollars } from "@/lib/format";
import { getCreatorPublicProfile } from "@/lib/public-queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SOCIAL_PREFIX: Record<string, string> = {
  tiktok: "https://www.tiktok.com/@",
  youtube: "https://www.youtube.com/@",
  instagram: "https://www.instagram.com/",
  x: "https://x.com/",
  twitch: "https://www.twitch.tv/"
};

function socialHref(platform: string, raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `${SOCIAL_PREFIX[platform] ?? ""}${handle}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getCreatorPublicProfile(id);
  if (!profile) return {};
  return {
    title: `${profile.displayName} · KlippUp`,
    description: `${profile.displayName} en KlippUp — ${profile.approvedCount} clips aprobados.`,
    openGraph: {
      title: profile.displayName,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined
    }
  };
}

export default async function CreatorPublicPage({ params }: PageProps) {
  const { id } = await params;
  const [creator, viewer, t, tStatus, fmt] = await Promise.all([
    getCreatorPublicProfile(id),
    getCurrentProfile(),
    getTranslations("creatorPublic"),
    getTranslations("creator.submissionStatus"),
    getFormatter()
  ]);
  if (!creator) notFound();

  const socialEntries = (Object.entries(creator.socials) as [
    keyof typeof creator.socials,
    string
  ][]).filter(([, v]) => v.trim().length > 0);

  return (
    <main className="min-h-screen bg-bg">
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[960px] mx-auto flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-black/70 hover:text-ink transition card-glass rounded-full h-9 px-3.5"
          >
            <ChevronLeftIcon size={14} />
            <span>{t("back")}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
            <AccountMenu profile={viewer} />
          </div>
        </div>
      </header>

      <article className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <section className="flex flex-col sm:flex-row sm:items-center gap-5">
          <BrandAvatar name={creator.displayName} size={88} />
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-semibold text-ink">{creator.displayName}</h1>
            <p className="text-sm text-black/60">
              {t("joined", { date: fmt.dateTime(creator.joinedAt, { dateStyle: "long" }) })}
            </p>
            {socialEntries.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {socialEntries.map(([key, val]) => (
                  <a
                    key={key}
                    href={socialHref(key, val)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] card-glass rounded-full px-3 h-7 hover:text-ink text-black/75 transition"
                  >
                    <span className="font-medium capitalize">{key}</span>
                    <ExternalLink className="size-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2">
          <Card>
            <CardContent className="pt-5">
              <div className="text-xs text-muted-foreground">{t("stats.earned")}</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {formatDollars(creator.totalEarnedCents)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="text-xs text-muted-foreground">{t("stats.approved")}</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {creator.approvedCount}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink">{t("recent")}</h2>
          {creator.recentSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {t("empty")}
              </CardContent>
            </Card>
          ) : (
            <ul className="divide-y rounded-md border bg-card">
              {creator.recentSubmissions.map((s) => (
                <li key={s.id} className="p-3 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.campaignCover}
                    alt=""
                    className="w-14 h-9 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/campaigns/${s.campaignId}`}
                      className="text-sm font-medium hover:underline truncate inline-block max-w-full"
                    >
                      {s.campaignTitle}
                    </Link>
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="size-4 inline-flex items-center justify-center rounded bg-secondary text-[9px] font-semibold">
                          {s.platformGlyph}
                        </span>
                        {s.platformLabel}
                      </span>
                      {s.viewsVerified != null && (
                        <span className="tabular-nums">
                          {s.viewsVerified.toLocaleString()} {t("views")}
                        </span>
                      )}
                      <span>{fmt.dateTime(s.createdAt, { dateStyle: "short" })}</span>
                    </div>
                  </div>
                  <a
                    href={s.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("openVideo")}
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                  <SubmissionStatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-muted-foreground">
            {tStatus("PAID")} · {tStatus("APPROVED")}
          </p>
        </section>
      </article>
    </main>
  );
}

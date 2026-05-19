import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AccountMenu from "@/components/AccountMenu";
import CampaignDetail from "@/components/CampaignDetail";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ChevronLeftIcon } from "@/components/Icons";
import { getCurrentProfile } from "@/lib/auth";
import { getCampaignDetail } from "@/lib/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const c = await getCampaignDetail(id);
  if (!c) return {};
  return {
    title: `${c.title} · ${c.brand}`,
    description: c.description,
    openGraph: {
      title: c.title,
      description: c.description,
      images: c.cover ? [{ url: c.cover }] : undefined
    }
  };
}

export default async function CampaignPage({ params }: PageProps) {
  const { id } = await params;
  const [campaign, profile, t] = await Promise.all([
    getCampaignDetail(id),
    getCurrentProfile(),
    getTranslations("common")
  ]);
  if (!campaign) notFound();

  return (
    <main className="min-h-screen bg-bg">
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[860px] mx-auto flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-black/70 hover:text-ink transition card-glass rounded-full h-9 px-3.5"
          >
            <ChevronLeftIcon size={14} />
            <span>{t("backToDiscover")}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
            <AccountMenu profile={profile} />
          </div>
        </div>
      </header>

      <article className="px-0 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-[860px] mx-auto bg-bg sm:rounded-card sm:border sm:border-line sm:shadow-card overflow-hidden">
          <CampaignDetail c={campaign} />
        </div>
      </article>
    </main>
  );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

type Tab = "submissions" | "insights";

interface Props {
  id: string;
  active: Tab;
}

/**
 * Inline tab strip shared between /brand/campaigns/[id]/submissions and
 * /brand/campaigns/[id]/insights. Server component so it can resolve
 * translations and the active tab without any client JS.
 */
export default async function CampaignTabs({ id, active }: Props) {
  const t = await getTranslations("brand.campaignTabs");
  const tabs: { key: Tab; href: string }[] = [
    { key: "submissions", href: `/brand/campaigns/${id}/submissions` },
    { key: "insights", href: `/brand/campaigns/${id}/insights` }
  ];

  return (
    <div className="border-b border-border">
      <nav className="flex gap-1 -mb-px">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              active === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t(tab.key)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

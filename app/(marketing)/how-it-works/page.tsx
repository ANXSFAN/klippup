import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing.howItWorks");
  return { title: `${t("hero.title")} · KlippUp`, description: t("hero.lead") };
}

export default async function HowItWorksPage() {
  const t = await getTranslations("marketing.howItWorks");
  const creatorSteps = ["browse", "submit", "earn"] as const;
  const brandSteps = ["launch", "review", "pay"] as const;

  return (
    <>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[#FF7A1A] font-medium mb-4">
          {t("hero.eyebrow")}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-ink">
          {t("hero.title")}
        </h1>
        <p className="mt-6 text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
          {t("hero.lead")}
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <PathColumn
            badge={t("creator.badge")}
            title={t("creator.title")}
            steps={creatorSteps.map((key) => ({
              key,
              title: t(`creator.steps.${key}.title`),
              body: t(`creator.steps.${key}.body`)
            }))}
            ctaLabel={t("creator.cta")}
            ctaHref="/signup?role=creator"
            accent="orange"
          />
          <PathColumn
            badge={t("brand.badge")}
            title={t("brand.title")}
            steps={brandSteps.map((key) => ({
              key,
              title: t(`brand.steps.${key}.title`),
              body: t(`brand.steps.${key}.body`)
            }))}
            ctaLabel={t("brand.cta")}
            ctaHref="/signup?role=brand"
            accent="ink"
          />
        </div>
      </section>

      <section className="bg-[#FAFAF8] border-t border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t("faq.title")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3 text-left">
            {(["payout", "approval", "support"] as const).map((key) => (
              <div key={key}>
                <h3 className="text-[15px] font-medium text-ink mb-2">
                  {t(`faq.${key}.q`)}
                </h3>
                <p className="text-[14px] text-black/60 leading-relaxed">{t(`faq.${key}.a`)}</p>
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-sm text-black/60 hover:text-ink mt-12"
          >
            {t("backToDiscover")} →
          </Link>
        </div>
      </section>
    </>
  );
}

function PathColumn({
  badge,
  title,
  steps,
  ctaLabel,
  ctaHref,
  accent
}: {
  badge: string;
  title: string;
  steps: { key: string; title: string; body: string }[];
  ctaLabel: string;
  ctaHref: string;
  accent: "orange" | "ink";
}) {
  const badgeClass =
    accent === "orange"
      ? "bg-[#FF7A1A]/10 text-[#FF7A1A]"
      : "bg-black/[0.05] text-ink";
  const ctaClass =
    accent === "orange"
      ? "btn-join"
      : "bg-ink text-white hover:bg-black";
  return (
    <div className="space-y-6">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${badgeClass}`}>
        {badge}
      </span>
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <ol className="space-y-5">
        {steps.map((s, i) => (
          <li key={s.key} className="flex gap-4">
            <span className="size-8 shrink-0 rounded-full bg-black/[0.04] text-ink font-mono text-[13px] flex items-center justify-center">
              {i + 1}
            </span>
            <div className="pt-0.5">
              <h3 className="text-[15px] font-medium text-ink">{s.title}</h3>
              <p className="text-[14px] text-black/60 mt-1 leading-relaxed">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href={ctaHref}
        className={`inline-flex items-center h-10 px-5 rounded-full text-sm font-medium transition ${ctaClass}`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

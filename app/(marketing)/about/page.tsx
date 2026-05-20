import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing.about");
  return { title: `${t("hero.title")} · KlippUp`, description: t("hero.lead") };
}

export default async function AboutPage() {
  const t = await getTranslations("marketing.about");
  const values = [
    { key: "transparency" as const },
    { key: "fair" as const },
    { key: "local" as const }
  ];
  const stats = [
    { key: "creators" as const, value: t("stats.creators.value") },
    { key: "brands" as const, value: t("stats.brands.value") },
    { key: "campaigns" as const, value: t("stats.campaigns.value") },
    { key: "views" as const, value: t("stats.views.value") }
  ];

  return (
    <>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[#FF7A1A] font-medium mb-4">
          {t("hero.eyebrow")}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-ink max-w-3xl">
          {t("hero.title")}
        </h1>
        <p className="mt-6 text-lg text-black/60 max-w-2xl leading-relaxed">{t("hero.lead")}</p>
      </section>

      <section className="bg-[#FAFAF8] border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.key}>
              <div className="text-3xl sm:text-4xl font-semibold tabular-nums text-ink">
                {s.value}
              </div>
              <div className="text-sm text-black/55 mt-1">{t(`stats.${s.key}.label`)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink mb-12">{t("values.title")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <div key={v.key} className="card-glass rounded-2xl p-6">
              <div className="text-[11px] font-mono text-black/40 mb-3">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-medium text-ink mb-2">{t(`values.${v.key}.title`)}</h3>
              <p className="text-[14px] text-black/60 leading-relaxed">
                {t(`values.${v.key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card-glass rounded-3xl p-10 sm:p-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t("cta.title")}</h2>
          <p className="mt-3 text-black/60 max-w-lg mx-auto">{t("cta.body")}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup?role=creator"
              className="btn-join h-11 px-6 rounded-full text-sm font-medium inline-flex items-center"
            >
              {t("cta.creator")}
            </Link>
            <Link
              href="/signup?role=brand"
              className="h-11 px-6 rounded-full text-sm font-medium inline-flex items-center bg-white border border-black/[0.08] hover:border-black/20 text-ink transition"
            >
              {t("cta.brand")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

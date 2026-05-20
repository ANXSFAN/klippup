import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing.forBrands");
  return { title: `${t("hero.title")} · KlippUp`, description: t("hero.lead") };
}

export default async function ForBrandsPage() {
  const t = await getTranslations("marketing.forBrands");
  const features = ["reach", "ugc", "budget", "review"] as const;
  const stats = ["roi", "creators", "speed"] as const;

  return (
    <>
      <section className="bg-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
             style={{
               background:
                 "radial-gradient(ellipse at top right, rgba(255,122,26,0.45), transparent 60%)"
             }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <p className="text-[12px] uppercase tracking-[0.2em] text-[#FFA866] font-medium mb-4">
            {t("hero.eyebrow")}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl leading-relaxed">{t("hero.lead")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup?role=brand"
              className="btn-join h-11 px-6 rounded-full text-sm font-medium inline-flex items-center"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href="/how-it-works"
              className="h-11 px-6 rounded-full text-sm font-medium inline-flex items-center border border-white/20 text-white hover:bg-white/10 transition"
            >
              {t("hero.learn")} →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAF8] border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-8 sm:grid-cols-3">
          {stats.map((key) => (
            <div key={key} className="text-center sm:text-left">
              <div className="text-4xl font-semibold tabular-nums text-ink">
                {t(`stats.${key}.value`)}
              </div>
              <div className="text-sm text-black/55 mt-1">{t(`stats.${key}.label`)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink mb-12">
          {t("features.title")}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((key, i) => (
            <div key={key} className="card-glass rounded-2xl p-6">
              <div className="text-[11px] font-mono text-black/40 mb-3">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-medium text-ink mb-2">
                {t(`features.${key}.title`)}
              </h3>
              <p className="text-[14px] text-black/60 leading-relaxed">
                {t(`features.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#FAFAF8] border-t border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-ink">
                {t("flow.title")}
              </h2>
              <p className="text-black/60 mt-3 max-w-lg">{t("flow.lead")}</p>
              <ol className="mt-8 space-y-5">
                {(["launch", "verify", "scale"] as const).map((key, i) => (
                  <li key={key} className="flex gap-4">
                    <span className="size-8 shrink-0 rounded-full bg-[#FF7A1A] text-white font-mono text-[13px] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="pt-0.5">
                      <h3 className="text-[15px] font-medium text-ink">
                        {t(`flow.steps.${key}.title`)}
                      </h3>
                      <p className="text-[14px] text-black/60 mt-1 leading-relaxed">
                        {t(`flow.steps.${key}.body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card-glass rounded-3xl p-10 sm:p-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t("cta.title")}</h2>
          <p className="mt-3 text-black/60 max-w-lg mx-auto">{t("cta.body")}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup?role=brand"
              className="btn-join inline-flex items-center h-11 px-7 rounded-full text-sm font-medium"
            >
              {t("cta.button")}
            </Link>
            <Link
              href="/about"
              className="text-sm text-black/60 hover:text-ink"
            >
              {t("cta.learnMore")} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

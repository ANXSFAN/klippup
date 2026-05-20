import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing.forCreators");
  return { title: `${t("hero.title")} · KlippUp`, description: t("hero.lead") };
}

export default async function ForCreatorsPage() {
  const t = await getTranslations("marketing.forCreators");
  const benefits = ["payout", "platforms", "rights", "support"] as const;
  const platforms = ["TikTok", "YouTube", "Instagram", "X", "Twitch"];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#FF7A1A] font-medium mb-4">
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-ink">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-lg text-black/60 leading-relaxed">{t("hero.lead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup?role=creator"
                className="btn-join h-11 px-6 rounded-full text-sm font-medium inline-flex items-center"
              >
                {t("hero.cta")}
              </Link>
              <Link
                href="/"
                className="h-11 px-6 rounded-full text-sm font-medium inline-flex items-center text-ink hover:bg-black/[0.04] transition"
              >
                {t("hero.browse")} →
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="card-glass rounded-3xl p-8">
              <p className="text-[11px] uppercase tracking-wider text-black/40 mb-2">
                {t("earnings.label")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-semibold text-ink tabular-nums">$1</span>
                <span className="text-black/55">{t("earnings.per")}</span>
              </div>
              <p className="text-sm text-black/55 mt-2">{t("earnings.note")}</p>
              <div className="mt-6 pt-6 border-t border-black/[0.06] grid grid-cols-3 gap-4 text-center">
                {(["clip1", "clip2", "clip3"] as const).map((k) => (
                  <div key={k}>
                    <div className="text-xl font-semibold tabular-nums text-ink">
                      {t(`earnings.${k}.views`)}
                    </div>
                    <div className="text-[11px] text-black/45 mt-0.5">
                      {t(`earnings.${k}.pay`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAF8] border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink mb-12">
            {t("benefits.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((key) => (
              <div key={key} className="bg-white rounded-2xl p-6 border border-black/[0.06]">
                <h3 className="text-[16px] font-medium text-ink mb-2">
                  {t(`benefits.${key}.title`)}
                </h3>
                <p className="text-[14px] text-black/60 leading-relaxed">
                  {t(`benefits.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t("platforms.title")}</h2>
        <p className="text-black/55 mt-3 max-w-xl mx-auto">{t("platforms.lead")}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {platforms.map((p) => (
            <span
              key={p}
              className="pill-glass rounded-full px-5 py-2 text-sm font-medium text-ink"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card-glass rounded-3xl p-10 sm:p-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{t("cta.title")}</h2>
          <p className="mt-3 text-black/60 max-w-lg mx-auto">{t("cta.body")}</p>
          <Link
            href="/signup?role=creator"
            className="btn-join inline-flex items-center h-11 px-7 rounded-full text-sm font-medium mt-7"
          >
            {t("cta.button")}
          </Link>
        </div>
      </section>
    </>
  );
}

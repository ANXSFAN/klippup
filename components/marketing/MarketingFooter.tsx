import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function MarketingFooter() {
  const t = await getTranslations("marketing.footer");
  const productLinks = [
    { href: "/how-it-works", key: "howItWorks" as const },
    { href: "/for-creators", key: "forCreators" as const },
    { href: "/for-brands", key: "forBrands" as const }
  ];
  const companyLinks = [
    { href: "/about", key: "about" as const },
    { href: "/", key: "discover" as const }
  ];

  return (
    <footer className="border-t border-black/[0.06] bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="size-7 rounded-lg bg-[#FF7A1A] text-white flex items-center justify-center font-bold text-sm">
              K
            </span>
            <span className="font-semibold text-ink">KlippUp</span>
          </Link>
          <p className="text-[13px] text-black/55 mt-3 leading-relaxed">{t("tagline")}</p>
        </div>
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-black/40 font-medium mb-3">
            {t("product")}
          </h3>
          <ul className="space-y-2">
            {productLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[13px] text-black/70 hover:text-ink">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-black/40 font-medium mb-3">
            {t("company")}
          </h3>
          <ul className="space-y-2">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[13px] text-black/70 hover:text-ink">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-black/40 font-medium mb-3">
            {t("getStarted")}
          </h3>
          <ul className="space-y-2">
            <li>
              <Link href="/signup?role=creator" className="text-[13px] text-black/70 hover:text-ink">
                {t("joinAsCreator")}
              </Link>
            </li>
            <li>
              <Link href="/signup?role=brand" className="text-[13px] text-black/70 hover:text-ink">
                {t("joinAsBrand")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between text-[12px] text-black/45">
          <span>© {new Date().getFullYear()} KlippUp</span>
          <span>{t("madeIn")}</span>
        </div>
      </div>
    </footer>
  );
}

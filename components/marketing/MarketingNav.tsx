import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { getCurrentProfile } from "@/lib/auth";
import AccountMenu from "@/components/AccountMenu";

export default async function MarketingNav() {
  const [t, profile] = await Promise.all([
    getTranslations("marketing.nav"),
    getCurrentProfile()
  ]);

  const links: { href: string; key: "howItWorks" | "forCreators" | "forBrands" | "about" }[] = [
    { href: "/how-it-works", key: "howItWorks" },
    { href: "/for-creators", key: "forCreators" },
    { href: "/for-brands", key: "forBrands" },
    { href: "/about", key: "about" }
  ];

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 border-b border-black/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="size-7 rounded-lg bg-[#FF7A1A] text-white flex items-center justify-center font-bold text-sm">
            K
          </span>
          <span className="font-semibold text-ink">KlippUp</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-[13px] text-black/70 hover:text-ink rounded-full hover:bg-black/[0.04] transition"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <AccountMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}

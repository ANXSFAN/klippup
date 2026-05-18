import { useTranslations } from "next-intl";

/** Placeholder body for admin sections that aren't built yet. */
export default function ComingSoon({ title }: { title: string }) {
  const t = useTranslations("admin");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <div className="text-lg font-medium">{t("comingSoon")}</div>
        <p className="text-sm text-muted-foreground mt-1">{t("comingSoonDesc")}</p>
      </div>
    </div>
  );
}

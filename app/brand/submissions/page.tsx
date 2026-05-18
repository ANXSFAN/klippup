import { getTranslations } from "next-intl/server";
import { approveSubmission, rejectSubmission } from "@/app/brand/actions";
import ReviewQueue from "@/components/brand/ReviewQueue";
import { getCurrentProfile } from "@/lib/auth";
import { listBrandSubmissions } from "@/lib/brand-queries";

export default async function BrandSubmissionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const t = await getTranslations("brand.reviewPage");
  const rows = await listBrandSubmissions(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <ReviewQueue
        rows={rows}
        approveAction={approveSubmission}
        rejectAction={rejectSubmission}
      />
    </div>
  );
}

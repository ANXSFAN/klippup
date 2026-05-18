import { getTranslations } from "next-intl/server";
import { adminApproveSubmission, adminRejectSubmission } from "./actions";
import ReviewQueue from "@/components/brand/ReviewQueue";
import { listAdminSubmissions } from "@/lib/admin-queries";

export default async function AdminSubmissionsPage() {
  const t = await getTranslations("admin.submissions");
  const rows = await listAdminSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <ReviewQueue
        rows={rows}
        showBrandOwner
        campaignHref={(id) => `/admin/campaigns/${id}/edit`}
        approveAction={adminApproveSubmission}
        rejectAction={adminRejectSubmission}
      />
    </div>
  );
}

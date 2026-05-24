"use client";

import { useTransition } from "react";
import { FilePlus2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createInvoiceForCampaign } from "@/app/admin/invoices/actions";

const KNOWN = new Set([
  "CAMPAIGN_NOT_FOUND",
  "PLATFORM_CAMPAIGN_NO_BRAND",
  "BRAND_BILLING_INCOMPLETE",
  "ALREADY_HAS_INVOICE",
  "UNAUTHENTICATED",
  "NOT_ADMIN"
]);

interface Props {
  campaignId: string;
  /** Latest non-cancelled invoice id for this campaign, if any. */
  invoiceId: string | null;
  /** Serial number for tooltip on the download icon. */
  invoiceSerial: string | null;
}

export default function InvoiceCampaignButton({
  campaignId,
  invoiceId,
  invoiceSerial
}: Props) {
  const t = useTranslations("admin.invoices.actions");
  const [pending, startTransition] = useTransition();

  if (invoiceId) {
    return (
      <Button
        asChild
        variant="ghost"
        size="icon"
        aria-label={t("download")}
        className="text-muted-foreground hover:text-foreground"
      >
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noopener"
          title={invoiceSerial ?? t("download")}
        >
          <FileText className="size-4" />
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("generate")}
      title={t("generate")}
      disabled={pending}
      className="text-muted-foreground hover:text-foreground"
      onClick={() =>
        startTransition(async () => {
          const res = await createInvoiceForCampaign(campaignId);
          if (!res.ok) {
            const key = KNOWN.has(res.error) ? res.error : "GENERIC";
            toast.error(t(`errors.${key}` as `errors.${string}`));
            return;
          }
          toast.success(t("generated"));
        })
      }
    >
      <FilePlus2 className="size-4" />
    </Button>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { duplicateBrandCampaign } from "@/app/brand/actions";
import { Button } from "@/components/ui/button";

/**
 * Clones a campaign into a new DRAFT and jumps to its edit page, so brands
 * running a series of similar campaigns don't have to re-fill the form.
 */
export default function DuplicateCampaignButton({ id }: { id: string }) {
  const t = useTranslations("brand.campaignList");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={t("duplicate")}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await duplicateBrandCampaign(id);
          if (!res.ok) {
            toast.error(t("duplicateError"));
            return;
          }
          toast.success(t("duplicated"));
          router.push(`/brand/campaigns/${res.id}/edit`);
        })
      }
    >
      <Copy className="size-4" />
    </Button>
  );
}

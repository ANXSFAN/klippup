"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { publishCampaign } from "@/app/admin/campaigns/actions";
import { Button } from "@/components/ui/button";

export default function PublishCampaignButton({
  id,
  name
}: {
  id: string;
  name: string;
}) {
  const t = useTranslations("admin.campaigns");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className="h-7 text-[11px]"
      title={t("publishHint", { name })}
      onClick={() =>
        startTransition(async () => {
          const res = await publishCampaign(id);
          if (!res.ok) {
            toast.error(t("publishError"));
            return;
          }
          toast.success(t("published"));
          router.refresh();
        })
      }
    >
      <Rocket className="size-3 mr-1" />
      {t("publish")}
    </Button>
  );
}

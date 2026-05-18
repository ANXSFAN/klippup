"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCampaign } from "@/app/admin/campaigns/actions";

export default function DeleteCampaignButton({ id, name }: { id: string; name: string }) {
  const t = useTranslations("admin.campaigns");
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function onClick() {
    if (typeof window !== "undefined" && !window.confirm(t("form.deleteConfirm", { name }))) {
      return;
    }
    startTransition(async () => {
      const res = await deleteCampaign(id);
      if (!res.ok) {
        toast.error(res.error || t("form.saveError"));
        return;
      }
      toast.success(t("form.deleted"));
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={onClick}
      aria-label={t("delete")}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

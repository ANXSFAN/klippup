"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createSubmission } from "@/app/creator/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScreenshotUploader from "@/components/creator/ScreenshotUploader";
import { parseVideoUrl } from "@/lib/platforms/parse";
import type { CampaignPlatformOption } from "@/lib/types";
import { submissionFormSchema, type SubmissionFormValues } from "@/lib/validators";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  platforms: CampaignPlatformOption[];
}

export default function SubmissionForm({
  open,
  onOpenChange,
  campaignId,
  platforms
}: Props) {
  const router = useRouter();
  const t = useTranslations("creator.submissionForm");
  const [pending, startTransition] = useTransition();
  const [autoDetected, setAutoDetected] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      campaignId,
      platformId: platforms[0]?.id ?? "",
      videoUrl: "",
      viewsClaimed: "",
      screenshotUrl: ""
    }
  });
  const screenshotUrl = watch("screenshotUrl");

  const videoUrl = watch("videoUrl");

  useEffect(() => {
    if (!videoUrl) {
      setAutoDetected(null);
      return;
    }
    const { platformSlug } = parseVideoUrl(videoUrl);
    if (!platformSlug) {
      setAutoDetected(null);
      return;
    }
    const match = platforms.find((p) => p.slug === platformSlug);
    if (match) {
      setValue("platformId", match.id, { shouldValidate: true });
      setAutoDetected(match.label);
    } else {
      setAutoDetected(null);
    }
  }, [videoUrl, platforms, setValue]);

  useEffect(() => {
    if (!open) {
      reset({
        campaignId,
        platformId: platforms[0]?.id ?? "",
        videoUrl: "",
        viewsClaimed: "",
        screenshotUrl: ""
      });
      setAutoDetected(null);
    }
  }, [open, campaignId, platforms, reset]);

  const KNOWN_ERRORS = new Set([
    "INVALID",
    "CAMPAIGN_NOT_FOUND",
    "CAMPAIGN_NOT_OPEN",
    "PLATFORM_NOT_ALLOWED",
    "UNAUTHENTICATED",
    "NOT_A_CREATOR"
  ]);

  const onSubmit = (values: SubmissionFormValues) =>
    startTransition(async () => {
      const res = await createSubmission(values);
      if (!res.ok) {
        const key = KNOWN_ERRORS.has(res.error) ? res.error : "GENERIC";
        toast.error(t(`errors.${key}` as `errors.${string}`));
        return;
      }
      toast.success(t("created"));
      onOpenChange(false);
      router.refresh();
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("campaignId")} />
          <div className="space-y-1.5">
            <Label htmlFor="videoUrl">{t("fields.videoUrl")}</Label>
            <Input
              id="videoUrl"
              placeholder="https://www.tiktok.com/@user/video/..."
              autoFocus
              {...register("videoUrl")}
            />
            {autoDetected && (
              <p className="text-xs text-emerald-700">
                {t("autoDetected", { platform: autoDetected })}
              </p>
            )}
            {errors.videoUrl && (
              <p className="text-xs text-destructive">{errors.videoUrl.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="platformId">{t("fields.platform")}</Label>
            <select
              id="platformId"
              {...register("platformId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="" disabled>
                {t("platformPlaceholder")}
              </option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {errors.platformId && (
              <p className="text-xs text-destructive">{errors.platformId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="viewsClaimed">{t("fields.viewsClaimed")}</Label>
            <Input
              id="viewsClaimed"
              inputMode="numeric"
              placeholder="0"
              {...register("viewsClaimed")}
            />
            <p className="text-[11px] text-muted-foreground">{t("viewsClaimedHint")}</p>
            {errors.viewsClaimed && (
              <p className="text-xs text-destructive">{errors.viewsClaimed.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{t("fields.screenshot")}</Label>
            <ScreenshotUploader
              value={screenshotUrl ?? ""}
              onChange={(url) =>
                setValue("screenshotUrl", url, { shouldValidate: false })
              }
              onError={(msg) => toast.error(msg)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("submitting") : t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

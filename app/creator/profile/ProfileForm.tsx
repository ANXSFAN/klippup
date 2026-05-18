"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { updateCreatorProfile } from "@/app/creator/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validators";
import type { CreatorProfileData } from "@/lib/types";

const SOCIAL_KEYS = ["tiktok", "youtube", "instagram", "x", "twitch"] as const;
const PAYOUT_METHODS = ["paypal", "bank", "other"] as const;

export default function ProfileForm({ initial }: { initial: CreatorProfileData }) {
  const t = useTranslations("creator.profilePage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: initial.displayName,
      socials: initial.socials,
      payout: { method: initial.payout.method, details: initial.payout.details }
    }
  });
  const method = watch("payout.method");

  const onSubmit = (values: ProfileFormValues) =>
    startTransition(async () => {
      const res = await updateCreatorProfile(values);
      if (!res.ok) {
        toast.error(t("saveError"));
        return;
      }
      toast.success(t("saved"));
      router.refresh();
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sections.basics")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">{t("fields.displayName")}</Label>
            <Input id="displayName" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-xs text-destructive">{errors.displayName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{t("fields.email")}</Label>
            <Input value={initial.email} readOnly disabled className="bg-secondary/50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sections.socials")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("sections.socialsHint")}</p>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {SOCIAL_KEYS.map((k) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={`s-${k}`}>{t(`socials.${k}`)}</Label>
              <Input
                id={`s-${k}`}
                placeholder={t("socials.placeholder")}
                {...register(`socials.${k}` as const)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sections.payout")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("sections.payoutHint")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("payout.method")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYOUT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setValue("payout.method", m, { shouldValidate: true })}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    method === m
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {t(`payout.methods.${m}`)}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("payout.method")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payoutDetails">{t("payout.details")}</Label>
            <Textarea
              id="payoutDetails"
              rows={4}
              placeholder={t("payout.detailsPlaceholder")}
              {...register("payout.details")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}

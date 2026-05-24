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
import {
  creatorTaxIdTypes,
  profileFormSchema,
  type ProfileFormValues
} from "@/lib/validators";
import type { CreatorProfileData } from "@/lib/types";

const SOCIAL_KEYS = ["tiktok", "youtube", "instagram", "x", "twitch"] as const;
const SELECT_CLS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function ProfileForm({ initial }: { initial: CreatorProfileData }) {
  const t = useTranslations("creator.profilePage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: initial.displayName,
      socials: initial.socials,
      fiscal: initial.fiscal
    }
  });
  const isAutonomo = watch("fiscal.isAutonomo");

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
          <CardTitle className="text-base">{t("sections.fiscal")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("sections.fiscalHint")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="legalName">{t("fiscal.legalName")}</Label>
              <Input id="legalName" {...register("fiscal.legalName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">{t("fiscal.birthDate")}</Label>
              <Input id="birthDate" type="date" {...register("fiscal.birthDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxIdType">{t("fiscal.taxIdType")}</Label>
              <select id="taxIdType" className={SELECT_CLS} {...register("fiscal.taxIdType")}>
                <option value="">{t("fiscal.selectType")}</option>
                {creatorTaxIdTypes.map((tt) => (
                  <option key={tt} value={tt}>
                    {t(`fiscal.types.${tt}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxId">{t("fiscal.taxId")}</Label>
              <Input id="taxId" placeholder="12345678X" {...register("fiscal.taxId")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("fiscal.address")}</Label>
            <Input
              placeholder={t("fiscal.streetPlaceholder")}
              {...register("fiscal.address.street")}
            />
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Input
                placeholder={t("fiscal.postalCode")}
                {...register("fiscal.address.postalCode")}
              />
              <Input
                placeholder={t("fiscal.city")}
                {...register("fiscal.address.city")}
              />
              <Input
                placeholder={t("fiscal.region")}
                {...register("fiscal.address.region")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="iban">{t("fiscal.iban")}</Label>
            <Input
              id="iban"
              placeholder="ES00 0000 0000 0000 00000000"
              {...register("fiscal.iban")}
            />
            {errors.fiscal?.iban && (
              <p className="text-xs text-destructive">{errors.fiscal.iban.message}</p>
            )}
          </div>

          <div className="rounded-lg border bg-secondary/30 p-3 space-y-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("fiscal.isAutonomo")}
                className="mt-1"
              />
              <span className="text-sm">
                <span className="font-medium">{t("fiscal.isAutonomo")}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  {t("fiscal.isAutonomoHint")}
                </span>
              </span>
            </label>
            {isAutonomo && (
              <div className="space-y-1.5 pl-6">
                <Label htmlFor="autoSince">{t("fiscal.autonomoSince")}</Label>
                <Input
                  id="autoSince"
                  type="date"
                  {...register("fiscal.autonomoSince")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("fiscal.autonomoSinceHint")}
                </p>
              </div>
            )}
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

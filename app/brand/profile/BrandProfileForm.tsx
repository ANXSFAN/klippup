"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { updateBrandProfile } from "@/app/brand/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  brandProfileFormSchema,
  type BrandProfileFormValues
} from "@/lib/validators";
import type { BrandProfileData } from "@/lib/types";

export default function BrandProfileForm({ initial }: { initial: BrandProfileData }) {
  const t = useTranslations("brand.profilePage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(brandProfileFormSchema),
    defaultValues: {
      brandName: initial.brandName,
      website: initial.website,
      description: initial.description
    }
  });

  const onSubmit = (values: BrandProfileFormValues) =>
    startTransition(async () => {
      const res = await updateBrandProfile(values);
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
            <Label htmlFor="brandName">{t("fields.brandName")}</Label>
            <div className="flex items-center gap-2">
              <Input id="brandName" {...register("brandName")} />
              {initial.verified && (
                <span
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded"
                  title={t("verifiedHint")}
                >
                  <BadgeCheck className="size-3.5" />
                  {t("verified")}
                </span>
              )}
            </div>
            {errors.brandName && (
              <p className="text-xs text-destructive">{errors.brandName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{t("fields.email")}</Label>
            <Input value={initial.email} readOnly disabled className="bg-secondary/50" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">{t("fields.website")}</Label>
            <Input id="website" placeholder="https://" {...register("website")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">{t("fields.description")}</Label>
            <Textarea id="description" rows={4} {...register("description")} />
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

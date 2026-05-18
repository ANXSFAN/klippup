"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { createBrandCampaign, updateBrandCampaign } from "@/app/brand/actions";
import CoverUploader from "@/components/admin/CoverUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BrandCampaignEditData, CategoryOption, PlatformOption } from "@/lib/types";
import {
  brandCampaignFormSchema,
  emptyBrandCampaignForm,
  type BrandCampaignFormValues
} from "@/lib/validators";

const SELECT_CLS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
const KNOWN_ERRORS = new Set([
  "INVALID",
  "MISSING_BRAND_PROFILE",
  "NOT_FOUND",
  "ARCHIVED",
  "UNAUTHENTICATED",
  "NOT_A_BRAND"
]);

interface Props {
  initial?: BrandCampaignEditData;
  categories: CategoryOption[];
  platforms: PlatformOption[];
}

export default function BrandCampaignForm({ initial, categories, platforms }: Props) {
  const t = useTranslations("brand.campaignForm");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!initial;

  const defaults: BrandCampaignFormValues = initial
    ? {
        title: initial.title,
        artTitle: initial.artTitle,
        description: initial.description,
        coverUrl: initial.coverUrl,
        categoryId: initial.categoryId,
        categoryLabel: initial.categoryLabel,
        platformIds: initial.platformIds,
        budget: initial.budget,
        participants: initial.participants,
        rate: initial.rate,
        launchedAt: initial.launchedAt,
        poweredBy: initial.poweredBy,
        requirements: initial.requirements,
        earnings: initial.earnings
      }
    : emptyBrandCampaignForm();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({ resolver: zodResolver(brandCampaignFormSchema), defaultValues: defaults });

  const reqs = useFieldArray({ control, name: "requirements" });
  const platformIds = watch("platformIds");
  const coverUrl = watch("coverUrl");

  const onSubmit = (values: BrandCampaignFormValues) =>
    startTransition(async () => {
      const res = isEdit
        ? await updateBrandCampaign(initial!.id, values)
        : await createBrandCampaign(values);
      if (!res.ok) {
        const key = KNOWN_ERRORS.has(res.error) ? res.error : "GENERIC";
        toast.error(t(`errors.${key}` as `errors.${string}`));
        return;
      }
      toast.success(isEdit ? t("updated") : t("created"));
      router.push("/brand/campaigns");
      router.refresh();
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {!isEdit && (
        <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3">
          {t("draftNotice")}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sections.basics")}</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">{t("fields.title")}</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="artTitle">{t("fields.artTitle")}</Label>
            <Input id="artTitle" placeholder="BIG TYPE" {...register("artTitle")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">{t("fields.description")}</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{t("fields.cover")}</Label>
            <CoverUploader
              value={coverUrl}
              onChange={(url) => setValue("coverUrl", url, { shouldValidate: true })}
              onError={(msg) => toast.error(msg)}
            />
            {errors.coverUrl && (
              <p className="text-xs text-destructive">{errors.coverUrl.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="poweredBy">{t("fields.poweredBy")}</Label>
            <Input id="poweredBy" {...register("poweredBy")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sections.classification")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">{t("fields.category")}</Label>
              <select id="categoryId" {...register("categoryId")} className={SELECT_CLS}>
                <option value="" disabled>
                  —
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categoryLabel">{t("fields.categoryLabel")}</Label>
              <Input id="categoryLabel" {...register("categoryLabel")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("fields.platforms")}</Label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => {
                const checked = platformIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer text-sm transition ${
                      checked
                        ? "bg-primary/5 border-primary ring-2 ring-primary/20"
                        : "bg-secondary/40 border-border hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      value={p.id}
                      checked={checked}
                      onChange={(e) => {
                        const set = new Set(platformIds);
                        if (e.target.checked) set.add(p.id);
                        else set.delete(p.id);
                        setValue("platformIds", [...set], { shouldValidate: true });
                      }}
                    />
                    <span className="size-5 inline-flex items-center justify-center rounded bg-foreground/5 text-[10px] font-semibold">
                      {p.glyph}
                    </span>
                    {p.label}
                  </label>
                );
              })}
            </div>
            {errors.platformIds && (
              <p className="text-xs text-destructive">{errors.platformIds.message as string}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sections.numbers")}</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="budget">{t("fields.budget")}</Label>
            <Input id="budget" inputMode="numeric" {...register("budget")} />
            {errors.budget && <p className="text-xs text-destructive">{errors.budget.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="participants">{t("fields.participants")}</Label>
            <Input id="participants" inputMode="numeric" {...register("participants")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rate">{t("fields.rate")}</Label>
            <Input id="rate" placeholder="$1/1K" {...register("rate")} />
            {errors.rate && <p className="text-xs text-destructive">{errors.rate.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="launchedAt">{t("fields.launchedAt")}</Label>
            <Input id="launchedAt" type="date" {...register("launchedAt")} />
            {errors.launchedAt && (
              <p className="text-xs text-destructive">{errors.launchedAt.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sections.requirements")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reqs.fields.length === 0 && (
            <p className="text-xs text-muted-foreground">{t("requirementsEmpty")}</p>
          )}
          {reqs.fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input {...register(`requirements.${i}.value` as const)} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => reqs.remove(i)}
                aria-label={t("remove")}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => reqs.append({ value: "" })}
          >
            <Plus className="size-4 mr-1" />
            {t("addRequirement")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sections.earnings")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("earningsHint")}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_1fr] gap-2 text-xs text-muted-foreground">
            <div></div>
            <div>{t("earningsCols.rate")}</div>
            <div>{t("earningsCols.min")}</div>
            <div>{t("earningsCols.max")}</div>
          </div>
          {(["tiktok", "youtube", "instagram"] as const).map((k) => (
            <div key={k} className="grid sm:grid-cols-[80px_1fr_1fr_1fr] gap-2 items-center">
              <div className="text-sm font-medium capitalize">{k}</div>
              <Input
                placeholder={t("earningsCols.rate")}
                {...register(`earnings.${k}.rate` as const)}
              />
              <Input
                placeholder={t("earningsCols.min")}
                {...register(`earnings.${k}.min` as const)}
              />
              <Input
                placeholder={t("earningsCols.max")}
                {...register(`earnings.${k}.max` as const)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/brand/campaigns")}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : isEdit ? t("save") : t("submit")}
        </Button>
      </div>
    </form>
  );
}

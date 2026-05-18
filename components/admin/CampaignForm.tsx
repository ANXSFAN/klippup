"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  campaignFormSchema,
  campaignStatuses,
  emptyCampaignForm,
  placementSlots,
  resourceKinds,
  type CampaignFormValues
} from "@/lib/validators";
import type { FormOptions } from "@/lib/types";
import { createCampaign, updateCampaign } from "@/app/admin/campaigns/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import CoverUploader from "./CoverUploader";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const EARNINGS_PLATFORMS = ["tiktok", "youtube", "instagram"] as const;
const EARNINGS_LABELS: Record<(typeof EARNINGS_PLATFORMS)[number], string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram"
};

export default function CampaignForm({
  options,
  initial,
  campaignId
}: {
  options: FormOptions;
  initial?: CampaignFormValues;
  campaignId?: string;
}) {
  const t = useTranslations("admin.campaigns.form");
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: initial ?? emptyCampaignForm()
  });

  const requirements = useFieldArray({ control, name: "requirements" });
  const topEarners = useFieldArray({ control, name: "topEarners" });
  const resources = useFieldArray({ control, name: "resources" });
  const coverUrl = watch("coverUrl");

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const res = campaignId
        ? await updateCampaign(campaignId, values as CampaignFormValues)
        : await createCampaign(values as CampaignFormValues);
      if (!res.ok) {
        toast.error(res.error || t("saveError"));
        return;
      }
      toast.success(campaignId ? t("updated") : t("created"));
      router.push("/admin/campaigns");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      {/* Basics */}
      <Section title={t("basics")}>
        <Field label={t("brand")} error={errors.brand?.message}>
          <Input {...register("brand")} />
        </Field>
        <CheckboxRow {...register("brandVerified")} label={t("brandVerified")} />
        <Field label={t("title")} error={errors.title?.message}>
          <Input {...register("title")} />
        </Field>
        <Field label={t("artTitle")}>
          <Textarea rows={2} {...register("artTitle")} />
        </Field>
        <Field label={t("description")} error={errors.description?.message}>
          <Textarea rows={3} {...register("description")} />
        </Field>
        <Field label={t("poweredBy")}>
          <Input {...register("poweredBy")} />
        </Field>
      </Section>

      {/* Cover */}
      <Section title={t("cover")}>
        <CoverUploader
          value={coverUrl}
          onChange={(url) => setValue("coverUrl", url, { shouldValidate: true, shouldDirty: true })}
          onError={(m) => toast.error(m)}
        />
        {errors.coverUrl?.message && (
          <p className="text-xs text-destructive">{errors.coverUrl.message}</p>
        )}
      </Section>

      {/* Classification & placement */}
      <Section title={t("classification")}>
        <Field label={t("category")} error={errors.categoryId?.message}>
          <select className={SELECT_CLASS} {...register("categoryId")}>
            <option value="">—</option>
            {options.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("categoryLabel")}>
          <Input {...register("categoryLabel")} />
        </Field>
        <Field label={t("platforms")}>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {options.platforms.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" value={p.id} {...register("platformIds")} />
                <span>
                  {p.label}{" "}
                  <span className="text-muted-foreground">({p.glyph})</span>
                </span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={t("placements")}>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {placementSlots.map((slot) => (
              <label key={slot} className="flex items-center gap-2 text-sm">
                <input type="checkbox" value={slot} {...register("placements")} />
                <span>{t(`placementSlots.${slot}`)}</span>
              </label>
            ))}
          </div>
        </Field>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <CheckboxRow {...register("hot")} label={t("hot")} inline />
          <div className="flex items-center gap-2">
            <Label className="text-sm">{t("status")}</Label>
            <select className={cn(SELECT_CLASS, "w-auto")} {...register("status")}>
              {campaignStatuses.map((s) => (
                <option key={s} value={s}>
                  {t(`statuses.${s}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Numbers */}
      <Section title={t("numbers")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("raised")} error={errors.raised?.message}>
            <Input inputMode="numeric" {...register("raised")} />
          </Field>
          <Field label={t("budget")} error={errors.budget?.message}>
            <Input inputMode="numeric" {...register("budget")} />
          </Field>
          <Field label={t("participants")} error={errors.participants?.message}>
            <Input inputMode="numeric" {...register("participants")} />
          </Field>
          <Field label={t("rate")}>
            <Input placeholder="$1/1K" {...register("rate")} />
          </Field>
          <Field label={t("launchedAt")}>
            <Input type="date" {...register("launchedAt")} />
          </Field>
        </div>
      </Section>

      {/* Modal content */}
      <Section title={t("modalContent")}>
        {/* requirements */}
        <div className="space-y-2">
          <Label className="text-sm">{t("requirements")}</Label>
          {requirements.fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input {...register(`requirements.${i}.value` as const)} />
              <RemoveButton onClick={() => requirements.remove(i)} label={t("remove")} />
            </div>
          ))}
          <AddButton onClick={() => requirements.append({ value: "" })} label={t("addRequirement")} />
        </div>

        {/* earnings */}
        <div className="space-y-2 pt-2">
          <Label className="text-sm">{t("earnings")}</Label>
          <p className="text-xs text-muted-foreground">{t("earningsHint")}</p>
          <div className="space-y-2">
            {EARNINGS_PLATFORMS.map((p) => (
              <div key={p} className="grid grid-cols-[80px_1fr_1fr_1fr] items-center gap-2">
                <span className="text-sm font-medium">{EARNINGS_LABELS[p]}</span>
                <Input placeholder={t("rateLabel")} {...register(`earnings.${p}.rate` as const)} />
                <Input placeholder={t("min")} {...register(`earnings.${p}.min` as const)} />
                <Input placeholder={t("max")} {...register(`earnings.${p}.max` as const)} />
              </div>
            ))}
          </div>
        </div>

        {/* top earners */}
        <div className="space-y-2 pt-2">
          <Label className="text-sm">{t("topEarners")}</Label>
          {topEarners.fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <Input
                inputMode="numeric"
                placeholder={t("views")}
                {...register(`topEarners.${i}.views` as const)}
              />
              <Input placeholder={t("name")} {...register(`topEarners.${i}.name` as const)} />
              <RemoveButton onClick={() => topEarners.remove(i)} label={t("remove")} />
            </div>
          ))}
          <AddButton
            onClick={() => topEarners.append({ views: "", name: "" })}
            label={t("addEarner")}
          />
        </div>

        {/* resources */}
        <div className="space-y-2 pt-2">
          <Label className="text-sm">{t("resources")}</Label>
          {resources.fields.map((f, i) => (
            <div
              key={f.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_1fr_auto] items-center gap-2"
            >
              <Input placeholder={t("resourceName")} {...register(`resources.${i}.name` as const)} />
              <Input
                placeholder={t("resourceSubtitle")}
                {...register(`resources.${i}.subtitle` as const)}
              />
              <select className={SELECT_CLASS} {...register(`resources.${i}.kind` as const)}>
                {resourceKinds.map((k) => (
                  <option key={k} value={k}>
                    {t(`resourceKinds.${k}`)}
                  </option>
                ))}
              </select>
              <Input placeholder={t("resourceUrl")} {...register(`resources.${i}.url` as const)} />
              <RemoveButton onClick={() => resources.remove(i)} label={t("remove")} />
            </div>
          ))}
          <AddButton
            onClick={() => resources.append({ name: "", subtitle: "", kind: "link", url: "" })}
            label={t("addResource")}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <Field label={t("totalViews")}>
            <Input placeholder="3.8M" {...register("totalViews")} />
          </Field>
          <Field label={t("viewsSeries")}>
            <Input placeholder="10, 14, 22, 30, 52, 80" {...register("viewsSeries")} />
          </Field>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/admin/campaigns">{t("cancel")}</Link>
        </Button>
      </div>
    </form>
  );
}

/* — small layout helpers — */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const CheckboxRow = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; inline?: boolean }
>(function CheckboxRow({ label, inline, ...props }, ref) {
  return (
    <label className={cn("flex items-center gap-2 text-sm", inline ? "" : "py-0.5")}>
      <input type="checkbox" ref={ref} {...props} />
      <span>{label}</span>
    </label>
  );
});

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Plus className="size-3.5" />
      {label}
    </Button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className="text-muted-foreground hover:text-destructive shrink-0"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

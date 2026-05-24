"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Wallet
} from "lucide-react";
import { useTranslations } from "next-intl";
import { createPayout } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculateIrpf } from "@/lib/tax";
import { cn } from "@/lib/utils";
import {
  createPayoutSchema,
  type CreatePayoutValues
} from "@/lib/validators";
import type { PendingPayoutCreator } from "@/lib/types";

const formatEUR = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// Bank-first because every Spanish-resident creator gets paid via SEPA in the
// manual-transfer phase. PayPal / "other" stay as escape hatches.
const METHODS = ["bank", "paypal", "other"] as const;

function formatIban(raw: string): string {
  return raw.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("admin.payouts");
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success(t("copied"));
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      aria-label={label}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {t("copy")}
    </button>
  );
}

export default function PayoutsClient({
  creators
}: {
  creators: PendingPayoutCreator[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paying, setPaying] = useState<PendingPayoutCreator | null>(null);

  return (
    <div className="space-y-2">
      {creators.map((c) => (
        <CreatorCard
          key={c.creatorId}
          creator={c}
          isExpanded={expanded === c.creatorId}
          onToggle={() => setExpanded(expanded === c.creatorId ? null : c.creatorId)}
          onPay={() => setPaying(c)}
        />
      ))}

      <Dialog open={!!paying} onOpenChange={(o) => !o && setPaying(null)}>
        <DialogContent className="sm:max-w-lg">
          {paying && (
            <PayoutForm
              key={paying.creatorId}
              creator={paying}
              onClose={() => setPaying(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreatorCard({
  creator,
  isExpanded,
  onToggle,
  onPay
}: {
  creator: PendingPayoutCreator;
  isExpanded: boolean;
  onToggle: () => void;
  onPay: () => void;
}) {
  const t = useTranslations("admin.payouts");
  const irpf = calculateIrpf({
    country: creator.country,
    isAutonomo: creator.isAutonomo,
    autonomoSince: creator.autonomoSince
  });
  const irpfCents = Math.round(creator.totalCents * irpf.rate);
  const netCents = creator.totalCents - irpfCents;
  const missingIban = !creator.iban;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {creator.legalName || creator.creatorName}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {creator.creatorEmail}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {missingIban ? (
              <Badge className="border-transparent bg-rose-100 text-rose-900 text-[10px]">
                {t("noIban")}
              </Badge>
            ) : creator.isAutonomo ? (
              <Badge className="border-transparent bg-emerald-100 text-emerald-900 text-[10px]">
                {t("autonomo")}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                {t("notAutonomo")}
              </Badge>
            )}
            <Badge className="border-transparent bg-amber-100 text-amber-900">
              {creator.submissions.length} {t("subsLabel")}
            </Badge>
          </div>
          <div className="text-base font-semibold tabular-nums ml-2 shrink-0">
            {formatEUR(creator.totalCents)}
          </div>
        </button>
        <Button size="sm" onClick={onPay} disabled={missingIban}>
          <Wallet className="size-4 mr-1" />
          {t("recordPayment")}
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t bg-secondary/30 divide-y">
          {creator.iban ? (
            <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-medium text-foreground">IBAN:</span>
              <span className="font-mono select-all">{formatIban(creator.iban)}</span>
              <CopyButton value={creator.iban} label={t("copyIban")} />
              {creator.legalName && (
                <span className="text-muted-foreground">
                  {t("holder")}: <span className="text-foreground">{creator.legalName}</span>
                </span>
              )}
              {irpf.rate > 0 && (
                <span className="ml-auto text-muted-foreground tabular-nums">
                  {t("irpfPreview", {
                    rate: Math.round(irpf.rate * 100),
                    irpf: formatEUR(irpfCents),
                    net: formatEUR(netCents)
                  })}
                </span>
              )}
            </div>
          ) : (
            <div className="px-4 py-2 text-xs text-rose-700">{t("noIbanHint")}</div>
          )}
          {creator.submissions.map((s) => (
            <div key={s.id} className="px-4 py-2 flex items-center gap-3 text-sm">
              <span className="truncate flex-1">{s.campaignTitle}</span>
              <span className="text-xs text-muted-foreground">{s.platformLabel}</span>
              <a
                href={s.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <span className="truncate max-w-[160px]">{s.videoUrl}</span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
              <span className="text-xs text-muted-foreground tabular-nums">
                {s.viewsVerified != null ? s.viewsVerified.toLocaleString() : "—"}
              </span>
              <span className="font-medium tabular-nums">{formatEUR(s.earningsCents)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PayoutForm({
  creator,
  onClose
}: {
  creator: PendingPayoutCreator;
  onClose: () => void;
}) {
  const t = useTranslations("admin.payouts");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(creator.submissions.map((s) => s.id))
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createPayoutSchema),
    defaultValues: {
      creatorId: creator.creatorId,
      method: "bank" as "paypal" | "bank" | "other",
      // Pre-fill details with the IBAN + holder so admin only has to add
      // the transaction reference after the transfer goes through.
      details: [
        creator.iban ? `IBAN: ${formatIban(creator.iban)}` : "",
        creator.legalName ? `${t("holder")}: ${creator.legalName}` : ""
      ]
        .filter(Boolean)
        .join("\n"),
      txnRef: "",
      notes: "",
      submissionIds: creator.submissions.map((s) => s.id)
    }
  });
  const method = watch("method");

  const totalCents = creator.submissions
    .filter((s) => selectedIds.has(s.id))
    .reduce((sum, s) => sum + s.earningsCents, 0);

  const irpf = calculateIrpf({
    country: creator.country,
    isAutonomo: creator.isAutonomo,
    autonomoSince: creator.autonomoSince
  });
  const irpfCents = Math.round(totalCents * irpf.rate);
  const netCents = totalCents - irpfCents;

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    setValue("submissionIds", [...next], { shouldValidate: true });
  };

  const onSubmit = (values: CreatePayoutValues) =>
    startTransition(async () => {
      const res = await createPayout(values);
      if (!res.ok) {
        toast.error(t(`errors.${res.error}` as `errors.${string}`));
        return;
      }
      toast.success(t("paid"));
      onClose();
      router.refresh();
    });

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {t("formTitle", { name: creator.legalName || creator.creatorName })}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("creatorId")} />

        <div className="border rounded-md divide-y max-h-48 overflow-auto">
          {creator.submissions.map((s) => (
            <label
              key={s.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm",
                selectedIds.has(s.id) ? "bg-primary/5" : "hover:bg-secondary/50"
              )}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(s.id)}
                onChange={() => toggle(s.id)}
              />
              <span className="flex-1 truncate">{s.campaignTitle}</span>
              <span className="text-xs text-muted-foreground">{s.platformLabel}</span>
              <span className="font-medium tabular-nums">
                {formatEUR(s.earningsCents)}
              </span>
            </label>
          ))}
        </div>
        {errors.submissionIds && (
          <p className="text-xs text-destructive">
            {errors.submissionIds.message as string}
          </p>
        )}

        <div className="bg-secondary/40 rounded-md px-3 py-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("totalLabel")}</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatEUR(totalCents)}
            </span>
          </div>
          {irpf.rate > 0 && (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("irpfLabel", { rate: Math.round(irpf.rate * 100) })}</span>
                <span className="tabular-nums">- {formatEUR(irpfCents)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium pt-1 border-t border-border/50">
                <span>{t("netLabel")}</span>
                <span className="tabular-nums">{formatEUR(netCents)}</span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t("method")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setValue("method", m, { shouldValidate: true })}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm transition",
                  method === m
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium"
                    : "border-border hover:bg-secondary"
                )}
              >
                {t(`methods.${m}`)}
              </button>
            ))}
          </div>
          <input type="hidden" {...register("method")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="details">{t("details")}</Label>
          <Textarea
            id="details"
            rows={3}
            placeholder={t("detailsPlaceholder")}
            {...register("details")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="txnRef">{t("txnRef")}</Label>
          <Input id="txnRef" placeholder={t("txnRefPlaceholder")} {...register("txnRef")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Textarea id="notes" rows={2} {...register("notes")} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={pending || selectedIds.size === 0}>
            {pending ? t("saving") : t("confirm")}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  emptyEntityForm,
  entityFormSchema,
  type EntityActionResult,
  type EntityFormValues
} from "@/lib/validators";
import type { EntityRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type Editing = EntityRow | "new" | null;

export default function EntityManager({
  entity,
  hasGlyph,
  rows,
  createAction,
  updateAction,
  deleteAction
}: {
  entity: "categories" | "platforms";
  hasGlyph: boolean;
  rows: EntityRow[];
  createAction: (values: EntityFormValues) => Promise<EntityActionResult>;
  updateAction: (id: string, values: EntityFormValues) => Promise<EntityActionResult>;
  deleteAction: (id: string) => Promise<EntityActionResult>;
}) {
  const t = useTranslations(`admin.${entity}`);
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState<Editing>(null);

  const form = useForm({
    resolver: zodResolver(entityFormSchema),
    defaultValues: emptyEntityForm()
  });
  const { register, handleSubmit, reset, formState } = form;

  function describeError(code: string): string {
    if (code === "DUPLICATE_SLUG") return t("duplicateSlug");
    if (code.startsWith("IN_USE:")) return t("inUse", { count: Number(code.slice(7)) || 0 });
    if (code === "INVALID") return t("form.saveError");
    return code || t("form.saveError");
  }

  function openNew() {
    reset(emptyEntityForm());
    setEditing("new");
  }
  function openEdit(row: EntityRow) {
    reset({
      slug: row.slug,
      label: row.label,
      glyph: row.glyph ?? "",
      sortOrder: String(row.sortOrder)
    });
    setEditing(row);
  }

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const current = editing;
      const res =
        current === "new" || current === null
          ? await createAction(values)
          : await updateAction(current.id, values);
      if (!res.ok) {
        toast.error(describeError(res.error));
        return;
      }
      toast.success(current === "new" || current === null ? t("created") : t("updated"));
      setEditing(null);
      router.refresh();
    });
  });

  function onDelete(row: EntityRow) {
    if (row.campaignCount > 0) {
      toast.error(t("inUse", { count: row.campaignCount }));
      return;
    }
    if (typeof window !== "undefined" && !window.confirm(t("deleteConfirm", { name: row.label }))) {
      return;
    }
    startTransition(async () => {
      const res = await deleteAction(row.id);
      if (!res.ok) {
        toast.error(describeError(res.error));
        return;
      }
      toast.success(t("deleted"));
      router.refresh();
    });
  }

  const colSpan = hasGlyph ? 6 : 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("count", { count: rows.length })}</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="size-4" />
          {t("new")}
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("columns.order")}</TableHead>
              <TableHead>{t("columns.label")}</TableHead>
              <TableHead>{t("columns.slug")}</TableHead>
              {hasGlyph && <TableHead className="w-20">{t("columns.glyph")}</TableHead>}
              <TableHead className="text-right">{t("columns.usage")}</TableHead>
              <TableHead className="text-right">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-10">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="tabular-nums text-muted-foreground">{row.sortOrder}</TableCell>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.slug}</TableCell>
                {hasGlyph && (
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-secondary text-[11px] font-semibold text-secondary-foreground">
                      {row.glyph}
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  {row.campaignCount > 0 ? (
                    <Badge variant="secondary" className="tabular-nums">
                      {row.campaignCount}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm tabular-nums">0</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(row)}
                      aria-label={t("edit")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending || row.campaignCount > 0}
                      onClick={() => onDelete(row)}
                      aria-label={t("delete")}
                      title={row.campaignCount > 0 ? t("inUse", { count: row.campaignCount }) : undefined}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? t("createTitle") : t("editTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label={t("form.label")} error={formState.errors.label?.message}>
              <Input {...register("label")} />
            </Field>
            <Field label={t("form.slug")} error={formState.errors.slug?.message}>
              <Input className="font-mono" {...register("slug")} />
              <p className="text-xs text-muted-foreground">{t("form.slugHint")}</p>
            </Field>
            {hasGlyph && (
              <Field label={t("form.glyph")} error={formState.errors.glyph?.message}>
                <Input maxLength={4} className="font-mono w-24" {...register("glyph")} />
              </Field>
            )}
            <Field label={t("form.order")} error={formState.errors.sortOrder?.message}>
              <Input inputMode="numeric" className="w-24" {...register("sortOrder")} />
            </Field>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t("form.saving") : t("form.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
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

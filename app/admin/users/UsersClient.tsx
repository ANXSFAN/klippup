"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { changeUserRole, setBrandVerified } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AdminRole, AdminUserRow } from "@/lib/types";

const SELECT_CLS =
  "h-8 rounded-md border border-input bg-background px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring";
const ROLE_TONES: Record<AdminRole, string> = {
  CREATOR: "bg-sky-100 text-sky-900",
  BRAND: "bg-violet-100 text-violet-900",
  ADMIN: "bg-zinc-200 text-zinc-800"
};

const formatCents = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function UsersClient({
  rows,
  currentUserId
}: {
  rows: AdminUserRow[];
  currentUserId: string;
}) {
  const t = useTranslations("admin.users");
  const fmt = useFormatter();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onRoleChange = (userId: string, role: AdminRole) =>
    startTransition(async () => {
      const res = await changeUserRole({ userId, role });
      if (!res.ok) {
        toast.error(t("error"));
        return;
      }
      toast.success(t("roleChanged"));
      router.refresh();
    });

  const onVerifiedToggle = (userId: string, verified: boolean) =>
    startTransition(async () => {
      const res = await setBrandVerified({ userId, verified });
      if (!res.ok) {
        toast.error(t("error"));
        return;
      }
      toast.success(verified ? t("verifiedOn") : t("verifiedOff"));
      router.refresh();
    });

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columns.user")}</TableHead>
            <TableHead>{t("columns.role")}</TableHead>
            <TableHead className="text-right">{t("columns.campaigns")}</TableHead>
            <TableHead className="text-right">{t("columns.submissions")}</TableHead>
            <TableHead className="text-right">{t("columns.earned")}</TableHead>
            <TableHead className="text-right">{t("columns.joined")}</TableHead>
            <TableHead className="text-right">{t("columns.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const isSelf = r.id === currentUserId;
            return (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      {r.brandName ?? r.displayName}
                      {r.brandVerified && (
                        <BadgeCheck className="size-3.5 text-emerald-600" />
                      )}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{r.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("border-transparent", ROLE_TONES[r.role])}>
                    {t(`role.${r.role}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {r.campaignCount ?? 0}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {r.submissionCount ?? 0}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {r.role === "CREATOR" ? formatCents(r.totalEarnedCents ?? 0) : "—"}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                  {fmt.dateTime(r.createdAt, { dateStyle: "medium" })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <select
                      className={SELECT_CLS}
                      defaultValue={r.role}
                      disabled={pending || isSelf}
                      title={isSelf ? t("selfHint") : undefined}
                      onChange={(e) => onRoleChange(r.id, e.target.value as AdminRole)}
                    >
                      <option value="CREATOR">{t("role.CREATOR")}</option>
                      <option value="BRAND">{t("role.BRAND")}</option>
                      <option value="ADMIN">{t("role.ADMIN")}</option>
                    </select>
                    {r.role === "BRAND" && (
                      <label className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          className="size-3.5"
                          defaultChecked={r.brandVerified ?? false}
                          disabled={pending}
                          onChange={(e) => onVerifiedToggle(r.id, e.target.checked)}
                        />
                        {t("verifyLabel")}
                      </label>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

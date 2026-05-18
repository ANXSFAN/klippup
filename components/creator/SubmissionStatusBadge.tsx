import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONES: Record<SubmissionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  APPROVED: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  REJECTED: "bg-rose-100 text-rose-900 hover:bg-rose-100",
  PAID: "bg-sky-100 text-sky-900 hover:bg-sky-100"
};

export default function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const t = useTranslations("creator.submissionStatus");
  return (
    <Badge className={cn("border-transparent", TONES[status])}>{t(status)}</Badge>
  );
}

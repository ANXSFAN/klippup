import { getTranslations } from "next-intl/server";
import { listAdminInvoices } from "@/lib/invoice-queries";
import InvoicesClient from "./InvoicesClient";

export default async function AdminInvoicesPage() {
  const t = await getTranslations("admin.invoices");
  const rows = await listAdminInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("count", { count: rows.length })}
        </p>
      </div>
      <InvoicesClient rows={rows} />
    </div>
  );
}

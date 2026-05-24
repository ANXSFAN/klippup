import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderInvoicePDF } from "@/lib/invoice-pdf";
import type { BrandInvoiceSnapshot, PlatformEntity } from "@/lib/invoice";

export const runtime = "nodejs";

/**
 * Streams a generated PDF of the requested invoice.
 * - ADMIN: any invoice
 * - BRAND: only invoices addressed to them
 * - CREATOR: denied (invoices are platform↔brand artifacts)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return new NextResponse("Unauthorized", { status: 401 });
  if (profile.role === "CREATOR") return new NextResponse("Forbidden", { status: 403 });

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: {
      serialNumber: true,
      issueDate: true,
      description: true,
      baseCents: true,
      ivaRatePercent: true,
      ivaCents: true,
      totalCents: true,
      ivaNote: true,
      snapshotPlatform: true,
      snapshotBrand: true,
      status: true,
      brandUserId: true
    }
  });
  if (!invoice) return new NextResponse("Not found", { status: 404 });

  if (profile.role === "BRAND" && invoice.brandUserId !== profile.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const pdf = await renderInvoicePDF({
    serialNumber: invoice.serialNumber,
    issueDate: invoice.issueDate,
    description: invoice.description,
    baseCents: invoice.baseCents,
    ivaRatePercent: invoice.ivaRatePercent,
    ivaCents: invoice.ivaCents,
    totalCents: invoice.totalCents,
    ivaNote: invoice.ivaNote,
    snapshotPlatform: invoice.snapshotPlatform as unknown as PlatformEntity,
    snapshotBrand: invoice.snapshotBrand as unknown as BrandInvoiceSnapshot,
    status: invoice.status
  });

  // Buffer extends Uint8Array, but Next's BodyInit typing rejects the Buffer
  // brand directly — wrap in a fresh Uint8Array view to satisfy the signature.
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.serialNumber}.pdf"`,
      "Cache-Control": "private, no-store"
    }
  });
}

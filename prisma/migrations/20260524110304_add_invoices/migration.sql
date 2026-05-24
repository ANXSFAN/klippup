-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PROFORMA', 'ISSUED', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "brandUserId" TEXT NOT NULL,
    "campaignId" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "baseCents" INTEGER NOT NULL,
    "ivaRatePercent" INTEGER NOT NULL,
    "ivaCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "ivaNote" TEXT NOT NULL,
    "snapshotPlatform" JSONB NOT NULL,
    "snapshotBrand" JSONB NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PROFORMA',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceCounter" (
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceCounter_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_serialNumber_key" ON "Invoice"("serialNumber");

-- CreateIndex
CREATE INDEX "Invoice_brandUserId_idx" ON "Invoice"("brandUserId");

-- CreateIndex
CREATE INDEX "Invoice_campaignId_idx" ON "Invoice"("campaignId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_year_idx" ON "Invoice"("year");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_brandUserId_fkey" FOREIGN KEY ("brandUserId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

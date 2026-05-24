-- CreateEnum
CREATE TYPE "TaxIdType" AS ENUM ('DNI', 'NIE', 'NIF', 'CIF', 'VAT', 'OTHER');

-- AlterTable
ALTER TABLE "BrandProfile" ADD COLUMN     "address" JSONB,
ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'ES',
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "taxIdType" "TaxIdType";

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "address" JSONB,
ADD COLUMN     "autonomoSince" TIMESTAMP(3),
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "country" TEXT DEFAULT 'ES',
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "idDocumentUrl" TEXT,
ADD COLUMN     "isAutonomo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "taxIdType" "TaxIdType";

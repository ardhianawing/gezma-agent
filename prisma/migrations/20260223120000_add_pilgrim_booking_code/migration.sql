-- AlterTable
ALTER TABLE "pilgrims" ADD COLUMN     "bookingCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "pilgrims_agencyId_bookingCode_key" ON "pilgrims"("agencyId", "bookingCode");

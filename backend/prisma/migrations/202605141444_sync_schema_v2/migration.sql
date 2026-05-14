-- AlterTable
ALTER TABLE "insurances" ADD COLUMN "cnpj" TEXT;

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "month" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "insurances_cnpj_key" ON "insurances"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "goals_type_month_key" ON "goals"("type", "month");

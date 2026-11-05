-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('CATALOG', 'CUSTOM');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adjustedPrice" DECIMAL(10,2),
ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "customPayload" JSONB,
ADD COLUMN     "type" "OrderType" NOT NULL DEFAULT 'CATALOG';

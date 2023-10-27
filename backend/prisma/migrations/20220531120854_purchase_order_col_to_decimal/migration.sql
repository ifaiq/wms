/*
  Warnings:

  - You are about to alter the column `subTotalWithoutTax` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `totalTaxAmount` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `totalWithTax` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `price` on the `PurchaseOrderProduct` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `subTotalWithoutTax` on the `PurchaseOrderProduct` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `subTotalWithTax` on the `PurchaseOrderProduct` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - Made the column `taxAmount` on table `PurchaseOrderProduct` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `subTotalWithoutTax` DECIMAL(15, 2) NOT NULL,
    MODIFY `totalTaxAmount` DECIMAL(15, 2) NOT NULL,
    MODIFY `totalWithTax` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `PurchaseOrderProduct` MODIFY `price` DECIMAL(15, 2) NOT NULL,
    MODIFY `taxAmount` DECIMAL(15, 2) NOT NULL,
    MODIFY `subTotalWithoutTax` DECIMAL(15, 2) NOT NULL,
    MODIFY `subTotalWithTax` DECIMAL(15, 2) NOT NULL;

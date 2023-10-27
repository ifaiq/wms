/*
  Warnings:

  - The values [PK,SA,UAE] on the enum `Adjustment_country` will be removed. If these variants are still used in the database, this will fail.
  - The values [PK,SA,UAE] on the enum `PurchaseOrder_country` will be removed. If these variants are still used in the database, this will fail.
  - The values [PK,SA,UAE] on the enum `Vendor_country` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Adjustment` MODIFY `country` ENUM('PAK', 'SAUDI', 'ARE') NOT NULL;

-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `country` ENUM('PAK', 'SAUDI', 'ARE') NOT NULL;

-- AlterTable
ALTER TABLE `Vendor` MODIFY `country` ENUM('PAK', 'SAUDI', 'ARE') NOT NULL;

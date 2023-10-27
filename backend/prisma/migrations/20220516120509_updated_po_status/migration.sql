/*
  Warnings:

  - The values [DRAFT] on the enum `PurchaseOrder_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `status` ENUM('IN_REVIEW', 'PO', 'LOCKED') NOT NULL;

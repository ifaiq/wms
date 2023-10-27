-- AlterTable
ALTER TABLE `AdjustmentProduct` ADD COLUMN `differenceQuantity` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `physicalQuantity` INTEGER NOT NULL DEFAULT 0;

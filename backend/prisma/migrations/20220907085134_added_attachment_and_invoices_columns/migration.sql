-- AlterTable
ALTER TABLE `Receipt` ADD COLUMN `attachment` JSON NULL,
    ADD COLUMN `invoices` JSON NULL;

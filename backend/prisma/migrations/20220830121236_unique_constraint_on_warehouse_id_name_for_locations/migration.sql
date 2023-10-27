/*
  Warnings:

  - A unique constraint covering the columns `[warehouseId,name]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Location_name_key` ON `Location`;

-- CreateIndex
CREATE UNIQUE INDEX `Location_warehouseId_name_key` ON `Location`(`warehouseId`, `name`);

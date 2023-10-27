/*
  Warnings:

  - The values [SERVICE_INVOICE,REBATE,RETURN] on the enum `DraftInvoice_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `DraftInvoice` MODIFY `type` ENUM('SERVICE', 'DEBIT_NOTE_REBATE', 'DEBIT_NOTE_RETURN') NOT NULL;

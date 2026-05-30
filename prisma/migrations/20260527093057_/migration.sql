/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `paymentMethod`,
    DROP COLUMN `paymentStatus`;

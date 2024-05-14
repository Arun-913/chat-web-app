/*
  Warnings:

  - You are about to drop the column `password` on the `ChatRoom` table. All the data in the column will be lost.
  - Added the required column `roomPassword` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "password",
ADD COLUMN     "roomPassword" TEXT NOT NULL;

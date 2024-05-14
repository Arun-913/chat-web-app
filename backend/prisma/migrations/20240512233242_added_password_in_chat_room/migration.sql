/*
  Warnings:

  - Added the required column `password` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "password" TEXT NOT NULL;
